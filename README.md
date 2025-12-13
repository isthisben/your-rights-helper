# Work Rights Navigator

A comprehensive web application designed to help people in the UK navigate employment tribunal processes. The app provides step-by-step guidance, deadline tracking, document preparation tools, and an AI-powered chatbot to assist users through their employment rights journey.

## Features

### Core Functionality

- **Intake Process**: Guided questionnaire to understand the user's employment situation
- **Journey Mapping**: Visual step-by-step guide through the employment tribunal process
- **Deadline Tracking**: Automatic calculation of important deadlines with ACAS Early Conciliation extensions
- **Document Preparation**: Interactive wizards for creating:
  - Witness statements
  - Schedule of loss
  - Chronology of events
  - List of issues
- **AI Chatbot**: Powered by GreenPT API, provides guidance and answers questions (A2-level English)
- **Case Export**: Download or email complete case details as a text file

### Accessibility Features

- **Multi-language Support**: English (A2 level), Welsh, Polish, Urdu, Punjabi, Bengali, Romanian, Arabic
- **Text Size Adjustment**: Small, medium, and large text options
- **High Contrast Mode**: Enhanced visibility for low vision users
- **Colorblind Mode**: Support for Protanopia, Deuteranopia, and Tritanopia
- **Dyslexia-Friendly Font**: Lexie Readable font option
- **Text-to-Speech**: Web Speech API and ElevenLabs integration
- **Speech Recognition**: Voice input for chatbot
- **Reduce Motion**: Respects user's motion preferences
- **RTL Support**: Right-to-left layout for Arabic and Urdu

### Technical Features

- **Responsive Design**: Mobile-first approach with touch-friendly interfaces
- **Offline Support**: Local storage for case data persistence
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Performance Optimized**: Lazy loading, memoization, and efficient state management

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Context API with localStorage persistence
- **Animations**: Framer Motion
- **API Integration**: 
  - GreenPT API (AI chatbot)
  - ElevenLabs API (text-to-speech)
  - ActivePieces (workflow automation)
- **Deployment**: Vercel (frontend + serverless functions)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd your-rights-helper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
# Optional: Override API URL for local development
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel project settings:
   - `GREENPT_API_KEY`: Your GreenPT API key for the chatbot
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key for text-to-speech
   - `ACTIVEPIECES_CASE_CREATED_WEBHOOK`: (Optional) ActivePieces webhook URL
   - `ACTIVEPIECES_EXPORT_SNAPSHOT_WEBHOOK`: (Optional) ActivePieces webhook URL

4. Deploy! Vercel will automatically build and deploy your application.

For detailed setup instructions, see [VERCEL_SETUP.md](./VERCEL_SETUP.md)

## Project Structure

```
your-rights-helper/
├── api/                    # Vercel serverless functions
│   ├── chat.ts            # Chat API proxy
│   ├── text-to-speech.ts  # TTS API proxy
│   └── activepieces-*.ts  # ActivePieces webhooks
├── src/
│   ├── components/         # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Feature components
│   ├── context/          # React Context providers
│   ├── lib/              # Utility functions
│   ├── locales/          # Translation files
│   ├── pages/            # Page components
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── vercel.json          # Vercel configuration
```

## Key Files

- `src/App.tsx`: Main application component with routing
- `src/context/AppContext.tsx`: Global state management
- `src/lib/deadline.ts`: Deadline calculation logic
- `src/lib/caseExport.ts`: Case details export functionality
- `src/components/ChatWidget.tsx`: AI chatbot interface
- `api/chat.ts`: Chat API serverless function

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier (via ESLint) for formatting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues, questions, or contributions, please open an issue on the repository.

## Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
