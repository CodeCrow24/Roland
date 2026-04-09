const { ActivityType } = require('discord.js');
const { exec } = require('child_process');
const path = require('path');

module.exports = (client) => {
    console.log(`${client.user.displayName} is online.`);
    client.user.setPresence({
        status: 'dnd'
    });
    // client.user.setPresence({
    //     status: 'idle',
    //     activities: [{
    //         name: '🏛️ Parlament Webcam',
    //         type: ActivityType.Streaming,
    //         url: 'https://www.youtube.com/watch?v=SsyiWrkUjy4',
    //     }],
    // });
};