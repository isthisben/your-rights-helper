# Activepieces Webhook Verification Guide

## Webhook URLs

**Export Snapshot** (sends snapshot to email):
- URL: `https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv`
- Triggered: When user clicks "Export Snapshot" in Settings page
- Purpose: Email case snapshot to user

**Case Created** (emails deadline + stores in Google Sheets):
- URL: `https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS`
- Triggered: When user completes intake process
- Purpose: Email deadline calculation and store data in Google Sheets

## Environment Variables Setup

### In Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

```
ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK=https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv
ACTIVEPIECES_CASE_CREATED_WEBHOOK=https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS
```

3. Make sure to select **Production**, **Preview**, and **Development** for both

## How It Works

### 1. Export Snapshot Flow

**User Action:**
- User goes to Settings page
- Enters email address
- Clicks "Export Snapshot" button

**What Happens:**
1. `SettingsPage.tsx` calls `sendExportSnapshot()` with:
   - `caseState`: Full case data
   - `email`: User's input email
   - `timestamp`: Current time
   - `metadata`: Export format info

2. Client sends POST to `/api/activepieces-export-snapshot`

3. Vercel API function (`api/activepieces-export-snapshot.ts`):
   - Reads `ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK` from environment
   - Forwards payload to Activepieces webhook
   - Returns success/error

4. Activepieces flow receives webhook and:
   - Extracts email from `{{trigger.body.email}}`
   - Extracts case data from `{{trigger.body.caseState}}`
   - Sends email with snapshot to user

### 2. Case Created Flow

**User Action:**
- User completes intake form (all 5 steps)
- Clicks "Finish" on final step

**What Happens:**
1. `IntakePage.tsx` calls `sendCaseCreated()` with:
   - `caseState`: Complete case data
   - `email`: From legal advisor form (if provided)
   - `timestamp`: Current time
   - `language`: User's language preference

2. Client sends POST to `/api/activepieces-case-created`

3. Vercel API function (`api/activepieces-case-created.ts`):
   - Reads `ACTIVEPIECES_CASE_CREATED_WEBHOOK` from environment
   - Forwards payload to Activepieces webhook
   - Returns success/error

4. Activepieces flow receives webhook and:
   - Calculates deadline
   - Emails deadline to user (if email provided)
   - Stores data in Google Sheets

## Payload Structure

### Export Snapshot Payload:
```json
{
  "caseState": {
    "scenario": "fired",
    "incidentDate": "2024-01-15",
    "acasStatus": "started",
    "acasStartDate": "2024-01-20",
    // ... all other case fields
  },
  "timestamp": "2024-01-25T10:30:00.000Z",
  "email": "user@example.com",
  "metadata": {
    "format": "json",
    "includeDocuments": true
  }
}
```

### Case Created Payload:
```json
{
  "caseState": {
    "scenario": "fired",
    "incidentDate": "2024-01-15",
    "acasStatus": "started",
    "acasStartDate": "2024-01-20",
    // ... all other case fields
  },
  "timestamp": "2024-01-25T10:30:00.000Z",
  "email": "user@example.com",
  "language": "en-A2"
}
```

## Activepieces Field Paths

### For Export Snapshot Flow:
- Email: `{{trigger.body.email}}`
- Case ID: `{{trigger.body.caseState.caseId}}`
- Scenario: `{{trigger.body.caseState.scenario}}`
- Incident Date: `{{trigger.body.caseState.incidentDate}}`
- ACAS Status: `{{trigger.body.caseState.acasStatus}}`
- ACAS Start Date: `{{trigger.body.caseState.acasStartDate}}`
- Timestamp: `{{trigger.body.timestamp}}`

### For Case Created Flow:
- Email: `{{trigger.body.email}}`
- Scenario: `{{trigger.body.caseState.scenario}}`
- Incident Date: `{{trigger.body.caseState.incidentDate}}`
- ACAS Status: `{{trigger.body.caseState.acasStatus}}`
- Language: `{{trigger.body.language}}`
- All other fields: `{{trigger.body.caseState.*}}`

## Verification Steps

### 1. Check Environment Variables
- [ ] `ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK` is set in Vercel
- [ ] `ACTIVEPIECES_CASE_CREATED_WEBHOOK` is set in Vercel
- [ ] URLs match exactly (no trailing slashes, correct IDs)

### 2. Test Export Snapshot
1. Go to Settings page
2. Enter a test email
3. Click "Export Snapshot"
4. Check Vercel logs for:
   - "Export snapshot webhook called"
   - "Webhook URL: https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv"
   - "Email in payload: [your email]"
   - "Activepieces response status: 200"
5. Check Activepieces dashboard:
   - Go to "WRN - Export Snapshot" flow
   - Check "Runs" tab for recent execution
   - Verify flow completed successfully
   - Check email was sent

### 3. Test Case Created
1. Complete intake form (all 5 steps)
2. Click "Finish" on final step
3. Check Vercel logs for:
   - "Case created webhook called"
   - "Webhook URL: https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS"
   - "Email in payload: [email if provided]"
   - "Activepieces response status: 200"
4. Check Activepieces dashboard:
   - Go to "WRN - Case Created" flow
   - Check "Runs" tab for recent execution
   - Verify flow completed successfully
   - Check email was sent (if email provided)
   - Check Google Sheets for new row

## Troubleshooting

### Issue: Webhook not being called
- Check browser console for errors
- Check Vercel function logs
- Verify API functions are deployed

### Issue: Webhook called but flow doesn't run
- Check Activepieces flow is ACTIVE (toggle ON)
- Check Activepieces Runs tab for errors
- Verify webhook URL matches exactly

### Issue: Email not sent
- Check Activepieces flow run details
- Verify email field uses `{{trigger.body.email}}`
- Check Gmail connection in Activepieces
- Check spam folder

### Issue: Google Sheets not updated
- Check Activepieces flow run details
- Verify field paths use `{{trigger.body.caseState.*}}`
- Check Google Sheets connection in Activepieces
- Verify sheet permissions

## Code Locations

- **Client Integration**: `src/integrations/activepieces/client.ts`
- **Export API**: `api/activepieces-export-snapshot.ts`
- **Case Created API**: `api/activepieces-case-created.ts`
- **Export UI**: `src/pages/SettingsPage.tsx` (handleExportSnapshot)
- **Intake UI**: `src/pages/IntakePage.tsx` (handleNext - when step === 4)
