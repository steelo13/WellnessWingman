import React, { useRef, useEffect, useState } from 'react';

interface CameraCaptureViewProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraCaptureView: React.FC<CameraCaptureViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Try environment (back) camera first
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Environment camera failed, trying user camera", err);
        try {
          // Fallback to user (front) camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err2) {
          console.error("All camera attempts failed", err2);
          setError("Could not access camera. Please ensure permissions are granted.");
        }
      }
    };

    startCamera();

    return () => {
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col">
       {/* Error State */}
       {error && (
         <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center z-50">
           <p className="mb-4">{error}</p>
           <button onClick={onClose} className="bg-white text-black px-6 py-2 rounded-full font-bold">Close</button>
         </div>
       )}

       {/* Video Stream */}
       <div className="flex-1 relative overflow-hidden bg-black">
         <video 
           ref={videoRef} 
           autoPlay 
           playsInline 
           muted 
           className="absolute inset-0 w-full h-full object-cover"
         />
       </div>

       {/* Controls */}
       <div className="bg-black/80 p-8 flex items-center justify-between pb-12 safe-area-bottom">
          <button 
            onClick={onClose} 
            className="text-white text-sm font-bold p-4"
          >
            Cancel
          </button>
          
          <button 
            onClick={takePhoto}
            className="w-20 h-20 rounded-full border-[6px] border-white/30 flex items-center justify-center active:scale-95 transition-all"
          >
            <div className="w-16 h-16 bg-white rounded-full"></div>
          </button>
          
          <div className="w-12"></div> {/* Spacer for alignment */}
       </div>
       <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCaptureView;