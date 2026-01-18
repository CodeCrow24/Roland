const { testServer } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');
const writeToLog = require('../../utils/writeToLog');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

module.exports = async (client) => {
    
    try {
        console.log(process.env.SPLASH);
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(client, testServer);

        for (const localCommand of localCommands) {
            const {name, description, options} = localCommand;

            const existingCommand = await applicationCommands.cache.find(
                (cmd) => cmd.name === name
            );

            if (existingCommand) {
                if (localCommand.deleted){
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`Deleted command "${name}".`);
                    const file = path.join(__dirname, '../../../assets/delete.wav');
                    exec(
                        `powershell -c "(New-Object Media.SoundPlayer '${file}').PlaySync()"`
                    );
                    continue;
                }

                if (areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                    });

                    console.log(`Edited command "${name}".`);
                    const file = path.join(__dirname, '../../../assets/hmpfhhh.wav');
                    exec(
                        `powershell -c "(New-Object Media.SoundPlayer '${file}').PlaySync()"`
                    );
                    continue;
                } else {
                    continue;
                }
            } else {
                if (localCommand.deleted) {
                    console.log(`Skipping registering command "${name}" as it's set to delete.`);
                    const file = path.join(__dirname, '../../../assets/hmpfhhh.wav');
                    exec(
                        `powershell -c "(New-Object Media.SoundPlayer '${file}').PlaySync()"`
                    );
                    continue;
                }
            }

            await applicationCommands.create({
                name,
                description,
                options,
            });

            console.log(`Registered command "${name}".`);
            setTimeout(() => {}, 2000);
        }
        
    } catch (error) {
        console.log(`An Error occurred: ${error}`);
        writeToLog(error, true);
    }
};