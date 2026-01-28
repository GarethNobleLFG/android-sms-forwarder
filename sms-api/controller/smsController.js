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

        // Get messages from the past minute
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const messages = await Messages.find({
            createdAt: { $gte: oneMinuteAgo },
            sent: false
        }).select('_id sender message sent createdAt');


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
            console.log(`Retrieved and marked ${messages.length} messages as sent.`);
        }


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






const deleteDb = async (req, res) => {
    try {
        const deleteDb = await Messages.deleteMany({})

        console.log(`Deleted DB: ${deleteDb.deletedCount}`);

        res.status(200).json({
            status: 'success',
            message: 'Successfully deleted DB!',
            deletedCount: result.deletedCount
        })
    }
    catch (error) {
        console.error('Error deleting messages:', error);
        res.status(500).json({
            error: 'Failed to delete messages',
            details: error.message
        });
    }
}






module.exports = {
    saveMessage,
    getLatestMessages,
    deleteDb
};