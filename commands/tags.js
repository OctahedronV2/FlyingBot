const utils = require('../utils')
const { Command } = require('../Command')

async function tags(client, message) {
  let place = message.channel.id
  if (message.guild) {
    place = message.guild.id
  }
  const tagRows = await utils.queryDB('SELECT * FROM tags WHERE guild_id = ?', [place])
  const tags = []
  for (let i = 0; i < tagRows.length; i++) {
    const tag = tagRows[i]
    tags.push(tag.name)
  }
  if (tags.length < 1) {
    return message.channel.send('There are no tags available here.')
  }
  return message.channel.send('Available tags:```\n' + tags.join(', ') + '```')
}

const command = new Command(tags, 'tags', 'Tags', 'Fun', 'tags', ['tags'], 'Lists all available tags for the guild or DM conversation.', 0, false)

module.exports = { command }

