const { EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");
const parser = new Parser();
const fs = require("fs");
const dotenv = require("dotenv");
const Guild = require("../../schemas/guild");
const mongoose = require("mongoose");

module.exports = (client) => {
    client.checkVideo = async() => {
        let guildProfiles = await Guild.find({ youtubePosts: true });
        for (const guildProfile of guildProfiles) {
            if (!guildProfile) {
                console.error("Data not set. Use /youtube to set it!");
                return;
            }
            const data = await parser
                .parseURL(
                    `https://www.youtube.com/feeds/videos.xml?channel_id=${guildProfile.youtubeID}`
                )
                .catch(console.error);

            recentVideoID = guildProfile.recentYoutubeUpload;

            if (recentVideoID !== data.items[0].id) {
                // New video or video not set
                guildProfile.recentYoutubeUpload = data.items[0].id;
                guildProfile.save();

                // 1042826699680780410

                const guild = await client.guilds
                    .fetch(guildProfile.guildId)
                    .catch(console.error);
                const channel = await guild.channels
                    .fetch(guildProfile.youtubeMessageChannelId)
                    .catch(console.error);
                const { title, link, id, author } = data.items[0];

                const embed = new EmbedBuilder({
                    title: title,
                    url: link,
                    timestamp: Date.now(),
                    image: {
                        url: `https://img.youtube.com/vi/${id.slice(9)}/maxresdefault.jpg`,
                    },
                    author: {
                        name: author,
                        url: `https://www.youtube.com/channel/${guildProfile.youtubeID}/?sub_confirmation=1`,
                    },
                    footer: {
                        text: client.user.tag,
                        iconURL: client.user.displayAvatarURL(),
                    },
                }).setColor(client.embedColor);

                await channel.send({
                    embeds: [embed],
                });
            }
        }
    };
};