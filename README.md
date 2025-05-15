# Coin Whisperer

Coin Whisperer is a sentiment-based crypto trading platform that leverages social media analysis to help users make smarter trading decisions, especially for meme coins. It features real-time sentiment analysis, automated trading, and a comprehensive dashboard.

## Features
- Real-time sentiment analysis of tweets and social media
- Automated trading based on sentiment thresholds
- Dashboard for tracking coins, trades, and market stats
- User authentication and registration
- Modern UI with Tailwind CSS and Radix UI

## Monorepo Structure
```
CoinWhisperer/
├── client/      # Frontend React app (Vite, Tailwind, Radix)
├── server/      # Backend Express API (MongoDB, WebSocket)
├── shared/      # Shared types and schema
```

## Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (running locally or via Docker)

## Setup Instructions

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd CoinWhisperer
```

### 2. Install dependencies (from the root)
```sh
npm install
```

### 3. Start MongoDB
- If installed locally: `mongod`
- Or with Docker:
  ```sh
  docker run -d -p 27017:27017 --name mongo mongo
  ```

### 4. Start the backend server
```sh
cd server
npm run dev
```

### 5. Start the frontend (in a new terminal)
```sh
cd client
npm run dev
```

### 6. Open the app
Go to [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables
- Backend: See `server/config.ts` for required variables. You can use a `.env` file in the `server` directory.
- Frontend: No special variables needed for development.

## Development Notes
- The backend uses Express, MongoDB, and WebSocket for real-time updates.
- The frontend uses React, Vite, Tailwind CSS, and Radix UI.
- User authentication is session-based by default.

## License
MIT 