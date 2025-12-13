# Activepieces Webhook Debugging Guide

## Understanding the "Success" Message

**Important**: When you see "Export requested! You will receive an email shortly." - this means:
- ✅ The webhook was **sent** to Activepieces
- ✅ Activepieces **received** the webhook (returned 200 OK)
- ❌ This does **NOT** mean the email was sent
- ❌ This does **NOT** mean the flow completed successfully

Activepieces returns 200 OK immediately when it receives the webhook, **before** the flow executes. The flow may:
- Still be running
- Fail silently later
- Complete successfully
- Have errors that don't affect the webhook response

## How to Verify Flow Execution

### Step 1: Check Activepieces Dashboard

1. Go to [Activepieces Dashboard](https://cloud.activepieces.com)
2. Open your **"WRN - Export Snapshot"** flow
3. Click on **"Runs"** tab
4. Look for recent runs (should match when you clicked "Export Snapshot")
5. Click on a run to see:
   - ✅ **Success** (green) - Flow completed, email should be sent
   - ⚠️ **Failed** (red) - Flow failed, check error message
   - 🔄 **Running** - Flow is still executing

### Step 2: Check Vercel Function Logs

1. Go to **Vercel Dashboard** → Your Project
2. Click **Functions** tab
3. Find `activepieces-export-snapshot`
4. Check logs for:
   - "Export snapshot webhook called" - Confirms function was called
   - "Email in payload: [email]" - Confirms email is in the payload
   - "CaseState scenario: [value]" - Confirms case data is present
   - "Activepieces response status: 200" - Confirms Activepieces received it
   - "Activepieces response body: [response]" - Shows what Activepieces returned

### Step 3: Compare Test vs Real Payload

**When testing in Activepieces:**
- You manually enter test data
- The flow uses that test data

**When called from the app:**
- The app sends the actual `caseState` object
- The payload structure might be different

**To debug:**
1. In Activepieces, go to your flow
2. Click on the **"Catch Webhook"** trigger
3. Check the **"Test"** or **"Sample Data"** section
4. Compare it with what the app is sending (check Vercel logs)

## Common Issues

### Issue 1: Flow Runs But Email Fails

**Symptom**: Activepieces shows flow ran successfully, but no email sent

**Possible causes:**
- Email action failed silently
- Email service (Gmail) not configured correctly
- Email address invalid or blocked
- Gmail API quota exceeded

**Fix:**
1. Check Activepieces flow run details
2. Click on the "Send Gmail Email" action
3. Check for error messages
4. Verify Gmail connection is active

### Issue 2: Flow Doesn't Run At All

**Symptom**: No runs appear in Activepieces dashboard

**Possible causes:**
- Flow is not ACTIVE
- Webhook URL mismatch
- Payload format issue

**Fix:**
1. Verify flow is ACTIVE (toggle should be ON)
2. Check webhook URL matches exactly
3. Check Vercel logs to see what payload was sent

### Issue 3: Flow Runs But With Wrong Data

**Symptom**: Email sends but with wrong/empty data

**Possible causes:**
- Wrong field paths in Activepieces actions
- Data not accessible at the path used

**Fix:**
1. Check field paths match `ACTIVEPIECES_GOOGLE_SHEETS_FIELDS.md`
2. Use `{{trigger.body.email}}` not `{{email}}`
3. Use `{{trigger.body.caseState.scenario}}` for nested fields

## Debugging Checklist

- [ ] Check Activepieces flow is ACTIVE
- [ ] Check Activepieces Runs tab for recent runs
- [ ] Check Vercel function logs for payload details
- [ ] Compare test payload vs real payload structure
- [ ] Verify email action in flow is configured correctly
- [ ] Check Gmail connection is active in Activepieces
- [ ] Verify "To" field uses `{{trigger.body.email}}`
- [ ] Check spam folder for emails
- [ ] Try a different email address

## What the Logs Should Show

**In Vercel Logs, you should see:**
```
Export snapshot webhook called
Payload keys: ['caseState', 'timestamp', 'email', 'metadata']
Email in payload: user@example.com
Has caseState: true
CaseState scenario: fired
CaseState incidentDate: 2024-01-01
CaseState acasStatus: started
Activepieces response status: 200
Activepieces response body: {} (or similar)
```

**If any of these are missing or wrong, that's the issue!**

## Next Steps

1. **Check Vercel logs** - See what's actually being sent
2. **Check Activepieces Runs** - See if flow executed
3. **Compare payloads** - Test vs real payload structure
4. **Fix field paths** - Use correct `{{trigger.body.*}}` paths
