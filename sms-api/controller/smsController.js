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
        // Get messages from last 30 seconds to avoid missing rapid messages
        const thirtySecondsAgo = new Date(Date.now() - 30000);
        
        const messages = await Messages.find({
            createdAt: { $gte: thirtySecondsAgo }
        }).select('_id sender message createdAt');

        // Format response for desktop overlay
        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.createdAt
        }));

        // Only wipe messages older than 30 seconds to prevent race conditions
        await Messages.deleteMany({
            createdAt: { $lt: thirtySecondsAgo }
        });
        
        console.log(`Retrieved ${messages.length} messages, cleaned old messages.`);
        
        res.json({
            messages: formattedMessages
        });
    } 
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            error: 'Failed to fetch messages'
        });
    }
};





module.exports = {
    saveMessage,
    getLatestMessages
};