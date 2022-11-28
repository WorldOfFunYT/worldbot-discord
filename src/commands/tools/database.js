const Guild = require('../../schemas/guild')
const {
    SlashCommandBuilder
} = require("discord.js");
const mongoose = require('mongoose')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("database")
        .setDescription("Returns info from a database").setDefaultMemberPermissions(0),
    async execute(interaction) {
        let guildProfile = await Guild.findOne({ guildId: interaction.guild.id })
        if (!guildProfile) { guildProfile = await new Guild({
            _id: mongoose.Types.ObjectId(),
            guildId: interaction.guild.id,
            guildName: interaction.guild.name,
            guildIcon: interaction.guild.iconURL() ? interaction.guild.iconURL(): "None",
            youtubePosts: false
        });
        
        await guildProfile.save().catch(console.error)
        await interaction.reply({
            content: `Server Name: ${guildProfile.guildName}`
            
        });
        console.log(guildProfile)
    } else {
        await interaction.reply({
            content: `Server ID: ${guildProfile.guildId}`
            
        });
        console.log(guildProfile)
    }
    },
};