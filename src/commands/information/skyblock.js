const { EmbedBuilder } = require("@discordjs/builders");
const Canvas = require("@napi-rs/canvas");
const { SlashCommandBuilder, time, AttachmentBuilder } = require("discord.js");
const { request } = require("undici");

const applyText = (canvas, text, fontSizeInitial, maxWidth) => {
    const context = canvas.getContext("2d");

    // Declare a base size of the font
    let fontSize = fontSizeInitial;

    do {
        // Assign the font to the context and decrement it so it can be measured again
        context.font = `bold ${(fontSize -= 10)}px inter`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (context.measureText(text).width > maxWidth);

    // Return the result to use in the actual canvas
    return context.font, fontSize;
};

function intToString(num) {
    try {
        num = num.toString().replace(/[^0-9.]/g, "");
    } catch (TypeError) {
        num = "NaN";
    }
    if (num < 1000 || num == "NaN") {
        return num;
    }
    let si = [
        { v: 1e3, s: "K" },
        { v: 1e6, s: "M" },
        { v: 1e9, s: "B" },
        { v: 1e12, s: "T" },
        { v: 1e15, s: "P" },
        { v: 1e18, s: "E" },
    ];
    let index;
    for (index = si.length - 1; index > 0; index--) {
        if (num >= si[index].v) {
            break;
        }
    }
    return (
        (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") +
        si[index].s
    );
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
}

function drawText(
    context,
    canvas,
    text,
    fontSize,
    color,
    x,
    y,
    maxWidth,
    textAlign,
    textPosition
) {
    context.font, (fontSizeNew = applyText(canvas, text, fontSize, maxWidth));
    context.textAlign = textAlign;
    context.fillStyle = color;
    let newY;
    if (textPosition == "top") {
        newY = y;
    } else if (textPosition == "center") {
        newY = y + fontSizeNew / 2;
    } else if (textPosition == "bottom") {
        newY = y + fontSizeNew;
    }
    context.fillText(text, x, newY);
}

function getBestSkills(data) {
    rawData = data.raw;
    skills = {
        Farming: rawData.experience_skill_farming,
        Mining: rawData.experience_skill_mining,
        Combat: rawData.experience_skill_combat,
        Foraging: rawData.experience_skill_foraging,
        Fishing: rawData.experience_skill_fishing,
        Enchanting: rawData.experience_skill_enchanting,
        Alchemy: rawData.experience_skill_alchemy,
    };
    let sortable = [];
    for (var skill in skills) {
        sortable.push([skill, skills[skill]]);
    }

    sortable.sort(function(a, b) {
        return a[1] - b[1];
    });

    sortable.reverse();

    return sortable;
}

function progressBar(
    context,
    x,
    y,
    width,
    height,
    radius,
    max,
    value,
    bg,
    colour
) {
    context.fillStyle = bg;
    roundRect(context, x, y, width, height, radius, true, false);
    const insideHeight = (value / max) * height;
    if (insideHeight > height) {
        insideHeight = height;
    }
    const newY = height - insideHeight + y;
    context.fillStyle = colour;
    roundRect(context, x, newY, width, insideHeight, radius, true, false);
}

async function createCard(interaction, data, accentColour, backgroundColour) {
    const username = data.data.display_name;
    const uuid = data.data.uuid;
    const skillAverage = data.data.average_level.toFixed(2);
    const networth = data.data.networth.networth;
    const senither = data.data.weight.senither.overall;
    let secrets;
    try {
        secrets = intToString(data.data.dungeons.secrets_found);
    } catch (TypeError) {
        secrets = "NaN";
    }
    const skills = getBestSkills(data);

    const canvas = Canvas.createCanvas(1080, 1080);
    const context = canvas.getContext("2d");
    context.fillStyle = backgroundColour;
    context.fillRect(0, 0, 1080, 1080);

    drawText(
        context,
        canvas,
        `${username}'s`, // Text
        84, // Font Size
        accentColour, // Colour
        160, // X Position
        80, // Y Position
        550, // Maximum Width
        "left", // Text Align
        "center" // Text Position
    );

    drawText(
        context,
        canvas,
        `Hypixel Skyblock`, // Text
        64, // Font Size
        "#ffffff", // Colour
        40, // X Position
        147, // Y Position
        550, // Maximum Width
        "left", // Text Align
        "bottom" // Text Position
    );

    drawText(
        context,
        canvas,
        `${skillAverage}`, // Text
        114, // Font Size
        "#ffffff", // Colour
        1040, // X Position
        30, // Y Position
        340, // Maximum Width
        "right", // Text Align
        "bottom" // Text Position
    );
    drawText(
        context,
        canvas,
        `Skill Average`, // Text
        50, // Font Size
        "#ffffff", // Colour
        1040, // X Position
        160, // Y Position
        340, // Maximum Width
        "right", // Text Align
        "bottom" // Text Position
    );
    context.fillStyle = "#ffffff1a";

    roundRect(context, 40, 265, 320, 216, 10, true);
    roundRect(context, 380, 265, 320, 216, 10, true);
    roundRect(context, 720, 265, 320, 216, 10, true);

    drawText(
        context,
        canvas,
        `${intToString(networth)}`, // Text
        70, // Font Size
        accentColour, // Colour
        200, // X Position
        370, // Y Position
        300, // Maximim Width
        "center", // Text Align
        "top" // Text Position
    );
    drawText(
        context,
        canvas,
        `Networth`, // Text
        42, // Font Size
        "#ffffff", // Colour
        200, // X Position
        380, // Y Position
        300, // Maximim Width
        "center", // Text Align
        "bottom" // Text Position
    );

    drawText(
        context,
        canvas,
        `${intToString(senither.toFixed(1))}`, // Text
        70, // Font Size
        accentColour, // Colour
        540, // X Position
        370, // Y Position
        300, // Maximim Width
        "center", // Text Align
        "top" // Text Position
    );
    drawText(
        context,
        canvas,
        `Senither Weight`, // Text
        42, // Font Size
        "#ffffff", // Colour
        540, // X Position
        380, // Y Position
        300, // Maximim Width
        "center", // Text Align
        "bottom" // Text Position
    );

    drawText(
        context,
        canvas,
        `${secrets}`, // Text
        70, // Font Size
        accentColour, // Colour
        880, // X Position
        370, // Y Position
        300, // Maximim Width
        "center", // Text Align
        "top" // Text Position
    );
    drawText(
        context,
        canvas,
        `Secrets Found`, // Text
        42, // Font Size
        "#ffffff", // Colour
        880, // X Position
        380, // Y Position
        300, // Maximim Width
        "center", // Text Align
        "bottom" // Text Position
    );

    progressBar(
        context,
        40, // X Position
        520, // Y Position
        184, // Width
        516, // Height
        10, // Radius
        skills[0][1], // Maximum
        skills[0][1], // Progress Value
        "#ffffff1a", // Background Colour
        accentColour // Accent Colour
    );
    drawText(
        context,
        canvas,
        `${skills[0][0]}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        132, // X Position
        540, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "bottom" // Text Position
    );
    drawText(
        context,
        canvas,
        `${intToString(skills[0][1])}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        132, // X Position
        1010, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "top" // Text Position
    );

    progressBar(
        context,
        240, // X Position
        520, // Y Position
        184, // Width
        516, // Height
        10, // Radius
        skills[0][1], // Maximum
        skills[1][1], // Progress Value
        "#ffffff1a", // Background Colour
        accentColour // Accent Colour
    );
    drawText(
        context,
        canvas,
        `${skills[1][0]}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        332, // X Position
        540, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "bottom" // Text Position
    );
    drawText(
        context,
        canvas,
        `${intToString(skills[1][1])}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        332, // X Position
        1010, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "top" // Text Position
    );
    progressBar(
        context,
        440, // X Position
        520, // Y Position
        184, // Width
        516, // Height
        10, // Radius
        skills[0][1], // Maximum
        skills[2][1], // Progress Value
        "#ffffff1a", // Background Colour
        accentColour // Accent Colour
    );
    drawText(
        context,
        canvas,
        `${skills[2][0]}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        532, // X Position
        540, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "bottom" // Text Position
    );
    drawText(
        context,
        canvas,
        `${intToString(skills[2][1])}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        532, // X Position
        1010, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "top" // Text Position
    );
    progressBar(
        context,
        640, // X Position
        520, // Y Position
        184, // Width
        516, // Height
        10, // Radius
        skills[0][1], // Maximum
        skills[3][1], // Progress Value
        "#ffffff1a", // Background Colour
        accentColour // Accent Colour
    );
    drawText(
        context,
        canvas,
        `${skills[3][0]}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        732, // X Position
        540, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "bottom" // Text Position
    );
    drawText(
        context,
        canvas,
        `${intToString(skills[3][1])}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        732, // X Position
        1010, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "top" // Text Position
    );
    progressBar(
        context,
        840, // X Position
        520, // Y Position
        184, // Width
        516, // Height
        10, // Radius
        skills[0][1], // Maximum
        skills[4][1], // Progress Value
        "#ffffff1a", // Background Colour
        accentColour // Accent Colour
    );
    drawText(
        context,
        canvas,
        `${skills[4][0]}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        932, // X Position
        540, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "bottom" // Text Position
    );
    drawText(
        context,
        canvas,
        `${intToString(skills[4][1])}`, // Text
        45, // Font Size
        "#ffffff", // Colour
        932, // X Position
        1010, // Y Position
        170, // Maximim Width
        "center", // Text Align
        "top" // Text Position
    );

    const userUrl = `https://crafatar.com/avatars/${uuid}?size=100&overlay`;
    const { body } = await request(userUrl);
    const avatar = await Canvas.loadImage(await body.arrayBuffer());
    context.drawImage(avatar, 40, 40, 100, 100);

    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
        name: "user-details.png",
    });
    interaction.reply({
        files: [attachment],
    });
}

async function createProfileList(
    interaction,
    profiles,
    data,
    accentColour,
    backgroundColour
) {
    const username = data[Object.keys(data)[0]].data.display_name;
    const uuid = data[Object.keys(data)[0]].data.uuid;

    const canvas = Canvas.createCanvas(1080, 1080);
    const context = canvas.getContext("2d");

    const startX = 40;
    const startY = 265;

    context.fillStyle = backgroundColour;
    context.fillRect(0, 0, 1080, 1080);

    for (let i = 0; i < profiles.length; i++) {
        if (profiles[i][1] == "normal") {
            profiles[i][1] = "";
        } else if (profiles[i][1] == "island") {
            profiles[i][1] = "🏝️";
        } else if (profiles[i][1] == "ironman") {
            profiles[i][1] = "🛡️";
        } else if (profiles[i][1] == "bingo") {
            profiles[i][1] = "🎲";
        }
        context.fillStyle = "#ffffff1a";
        roundRect(context, startX, startY + i * 163, 1000, 123, 20, true, false);
        drawText(
            context,
            canvas,
            `${profiles[i][0]} ${profiles[i][1]}`,
            54,
            "#ffffff",
            82,
            325 + i * 161,
            500,
            "left",
            "center"
        );
    }

    drawText(
        context,
        canvas,
        `${username}'s`, // Text
        84, // Font Size
        accentColour, // Colour
        160, // X Position
        80, // Y Position
        550, // Maximum Width
        "left", // Text Align
        "center" // Text Position
    );

    drawText(
        context,
        canvas,
        `Profiles`, // Text
        64, // Font Size
        "#ffffff", // Colour
        40, // X Position
        147, // Y Position
        550, // Maximum Width
        "left", // Text Align
        "bottom" // Text Position
    );

    const userUrl = `https://crafatar.com/avatars/${uuid}?size=100&overlay`;
    const { body } = await request(userUrl);
    const avatar = await Canvas.loadImage(await body.arrayBuffer());
    context.drawImage(avatar, 40, 40, 100, 100);

    const attachment = new AttachmentBuilder(await canvas.encode("png"), {
        name: "user-details.png",
    });
    interaction.reply({
        files: [attachment],
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skyblock")
        .setDescription("Skyblock commands help")
        .addSubcommand((subcommand) =>
            subcommand
            .setName("card")
            .setDescription(
                "Provides information about chosen user on Hypixel Skyblock as an image"
            )
            .addStringOption((option) =>
                option
                .setName("username")
                .setDescription(
                    "The minecraft username of the person you are getting data of."
                )
                .setRequired(true)
            )
            .addStringOption((option) =>
                option
                .setName("profile")
                .setDescription("The skyblock profile that you want to see")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
            subcommand
            .setName("profiles")
            .setDescription("List of profiles that the chosen player has")
            .addStringOption((option) =>
                option
                .setName("username")
                .setDescription(
                    "The Minecraft user that you want to see the profiles of"
                )
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        const accentColour = "#3BD138";
        const backgroundColour = "#1e1e1e";
        if (interaction.options.getSubcommand() == "card") {
            fetch(
                    `https://sky.shiiyu.moe/api/v2/profile/${interaction.options.getString(
          "username"
        )}`
                )
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    if (data.error) {
                        interaction.reply(data.error);
                        return;
                    }
                    const profiles = data.profiles;
                    let profile_data;
                    for (const profile of Object.keys(profiles)) {
                        let cute_name = profiles[profile].cute_name;
                        cute_name = cute_name.toLowerCase();
                        if (cute_name == interaction.options.getString("profile")) {
                            profile_data = profiles[profile];
                        }
                    }
                    if (profile_data == undefined) {
                        interaction.reply(
                            `No profiles with the name '${interaction.options.getString(
                "profile"
              )}' were found`
                        );
                        return;
                    }
                    createCard(interaction, profile_data, accentColour, backgroundColour);
                });
        } else if (interaction.options.getSubcommand() == "profiles") {
            fetch(
                    `https://sky.shiiyu.moe/api/v2/profile/${interaction.options.getString(
          "username"
        )}`
                )
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    let profiles = [];
                    try {
                        Object.keys(data.profiles);
                    } catch (TypeError) {
                        interaction.reply(
                            `No user with the name '${interaction.options.getString(
                "username"
              )}' was found`
                        );
                        return;
                    }
                    for (const profile of Object.keys(data.profiles)) {
                        profiles.push([
                            data.profiles[profile].cute_name,
                            data.profiles[profile].game_mode,
                        ]);
                    }
                    createProfileList(
                        interaction,
                        profiles,
                        data.profiles,
                        accentColour,
                        backgroundColour
                    );
                });
        }
    },
};