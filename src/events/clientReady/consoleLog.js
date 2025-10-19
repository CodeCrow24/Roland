const { ActivityType } = require('discord.js');

module.exports = (client) => {
    console.log(`${client.user.displayName} is online.`);
    client.user.setPresence({
        status: 'idle',
        activities: [{
            name: '🏛️ Parlament Webcam',
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=SsyiWrkUjy4',
        }],
    });
};