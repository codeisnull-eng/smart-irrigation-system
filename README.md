# smart-irrigation-system
The project uses a Web API to connect the ESP32 with the web dashboard. Sensor data is sent to the API and stored in a database, while control commands are returned to the device. Basic identity management secures access using user login and a unique device key. The project is managed on GitHub with a structured repository and version control.

## Required Tools and Technologies

### Hardware Tools
- **ESP32 Development Board**: Microcontroller for IoT functionality (e.g., ESP32 DevKit V1 or similar).
- **Soil Moisture Sensor**: Analog sensor to measure soil moisture levels (e.g., capacitive soil moisture sensor).
- **Soil Temperature Sensor**: Sensor to measure soil temperature (e.g., DS18B20 or similar digital temperature sensor).
- **Jumper Wires**: For connecting sensors to ESP32 GPIO pins.
- **Power Supply**: USB cable or battery pack to power the ESP32 (5V recommended).
- **Breadboard** (optional): For prototyping sensor connections.
- **Computer/Laptop**: For development, running macOS, Windows, or Linux.

### Software Tools
- **Arduino IDE**: For programming and uploading firmware to ESP32 (download from arduino.cc).
- **Node.js**: Runtime environment for the backend API (version 16+ recommended, download from nodejs.org).
- **npm**: Package manager for Node.js (comes with Node.js installation).
- **MongoDB**: NoSQL database for data storage (local installation or MongoDB Atlas cloud service).
- **VS Code**: Code editor for development (with extensions for JavaScript, TypeScript, and Arduino).
- **Git**: Version control system for managing code changes.
- **GitHub**: Platform for hosting the repository and collaboration.
- **Postman**: API testing tool for testing backend endpoints.
- **React/Next.js**: Framework for building the web dashboard (installed via npm).
- **TypeScript**: Programming language for type-safe JavaScript (used in frontend).
- **Tailwind CSS**: Utility-first CSS framework for styling the dashboard.
- **Recharts**: React library for creating charts and graphs.
- **Express.js**: Web framework for Node.js backend.
- **Mongoose**: ODM library for MongoDB in Node.js.
- **bcryptjs**: Library for password hashing.
- **jsonwebtoken**: Library for JWT token management.
- **Body-parser and CORS**: Middleware for handling requests in Express.js.

### Cloud Services (Optional for Deployment)
- **MongoDB Atlas**: Cloud-hosted MongoDB database.
- **Vercel**: Platform for deploying the Next.js web dashboard.
- **Heroku**: Alternative platform for deploying the Node.js API.

### Development Environment Setup
1. Install Node.js and npm.
2. Install Arduino IDE and add ESP32 board support.
3. Set up MongoDB (local or Atlas).
4. Clone the repository: `git clone https://github.com/yourusername/smart-irrigation-system.git`.
5. Install dependencies: `cd api && npm install` and `cd web-dashboard && npm install`.
6. Configure environment variables for API keys, database URLs, etc.

### Additional Notes
- Ensure ESP32 is connected to a stable Wi-Fi network for data transmission.
- Use HTTPS in production for secure API communication.
- Test all components locally before deploying to cloud services.
