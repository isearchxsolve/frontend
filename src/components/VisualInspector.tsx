"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";

interface DOMNode {
  tagName: string;
  id?: string;
  className?: string;
  attributes: Record<string, string>;
  children: DOMNode[];
  bounds?: DOMRect;
  xpath: string;
  selector: string;
}

export function VisualInspector() {
  const { preview } = useAppStore();
  const [selectedNode, setSelectedNode] = useState<DOMNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<DOMNode | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleInspect = useCallback(() => {
    setIsInspecting(!isInspecting);
    if (!isInspecting) {
      // Enable inspection mode
      iframeRef.current?.contentWindow?.postMessage(
        { type: "ENABLE_INSPECTION" },
        "*"
      );
    } else {
      // Disable inspection mode
      iframeRef.current?.contentWindow?.postMessage(
        { type: "DISABLE_INSPECTION" },
        "*"
      );
      setHoveredNode(null);
    }
  }, [isInspecting]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "NODE_HOVERED") {
        setHoveredNode(event.data.node);
      } else if (event.data.type === "NODE_SELECTED") {
        setSelectedNode(event.data.node);
        setIsInspecting(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!preview.url) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-lg font-medium">Visual Inspector</p>
        <p className="text-sm mt-1">Start a preview to inspect elements</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Inspector Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleInspect}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-1.5 ${
              isInspecting
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{isInspecting ? "⏹" : "🔍"}</span>
            <span>{isInspecting ? "Inspecting..." : "Inspect Element"}</span>
            {isInspecting && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
          </button>
          
          {selectedNode && (
            <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded font-mono">
              {selectedNode.selector}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100" title="Copy Selector">
            📋
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100" title="Open in Editor">
            ✏️
          </button>
        </div>
      </div>

      {/* Inspector Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: DOM Tree */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-2 border-b border-gray-200 bg-white">
            <h4 className="text-sm font-medium text-gray-900">DOM Tree</h4>
          </div>
          <div className="p-2">
            {preview.url ? (
              <DOMTreeView
                url={preview.url}
                selectedNode={selectedNode}
                hoveredNode={hoveredNode}
                onSelect={setSelectedNode}
                iframeRef={iframeRef}
              />
            ) : (
              <div className="text-gray-400 text-sm text-center py-8">
                No preview loaded
              </div>
            )}
          </div>
        </div>

        {/* Right: Element Details */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedNode ? (
            <ElementDetailsPanel node={selectedNode} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg font-medium">Select an element</p>
              <p className="text-sm mt-1">Click "Inspect Element" then hover over the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DOMTreeView({
  url,
  selectedNode,
  hoveredNode,
  onSelect,
  iframeRef,
}: {
  url: string;
  selectedNode: DOMNode | null;
  hoveredNode: DOMNode | null;
  onSelect: (node: DOMNode) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}) {
  const [tree, setTree] = useState<DOMNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!url) return;
    
    setIsLoading(true);
    // Request DOM tree from iframe
    iframeRef.current?.contentWindow?.postMessage(
      { type: "GET_DOM_TREE" },
      "*"
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "DOM_TREE") {
        setTree(event.data.tree);
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [url, iframeRef]);

  const toggleExpand = useCallback((xpath: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(xpath)) {
        next.delete(xpath);
      } else {
        next.add(xpath);
      }
      return next;
    });
  }, []);

  if (isLoading) {
    return <div className="text-gray-400 text-sm text-center py-8">Loading DOM tree...</div>;
  }

  if (!tree) {
    return <div className="text-gray-400 text-sm text-center py-8">No DOM tree available</div>;
  }

  const renderNode = useCallback(
    (node: DOMNode, depth: number = 0) => {
      const isSelected = selectedNode?.xpath === node.xpath;
      const isHovered = hoveredNode?.xpath === node.xpath;
      const isExpanded = expandedNodes.has(node.xpath);
      const hasChildren = node.children.length > 0;

      return (
        <div key={node.xpath}>
          <div
            className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors ${
              isSelected
                ? "bg-blue-100 text-blue-900"
                : isHovered
                ? "bg-yellow-100 text-yellow-900"
                : "hover:bg-gray-200"
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => onSelect(node)}
            onMouseEnter={() => {
              iframeRef.current?.contentWindow?.postMessage(
                { type: "HOVER_NODE", xpath: node.xpath },
                "*"
              );
            }}
          >
            {hasChildren && (
              <span className="text-gray-400">
                {isExpanded ? "▼" : "▶"}
              </span>
            )}
            <span className="font-mono text-sm text-gray-700">{"<" + node.tagName.toLowerCase() + ">"}</span>
            {node.id && <span className="text-purple-600">#{node.id}</span>}
            {node.className && <span className="text-blue-600">.{node.className.split(" ").join(".")}</span>}
            <span className="font-mono text-sm text-gray-700">{">"}</span>
          </div>
          {isExpanded && hasChildren && (
            <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
          )}
        </div>
      );
    },
    [selectedNode, hoveredNode, expandedNodes, onSelect, iframeRef]
  );

  return <div>{renderNode(tree)}</div>;
}

function ElementDetailsPanel({ node }: { node: DOMNode }) {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Element Details</h4>
        
        <dl className="space-y-3 text-sm">
          <div className="flex gap-4">
            <dt className="text-gray-500 font-mono w-24">Tag</dt>
            <dd className="font-mono text-gray-900">{node.tagName.toLowerCase()}</dd>
          </div>
          
          {node.id && (
            <div className="flex gap-4">
              <dt className="text-gray-500 font-mono w-24">ID</dt>
              <dd className="font-mono text-gray-900">#{node.id}</dd>
            </div>
          )}
          
          {node.className && (
            <div className="flex gap-4">
              <dt className="text-gray-500 font-mono w-24">Classes</dt>
              <dd className="font-mono text-gray-900 flex-1">
                {node.className.split(" ").map((c) => (
                  <span key={c} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded mr-1 mb-1 text-xs">
                    {c}
                  </span>
                ))}
              </dd>
            </div>
          )}
          
          <div className="flex gap-4">
            <dt className="text-gray-500 font-mono w-24">Selector</dt>
            <dd className="font-mono text-gray-900 flex-1 truncate">{node.selector}</dd>
          </div>
          
          <div className="flex gap-4">
            <dt className="text-gray-500 font-mono w-24">XPath</dt>
            <dd className="font-mono text-gray-900 flex-1 truncate">{node.xpath}</dd>
          </div>
        </dl>
      </div>

      {Object.keys(node.attributes).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Attributes</h4>
          <dl className="space-y-2 text-sm">
            {Object.entries(node.attributes).map(([key, value]) => (
              <div key={key} className="flex gap-4">
                <dt className="text-gray-500 font-mono w-24">{key}</dt>
                <dd className="font-mono text-gray-900 flex-1 truncate">"{value}"</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {node.bounds && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Computed Bounds</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex gap-4">
              <dt className="text-gray-500 font-mono w-16">Width</dt>
              <dd className="font-mono text-gray-900">{Math.round(node.bounds.width)}px</dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-gray-500 font-mono w-16">Height</dt>
              <dd className="font-mono text-gray-900">{Math.round(node.bounds.height)}px</dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-gray-500 font-mono w-16">Top</dt>
              <dd className="font-mono text-gray-900">{Math.round(node.bounds.top)}px</dd>
            </div>
            <div className="flex gap-4">
              <dt className="text-gray-500 font-mono w-16">Left</dt>
              <dd className="font-mono text-gray-900">{Math.round(node.bounds.left)}px</dd>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          Open in Editor
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
          Copy Selector
        </button>
      </div>
    </div>
  );
}



