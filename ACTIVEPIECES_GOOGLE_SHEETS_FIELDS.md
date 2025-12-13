# Activepieces Google Sheets Field Mapping Guide

This guide shows you exactly which fields to use in your Activepieces "Google Sheets - Add Row" action to correctly map all the case data.

## Payload Structure

The webhook sends this structure:
```json
{
  "caseState": {
    "scenario": "fired",
    "incidentDate": "2024-01-01",
    "incidentDateUnknown": false,
    "acasStatus": "started",
    "acasStartDate": "2024-01-15",
    "language": "en-A2",
    "legalAdvisor": { "name": "...", "phone": "...", "email": "..." },
    ...
  },
  "email": "user@example.com",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

## Google Sheets Column Mapping

In your Activepieces "Google Sheets - Add Row" action, use these exact paths for each column:

### Basic Case Information

| Column Name | Activepieces Field Path | Example Value |
|------------|------------------------|---------------|
| **Email** | `{{trigger.body.email}}` | user@example.com |
| **Timestamp** | `{{trigger.body.timestamp}}` | 2024-01-01T00:00:00.000Z |
| **Scenario** | `{{trigger.body.caseState.scenario}}` | fired, hourscut, jobchanged, etc. |
| **Incident Date** | `{{trigger.body.caseState.incidentDate}}` | 2024-01-01 |
| **Incident Date Unknown** | `{{trigger.body.caseState.incidentDateUnknown}}` | true or false |
| **Language** | `{{trigger.body.caseState.language}}` | en-A2, cy, pl, etc. |

### ACAS Information

| Column Name | Activepieces Field Path | Example Value |
|------------|------------------------|---------------|
| **ACAS Status** | `{{trigger.body.caseState.acasStatus}}` | not_started, started, unknown |
| **ACAS Start Date** | `{{trigger.body.caseState.acasStartDate}}` | 2024-01-15 or null |

### Legal Advisor Information

| Column Name | Activepieces Field Path | Example Value |
|------------|------------------------|---------------|
| **Legal Advisor Name** | `{{trigger.body.caseState.legalAdvisor.name}}` | John Doe or empty |
| **Legal Advisor Phone** | `{{trigger.body.caseState.legalAdvisor.phone}}` | +44 123 456 7890 or empty |
| **Legal Advisor Email** | `{{trigger.body.caseState.legalAdvisor.email}}` | advisor@example.com or empty |

### Journey Progress

| Column Name | Activepieces Field Path | Notes |
|------------|------------------------|-------|
| **Intake Completed** | `{{trigger.body.caseState.intakeCompleted}}` | true or false |
| **Current Intake Step** | `{{trigger.body.caseState.currentIntakeStep}}` | 0-4 |

### Journey Step Completion

For journey progress, you can check individual steps:

| Column Name | Activepieces Field Path | Notes |
|------------|------------------------|-------|
| **ACAS Completed** | `{{trigger.body.caseState.journeyProgress.acas.completed}}` | true, false, or empty if not started |
| **ACAS Completed At** | `{{trigger.body.caseState.journeyProgress.acas.completedAt}}` | ISO date string or empty |
| **ACAS Certificate Number** | `{{trigger.body.caseState.journeyProgress.acas.certificateNumber}}` | Certificate number or empty |
| **ET1 Completed** | `{{trigger.body.caseState.journeyProgress.et1.completed}}` | true, false, or empty |
| **ET1 Case Number** | `{{trigger.body.caseState.journeyProgress.et1.certificateNumber}}` | Case number or empty |

## Common Field Paths Summary

**Top-level fields:**
- Email: `{{trigger.body.email}}`
- Timestamp: `{{trigger.body.timestamp}}`

**Case State fields (nested):**
- Scenario: `{{trigger.body.caseState.scenario}}`
- Incident Date: `{{trigger.body.caseState.incidentDate}}`
- ACAS Status: `{{trigger.body.caseState.acasStatus}}`
- ACAS Start Date: `{{trigger.body.caseState.acasStartDate}}`
- Language: `{{trigger.body.caseState.language}}`

**Legal Advisor (nested in caseState):**
- Name: `{{trigger.body.caseState.legalAdvisor.name}}`
- Phone: `{{trigger.body.caseState.legalAdvisor.phone}}`
- Email: `{{trigger.body.caseState.legalAdvisor.email}}`

**Journey Progress (nested in caseState):**
- ACAS Completed: `{{trigger.body.caseState.journeyProgress.acas.completed}}`
- ACAS Certificate: `{{trigger.body.caseState.journeyProgress.acas.certificateNumber}}`

## Important Notes

1. **Always use `{{trigger.body.*}}` format** - this is required in Activepieces
2. **Nested objects use dot notation** - e.g., `caseState.scenario` not `caseState[scenario]`
3. **Optional fields may be null** - use conditional logic if needed
4. **Dates are ISO strings** - format them in Activepieces if needed

## Example: Complete Google Sheets Row

Here's an example of how to set up your Google Sheets action:

```
Spreadsheet: [Your Google Sheet]
Worksheet: [Your Worksheet Name]
Values:
  - Email: {{trigger.body.email}}
  - Scenario: {{trigger.body.caseState.scenario}}
  - Incident Date: {{trigger.body.caseState.incidentDate}}
  - ACAS Status: {{trigger.body.caseState.acasStatus}}
  - ACAS Start Date: {{trigger.body.caseState.acasStartDate}}
  - Legal Advisor Name: {{trigger.body.caseState.legalAdvisor.name}}
  - Legal Advisor Email: {{trigger.body.caseState.legalAdvisor.email}}
  - Language: {{trigger.body.caseState.language}}
  - Timestamp: {{trigger.body.timestamp}}
```

## Troubleshooting

### Field shows as empty/null

1. **Check the field path** - Make sure you're using the exact path shown above
2. **Check if field exists** - Some fields are optional and may be null
3. **Use conditional logic** - In Activepieces, you can use:
   ```
   {{trigger.body.caseState.legalAdvisor.name || 'Not provided'}}
   ```

### Date formatting

If you need to format dates, you can use Activepieces date formatting or add a "Format Date" action before the Google Sheets action.

### Testing

1. Use Activepieces "Test Flow" feature
2. Check the webhook payload in the trigger step
3. Verify each field path matches the data structure shown above
