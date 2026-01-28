require('dotenv').config();

const { app, BrowserWindow, screen } = require('electron');
const checkForMessages = require('./services/smsService');



// Disable caching from extractor to prevent permission issues.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('--disable-http-cache');


// File wide accessible overlayWindow.
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
        }
    });

    overlayWindow.loadFile('./overlay/overlay.html');
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






let hideTimeout;

// Show SMS message in overlay
function showSMS(smsSender, smsMessage) {
    
    if (overlayWindow) {
        // Clear any existing timeout if another message comes in.
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }

        overlayWindow.webContents.send('show-sms-sender', smsSender);
        overlayWindow.webContents.send('show-sms-message', smsMessage);
        overlayWindow.show();

        // Set new timeout.
        hideTimeout = setTimeout(() => {
            overlayWindow.hide();
            hideTimeout = null; // Set to null to reset.
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

    // Call SMS service from services that will run on intervals. Pass showSMS function to apply new events.
    checkForMessages(showSMS);

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