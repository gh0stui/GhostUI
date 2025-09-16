'use client'

import { useState, useEffect } from "react";

export default function Guidelines() {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const openModal = (imageSrc: string) => {
    setModalImage(imageSrc);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setModalImage(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 3));
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (modalImage) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [modalImage]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dataset Annotation and Validation Guidelines</h1>
          <p className="text-gray-600">
            This validation framework ensures dataset quality and accurately identifies true hidden interactions through structured assessment.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Overview */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-gray-700">
                Our validation process follows a structured assessment framework to ensure consistent application across the entire dataset. 
                Each interaction is evaluated across three key dimensions to maintain dataset quality and research validity.
              </p>
            </div>
          </section>

          {/* 1. Interaction Validity */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Interaction Validity</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Assessment Criteria</h3>
              <p className="text-gray-700 mb-4">
                We verify each interaction was error-free, with no error messages or unexpected behaviors, and confirm that the interaction produced a meaningful UI state change.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r">
                <h4 className="font-semibold text-green-800 mb-2">✓ Valid Interactions</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Error-free execution with no unexpected behaviors</li>
                  <li>• Visible UI state change aligned with intended functionality</li>
                  <li>• Gesture produces expected response for the target element</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded-r">
                <h4 className="font-semibold text-red-800 mb-2">✗ Invalid Interactions</h4>
                <ul className="space-y-1 text-red-700">
                  <li>• Double tap triggering two separate taps unintentionally</li>
                  <li>• Long press acting like standard tap on unsupported elements</li>
                  <li>• Swipe gestures extending beyond target UI area</li>
                  <li>• Error messages or application crashes</li>
                  <li>• No meaningful UI change</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Visual Element Labeling */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Visual Element Labeling</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                To enable systematic assessment of visual affordances, we label UI elements using five visual categories. 
                This minimal set balances simplicity and expressiveness while capturing both content and layout-level visual cues.
              </p>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> All elements within each gesture's bounding box must be labeled using one or more categories.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-3 h-3 bg-gray-800 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Border</h4>
                  <p className="text-gray-600">Element boundaries, frames, dividers, and visual separators</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Text</h4>
                  <p className="text-gray-600">Labels, button text, descriptions, and any textual content</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Icon</h4>
                  <p className="text-gray-600">Symbols, pictograms, and graphic elements representing actions or concepts</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-3 h-3 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Media</h4>
                  <p className="text-gray-600">Images, photos, videos, maps, and other media content</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="w-3 h-3 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800">Whitespace</h4>
                  <p className="text-gray-600">Empty areas, margins, padding, and negative space</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Hidden Nature Assessment */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Hidden Nature Assessment</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                We evaluate each interaction to determine whether it lacks obvious visual cues that would typically signal interactivity. 
                Assessment considers both the element itself and its surrounding UI context.
              </p>
            </div>

            <div className="space-y-6">
              {/* Tap Gestures */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Tap Gestures
                </h3>
                <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                  <p className="text-gray-700 mb-2"><strong>Hidden Criteria:</strong></p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Tapped element contains only <em>whitespace</em> or <em>media</em></li>
                    <li>• No conventional affordances (borders, icons, stylized text)</li>
                    <li>• No contextual cues in surrounding layout suggesting tappability</li>
                  </ul>
                </div>
              </div>

              {/* Double Tap & Long Press */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Double Tap & Long Press
                </h3>
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  <p className="text-gray-700 mb-2"><strong>Hidden Criteria:</strong></p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Applied to same element as standard tap but produces distinct behaviors</li>
                    <li>• Considered hidden even if visual cues are present</li>
                    <li>• Alternate behaviors cannot be inferred from design alone</li>
                  </ul>
                </div>
              </div>

              {/* Swipe & Scroll */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Swipe & Scroll Gestures
                </h3>
                <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                  <p className="text-gray-700 mb-2"><strong>Hidden Criteria:</strong></p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• Absence of cropped content at screen edges</li>
                    <li>• No pagination dots or page indicators</li>
                    <li>• No visible scroll bars</li>
                    <li>• No other contextual indicators suggesting scrollable content</li>
                  </ul>
                </div>
              </div>

              {/* Pinch Gestures */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Pinch Gestures
                </h3>
                <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                  <p className="text-gray-700 mb-2"><strong>Hidden Criteria:</strong></p>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>• No visual cues suggesting zoom functionality</li>
                    <li>• Absence of zoom control icons (+ / - buttons)</li>
                    <li>• No zoom ratio displays or magnification indicators</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Practical Examples */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Practical Examples</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                The following examples demonstrate how to apply the validation criteria in real scenarios. 
                Pay attention to the target region (orange border), child components (blue boxes), and action points (circular dots).
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Key Visual Elements:</h3>
                <ul className="space-y-1 text-yellow-700 text-sm">
                  <li>• <strong>Orange border:</strong> Target region for interaction</li>
                  <li>• <strong>Blue boxes:</strong> Child components (exclude from labeling)</li>
                  <li>• <strong>Circular dots:</strong> Action points where gesture was performed</li>
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Polybuzz Example */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Polybuzz App Example</h3>
                
                <div className="mb-4 flex justify-center">
                  <div className="relative inline-block cursor-pointer" onClick={() => openModal('/polybuzz.png')}>
                    <img 
                      src="/polybuzz.png" 
                      alt="Polybuzz App Example"
                      className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                      style={{ maxHeight: '300px' }}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Click to expand
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-red-50 border-l-4 border-red-400 p-3">
                    <h4 className="font-semibold text-red-800 mb-1">Interaction Validity: ✗ Invalid</h4>
                    <p className="text-red-700 text-sm">Action point is within blue child component (already tested)</p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                    <h4 className="font-semibold text-blue-800 mb-1">Visual Element Labeling:</h4>
                    <p className="text-blue-700 text-sm mb-2">Orange region contains: icon, text, whitespace</p>
                    <p className="text-blue-700 text-sm mb-2">Blue boxes exclude: icon, text</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">✓ Whitespace</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grok Example */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Grok App Example</h3>
                
                <div className="mb-4 flex justify-center">
                  <div className="relative inline-block cursor-pointer" onClick={() => openModal('/grok.png')}>
                    <img 
                      src="/grok.png" 
                      alt="Grok App Example"
                      className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                      style={{ maxHeight: '300px' }}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Click to expand
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-50 border-l-4 border-green-400 p-3">
                    <h4 className="font-semibold text-green-800 mb-1">Interaction Validity: ✓ Valid</h4>
                    <p className="text-green-700 text-sm">Action point is outside blue child components</p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                    <h4 className="font-semibold text-blue-800 mb-1">Visual Element Labeling:</h4>
                    <p className="text-blue-700 text-sm mb-2">Orange region contains: media, border, icon</p>
                    <p className="text-blue-700 text-sm mb-2">Blue boxes exclude: icon, border</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">✓ Media</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded">
              <h3 className="font-semibold text-gray-800 mb-2">Key Takeaways:</h3>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• If action point falls within blue child components → Interaction is <strong>invalid</strong></li>
                <li>• Only label elements within orange target region that are <strong>not</strong> covered by blue boxes</li>
                <li>• Child components (blue boxes) represent previously tested interactive elements</li>
                <li>• Focus labeling on the remaining visual elements after excluding child components</li>
              </ul>
            </div>
          </section>

        </div>
      </div>

      {/* Image Modal (if needed for future images) */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <img 
              src={modalImage} 
              alt="Expanded image"
              className={`max-w-[90vw] max-h-[90vh] object-contain rounded-lg transition-transform ${
                isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-default'
              }`}
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transformOrigin: 'center center'
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
            
            {/* Control buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleZoomOut}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                disabled={zoom <= 0.5}
                title='Zoom Out'
              >
                −
              </button>
              <button
                onClick={handleReset}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition-all text-xs"
                title='Reset'
              >
                1:1
              </button>
              <button
                onClick={handleZoomIn}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                disabled={zoom >= 3}
                title='Zoom In'
              >
                +
              </button>
              <button
                onClick={closeModal}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                title='Close'
              >
                ✕
              </button>
            </div>

            {/* Zoom level display */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded">
              {Math.round(zoom * 100)}%
            </div>

            {/* Help text */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded text-center">
              'Wheel: Zoom | Drag: Pan | ESC: Close'
            </div>
          </div>
        </div>
      )}
    </div>
  );
}