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
            message: message,
            sent: false
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
        console.log('🔍 Desktop overlay requesting latest messages...');
        
        // Get ALL unsent messages (temporarily remove time restriction)
        const messages = await Messages.find({
            sent: false
        }).select('_id sender message sent createdAt');

        console.log(`📬 Unsent messages found: ${messages.length}`);
        messages.forEach(msg => {
            console.log(`  - ${msg.sender}: "${msg.message}" (created: ${msg.createdAt.toISOString()})`);
        });

        // Format response for desktop overlay
        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.createdAt
        }));

        // Mark all retrieved messages as sent
        if (messages.length > 0) {
            const messageIds = messages.map(msg => msg._id);
            await Messages.updateMany(
                { _id: { $in: messageIds } },
                { $set: { sent: true } }
            );
            console.log(`✅ Retrieved and marked ${messages.length} messages as sent.`);
        } else {
            console.log('📭 No unsent messages to mark as sent.');
        }

        console.log('📤 Sending response with', formattedMessages.length, 'messages');
        
        res.json({
            messages: formattedMessages
        });
    } 
    catch (error) {
        console.error('❌ Error fetching/updating messages:', error);
        res.status(500).json({
            error: 'Failed to fetch and update messages'
        });
    }
};





module.exports = {
    saveMessage,
    getLatestMessages
};