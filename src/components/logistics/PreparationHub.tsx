import React, { useState } from 'react';
import {
  CheckSquare,
  Activity,
  Coffee,
  Calculator,
  BookOpen,
  Sparkles,
  Download,
  AlertTriangle,
  Heart,
  Droplets,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Zap,
  Printer
} from 'lucide-react';
import {
  TRAINING_PROGRAM_WEEKS,
  MOUNTAIN_TEA_RECIPES,
  GLOSSARY_ITEMS,
} from '../../data/mountainsData';

interface ChecklistItem {
  id: string;
  category: 'Technical Gear' | 'Clothing & Layering' | 'Medical & Altitude' | 'Permits & Travel';
  title: string;
  desc: string;
  mandatory: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'boots',
    category: 'Technical Gear',
    title: 'Double Mountaineering Boots / B3-Rated or Stiff Trekking Boots',
    desc: 'Fully broken in to prevent debilitating blisters at high altitude. Rigid sole with automatic or semi-automatic crampon bails.',
    mandatory: true,
  },
  {
    id: 'crampons',
    category: 'Technical Gear',
    title: 'Steel / Semi-Rigid 12-Point Crampons + Anti-Balling Plates',
    desc: 'Tested and pre-fitted securely to your climbing boots before packing.',
    mandatory: true,
  },
  {
    id: 'ice-axe',
    category: 'Technical Gear',
    title: 'Alpine Ice Axe / Technical Piolet + Leash',
    desc: 'Proper length: spike reaches your ankle bone when held with a straight arm.',
    mandatory: true,
  },
  {
    id: 'harness-helmet',
    category: 'Technical Gear',
    title: 'CE/UIAA Certified Climbing Helmet & Alpine Harness',
    desc: 'Helmet protects against rockfall and icefall in couloirs and moraines.',
    mandatory: true,
  },
  {
    id: 'hardshell-layers',
    category: 'Clothing & Layering',
    title: '3-Layer Weather System (Base, Fleece/Down Mid, GORE-TEX Hardshell)',
    desc: 'No cotton garments! Wicking merino wool or synthetic base layers next to skin.',
    mandatory: true,
  },
  {
    id: 'down-parka',
    category: 'Clothing & Layering',
    title: '800+ Fill Power Down Parka with Baffled Box Construction',
    desc: 'Essential for summit pushes, freezing high camps, and emergency bivouacs.',
    mandatory: true,
  },
  {
    id: 'glacier-glasses',
    category: 'Clothing & Layering',
    title: 'Category 4 Glacier Glasses with Side Shields',
    desc: 'Protects retinas against photokeratitis (snow blindness) caused by 85% UV reflection off snow.',
    mandatory: true,
  },
  {
    id: 'diamox',
    category: 'Medical & Altitude',
    title: 'Acetazolamide (Diamox) + Prescription Altitude Protocol',
    desc: 'Forces kidneys to excrete bicarbonate, acidifying blood to stimulate deeper ventilation in sleep.',
    mandatory: true,
  },
  {
    id: 'pulse-oximeter',
    category: 'Medical & Altitude',
    title: 'Digital Fingertip Pulse Oximeter',
    desc: 'Monitor SpO2 saturation daily. Drop below 70% at rest triggers descent protocols.',
    mandatory: true,
  },
  {
    id: 'water-purification',
    category: 'Medical & Altitude',
    title: 'Steripen UV / Chlorine Dioxide Purification Tablets',
    desc: 'Glacial meltwater frequently carries giardia and cryptosporidium cysts from higher camps.',
    mandatory: true,
  },
  {
    id: 'insurance-policy',
    category: 'Permits & Travel',
    title: 'Comprehensive Global Rescue & Repatriation Insurance (Ripcord / Global Rescue)',
    desc: 'Must explicitly cover mountaineering above 6,000 meters and unscheduled helicopter evacuation.',
    mandatory: true,
  },
  {
    id: 'inreach-beacon',
    category: 'Permits & Travel',
    title: 'Two-Way Satellite Messenger (Garmin inReach / ZOLEO / Iridium)',
    desc: 'Allows SOS dispatch and two-way SMS weather updates anywhere outside cellular reach.',
    mandatory: true,
  },
];

export const PreparationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'training' | 'tea' | 'calculator' | 'glossary'>('checklist');

  // Checklist State with Local Storage or Memory
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    boots: true,
    hardshell_layers: true,
  });

  const toggleChecklist = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = DEFAULT_CHECKLIST.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Budget Calculator State
  const [targetPeakType, setTargetPeakType] = useState<'8000m' | 'seven_summit' | 'alpine_trek'>('seven_summit');
  const [durationDays, setDurationDays] = useState(18);
  const [permitCost, setPermitCost] = useState(1200);
  const [guideRatio, setGuideRatio] = useState<'1:1' | '1:2' | 'self_guided'>('1:2');
  const [gearRentalOrPurchase, setGearRentalOrPurchase] = useState(1500);
  const [flightsBudget, setFlightsBudget] = useState(1400);
  const [emergencyInsurance, setEmergencyInsurance] = useState(450);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');

  // Estimated guides cost
  const guideBase = guideRatio === '1:1' ? 4500 : guideRatio === '1:2' ? 2600 : 400;
  const dailyLodgeFood = durationDays * 65;
  const totalExpeditionBudget = permitCost + guideBase + gearRentalOrPurchase + flightsBudget + emergencyInsurance + dailyLodgeFood;

  // Currency multiplier
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  const currencyRate = currency === 'USD' ? 1.0 : currency === 'EUR' ? 0.92 : 0.79;

  // Active tea recipe
  const [selectedTea, setSelectedTea] = useState(MOUNTAIN_TEA_RECIPES[0]);

  // Glossary filter
  const [glossaryCategory, setGlossaryCategory] = useState<string>('All');
  const [glossarySearch, setGlossarySearch] = useState('');

  const filteredGlossary = GLOSSARY_ITEMS.filter((item) => {
    if (glossaryCategory !== 'All' && item.category !== glossaryCategory) return false;
    if (glossarySearch.trim()) {
      const q = glossarySearch.toLowerCase();
      return item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Sub-navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-gray-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'checklist', label: 'Preparation Checklist', icon: CheckSquare },
          { id: 'training', label: '12-Week Training Program', icon: Activity },
          { id: 'tea', label: 'Mountain Tea & Nutrition Guide', icon: Coffee },
          { id: 'calculator', label: 'Budget & Finance Calculator', icon: Calculator },
          { id: 'glossary', label: 'Terminology & Reference Library', icon: BookOpen },
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

      {/* 1. CHECKLIST TAB */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Progress Bar Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 w-full md:max-w-md">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                <span>Expedition Readiness Index</span>
                <span className="text-[#FF9F1C]">{progressPercent}% Ready</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#FF9F1C] to-[#00A8E8] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {completedCount} of {totalCount} mandatory summit preparation requirements verified.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => {
                  const allDone: Record<string, boolean> = {};
                  DEFAULT_CHECKLIST.forEach((item) => (allDone[item.id] = true));
                  setCheckedItems(allDone);
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Mark All Complete
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E3A2B] text-white hover:bg-[#14281e] transition-colors cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-[#FF9F1C]" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_CHECKLIST.map((item) => {
              const isChecked = !!checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300/80 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-5 h-5 rounded-md text-[#FF9F1C] focus:ring-[#FF9F1C] border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                      {item.mandatory && (
                        <span className="text-[10px] font-bold text-red-600 uppercase">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-bold ${isChecked ? 'text-emerald-950 line-through' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 12-WEEK TRAINING PROGRAM */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1E3A2B] text-emerald-300 mb-2">
                <Activity className="w-3.5 h-3.5 text-[#FF9F1C]" />
                Progressive Periodization Protocol
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                12-Week Mountaineering Aerobic & Muscular Conditioning
              </h3>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                Structured by high-altitude sports physiologists to progressively build low-heart-rate mitochondrial capacity, eccentric quad resilience for steep descents, and weighted pack stability.
              </p>
            </div>

            <div className="text-right shrink-0 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
              <span className="text-gray-600 block">Peak Pack Simulation:</span>
              <span className="text-lg font-black text-[#FF9F1C]">15 kg (33 lbs)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRAINING_PROGRAM_WEEKS.map((w) => (
              <div
                key={w.week}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-[#FF9F1C] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                      WEEK {w.week}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-500">
                      +{w.elevationGainM}m Vert
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-gray-900">{w.focus}</h4>

                  <div className="space-y-2 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <strong className="text-gray-900 block mb-0.5">Cardio / Trail:</strong>
                      {w.cardioDays}
                    </div>
                    <div>
                      <strong className="text-gray-900 block mb-0.5">Strength / Core:</strong>
                      {w.strengthWork}
                    </div>
                    <div>
                      <strong className="text-gray-900">Pack Weight:</strong> {w.packWeightKg > 0 ? `${w.packWeightKg} kg` : 'Bodyweight only'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-amber-800 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                  <strong>Coach Tip:</strong> {w.tips}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MOUNTAIN TEA & NUTRITION GUIDE */}
      {activeTab === 'tea' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9F1C] text-gray-950 font-bold text-xs uppercase tracking-wider">
                <Coffee className="w-3.5 h-3.5" />
                High-Altitude Hydration & Herbal Medicine
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-950">
                The Sacred "Mountain Tea" & Nutrition Protocols
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                At altitudes above 4,000 meters, rapid exhalation in dry sub-zero air leaches up to 5 liters of water from the body daily. Indigenous mountain cultures have developed unique calorie-dense, electrolyte-rich teas to prevent dehydration, soothe AMS nausea, and maintain peripheral blood circulation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tea Selector Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Select Traditional Infusion:
              </h4>
              {MOUNTAIN_TEA_RECIPES.map((tea) => (
                <div
                  key={tea.id}
                  onClick={() => setSelectedTea(tea)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedTea.id === tea.id
                      ? 'bg-[#1E3A2B] text-white shadow-md border-[#1E3A2B]'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={selectedTea.id === tea.id ? 'text-[#FF9F1C] font-semibold' : 'text-gray-500'}>
                      {tea.region}
                    </span>
                    <span className="font-mono text-[11px] opacity-75">{tea.preparationTimeMinutes} min</span>
                  </div>
                  <h5 className="font-bold text-sm">{tea.name}</h5>
                  <p className={`text-xs mt-1 line-clamp-1 ${selectedTea.id === tea.id ? 'text-gray-300' : 'text-gray-500'}`}>
                    Origin: {tea.originMountain}
                  </p>
                </div>
              ))}
            </div>

            {/* Tea Details & Recipe Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold text-[#00A8E8] uppercase tracking-wider">
                  {selectedTea.region} • {selectedTea.originMountain}
                </span>
                <h4 className="text-2xl font-black text-gray-900 mt-1">{selectedTea.name}</h4>
              </div>

              {/* Ingredients */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Traditional Ingredients:
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedTea.traditionalIngredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-800">
                      <Droplets className="w-3.5 h-3.5 text-[#00A8E8]" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Altitude Physiological Benefits */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Physiological & High-Altitude Benefits:
                </h5>
                <div className="space-y-2">
                  {selectedTea.altitudeBenefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#FF9F1C] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Brewing */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Authentic Camp Brewing Instructions:
                </h5>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedTea.brewingInstructions}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. BUDGETING & FINANCE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Mountaineering Expedition Budget Estimator
              </h3>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                Accurately forecast climbing permit fees, guide ratios, gear outfitting, flights, and mandatory high-altitude medical evacuation insurance.
              </p>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    currency === curr ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Inputs */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5 text-xs text-gray-700">
              {/* Peak Type Presets */}
              <div>
                <label className="font-bold text-gray-900 block mb-2">Expedition Tier / Peak Category:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: '8000m', label: '8,000m Death Zone Peak', permits: 11000, days: 55 },
                    { id: 'seven_summit', label: 'Continental Seven Summit', permits: 1800, days: 21 },
                    { id: 'alpine_trek', label: 'Classic Alpine 4,000m Peak', permits: 350, days: 10 },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => {
                        setTargetPeakType(tier.id as any);
                        setPermitCost(tier.permits);
                        setDurationDays(tier.days);
                      }}
                      className={`p-3 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                        targetPeakType === tier.id
                          ? 'border-[#FF9F1C] bg-amber-50/70 text-gray-900 font-bold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Permits & Liaison Royalties:</span>
                    <span className="font-mono text-gray-900">
                      {currencySymbol}{Math.round(permitCost * currencyRate).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="15000"
                    step="100"
                    value={permitCost}
                    onChange={(e) => setPermitCost(parseInt(e.target.value))}
                    className="w-full accent-[#FF9F1C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Expedition Duration ({durationDays} Days):</span>
                    <span className="font-mono text-gray-900">{durationDays} days</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    step="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value))}
                    className="w-full accent-[#FF9F1C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Technical Gear & High-Altitude Outfitting:</span>
                    <span className="font-mono text-gray-900">
                      {currencySymbol}{Math.round(gearRentalOrPurchase * currencyRate).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="6000"
                    step="100"
                    value={gearRentalOrPurchase}
                    onChange={(e) => setGearRentalOrPurchase(parseInt(e.target.value))}
                    className="w-full accent-[#FF9F1C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>International & Domestic Bush Flights:</span>
                    <span className="font-mono text-gray-900">
                      {currencySymbol}{Math.round(flightsBudget * currencyRate).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="5000"
                    step="50"
                    value={flightsBudget}
                    onChange={(e) => setFlightsBudget(parseInt(e.target.value))}
                    className="w-full accent-[#FF9F1C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Helicopter Search & Rescue Insurance (6,000m+):</span>
                    <span className="font-mono text-gray-900">
                      {currencySymbol}{Math.round(emergencyInsurance * currencyRate).toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1500"
                    step="50"
                    value={emergencyInsurance}
                    onChange={(e) => setEmergencyInsurance(parseInt(e.target.value))}
                    className="w-full accent-[#FF9F1C]"
                  />
                </div>
              </div>
            </div>

            {/* Total Summary Card */}
            <div className="bg-[#1E3A2B] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF9F1C]">
                  Projected Expedition Investment
                </span>
                <div className="border-b border-white/10 pb-4">
                  <div className="text-3xl sm:text-4xl font-black text-amber-300">
                    {currencySymbol}{Math.round(totalExpeditionBudget * currencyRate).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    All inclusive: Permits, Certified Guides, Lodging/Food, Flights, and Insurance.
                  </p>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2 text-xs text-gray-300 pt-2">
                  <div className="flex justify-between">
                    <span>Permits & Royalties:</span>
                    <span className="font-mono font-bold text-white">
                      {currencySymbol}{Math.round(permitCost * currencyRate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guide Fees ({guideRatio}):</span>
                    <span className="font-mono font-bold text-white">
                      {currencySymbol}{Math.round(guideBase * currencyRate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Huts, Tea Houses & Rations ({durationDays} days):</span>
                    <span className="font-mono font-bold text-white">
                      {currencySymbol}{Math.round(dailyLodgeFood * currencyRate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gear & Boots:</span>
                    <span className="font-mono font-bold text-white">
                      {currencySymbol}{Math.round(gearRentalOrPurchase * currencyRate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Insurance:</span>
                    <span className="font-mono font-bold text-white">
                      {currencySymbol}{Math.round(emergencyInsurance * currencyRate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 text-[11px] text-gray-400">
                *Estimates reflect prevailing standard market rates. Always verify current national park permit fees with official tourism boards.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TERMINOLOGY & REFERENCE LIBRARY */}
      {activeTab === 'glossary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Mountaineering & Geology Reference Library
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Standard alpinism terminology, geological formations, high-altitude physiology definitions, and etymologies.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['All', 'Technique', 'Geology & Glaciology', 'Physiology & Safety', 'Equipment'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGlossaryCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    glossaryCategory === cat
                      ? 'bg-[#1E3A2B] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-amber-300 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-gray-900">{item.term}</h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{item.definition}</p>
                {item.etymology && (
                  <p className="text-[11px] text-gray-500 italic pt-1 border-t border-gray-100">
                    {item.etymology}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
