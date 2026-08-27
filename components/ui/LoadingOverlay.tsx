'use client';

import { Car, Bike } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  message = 'Loading DriveEasy...',
  submessage = 'Please wait a moment while we prepare your ride.',
  fullScreen = true,
}: LoadingOverlayProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 transition-all duration-300 ${
        fullScreen
          ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-md dark:bg-gray-950/80'
          : 'w-full py-16'
      }`}
    >
      <div className="relative flex items-center justify-center mb-6">
        {/* Pulsing ring animation */}
        <div className="absolute w-20 h-20 rounded-full bg-blue-500/20 animate-ping duration-1000" />
        <div className="absolute w-16 h-16 rounded-full bg-blue-600/10 animate-pulse" />
        
        {/* Animated icon circle */}
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white transform transition-transform animate-bounce">
          <Car className="h-7 w-7 animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight text-center">
        {message}
      </h3>
      {submessage && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-center">
          {submessage}
        </p>
      )}

      {/* Progress bar animation */}
      <div className="w-44 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-5">
        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 rounded-full w-full animate-indeterminate" />
      </div>
    </div>
  );
}

