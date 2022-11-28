const {
    EmbedBuilder
} = require('discord.js')
const Parser = require("rss-parser");
const parser = new Parser();
const fs = require("node:fs");
const dotenv = require("dotenv")

module.exports = (client) => {
    client.checkVideo = async () => {
        const data = await parser
            .parseURL(
                "https://www.youtube.com/feeds/videos.xml?channel_id=UCeUUA5_p6hFidp55OealcgQ"
            )
            .catch(console.error);

        const rawData = fs.readFileSync(`${__dirname}/../../json/video.json`)
        const jsonData = JSON.parse(rawData)

        if (jsonData.id !== data.items[0].id) { // New video or video not set
            fs.writeFileSync(`${__dirname}/../../json/video.json`, JSON.stringify({
                id: data.items[0].id
            }));

            // 1042826699680780410

            const guild = await client.guilds.fetch(process.env.GUILD_ID).catch(console.error)
            const channel = await guild.channels.fetch('1043226963382378608').catch(console.error);
            const {
                title,
                link,
                id,
                author
            } = data.items[0];

            const embed = new EmbedBuilder({
                title: title,
                url: link,
                timestamp: Date.now(),
                image: {
                    url: `https://img.youtube.com/vi/${id.slice(9)}/maxresdefault.jpg`
                },
                author: {
                    name: author,
                    iconURL: 'https://yt3.ggpht.com/jS5h7XEgTEDLWRo5NMHZkJK_TpEH8DMSG_8pdvKbuTdxNmrpqoKAYodrWMeN8bM7EFGZINNyPQk=s176-c-k-c0x00ffffff-no-rj',
                    url: 'https://www.youtube.com/worldoffunyt/?sub_confirmation=1'
                },
                footer: {
                    text: client.user.tag,
                    iconURL: client.user.displayAvatarURL()
                }
            }).setColor(client.embedColor);

            await channel.send({
                embeds: [embed]
            });
        }
    };
};