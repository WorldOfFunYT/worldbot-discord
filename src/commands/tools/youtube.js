const Guild = require("../../schemas/guild");
const mongoose = require("mongoose");
const { SlashCommandBuilder, channelLink } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("youtube")
        .setDescription("Youtube Settings")
        .setDefaultMemberPermissions(0)
        .addSubcommand((subcommand) =>
            subcommand
            .setName("channel")
            .setDescription("Set Youtube channel ID")
            .addStringOption((option) =>
                option.setName("id").setDescription("Youtube channel ID")
            )
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName("notify")
            .setDescription("Choose if you want Youtube upload notifications.")
            .addBooleanOption((option) =>
                option.setName("send").setDescription("Send notifications?")
            )
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName("messagechannel")
            .setDescription("Set a youtube notification channel")
            .addChannelOption((option) =>
                option
                .setName("channel")
                .setDescription("The channel to send notifications to")
            )
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName("info")
            .setDescription("Show info about the youtube notification settings")
        ),
    async execute(interaction) {
        let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildProfile) {
            guildProfile = await new Guild({
                _id: mongoose.Types.ObjectId(),
                guildId: interaction.guild.id,
                guildName: interaction.guild.name,
                guildIcon: interaction.guild.iconURL() ?
                    interaction.guild.iconURL() :
                    "None",
                youtubePosts: false,
                youtubeMessageChannelId: "",
                youtubeID: "",
                recentYoutubeUpload: "",
            });
        }
        if (interaction.options.getSubcommand() === "channel") {
            guildProfile.youtubeID = interaction.options.getString("id");

            if (!guildProfile.youtubePosts) {
                guildProfile.youtubePosts = true;
                await interaction.reply(
                    `Set the ID to "${guildProfile.youtubeID}" and turned on Youtube messages`
                );
            } else {
                await interaction.reply(`Set the ID to "${guildProfile.youtubeID}"`);
            }
        } else if (interaction.options.getSubcommand() === "notify") {
            guildProfile.youtubePosts = interaction.options.getBoolean("send");
            if (guildProfile.youtubePosts) {
                await interaction.reply(`Turned on Youtube messages`);
            } else {
                await interaction.reply(`Turned off Youtube messages`);
            }
        } else if (interaction.options.getSubcommand() === "messagechannel") {
            guildProfile.youtubeMessageChannelId =
                interaction.options.getChannel("channel").id;
            if (!guildProfile.youtubePosts) {
                guildProfile.youtubePosts = true;
                await interaction.reply(
                    `Set the notification channel to "<#${guildProfile.youtubeMessageChannelId}>" and turned on Youtube messages`
                );
            } else {
                await interaction.reply(
                    `Set the notification channel to "<#${guildProfile.youtubeMessageChannelId}>"`
                );
            }
        } else if (interaction.options.getSubcommand() === "info") {
            await interaction.reply(
                `Enabled: ${guildProfile.youtubePosts} \nYoutube channel: https://www.youtube.com/channel/${guildProfile.youtubeID} \nNotifications: <#${guildProfile.youtubeMessageChannelId}>
        `
            );
        }
        await guildProfile.save().catch(console.error);
    },
};