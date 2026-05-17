const Messages = require('../models/message');

const create = async (data) => {
    return await new Messages(data).save();
};

const find = async (startTimestamp, endTimestamp) => {
    return await Messages.find({
        timestamp: { $gte: startTimestamp, $lte: endTimestamp },
        read: false
    }).select('_id app_package title message image_base64 icon_base64 large_icon_base64 read timestamp');
};

const markAsRead = async (ids) => {
    return await Messages.updateMany(
        { _id: { $in: ids } },
        { $set: { read: true } }
    );
};

const deleteAll = async () => {
    return await Messages.deleteMany({});
};

module.exports = {
    create,
    find,
    markAsRead,
    deleteAll
};