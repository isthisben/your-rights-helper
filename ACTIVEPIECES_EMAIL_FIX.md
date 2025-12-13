# Activepieces Email Field Fixes

## Issue 1: Case Created - Email Not Reaching Gmail

**Problem**: Email shows as `"receiver": ["   "]` (three spaces) even though webhook contains `"email": "ben.bykovski@gmail.com"`

**Root Cause**: Gmail action "To" field is not using the correct path to access email from webhook.

**Fix in Activepieces**:

1. Open your **"WRN - Case Created"** flow
2. Click on the **"Send Gmail Email"** action
3. Find the **"To"** field (recipient email)
4. **Change it to**: `{{trigger.body.email}}`
   - NOT `{{email}}`
   - NOT `{{body.email}}`
   - NOT `{{trigger.email}}`
   - MUST be: `{{trigger.body.email}}`

5. Save the flow
6. Test again

**Verification**: After fixing, the Gmail action input should show:
```json
{
  "receiver": ["ben.bykovski@gmail.com"]  // ✅ Actual email, not spaces
}
```

---

## Issue 2: Export Snapshot - Placeholder Values in Email

**Problem**: Email sends but shows placeholder names like `case_id`, `incident_date` instead of actual values.

**Root Cause**: Email body is using Google Sheets lookup paths instead of webhook data directly.

**Current (Wrong) Paths**:
- `{{step_1[0]['values']['case_id']}}` ❌
- `{{step_1[0]['values']['incident_date']}}` ❌

**Fix in Activepieces**:

You have two options:

### Option A: Use Webhook Data Directly (Recommended - Simpler)

1. Open your **"WRN - Export Snapshot"** flow
2. Click on the **"Send Gmail Email"** action
3. In the email body, replace all field paths with webhook paths:

**Correct Paths**:
- Case ID: `{{trigger.body.caseState.caseId}}` (if exists) or use a generated ID
- Incident Date: `{{trigger.body.caseState.incidentDate}}`
- ACAS Started: `{{trigger.body.caseState.acasStatus}}`
- Deadline: Calculate from `{{trigger.body.caseState.incidentDate}}` or use a code step
- Resume URL: `{{trigger.body.caseState.resumeUrl}}` (if exists)
- Free Text: `{{trigger.body.caseState.notes}}` (if exists)

**Example Email Body**:
```
Hi,
This is a case snapshot from WorkRight Navigator.
This tool gives information and helps you organise next steps. It is not legal advice.

Key details (as saved):
• Case ID: {{trigger.body.caseState.caseId}}
• Incident date: {{trigger.body.caseState.incidentDate}}
• ACAS started: {{trigger.body.caseState.acasStatus}}
• Likely deadline (3 months minus 1 day): [calculate from incidentDate]

Next steps (simple checklist):
1) If ACAS has not started, start Early Conciliation.
2) Write 3 key events (date + what happened + who was there).
3) Save any messages, emails, letters, or screenshots as evidence.

Resume link: {{trigger.body.caseState.resumeUrl}}
Extra note: {{trigger.body.caseState.notes}}

Official information:
https://www.acas.org.uk/early-conciliation
https://www.acas.org.uk/employment-tribunal-time-limits

Take care,
WorkRight Navigator
```

### Option B: Keep Google Sheets Lookup (More Complex)

If you want to keep using Google Sheets:

1. Make sure the Google Sheets "Find Rows" step is correctly configured
2. The step reference should be the actual step name/number
3. Use the correct path format: `{{step_name[0]['values']['column_name']}}`

**But this is more error-prone** - Option A is recommended.

---

## Field Mapping Reference

Based on the webhook payload structure, here are the correct paths:

### From `trigger.body.caseState.*`:
- Scenario: `{{trigger.body.caseState.scenario}}`
- Incident Date: `{{trigger.body.caseState.incidentDate}}`
- ACAS Status: `{{trigger.body.caseState.acasStatus}}`
- ACAS Start Date: `{{trigger.body.caseState.acasStartDate}}`
- Language: `{{trigger.body.caseState.language}}`
- Legal Advisor Name: `{{trigger.body.caseState.legalAdvisor.name}}`
- Legal Advisor Email: `{{trigger.body.caseState.legalAdvisor.email}}`
- Legal Advisor Phone: `{{trigger.body.caseState.legalAdvisor.phone}}`

### From `trigger.body.*`:
- Email: `{{trigger.body.email}}`
- Timestamp: `{{trigger.body.timestamp}}`
- Language: `{{trigger.body.language}}`

---

## Testing After Fixes

1. **Case Created**:
   - Complete intake form with legal advisor email
   - Check Activepieces run - Gmail action should show actual email in "receiver"
   - Email should send successfully

2. **Export Snapshot**:
   - Enter email and click "Export Snapshot"
   - Check Activepieces run - email body should show actual values
   - Email should contain real data, not placeholders

---

## Important Notes

- **DO NOT** change the webhook URLs or API code - those are working correctly
- **ONLY** fix the Activepieces flow configuration
- The email field paths are case-sensitive
- Use `trigger.body.*` for webhook data, not `body.*` or just `*`
