# Vercel Setup Guide

This project uses Vercel serverless functions to securely handle API calls with hidden API keys.

## What Was Changed

- ✅ Removed Supabase dependency
- ✅ Created Vercel API functions in `/api` folder
- ✅ Updated frontend to use new API endpoints
- ✅ API keys are now stored securely in Vercel environment variables

## Steps to Deploy on Vercel

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Your Project
```bash
vercel link
```
This will:
- Ask you to select/create a Vercel project
- Create a `.vercel` folder with project configuration

### 4. Set Environment Variables in Vercel

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Navigate to your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   - **Name:** `GREENPT_API_KEY`
     **Value:** Your GreenPT API key
     **Environment:** Production, Preview, Development (select all)

   - **Name:** `ELEVENLABS_API_KEY`
     **Value:** Your ElevenLabs API key
     **Environment:** Production, Preview, Development (select all)

   - **Name:** `ACTIVEPIECES_CASE_CREATED_WEBHOOK`
     **Value:** `https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS`
     **Environment:** Production, Preview, Development (select all)

   - **Name:** `ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK`
     **Value:** `https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv`
     **Environment:** Production, Preview, Development (select all)

**Option B: Via CLI**
```bash
vercel env add GREENPT_API_KEY
vercel env add ELEVENLABS_API_KEY
vercel env add ACTIVEPIECES_CASE_CREATED_WEBHOOK
vercel env add ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK
```

### 5. Deploy to Vercel

**For Production:**
```bash
vercel --prod
```

**For Preview:**
```bash
vercel
```

### 6. Update Frontend Environment Variable (Optional)

After deployment, you'll get a URL like `https://your-project.vercel.app`

If you want to use a custom domain or need to specify the API URL explicitly, create a `.env` file:

```env
VITE_API_URL=https://your-project.vercel.app/api
```

**Note:** In production, the frontend will automatically use `/api/...` which Vercel will route to your serverless functions.

## Local Development

For local development, you have two options:

### Option 1: Use Vercel CLI (Recommended)
```bash
vercel dev
```
This will:
- Start a local server that mimics Vercel's environment
- Automatically use your environment variables from Vercel
- Proxy API calls to your local functions

### Option 2: Use Vite Dev Server
```bash
npm run dev
```
The Vite config is set up to proxy `/api` calls. However, you'll need to:
- Either run `vercel dev` in another terminal for the API functions
- Or set `VITE_API_URL` to point to your deployed Vercel functions

## API Endpoints

- **Chat:** `POST /api/chat`
  - Body: `{ messages: Array<{ role: string, content: string }> }`
  - Returns: Streaming text/event-stream response

- **Text-to-Speech:** `POST /api/text-to-speech`
  - Body: `{ text: string, language?: string, speed?: number }`
  - Returns: Audio/mpeg stream

## Troubleshooting

### API returns 500 error
- Check that environment variables are set in Vercel
- Check Vercel function logs: `vercel logs`

### CORS errors
- The API functions already include CORS headers
- Make sure you're using the correct API URL

### Functions not found
- Make sure the `/api` folder is in the root of your project
- Check that `vercel.json` is configured correctly

## Project Structure

```
your-rights-helper/
├── api/
│   ├── chat.ts              # Chat API function
│   └── text-to-speech.ts    # TTS API function
├── src/
│   └── components/
│       └── ChatWidget.tsx   # Updated to use new API
├── vercel.json              # Vercel configuration
└── package.json             # Updated dependencies
```

## Next Steps

1. Deploy to Vercel
2. Set environment variables
3. Test the chat and TTS functionality
4. Update any documentation with your new deployment URL

