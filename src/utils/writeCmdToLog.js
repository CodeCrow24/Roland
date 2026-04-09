const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = (interaction) => {
    if (!process.env.LOGGING){return}
    const commandName = interaction.commandName
    const options = {};
    
    for (const option of interaction.options.data) {
        options[option.name] = option.value;
    }

    const logEntry = {
        timestamp: new Date().toISOString(),
        user: interaction.user.tag,
        options: options
    };

    const logDir = path.join(__dirname, '..', '..', 'logs');
    const logFile = path.join(logDir, `${commandName}-command-log.json`);

    // Ensure there is a logs dir
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Ensure the log file exists
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '[]', 'utf8');
    }

    let logs = [];
    if (fs.existsSync(logFile)) {
        try {
            const rawData = fs.readFileSync(logFile, 'utf8');
            logs = JSON.parse(rawData);
        } catch (err) {
            console.error('Error parsing logs:', err);
        }
    }

    logs.push(logEntry);

    try {
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing logs:', err);
    }
};