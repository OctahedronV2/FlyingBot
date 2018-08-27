const { Permissions } = require('discord.js')
const utils = require('../utils')
const { Command } = require('../Command')

async function kick(client, message) {
  if (!message.guild.member(client.user).hasPermission('KICK_MEMBERS')) {
    return message.channel.send('I do not have permission to kick other members.')
  }
  const args = message.content.split(' ')
  if (args.length < 1) {
    return message.channel.send('You need to mention a member.')
  }
  if (message.mentions.members.size < 1) {
    return message.channel.send('A mentioned member must be the first argument.')
  }
  const mentionedMember = message.mentions.members.first()
  if (!mentionedMember.kickable) {
    return message.channel.send('I cannot kick that member.')
  }
  const reason = args.length > 2 ? args.slice(3).join(' ') : 'No reason specified'
  try {
    await mentionedMember.kick(reason)
  } catch (err) {
    return message.channel.send('That member could not be kicked.')
  }
  await utils.queryDB('INSERT INTO cases (guild_id, type) VALUES (?, ?)', [message.guild.id, 'kick'])
  return message.channel.send(mentionedMember.user.tag + ' was kicked.')
}

const command = new Command(kick, 'kick', 'Kick', 'Moderation', 'kick @member [reason]', ['kick'], 'Kicks the mentioned member.', Permissions.FLAGS.KICK_MEMBERS, true)

module.exports = { command }

