const Messages = require('../models/message');



// Create new SMS message
const saveMessage = async (req, res) => {
    try {
        const { sender, message } = req.body;


        // Check valid responses
        if (!sender || !message) {
            return res.status(400).json({
                error: 'Missing required fields: sender and message'
            });
        }


        const newMessage = new Messages({
            sender: sender,
            message: message
        })


        const savedMessage = await newMessage.save();


        console.log(`New SMS saved from ${sender}: ${message.substring(0, 50)}...`);


        // Return success response
        res.status(201).json({
            status: 'success',
            message: 'SMS saved successfully',
            id: savedMessage._id
        });
    }
    catch (error) {
        console.error('Error saving SMS:', error);
        res.status(500).json({
            error: 'Failed to save SMS',
            details: error.message
        });
    }
};






// Get latest messages for desktop overlay
const getLatestMessages = async (req, res) => {
    try {

        // Get ALL messages from database
        const messages = await Messages.find({})
            .select('_id sender message createdAt'); // Gets certain fields


        // Format response for desktop overlay
        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.createdAt
        }));


        // Wipe the entire database after retrieving messages so no duplicates
        await Messages.deleteMany({});
        

        console.log(`Retrieved ${messages.length} messages and wiped database.`);


        
        res.json({
            messages: formattedMessages
        });
    } 
    catch (error) {
        console.error('Error fetching/wiping messages:', error);
        res.status(500).json({
            error: 'Failed to fetch and wipe messages'
        });
    }
};





module.exports = {
    saveMessage,
    getLatestMessages
};