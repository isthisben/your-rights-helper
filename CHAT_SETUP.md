# Chat Function Setup Guide

## Issue: Chat showing "Network error" or "No response received"

The chat functionality requires:
1. **Supabase Edge Function deployed**: The `chat` function in `supabase/functions/chat/` must be deployed
2. **GREENPT_API_KEY configured**: The API key must be set in Supabase environment variables

## To Fix:

### Option 1: Deploy the Supabase Function
```bash
# Make sure you have Supabase CLI installed
supabase functions deploy chat
```

### Option 2: Set Environment Variables in Supabase
1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions > Secrets
3. Add `GREENPT_API_KEY` with your GreenPT API key

### Option 3: Check Environment Variables Locally
Make sure you have a `.env` file with:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

## Testing the Function

You can test if the function is accessible by checking:
- Browser console for CORS errors
- Network tab for 404/500 errors
- Supabase logs for function execution errors

