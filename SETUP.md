# VyapaarAI — Setup Guide

## Step 1: Install Node.js
Download from https://nodejs.org (choose LTS version)

## Step 2: Set up the project
```
npm install
cp .env.example .env
```

## Step 3: Fill in your .env file

Open .env and fill in 4 values:

### WHATSAPP_TOKEN
1. Go to developers.facebook.com
2. Open your app → WhatsApp → API Setup
3. Copy the "Temporary access token" (starts with EAA...)
4. Paste as WHATSAPP_TOKEN

### PHONE_NUMBER_ID
1. Same page as above
2. Copy the "Phone number ID" (a long number)
3. Paste as PHONE_NUMBER_ID

### VERIFY_TOKEN
Already set to: vyapaarai_secret_2026
(You can change it to anything — just remember it)

### ANTHROPIC_API_KEY
1. Go to console.anthropic.com
2. Click API Keys → Create Key
3. Paste as ANTHROPIC_API_KEY

## Step 4: Edit your business details
Open index.js and find BUSINESS_CONFIG near the top.
Change the name, catalogue, prices to match your merchant.

## Step 5: Test locally
```
node index.js
```
You should see: "VyapaarAI server running on port 3000"

## Step 6: Deploy to Railway
1. Go to railway.app → sign up free
2. Click "New Project" → "Deploy from GitHub"
3. Push this folder to GitHub first, then connect it
4. Add your .env values in Railway's "Variables" tab
5. Railway gives you a public URL like: https://vyapaarai-production.up.railway.app

## Step 7: Connect to Meta
1. Go to Meta Developer → Your App → WhatsApp → Configuration
2. Webhook URL: https://YOUR-RAILWAY-URL/webhook
3. Verify token: vyapaarai_secret_2026
4. Subscribe to: messages
5. Click Verify

## Step 8: Test it!
Send a WhatsApp message to your Meta test number.
You should get an AI reply within 3-5 seconds.

## Troubleshooting
- Check Railway logs if something goes wrong
- Make sure all 4 .env values are filled correctly
- Temporary WhatsApp token expires in 24 hours — get a permanent one later
