# YouTube Statistics Tracker

A full-stack application for tracking and visualizing YouTube channel statistics over time. This application uses Python with FastAPI for the backend, React for the frontend, and PostgreSQL for the database.

## Features

- Track multiple YouTube channels in one dashboard
- View key statistics like subscribers, videos, and views
- Historical data tracking with visualizations
- Automatic updates of channel statistics
- Clean, responsive UI

## Technology Stack

- **Backend**: Python, FastAPI, SQLAlchemy
- **Frontend**: React, Chart.js, React Router
- **Database**: PostgreSQL
- **Deployment**: Docker, Docker Compose

## Prerequisites

- Docker and Docker Compose
- YouTube Data API key

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/gauravksahni/youtube-stats-tracker.git
cd youtube-stats-tracker
```

### 2. Set up your YouTube API key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the YouTube Data API v3
4. Create an API key
5. Restrict the API key to YouTube Data API v3 only

### 3. Configure environment variables

Create a `.env` file in the root directory:

```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 4. Start the application with Docker Compose

```bash
docker-compose up -d
```

### 5. Access the application

- Frontend: http://localhost:3000
- Backend API: http://localhost:
