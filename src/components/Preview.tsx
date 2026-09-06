"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";

export function Preview() {
  const { previewUrl, setPreviewUrl } = useStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default preview URL - in production this would come from the sandbox
    if (!previewUrl) {
      setPreviewUrl("http://localhost:3001"); // Default preview port
    }
  }, [previewUrl, setPreviewUrl]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setLoading(true);
    }
  };

  const styles = {
    desktop: "w-full h-full",
    mobile: "w-[375px] h-[667px] mx-auto border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl",
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Preview</span>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded p-1">
            <button
              onClick={() => setViewMode("desktop")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === "desktop"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === "mobile"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Mobile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshPreview}
            disabled={loading}
            className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-900">
        <div 
          className={styles[viewMode]}
          style={viewMode === "mobile" ? { marginTop: "2rem" } : {}}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0 bg-white dark:bg-gray-800"
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            title="Application Preview"
          />
        </div>
      </div>
    </div>
  );
}
