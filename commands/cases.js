const { Permissions } = require('discord.js')
const utils = require('../utils')
const { Command } = require('../Command')

async function cases(client, message) {
  const args = message.content.split(' ')
  const caseRows = await utils.queryDB('SELECT * FROM cases WHERE guild_id = ?', [message.guild.id])
  if (caseRows.length < 1) {
    return message.channel.send('There are no cases for this server.')
  }
  let lines = []
  for (let i = 0; i < caseRows.length; i++) {
    const caseR = caseRows[i]
    lines.push((i + 1) + ' - ' + caseR.type + (caseR.type === 'warning' || caseR.type === 'mute' ? ' - ' + caseR.ref_id : ''))
  }
  return message.channel.send('All cases:\n```\n' + lines.join('\n') + '```\nFor extra information on case, if it\'s a warning or mute, see the corresponding help items. Otherwise, check the audit logs.')
}

const command = new Command(cases, 'cases', 'Cases', 'Moderation', 'cases [case id]', ['cases'], 'Displays information about a case or all cases.', Permissions.FLAGS.MANAGE_MESSAGES, true)

module.exports = { command }

