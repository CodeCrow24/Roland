const { ActivityType } = require('discord.js');
const { exec } = require('child_process');
const path = require('path');

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
    const file = path.join(__dirname, '../../../assets/startup.wav');
    exec(
        `powershell -c "(New-Object Media.SoundPlayer '${file}').PlaySync()"`
    );
};