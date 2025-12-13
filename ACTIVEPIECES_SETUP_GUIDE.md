# Activepieces Webhook Setup Guide - Step by Step

This guide will walk you through setting up Activepieces webhooks to work with your application.

## Step 1: Add Environment Variables in Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account
   - Navigate to your project (`your-rights-helper`)

2. **Navigate to Environment Variables**
   - Click on your project
   - Go to **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add the First Webhook URL**
   - Click **Add New**
   - **Key**: `ACTIVEPIECES_CASE_CREATED_WEBHOOK`
   - **Value**: `https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS`
   - **Environment**: Select all three:
     - ☑ Production
     - ☑ Preview
     - ☑ Development
   - Click **Save**

4. **Add the Second Webhook URL**
   - Click **Add New** again
   - **Key**: `ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK`
   - **Value**: `https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv`
   - **Environment**: Select all three:
     - ☑ Production
     - ☑ Preview
     - ☑ Development
   - Click **Save**

### Option B: Via Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add ACTIVEPIECES_CASE_CREATED_WEBHOOK
# When prompted, enter: https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS
# Select: Production, Preview, Development

vercel env add ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK
# When prompted, enter: https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv
# Select: Production, Preview, Development
```

## Step 2: Deploy to Vercel

### If Your Project is Already Connected to Vercel

Your project should auto-deploy when you push to main. Check:
1. Go to Vercel Dashboard → Your Project
2. Check the **Deployments** tab
3. You should see a new deployment from your recent push
4. Wait for it to finish (usually 1-2 minutes)

### If You Need to Deploy Manually

```bash
# Make sure you're in the project directory
cd "c:\Users\20241484\Documents\WorkRightsNavigatorUK\your-rights-helper"

# Deploy to production
vercel --prod
```

## Step 3: Verify Environment Variables Are Set

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify both variables are listed:
   - `ACTIVEPIECES_CASE_CREATED_WEBHOOK`
   - `ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK`

## Step 4: Test the Webhooks

### Test Case Created Webhook

1. **Open your deployed app** (or run `vercel dev` for local testing)
2. **Complete the intake form**:
   - Go through all intake steps
   - Fill in the required information
   - Click "Finish" on the last step
3. **Check the result**:
   - The app should navigate to the dashboard (no errors)
   - Check your Activepieces dashboard to see if the webhook was received
   - Check browser console (F12) for any errors

### Test Export Snapshot Webhook

1. **Go to Settings page** in your app
2. **Find the "Export Case Data" section**
3. **Enter an email address**
4. **Click "Export Snapshot"**
5. **Check the result**:
   - You should see a success message: "Export requested! You will receive an email shortly."
   - Check your Activepieces dashboard to see if the webhook was received
   - Check browser console (F12) for any errors

## Step 5: Local Development Setup

For local development, you have two options:

### Option 1: Use Vercel Dev (Recommended)

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Run Vercel dev server (this will use your Vercel environment variables)
vercel dev
```

This will:
- Start your Vite dev server
- Run your API functions locally
- Use environment variables from Vercel

### Option 2: Create Local .env File

If you want to test without Vercel dev, create a `.env.local` file in the project root:

```env
ACTIVEPIECES_CASE_CREATED_WEBHOOK=https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS
ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK=https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv
```

**Note**: This file should NOT be committed to git (it's already in .gitignore).

## Troubleshooting

### Webhook Not Working?

1. **Check Environment Variables**
   - Verify they're set in Vercel Dashboard
   - Make sure they're set for the correct environment (Production/Preview/Development)

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for any error messages
   - Check Network tab to see if the API call is being made

3. **Check Vercel Function Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on the function (e.g., `activepieces-case-created`)
   - Check the logs for any errors

4. **Verify Webhook URLs**
   - Make sure the URLs are exactly:
     - `https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS`
     - `https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv`

5. **Check Activepieces Dashboard**
   - Log into your Activepieces account
   - Check if the webhooks are being received
   - Verify your flows are active and configured correctly

### Still Having Issues?

- Check that your Vercel deployment is successful
- Make sure you've redeployed after adding environment variables
- Try redeploying: Go to Vercel Dashboard → Deployments → Click "Redeploy" on the latest deployment

## Summary

✅ **What You Need to Do:**
1. Add 2 environment variables in Vercel Dashboard
2. Wait for auto-deployment (or deploy manually)
3. Test the webhooks

✅ **What's Already Done:**
- API functions created (`api/activepieces-case-created.ts`, `api/activepieces-export-snapshot.ts`)
- Client code updated to use API endpoints
- CORS issues fixed
- Code pushed to main branch

Once you complete Step 1 (adding environment variables) and Step 2 (deployment), your Activepieces webhooks should work! 🎉
