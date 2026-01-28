require('dotenv').config();

const { app, BrowserWindow, screen } = require('electron');
const axios = require('axios');
const ContactManager = require('./contacts');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('--disable-http-cache');




// Initialize contact manager
const contactManager = new ContactManager();





// Check for new SMS messages every 2 seconds.
// Check for new SMS messages every 2 seconds.
function checkForMessages() {
    setInterval(async () => {
        console.log('🔄 Checking for messages...');
        try {
            const apiUrl = `${process.env.API_URL}/sms-api/latest`;
            const response = await axios.get(apiUrl);
            
            console.log('📨 API Response:', JSON.stringify(response.data, null, 2));
            
            if (!response.data.messages || response.data.messages.length === 0) {
                console.log('📭 No new messages found.');
                return;
            }

            const newSmsChats = response.data.messages || [];
            console.log(`📬 Found ${newSmsChats.length} messages`);

            for (let i = 0; i < newSmsChats.length; i++) {
                console.log('🆕 Processing message:', newSmsChats[i]);
                
                const contactName = contactManager.getContactName(newSmsChats[i].sender);
                console.log('📝 Contact resolved to:', contactName);
                
                showSMS(contactName, newSmsChats[i].message);
            }
        }
        catch (error) {
            console.log('❌ Cannot connect to SMS API:', error.message);
        }
    }, 500);
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