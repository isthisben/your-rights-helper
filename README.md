# Work Rights Navigator

A comprehensive web application designed to help people in the UK navigate employment tribunal processes. The app provides step-by-step guidance, deadline tracking, document preparation tools, and an AI-powered chatbot to assist users through their employment rights journey.

**🌐 View the live application: [https://your-rights-helper.vercel.app/](https://your-rights-helper.vercel.app/)**

## Overview

Work Rights Navigator is a user-friendly, accessible web application that guides individuals through the complex process of UK employment tribunals. Built with accessibility and inclusivity at its core, the app supports multiple languages, provides plain-language explanations, and offers comprehensive tools to help users organize their case information and meet critical deadlines.

## Features

### Core Functionality

- **Intake Process**: Guided multi-step questionnaire to understand the user's employment situation, including scenario selection, incident date tracking, and ACAS status
- **Journey Mapping**: Visual step-by-step guide through the employment tribunal process with progress tracking and completion status
- **Deadline Tracking**: Automatic calculation of important deadlines with ACAS Early Conciliation extensions (up to 30 days)
- **Document Preparation**: Interactive wizards for creating essential tribunal documents:
  - Witness statements
  - Schedule of loss
  - Chronology of events
  - List of issues
- **AI Chatbot**: Powered by **GreenPT API** (green-l-raw model) with custom prompts and data injection to provide comforting, empathetic responses. The chatbot uses A2-level English with streaming responses and is specifically designed to be calm, friendly, and supportive for users experiencing stress during employment issues
- **Case Export**: Download or email complete case details as a formatted text file to share with legal advisors. Email functionality powered by **ActivePieces** workflow automation
- **Legal Advisor Integration**: Store and manage legal advisor contact information for easy case sharing

### Accessibility Features

- **Multi-language Support**: 8 languages with full RTL support
  - English (A2 level - simplified for accessibility)
  - Welsh (Cymraeg)
  - Polish (Polski)
  - Urdu (اردو) - RTL
  - Punjabi (ਪੰਜਾਬੀ)
  - Bengali (বাংলা)
  - Romanian (Română)
  - Arabic (العربية) - RTL
- **Text Size Adjustment**: Three size options (small, medium, large) with global scaling
- **High Contrast Mode**: Enhanced visibility for low vision users with high-contrast color schemes
- **Colorblind Mode**: Comprehensive support for three types of colorblindness:
  - Protanopia (red-blind)
  - Deuteranopia (green-blind)
  - Tritanopia (blue-blind)
- **Dyslexia-Friendly Font**: Lexie Readable font option for improved readability
- **Text-to-Speech**: Dual integration with Web Speech API and ElevenLabs for high-quality audio output
- **Speech Recognition**: Voice input for chatbot interactions
- **Reduce Motion**: Respects user's motion preferences for accessibility
- **Speech Rate Control**: Adjustable text-to-speech speed
- **Auto-read Messages**: Optional automatic reading of chatbot responses

### User Interface & Experience

- **Animated Welcome Page**: Full-screen scroll experience with:
  - Interactive DotGrid background with mouse interaction and shockwave effects
  - ScrollReveal animations with word-by-word reveal, blur, and rotation effects
  - Snap scrolling for page-like navigation
  - Smooth fade-in animations as sections enter viewport
- **Animated Dock Navigation**: macOS-style dock with hover magnification and smooth animations
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces (minimum 44px tap targets)
- **Smooth Animations**: Framer Motion and GSAP for fluid transitions and scroll-linked animations
- **Error Boundaries**: Comprehensive error handling with user-friendly error messages
- **Offline Support**: Local storage for case data persistence across sessions
- **Chat History Persistence**: Chat conversations saved locally and restored on page reload

### Technical Features

- **Performance Optimized**: 
  - Lazy loading
  - Memoization with React.useMemo and useCallback
  - Efficient state management
  - Debounced inputs
- **Type Safety**: Full TypeScript implementation with strict type checking
- **State Management**: React Context API with localStorage persistence
- **API Security**: Serverless functions on Vercel to hide API keys
- **Streaming Responses**: Real-time streaming for chatbot responses
- **Race Condition Handling**: Proper handling of concurrent API requests

## Tech Stack

### Frontend

- **Framework**: React 18.3.1 with TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19 with SWC for fast compilation
- **Styling**: 
  - Tailwind CSS 3.4.17 for utility-first styling
  - shadcn/ui components built on Radix UI primitives
  - Custom CSS for animations and accessibility features
- **Routing**: React Router DOM 6.30.1 with animated page transitions
- **State Management**: React Context API with localStorage persistence
- **Animations**: 
  - Framer Motion 12.23.26 for component animations
  - GSAP 3.14.2 with ScrollTrigger and InertiaPlugin for scroll animations
- **Date Handling**: date-fns 3.6.0 for date calculations and formatting
- **UI Components**: 
  - Radix UI primitives for accessible components
  - Lucide React 0.462.0 for icons
  - Sonner 1.7.4 for toast notifications

### Backend & APIs

- **Deployment Platform**: Vercel with serverless functions
- **API Integrations**:
  - **GreenPT API**: Primary AI chatbot integration using green-l-raw model with streaming support. Custom system prompts and data injection ensure responses are comforting, empathetic, and appropriate for users experiencing employment stress. The chatbot is specifically tuned to:
    - Use A2-level English (short sentences, common words)
    - Provide calm, friendly, and supportive responses
    - Start with empathy when appropriate
    - Focus on explaining processes without giving legal advice
    - Remind users to seek professional advice
  - **ActivePieces**: Workflow automation platform used for email communications:
    - **Case Created Notifications**: Automatically sends emails when users complete the intake process, including calculated deadlines and case information
    - **Export Snapshot Emails**: Sends formatted case details via email when users request to share their information with legal advisors
    - Integrates with Gmail and other email services for reliable delivery
  - **ElevenLabs API**: High-quality text-to-speech synthesis for accessibility features
- **Serverless Functions**: Node.js functions on Vercel for secure API proxying and webhook handling

### Development Tools

- **Linting**: ESLint 9.32.0 with TypeScript ESLint
- **Code Quality**: Strict TypeScript configuration
- **Package Manager**: npm with lock file for dependency management
- **Version Control**: Git with comprehensive .gitignore

## Project Structure

```
your-rights-helper/
├── api/                          # Vercel serverless functions
│   ├── chat.ts                  # Chat API proxy (GreenPT)
│   ├── text-to-speech.ts        # TTS API proxy (ElevenLabs)
│   └── activepieces-*.ts        # ActivePieces webhook handlers
├── src/
│   ├── components/               # React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── AccessibilityBar.tsx # Accessibility controls
│   │   ├── ChatWidget.tsx       # AI chatbot interface
│   │   ├── DeadlineCard.tsx     # Deadline display
│   │   ├── Dock.tsx             # Animated navigation dock
│   │   ├── DotGrid.tsx          # Interactive background grid
│   │   ├── DocumentPrepCard.tsx # Document preparation UI
│   │   ├── DocumentWizard.tsx   # Document creation wizard
│   │   ├── ErrorBoundary.tsx    # Error handling
│   │   ├── Header.tsx           # App header
│   │   ├── JourneyStepper.tsx   # Journey progress visualization
│   │   ├── LegalAdvisorForm.tsx # Legal advisor management
│   │   ├── ScrollReveal.tsx    # Scroll animation component
│   │   └── ...                 # Other feature components
│   ├── context/                 # React Context providers
│   │   └── AppContext.tsx      # Global state management
│   ├── integrations/           # Third-party integrations
│   │   └── activepieces/       # ActivePieces client
│   ├── lib/                     # Utility functions
│   │   ├── caseExport.ts       # Case details export
│   │   ├── chatStorage.ts      # Chat history persistence
│   │   ├── deadline.ts         # Deadline calculation logic
│   │   ├── i18n.ts             # Internationalization
│   │   ├── logger.ts           # Logging utility
│   │   ├── storage.ts          # LocalStorage helpers
│   │   ├── utils.ts            # General utilities
│   │   └── validation.ts       # Input validation
│   ├── locales/                 # Translation files
│   │   ├── en-A2.json          # English (A2 level)
│   │   ├── cy.json             # Welsh
│   │   ├── pl.json             # Polish
│   │   ├── ur.json             # Urdu
│   │   ├── pa.json             # Punjabi
│   │   ├── bn.json             # Bengali
│   │   ├── ro.json             # Romanian
│   │   └── ar.json             # Arabic
│   ├── pages/                   # Page components
│   │   ├── WelcomePage.tsx     # Landing page with animations
│   │   ├── IntakePage.tsx      # Intake questionnaire
│   │   ├── DashboardPage.tsx    # Main dashboard
│   │   ├── DocumentsPage.tsx    # Document preparation
│   │   ├── SettingsPage.tsx     # User settings
│   │   ├── FAQPage.tsx         # Help/FAQ
│   │   └── NotFound.tsx       # 404 page
│   ├── types/                   # TypeScript definitions
│   │   ├── case.ts             # Case state types
│   │   └── documents.ts        # Document types
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Application entry point
├── public/                      # Static assets
├── vercel.json                  # Vercel configuration
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## Key Files & Components

### Core Application Files

- **`src/App.tsx`**: Main application component with routing, error boundaries, and animation setup
- **`src/context/AppContext.tsx`**: Global state management for case data, accessibility settings, and language preferences
- **`src/lib/deadline.ts`**: Complex deadline calculation logic including ACAS Early Conciliation extensions
- **`src/lib/caseExport.ts`**: Case details export functionality (download/email)
- **`src/lib/chatStorage.ts`**: Chat history persistence in localStorage
- **`src/lib/i18n.ts`**: Internationalization system with language detection and RTL support

### Component Highlights

- **`src/components/ChatWidget.tsx`**: AI chatbot powered by GreenPT API with streaming responses, speech recognition, and text-to-speech. Integrates with custom prompts for empathetic, comforting responses
- **`src/components/ScrollReveal.tsx`**: GSAP-powered scroll animations with word-by-word reveal
- **`src/components/DotGrid.tsx`**: Interactive canvas-based background with mouse interaction
- **`src/components/Dock.tsx`**: Animated macOS-style navigation dock
- **`src/pages/WelcomePage.tsx`**: Animated landing page with full-screen scroll experience
- **`src/integrations/activepieces/client.ts`**: ActivePieces client for sending case data to email workflows

### API Functions

- **`api/chat.ts`**: Serverless function for proxying GreenPT API requests with streaming support. Includes custom system prompts that inject empathy, A2-level English guidelines, and comforting tone instructions to ensure the chatbot responds appropriately to stressed users
- **`api/text-to-speech.ts`**: Serverless function for ElevenLabs TTS API
- **`api/activepieces-case-created.ts`**: Webhook handler for sending case creation notifications via ActivePieces email workflows
- **`api/activepieces-export-snapshot.ts`**: Webhook handler for sending case export snapshots via ActivePieces email workflows

## Design System

### Color Palette

- **Warm, Inviting Tones**: Cream backgrounds with golden undertones for comfort
- **Accessibility-First**: High contrast options and colorblind-friendly palettes
- **Status Colors**: Distinct colors for OK, warning, and urgent states

### Typography

- **Primary Font**: Inter (system fallback)
- **Dyslexia Font**: Lexie Readable with OpenDyslexic fallback
- **Responsive Sizing**: Clamp-based fluid typography with accessibility scaling

### Animations

- **Scroll-Linked**: GSAP ScrollTrigger for scroll-based animations
- **Component Transitions**: Framer Motion for page and component transitions
- **Performance**: Optimized with will-change and contain CSS properties

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security & Privacy

- **Client-Side Storage**: All data stored locally in browser localStorage
- **No Backend Database**: No user data sent to external databases
- **API Key Protection**: All API keys secured in Vercel environment variables
- **CORS Protection**: Proper CORS headers on all API endpoints

## Performance

- **Build Size**: Optimized with Vite's tree-shaking and code splitting
- **Lazy Loading**: Route-based code splitting
- **Memoization**: Strategic use of React.memo, useMemo, and useCallback
- **Asset Optimization**: Optimized images and fonts

## Key Integrations

### GreenPT API - AI Chatbot

The application uses **GreenPT API** as the primary AI chatbot service, specifically leveraging the `green-l-raw` model for natural language understanding and generation. The integration is designed with a focus on user comfort and empathy:

- **Custom System Prompts**: The chatbot is configured with carefully crafted system prompts that emphasize:
  - Empathy and emotional support for users experiencing stress
  - A2-level English (simple, clear language with short sentences)
  - Calm, friendly, and supportive tone
  - Clear boundaries (cannot give legal advice, only explain processes)
  - Reminders to seek professional legal advice

- **Data Injection**: User context and case information are injected into the conversation to provide personalized, relevant responses

- **Streaming Responses**: Real-time streaming ensures users see responses as they're generated, creating a more natural conversation experience

- **Implementation**: The chatbot is proxied through Vercel serverless functions (`api/chat.ts`) to protect API keys and ensure secure communication

### ActivePieces - Email Automation

**ActivePieces** is used for reliable email delivery and workflow automation:

- **Case Created Workflow**: When users complete the intake process, ActivePieces automatically:
  - Receives case data via webhook
  - Calculates deadlines based on incident dates and ACAS status
  - Sends formatted email notifications to users (if email provided)
  - Stores case information in connected systems (e.g., Google Sheets)

- **Export Snapshot Workflow**: When users request to share their case details:
  - Receives complete case state via webhook
  - Formats case information including documents, dates, and progress
  - Sends formatted email to legal advisors or users
  - Ensures reliable delivery through Gmail integration

- **Webhook Integration**: Both workflows are triggered via secure Vercel serverless functions that forward case data to ActivePieces webhooks

- **Benefits**: 
  - Reliable email delivery through established email services
  - Automated workflow management
  - Easy integration with other tools (Google Sheets, CRM systems, etc.)
  - No need to manage email servers or SMTP configuration

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Animations powered by [GSAP](https://greensock.com/gsap/) and [Framer Motion](https://www.framer.com/motion/)
- Fonts: [Inter](https://rsms.me/inter/) and [Lexie Readable](https://fonts.google.com/specimen/Lexie+Readable)
- AI Chatbot powered by [GreenPT](https://greenpt.ai)
- Email automation powered by [ActivePieces](https://www.activepieces.com)

## License

This project is private and proprietary.

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**🌐 Live Application: [https://your-rights-helper.vercel.app/](https://your-rights-helper.vercel.app/)**
