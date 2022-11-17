const fs = require('node:fs');
const path = require('node:path');
const {
    Client,
    Events,
    GatewayIntentBits,
    Collection
} = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();
const TOKEN = process.env.TOKEN;
const SERVER_ID = process.env.GUILD_ID;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const functionPath = path.join(__dirname, 'handlers')
const functionFiles = fs.readdirSync(functionPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const commandsPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(commandsPath);


// // Read Event Files

// const eventsPath = path.join(__dirname, 'events');
// const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// for (const file of eventFiles) {
//     const filePath = path.join(eventsPath, file);
//     const event = require(filePath);
//     if (event.once) {
//         client.once(event.name, (...args) => event.execute(...args));
//     } else {
//         client.on(event.name, (...args) => event.execute(...args));
//     }
// }

// // Retrieve Command Files

// const commandsPath = path.join(__dirname, 'commands');
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
//     const filePath = path.join(commandsPath, file);
//     const command = require(filePath);
//     // Set a new item in the Collection with the key as the command name and the value as the exported module
//     if ('data' in command && 'execute' in command) {
//         client.commands.set(command.data.name, command);
//     } else {
//         console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
//     }
// }


for (const file of functionFiles) {
    require(`${functionPath}/${file}`)(client);
}
client.handleEvents(eventFiles, eventsPath)
client.handleCommands(commandFolders, commandsPath)
client.login(TOKEN)