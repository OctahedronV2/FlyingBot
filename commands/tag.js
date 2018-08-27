const utils = require('../utils')
const { Command } = require('../Command')

async function tag(client, message) {
  let place = message.channel.id
  if (message.guild) {
    place = message.guild.id
  }
  const args = message.content.split(' ')
  if (args.length < 2) {
    return message.channel.send('You need to specify a tag or an action.')
  }
  switch (args[1].toLowerCase()) {
    case 'create': {
      if (args.length < 3) {
        return message.channel.send('You need to specify a tag name.')
      }
      const name = args[2]
      const tags = await utils.queryDB('SELECT * FROM tags WHERE guild_id = ? AND LOWER(name) = LOWER(?)', [place, name])
      if (tags.length > 0) {
        return message.channel.send('A tag by that name already exists.')
      }
      if (args.length < 4) {
        return message.channel.send('You need to specify the tag\'s contents.')
      }
      const contents = args.slice(3).join(' ')
      await utils.queryDB('INSERT INTO tags (guild_id, name, creator, contents) VALUES (?, ?, ?, ?)', [place, name, message.author.id, contents])
      return message.channel.send('Tag `' + name + '` has been added.')
      } break
    case 'edit':
    case 'modify': {
      if (args.length < 3) {
        return message.channel.send('You need to specify a tag name.')
      }
      const name = args[2]
      if (args.length < 4) {
        return message.channel.send('You need to specify the tag\'s new contents.')
      }
      const contents = args.slice(3).join(' ')
      await utils.queryDB('UPDATE tags SET contents = ? WHERE guild_id = ? AND LOWER(name) = LOWER(?)', [contents, place, name])
      return message.channel.send('Tag `' + name + '` has been modified.')
      } break
    case 'delete': {
      if (args.length < 3) {
        return message.channel.send('You need to specify a tag name.')
      }
      const name = args[2]
      await utils.queryDB('DELETE FROM tags WHERE guild_id = ? AND LOWER(name) = LOWER(?)', [place, name])
      return message.channel.send('Tag `' + name + '` has been removed.')
      } break
    default:
      const { contents } = (await utils.queryDB('SELECT * FROM tags WHERE guild_id = ? AND LOWER(name) = LOWER(?)', [place, args[1]]))[0]
      return message.channel.send(contents)
      break
  }
}

const command = new Command(tag, 'tag', 'Tag', 'Fun', 'tag [create (tag name) (contents)/modify (tag name) (new contents)/delete (tag name)/tag name]', ['tag'], 'Allows for the modification or usage of tags.', 0, false)

module.exports = { command }

