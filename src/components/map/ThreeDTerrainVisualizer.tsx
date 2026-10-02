import React, { useRef, useEffect, useState } from 'react';
import { Box, RotateCcw, Sun, Sliders, X, Sparkles, MapPin, Eye } from 'lucide-react';
import { Mountain } from '../../types/mountain';

interface ThreeDTerrainVisualizerProps {
  mountain: Mountain;
  onClose: () => void;
  onAskAI: (m: Mountain) => void;
}

export const ThreeDTerrainVisualizer: React.FC<ThreeDTerrainVisualizerProps> = ({
  mountain,
  onClose,
  onAskAI,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Controls
  const [rotationAngle, setRotationAngle] = useState(45);
  const [pitchAngle, setPitchAngle] = useState(35);
  const [elevationScale, setElevationScale] = useState(1.4);
  const [showContours, setShowContours] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [sunAngle, setSunAngle] = useState(120);

  // Auto-rotation toggle
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Mouse drag handling
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animId: number;

    const render = () => {
      if (isAutoRotating) {
        setRotationAngle((prev) => (prev + 0.3) % 360);
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark Alpine Night / Slate Background
      ctx.fillStyle = '#0B131E';
      ctx.fillRect(0, 0, width, height);

      // Grid terrain synthesis based on mountain morphology
      const gridSize = 28;
      const spacing = 18;
      const cx = width / 2;
      const cy = height / 2 + 30;

      const radRot = (rotationAngle * Math.PI) / 180;
      const radPitch = (pitchAngle * Math.PI) / 180;
      const radSun = (sunAngle * Math.PI) / 180;

      // Elevation height field generator
      const getHeight = (gx: number, gy: number) => {
        const dist = Math.hypot(gx, gy);
        // Base pyramid summit peak
        const peakElevation = mountain.elevationM / 1000; // e.g. 8.84 for Everest
        const decay = Math.max(0, 1 - dist / (gridSize * 0.48));

        // Ridges and valleys
        const ridgeAngle = Math.atan2(gy, gx);
        const ridges = Math.cos(ridgeAngle * 3) * 0.25;
        const noise = Math.sin(gx * 0.8) * Math.cos(gy * 0.8) * 0.15;

        const h = Math.pow(decay, 1.8) * peakElevation * 22 * elevationScale * (1 + ridges + noise);
        return Math.max(0, h);
      };

      // Project 3D point (x, y, z) to 2D screen coordinates
      const project = (x: number, y: number, z: number) => {
        // Rotate around Z axis (azimuth)
        const rx = x * Math.cos(radRot) - y * Math.sin(radRot);
        const ry = x * Math.sin(radRot) + y * Math.cos(radRot);

        // Pitch tilt (elevation angle)
        const px = rx;
        const py = ry * Math.sin(radPitch) - z * Math.cos(radPitch);

        return {
          x: cx + px,
          y: cy + py,
          depth: ry * Math.cos(radPitch) + z * Math.sin(radPitch),
        };
      };

      // Generate grid quad polygons and sort painter's algorithm
      interface Quad {
        p1: { x: number; y: number; depth: number };
        p2: { x: number; y: number; depth: number };
        p3: { x: number; y: number; depth: number };
        p4: { x: number; y: number; depth: number };
        avgDepth: number;
        avgHeight: number;
        normalZ: number;
      }

      const quads: Quad[] = [];

      for (let i = -gridSize / 2; i < gridSize / 2 - 1; i++) {
        for (let j = -gridSize / 2; j < gridSize / 2 - 1; j++) {
          const x1 = i * spacing;
          const y1 = j * spacing;
          const z1 = getHeight(i, j);

          const x2 = (i + 1) * spacing;
          const y2 = j * spacing;
          const z2 = getHeight(i + 1, j);

          const x3 = (i + 1) * spacing;
          const y3 = (j + 1) * spacing;
          const z3 = getHeight(i + 1, j + 1);

          const x4 = i * spacing;
          const y4 = (j + 1) * spacing;
          const z4 = getHeight(i, j + 1);

          const p1 = project(x1, y1, z1);
          const p2 = project(x2, y2, z2);
          const p3 = project(x3, y3, z3);
          const p4 = project(x4, y4, z4);

          const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;
          const avgHeight = (z1 + z2 + z3 + z4) / 4;

          quads.push({
            p1,
            p2,
            p3,
            p4,
            avgDepth,
            avgHeight,
            normalZ: (z1 + z2 + z3 + z4) / 4,
          });
        }
      }

      // Sort back-to-front
      quads.sort((a, b) => b.avgDepth - a.avgDepth);

      // Render terrain quads with sun illumination shading
      quads.forEach((q) => {
        ctx.beginPath();
        ctx.moveTo(q.p1.x, q.p1.y);
        ctx.lineTo(q.p2.x, q.p2.y);
        ctx.lineTo(q.p3.x, q.p3.y);
        ctx.lineTo(q.p4.x, q.p4.y);
        ctx.closePath();

        // Shading based on elevation
        const heightFactor = Math.min(1, q.avgHeight / 120);

        // Snow on high summits, dark granite / moraine below
        let r, g, b;
        if (heightFactor > 0.6) {
          // Glacier snow / ice
          r = Math.floor(220 + 35 * heightFactor);
          g = Math.floor(235 + 20 * heightFactor);
          b = 255;
        } else if (heightFactor > 0.25) {
          // Slate rock / scree
          r = Math.floor(70 + 80 * heightFactor);
          g = Math.floor(80 + 90 * heightFactor);
          b = Math.floor(95 + 110 * heightFactor);
        } else {
          // Alpine valley tundra
          r = 30;
          g = 58;
          b = 43;
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();

        // Contour or wireframe outlines
        if (showContours) {
          ctx.strokeStyle = heightFactor > 0.6 ? 'rgba(0, 168, 232, 0.4)' : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // 3D Summit Peak Beacon
      const summit3D = project(0, 0, getHeight(0, 0));
      ctx.beginPath();
      ctx.arc(summit3D.x, summit3D.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FF9F1C';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Summit Label
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText(`${mountain.name} Summit (${mountain.elevationM.toLocaleString()} m)`, summit3D.x + 12, summit3D.y - 6);
      ctx.shadowBlur = 0;

      // Climbing Route Polyline Simulation
      if (showRoute) {
        ctx.beginPath();
        const routeSteps = 16;
        for (let s = 0; s <= routeSteps; s++) {
          const t = s / routeSteps;
          const gx = (1 - t) * (-gridSize * 0.35);
          const gy = (1 - t) * (gridSize * 0.25);
          const z = getHeight(gx / spacing, gy / spacing) + 2;
          const p = project(gx, gy, z);
          if (s === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = '#FFBF00';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [rotationAngle, pitchAngle, elevationScale, showContours, showRoute, sunAngle, isAutoRotating, mountain]);

  // Mouse interaction for orbit rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsAutoRotating(false);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotationAngle((prev) => (prev + dx * 0.5 + 360) % 360);
    setPitchAngle((prev) => Math.max(10, Math.min(80, prev + dy * 0.5)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-gray-950 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-800 bg-gray-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#FF9F1C] flex items-center justify-center border border-amber-500/20">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white tracking-tight">{mountain.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#1E3A2B] text-emerald-300">
                  {mountain.elevationM.toLocaleString()} m
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Interactive 3D Isometric Topographic Relief & Standard Route ({mountain.standardRoute})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskAI(mountain)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 text-xs font-bold hover:brightness-105 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI Route Advice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Canvas Area */}
        <div
          className="relative flex-1 bg-[#0B131E] overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <canvas
            ref={canvasRef}
            width={840}
            height={460}
            className="w-full h-full block"
          />

          <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] text-gray-300 font-mono border border-gray-800">
            Azimuth: {rotationAngle.toFixed(0)}° • Pitch: {pitchAngle.toFixed(0)}° • Scale: {elevationScale}x
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isAutoRotating
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-gray-800/80 border-gray-700 text-gray-400'
              }`}
            >
              {isAutoRotating ? 'Pause Orbit' : 'Auto Orbit'}
            </button>
          </div>
        </div>

        {/* Control Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2">
              <span className="text-gray-400">Elevation Exaggeration:</span>
              <input
                type="range"
                min="0.8"
                max="2.2"
                step="0.1"
                value={elevationScale}
                onChange={(e) => setElevationScale(parseFloat(e.target.value))}
                className="w-24 accent-[#FF9F1C]"
              />
            </label>

            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-2 py-1 rounded border transition-colors ${
                showContours
                  ? 'bg-sky-950 border-sky-600 text-sky-300'
                  : 'border-gray-700 text-gray-400'
              }`}
            >
              Contours
            </button>

            <button
              onClick={() => setShowRoute(!showRoute)}
              className={`px-2 py-1 rounded border transition-colors ${
                showRoute
                  ? 'bg-amber-950 border-amber-600 text-amber-300'
                  : 'border-gray-700 text-gray-400'
              }`}
            >
              Normal Route
            </button>
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-[11px]">
            <span>Click & Drag to Orbit/Pitch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
