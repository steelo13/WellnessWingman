import React, { useEffect } from 'react';

interface BarcodeScannerViewProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScannerView: React.FC<BarcodeScannerViewProps> = ({ onScan, onClose }) => {
  useEffect(() => {
    // @ts-ignore
    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 150 } };

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
        alert("Could not access camera for scanning.");
        onClose();
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-sm flex items-center justify-between mb-4 z-10">
        <h2 className="text-white text-xl font-bold">Scanning Barcode...</h2>
        <button 
          onClick={onClose}
          className="bg-white/10 text-white p-2 rounded-full backdrop-blur-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="relative w-full aspect-square max-w-sm">
        <div id="reader" className="overflow-hidden bg-gray-900 shadow-2xl"></div>
        {/* Scanning Overlay Viewfinder */}
        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
           <div className="w-full h-full border-2 border-blue-500 rounded-2xl animate-pulse" />
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm text-center px-8 z-10">
        Align a product barcode within the frame. It will automatically scan when recognized.
      </p>
    </div>
  );
};

export default BarcodeScannerView;