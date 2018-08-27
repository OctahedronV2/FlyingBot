const { Permissions } = require('discord.js')
const moment = require('moment')
const utils = require('../utils')
const { Command } = require('../Command')

async function warnings(client, message) {
  const args = message.content.split(' ')
  if (args.length < 2) {
    // Display all warnings from the current guild.
    const warningRows = await utils.queryDB('SELECT * FROM warnings WHERE guild_id = ?', [message.guild.id])
    if (warningRows.length < 1) {
      return message.channel.send('There are no warnings in this server.')
    }
    let warningLines = []
    for (let i = 0; i < warningRows.length; i++) {
      const warning = warningRows[i]
      const { id, warned } = warning
      const warnedUser = await client.fetchUser(warning.warned)
      warningLines.push(id + ' - ' + warnedUser.tag)
    }
    return message.channel.send('All warnings:\n```\n' + warningLines.join('\n') + '```\nFor extra information on a warning, see the help item for `Warnings`.')
  }
  // Display all warnings from a specific user in the current guild.
  if (!isNaN(args[1])) {
    // The input number could possibly be an ID.
    args[1] = parseInt(args[1])
    const warningRows = await utils.queryDB('SELECT * FROM warnings WHERE guild_id = ? AND id = ?', [message.guild.id, args[1]])
    if (warningRows.length < 1) {
      return message.channel.send('No warnings were found by that ID.')
    }
    const warning = warningRows[0]
    const { id, warned, issuer, reason, issued_at } = warning
    const warnedUser = await client.fetchUser(warning.warned)
    const issuerUser = await client.fetchUser(warning.issuer)
    const issuedAt = moment.utc(issued_at).format('YYYY-MM-DD HH:mm:ss')
    let lines = [
      'ID: ' + id,
      'Warned: ' + warnedUser.tag + ' (' + warnedUser.id + ')',
      'Issuer: ' + issuerUser.tag + ' (' + issuerUser.id + ')',
      'Issed At: ' + issuedAt,
      'Reason: ' + reason ? utils.truncateStr(reason, 1900) : 'No reason specified'
    ]
    return message.channel.send('```\n' + lines.join('\n') + '```')
  }
  if (message.mentions.members.size < 1) {
    return message.channel.send('A mentioned server member must be the first argument.')
  }
  const mentionedMember = message.mentions.members.first()
  const warningRows = await utils.queryDB('SELECT * FROM warnings WHERE guild_id = ? AND warned = ?', [message.guild.id, mentionedMember.id])
  if (warningRows.length < 1) {
    return message.channel.send('The specified member has no warnings.')
  }
  let warningLines = []
  for (let i = 0; i < warningRows.length; i++) {
    const warning = warningRows[i]
    const { id, warned, issuer, reason, issued_at } = warning
    const warnedUser = await client.fetchUser(warning.warned)
    const issuerUser = await client.fetchUser(warning.issuer)
    const issuedAt = moment.utc(issued_at).format('YYYY-MM-DD HH:mm:ss')
    warningLines.push(id + ' - ' + issuedAt + ' UTC | ' + warnedUser.tag + '/' + warnedUser.id + ' | ' + issuerUser.tag + '/' + issuerUser.id + ' - ' + (reason ? utils.truncateStr(reason, 150) : 'No reason specified'))
  }
  return message.channel.send('Warnings for `' + mentionedMember.user.tag + '`:\n```\n' + warningLines.join('\n') + '```')
}

const command = new Command(warnings, 'warns', 'Warnings', 'Moderation', 'warns [@member/warning id]', ['warns', 'warnings'], 'Displays all warnings or warnings for a specific user.', Permissions.FLAGS.MANAGE_MESSAGES, true)

module.exports = { command }

