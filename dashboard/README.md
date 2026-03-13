# Smart Irrigation System Dashboard

A simulation of a smart irrigation automation system for crops, built with Next.js and TypeScript.

## Features

- **Moisture Level Monitoring**: Tracks soil moisture from 0-100%, with ideal range of 25-70%.
- **Soil Temperature Monitoring**: Monitors soil temperature from 10-40°C, with ideal range of 15-30°C.
- **Automatic Irrigation**: Automatically irrigates when moisture drops below 25% until it reaches 70%.
- **Manual Controls**: Buttons for manual irrigation.
- **Real-time Simulation**: Values update every second with random fluctuations.
- **Activity Logs**: Displays recent system actions and adjustments.

## Simulation Logic

### Moisture
- Values tend to decrease over time (90% chance), rarely increase (10% chance).
- If moisture < 25%, automatic irrigation starts (+5% per second) until >= 70%.
- Manual irrigation adds +10% moisture.

### Temperature
- Random fluctuations in either direction between 10-40°C.
- No automatic adjustment - just monitoring.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Deploy on Vercel

This project is ready for Vercel deployment. Simply connect your GitHub repository to Vercel and deploy.

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- React Hooks for state management
