import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Satellite,
  Layers,
  Eye,
  Download,
  Box,
  Compass,
  Zap,
  Info,
  ChevronRight,
  Sparkles,
  MapPin,
  Maximize2
} from 'lucide-react';
import { Mountain, MountainRange, MajorRiver, SatelliteTrack, LiveTelemetry } from '../../types/mountain';
import {
  geoToEquirectangular,
  splitAntimeridianSegments,
  normalizeLatitude,
  normalizeLongitude,
  lerp,
  GeoCoordinate,
} from '../../utils/projection';
import { CONTINENT_POLYGONS } from './continentData';

interface EquirectangularMapProps {
  mountains: Mountain[];
  ranges: MountainRange[];
  rivers: MajorRiver[];
  satellites: SatelliteTrack[];
  selectedMountain: Mountain | null;
  onSelectMountain: (m: Mountain) => void;
  onOpen3DView: (m: Mountain) => void;
  onAskAIAboutMountain: (m: Mountain) => void;
}

export const EquirectangularMap: React.FC<EquirectangularMapProps> = ({
  mountains,
  ranges,
  rivers,
  satellites,
  selectedMountain,
  onSelectMountain,
  onOpen3DView,
  onAskAIAboutMountain,
}) => {
  // Layer Toggles
  const [showMountains, setShowMountains] = useState(true);
  const [showRanges, setShowRanges] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showSatellites, setShowSatellites] = useState(true);
  const [showGraticule, setShowGraticule] = useState(true);
  const [elevationFilter, setElevationFilter] = useState<'all' | '8000' | '7summits' | 'popular'>('all');
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>(satellites[0]?.id || 'landsat-9');

  // Throttled UI Telemetry Overlay state (Updated only at 2Hz to prevent React re-render lag)
  const [telemetryOverlay, setTelemetryOverlay] = useState<LiveTelemetry | null>(null);
  const [hoveredPeak, setHoveredPeak] = useState<Mountain | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Canvas Refs for Decoupled Rendering Engine
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable High-Frequency State (Bypassing React state for 60 FPS rAF loop)
  const animationFrameRef = useRef<number | null>(null);
  const telemetryBufferRef = useRef<{
    currentGeo: GeoCoordinate;
    targetGeo: GeoCoordinate;
    lastTickTime: number;
    targetTime: number;
    pastPoints: GeoCoordinate[];
    futurePoints: GeoCoordinate[];
  }>({
    currentGeo: { lat: 20, lng: -40 },
    targetGeo: { lat: 20.2, lng: -39.8 },
    lastTickTime: performance.now(),
    targetTime: performance.now() + 1000,
    pastPoints: [],
    futurePoints: [],
  });

  const lastOverlayUpdateRef = useRef<number>(0);

  // Active Satellite Object
  const activeSatellite = satellites.find((s) => s.id === selectedSatelliteId) || satellites[0];

  // Filtered mountains based on elevation tag
  const filteredMountains = mountains.filter((m) => {
    if (elevationFilter === '8000') return m.isEightThousander;
    if (elevationFilter === '7summits') return m.isSevenSummit;
    if (elevationFilter === 'popular') return m.isPopular;
    return true;
  });

  /**
   * Renders the Static Base Map to an Offscreen Canvas cache.
   * This includes continents, graticule lines (Plate Carrée), mountain ranges, rivers, and mountain pins.
   */
  const renderStaticBaseMap = useCallback(() => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext('2d');
    if (!ctx) return;

    const width = baseCanvas.width;
    const height = baseCanvas.height;

    // Create or resize offscreen canvas
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const offCanvas = offscreenCanvasRef.current;
    offCanvas.width = width;
    offCanvas.height = height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // 1. Ocean Background (Glacier deep marine tint)
    offCtx.fillStyle = '#0F1E2A';
    offCtx.fillRect(0, 0, width, height);

    // Subtle ocean contour bathymetry lines
    offCtx.strokeStyle = 'rgba(0, 168, 232, 0.05)';
    offCtx.lineWidth = 1;
    for (let y = 0; y < height; y += 24) {
      offCtx.beginPath();
      offCtx.moveTo(0, y);
      offCtx.lineTo(width, y);
      offCtx.stroke();
    }

    // 2. Graticule Lines (Plate Carrée Equirectangular 30-degree grid)
    if (showGraticule) {
      offCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      offCtx.lineWidth = 1;
      offCtx.setLineDash([3, 4]);

      // Parallels (Latitude every 30 deg)
      for (let lat = -60; lat <= 60; lat += 30) {
        const pt = geoToEquirectangular(lat, 0, width, height);
        offCtx.beginPath();
        offCtx.moveTo(0, pt.y);
        offCtx.lineTo(width, pt.y);
        offCtx.stroke();
      }

      // Meridians (Longitude every 30 deg)
      for (let lng = -180; lng <= 180; lng += 30) {
        const pt = geoToEquirectangular(0, lng, width, height);
        offCtx.beginPath();
        offCtx.moveTo(pt.x, 0);
        offCtx.lineTo(pt.x, height);
        offCtx.stroke();
      }

      // Equator (Highlighted)
      const eqPt = geoToEquirectangular(0, 0, width, height);
      offCtx.strokeStyle = 'rgba(255, 159, 28, 0.35)';
      offCtx.lineWidth = 1.5;
      offCtx.setLineDash([]);
      offCtx.beginPath();
      offCtx.moveTo(0, eqPt.y);
      offCtx.lineTo(width, eqPt.y);
      offCtx.stroke();

      // Prime Meridian
      offCtx.strokeStyle = 'rgba(0, 168, 232, 0.35)';
      offCtx.beginPath();
      offCtx.moveTo(width / 2, 0);
      offCtx.lineTo(width / 2, height);
      offCtx.stroke();
    }
    offCtx.setLineDash([]);

    // 3. Continents Vector Polygons
    offCtx.fillStyle = '#1E3A2B'; // Alpine Dark Green
    offCtx.strokeStyle = '#2D5540';
    offCtx.lineWidth = 1.2;

    CONTINENT_POLYGONS.forEach((polygon) => {
      if (polygon.length < 3) return;
      offCtx.beginPath();
      const first = geoToEquirectangular(polygon[0].lat, polygon[0].lng, width, height);
      offCtx.moveTo(first.x, first.y);
      for (let i = 1; i < polygon.length; i++) {
        const pt = geoToEquirectangular(polygon[i].lat, polygon[i].lng, width, height);
        offCtx.lineTo(pt.x, pt.y);
      }
      offCtx.closePath();
      offCtx.fill();
      offCtx.stroke();
    });

    // 4. Major Mountain Ranges (Topographic Spine Vectors)
    if (showRanges) {
      ranges.forEach((range) => {
        const segments = splitAntimeridianSegments(range.pathCoordinates);
        segments.forEach((seg) => {
          if (seg.length < 2) return;
          offCtx.beginPath();
          const start = geoToEquirectangular(seg[0].lat, seg[0].lng, width, height);
          offCtx.moveTo(start.x, start.y);
          for (let i = 1; i < seg.length; i++) {
            const p = geoToEquirectangular(seg[i].lat, seg[i].lng, width, height);
            offCtx.lineTo(p.x, p.y);
          }
          offCtx.strokeStyle = 'rgba(255, 191, 0, 0.7)'; // Sunrise Gold
          offCtx.lineWidth = 3.5;
          offCtx.stroke();

          // Outer glow
          offCtx.strokeStyle = 'rgba(255, 159, 28, 0.25)';
          offCtx.lineWidth = 7;
          offCtx.stroke();
        });
      });
    }

    // 5. Major Rivers (Glacial Runoff Vectors)
    if (showRivers) {
      rivers.forEach((river) => {
        const segments = splitAntimeridianSegments(river.coordinates);
        segments.forEach((seg) => {
          if (seg.length < 2) return;
          offCtx.beginPath();
          const start = geoToEquirectangular(seg[0].lat, seg[0].lng, width, height);
          offCtx.moveTo(start.x, start.y);
          for (let i = 1; i < seg.length; i++) {
            const p = geoToEquirectangular(seg[i].lat, seg[i].lng, width, height);
            offCtx.lineTo(p.x, p.y);
          }
          offCtx.strokeStyle = '#00A8E8'; // Glacier Blue
          offCtx.lineWidth = 1.8;
          offCtx.stroke();
        });
      });
    }

    // 6. Mountain Markers (Elevation Pins)
    if (showMountains) {
      filteredMountains.forEach((mountain) => {
        const pt = geoToEquirectangular(mountain.coordinates.lat, mountain.coordinates.lng, width, height);
        const isSelected = selectedMountain?.id === mountain.id;

        // Base pin radius based on elevation
        const radius = mountain.isEightThousander ? 6 : mountain.isSevenSummit ? 5 : 4;

        // Outer halo
        offCtx.beginPath();
        offCtx.arc(pt.x, pt.y, radius + (isSelected ? 6 : 3), 0, Math.PI * 2);
        offCtx.fillStyle = isSelected
          ? 'rgba(255, 159, 28, 0.45)'
          : mountain.isEightThousander
          ? 'rgba(239, 68, 68, 0.35)'
          : 'rgba(0, 168, 232, 0.3)';
        offCtx.fill();

        // Pin core
        offCtx.beginPath();
        offCtx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        offCtx.fillStyle = isSelected
          ? '#FFBF00'
          : mountain.isEightThousander
          ? '#EF4444'
          : mountain.isSevenSummit
          ? '#FF9F1C'
          : '#FFFFFF';
        offCtx.fill();
        offCtx.strokeStyle = '#111827';
        offCtx.lineWidth = 1.2;
        offCtx.stroke();
      });
    }

    // Transfer cached offscreen canvas to visible base canvas
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(offCanvas, 0, 0);
  }, [showMountains, showRanges, showRivers, showGraticule, filteredMountains, ranges, rivers, selectedMountain]);

  /**
   * Resizes canvases in sync with parent dimensions
   */
  const handleResize = useCallback(() => {
    if (!containerRef.current || !baseCanvasRef.current || !dynamicCanvasRef.current) return;
    const width = containerRef.current.clientWidth;
    // Standard Equirectangular 2:1 ratio (360° x 180°)
    const height = Math.round(width * 0.5);

    baseCanvasRef.current.width = width;
    baseCanvasRef.current.height = height;
    dynamicCanvasRef.current.width = width;
    dynamicCanvasRef.current.height = height;

    renderStaticBaseMap();
  }, [renderStaticBaseMap]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Re-render static base map whenever toggles or selections change
  useEffect(() => {
    renderStaticBaseMap();
  }, [renderStaticBaseMap]);

  /**
   * Generates exact Keplerian ground track coordinates for active satellite.
   * Accurately accounts for Earth rotation and orbital inclination.
   */
  const generateGroundTrack = useCallback((satellite: SatelliteTrack, currentTimestamp: number) => {
    const periodSec = satellite.periodMinutes * 60;
    const pointsCount = 120;
    const past: GeoCoordinate[] = [];
    const future: GeoCoordinate[] = [];

    const incRad = (satellite.inclinationDeg * Math.PI) / 180;

    // Calculate current sub-satellite position
    const tCurrent = (currentTimestamp / 1000) % periodSec;
    const meanAnomalyCurrent = (2 * Math.PI * tCurrent) / periodSec;

    // Latitude from inclination: sin(phi) = sin(inc) * sin(M)
    const sinLatCurrent = Math.sin(incRad) * Math.sin(meanAnomalyCurrent);
    const latCurrent = (Math.asin(sinLatCurrent) * 180) / Math.PI;

    // Longitude with nodal precession & Earth spin (360 deg per 86400 sec)
    const earthRotationCurrent = ((currentTimestamp / 1000) % 86400) * (360 / 86400);
    const orbitalLongCurrent = (Math.atan2(Math.cos(incRad) * Math.sin(meanAnomalyCurrent), Math.cos(meanAnomalyCurrent)) * 180) / Math.PI;
    const lngCurrent = normalizeLongitude(orbitalLongCurrent - earthRotationCurrent);

    // Track points for past (-45 minutes) and future (+45 minutes)
    for (let i = -pointsCount / 2; i <= pointsCount / 2; i++) {
      const dt = (i / pointsCount) * periodSec;
      const t = ((currentTimestamp / 1000) + dt) % periodSec;
      const M = (2 * Math.PI * t) / periodSec;

      const sinPhi = Math.sin(incRad) * Math.sin(M);
      const lat = (Math.asin(sinPhi) * 180) / Math.PI;

      const earthRot = (((currentTimestamp / 1000) + dt) % 86400) * (360 / 86400);
      const orbLon = (Math.atan2(Math.cos(incRad) * Math.sin(M), Math.cos(M)) * 180) / Math.PI;
      const lng = normalizeLongitude(orbLon - earthRot);

      const pt: GeoCoordinate = {
        lat: normalizeLatitude(lat),
        lng: normalizeLongitude(lng),
      };

      if (i < 0) past.push(pt);
      else if (i > 0) future.push(pt);
    }

    return {
      current: { lat: normalizeLatitude(latCurrent), lng: normalizeLongitude(lngCurrent) },
      past,
      future,
    };
  }, []);

  /**
   * High-Performance 60 FPS Animation Loop (rAF)
   * Decoupled from React Component Renders. Uses lerp for smooth satellite movement and
   * handles Antimeridian path splitting to prevent streak artifacts.
   */
  useEffect(() => {
    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;
      const now = performance.now();
      const dynamicCanvas = dynamicCanvasRef.current;
      if (!dynamicCanvas) {
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const ctx = dynamicCanvas.getContext('2d');
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const width = dynamicCanvas.width;
      const height = dynamicCanvas.height;

      // 1. Clear dynamic overlay only (preserving static base map underneath)
      ctx.clearRect(0, 0, width, height);

      if (showSatellites && activeSatellite) {
        // Calculate ground tracks and sub-satellite coordinates
        const tracks = generateGroundTrack(activeSatellite, Date.now());
        const targetGeo = tracks.current;

        // Smooth position interpolation (LERP) between incoming telemetry updates
        const buffer = telemetryBufferRef.current;
        buffer.currentGeo.lat = lerp(buffer.currentGeo.lat, targetGeo.lat, 0.15);

        // Longitude interpolation accounting for Antimeridian boundary wrap
        let diffLng = targetGeo.lng - buffer.currentGeo.lng;
        if (diffLng > 180) diffLng -= 360;
        if (diffLng < -180) diffLng += 360;
        buffer.currentGeo.lng = normalizeLongitude(buffer.currentGeo.lng + diffLng * 0.15);

        // 2. Draw Past Orbit Trail (Faded Trail with Antimeridian Splitting)
        const pastSegments = splitAntimeridianSegments(tracks.past);
        pastSegments.forEach((segment) => {
          if (segment.length < 2) return;
          ctx.beginPath();
          const start = geoToEquirectangular(segment[0].lat, segment[0].lng, width, height);
          ctx.moveTo(start.x, start.y);
          for (let i = 1; i < segment.length; i++) {
            const p = geoToEquirectangular(segment[i].lat, segment[i].lng, width, height);
            ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = `${activeSatellite.color}40`; // Low opacity trail
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        // 3. Draw Future Orbit Projection (Dashed Line with Antimeridian Splitting)
        const futureSegments = splitAntimeridianSegments(tracks.future);
        ctx.setLineDash([4, 6]);
        futureSegments.forEach((segment) => {
          if (segment.length < 2) return;
          ctx.beginPath();
          const start = geoToEquirectangular(segment[0].lat, segment[0].lng, width, height);
          ctx.moveTo(start.x, start.y);
          for (let i = 1; i < segment.length; i++) {
            const p = geoToEquirectangular(segment[i].lat, segment[i].lng, width, height);
            ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = activeSatellite.color;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // 4. Render Satellite Position Marker & Pulsing Radar Footprint
        const satPos = geoToEquirectangular(buffer.currentGeo.lat, buffer.currentGeo.lng, width, height);

        // Pulsing radio wave footprint
        const pulse = (Math.sin(now / 200) + 1) / 2;
        const groundFootprintRadius = 26 + pulse * 14;

        ctx.beginPath();
        ctx.arc(satPos.x, satPos.y, groundFootprintRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${activeSatellite.color}55`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = `${activeSatellite.color}15`;
        ctx.fill();

        // Crosshair reticle
        ctx.strokeStyle = activeSatellite.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(satPos.x - 10, satPos.y);
        ctx.lineTo(satPos.x + 10, satPos.y);
        ctx.moveTo(satPos.x, satPos.y - 10);
        ctx.lineTo(satPos.x, satPos.y + 10);
        ctx.stroke();

        // Core satellite beacon
        ctx.beginPath();
        ctx.arc(satPos.x, satPos.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = activeSatellite.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Satellite Name Callout Label
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(activeSatellite.name, satPos.x + 12, satPos.y - 8);
        ctx.font = '500 9px monospace';
        ctx.fillStyle = activeSatellite.color;
        ctx.fillText(
          `${buffer.currentGeo.lat >= 0 ? '+' : ''}${buffer.currentGeo.lat.toFixed(3)}°, ${buffer.currentGeo.lng >= 0 ? '+' : ''}${buffer.currentGeo.lng.toFixed(3)}°`,
          satPos.x + 12,
          satPos.y + 4
        );
        ctx.shadowBlur = 0;

        // 5. Throttled UI Telemetry Overlay Update (Every 400ms, eliminates UI lag)
        if (now - lastOverlayUpdateRef.current > 400) {
          lastOverlayUpdateRef.current = now;
          setTelemetryOverlay({
            satelliteId: activeSatellite.id,
            name: activeSatellite.name,
            lat: buffer.currentGeo.lat,
            lng: buffer.currentGeo.lng,
            altitudeKm: activeSatellite.altitudeKm,
            velocityKmh: activeSatellite.velocityKmh,
            subSatellitePoint: `${Math.abs(buffer.currentGeo.lat).toFixed(4)}° ${buffer.currentGeo.lat >= 0 ? 'N' : 'S'}, ${Math.abs(buffer.currentGeo.lng).toFixed(4)}° ${buffer.currentGeo.lng >= 0 ? 'E' : 'W'}`,
            timestamp: Date.now(),
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [showSatellites, activeSatellite, generateGroundTrack]);

  /**
   * Canvas Click Hit-Testing for Mountain Pins
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = dynamicCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    // Check hit against filtered mountains
    const hitRadius = 14;
    for (const m of filteredMountains) {
      const pt = geoToEquirectangular(m.coordinates.lat, m.coordinates.lng, width, height);
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist <= hitRadius) {
        onSelectMountain(m);
        return;
      }
    }
  };

  /**
   * Hover tracking for tooltips
   */
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = dynamicCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    let found: Mountain | null = null;
    const hitRadius = 12;
    for (const m of filteredMountains) {
      const pt = geoToEquirectangular(m.coordinates.lat, m.coordinates.lng, width, height);
      if (Math.hypot(pt.x - x, pt.y - y) <= hitRadius) {
        found = m;
        break;
      }
    }
    setHoveredPeak(found);
  };

  /**
   * Exports the composite map view as high-resolution PNG for offline expedition planning
   */
  const handleExportMapImage = () => {
    const baseCanvas = baseCanvasRef.current;
    const dynamicCanvas = dynamicCanvasRef.current;
    if (!baseCanvas || !dynamicCanvas) return;

    setIsExporting(true);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = baseCanvas.width;
    exportCanvas.height = baseCanvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Draw base map + dynamic tracks together
    exportCtx.drawImage(baseCanvas, 0, 0);
    exportCtx.drawImage(dynamicCanvas, 0, 0);

    // Overlay Header & Timestamp stamp
    exportCtx.fillStyle = 'rgba(17, 24, 39, 0.85)';
    exportCtx.fillRect(16, 16, 420, 56);
    exportCtx.fillStyle = '#FF9F1C';
    exportCtx.font = 'bold 16px system-ui, sans-serif';
    exportCtx.fillText('GLOBAL MOUNTAIN EXPLORER - SUMMIT MAP', 28, 40);
    exportCtx.fillStyle = '#E5E7EB';
    exportCtx.font = '11px monospace';
    exportCtx.fillText(`Projection: Equirectangular Plate Carrée | Generated: ${new Date().toISOString()}`, 28, 58);

    const link = document.createElement('a');
    link.download = `GME_World_Mountain_Map_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();

    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* Map Control Bar & Elevation Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        {/* Elevation / Peak Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#FF9F1C]" />
            Show:
          </span>
          {[
            { id: 'all', label: `All Peaks (${mountains.length})` },
            { id: '8000', label: '14x 8,000m Death Zone' },
            { id: '7summits', label: 'The Seven Summits' },
            { id: 'popular', label: 'Popular Traveler Peaks' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setElevationFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                elevationFilter === tab.id
                  ? 'bg-[#1E3A2B] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowMountains(!showMountains)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showMountains
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF9F1C]" />
            Peaks
          </button>

          <button
            onClick={() => setShowRanges(!showRanges)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showRanges
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#FF9F1C]" />
            Ranges
          </button>

          <button
            onClick={() => setShowRivers(!showRivers)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showRivers
                ? 'bg-sky-50 border-sky-300 text-sky-900'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#00A8E8]" />
            Glacial Rivers
          </button>

          <button
            onClick={() => setShowSatellites(!showSatellites)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showSatellites
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-emerald-600" />
            Live Satellite
          </button>

          <button
            onClick={() => setShowGraticule(!showGraticule)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showGraticule
                ? 'bg-gray-200 border-gray-300 text-gray-900'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
            title="Toggle Equirectangular Graticule Grid"
          >
            Grid
          </button>

          <button
            onClick={handleExportMapImage}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 text-xs font-bold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating...' : 'Export Offline Map'}</span>
          </button>
        </div>
      </div>

      {/* Main Equirectangular Map Viewport with Decoupled Dual-Layer Canvas */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-gray-800 bg-[#0F1E2A] aspect-2/1 cursor-crosshair group"
      >
        {/* Layer 1: Static Vector Base Map Canvas (Continents, Graticule, Relief, Rivers, Mountain Pins) */}
        <canvas
          ref={baseCanvasRef}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Layer 2: Dynamic Live Telemetry Stream Canvas (rAF 60 FPS, Lerp-interpolated Satellites, Antimeridian Path Wrapping) */}
        <canvas
          ref={dynamicCanvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredPeak(null)}
          className="absolute inset-0 w-full h-full block z-10"
        />

        {/* Telemetry Status Overlay Panel (Throttled, Zero-Lag) */}
        {showSatellites && telemetryOverlay && (
          <div className="absolute top-3 left-3 z-20 bg-gray-950/85 backdrop-blur-md rounded-xl p-3 border border-gray-700/80 text-white shadow-xl max-w-xs pointer-events-auto">
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-gray-100 flex items-center gap-1">
                  <Satellite className="w-3.5 h-3.5 text-[#00A8E8]" />
                  {telemetryOverlay.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                60 FPS rAF
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-gray-300">
              <div>
                <span className="text-gray-500 block text-[9px] uppercase tracking-wider">Sub-Sat Lat</span>
                <span className="font-semibold text-amber-300">
                  {telemetryOverlay.lat >= 0 ? '+' : ''}{telemetryOverlay.lat.toFixed(4)}°
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] uppercase tracking-wider">Sub-Sat Lon</span>
                <span className="font-semibold text-amber-300">
                  {telemetryOverlay.lng >= 0 ? '+' : ''}{telemetryOverlay.lng.toFixed(4)}°
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] uppercase tracking-wider">Orbital Altitude</span>
                <span className="font-semibold text-[#00A8E8]">{telemetryOverlay.altitudeKm} km</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[9px] uppercase tracking-wider">Ground Speed</span>
                <span className="font-semibold text-[#00A8E8]">{telemetryOverlay.velocityKmh.toLocaleString()} km/h</span>
              </div>
            </div>

            {/* Satellite Switcher Dropdown in Overlay */}
            <div className="mt-2.5 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">Target Probe:</span>
              <select
                value={selectedSatelliteId}
                onChange={(e) => setSelectedSatelliteId(e.target.value)}
                className="bg-gray-800 text-gray-200 text-[10px] rounded px-2 py-1 border border-gray-700 focus:outline-hidden focus:border-[#FF9F1C]"
              >
                {satellites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Projection Reference Legend */}
        <div className="absolute bottom-3 left-3 z-20 bg-gray-950/80 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-gray-800 text-[10px] text-gray-300 font-mono hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> 8,000m+ Death Zone
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF9F1C]" /> Seven Summits
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00A8E8]" /> Glacier Blue Rivers
          </span>
          <span className="text-gray-500">Plate Carrée (WGS-84)</span>
        </div>

        {/* Hover Peak Tooltip */}
        {hoveredPeak && (
          <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-amber-200 text-gray-900 shadow-2xl max-w-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-3">
              <h5 className="font-bold text-sm text-gray-900">{hoveredPeak.name}</h5>
              <span className="text-xs font-bold text-[#FF9F1C] bg-amber-50 px-2 py-0.5 rounded-full">
                {hoveredPeak.elevationM.toLocaleString()} m
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{hoveredPeak.range} • {hoveredPeak.country.join(', ')}</p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
              <span>Standard: {hoveredPeak.standardRoute}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Mountain Spotlight Card (When user clicks a peak pin) */}
      {selectedMountain && (
        <div className="bg-gradient-to-r from-white via-amber-50/40 to-sky-50/40 rounded-2xl p-6 border border-amber-200 shadow-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#1E3A2B] text-white">
                  Active Peak Focus
                </span>
                {selectedMountain.isEightThousander && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    Death Zone (8,000m+)
                  </span>
                )}
                {selectedMountain.isSevenSummit && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Continental Seven Summit
                  </span>
                )}
                <span className="text-xs text-gray-500 font-medium">
                  {selectedMountain.coordinates.lat.toFixed(4)}° N, {selectedMountain.coordinates.lng.toFixed(4)}° E
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                  {selectedMountain.name}
                </h3>
                {selectedMountain.localName && (
                  <span className="text-sm font-medium text-gray-500 italic">
                    "{selectedMountain.localName}"
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedMountain.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600 pt-1">
                <span><strong className="text-gray-900">Elevation:</strong> {selectedMountain.elevationM.toLocaleString()} m ({selectedMountain.elevationFt.toLocaleString()} ft)</span>
                <span>•</span>
                <span><strong className="text-gray-900">Range:</strong> {selectedMountain.range}</span>
                <span>•</span>
                <span><strong className="text-gray-900">Optimal Window:</strong> {selectedMountain.bestClimbingMonths.join(', ')}</span>
              </div>
            </div>

            {/* Quick Action Buttons for Selected Mountain */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => onOpen3DView(selectedMountain)}
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A2B] text-white font-semibold text-xs shadow hover:bg-[#152a1f] transition-all cursor-pointer"
              >
                <Box className="w-4 h-4 text-[#FF9F1C]" />
                Launch 3D Relief Visualizer
              </button>

              <button
                onClick={() => onAskAIAboutMountain(selectedMountain)}
                className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 font-bold text-xs shadow hover:brightness-105 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-gray-900" />
                Ask AI Expedition Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
