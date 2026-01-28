require('dotenv').config();
const axios = require('axios');
const ContactManager = require('./contacts');

// Initialize contact manager
const contactManager = new ContactManager();


// Check for new SMS messages every 2 seconds.
function checkForMessages(showSMS) {
    setInterval(async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/sms-api/latest`);

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
    }, 500);
}


module.exports = checkForMessages;