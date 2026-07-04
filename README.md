# VyapaarAI 🛍️

A multi-merchant WhatsApp AI business assistant that helps Indian SMB merchants manage orders and talk to customers — in their own language.

🔗 **Deployed on Railway**

## What It Does

VyapaarAI lets small and medium businesses run their entire customer conversation and order flow over WhatsApp, powered by an AI assistant that speaks the merchant's and customer's local language instead of forcing everyone into English or Hindi-only bots.

## Features

- 🏪 **Multi-merchant support** — onboard multiple businesses on one platform
- 🌐 **Multi-language conversations** — Hindi, Gujarati, Tamil, Telugu, Marathi, Bengali
- 📦 **Order notifications** — automatic customer and merchant updates as orders progress
- 🙋 **Human takeover/pause system** — merchant can step in and pause the AI mid-conversation when a customer needs a real person
- 🔌 **REST API** — order management endpoints for integration with other merchant tools

## Why It Matters

Most SMB-facing chatbots in India assume merchants and customers are comfortable in English or Hindi. VyapaarAI is built around the reality that a huge share of India's small business commerce happens in regional languages — the AI adapts to the conversation instead of the other way around.

## Tech Stack

- **Backend:** Node.js, Express
- **Messaging:** Meta WhatsApp Business API
- **LLM:** Groq (Llama 3.3-70B)
- **Data:** JSON-based merchant/order storage (`merchants.json`, `orders.json`)
## Project Structure
├── index.js          # main server
├── merchants.json    # merchant records
├── orders.json       # order records
├── railway.json      # Railway deployment config
├── .env.example      # environment variable template
└── SETUP.md          # setup instructions

## Getting Started

```bash
git clone https://github.com/janvi2741/VyapaarAI.git
cd VyapaarAI
npm install
cp .env.example .env   # fill in your credentials
node index.js
```

See `SETUP.md` for full setup details.

## Screenshots / Demo

[Add a screenshot or short demo GIF of a WhatsApp conversation flow]

---
*Founder project — built to solve a real gap in how Indian SMBs handle customer conversations across language barriers.*
- **Deployment:** Railway

## Project Structure
