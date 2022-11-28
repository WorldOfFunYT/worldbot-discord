const {
	Events
} = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		setInterval(client.pickPresence, 30 * 1000);
		setInterval(client.checkVideo, 10 * 1000);
		console.log(`${client.user.tag} is ready!`)
	},
};