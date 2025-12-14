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
- **AI Chatbot**: Powered by GreenPT API (green-l-raw model), provides guidance and answers questions in A2-level English with streaming responses
- **Case Export**: Download or email complete case details as a formatted text file to share with legal advisors
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
  - **GreenPT API**: AI chatbot using green-l-raw model with streaming support
  - **ElevenLabs API**: High-quality text-to-speech synthesis
  - **ActivePieces**: Workflow automation for case management (optional)
- **Serverless Functions**: Node.js functions on Vercel for secure API proxying

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

- **`src/components/ChatWidget.tsx`**: AI chatbot with streaming responses, speech recognition, and text-to-speech
- **`src/components/ScrollReveal.tsx`**: GSAP-powered scroll animations with word-by-word reveal
- **`src/components/DotGrid.tsx`**: Interactive canvas-based background with mouse interaction
- **`src/components/Dock.tsx`**: Animated macOS-style navigation dock
- **`src/pages/WelcomePage.tsx`**: Animated landing page with full-screen scroll experience

### API Functions

- **`api/chat.ts`**: Serverless function for proxying GreenPT API requests with streaming support
- **`api/text-to-speech.ts`**: Serverless function for ElevenLabs TTS API

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

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Animations powered by [GSAP](https://greensock.com/gsap/) and [Framer Motion](https://www.framer.com/motion/)
- Fonts: [Inter](https://rsms.me/inter/) and [Lexie Readable](https://fonts.google.com/specimen/Lexie+Readable)

## License

This project is private and proprietary.

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**🌐 Live Application: [https://your-rights-helper.vercel.app/](https://your-rights-helper.vercel.app/)**
