const {
    Schema,
    model
} = require('mongoose')
const guildSchema = new Schema({
    _id: Schema.Types.ObjectId,
    guildId: String,
    guildName: String,
    guildIcon: {
        type: String,
        required: false
    },
    youtubeUrl: {type: String, required: false},
    youtubePosts: Boolean
})

module.exports = model("Guild", guildSchema, "guilds");