const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("youtube")
    .setDescription("Youtube Settings")
    .setDefaultMemberPermissions(0)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("url")
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
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "url") {
      await interaction.reply(
        "Nothing happened, because I haven't implemented function, but you used the /youtube url command"
      );
    } else if (interaction.options.getSubcommand() == "notify") {
      await interaction.reply(
        "Nothing happened, because I haven't implemented function, but you used the /youtube notify command"
      );
    }
  },
};
