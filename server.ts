import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Defensive Gemini API initialization
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[GME Server] Could not initialize GoogleGenAI client:', err);
  }
}

// Health and capability status endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey && !!aiClient,
    timestamp: new Date().toISOString(),
  });
});

// Server-side Gemini AI Expedition Assistant endpoint
app.post('/api/gemini/chat', async (req, res) => {
  const { message, mountainContext, history } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Graceful offline fallback check
  if (!apiKey || !aiClient) {
    res.status(200).json({
      offline: true,
      error: 'MISSING_KEY',
      reply: `AI Assistant is running in offline mode. Please add your Gemini API Key in your project settings.\n\nOffline Expedition Advisory for "${mountainContext?.name || 'Mountaineering'}":\nAlways adhere to acclimatization schedules ("climb high, sleep low"), carry emergency satellite beacons (Garmin inReach / ZOLEO), monitor barometric trends for incoming squalls, and secure mandatory National Park / Mountaineering Liaison permits well ahead of your window.`,
      disclaimer: 'Offline mode active. Add GEMINI_API_KEY in settings to enable real-time Gemini reasoning.',
    });
    return;
  }

  try {
    const systemPrompt = `You are the Lead Expedition Director and Senior Alpinist of the Global Mountain Explorer (GME) platform.
Your expertise spans:
1. High-altitude physiology, acute mountain sickness (AMS, HAPE, HACE) prevention, and hydration protocols (including traditional high-altitude teas such as Sherpa butter tea, Himalayan herbal ginger-lemon-honey, and Andean coca/muña infusions).
2. Technical mountaineering, alpine climbing, glacier crevasse rescue, and crampon/ice axe protocols.
3. Logistics, permits, weather windows, seasonality, and route topography across the world's 14 8,000m peaks, Seven Summits, and iconic trekking ranges (Himalayas, Andes, Rockies, Alps, Karakoram, Southern Alps).
4. Sustainable Leave No Trace ethics, localized porter welfare standards, and emergency evacuation protocols.

Context about the currently active or queried mountain:
${mountainContext ? JSON.stringify(mountainContext, null, 2) : 'General mountaineering inquiry'}

Instructions:
- Provide structured, practical, inspiring, yet cautious and safety-first answers.
- Highlight specific equipment recommendations, gear ratings (e.g., 8000m down suit vs 3-layer hardshell), hydration, and permit requirements.
- Keep the tone respectful, authoritative, and adventurous. Format with clear Markdown headings or bullet points.`;

    const chatContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Optional past messages
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.sender === 'user') {
          chatContents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'assistant' && item.text) {
          chatContents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }
    }

    chatContents.push({
      role: 'user',
      parts: [
        {
          text: `User query: ${message}\nActive Mountain Focus: ${mountainContext?.name || 'Global'}\nElevation: ${mountainContext?.elevationM ? mountainContext.elevationM + 'm' : 'N/A'}\nRange: ${mountainContext?.range || 'Global'}`,
        },
      ],
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const reply = response.text || 'No response generated from Expedition Assistant.';
    res.json({
      offline: false,
      reply,
    });
  } catch (error: any) {
    console.error('[GME Server] Gemini API error:', error);
    res.status(500).json({
      error: 'GEMINI_ERROR',
      message: error?.message || 'Error communicating with Gemini service',
      fallbackReply: `We encountered a temporary delay connecting to Gemini. For ${mountainContext?.name || 'your peak'}, always inspect weather windows (jet stream wind speeds < 30 knots), hydrate with 4-5 liters of electrolytes/warm tea daily, and confirm permit status before launching your summit push.`,
    });
  }
});

// Vite middleware or static serving
async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GME Server] Listening on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

setupServer().catch((err) => {
  console.error('[GME Server] Fatal startup failure:', err);
  process.exit(1);
});
