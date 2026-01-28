# Android SMS Forwarding System

A complete SMS forwarding solution that captures SMS messages from your Android device and displays them as desktop notifications on your computer. The system consists of three main components working together to provide seamless SMS monitoring.

## System Overview

This project creates a complete SMS forwarding pipeline:

1. **Android App** - Captures incoming SMS messages and forwards them to your API
2. **SMS API Server** - Receives, stores, and serves SMS data via REST endpoints  
3. **Desktop Overlay** - Displays SMS notifications as floating overlays on your Windows desktop

## Components

### 1. Android SMS Forwarder (`android-sms-forwarder/`)

A native Android application built with Kotlin that:
- Automatically detects incoming SMS messages
- Extracts sender and message content  
- Forwards data to your configured API endpoint
- Handles SMS permissions management
- Generates unique device identification

**Key Features:**
- Real-time SMS interception
- Configurable API endpoint
- Permission handling with user prompts
- Device ID generation for tracking
- Reliable background operation

### 2. SMS API Server (`sms-api/`)

A Node.js Express server that:
- Receives SMS data from the Android app via POST requests
- Stores messages in MongoDB database
- Provides REST endpoints for message retrieval
- Handles CORS for cross-origin requests
- Maintains message history and metadata

**Key Endpoints:**
- `POST /sms-api/receive` - Accept new SMS messages
- `GET /sms-api/latest` - Retrieve recent messages
- `GET /sms-api/messages` - Get message history
- `GET /` - API status check

### 3. Desktop Overlay (`desktop-overlay/`)

An Electron-based desktop application that:
- Polls the SMS API for new messages every 2 seconds
- Displays floating notifications on your Windows desktop
- Manages contact name resolution
- Provides transparent, non-intrusive UI
- Runs silently in the background at startup

