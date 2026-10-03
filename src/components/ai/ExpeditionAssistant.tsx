import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Compass,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Bot,
  User,
  Settings,
  HelpCircle,
  Activity,
  Package,
  Coffee
} from 'lucide-react';
import { Mountain } from '../../types/mountain';
import { GLOBAL_MOUNTAINS } from '../../data/mountainsData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  offline?: boolean;
}

interface ExpeditionAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMountain: Mountain | null;
  onClearSelectedMountain: () => void;
  onOpenSettings?: () => void;
}

/**
 * Local Rule Engine for Offline AI Assistant Fallback Intelligence
 * Intercepts queries when in Offline Mode to deliver structured mountain facts,
 * altitude safety guidelines, training points, and gear checklists.
 */
function generateOfflineIntelligence(query: string, mountainContext: Mountain | null): string {
  const cleanQ = query.toLowerCase().trim();

  // 1. Peak & Altitude Questions
  // Check if query specifically mentions a mountain by name or if we have an active peak context
  const mentionedMountain = GLOBAL_MOUNTAINS.find(
    (m) =>
      cleanQ.includes(m.name.toLowerCase()) ||
      (m.localName && cleanQ.includes(m.localName.toLowerCase())) ||
      m.id.toLowerCase().replace('-', ' ') === cleanQ
  ) || mountainContext;

  const isPeakQuestion =
    cleanQ.includes('peak') ||
    cleanQ.includes('mountain') ||
    cleanQ.includes('summit') ||
    cleanQ.includes('route') ||
    cleanQ.includes('permit') ||
    cleanQ.includes('elevation') ||
    cleanQ.includes('height') ||
    cleanQ.includes('meter') ||
    cleanQ.includes('cost') ||
    cleanQ.includes('budget') ||
    cleanQ.includes('season') ||
    cleanQ.includes('weather') ||
    cleanQ.includes('everest') ||
    cleanQ.includes('k2') ||
    cleanQ.includes('aconcagua') ||
    cleanQ.includes('denali') ||
    cleanQ.includes('kilimanjaro') ||
    cleanQ.includes('elbrus') ||
    cleanQ.includes('matterhorn') ||
    cleanQ.includes('fuji') ||
    cleanQ.includes('rainier') ||
    cleanQ.includes('mont blanc');

  if (isPeakQuestion && mentionedMountain) {
    return `🏔️ [Offline Peak Intelligence] ${mentionedMountain.name} (${mentionedMountain.elevationM.toLocaleString()}m / ${mentionedMountain.elevationFt.toLocaleString()}ft)

• Range & Location: ${mentionedMountain.range} (${mentionedMountain.country.join(', ')})
• Continental Tier: ${mentionedMountain.isEightThousander ? '14 8,000m Death Zone Peak' : mentionedMountain.isSevenSummit ? 'Continental Seven Summit' : 'High Alpine Peak'}
• Technical Difficulty: ${mentionedMountain.difficulty}
• Standard Ascent Route: ${mentionedMountain.standardRoute}
• Optimal Climbing Window: ${mentionedMountain.bestClimbingMonths.join(', ')}
• First Ascent: ${mentionedMountain.firstAscent.year} by ${mentionedMountain.firstAscent.climbers}
• Required Permits: ${mentionedMountain.permitRequirements}
• Estimated Expedition Budget: $${mentionedMountain.estimatedBudgetUSD.low.toLocaleString()} - $${mentionedMountain.estimatedBudgetUSD.high.toLocaleString()} USD
• Key Route Highlights: ${mentionedMountain.highlights.join(' • ')}

Summary: ${mentionedMountain.description}

💡 Note: Running in Offline Mode. Open Settings (⚙️) to add your Gemini API Key for live custom route reasoning!`;
  }

  // Altitude Sickness / AMS / HAPE / HACE
  const isAltitudeSafety =
    cleanQ.includes('altitude') ||
    cleanQ.includes('ams') ||
    cleanQ.includes('sickness') ||
    cleanQ.includes('hape') ||
    cleanQ.includes('hace') ||
    cleanQ.includes('oxygen') ||
    cleanQ.includes('acclimatiz') ||
    cleanQ.includes('diamox') ||
    cleanQ.includes('headache');

  if (isAltitudeSafety) {
    return `⚕️ [Offline Medical Protocol: High-Altitude Acclimatization & AMS]

1. The Golden Rule of Alpinism:
   "Climb high, sleep low." Above 3,000m (10,000ft), avoid increasing sleeping elevation by more than 300m - 500m per 24 hours. Include an active rest day every 3–4 days.

2. Acute Mountain Sickness (AMS) Warning Signs:
   Throbbing bitemporal headache, nausea, loss of appetite, insomnia, and unusual fatigue. If symptoms occur, DO NOT ascend further.

3. Life-Threatening Red Flags:
   • HAPE (High Altitude Pulmonary Edema): Extreme breathlessness at rest, persistent gurgling cough with pink frothy sputum, cyanosis (blue lips/nails).
   • HACE (High Altitude Cerebral Edema): Ataxia (inability to walk heel-to-toe), severe confusion, hallucinations, and drowsiness.
   Action: IMMEDIATE DESCENT of 500m–1,000m is mandatory and life-saving. Administer oxygen and portable hyperbaric bag (Gamow) if available.

4. Hydration & Prophylaxis:
   Drink 4–5 liters of warm fluids daily. Consult your physician regarding Acetazolamide (Diamox 125mg twice daily).`;
  }

  // 2. Training, Fitness & Gear Questions
  const isTrainingQuestion =
    cleanQ.includes('train') ||
    cleanQ.includes('fitness') ||
    cleanQ.includes('cardio') ||
    cleanQ.includes('exercise') ||
    cleanQ.includes('workout') ||
    cleanQ.includes('stair') ||
    cleanQ.includes('conditioning') ||
    cleanQ.includes('weight') ||
    cleanQ.includes('leg');

  if (isTrainingQuestion) {
    return `🏃 [Offline Training Protocol: 12-Week Mountaineering Conditioning]

• Aerobic Base (Zone 2):
  3–4 sessions per week (45–90 min) of low-heart-rate incline walking, trail running, or stair stepping. Keep heart rate in Zone 2 to build mitochondrial endurance.

• Muscular Endurance & Weighted Step-Ups:
  Step-ups onto a 12-inch box. Start with bodyweight, then progressively add pack weight: Week 3 (5kg), Week 6 (10kg), peaking at Week 9 (15kg / 33lbs).

• Eccentric Quad Resilience:
  Perform goblet squats, lunges, and Romanian deadlifts to prevent knee shear during long 2,000m continuous descents.

• Pre-Expedition Taper:
  Reduce training volume by 50% during the final 10 days before departure to ensure full glycogen saturation and mental freshness.`;
  }

  const isGearQuestion =
    cleanQ.includes('gear') ||
    cleanQ.includes('equipment') ||
    cleanQ.includes('boot') ||
    cleanQ.includes('crampon') ||
    cleanQ.includes('axe') ||
    cleanQ.includes('pack') ||
    cleanQ.includes('helmet') ||
    cleanQ.includes('harness') ||
    cleanQ.includes('layer') ||
    cleanQ.includes('clothing') ||
    cleanQ.includes('glove');

  if (isGearQuestion) {
    return `🎒 [Offline Equipment Checklist: Mandatory Mountaineering Kit]

1. 3-Layer Weather Defense System:
   • Base Layer: Merino wool or high-wicking synthetic (no cotton!).
   • Mid Layer: Grid fleece or breathable 800+ fill power down jacket.
   • Outer Shell: 3-layer GORE-TEX Pro hardshell jacket and waterproof bib pants.

2. Technical Footwear & Traction:
   • B3-rated rigid mountaineering boots (double boots required for Denali/Aconcagua/Himalayas).
   • 10–12 point steel crampons with anti-balling plates, pre-adjusted to boots.
   • Alpine ice axe (length: spike touches ankle bone when held with straight arm).

3. Protection & Communications:
   • UIAA-certified climbing helmet and lightweight alpine harness.
   • Category 4 glacier glasses with leather side shields (snow reflects 85% of UV rays).
   • Two-way satellite messenger (Garmin inReach / ZOLEO) with SOS active plan.`;
  }

  // 3. Nutrition & Mountain Tea
  const isNutritionQuestion =
    cleanQ.includes('tea') ||
    cleanQ.includes('nutrition') ||
    cleanQ.includes('food') ||
    cleanQ.includes('drink') ||
    cleanQ.includes('eat') ||
    cleanQ.includes('butter') ||
    cleanQ.includes('po cha') ||
    cleanQ.includes('coca');

  if (isNutritionQuestion) {
    return `☕ [Offline Nutrition Guide: Traditional High-Altitude Mountain Teas]

• Sherpa Butter Tea (Po Cha):
  Pu-erh black tea vigorously churned with yak butter (or grass-fed butter) and Himalayan pink salt. Delivers 250+ kcal of dense energy and bioavailable fats that prevent chapped lips and altitude nausea.

• Andean Mate de Coca & Muña:
  Steeped whole coca leaves and wild Andean mint. Natural alkaloids stimulate peripheral oxygenation and ease digestive distress.

• Karakoram Ginger & Cardamom:
  Boiled fresh ginger root, cracked cardamom pods, and raw honey. Gingerol acts as a powerful anti-emetic against altitude nausea while cardamom relieves bronchial cold coughing.`;
  }

  // 4. Default General Offline Response
  return `AI Assistant running in Offline Mode. Add a Gemini API Key in Settings (⚙️) for live AI answers!

🏔️ Global Mountain Explorer Quick Reference:
• Explore Peaks: You can inspect our global database of 14 8,000m summits and the Seven Summits via the "Peaks & Ranges" tab.
• Current Focus: ${mountainContext ? `${mountainContext.name} (${mountainContext.elevationM}m in ${mountainContext.range})` : 'Global Mountain Catalog'}.
• Offline Guidance: Ask me about "Everest", "Aconcagua", "altitude sickness symptoms", "training plan", "gear list", or "mountain tea recipes" for instant structured advisories.

To unlock unrestricted live generative answers, tap the ⚙️ Settings icon in the navigation bar to paste your Google Gemini API key.`;
}

export const ExpeditionAssistant: React.FC<ExpeditionAssistantProps> = ({
  isOpen,
  onClose,
  selectedMountain,
  onClearSelectedMountain,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Greetings Alpinist! I am your AI Expedition Director powered by Google Gemini.\n\nI can analyze climbing routes, high-altitude physiology (AMS/HAPE prevention), mandatory national park permits, gear requirements, and hydration strategies worldwide. How may I advise your expedition today?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [engineStatus, setEngineStatus] = useState<'custom' | 'default' | 'offline'>('offline');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Re-check key status whenever panel is opened
  useEffect(() => {
    if (!isOpen) return;

    const savedKey = localStorage.getItem('user_gemini_api_key');
    const isForcedOffline = localStorage.getItem('gme_force_offline_mode') === 'true';

    if (isForcedOffline) {
      setEngineStatus('offline');
    } else if (savedKey && savedKey.trim()) {
      setEngineStatus('custom');
    } else if (import.meta.env.VITE_GEMINI_API_KEY) {
      setEngineStatus('default');
    } else {
      setEngineStatus('offline');
    }

    scrollToBottom();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    // 1. Check local key & offline settings
    const savedCustomKey = localStorage.getItem('user_gemini_api_key')?.trim() || '';
    const isForcedOffline = localStorage.getItem('gme_force_offline_mode') === 'true';
    const systemDefaultKey = (import.meta.env.VITE_GEMINI_API_KEY || (import.meta.env as any).GEMINI_API_KEY || '').trim();
    const effectiveKey = savedCustomKey || systemDefaultKey;

    // If forced offline or no key is present anywhere, invoke Local Rule Engine immediately
    if (isForcedOffline || !effectiveKey) {
      setTimeout(() => {
        const offlineReply = generateOfflineIntelligence(query, selectedMountain);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-offline-${Date.now()}`,
            sender: 'assistant',
            text: offlineReply,
            timestamp: Date.now(),
            offline: true,
          },
        ]);
        setEngineStatus('offline');
        setIsLoading(false);
      }, 350);
      return;
    }

    // 2. Active Mode: Query Gemini via server route or direct client fallback
    try {
      let backendSuccess = false;
      try {
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(savedCustomKey ? { 'x-gemini-api-key': savedCustomKey } : {}),
          },
          body: JSON.stringify({
            message: query,
            customApiKey: savedCustomKey || undefined,
            mountainContext: selectedMountain
              ? {
                  name: selectedMountain.name,
                  elevationM: selectedMountain.elevationM,
                  range: selectedMountain.range,
                  country: selectedMountain.country,
                  standardRoute: selectedMountain.standardRoute,
                  difficulty: selectedMountain.difficulty,
                  permitRequirements: selectedMountain.permitRequirements,
                }
              : null,
            history: messages.slice(-5).map((m) => ({ sender: m.sender, text: m.text })),
          }),
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && !data.offline && data.reply) {
            backendSuccess = true;
            setEngineStatus(savedCustomKey ? 'custom' : 'default');
            setMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                sender: 'assistant',
                text: data.reply,
                timestamp: Date.now(),
                offline: false,
              },
            ]);
            return;
          }
        }
      } catch (backendErr) {
        backendSuccess = false;
      }

      // If backend failed or running on static host (e.g., Netlify), execute direct Gemini call with effectiveKey
      const promptText = `You are the Lead Expedition Director and Senior Alpinist of Global Mountain Explorer (GME).
Advisory query: ${query}
Active Mountain Focus: ${selectedMountain?.name || 'General Mountaineering'}
Elevation: ${selectedMountain?.elevationM ? selectedMountain.elevationM + 'm' : 'N/A'}
Range: ${selectedMountain?.range || 'Global'}

Provide a structured, authoritative, and safety-focused response with practical guidance on routes, altitude sickness prevention, hydration, gear, and permits.`;

      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${effectiveKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        }
      );

      if (directRes.ok) {
        const directData = await directRes.json();
        const generatedText = directData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          setEngineStatus(savedCustomKey ? 'custom' : 'default');
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'assistant',
              text: generatedText,
              timestamp: Date.now(),
              offline: false,
            },
          ]);
          return;
        }
      }

      // If network call failed (e.g. invalid key or offline), fallback to local rule engine
      throw new Error('Network or API response invalid');
    } catch (err: any) {
      console.warn('[GME AI Assistant] Live API unavailable, falling back to local rule engine:', err);
      const offlineReply = generateOfflineIntelligence(query, selectedMountain);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-offline-fallback-${Date.now()}`,
          sender: 'assistant',
          text: offlineReply,
          timestamp: Date.now(),
          offline: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    selectedMountain
      ? `What is the optimal gear list and permit protocol for ${selectedMountain.name}?`
      : 'What are the main symptoms and treatment protocols for Acute Mountain Sickness (AMS)?',
    'What training exercises best prevent knee pain during steep alpine descents?',
    'What is the recipe and benefits of Sherpa Butter Tea (Po Cha)?',
    'What are the mandatory permit fees and liaison rules for the Seven Summits?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E3A2B] to-[#12281b] text-white flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9F1C] to-[#00A8E8] p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#1E3A2B] rounded-[9px] flex items-center justify-center text-[#FFBF00]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight">AI Expedition Agent</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FF9F1C] text-gray-950 uppercase tracking-wider">
                {engineStatus === 'offline' ? 'Offline Rule Engine' : 'Gemini'}
              </span>
            </div>
            <p className="text-xs text-gray-300">
              {selectedMountain ? `Focus: ${selectedMountain.name}` : 'Worldwide Mountain Intelligence'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Open Platform & AI Settings"
            >
              <Settings className="w-4 h-4 text-[#FF9F1C]" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Engine Status Banner */}
      <div className="bg-gray-900 text-gray-300 px-4 py-2 border-b border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {engineStatus === 'custom' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span className="font-medium text-emerald-300 text-[11px]">🟢 Active (Custom Key)</span>
            </>
          )}
          {engineStatus === 'default' && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00A8E8] shadow-[0_0_6px_#00A8E8]" />
              <span className="font-medium text-sky-300 text-[11px]">🔵 Active (System Default)</span>
            </>
          )}
          {engineStatus === 'offline' && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#FFBF00] shadow-[0_0_6px_#FFBF00]" />
              <span className="font-medium text-amber-300 text-[11px]">🟡 Offline Demo Mode</span>
            </>
          )}
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="text-[11px] text-[#FF9F1C] hover:text-[#ffb74d] font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Configure</span>
            <Settings className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Selected Peak Context Pill */}
      {selectedMountain && (
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-[#FF9F1C] shrink-0" />
            <span>
              Active Peak Focus: <strong>{selectedMountain.name}</strong> ({selectedMountain.elevationM.toLocaleString()}m)
            </span>
          </div>
          <button
            onClick={onClearSelectedMountain}
            className="text-[11px] text-amber-700 hover:text-amber-950 font-bold ml-2 underline shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#1E3A2B] text-[#FF9F1C] flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 font-medium rounded-tr-xs shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs shadow-xs whitespace-pre-line'
              }`}
            >
              {m.text}
              {m.offline && (
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                  <span>Delivered by Local High-Altitude Rule Engine</span>
                  {onOpenSettings && (
                    <button
                      onClick={onOpenSettings}
                      className="text-[#00A8E8] font-bold hover:underline cursor-pointer"
                    >
                      Add Live Key &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl border border-gray-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF9F1C]" />
            <span>Analyzing expedition parameters...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-white border-t border-gray-100 overflow-x-auto no-scrollbar flex items-center gap-2">
        {quickPrompts.slice(0, 3).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-gray-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-gray-200 text-gray-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt.length > 38 ? prompt.slice(0, 38) + '...' : prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={selectedMountain ? `Ask about ${selectedMountain.name}...` : 'Ask routes, gear, permits, altitude...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#FF9F1C] focus:outline-hidden disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 font-bold hover:brightness-105 disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-1">
          <span>Always verify weather windows & avalanche bulletins.</span>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-[#FF9F1C] hover:underline cursor-pointer"
            >
              ⚙️ Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
