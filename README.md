# AI Interviewer

A professional interview simulation platform that uses AI to conduct interactive technical interviews. The application features a modern React/TypeScript frontend and a Node.js/Express backend that integrates with Google's Gemini AI for generating role-specific interview questions and evaluating responses in real-time.

## Features

- 🎤 Voice and text-based interview simulation
- 🎯 Role-specific interview questions (Junior to Staff Engineer levels)
- 🔄 Real-time AI-powered conversation
- 🎨 Modern, responsive UI with dark/light mode
- 🔒 Secure authentication with Firebase (includes development mode)
- 📊 Session persistence and management
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
- 🔄 Session-based conversation management
- 🔒 CORS and security middleware
- 📝 Structured logging with Winston
- 📡 RESTful API design
- 🔄 WebSocket for real-time updates (future)

## Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Google Gemini API key
- Firebase project with Authentication enabled
- Modern web browser with WebRTC and Web Speech API support

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-interviewer
```

### 2. Set up the backend

```bash
cd server
cp .env.example .env
```

The `.env.example` file contains all the required environment variables. Simply rename it to `.env` and update the values:

```env
# Server Configuration
HTTP_PORT=3001
HTTP_BASE_URL=http://localhost
HTTP_SESSION_KEY=your_session_secret

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
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
│   │   │   └── ...
│   │   ├── contexts/       # React contexts
│   │   │   └── auth/       # Authentication context and tests
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   │   ├── Auth.tsx    # Authentication page
│   │   │   └── Chat.tsx    # Main interview interface
│   │   ├── services/       # API services
│   │   ├── tests/          # Test utilities and mocks
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── .env.example        # Environment variables example
│   ├── index.html          # HTML template
│   ├── jest.config.js      # Jest testing configuration
│   ├── package.json        # Dependencies and scripts
│   └── tsconfig.json       # TypeScript config
│
├── server/                 # Backend server
│   ├── api/                # API routes
│   │   ├── interview/      # Interview endpoints
│   │   │   ├── controllers.js  # Business logic
│   │   │   └── routes.js   # Route definitions
│   │   ├── authenticate/   # Auth endpoints
│   │   └── index.js        # API router
│   ├── config/             # Configuration
│   │   └── index.js        # App configuration
│   ├── lib/                # Shared utilities
│   │   └── prompts.js      # AI prompt templates
│   ├── .env.example        # Environment example
│   ├── package.json        # Dependencies
│   └── server.js           # Express setup
│
├── .gitignore             # Git ignore file
├── README.md              # This file
└── pnpm-workspace.yaml    # Monorepo config
```

## Environment Variables

Both the client and server include `.env.example` files that can be used as templates. Simply copy or rename these files to `.env` and update the values with your actual configuration.

### Backend (server/.env)

- `HTTP_PORT`: Port for the server to listen on (default: 3001)
- `HTTP_BASE_URL`: Base URL for the server (default: http://localhost)
- `HTTP_SESSION_KEY`: Secret key for session encryption (required)
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `GEMINI_MODEL`: The Gemini model to use (default: gemini-pro)

### Frontend (client/.env)

- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:3001/api)
- `VITE_FIREBASE_*`: Firebase configuration (required)
- `VITE_SENTRY_DSN`: Sentry DSN for error tracking (optional)

## Development

### Running in Development Mode

1. Start the backend server:

   ```bash
   cd server
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
   cd ../server
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
- **Session issues**: Ensure `HTTP_SESSION_KEY` is set and consistent
- **AI responses**: Check Gemini API key and quota
- **Check logs**:
  - Browser console for client-side errors
  - Server logs for backend issues
  - Network tab for API request/response details

## Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository and create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. Install dependencies and set up the project
   ```bash
   pnpm install
   ```
3. Make your changes and ensure tests pass
   ```bash
   npm test
   ```
4. Run the linter and formatter
   ```bash
   pnpm lint
   pnpm format
   ```
5. Commit your changes with a descriptive message
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open a Pull Request with a clear description of changes

### Testing Requirements

All contributions must include appropriate tests:

- New features should have unit tests
- UI components should have accessibility tests
- Authentication changes should include auth context tests
- Bug fixes should include regression tests

Ensure test coverage remains high and all tests pass before submitting a PR.

### Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code changes that neither fixes a bug nor adds a feature
- `test:` for adding tests or fixing test issues
- `chore:` for changes to the build process or auxiliary tools

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
