
import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureViewProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraCaptureView: React.FC<CameraCaptureViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;
    let initTimeout: any;

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Constraints: prefer back camera
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode: 'environment'
          }
        };

        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
          } else {
            throw new Error("Camera API not available");
          }
        } catch (err) {
          console.warn("Environment camera failed, trying fallback", err);
          try {
             // Fallback to any video camera
             stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
          } catch(fallbackErr) {
             throw new Error("Could not access any camera. Please ensure permissions are granted.");
          }
        }

        if (!isMounted) {
          if (stream) stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current && stream) {
          // IMPORTANT: Set properties before srcObject for Mobile Safari/Chrome quirks
          videoRef.current.muted = true;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.srcObject = stream;
          
          // Safety timeout: If video doesn't start in 3s, remove loader so user isn't stuck
          initTimeout = setTimeout(() => {
             if (isMounted) setIsLoading(false);
          }, 3000);

          const playVideo = async () => {
             if (!videoRef.current) return;
             try {
                await videoRef.current.play();
                if (isMounted) setIsLoading(false);
             } catch (e) {
                console.warn("Play attempt failed", e);
                // If play fails (e.g. low power mode), we still remove loader via the timeout
             }
          };

          // Try playing when metadata loads
          videoRef.current.onloadedmetadata = () => {
             playVideo();
          };
          
          // Also try immediately
          playVideo();
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        if (isMounted) {
          setError(err.message || "Camera error");
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
           const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
           onCapture(dataUrl);
        } catch(e) {
           console.error("Capture failed", e);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col">
       {/* Error State */}
       {error && (
         <div className="absolute inset-0 flex items-center justify-center text-white p-8 text-center z-50 bg-black/90">
           <div>
             <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
             </div>
             <p className="mb-6 font-medium">{error}</p>
             <button onClick={onClose} className="bg-white text-black px-6 py-3 rounded-full font-bold active:scale-95 transition">Close</button>
           </div>
         </div>
       )}

       {/* Video Stream */}
       <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
         {/* Loader overlay */}
         {isLoading && !error && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white/50 bg-black/50 pointer-events-none">
             <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
             <p className="text-sm font-medium">Starting Camera...</p>
           </div>
         )}
         
         <video 
           ref={videoRef} 
           autoPlay 
           playsInline 
           muted 
           className="absolute inset-0 w-full h-full object-cover"
           style={{ display: 'block' }} 
         />
       </div>

       {/* Controls */}
       <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-8 pb-12 safe-area-bottom flex items-center justify-between z-20">
          <button 
            onClick={onClose} 
            className="text-white text-sm font-bold p-4 bg-white/10 rounded-full backdrop-blur-md active:bg-white/20 transition"
          >
            Cancel
          </button>
          
          <button 
            onClick={takePhoto}
            disabled={isLoading || !!error}
            className={`w-20 h-20 rounded-full border-[6px] border-white/30 flex items-center justify-center transition-all ${isLoading || error ? 'opacity-50 grayscale' : 'active:scale-95 active:border-white/50'}`}
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]"></div>
          </button>
          
          <div className="w-12 opacity-0"></div>
       </div>
       <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCaptureView;
