import React, { useState } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ConsentModal } from './components/common/ConsentModal';
import { EquirectangularMap } from './components/map/EquirectangularMap';
import { ThreeDTerrainVisualizer } from './components/map/ThreeDTerrainVisualizer';
import { MountainDatabase } from './components/explorer/MountainDatabase';
import { PreparationHub } from './components/logistics/PreparationHub';
import { TravelLodgingDirectory } from './components/directory/TravelLodgingDirectory';
import { SeasonalityTracker } from './components/calendar/SeasonalityTracker';
import { ExpeditionAssistant } from './components/ai/ExpeditionAssistant';
import { SettingsModal } from './components/SettingsModal';
import {
  GLOBAL_MOUNTAINS,
  MAJOR_MOUNTAIN_RANGES,
  MAJOR_RIVERS,
  SATELLITE_ORBITS,
} from './data/mountainsData';
import { Mountain } from './types/mountain';
import { Sparkles, Compass, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(GLOBAL_MOUNTAINS[0]);
  const [threeDMountain, setThreeDMountain] = useState<Mountain | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Consent Modal State
  const [consentModalState, setConsentModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    targetUrl?: string;
    type?: 'external_link' | 'geolocation' | 'ai_query';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Nearest Peak Alert notification
  const [nearestPeakNotice, setNearestPeakNotice] = useState<string | null>(null);

  /**
   * Prompts user with explicit consent before opening external partner/hotel links
   */
  const handleRequestExternalLink = (url: string, name: string) => {
    setConsentModalState({
      isOpen: true,
      title: `Navigate to External Platform`,
      message: `You are about to leave Global Mountain Explorer to visit "${name}". Please review their privacy policy and terms before making reservations or submitting personal credentials.`,
      targetUrl: url,
      type: 'external_link',
      onConfirm: () => {
        setConsentModalState((prev) => ({ ...prev, isOpen: false }));
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    });
  };

  /**
   * Requests geolocation only after explicit user consent
   */
  const handleRequestGeolocation = () => {
    setConsentModalState({
      isOpen: true,
      title: 'Location Services Consent',
      message: 'Global Mountain Explorer requests temporary access to your device coordinates strictly to compute geographic proximity to global mountain summits. Your location is processed locally in-browser and never persisted or shared.',
      type: 'geolocation',
      onConfirm: () => {
        setConsentModalState((prev) => ({ ...prev, isOpen: false }));
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userLat = pos.coords.latitude;
              const userLng = pos.coords.longitude;

              // Compute distance to closest peak (Haversine formula approximation)
              let closest: Mountain = GLOBAL_MOUNTAINS[0];
              let minDistKm = Infinity;

              GLOBAL_MOUNTAINS.forEach((m) => {
                const dLat = ((m.coordinates.lat - userLat) * Math.PI) / 180;
                const dLng = ((m.coordinates.lng - userLng) * Math.PI) / 180;
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos((userLat * Math.PI) / 180) *
                    Math.cos((m.coordinates.lat * Math.PI) / 180) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distKm = 6371 * c;
                if (distKm < minDistKm) {
                  minDistKm = distKm;
                  closest = m;
                }
              });

              setSelectedMountain(closest);
              setNearestPeakNotice(`Closest catalog peak to your coordinates is ${closest.name} (~${Math.round(minDistKm).toLocaleString()} km away).`);
              setTimeout(() => setNearestPeakNotice(null), 8000);
            },
            (err) => {
              console.warn('Geolocation denied or unavailable:', err);
              setNearestPeakNotice('Unable to acquire location coordinates. Switched back to default Everest focus.');
              setTimeout(() => setNearestPeakNotice(null), 6000);
            }
          );
        }
      },
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827] font-sans selection:bg-[#FF9F1C]/30 selection:text-gray-950">
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'ai-assistant') {
              setIsAIAssistantOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          mountains={GLOBAL_MOUNTAINS}
          onSelectMountain={(m) => {
            setSelectedMountain(m);
            setActiveTab('database');
          }}
          onRequestGeolocation={handleRequestGeolocation}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Nearest Peak Toast Notice */}
        {nearestPeakNotice && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-amber-950 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF9F1C] shrink-0" />
                <span>{nearestPeakNotice}</span>
              </div>
              <button
                onClick={() => setNearestPeakNotice(null)}
                className="text-amber-800 font-bold hover:underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* 1. Global Interactive Map & Satellites Tab */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#FF9F1C] text-gray-950">
                      Real-Time Map Engine
                    </span>
                    <span className="text-xs text-gray-500 font-mono">Equirectangular (Plate Carrée)</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1 tracking-tight">
                    Global Mountain & Live Satellite Vector Map
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Continuous 60 FPS rAF ground-track simulation with antimeridian boundary wrapping, glacial runoff vectors, and 14 8,000m summits.
                  </p>
                </div>
              </div>

              <EquirectangularMap
                mountains={GLOBAL_MOUNTAINS}
                ranges={MAJOR_MOUNTAIN_RANGES}
                rivers={MAJOR_RIVERS}
                satellites={SATELLITE_ORBITS}
                selectedMountain={selectedMountain}
                onSelectMountain={(m) => setSelectedMountain(m)}
                onOpen3DView={(m) => setThreeDMountain(m)}
                onAskAIAboutMountain={(m) => {
                  setSelectedMountain(m);
                  setIsAIAssistantOpen(true);
                }}
              />
            </div>
          )}

          {/* 2. Mountain Database & Seven Summits Tab */}
          {activeTab === 'database' && (
            <MountainDatabase
              mountains={GLOBAL_MOUNTAINS}
              ranges={MAJOR_MOUNTAIN_RANGES}
              selectedMountain={selectedMountain}
              onSelectMountain={(m) => setSelectedMountain(m)}
              onOpen3DView={(m) => setThreeDMountain(m)}
              onAskAIAboutMountain={(m) => {
                setSelectedMountain(m);
                setIsAIAssistantOpen(true);
              }}
            />
          )}

          {/* 3. Preparation, Training & Budget Hub */}
          {activeTab === 'logistics' && <PreparationHub />}

          {/* 4. Travel, Lodging & Tour Directory */}
          {activeTab === 'directory' && (
            <TravelLodgingDirectory onRequestExternalLink={handleRequestExternalLink} />
          )}

          {/* 5. Seasonality & Calendar */}
          {activeTab === 'calendar' && <SeasonalityTracker />}
        </main>

        {/* Floating AI Expedition Assistant Launcher Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#FF9F1C] via-[#FFBF00] to-[#00A8E8] text-gray-950 font-black text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/40"
          >
            <Sparkles className="w-4 h-4 fill-gray-950" />
            <span>AI Expedition Agent</span>
            {selectedMountain && (
              <span className="hidden sm:inline bg-black/10 px-2 py-0.5 rounded-full text-[11px]">
                {selectedMountain.name}
              </span>
            )}
          </button>
        </div>

        {/* 3D Isometric Terrain Visualizer Modal */}
        {threeDMountain && (
          <ThreeDTerrainVisualizer
            mountain={threeDMountain}
            onClose={() => setThreeDMountain(null)}
            onAskAI={(m) => {
              setSelectedMountain(m);
              setThreeDMountain(null);
              setIsAIAssistantOpen(true);
            }}
          />
        )}

        {/* Embedded AI Expedition Assistant Slide-Over Drawer */}
        <ExpeditionAssistant
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          selectedMountain={selectedMountain}
          onClearSelectedMountain={() => setSelectedMountain(null)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* User-facing Platform & AI Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onKeyUpdated={() => {}}
        />

        {/* Explicit Consent Guard Modal */}
        <ConsentModal
          isOpen={consentModalState.isOpen}
          title={consentModalState.title}
          message={consentModalState.message}
          targetUrl={consentModalState.targetUrl}
          type={consentModalState.type}
          onConfirm={consentModalState.onConfirm}
          onCancel={() => setConsentModalState((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Global Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
