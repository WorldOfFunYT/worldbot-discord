const {
	EmbedBuilder,
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} = require('discord.js');
const fs = require("node:fs");

module.exports = {
	data: new SlashCommandBuilder().setName('invite').setDescription('Sends an invite link to invite me to your own server!'),
	async execute(interaction) {
		const inviteURL = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot&permissions=8`
		// const embed = new EmbedBuilder().setColor('Blurple').setTitle('Invite me!').setDescription('description').setURL(inviteURL)
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
				.setLabel('Invite me!')
				.setStyle(ButtonStyle.Link).setURL(inviteURL)
			);

		await interaction.reply({
			components: [row]
		});
	}
}