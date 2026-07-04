const express = require("express");
const axios = require("axios");
const Groq = require("groq-sdk");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── LOAD MERCHANTS ───────────────────────────────────────────────────────────
const merchants = JSON.parse(fs.readFileSync("./merchants.json", "utf8"));
const merchantKeys = Object.keys(merchants);

console.log("🚀 VyapaarAI running on port", process.env.PORT || 3000);
console.log(`📦 Businesses loaded: ${merchantKeys.length}`);
merchantKeys.forEach((k) => {
  const m = merchants[k];
  console.log(`   ✅ ${m.name} → phone_number_id: ${k}`);
});

// ─── CONVERSATION HISTORY ─────────────────────────────────────────────────────
// history[phone_number_id][customerPhone] = [ {role, content}, ... ]
const history = {};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
const ORDERS_FILE = "./orders.json";
function loadOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")); } catch { return []; }
}
function saveOrder(order) {
  const orders = loadOrders();
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// ─── SEND WHATSAPP MESSAGE ────────────────────────────────────────────────────
async function sendMessage(phoneNumberId, to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`   ✅ Sent to ${to}`);
  } catch (err) {
    console.error(`   ❌ Send failed:`, err.response?.data || err.message);
  }
}

// ─── AI REPLY ─────────────────────────────────────────────────────────────────
async function getAIReply(phoneNumberId, customerPhone, userMessage) {
  const merchant = merchants[phoneNumberId];

  if (!history[phoneNumberId]) history[phoneNumberId] = {};
  if (!history[phoneNumberId][customerPhone]) history[phoneNumberId][customerPhone] = [];

  const convo = history[phoneNumberId][customerPhone];
  if (convo.length > 20) convo.splice(0, convo.length - 20);

  convo.push({ role: "user", content: userMessage });

  const systemPrompt = `You are a WhatsApp sales assistant for "${merchant.name}", located at ${merchant.location}.

Working hours: ${merchant.workingHours}
Delivery: ${merchant.deliveryInfo}
Payment: ${merchant.paymentMethods}

Products / Catalogue:
${merchant.catalogue}

Instructions:
- Reply in the same language the customer uses (Hindi, Gujarati, or English).
- Be friendly, short, and helpful — this is WhatsApp, not email.
- When a customer confirms an order, include ORDER_CONFIRMED in your reply and summarise what they ordered.
- If asked about something not in the catalogue, say you don't carry it.
- Never invent prices or products.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: systemPrompt }, ...convo],
    max_tokens: 500,
    temperature: 0.6,
  });

  const reply = response.choices[0].message.content;
  convo.push({ role: "assistant", content: reply });

  if (reply.includes("ORDER_CONFIRMED")) {
    const order = {
      id: `ORD-${Date.now()}`,
      business: merchant.name,
      phoneNumberId,
      customerPhone,
      message: userMessage,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };
    saveOrder(order);
    console.log(`   🛒 Order saved: ${order.id} — ${merchant.name}`);
  }

  return reply;
}

// ─── WEBHOOK VERIFICATION ─────────────────────────────────────────────────────
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ─── INCOMING MESSAGES ────────────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const msg = change?.messages?.[0];
    if (!msg) return;

    const phoneNumberId = change.metadata?.phone_number_id;
    const customerPhone = msg.from;
    const msgType = msg.type;

    if (msgType !== "text") {
      console.log(`📎 Non-text (${msgType}) from ${customerPhone} — skipped`);
      return;
    }

    const text = msg.text.body.trim();
    const merchant = merchants[phoneNumberId];

    if (!merchant) {
      console.log(`⚠️  Unknown phone_number_id: ${phoneNumberId} — add it to merchants.json`);
      return;
    }

    console.log(`📩 [${merchant.name}] ${customerPhone}: ${text}`);

    const reply = await getAIReply(phoneNumberId, customerPhone, text);
    await sendMessage(phoneNumberId, customerPhone, reply);

  } catch (err) {
    console.error("❌ Webhook error:", err);
  }
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  const summary = {};
  merchantKeys.forEach((k) => {
    summary[merchants[k].name] = {
      activeChats: history[k] ? Object.keys(history[k]).length : 0,
    };
  });
  res.json({ status: "running", businesses: summary });
});

app.get("/orders", (req, res) => res.json(loadOrders()));

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🌐 http://localhost:${PORT}`);
  console.log(`\nTo add a new business later:`);
  console.log(`  1. Add its WhatsApp number in Meta → get the phone_number_id`);
  console.log(`  2. Add a new entry in merchants.json with that id as the key`);
  console.log(`  3. Restart — done.\n`);
});