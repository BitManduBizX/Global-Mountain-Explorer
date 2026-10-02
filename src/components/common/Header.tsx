import React, { useState } from 'react';
import { Compass, Search, Map, Mountain as MountainIcon, BookOpen, Hotel, Calendar, Sparkles, Navigation, X } from 'lucide-react';
import { Mountain } from '../../types/mountain';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mountains: Mountain[];
  onSelectMountain: (mountain: Mountain) => void;
  onRequestGeolocation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  mountains,
  onSelectMountain,
  onRequestGeolocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredQuickMountains = searchQuery.trim()
    ? mountains
        .filter(
          (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.country.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
            m.range.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const navItems = [
    { id: 'map', label: 'Interactive Map & 3D', icon: Map },
    { id: 'database', label: 'Peaks & Ranges', icon: MountainIcon },
    { id: 'logistics', label: 'Prep, Training & Budget', icon: BookOpen },
    { id: 'directory', label: 'Tours & Lodges', icon: Hotel },
    { id: 'calendar', label: 'Seasonality & Events', icon: Calendar },
    { id: 'ai-assistant', label: 'AI Expedition Agent', icon: Sparkles, badge: 'Gemini' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E3A2B] via-[#0E271B] to-[#1E3A2B] text-white py-2 px-4 text-xs font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F1C] text-gray-950 uppercase tracking-wider">
              Free Public Access
            </span>
            <span className="text-amber-200 font-semibold">Zero Cost & No Registration:</span>
            <span className="text-gray-200 hidden sm:inline">
              Discover peaks near you, calculate your climbing budget, or chat with our AI Expedition Agent!
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRequestGeolocation}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
              title="Find nearest mountains to current location"
            >
              <Navigation className="w-3.5 h-3.5 text-[#FF9F1C]" />
              <span className="hidden md:inline">Nearest Peaks</span>
            </button>
            <span className="text-gray-400 hidden lg:inline">|</span>
            <span className="text-xs text-gray-300 hidden lg:inline">HD Premium Light Theme</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo Branding */}
          <div
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF9F1C] to-[#00A8E8] p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#1E3A2B] rounded-[10px] flex items-center justify-center text-white">
                <Compass className="w-6 h-6 text-[#FFBF00] animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-gray-950">
                  Global Mountain
                </span>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#FF9F1C] to-[#00A8E8] bg-clip-text text-transparent">
                  Explorer
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">
                Worldwide Summit Intelligence
              </p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Quick search peaks, ranges, countries (e.g., Everest, Matterhorn)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-gray-100/80 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:bg-white focus:border-[#FF9F1C] focus:ring-2 focus:ring-[#FF9F1C]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Search Dropdown */}
            {searchFocused && filteredQuickMountains.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 divide-y divide-gray-100">
                {filteredQuickMountains.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectMountain(m);
                      setSearchQuery('');
                      setSearchFocused(false);
                      setActiveTab('database');
                    }}
                    className="p-3 hover:bg-amber-50/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                        {m.name}
                        {m.isEightThousander && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                            8,000m+
                          </span>
                        )}
                        {m.isSevenSummit && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">
                            7 Summits
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {m.range} • {m.country.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#1E3A2B]">{m.elevationM.toLocaleString()} m</span>
                      <div className="text-[11px] text-gray-400">{m.elevationFt.toLocaleString()} ft</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A2B] text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF9F1C]' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#FF9F1C] to-[#00A8E8] text-white font-extrabold uppercase">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 border-t border-gray-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#1E3A2B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF9F1C]' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
