'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null;
          })
          .catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode('qr-reader');
      
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Camera posteriore
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR decodificato con successo
          setScanning(false);
          scanner.stop();
          scannerRef.current = null;
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignora errori di scansione continua
        }
      );

      setScanning(true);
    } catch (err: any) {
      const errorMsg = err.message || 'Errore nell\'accesso alla camera';
      setError(errorMsg);
      setScanning(false);
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error('Errore stop scanner:', err);
      }
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div id="qr-reader" className="w-full max-w-md mx-auto" ref={containerRef}></div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center gap-2">
            {!scanning ? (
              <Button onClick={startScan}>Avvia Scanner</Button>
            ) : (
              <Button onClick={stopScan} variant="destructive">
                Ferma Scanner
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

