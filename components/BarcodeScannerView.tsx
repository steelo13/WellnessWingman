
import React, { useEffect, useRef, useState } from 'react';

interface BarcodeScannerViewProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const isUnmounting = useRef(false);

  useEffect(() => {
    isUnmounting.current = false;
    // @ts-ignore
    const Html5Qrcode = window.Html5Qrcode;
    
    // Cleanup previous instance if exists (safety check)
    if (scannerRef.current) {
        try { scannerRef.current.clear(); } catch(e){}
    }

    // Initialize without verbose mode
    const html5QrCode = new Html5Qrcode("reader", false);
    scannerRef.current = html5QrCode;

    // Config: qrbox removed to allow full-screen scanning and prevent mobile layout miscalculations
    const config = { 
      fps: 10, 
      videoConstraints: {
        focusMode: "continuous",
        facingMode: "environment"
      }
    };

    const handleSuccess = (decodedText: string) => {
      if (isUnmounting.current) return;
      
      // Stop scanning immediately upon success
      html5QrCode.stop().then(() => {
        if(!isUnmounting.current) {
            html5QrCode.clear();
            onScan(decodedText);
        }
      }).catch((err: any) => {
        console.warn("Stop failed", err);
        if(!isUnmounting.current) onScan(decodedText);
      });
    };

    const handleError = (errorMessage: string) => {
        // Ignored to prevent console spam for frames without QR codes
    };

    const startScanner = async () => {
      try {
        // Direct attempt with environment camera
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          handleSuccess,
          handleError
        );

        // Mobile Fix: Manually ensure video element plays inline and is visible
        const videoElement = document.querySelector('#reader video') as HTMLVideoElement;
        if (videoElement) {
           videoElement.setAttribute('playsinline', 'true');
           // videoElement.play().catch(() => {}); // Library handles play, but we ensure attr
        }

      } catch (err: any) {
        console.warn("Environment camera start failed:", err);
        
        if (isUnmounting.current) return;

        // Fallback: Try "user" camera
        try {
           await html5QrCode.start(
            { facingMode: "user" },
            config,
            handleSuccess,
            handleError
          );
        } catch (err2: any) {
           console.error("All camera attempts failed:", err2);
           if (!isUnmounting.current) {
             setErrorMsg("Camera error: " + (err2?.message || "Could not start video source."));
           }
        }
      }
    };

    // Small delay to ensure DOM is fully painted
    const timer = setTimeout(startScanner, 100);

    return () => {
      isUnmounting.current = true;
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch((e: any) => console.warn("Cleanup stop error", e));
        }
        try { scannerRef.current.clear(); } catch(e){}
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex items-center justify-between mb-6 z-20">
        <h2 className="text-white text-xl font-bold tracking-tight">Scan Barcode</h2>
        <button 
          onClick={onClose}
          className="bg-white/10 text-white p-2.5 rounded-full backdrop-blur-md hover:bg-white/20 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      {/* Container must have explicit size for video to fill */}
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
        <div id="reader" className="w-full h-full relative z-10 bg-black"></div>
        
        {/* Error Display */}
        {errorMsg && (
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80 z-30 text-center">
                <p className="text-white font-bold">{errorMsg}</p>
            </div>
        )}

        {/* Decorative Overlay Frame */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
           <div className="w-64 h-40 border-2 border-blue-500 rounded-2xl shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-400 -mt-0.5 -ml-0.5 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-400 -mt-0.5 -mr-0.5 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-400 -mb-0.5 -ml-0.5 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-400 -mb-0.5 -mr-0.5 rounded-br-lg"></div>
           </div>
        </div>
      </div>

      <p className="mt-8 text-white/60 text-sm text-center px-8 z-20 font-medium">
        Point your camera at a food package barcode to instantly log it.
      </p>
    </div>
  );
};

export default BarcodeScannerView;
