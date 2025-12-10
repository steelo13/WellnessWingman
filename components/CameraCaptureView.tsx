
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

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError('');

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
          // Fallback to basic constraints (might trigger user facing camera if env not available)
          try {
             stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
          } catch(fallbackErr) {
             throw new Error("Could not access any camera.");
          }
        }

        if (!isMounted) {
          if (stream) stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          // CRITICAL: playsinline required for iOS to render video inline (not fullscreen)
          videoRef.current.setAttribute('playsinline', 'true');
          
          // Wait a moment for the video to be ready before playing
          videoRef.current.onloadedmetadata = async () => {
             if (videoRef.current) {
                try {
                   await videoRef.current.play();
                   setIsLoading(false);
                } catch (e) {
                   console.error("Auto-play failed", e);
                   setError("Tap to start camera");
                   setIsLoading(false);
                }
             }
          };
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        if (isMounted) {
          setError("Could not access camera. Please check permissions.");
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
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
         {isLoading && !error && (
           <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white/50">
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
