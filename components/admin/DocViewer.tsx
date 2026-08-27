'use client';

import { useState } from 'react';
import { ZoomIn, ExternalLink, FileImage, AlertCircle, X } from 'lucide-react';

interface DocViewerProps {
  label: string;
  url: string;
  highlight?: boolean;
}

export function DocViewer({ label, url, highlight }: DocViewerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div className="space-y-1.5 flex flex-col items-center">
        <div
          onClick={() => {
            if (url) setLightboxOpen(true);
          }}
          className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-200 group bg-gray-50 flex items-center justify-center cursor-pointer ${
            highlight
              ? 'border-blue-600 shadow-md shadow-blue-500/10'
              : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
          }`}
        >
          {url && !imageError ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-400 flex flex-col items-center gap-1.5">
              {imageError ? (
                <>
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                  <span className="text-[11px] text-gray-500 font-medium">Click to inspect</span>
                </>
              ) : (
                <>
                  <FileImage className="h-6 w-6 text-gray-400" />
                  <span className="text-[11px]">No file</span>
                </>
              )}
            </div>
          )}

          {highlight && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              Payment
            </div>
          )}
        </div>

        <p className={`text-xs text-center font-bold tracking-tight ${highlight ? 'text-blue-700' : 'text-gray-700'}`}>
          {label}
        </p>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            Open Original <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && url && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-gray-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <h3 className="text-white font-bold text-base">{label}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-gray-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in New Tab
                </a>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl p-1.5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/50 rounded-2xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={label}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
