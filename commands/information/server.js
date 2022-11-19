const Canvas = require('@napi-rs/canvas');
const {
	SlashCommandBuilder,
	time,
	AttachmentBuilder
} = require('discord.js');
const {
	request
} = require('undici')

const applyText = (canvas, text, fontSizeInitial) => {
	const context = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = fontSizeInitial;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		context.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (context.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return context.font;
};

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

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		const canvas = Canvas.createCanvas(1000, 250)
		const context = canvas.getContext('2d')

		// Gradient
		var gradient = context.createLinearGradient(0, -180, 700, 0);
		gradient.addColorStop(0, "#8229ff");
		gradient.addColorStop(1, "#f2338d");
		context.fillStyle = gradient
		roundRect(context, 0, 0, canvas.width, canvas.height, 20, context.fillStyle, false)
		// gradient.addColorStop(0, "#4F2789");
		// gradient.addColorStop(1, "#6B2245");
		context.fillStyle = '#00000055';

		roundRect(context, 25, 25, canvas.width - 50, canvas.height - 50, 20, context.fillStyle, false)



		// Guild Name

		context.font = applyText(canvas, interaction.guild.name, 56)
		context.fillStyle = '#ffffff'
		context.fillText(interaction.guild.name, canvas.width / 4.25, canvas.height / 2.35);

		// Member Count
		memberCountText = `${interaction.guild.memberCount.toString()} members`
		context.font = applyText(canvas, memberCountText, 65)
		context.fillStyle = '#ffffff'
		context.fillText(memberCountText, canvas.width / 4.25, canvas.height / 1.45);

		// Profile picture
		context.beginPath();
		context.arc(125, 125, 80, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

		const {
			body
		} = await request(interaction.guild.iconURL({
			extension: 'png'
		}))
		const avatar = await Canvas.loadImage(await body.arrayBuffer());
		context.drawImage(avatar, 45, 45, 160, 160)


		// Display Picture
		const attachment = new AttachmentBuilder(await canvas.encode('png'), {
			name: 'user-details.png'
		})
		interaction.reply({
			files: [attachment]
		});


		// await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
};