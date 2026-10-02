import React, { useState, useMemo } from 'react';
import {
  Mountain as MountainIcon,
  Search,
  Filter,
  Award,
  Compass,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Box,
  MapPin,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Mountain, MountainRange } from '../../types/mountain';

interface MountainDatabaseProps {
  mountains: Mountain[];
  ranges: MountainRange[];
  selectedMountain: Mountain | null;
  onSelectMountain: (m: Mountain) => void;
  onOpen3DView: (m: Mountain) => void;
  onAskAIAboutMountain: (m: Mountain) => void;
}

export const MountainDatabase: React.FC<MountainDatabaseProps> = ({
  mountains,
  ranges,
  selectedMountain,
  onSelectMountain,
  onOpen3DView,
  onAskAIAboutMountain,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [elevationBracket, setElevationBracket] = useState<string>('All');
  const [selectedRangeFilter, setSelectedRangeFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'seven-summits' | 'eight-thousanders' | 'popular' | 'ranges'>('all');

  // Detail Modal for Mountain
  const [modalMountain, setModalMountain] = useState<Mountain | null>(null);

  // Continents list
  const continents = ['All', 'Asia', 'South America', 'North America', 'Africa', 'Europe', 'Antarctica', 'Oceania'];

  // Difficulties
  const difficulties = [
    'All',
    'Walk-up / Trek',
    'Scramble',
    'Technical Alpine',
    'Extreme High-Altitude (Death Zone)',
  ];

  // Elevation brackets
  const elevationBrackets = [
    { label: 'All Elevations', value: 'All' },
    { label: 'Death Zone (8,000m+)', value: '8000+' },
    { label: 'High Altitude (6,000m - 7,999m)', value: '6000-8000' },
    { label: 'Sub-Alpine (3,000m - 5,999m)', value: '3000-6000' },
    { label: 'Trekking & Foothills (< 3,000m)', value: '<3000' },
  ];

  // Filtered mountains
  const filteredMountains = useMemo(() => {
    return mountains.filter((m) => {
      // Tab filter
      if (activeTab === 'seven-summits' && !m.isSevenSummit) return false;
      if (activeTab === 'eight-thousanders' && !m.isEightThousander) return false;
      if (activeTab === 'popular' && !m.isPopular) return false;

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = m.name.toLowerCase().includes(query);
        const matchLocal = m.localName?.toLowerCase().includes(query);
        const matchCountry = m.country.some((c) => c.toLowerCase().includes(query));
        const matchRange = m.range.toLowerCase().includes(query);
        if (!matchName && !matchLocal && !matchCountry && !matchRange) return false;
      }

      // Continent filter
      if (selectedContinent !== 'All' && m.continent !== selectedContinent) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'All' && m.difficulty !== selectedDifficulty) return false;

      // Range filter
      if (selectedRangeFilter !== 'All' && !m.range.toLowerCase().includes(selectedRangeFilter.toLowerCase())) return false;

      // Elevation Bracket
      if (elevationBracket === '8000+' && m.elevationM < 8000) return false;
      if (elevationBracket === '6000-8000' && (m.elevationM < 6000 || m.elevationM >= 8000)) return false;
      if (elevationBracket === '3000-6000' && (m.elevationM < 3000 || m.elevationM >= 6000)) return false;
      if (elevationBracket === '<3000' && m.elevationM >= 3000) return false;

      return true;
    });
  }, [
    mountains,
    searchTerm,
    selectedContinent,
    selectedDifficulty,
    elevationBracket,
    selectedRangeFilter,
    activeTab,
  ]);

  // Seven Summits list for dedicated showcase
  const sevenSummits = mountains.filter((m) => m.isSevenSummit);

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 pb-3">
        {[
          { id: 'all', label: `Global Database (${mountains.length})` },
          { id: 'seven-summits', label: 'The Seven Summits' },
          { id: 'eight-thousanders', label: '14 8,000m Death Zone' },
          { id: 'popular', label: 'Curated Popular Peaks' },
          { id: 'ranges', label: 'World Mountain Ranges & Lengths' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#1E3A2B] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Seven Summits Special Showcase Banner (When on Seven Summits tab) */}
      {activeTab === 'seven-summits' && (
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-white rounded-3xl p-6 sm:p-8 border border-amber-300/80 shadow-md">
          <div className="max-w-3xl space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C] text-gray-950 font-black text-xs uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              The Mountaineering Crown
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              The Seven Continental Summits
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              First completed in 1985 by Richard Bass, the Seven Summits challenge consists of reaching the highest peak of each of the seven continents. Spanning from the equator to Antarctica’s sub-zero ice sheets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sevenSummits.map((summit) => (
              <div
                key={summit.id}
                onClick={() => {
                  onSelectMountain(summit);
                  setModalMountain(summit);
                }}
                className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
                    <span>{summit.continent}</span>
                    <span className="font-mono text-gray-500">#{summit.elevationM}m</span>
                  </div>
                  <h4 className="font-bold text-base text-gray-900 group-hover:text-[#FF9F1C] transition-colors">
                    {summit.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{summit.range}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1E3A2B]">{summit.elevationM.toLocaleString()} m</span>
                  <span className="text-[#00A8E8] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                    Inspect &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World Mountain Ranges by Length Tab View */}
      {activeTab === 'ranges' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              World Mountain Chains Ranked by Continental Length
            </h3>
            <p className="text-sm text-gray-600">
              Major geological fold and volcanic cordilleras, highest summits, and originating river watersheds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ranges.map((rng) => (
              <div
                key={rng.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1E3A2B] text-white">
                      {rng.continents.join(', ')}
                    </span>
                    <span className="font-mono font-bold text-sm text-[#FF9F1C]">
                      ~{rng.lengthKm.toLocaleString()} km
                    </span>
                  </div>

                  <h4 className="text-xl font-extrabold text-gray-950">{rng.name}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{rng.description}</p>

                  <div className="space-y-1.5 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <strong className="text-gray-900">Highest Peak:</strong> {rng.highestPeak}
                    </div>
                    <div>
                      <strong className="text-gray-900">Countries Spanned:</strong> {rng.countries.slice(0, 4).join(', ')}{rng.countries.length > 4 ? ` +${rng.countries.length - 4} more` : ''}
                    </div>
                    <div>
                      <strong className="text-gray-900">Watersheds:</strong> {rng.majorRivers.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-mono">{rng.pathCoordinates.length} Vector Waypoints</span>
                  <button
                    onClick={() => {
                      setSelectedRangeFilter(rng.name);
                      setActiveTab('all');
                    }}
                    className="text-[#00A8E8] hover:text-[#007ba8] font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    View Peaks in Range &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Mountain Catalog Filter Bar (When on All, Seven Summits, 8000m, or Popular) */}
      {activeTab !== 'ranges' && (
        <>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Text Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by peak name, country, or range..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#FF9F1C] focus:outline-hidden"
                />
              </div>

              {/* Continent Select */}
              <div>
                <select
                  value={selectedContinent}
                  onChange={(e) => setSelectedContinent(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#FF9F1C] focus:outline-hidden font-medium text-gray-700"
                >
                  {continents.map((c) => (
                    <option key={c} value={c}>
                      Continent: {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Select */}
              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#FF9F1C] focus:outline-hidden font-medium text-gray-700"
                >
                  {difficulties.map((d) => (
                    <option key={d} value={d}>
                      Difficulty: {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Elevation Bracket Select */}
              <div>
                <select
                  value={elevationBracket}
                  onChange={(e) => setElevationBracket(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#FF9F1C] focus:outline-hidden font-medium text-gray-700"
                >
                  {elevationBrackets.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Range Filter Indicator */}
            {selectedRangeFilter !== 'All' && (
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 w-fit">
                <span>Filtering by range: <strong>{selectedRangeFilter}</strong></span>
                <button
                  onClick={() => setSelectedRangeFilter('All')}
                  className="text-amber-800 font-bold ml-1 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Showing <strong>{filteredMountains.length}</strong> matching summits
            </span>
            <span>Sorted by Elevation & Topographic Significance</span>
          </div>

          {/* Mountain Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMountains.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMountain(m);
                  setModalMountain(m);
                }}
                className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
              >
                {/* Elevation Accent Banner */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#00A8E8]">
                        {m.continent}
                      </span>
                      {m.isEightThousander && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">
                          8000m Death Zone
                        </span>
                      )}
                      {m.isSevenSummit && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                          7 Summits
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-black text-gray-900 group-hover:text-[#FF9F1C] transition-colors mt-1">
                      {m.name}
                    </h4>
                    {m.localName && (
                      <p className="text-xs text-gray-400 italic line-clamp-1">{m.localName}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-[#1E3A2B]">
                      {m.elevationM.toLocaleString()} m
                    </span>
                    <div className="text-[11px] text-gray-400 font-mono">
                      {m.elevationFt.toLocaleString()} ft
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                  {m.description}
                </p>

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Range:</span>
                    <span className="font-semibold text-gray-800 text-right">{m.range}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Country:</span>
                    <span className="font-semibold text-gray-800">{m.country.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Difficulty:</span>
                    <span className="font-semibold text-amber-700">{m.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Prime Months:</span>
                    <span className="font-semibold text-[#1E3A2B]">{m.bestClimbingMonths.slice(0, 3).join(', ')}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen3DView(m);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-[#1E3A2B] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Box className="w-3.5 h-3.5 text-[#FF9F1C]" />
                    3D View
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAIAboutMountain(m);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF9F1C] hover:text-[#e0890f] p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Briefing
                  </button>

                  <span className="text-xs font-bold text-[#00A8E8] group-hover:translate-x-1 transition-transform ml-auto">
                    Details &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mountain Deep-Dive Modal */}
      {modalMountain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#1E3A2B] to-[#14291e] text-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF9F1C] text-gray-950">
                    {modalMountain.continent}
                  </span>
                  {modalMountain.isEightThousander && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                      8000m Death Zone
                    </span>
                  )}
                  {modalMountain.isSevenSummit && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-gray-950">
                      Seven Summit
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black">{modalMountain.name}</h3>
                {modalMountain.localName && (
                  <p className="text-xs text-amber-200 italic mt-0.5">{modalMountain.localName}</p>
                )}
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-amber-300">
                  {modalMountain.elevationM.toLocaleString()} m
                </span>
                <div className="text-xs text-gray-300">{modalMountain.elevationFt.toLocaleString()} ft</div>
                <button
                  onClick={() => setModalMountain(null)}
                  className="mt-2 text-xs text-gray-400 hover:text-white underline cursor-pointer"
                >
                  Close [ESC]
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <p className="text-gray-700 leading-relaxed">{modalMountain.description}</p>

              {/* Highlights */}
              <div>
                <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 text-[#00A8E8]">
                  Key Topographic & Route Highlights
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modalMountain.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl text-xs text-gray-800 border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-[#FF9F1C] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logistics & Permits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">Standard Ascent Route:</span>
                  <span className="font-bold text-gray-900">{modalMountain.standardRoute}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">Difficulty Grade:</span>
                  <span className="font-bold text-amber-900">{modalMountain.difficulty}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">First Ascent Record:</span>
                  <span className="font-medium text-gray-800">
                    {modalMountain.firstAscent.year} ({modalMountain.firstAscent.climbers})
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block mb-0.5">Optimal Window:</span>
                  <span className="font-bold text-[#1E3A2B]">{modalMountain.bestClimbingMonths.join(', ')}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500 font-semibold block mb-0.5">Permits & Royalties:</span>
                  <span className="font-medium text-gray-800">{modalMountain.permitRequirements}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500 font-semibold block mb-0.5">Estimated Expedition Budget (USD):</span>
                  <span className="font-extrabold text-[#1E3A2B]">
                    ${modalMountain.estimatedBudgetUSD.low.toLocaleString()} - ${modalMountain.estimatedBudgetUSD.high.toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => {
                  const m = modalMountain;
                  setModalMountain(null);
                  onOpen3DView(m);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-800 hover:bg-gray-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Box className="w-4 h-4 text-[#FF9F1C]" />
                Launch 3D Visualizer
              </button>

              <button
                onClick={() => {
                  const m = modalMountain;
                  setModalMountain(null);
                  onAskAIAboutMountain(m);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 font-bold text-xs shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI Expedition Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
