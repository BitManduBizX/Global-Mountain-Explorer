import React from 'react';
import { Compass, ShieldCheck, Heart, Sparkles, Globe, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111827] text-gray-300 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9F1C] to-[#00A8E8] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#1E3A2B] rounded-[9px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-[#FF9F1C]" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Global Mountain <span className="text-[#FF9F1C]">Explorer</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A unified open platform for mountain enthusiasts, high-altitude researchers, alpine climbers, and travelers. Designed with zero cost, no registration, and real-time telemetry.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Award className="w-4 h-4 text-[#FF9F1C]" />
              <span>Leave No Trace & Porter Welfare Compliant</span>
            </div>
          </div>

          {/* Expedition Databases */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Summit Catalog</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>• The 14 8,000m Death Zone Giants</li>
              <li>• The Seven Continental Summits</li>
              <li>• Equirectangular Vector Earth Projections</li>
              <li>• World Mountain Ranges & River Headwaters</li>
              <li>• 3D Relief & Topographic Visualizers</li>
            </ul>
          </div>

          {/* Alpinism Protocols */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Training & Safety</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>• 12-Week Progressive Aerobic Training Program</li>
              <li>• AMS, HAPE & HACE Prevention Guidelines</li>
              <li>• Traditional High-Altitude Mountain Tea Protocols</li>
              <li>• IFMGA / UIAGM Certified Guide Directory</li>
              <li>• Expedited Emergency Helicopter Rescue Protocols</li>
            </ul>
          </div>

          {/* AI & Telemetry Standards */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI & Satellite Engine</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Powered by Google Gemini for conversational expedition intelligence and mathematical Plate Carrée projection with 60 FPS rAF trajectory rendering.
            </p>
            <div className="p-3 bg-gray-900/90 rounded-xl border border-gray-800 text-xs text-gray-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Offline-safe architecture with explicit consent guards on all external interactions.</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Global Mountain Explorer (GME). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Globe className="w-3.5 h-3.5 text-[#00A8E8]" />
              Equirectangular Plate Carrée Projection
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9F1C]" />
              Gemini 3.8 Intelligence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
