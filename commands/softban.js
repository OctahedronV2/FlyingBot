const { Permissions } = require('discord.js')
const utils = require('../utils')
const { Command } = require('../Command')

async function softban(client, message) {
  if (!message.guild.member(client.user).hasPermission('BAN_MEMBERS')) {
    return message.channel.send('I do not have permission to ban other members.')
  }
  const args = message.content.split(' ')
  if (args.length < 2) {
    return message.channel.send('You need to mention a member.')
  }
  if (message.mentions.members.size < 1) {
    return message.channel.send('A mentioned server member must be the first argument.')
  }
  const mentionedMember = message.mentions.members.first()
  if (!mentionedMember.bannable) {
    return message.channel.send('I cannot ban that member.')
  }
  // TODO: Make this default value configurable
  const guildConfig = await utils.getGuildConfig()
  let banDays = guildConfig.ban_deletion_days || 7
  let reason = 'No reason specified'
  if (args.length > 2) {
    if (!isNaN(args[2])) {
      args[2] = parseInt(args[2])
      if (args[2] < 0 || args[2] > 7) {
        message.channel.send('Specified days worth of messages was out of range; clamping.')
        if (args[2] < 0) {
          args[2] = 0
        } else if (args[2] > 7) {
          args[2] = 7
        }
      }
      if (args.length > 3) {
        reason = args.slice(3).join(' ')
      }
    } else {
      reason = args.slice(2).join(' ')
    }
  }
  try {
    await mentionedMember.ban({ days: banDays, reason: reason })
  } catch (err) {
    return message.channel.send('That member could not be banned.')
  }
  try {
    await message.guild.unban(mentionedMember.id, reason)
  } catch (err) {
    return message.channel.send('That member could not be unbanned.')
  }
  await utils.queryDB('INSERT INTO cases (guild_id, type) VALUES (?, ?)', [message.guild.id, 'softban'])
  return message.channel.send(mentionedMember.user.tag + ' has been softbanned.')
}

const command = new Command(softban, 'softban', 'Softban', 'Moderation', 'softban @member [days worth of messages] [reason]', ['softban'], 'Bans then unbans the mentioned member, removing the specified amount of days worth of messages (or 7 by default).', Permissions.FLAGS.BAN_MEMBERS, true)

module.exports = { command }

