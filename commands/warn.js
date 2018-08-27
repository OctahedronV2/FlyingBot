const { Permissions } = require('discord.js')
const utils = require('../utils')
const { Command } = require('../Command')

async function warn(client, message) {
  const args = message.content.split(' ')
  if (args.length < 2) {
    return message.channel.send('You need to mention a member.')
  }
  if (message.mentions.members.size < 1) {
    return message.channel.send('A mentioned server member must be the first argument.')
  }
  const mentionedMember = message.mentions.members.first()
  const reason = args.slice(2).length > 0 ? args.slice(2).join(' ') : null
  const { insertId } = await utils.queryDB('INSERT INTO warnings (guild_id, warned, issuer, reason) VALUES (?, ?, ?, ?)', [message.guild.id, mentionedMember.id, message.author.id, reason])
  await utils.queryDB('INSERT INTO cases (guild_id, type, ref_id) VALUES (?, ?, ?)', [message.guild.id, 'warning', insert_id])
  try {
    await mentionedMember.send('You have been warned on `' + message.guild.name + '` by `' + message.author.tag + ' (' + message.author.id + ')` for: ' + reason)
  } catch (err) {
    return message.channel.send(mentionedMember.user.tag + ' has been warned, but a DM could not be delivered.')
  }
  return message.channel.send(mentionedMember.user.tag + ' has been warned.')
}

const command = new Command(warn, 'warn', 'Warn', 'Moderation', 'warn @member [reason]', ['warn'], 'Adds a warning to the user and DMs them, if available.', Permissions.FLAGS.MANAGE_MESSAGES, true)

module.exports = { command }

