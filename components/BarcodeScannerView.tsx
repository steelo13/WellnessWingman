
import React, { useEffect } from 'react';

interface BarcodeScannerViewProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({ onScan, onClose }) => {
  useEffect(() => {
    // @ts-ignore
    const html5QrCode = new Html5Qrcode("reader");
    // Use a simpler config for better mobile compatibility
    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            html5QrCode.stop().then(() => {
              onScan(decodedText);
            });
          },
          () => {} // silent error handler
        );
      } catch (err) {
        console.error("Camera access failed", err);
        alert("Could not access camera. Please ensure permissions are granted.");
        onClose();
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
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
        <div id="reader" className="w-full h-full relative z-10"></div>
        
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
