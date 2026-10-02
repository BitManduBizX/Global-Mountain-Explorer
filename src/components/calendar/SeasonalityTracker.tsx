import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Sun,
  CloudRain,
  Snowflake,
  Download,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { MOUNTAINEERING_EVENTS } from '../../data/mountainsData';

interface SeasonalityMatrixRow {
  region: string;
  peakExample: string;
  // 12 months: 'prime' | 'shoulder' | 'off'
  months: Array<'prime' | 'shoulder' | 'off'>;
  notes: string;
}

const SEASONALITY_DATA: SeasonalityMatrixRow[] = [
  {
    region: 'Himalayas (Nepal & Tibet)',
    peakExample: 'Everest, Lhotse, Ama Dablam',
    months: ['off', 'off', 'shoulder', 'prime', 'prime', 'off', 'off', 'off', 'shoulder', 'prime', 'shoulder', 'off'],
    notes: 'Pre-monsoon (Apr-May) is primary Everest window. Post-monsoon (Oct-Nov) is optimal for Ama Dablam & trekking with crystal clear skies.',
  },
  {
    region: 'Karakoram (Pakistan)',
    peakExample: 'K2, Broad Peak, Gasherbrum',
    months: ['off', 'off', 'off', 'off', 'shoulder', 'shoulder', 'prime', 'prime', 'off', 'off', 'off', 'off'],
    notes: 'High summer (July-August) is the only period where sub-zero jet stream winds relent above 8,000m.',
  },
  {
    region: 'Central Andes (Argentina & Chile)',
    peakExample: 'Aconcagua, Mercedario',
    months: ['prime', 'prime', 'shoulder', 'off', 'off', 'off', 'off', 'off', 'off', 'off', 'shoulder', 'prime'],
    notes: 'Southern hemisphere summer (Dec-Feb). Winter brings ferocious "Viento Blanco" blizzards.',
  },
  {
    region: 'Alaska Range (USA)',
    peakExample: 'Denali, Mount Foraker',
    months: ['off', 'off', 'off', 'shoulder', 'prime', 'prime', 'shoulder', 'off', 'off', 'off', 'off', 'off'],
    notes: 'Late May to mid-June offers the safest glacier snow bridges across Kahiltna crevasses before summer melting.',
  },
  {
    region: 'European Alps',
    peakExample: 'Mont Blanc, Matterhorn',
    months: ['off', 'off', 'off', 'off', 'shoulder', 'prime', 'prime', 'prime', 'shoulder', 'off', 'off', 'off'],
    notes: 'Summer (July-August) is classic alpine climbing season. Late August/September sees higher rockfall risk due to permafrost thaw.',
  },
  {
    region: 'East Africa (Equator)',
    peakExample: 'Kilimanjaro, Mount Kenya',
    months: ['prime', 'prime', 'shoulder', 'off', 'off', 'shoulder', 'prime', 'prime', 'prime', 'shoulder', 'off', 'shoulder'],
    notes: 'Two dry windows: Jan-Mar (warmer) and July-Oct (cooler & clear). Heavy rains in April-May.',
  },
  {
    region: 'Southern Alps (New Zealand)',
    peakExample: 'Aoraki / Mount Cook',
    months: ['prime', 'prime', 'shoulder', 'off', 'off', 'off', 'off', 'off', 'off', 'shoulder', 'prime', 'prime'],
    notes: 'Austral summer (November to February) delivers the longest daylight and best snow-pack stability.',
  },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SeasonalityTracker: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  /**
   * Generates a downloadable standard iCalendar (.ics) file for mountaineering events
   */
  const handleDownloadICS = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Global Mountain Explorer//Climbing Calendar//EN\nCALSCALE:GREGORIAN\n`;

    MOUNTAINEERING_EVENTS.forEach((evt) => {
      icsContent += `BEGIN:VEVENT\nSUMMARY:${evt.title}\nDESCRIPTION:${evt.description}\nLOCATION:${evt.location}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `GME_Mountaineering_Calendar_${Date.now()}.ics`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1E3A2B] text-emerald-300">
            <CalendarIcon className="w-3.5 h-3.5 text-[#FF9F1C]" />
            Seasonality & Window Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Global Summit Windows & Weather Calendar
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Mountaineering success is governed by weather windows — narrow periods where the jet stream shifts away and monsoon moisture subsides. Plan your expeditions around historical high-pressure stability.
          </p>
        </div>

        <button
          onClick={handleDownloadICS}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 font-bold text-xs sm:text-sm shadow hover:brightness-105 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          Export to Apple / Google Calendar (.ics)
        </button>
      </div>

      {/* Month Selector for Quick Highlighting */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-2">
          Highlight Month:
        </span>
        <div className="flex items-center gap-1.5">
          {MONTH_NAMES.map((name, idx) => (
            <button
              key={name}
              onClick={() => setSelectedMonth(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedMonth === idx
                  ? 'bg-[#1E3A2B] text-[#FF9F1C] shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Seasonality Heatmap Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm overflow-x-auto">
        <div className="min-w-[700px] space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span className="w-1/3">Mountain Range & Iconic Peaks</span>
            <div className="w-2/3 grid grid-cols-12 gap-1 text-center font-mono">
              {MONTH_NAMES.map((m, idx) => (
                <span key={m} className={selectedMonth === idx ? 'text-[#FF9F1C] font-black' : ''}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {SEASONALITY_DATA.map((row, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-amber-200 transition-colors flex items-center justify-between gap-4"
              >
                <div className="w-1/3 space-y-0.5">
                  <h4 className="text-sm font-bold text-gray-900">{row.region}</h4>
                  <p className="text-[11px] text-gray-500">{row.peakExample}</p>
                </div>

                <div className="w-2/3 grid grid-cols-12 gap-1">
                  {row.months.map((status, mIdx) => {
                    const isSelected = selectedMonth === mIdx;
                    return (
                      <div
                        key={mIdx}
                        title={`${MONTH_NAMES[mIdx]}: ${status.toUpperCase()} window`}
                        className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                          status === 'prime'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : status === 'shoulder'
                            ? 'bg-amber-300 text-amber-950'
                            : 'bg-gray-200 text-gray-400'
                        } ${isSelected ? 'ring-2 ring-[#FF9F1C] scale-105 z-10' : ''}`}
                      >
                        {status === 'prime' ? '✓' : status === 'shoulder' ? '~' : '—'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Legend */}
          <div className="flex items-center justify-end gap-6 pt-4 text-xs text-gray-600 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
              <span><strong>Prime Window</strong> (Optimal weather & high pressure)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-300" />
              <span><strong>Shoulder Season</strong> (Variable storms / cold)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-gray-200" />
              <span><strong>Off-Season</strong> (Monsoon / Extreme Winter)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Mountaineering Events & Festivals */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">
          Global Mountaineering Windows & Film Festivals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOUNTAINEERING_EVENTS.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {evt.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00A8E8]">
                    {evt.dates}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-gray-950">{evt.title}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF9F1C]" />
                  {evt.location} ({evt.mountainRange})
                </p>

                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  {evt.description}
                </p>

                {evt.optimalPeakWindow && (
                  <div className="text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 font-medium">
                    <strong>Optimal Summit Window:</strong> {evt.optimalPeakWindow}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={handleDownloadICS}
                  className="text-xs font-bold text-[#00A8E8] hover:text-[#007da8] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Add Event to Calendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
