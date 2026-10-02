import React, { useState } from 'react';
import {
  Hotel,
  ShieldAlert,
  Award,
  Phone,
  ExternalLink,
  MapPin,
  Star,
  Users,
  Radio,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  TOUR_AGENCIES,
  MOUNTAIN_ACCOMMODATIONS,
  EMERGENCY_HELPLINES,
} from '../../data/mountainsData';
import { TourGuideAgency, MountainAccommodation, EmergencyHelpline } from '../../types/mountain';

interface TravelLodgingDirectoryProps {
  onRequestExternalLink: (url: string, name: string) => void;
}

export const TravelLodgingDirectory: React.FC<TravelLodgingDirectoryProps> = ({
  onRequestExternalLink,
}) => {
  const [activeTab, setActiveTab] = useState<'guides' | 'huts' | 'emergency'>('guides');

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-gray-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'guides', label: 'Certified Guide Networks (IFMGA / AMGA)', icon: Award },
          { id: 'huts', label: 'Mountain Huts & Tea Houses', icon: Hotel },
          { id: 'emergency', label: 'Emergency Helplines & Heli-Rescue', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1E3A2B] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-950 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF9F1C]' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. GUIDE AGENCIES */}
      {activeTab === 'guides' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-2">
                <Award className="w-3.5 h-3.5 text-[#FF9F1C]" />
                UIAGM / IFMGA Accreditation Standards
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Verified Global Mountain Guides & Expedition Operators
              </h3>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                Only licensed agencies adhering to international mountain safety guidelines, mandatory porter welfare fair wages, and Leave No Trace ethics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TOUR_AGENCIES.map((agency) => (
              <div
                key={agency.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00A8E8]">{agency.region}</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{agency.rating}</span>
                      <span className="text-gray-400 font-normal">({agency.reviewsCount})</span>
                    </div>
                  </div>

                  <h4 className="text-xl font-extrabold text-gray-950">{agency.name}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{agency.specialty}</p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Accreditations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {agency.certifications.map((c, i) => (
                        <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600 font-mono">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{agency.phone}</span>
                  </div>

                  <button
                    onClick={() => onRequestExternalLink(agency.websiteUrl, agency.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <span>Visit Agency</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MOUNTAIN HUTS & TEA HOUSES */}
      {activeTab === 'huts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              Iconic High-Altitude Mountain Refugios & Tea Houses
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Curated list of historic high huts providing refuge, acclimatization shelter, and warm meals along legendary mountaineering routes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOUNTAIN_ACCOMMODATIONS.map((hut) => (
              <div
                key={hut.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#1E3A2B] text-white">
                      {hut.type}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FF9F1C]">
                      {hut.elevationM.toLocaleString()} m ({Math.round(hut.elevationM * 3.28084).toLocaleString()} ft)
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-gray-900">{hut.name}</h4>
                    <p className="text-xs text-[#00A8E8] font-medium mt-0.5">
                      Base of: {hut.nearestPeak} • {hut.mountainRange}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 font-medium">Capacity: {hut.capacity}</p>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Amenities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hut.amenities.map((a, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <strong className="text-gray-900 block mb-0.5">Reservation Advisory:</strong>
                    {hut.bookingInfo}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end">
                  <button
                    onClick={() => onRequestExternalLink(hut.websiteUrl, hut.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 transition-colors text-xs cursor-pointer"
                  >
                    <span>Check Hut Availability</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EMERGENCY HELPLINES */}
      {activeTab === 'emergency' && (
        <div className="space-y-6">
          <div className="bg-red-50/70 border border-red-200 rounded-3xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-red-950">
                  Global Mountain Rescue & Search Coordinates
                </h3>
                <p className="text-xs text-red-800 leading-relaxed max-w-3xl">
                  In extreme high-altitude emergencies (severe Acute Mountain Sickness, HAPE, HACE, crevasse falls, or avalanches), immediate descent is mandatory. Program these emergency VHF radio guard channels and satellite dispatch numbers into your satellite communicator prior to departure.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EMERGENCY_HELPLINES.map((help, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-gray-900">{help.country}</h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Rescue Guard
                  </span>
                </div>

                <p className="text-xs font-semibold text-gray-700">{help.organization}</p>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs font-mono text-gray-800 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-red-500" />
                    <span><strong>Phone / Dispatch:</strong> {help.phone}</span>
                  </div>
                  {help.frequencyRadio && (
                    <div className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-[#00A8E8]" />
                      <span><strong>Radio VHF:</strong> {help.frequencyRadio}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200 leading-relaxed">
                  <strong className="text-amber-950 block mb-0.5">Helicopter Evacuation Protocol:</strong>
                  {help.helicopterRescueNotes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
