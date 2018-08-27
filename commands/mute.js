const { Permissions } = require('discord.js')
const moment = require('moment')
const humanize = require('humanize-duration')
const utils = require('../utils')
const { Command } = require('../Command')

async function mute(client, message) {
  if (!message.guild.member(client.user).hasPermission('MUTE_MEMBERS')) {
    return message.channel.send('I do not have permission to mute other members.')
  }
  const { muted_role_id } = await utils.getGuildConfig(message.guild.id, true)
  if (muted_role_id && !message.guild.member(client.user).hasPermission('MANAGE_ROLES')) {
    return message.channel.send('I do not have permission to add muted roles.')
  }
  const args = message.content.split(' ')
  if (args.length < 2) {
    return message.channel.send('You need to mention a member.')
  }
  if (message.mentions.members.size < 1) {
    return message.channel.send('A mentioned member must be the first argument.')
  }
  const mentionedMember = message.mentions.members.first()
  let time = 0
  let duration
  let reason = 'No reason specified'
  if (args.length > 2) {
    const timeObjs = utils.strToTime(args.slice(2).join(' '), true)
    time = utils.timeToMs(timeObjs[0])
    duration = moment.duration(time)
    reason = args.slice(2).join(' ').replace(timeObjs[1], '').trim()
    if (reason === '') {
      reason = 'No reason specified'
    }
  }
  const { insertId } = await utils.queryDB('INSERT INTO mutes (guild_id, muted, issuer, reason, unmute_at) VALUES (?, ?, ?, ?, ?)', [message.guild.id, mentionedMember.id, message.author.id, reason, moment().add(duration).format()])
  await mentionedMember.setMute(true, reason)
  if (muted_role_id) {
    await mentionedMember.addRole(muted_role_id, reason)
  }
  setTimeout(async () => {
    try {
      await mentionedMember.setMute(false, 'Automatic unmute - ' + reason)
      if (muted_role_id) {
        await mentionedMember.removeRole(muted_role_id, 'Automatic unmute - ' + reason)
      }
    } catch (err) {
      utils.Log.debug('Problem automatically unmuting ' + mentionedMember.user.tag + ':')
      utils.Log.error(err)
      return message.channel.send('There was an issue automatically unmuting ' + mentionedMember.user.tag + '.')
    }
  }, time)
  await utils.queryDB('INSERT INTO cases (guild_id, type, ref_id) VALUES (?, ?, ?)', [message.guild.id, 'mute', insertId])
  return message.channel.send(mentionedMember.user.tag + ' has been muted for ' + humanize(duration.valueOf()) + '.')
}

const command = new Command(mute, 'mute', 'Mute', 'Moderation', 'mute @member [time]', ['mute'], 'Mutes the mentioned member indefinitely (or with the time specified).', Permissions.FLAGS.MUTE_MEMBERS, true)

module.exports = { command }

