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

for (const file of functionFiles) {
    require(`${functionPath}/${file}`)(client);
}
client.handleEvents(eventFiles, eventsPath)
client.handleCommands(commandFolders, commandsPath)
client.login(TOKEN)