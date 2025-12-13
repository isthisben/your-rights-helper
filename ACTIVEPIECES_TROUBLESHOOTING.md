# Activepieces Webhook Troubleshooting Guide

## Issue: Webhook Shows Success But No Email Sent

If you see "Export requested! You will receive an email shortly." but no email is received, follow these steps:

## Step 1: Check Vercel Function Logs

1. Go to **Vercel Dashboard** → Your Project
2. Click on **Functions** tab
3. Find `activepieces-export-snapshot` function
4. Click on it to view logs
5. Look for:
   - "Export snapshot webhook called" - confirms the function was called
   - "Email in payload: [email]" - confirms email is being sent
   - "Activepieces response status: [status]" - confirms Activepieces received it

## Step 2: Check Activepieces Dashboard

1. Log into [Activepieces Dashboard](https://cloud.activepieces.com)
2. Go to your **"WRN - Export Snapshot"** flow
3. Check:
   - ✅ Is the flow **ACTIVE**? (Toggle should be ON)
   - ✅ Check the **Runs** tab - do you see recent runs?
   - ✅ Click on a run to see if it completed successfully
   - ✅ Check for any error messages in the run

## Step 3: Verify Webhook Configuration in Activepieces

1. In your Activepieces flow, find the **"Catch Webhook"** trigger
2. Check:
   - Is it configured correctly?
   - Does it match the webhook URL: `https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv`?

## Step 4: Check Email Action in Activepieces Flow

1. In your Activepieces flow, find the **Email** action (Gmail Send Email)
2. Verify:
   - ✅ Email service is configured (Gmail, SMTP, etc.)
   - ✅ **"To" field MUST use**: `{{trigger.body.email}}` (this is the correct path!)
   - ❌ **DO NOT use**: `{{email}}` or `{{body.email}}` - these won't work
   - ✅ Email template/content is configured
   - ✅ No errors in the email action

**CRITICAL**: The correct path in Activepieces is `{{trigger.body.email}}` because:
- `trigger` = the webhook trigger
- `body` = the JSON body of the webhook request
- `email` = the email field in the payload

## Step 5: Test the Webhook Directly

You can test if Activepieces is receiving the webhook:

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try the export again
4. Find the request to `/api/activepieces-export-snapshot`
5. Check:
   - Request payload - does it include `email` field?
   - Response - what does Activepieces return?

## Step 6: Check Payload Format

The webhook sends this payload structure:

```json
{
  "caseState": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "email": "user@example.com",
  "metadata": {
    "format": "json",
    "includeDocuments": true
  }
}
```

In your Activepieces flow, make sure you're accessing:
- **Email**: `{{trigger.body.email}}` ⚠️ **This is the correct path!**
- **Case data**: `{{trigger.body.caseState}}`
- **Timestamp**: `{{trigger.body.timestamp}}`
- **Metadata**: `{{trigger.body.metadata}}`

**Important**: Always use `{{trigger.body.*}}` to access webhook payload data in Activepieces.

## Common Issues

### Issue 1: Email Field Not Set Correctly ⚠️ **MOST COMMON ISSUE**
**Symptom**: Webhook works but email action fails with "Recipient address required"
**Fix**: In Activepieces Gmail action, set "To" field to: `{{trigger.body.email}}`
**NOT**: `{{email}}` or `{{body.email}}` - these won't work!

### Issue 2: Flow Not Active
**Symptom**: No runs appear in Activepieces
**Fix**: Toggle the flow to ACTIVE in Activepieces dashboard

### Issue 3: Email Service Not Configured
**Symptom**: Flow runs but email fails
**Fix**: Configure email service (Gmail, SMTP, etc.) in Activepieces

### Issue 4: Wrong Payload Path
**Symptom**: Email sends but with wrong data or fails
**Fix**: Always use `{{trigger.body.*}}` format:
- ✅ Correct: `{{trigger.body.email}}`
- ✅ Correct: `{{trigger.body.caseState.scenario}}`
- ❌ Wrong: `{{email}}`
- ❌ Wrong: `{{body.email}}`

## Debugging Steps

1. **Check Vercel Logs**: See what's being sent
2. **Check Activepieces Runs**: See if flow is executing
3. **Test Email Action**: Manually trigger the email action in Activepieces
4. **Check Email Service**: Verify email service credentials are correct

## Still Not Working?

1. Check Activepieces flow logs for specific error messages
2. Verify the email address you're using is valid
3. Check spam folder
4. Try a different email address
5. Check if your email service (Gmail, etc.) has any restrictions
