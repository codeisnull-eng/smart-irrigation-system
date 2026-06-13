# Verdirra Smart Irrigation System

Verdirra is a Houseplant Smart Monitoring System designed to help users monitor indoor plants and maintain optimal growing conditions. The platform combines IoT sensor data, intelligent plant recommendations, environmental monitoring, and automation to improve plant health and simplify plant care. Built with Next.js, TypeScript, MongoDB, Docker, and GitHub Actions.

## Features

- 🌱 Plant-specific irrigation settings
- 🤖 AI-assisted plant configuration
- 💧 Soil moisture monitoring
- 🌡️ Temperature monitoring
- 💨 Humidity monitoring
- 📊 Real-time dashboard visualization
- 🗄️ MongoDB database integration
- 🐳 Docker containerization
- ⚙️ CI/CD pipeline using GitHub Actions
- 📱 Progressive Web App (PWA) support

## Supported Plants

The system supports multiple indoor plants and allows searching by:

- English name
- Arabic name
- Scientific name

Examples:

- Spider Plant
- Snake Plant
- Pothos
- Peace Lily
- Monstera
- Rubber Plant
- Boston Fern
- Areca Palm
- ZZ Plant
- Chinese Evergreen
- Philodendron
- Dracaena
- Parlor Palm
- Anthurium
- Peperomia
- Calathea
- Kentia Palm
- Bird of Paradise
- Cast Iron Plant
- Alocasia

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- MongoDB
- Docker
- GitHub Actions

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Docker

Build image:

```bash
docker build -t verdirra .
```

Run container:

```bash
docker run -p 3000:3000 verdirra
```

## CI/CD

GitHub Actions automatically:

1. Installs dependencies
2. Builds the project
3. Creates a Docker image
4. Pushes the image to Docker Hub

## Project Goal

Provide an intelligent smart irrigation solution that helps users monitor plant conditions and maintain healthy growth using automation and AI.
