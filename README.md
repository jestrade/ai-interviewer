# AI Interviewer

A technical interview simulation platform that uses AI to conduct interactive coding interviews. The application features a React-based frontend and a Node.js/Express backend that integrates with Google's Gemini AI for generating interview questions and evaluating responses.

## Features

- Interactive technical interview simulation
- Support for both text and audio responses
- Real-time AI-powered question generation
- Simple and intuitive user interface
- Built with modern web technologies

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Styled Components
- Axios for API calls

### Backend
- Node.js with Express
- Google Gemini AI for interview logic
- CORS for cross-origin requests
- Multer for file uploads
- dotenv for environment variables

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

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

Edit the `.env` file and add your Google Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
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
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. Open the application in your browser
2. Start a new interview session
3. Respond to the AI interviewer's questions through text or audio
4. The AI will evaluate your responses and ask follow-up questions
5. Complete the interview to receive feedback

## Project Structure

```
ai-interviewer/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/               # React components and logic
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                # Backend server
│   ├── interviewController.js  # Interview logic
│   ├── server.js          # Express server setup
│   └── package.json       # Backend dependencies
└── README.md             # This file
```

## Environment Variables

### Backend (server/.env)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL`: The Gemini model to use (default: gemini-pro)

### Frontend (client/.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
