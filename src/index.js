const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();
const { TOKEN, SERVER_ID, DATABASE_TOKEN } = process.env;
const { connect } = require("mongoose");

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
client.embedColor = "0xf2338d";

const functionPath = path.join(__dirname, "functions");
const functionFolders = fs.readdirSync(functionPath);
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`${functionPath}\\${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of functionFiles) {
        require(`${functionPath}/${folder}/${file}`)(client);
    }
}
client.handleEvents();
client.handleCommands();
client.login(TOKEN);
(async() => {
    await connect(DATABASE_TOKEN).catch(console.error);
})();