import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { GEMINI_TOOL_DECLARATIONS, executeToolCall } from './src/services/geminiTools';

dotenv.config();

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '25mb' }));

// Lazy Gemini client helper
function getGeminiClient(overrideApiKey?: string) {
  const apiKey = overrideApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Gemini Multi-turn Chat with Tool Calling (Function Calling)
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      messages = [],
      model = 'gemini-3.8-flash',
      rolePersona = 'erp_assistant',
      erpState = {},
      apiKey,
    } = req.body;

    const ai = getGeminiClient(apiKey);
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Add one in ERP Settings or set GEMINI_API_KEY on the server.',
        text: 'The Gemini API key is currently missing. Please add a Gemini API key in ERP Settings → Gemini AI & Live Voice, or configure GEMINI_API_KEY on the server.',
      });
    }

    // Role-specific System Instructions
    let roleDescription = 'You are the central operational copilot for Upadhyay Brother Solar Works (Jaunpur, UP). You have full visibility across customers, site installations, project progress, inventory stock, invoices, pending payments, subsidies, net metering, and service tickets.';
    if (rolePersona === 'project_manager') {
      roleDescription = 'You are the Solar Project & Site Operations Manager. Focus on project schedules, technical capacity (KW), panel/inverter models, milestone completion percentages, and assigning field technicians.';
    } else if (rolePersona === 'finance_officer') {
      roleDescription = 'You are the Finance & Accounts Officer. Focus on invoice billing, customer payment collections, outstanding balances, bank cash flow, and GST accounting.';
    } else if (rolePersona === 'service_technician') {
      roleDescription = 'You are the Senior Technical Support Engineer. Focus on solar plant troubleshooting, inverter error codes, routine maintenance, net metering synchronization, and service tickets.';
    }

    const systemInstruction = `
${roleDescription}

You have access to 22 dedicated ERP tools to query real data and perform actions:
- Customer queries: get_customers(), get_customer_by_id(), search_customer()
- Pipeline & Follow-ups: get_leads(), get_pending_followups()
- Projects & Sites: get_projects(), get_project_status(), get_installations()
- Inventory & Equipment: get_inventory()
- Billing & Payments: get_pending_payments(), get_payment_summary()
- Government Portal & Grid: get_subsidy_status() (PM Surya Ghar), get_net_metering_status() (PUVVNL)
- Support & Personnel: get_service_tickets(), get_employee_tasks()
- Actions: update_project_status(), assign_employee(), schedule_installation(), record_payment(), create_customer(), update_customer(), create_service_ticket()

CRITICAL GUIDELINES:
1. Always invoke the relevant tool first before answering questions about real customer names, numbers, plant capacities, stock levels, or finances.
2. Format financial figures cleanly in Indian Rupees (e.g. ₹78,000, ₹4,50,000).
3. If the user asks to schedule an installation, update a status, record a payment, or create a customer/ticket, execute the tool immediately and summarize the outcome clearly.
4. Keep answers professional, concise, structured with bullet points, and helpful for solar EPC workflows.
`;

    // Map conversation turns to Gemini API format
    // Ensure last message is from user
    const formattedContents: any[] = [];
    for (const msg of messages) {
      formattedContents.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content || '' }],
      });
    }

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Hello, what is your current overview of our solar operations?' }],
      });
    }

    const selectedModel = model || 'gemini-3.8-flash';
    const executedToolCalls: any[] = [];
    const actionsToApply: any[] = [];

    let currentTurn = 0;
    const maxTurns = 5;
    let finalAssistantText = '';

    while (currentTurn < maxTurns) {
      currentTurn++;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
        },
      });

      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        // Build model turn with the function calls
        formattedContents.push(response.candidates?.[0]?.content);

        // Execute each function call
        const functionResponseParts: any[] = [];
        for (const call of functionCalls) {
          const { result, action } = executeToolCall(call.name, call.args || {}, erpState);
          executedToolCalls.push({
            name: call.name,
            args: call.args,
            result,
          });
          if (action) {
            actionsToApply.push(action);
          }

          functionResponseParts.push({
            functionResponse: {
              name: call.name,
              response: { output: result },
            },
          });
        }

        // Add user turn with the function responses
        formattedContents.push({
          role: 'user',
          parts: functionResponseParts,
        });
      } else {
        // Model provided final text
        finalAssistantText = response.text || '';
        break;
      }
    }

    res.json({
      text: finalAssistantText,
      toolCalls: executedToolCalls,
      actions: actionsToApply,
      model: selectedModel,
    });
  } catch (error: any) {
    console.warn('Gemini Chat API Warning/Error:', error?.message);
    res.status(500).json({
      error: error.message || 'Internal Server Error during Gemini conversation',
      text: `An error occurred while communicating with Gemini: ${error.message}`,
    });
  }
});

// Dedicated Voice-Turn endpoint (optimized for concise speech synthesis & audio ERP assistant)
app.post('/api/gemini/voice-turn', async (req, res) => {
  try {
    const {
      transcript = '',
      erpState = {},
      history = [],
      apiKey,
    } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.json({
        text: 'I am listening. Please ask about any customer, solar project, inventory stock, or billing status.',
        actions: [],
      });
    }

    const ai = getGeminiClient(apiKey);
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please add one in ERP Settings.',
        text: 'Gemini API key is not configured.',
      });
    }

    const voiceSystemInstruction = `
You are SolarFlow Voice, the real-time spoken solar operations assistant for Upadhyay Brother Solar Works (Jaunpur, Uttar Pradesh).
You are answering verbally over audio.

Guidelines:
1. Speak concisely in 1 to 3 clear, natural spoken sentences. Avoid markdown tables, asterisks, or unpronounceable formatting.
2. State rupee figures naturally in Indian currency (e.g. ₹50,000 as 50 thousand rupees).
3. If the user asks for real data (customers, projects, inventory, dues, payments), call the corresponding tool first.
4. If asked to record an action, execute the tool and verbally confirm completion.
`;

    const contents: any[] = [];
    for (const h of history.slice(-4)) {
      contents.push({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: transcript }],
    });

    const executedToolCalls: any[] = [];
    const actionsToApply: any[] = [];
    let currentTurn = 0;
    const maxTurns = 3;
    let finalVoiceText = '';

    while (currentTurn < maxTurns) {
      currentTurn++;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: voiceSystemInstruction,
          tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        contents.push(response.candidates?.[0]?.content);
        const functionResponseParts: any[] = [];
        for (const call of functionCalls) {
          const { result, action } = executeToolCall(call.name, call.args || {}, erpState);
          executedToolCalls.push({ name: call.name, args: call.args, result });
          if (action) actionsToApply.push(action);
          functionResponseParts.push({
            functionResponse: { name: call.name, response: { output: result } },
          });
        }
        contents.push({ role: 'user', parts: functionResponseParts });
      } else {
        finalVoiceText = response.text || '';
        break;
      }
    }

    res.json({
      text: finalVoiceText,
      toolCalls: executedToolCalls,
      actions: actionsToApply,
    });
  } catch (error: any) {
    console.warn('Voice Turn Warning:', error?.message);
    res.status(500).json({
      error: error.message,
      text: "I couldn't process that request right now. Please try again.",
    });
  }
});

// Setup WebSocket Server for Gemini Live API Voice Conversations
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs, request) => {
  console.log('Client connected to /live WebSocket');

  // Guard client errors to prevent uncaught server exceptions
  clientWs.on('error', (err) => {
    console.warn('Live WebSocket client warning:', err.message);
  });

  const safeSend = (payload: any) => {
    if (clientWs.readyState === 1 /* WebSocket.OPEN */) {
      try {
        clientWs.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
      } catch (err: any) {
        console.warn('Failed to send to client WS:', err.message);
      }
    }
  };

  const requestUrl = new URL(request.url || '/live', `http://${request.headers.host || 'localhost'}`);
  const apiKey = requestUrl.searchParams.get('apiKey')?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    safeSend({
      error: 'Gemini API key is not configured for Live Voice. Add it in ERP Settings or configure GEMINI_API_KEY on the server.',
    });
    try {
      clientWs.close();
    } catch (_) {}
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  try {
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction:
          'You are SolarFlow Voice, the real-time spoken voice assistant for Upadhyay Brother Solar Works in Jaunpur, Uttar Pradesh. Speak concisely and clearly. Assist with solar project installations, capacity KW, pending payments, inventory, subsidies, and maintenance.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio =
            message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            safeSend({ audio });
          }
          if (message.serverContent?.interrupted) {
            safeSend({ interrupted: true });
          }
        },
        onclose: () => {
          safeSend({ status: 'closed' });
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio) {
          session.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (payload.text) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.warn('Error parsing client WS message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Client disconnected from /live');
      try {
        session.close();
      } catch (_) {}
    });
  } catch (error: any) {
    console.warn('Failed to initiate Gemini Live session:', error?.message);
    safeSend({
      error: `Failed to connect to Live API: ${error.message}`,
    });
    try {
      clientWs.close();
    } catch (_) {}
  }
});

// Vite middleware & Static Serving
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Solar ERP Backend running on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Server failed to start:', err);
});
