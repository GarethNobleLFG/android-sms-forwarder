# Android SMS Forwarding System

A customly created SMS forwarding solution that captures SMS messages from your Android device and displays them as desktop notifications on your computer. The system consists of three main components working together to provide seamless SMS monitoring.

## System Overview

This project creates a complete SMS forwarding pipeline:

1. **Android App** - Captures incoming SMS messages and forwards them to your API
   - Native Kotlin application that runs in the background
   - Intercepts SMS messages in real-time and extracts sender/content
   - Handles permissions and device identification

2. **SMS API Server** - Receives, stores, and serves SMS data via REST endpoints
   - Node.js Express server with MongoDB storage
   - Provides REST API for receiving and retrieving messages
   - Handles CORS and maintains message history

3. **Desktop Overlay** - Displays SMS notifications as floating overlays on your Windows desktop
   - Electron-based desktop application
   - Polls API every 2 seconds for new messages
   - Shows transparent floating notifications that auto-hide

## Technologies Used

### Android Application
- **Kotlin** - Primary programming language for Android development
- **Android SDK** (API 24-34) - Android development framework
- **Gradle** - Build automation and dependency management
- **AndroidX Libraries:**
  - Core KTX - Kotlin extensions for Android
  - AppCompat - Backward compatibility support
  - Material Design Components - UI components
  - ConstraintLayout - Advanced layouts
- **Kotlin Coroutines** - Asynchronous programming for background operations
- **JUnit & Espresso** - Testing frameworks

### SMS API Server
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Mongoose** - MongoDB object modeling for Node.js

### Desktop Overlay Application
- **Electron** - Framework for building cross-platform desktop apps
- **Axios** - HTTP client for API communication
- **HTML/TailwindCSS** - User interface rendering

