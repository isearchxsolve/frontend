"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface PreviewIframeProps {
  url?: string;
  isLoading: boolean;
  error?: string;
  device: "desktop" | "tablet" | "mobile";
  zoom: number;
}

const DEVICE_SIZES = {
  desktop: { width: "100%", height: "100%", borderRadius: "0" },
  tablet: { width: "768px", height: "1024px", borderRadius: "8px" },
  mobile: { width: "375px", height: "667px", borderRadius: "8px" },
};

export function PreviewIframe({ url, isLoading, error, device, zoom }: PreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeUrl, setIframeUrl] = useState(url || "");

  // Update iframe URL when url prop changes
  useEffect(() => {
    if (url) {
      setIframeUrl(url);
    }
  }, [url]);

  const handleLoad = useCallback(() => {
    // Iframe loaded successfully
  }, []);

  const handleError = useCallback(() => {
    // Iframe error
  }, []);

  const deviceSize = DEVICE_SIZES[device];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">
            {iframeUrl || "No preview available"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Device Selector */}
          <div className="flex bg-gray-100 rounded p-1">
            {["desktop", "tablet", "mobile"].map((d) => (
              <button
                key={d}
                onClick={() => {
                  // In real implementation, this would update the store
                  console.log("Switch to device:", d);
                }}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  device === d
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {d === "desktop" && "??"}
                {d === "tablet" && "??"}
                {d === "mobile" && "??"}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => console.log("Zoom out")}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              -
            </button>
            <span className="text-xs text-gray-500 w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => console.log("Zoom in")}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              +
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Refresh"
          >
            ??
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-auto p-4 bg-gray-200"
        style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
      >
        {error && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow max-w-md">
            <div className="text-6xl mb-4">??</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Error</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => iframeRef.current?.contentWindow?.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <div
            className="relative bg-white shadow-lg overflow-hidden"
            style={{
              width: deviceSize.width,
              height: deviceSize.height,
              borderRadius: deviceSize.borderRadius,
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600 text-sm">Loading preview...</span>
                </div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              src={iframeUrl || "about:blank"}
              onLoad={handleLoad}
              onError={handleError}
              className="w-full h-full border-0"
              style={{ backgroundColor: "white" }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        )}
      </div>
    </div>
  );
}
