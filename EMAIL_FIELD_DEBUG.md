# Email Field Debugging - Root Cause Analysis

## Problem Statement

- **Symptom**: Gmail fails with "Recipient address required" when triggered from deployed website
- **Working**: Manual Activepieces test runs work correctly
- **Observation**: Vercel logs show email exists, but Activepieces Gmail action shows empty "To" field

## Data Flow Trace

### 1. Frontend → Client (✅ CORRECT)

**File**: `src/pages/SettingsPage.tsx:52-60`
```typescript
await sendExportSnapshot({
  caseState,
  timestamp: new Date().toISOString(),
  email,  // ✅ Email is a string here
  metadata: { ... }
});
```

**File**: `src/integrations/activepieces/client.ts:136-142`
```typescript
const response = await fetch(EXPORT_SNAPSHOT_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),  // ✅ Email should be in JSON string
});
```

**Status**: ✅ Email field is correctly included in JSON string

### 2. Client → Vercel API Route (⚠️ POTENTIAL ISSUE)

**File**: `api/activepieces-export-snapshot.ts:27`
```typescript
const payload = req.body;  // ⚠️ Vercel auto-parses, but might be unreliable
```

**Problem**: Vercel's `@vercel/node` automatically parses JSON bodies, but:
- If Content-Type is wrong, body might be string
- If parsing fails silently, body might be undefined
- If body is already parsed, it might be transformed

**Previous Code** (BEFORE FIX):
```typescript
const payload = req.body;  // Assumes Vercel parsed it correctly
body: JSON.stringify(payload),  // Re-stringifies (might lose email if payload is malformed)
```

### 3. Vercel API → Activepieces Webhook (🔴 BUG LOCATION)

**File**: `api/activepieces-export-snapshot.ts:46-52` (BEFORE FIX)
```typescript
const response = await fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),  // 🔴 If payload.email is undefined/null, it gets stringified as null
});
```

**Root Cause**: 
1. If `req.body` is not properly parsed, `payload.email` might be `undefined`
2. `JSON.stringify({ email: undefined })` results in `{}` (email field is dropped)
3. Activepieces receives `{}` instead of `{ email: "user@example.com" }`
4. Gmail action tries to use `{{trigger.body.email}}` which is undefined
5. Gmail API rejects with "Recipient address required"

## The Fix

### Explicit Body Parsing
```typescript
// Handle both string and object body types
let payload: any;
if (typeof req.body === 'string') {
  payload = JSON.parse(req.body);
} else if (req.body && typeof req.body === 'object') {
  payload = req.body;
} else {
  return res.status(400).json({ error: 'Invalid request body' });
}
```

### Email Validation
```typescript
// Validate email exists and is a string
if (!payload.email || typeof payload.email !== 'string') {
  return res.status(400).json({ 
    error: 'Email field is required and must be a string'
  });
}
```

### Explicit Payload Construction
```typescript
// Construct payload explicitly to ensure email is at top level
const webhookPayload = {
  email: payload.email,  // ✅ Explicitly ensure email is first
  timestamp: payload.timestamp,
  caseState: payload.caseState,
  metadata: payload.metadata,
};
```

## Why Manual Test Runs Work

When you test in Activepieces:
1. You manually enter test data
2. Activepieces creates a test payload with email field
3. The test payload structure matches what Activepieces expects

When triggered from website:
1. Frontend sends correct payload
2. Vercel might not parse body correctly (edge case)
3. Email field gets lost during re-stringification
4. Activepieces receives payload without email

## Verification Steps

After deploying the fix:

1. **Check Vercel Logs** - Should see:
   ```
   Email in payload: user@example.com
   Email type: string
   Payload being sent to Activepieces: {"email":"user@example.com",...}
   ```

2. **Check Activepieces Run** - Should see:
   - Email field populated in trigger body
   - Gmail "To" field shows email address

3. **Test Both Flows**:
   - Export Snapshot (email required)
   - Case Created (email optional)

## Files Changed

- `api/activepieces-export-snapshot.ts` - Added explicit parsing, validation, and payload construction
- `api/activepieces-case-created.ts` - Added explicit parsing and payload construction

## Key Changes

1. ✅ Explicit body parsing (handles string and object)
2. ✅ Email validation (ensures email is string)
3. ✅ Explicit payload construction (ensures email is at top level)
4. ✅ Enhanced logging (shows exact payload being sent)
