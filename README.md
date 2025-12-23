# AI Interviewer

A professional interview simulation platform that uses AI to conduct interactive technical interviews. The application features a modern React/TypeScript frontend and a Node.js/Express backend that integrates with Google's Gemini AI for generating role-specific interview questions and evaluating responses in real-time.

## Why AI Interviewer is an AI Agent

AI Interviewer embodies the characteristics of an intelligent agent through its ability to:

- **Perceive Environment**: Continuously monitors the interview context, including user responses, conversation history, and session state
- **Reason and Plan**: Analyzes candidate responses in real-time, determines appropriate follow-up questions, and adapts the interview difficulty based on performance
- **Act Autonomously**: Makes independent decisions about question selection, conversation flow, and interview pacing without human intervention
- **Learn from Context**: Maintains conversation history and uses it to inform subsequent questions, creating a coherent and adaptive interview experience
- **Communicate Naturally**: Engages in human-like dialogue, understanding both voice and text inputs while generating contextually relevant responses
- **Achieve Goals**: Works toward the objective of conducting comprehensive technical interviews that accurately assess candidate capabilities

The AI agent operates as a sophisticated conversational partner that can evaluate technical knowledge, problem-solving approaches, and communication skills while maintaining the professional standards of a real interviewer.

## Features

- 🎤 Voice and text-based interview simulation
- 🎯 Role-specific interview questions (Junior to Staff Engineer levels)
- 🔄 Real-time AI-powered conversation
- 🎨 Modern, responsive UI with dark/light mode
- 🔒 Secure authentication with Firebase (includes development mode)
- 📊 Session persistence and management with Redis
- 🎙️ Voice input with speech-to-text
- 🎧 Text-to-speech for AI responses
- 📱 Mobile-friendly interface
- 🧪 Comprehensive test suite with Jest and React Testing Library

## Tech Stack

### Frontend

- ⚛️ React 18+ with TypeScript
- 🚀 Vite for ultra-fast development
- 🎨 Shadcn UI components with Tailwind CSS
- 🔥 React Query for data fetching
- 🎤 Web Speech API for voice interactions
- 🔐 Firebase Authentication
- 📦 pnpm for package management
- 🎭 Framer Motion for animations
- 🧪 Jest with React Testing Library for testing

### Backend

- 🛠️ Node.js with Express
- 🤖 Google Gemini AI for interview logic
- 🔴 Redis for session management and data persistence
- 🔒 CORS and security middleware
- 📝 Structured logging with Winston
- 🔥 Firebase Admin SDK for authentication and data storage
- 📡 RESTful API design
- 🔄 WebSocket for real-time updates (future)

## Session Management

The application uses **Redis-based session management** instead of traditional express-session:

- **Stateless Architecture**: No server-side session storage dependency
- **Redis Storage**: Interview data stored in Redis with TTL (1 hour)
- **Session IDs**: Client-managed unique identifiers passed via headers
- **Auto-Extension**: Session TTL extended on each request
- **Scalability**: Redis can be shared across multiple server instances
- **Performance**: Direct Redis access is faster than session middleware

### Session Flow

1. **Authentication**: Client receives session ID from `/init` endpoint
2. **Storage**: Session ID stored in localStorage and Redis
3. **Requests**: Session ID sent in `X-Session-ID` header
4. **Management**: Interview history, status, and role managed via Redis
5. **Cleanup**: Sessions automatically expire and can be manually ended

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Google Gemini API key
- Firebase project with Authentication enabled
- Redis server (local or cloud)
- Modern web browser with WebRTC and Web Speech API support

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-interviewer
```

### 2. Set up the backend

```bash
cd node-server
cp .env.example .env
```

The `.env.example` file contains all the required environment variables. Simply rename it to `.env` and update the values:

```env
# Server Configuration
HTTP_PORT=3001
HTTP_BASE_URL=http://localhost
HTTP_SESSION_KEY=your_session_secret
HTTP_FRONTEND_ORIGIN=

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro

# Redis Configuration
REDIS_USERNAME=your_redis_username
REDIS_PASSWORD=your_redis_password
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase Service Account Configuration
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_AUTH_URI=
FIREBASE_TOKEN_URI=
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=
FIREFACE_CLIENT_X509_CERT_URL=
FIREBASE_UNIVERSE_DOMAIN=

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn_here
```

Install dependencies and start the server:

```bash
pnpm install
pnpm start
```

The backend will start on `http://localhost:3001`

### 3. Set up the frontend

In a new terminal window:

```bash
cd client
cp .env.example .env
```

The `.env.example` file contains all the required environment variables. Simply rename it to `.env` and update the values:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Sentry for error tracking
VITE_SENTRY_DSN=your_sentry_dsn
```

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open the application in your browser at `http://localhost:5173`
2. Sign in with your Google account (development mode available for testing)
3. Select your target role (Junior, Mid, Senior, or Staff Engineer)
4. Choose your preferred input method (voice or text)
5. The AI interviewer will guide you through the interview with role-specific questions
6. Respond naturally - the AI will adapt to your answers
7. Complete all questions to finish the interview
8. Review your session summary and feedback

### Development Mode

For testing purposes, the application includes a development mode that bypasses Google authentication. This mode is automatically enabled in development environments and allows you to sign in directly with a role selection.

## Project Structure

```
ai-interviewer/
├── client/                 # Frontend React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Shadcn UI components
│   │   │   └── auth/       # Authentication components
│   │   ├── contexts/       # React contexts
│   │   │   └── auth/       # Authentication context and tests
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   │   ├── Auth.tsx    # Authentication page
│   │   │   └── Chat.tsx    # Main interview interface
│   │   ├── services/       # API services and Firebase integration
│   │   │   ├── api.ts        # API client with session management
│   │   │   └── session-storage.ts  # LocalStorage session wrapper
│   │   ├── tests/          # Test utilities and mocks
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── .env.example        # Environment variables example
│   ├── index.html          # HTML template
│   ├── jest.config.js      # Jest testing configuration
│   ├── package.json        # Dependencies and scripts
│   └── tsconfig.json       # TypeScript config
│
├── node-server/                 # Backend server
│   ├── config/             # Configuration
│   │   └── index.js        # App configuration
│   ├── constants.js        # Application constants
│   ├── data_models/        # Data models and prompts
│   │   └── prompts.js      # AI prompt templates
│   ├── firebase-service-account-key.json  # Firebase service account
│   ├── http/               # HTTP server setup
│   │   ├── api/            # API routes and controllers
│   │   │   ├── controllers/    # Request handlers
│   │   │   │   ├── authentication-controllers.js
│   │   │   │   ├── interview-controllers.js
│   │   │   │   └── user-controllers.js
│   │   │   ├── middlewares/    # Express middleware
│   │   │   │   ├── cors/
│   │   │   │   └── session/      # Session management
│   │   │   │       ├── extract-session.js
│   │   │   │       └── check-session.js
│   │   │   ├── routes/        # Route definitions
│   │   │   │   ├── authentication-routes.js
│   │   │   │   ├── interview-routes.js
│   │   │   │   └── user-routes.js
│   │   │   └── index.js        # API router
│   │   └── index.js        # HTTP server entry point
│   ├── services/          # Business logic services
│   │   ├── audit-service.js
│   │   ├── firebase/      # Firebase integration
│   │   │   └── index.js
│   │   ├── interview-service.js
│   │   ├── interview-session/  # Redis session management
│   │   │   └── index.js
│   │   ├── redis/         # Redis client
│   │   │   └── index.js
│   │   └── userService.js
│   ├── .env.example        # Environment example
│   ├── package.json        # Dependencies
│   └── server.js           # Express setup
│
├── .gitignore             # Git ignore file
├── README.md              # This file
└── firebase-service-account-key.json  # Firebase service account (gitignored)
```

## Environment Variables

Both the client and server include `.env.example` files that can be used as templates. Simply copy or rename these files to `.env` and update the values with your actual configuration.

### Backend (server/.env)

- `HTTP_PORT`: Port for the server to listen on (default: 3001)
- `HTTP_BASE_URL`: Base URL for the server (default: http://localhost)
- `HTTP_SESSION_KEY`: Secret key for session encryption (required)
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `GEMINI_MODEL`: The Gemini model to use (default: gemini-pro)
- `REDIS_USERNAME`: Redis username (required)
- `REDIS_PASSWORD`: Redis password (required)
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `FIREBASE_*`: Firebase service account configuration (required)
- `SENTRY_DSN`: Sentry DSN for error tracking (optional)

### Frontend (client/.env)

- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:3001/api)
- `VITE_FIREBASE_*`: Firebase configuration (required)
- `VITE_SENTRY_DSN`: Sentry DSN for error tracking (optional)

## Development

### Running in Development Mode

1. Start the backend server:

   ```bash
   cd node-server
   pnpm dev
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   cd client
   pnpm dev
   ```

### Building for Production

1. Build the frontend:

   ```bash
   cd client
   pnpm build
   ```

2. Start the production server:
   ```bash
   cd ../node-server
   pnpm start
   ```

### Code Quality

- Run linter:
  ```bash
  pnpm lint
  ```
- Run type checking:
  ```bash
  pnpm type-check
  ```
- Format code:
  ```bash
  pnpm format
  ```

### Testing

The project includes a comprehensive test suite using Jest and React Testing Library.

- Run all tests:
  ```bash
  npm test
  ```
- Run tests with coverage:
  ```bash
  npm run test:coverage
  ```
- Run tests in watch mode:
  ```bash
  npm run test:watch
  ```
- Run specific test file:
  ```bash
  npm test -- auth-context.test.tsx
  ```

#### Test Structure

Tests are organized alongside the components they test:

```
src/
├── contexts/
│   └── auth/
│       ├── tests/
│       │   ├── auth-context.test.tsx
│       │   ├── hooks.test.tsx
│       │   └── types.test.tsx
│       └── ...
└── ...
```

#### Authentication Testing

The authentication system includes comprehensive test coverage for:

- Context provider behavior
- Custom hooks (useAuth)
- Type safety and interface compliance
- Development mode authentication
- Error handling and loading states
- Runtime validation

## Troubleshooting

- **Environment setup**: Ensure you've copied `.env.example` to `.env` in both client and server directories
- **CORS issues**: Ensure `VITE_API_BASE_URL` matches the backend address and includes the correct protocol
- **Microphone access**: Check browser permissions and ensure no other app is using the microphone
- **Firebase errors**: Verify your Firebase configuration and enable required services
- **Redis connection**: Ensure Redis server is running and credentials are correct
- **Session issues**: Check that session ID is being sent in `X-Session-ID` header
- **AI responses**: Check Gemini API key and quota
- **Check logs**:
  - Browser console for client-side errors
  - Server logs for backend issues
  - Network tab for API request/response details

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
