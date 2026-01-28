const { app, BrowserWindow, screen } = require('electron');
const axios = require('axios');




// Check for new SMS messages every 2 seconds
function checkForMessages() {
    setInterval(async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/sms-api/latest`);
            const newSmsChats = response.data.messages || [];

            for (let i = 0; i < newSmsChats.length; i++) {
                console.log('New SMS found:', newSmsChats[i].sender);
                showSMS(newSmsChats[i].sender, newSmsChats[i].message);
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
        x: width - 370,  // Position at top-right
        y: 20,
        frame: false,       // No window border
        alwaysOnTop: true,  // Always stay on top
        transparent: true,  // See-through background
        resizable: false,
        skipTaskbar: true,  // Don't show in taskbar
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    overlayWindow.loadFile('overlay.html');
    overlayWindow.hide(); // Start hidden
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
    checkForMessages();
    console.log('SMS Desktop Overlay is running!');
});



// Quit when all windows are closed
app.on('window-all-closed', () => {
    app.quit();
});