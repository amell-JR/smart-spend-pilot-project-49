
import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReceiptCameraProps {
  onImageCapture: (imageBase64: string) => void;
  isProcessing?: boolean;
}

export const ReceiptCamera = ({ onImageCapture, isProcessing = false }: ReceiptCameraProps) => {
  const [isCamera, setIsCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setImageError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      setIsCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setImageError('Unable to access camera. Please try uploading an image instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCamera(false);
    setPreviewImage(null);
  };

  const validateImageSize = (base64String: string): boolean => {
    // Check if image is too large (4MB limit for base64)
    const sizeInBytes = (base64String.length * 3) / 4;
    const maxSize = 4 * 1024 * 1024; // 4MB
    return sizeInBytes <= maxSize;
  };

  const compressImage = (canvas: HTMLCanvasElement, quality: number = 0.8): string => {
    return canvas.toDataURL('image/jpeg', quality);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0);
    
    // Start with high quality and compress if needed
    let imageDataUrl = compressImage(canvas, 0.9);
    let imageBase64 = imageDataUrl.split(',')[1];
    
    // If image is too large, compress further
    if (!validateImageSize(imageBase64)) {
      imageDataUrl = compressImage(canvas, 0.6);
      imageBase64 = imageDataUrl.split(',')[1];
      
      if (!validateImageSize(imageBase64)) {
        imageDataUrl = compressImage(canvas, 0.4);
        imageBase64 = imageDataUrl.split(',')[1];
      }
    }

    setPreviewImage(imageDataUrl);
    setImageError(null);
  };

  const confirmCapture = () => {
    if (previewImage) {
      const base64 = previewImage.split(',')[1];
      onImageCapture(base64);
      stopCamera();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file.');
      return;
    }

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setImageError('Image file is too large. Please select an image smaller than 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const imageBase64 = result.split(',')[1];
      
      if (!validateImageSize(imageBase64)) {
        setImageError('Image is too large after encoding. Please try a smaller image or use the camera.');
        return;
      }
      
      setImageError(null);
      onImageCapture(imageBase64);
    };
    reader.onerror = () => {
      setImageError('Error reading the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  if (isCamera) {
    return (
      <Card className="p-4 bg-white dark:bg-slate-800">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-white">Capture Receipt</h3>
            <Button variant="ghost" size="sm" onClick={stopCamera} disabled={isProcessing}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {imageError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{imageError}</AlertDescription>
            </Alert>
          )}
          
          <div className="relative">
            {!previewImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </>
            ) : (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Receipt preview"
                  className="w-full rounded-lg"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {!previewImage ? (
              <>
                <Button onClick={capturePhoto} className="flex-1" disabled={isProcessing}>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={confirmCapture} className="flex-1" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Process Receipt
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setPreviewImage(null)}>
                  Retake
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white dark:bg-slate-800">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold dark:text-white">Add Receipt</h3>
        
        {imageError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{imageError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            onClick={startCamera} 
            variant="outline" 
            className="flex-1"
            disabled={isProcessing}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="flex-1"
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>• For best results, ensure the receipt is well-lit and flat</p>
          <p>• Maximum file size: 20MB</p>
          <p>• Supported formats: JPG, PNG, WEBP</p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Card>
  );
};
