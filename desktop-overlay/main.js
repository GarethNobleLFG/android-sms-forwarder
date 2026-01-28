require('dotenv').config();

const { app, BrowserWindow, screen } = require('electron');
const axios = require('axios');
const path = require('path');
const os = require('os');
const ContactManager = require('./contacts');



// Prevent cache issues by setting proper app paths before app is ready.
const userDataPath = path.join(os.homedir(), 'AppData', 'Local', 'sms-desktop-overlay');
const cachePath = path.join(userDataPath, 'cache');

app.setPath('userData', userDataPath);
app.setPath('cache', cachePath);

// Disable GPU acceleration to prevent some Windows cache issues.
app.disableHardwareAcceleration();





// Initialize contact manager
const contactManager = new ContactManager();





// Check for new SMS messages every 2 seconds.
function checkForMessages() {
    setInterval(async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/sms-api/latest`);

            if (response.data.messages.length === 0) {
                console.log('No new messages found.');
            }

            const newSmsChats = response.data.messages || [];

            for (let i = 0; i < newSmsChats.length; i++) {
                console.log('New SMS found:', newSmsChats[i].sender);

                // Get contact name or just pass number if there is none.
                const contactName = contactManager.getContactName(newSmsChats[i].sender);
                showSMS(contactName, newSmsChats[i].message);
            }
        }
        catch (error) {
            console.log('Cannot connect to SMS API. :(');
        }
    }, 2000);
}






let overlayWindow;

// Create the floating overlay window for the desktop overlay.
function createOverlay() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    overlayWindow = new BrowserWindow({
        width: 350,
        height: 120,
        x: width - 370,
        y: 20,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        backgroundColor: '#00000000', // Fully transparent background
        resizable: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // Disable web security to prevent cache issues.
            webSecurity: false,
            // Disable cache.
            cache: false
        }
    });

    overlayWindow.loadFile('overlay.html');
    overlayWindow.show();
    
    // Add error handling
    overlayWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('Overlay failed to load:', errorDescription);
    });
    
    overlayWindow.webContents.on('crashed', () => {
        console.log('Overlay window crashed, recreating...');
        createOverlay();
    });
}






// Show SMS message in overlay
function showSMS(smsSender, smsMessage) {
    if (overlayWindow) {
        overlayWindow.webContents.send('show-sms-sender', smsSender);
        overlayWindow.webContents.send('show-sms-message', smsMessage);
        overlayWindow.show();

        setTimeout(() => {
            overlayWindow.hide();
        }, 6000);
    }
}





// Start the app 
app.whenReady().then(() => {
    createOverlay();

    // Show default message
    setTimeout(() => {
        showSMS('System', 'Waiting for SMS messages...');
    }, 1000);

    checkForMessages();
    console.log('SMS Desktop Overlay is running!');
});





// Quit when all windows are closed
app.on('window-all-closed', () => {
    app.quit();
});




// Handle app activation (macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createOverlay();
    }
});