require('dotenv').config();
const { app, BrowserWindow, screen, globalShortcut } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('--disable-http-cache');

let overlayWindow;
let lastKeyPressTime = 0;

function createOverlay() {
    const { width, height } = screen.getPrimaryDisplay().bounds;

    overlayWindow = new BrowserWindow({
        width: 400,
        height: height,
        x: width - 400,
        y: 0,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        backgroundColor: '#00000000',
        resizable: true,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        overlayWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        overlayWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    overlayWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.log('Overlay failed to load:', errorDescription);
    });
}

app.whenReady().then(() => {
    createOverlay();

    globalShortcut.register('Alt+P', () => {
        const currentTime = new Date().getTime();

        if (currentTime - lastKeyPressTime < 500) {
            if (overlayWindow.isVisible()) {
                overlayWindow.hide();
            }
            else {
                overlayWindow.webContents.executeJavaScript(`window.dispatchEvent(new Event('replay-animations'))`).catch(console.error);

                setTimeout(() => {
                    overlayWindow.show();
                    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
                }, 50); 
            }
            lastKeyPressTime = 0;
        }
        else {
            lastKeyPressTime = currentTime;
        }
    });

    console.log('Push Notification Desktop Overlay is running!');
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createOverlay();
    }
});