# AI Interviewer

A technical interview simulation platform that uses AI to conduct interactive coding interviews. The application features a React-based frontend and a Node.js/Express backend that integrates with Google's Gemini AI for generating interview questions and evaluating responses.

## Features

- Interactive technical interview simulation
- Support for both text and audio responses
- Real-time AI-powered question generation
- Simple and intuitive user interface
- Built with modern web technologies
- WebRTC-based audio recording
- Real-time chat interface

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for build tooling
- Styled Components for styling
- Axios for API calls
- WebRTC for audio recording

### Backend
- Node.js with Express
- Google Gemini AI for interview logic
- CORS for cross-origin requests
- Multer for file uploads
- dotenv for environment variables
- ES Modules support

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key
- Modern web browser with WebRTC support

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

Edit the `.env` file with your configuration:
```env
# Server Configuration
HTTP_PORT=3001
HTTP_BASE_URL=http://localhost

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
```

Install dependencies and start the server:
```bash
npm install
npm start
```

The backend will start on `http://localhost:3001`

### 3. Set up the frontend

In a new terminal window:
```bash
cd client
cp .env.example .env
```

Edit the `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

Install dependencies and start the development server:
```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open the application in your browser at `http://localhost:5173`
2. Click the "Start Answer" button to begin recording your response
3. Speak your answer to the interview question
4. Click "Stop" when you're finished
5. The AI will process your response and provide feedback or ask follow-up questions
6. Continue the conversation to complete the interview

## Project Structure

```
ai-interviewer/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   │   └── interviewer/ # Interviewer component
│   │   ├── pages/         # Page components
│   │   │   └── root/      # Root page
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── .env.example       # Example environment variables
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
│
├── server/                # Backend server
│   ├── api/               # API routes
│   │   ├── interview/     # Interview endpoints
│   │   │   ├── controllers.js  # Request handlers
│   │   │   └── routes.js  # Route definitions
│   │   └── index.js       # API router
│   ├── config/            # Configuration
│   │   └── index.js       # App configuration
│   ├── .env.example       # Example environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Express server setup
│
├── .gitignore             # Git ignore file
└── README.md             # This file
```

## Environment Variables

### Backend (server/.env)
- `HTTP_PORT`: Port for the server to listen on (default: 3001)
- `HTTP_BASE_URL`: Base URL for the server (default: http://localhost)
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `GEMINI_MODEL`: The Gemini model to use (default: gemini-pro)

### Frontend (client/.env)
- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:3001/api)

## Development

### Running in Development Mode

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

### Building for Production

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. Start the production server:
   ```bash
   cd ../server
   npm start
   ```

## Troubleshooting

- If you encounter CORS issues, ensure the `VITE_API_BASE_URL` in the frontend matches the backend's address
- For audio recording issues, make sure your browser has microphone permissions enabled
- Check the browser's developer console for any client-side errors
- Check the server logs for any backend errors

## Contributing

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
