const { REST, Routes } = require("discord.js");

const fs = require("fs");

global = process.env.IS_GLOBAL;

module.exports = (client) => {
    client.handleCommands = async() => {
        const commandFolders = fs.readdirSync("./src/commands");
        client.commandArray = [];
        for (folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`${__dirname}/../../commands/${folder}`)
                .filter((file) => file.endsWith(".js"));

            for (const file of commandFiles) {
                const command = require(`${__dirname}/../../commands/${folder}/${file}`);
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                if ("data" in command && "execute" in command) {
                    client.commands.set(command.data.name, command);
                    client.commandArray.push(command.data.toJSON());
                } else {
                    console.log(
                        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                    );
                }
            }
        }
        // Construct and prepare an instance of the REST module
        const rest = new REST({
            version: "10",
        }).setToken(process.env.TOKEN);

        // and deploy your commands!
        (async() => {
            try {
                console.log(
                    `Started refreshing ${client.commandArray.length} application (/) commands.`
                );

                // The put method is used to fully refresh all commands in the guild with the current set
                let data;
                if (global != "true") {
                    console.log("Refreshing test guild (/) commands");
                    data = await rest
                        .put(
                            Routes.applicationGuildCommands(
                                process.env.CLIENT_ID,
                                process.env.GUILD_ID
                            ), {
                                body: client.commandArray,
                            }
                        )
                        .catch(console.error);
                } else if (global == "true") {
                    console.log("Refreshing application (/) commands");
                    data = await rest
                        .put(Routes.applicationCommands(process.env.CLIENT_ID), {
                            body: client.commandArray,
                        })
                        .catch(console.error);
                }

                console.log(
                    `Successfully reloaded ${data.length} application (/) commands.`
                );
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        })();
    };
};