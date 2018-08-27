const { Permissions } = require('discord.js')
const utils = require('../utils')
const { Command } = require('../Command')

async function deletewarning(client, message) {
  const args = message.content.split(' ')
  if (args.length < 2) {
    return message.channel.send('You need to specify a warning ID.')
  }
  if (isNaN(args[1])) {
    return message.channel.send('The warning ID must be a valid number.')
  }
  args[1] = parseInt(args[1])
  await utils.queryDB('DELETE FROM warnings WHERE guild_id = ? AND id = ?', [message.guild.id, args[1]])
  return message.channel.send('Warning `#' + args[1] + '` has been removed, if it existed under this guild.')
}

const command = new Command(deletewarning, 'deletewarning', 'Delete Warning', 'Moderation', 'delwarn [warning id]', ['delwarn', 'delwarning', 'deletewarn', 'deletewarning', 'remwarn', 'remwarning', 'removewarn', 'removewarning'], 'Deletes the specified warning by ID', Permissions.FLAGS.MANAGE_MESSAGES, true)

module.exports = { command }

