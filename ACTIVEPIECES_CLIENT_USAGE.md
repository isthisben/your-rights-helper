# Activepieces Client Integration Usage

This document explains how to use the Activepieces client integration in your application.

## Environment Variables

### For Production (Vercel)

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

```env
ACTIVEPIECES_CASE_CREATED_WEBHOOK=https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS
ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK=https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv
```

**Note**: These are server-side environment variables stored securely in Vercel. The webhooks are called through Vercel API functions to avoid CORS issues.

### For Local Development

When running `vercel dev`, these environment variables will be loaded from Vercel. You can also create a `.env.local` file (not committed to git) with:

```env
ACTIVEPIECES_CASE_CREATED_WEBHOOK=https://cloud.activepieces.com/api/v1/webhooks/ZnzLKUbit9Ym3lAnih8fS
ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK=https://cloud.activepieces.com/api/v1/webhooks/ZARKWOUWKYS9hFazGxVGv
```

## Usage Examples

### 1. Case Created Webhook

Call `sendCaseCreated` when a user completes the intake process or creates a new case.

**Suggested location**: `src/pages/IntakePage.tsx` - After intake completion

```typescript
import { sendCaseCreated } from '@/integrations/activepieces/client';
import { useApp } from '@/context/AppContext';

// In your component:
const { caseState } = useApp();

const handleIntakeComplete = async () => {
  try {
    // Get email from legal advisor if available, or from reminder signup
    const email = caseState.legalAdvisor?.email || 
                  localStorage.getItem('wrn-reminder-email') || 
                  undefined;

    await sendCaseCreated({
      caseState,
      timestamp: new Date().toISOString(),
      email,
      language: caseState.language,
    });

    // Show success message
    toast.success('Case created successfully!');
  } catch (error) {
    // Handle error gracefully - don't block user flow
    console.error('Failed to send case created webhook:', error);
    // Optionally show a non-blocking error message
    toast.error('Failed to send case creation notification');
  }
};
```

### 2. Export Snapshot Webhook

Call `sendExportSnapshot` when a user requests to export their case data.

**Suggested location**: `src/pages/DashboardPage.tsx` or `src/pages/SettingsPage.tsx` - Export button handler

```typescript
import { sendExportSnapshot } from '@/integrations/activepieces/client';
import { useApp } from '@/context/AppContext';

// In your component:
const { caseState } = useApp();

const handleExportSnapshot = async () => {
  try {
    // Get email from legal advisor if available, or prompt user
    const email = caseState.legalAdvisor?.email || 
                  prompt('Enter your email to receive the export:') ||
                  undefined;

    await sendExportSnapshot({
      caseState,
      timestamp: new Date().toISOString(),
      email,
      metadata: {
        format: 'json',
        includeDocuments: true,
      },
    });

    toast.success('Export request sent! You will receive an email shortly.');
  } catch (error) {
    console.error('Failed to send export snapshot webhook:', error);
    toast.error('Failed to request export. Please try again.');
  }
};
```

## Error Handling

The functions throw `ActivepiecesError` which includes:
- `message`: Error description
- `statusCode`: HTTP status code (if available)
- `response`: Response data (if available)

**Best Practice**: Always wrap webhook calls in try-catch blocks and handle errors gracefully. Don't block the user's workflow if a webhook fails - these are fire-and-forget operations.

```typescript
try {
  await sendCaseCreated(payload);
} catch (error) {
  if (error instanceof ActivepiecesError) {
    console.error('Activepieces error:', error.message, error.statusCode);
  } else {
    console.error('Unexpected error:', error);
  }
  // Continue with user flow - don't block on webhook failures
}
```

## Integration Points

### Where to call `sendCaseCreated`:

1. **IntakePage.tsx** - After user completes intake form (when `intakeCompleted` becomes true)
2. **WelcomePage.tsx** - If you want to track when users first start
3. **AppContext.tsx** - In `updateCaseState` when `intakeCompleted` transitions from false to true

### Where to call `sendExportSnapshot`:

1. **DashboardPage.tsx** - Add an "Export Case" button
2. **SettingsPage.tsx** - Add an "Export Data" option
3. **Any component** - Wherever you want to provide export functionality

## Testing

To test the integration locally:

1. Ensure environment variables are set in `.env.local`
2. Start the dev server: `npm run dev`
3. Trigger the webhook calls from the UI
4. Check Activepieces dashboard to see if webhooks were received
5. Check browser console for any errors

## Notes

- Webhooks are sent asynchronously and don't block the UI
- If a webhook fails, the user experience should continue normally
- Email is optional but recommended for both webhooks
- The full `caseState` is included in both payloads for complete context
