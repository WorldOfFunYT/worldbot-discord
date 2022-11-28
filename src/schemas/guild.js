const { Schema, model } = require("mongoose");
const guildSchema = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: String,
  guildName: String,
  guildIcon: {
    type: String,
    required: false,
  },
  youtubeID: { type: String, required: false },
  youtubePosts: Boolean,
  youtubeMessageChannelId: { type: String, required: false },
  recentYoutubeUpload: { type: String, required: false },
});

module.exports = model("Guild", guildSchema, "guilds");
