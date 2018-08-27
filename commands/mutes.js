const { Permissions } = require('discord.js')
const moment = require('moment')
const utils = require('../utils')
const { Command } = require('../Command')

async function mutes(client, message) {
  const args = message.content.split(' ')
  if (args.length < 2) {
    // Display all mutes from the current guild.
    const muteRows = await utils.queryDB('SELECT * FROM mutes WHERE guild_id = ?', [message.guild.id])
    if (muteRows.length < 1) {
      return message.channel.send('There are no mutes in this server.')
    }
    let muteLines = []
    for (let i = 0; i < muteRows.length; i++) {
      const mute = muteRows[i]
      const { id, muted } = mute
      const mutedUser = await client.fetchUser(mute.muted)
      muteLines.push(id + ' - ' + mutedUser.tag)
    }
    return message.channel.send('All mutes:\n```\n' + muteLines.join('\n') + '```\nFor extra information on a mute, see the help item for `Mutes`.')
  }
  // Display all mutes from a specific user in the current guild.
  if (!isNaN(args[1])) {
    // The input number could possibly be an ID.
    args[1] = parseInt(args[1])
    const muteRows = await utils.queryDB('SELECT * FROM mutes WHERE guild_id = ? AND id = ?', [message.guild.id, args[1]])
    if (muteRows.length < 1) {
      return message.channel.send('No mutes were found by that ID.')
    }
    const mute = muteRows[0]
    const { id, muted, issuer, reason, issued_at, unmute_at } = mute
    const mutedUser = await client.fetchUser(mute.muted)
    const issuerUser = await client.fetchUser(mute.issuer)
    const issuedAt = moment.utc(issued_at).format('YYYY-MM-DD HH:mm:ss')
    const unmuteAt = moment.utc(unmute_at).format('YYYY-MM-DD HH:mm:ss')
    let lines = [
      'ID: ' + id,
      'Muted: ' + mutedUser.tag + ' (' + mutedUser.id + ')',
      'Issuer: ' + issuerUser.tag + ' (' + issuerUser.id + ')',
      'Issed At: ' + issuedAt,
      'Unmute At: ' + unmuteAt,
      'Reason: ' + reason ? utils.truncateStr(reason, 1900) : 'No reason specified'
    ]
    return message.channel.send('```\n' + lines.join('\n') + '```')
  }
  if (message.mentions.members.size < 1) {
    return message.channel.send('A mentioned server member must be the first argument.')
  }
  const mentionedMember = message.mentions.members.first()
  const muteRows = await utils.queryDB('SELECT * FROM mutes WHERE guild_id = ? AND muted = ?', [message.guild.id, mentionedMember.id])
  if (muteRows.length < 1) {
    return message.channel.send('The specified member has no mutes.')
  }
  let muteLines = []
  for (let i = 0; i < muteRows.length; i++) {
    const mute = muteRows[i]
    const { id, muted, issuer, reason, issued_at, unmute_at } = mute
    const mutedUser = await client.fetchUser(mute.muted)
    const issuerUser = await client.fetchUser(mute.issuer)
    const issuedAt = moment.utc(issued_at).format('YYYY-MM-DD HH:mm:ss')
    const unmuteAt = moment.utc(unmute_at).format('YYYY-MM-DD HH:mm:ss')
    muteLines.push(id + ' - ' + issuedAt + ' UTC | ' + unmuteAt + ' UTC | ' + mutedUser.tag + '/' + mutedUser.id + ' | ' + issuerUser.tag + '/' + issuerUser.id + ' - ' + (reason ? utils.truncateStr(reason, 150) : 'No reason specified'))
  }
  return message.channel.send('Mutes for `' + mentionedMember.user.tag + '`:\n```\n' + muteLines.join('\n') + '```')
}

const command = new Command(mutes, 'mutes', 'Mutes', 'Moderation', 'mutes [@member/mute id]', ['mutes'], 'Displays all mutes or mutes for a specific user.', Permissions.FLAGS.MANAGE_MESSAGES, true)

module.exports = { command }

