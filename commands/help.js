const utils = require('../utils')
const { Command } = require('../Command')

async function help(client, message) {
  const args = message.content.split(' ')
  const commands = await utils.getCommands()
  if (args.length < 2) {
    // Display all commands
    const categories = {}
    commands.forEach(command => {
      if (!categories[command.category]) {
        categories[command.category] = []
      }
      categories[command.category].push(command)
    })
    let lines = []
    for (const category in categories) {
      const commandNames = []
      categories[category].forEach(command => commandNames.push(command.name))
      lines.push('**' + category + '**: `' + commandNames.join('`, `') + '`')
    }
    return message.channel.send('Available commands:\n' + lines.join('\n'))
  }
  const guildConfig = await utils.getGuildConfig()
  // Convert to lowercase and test against ID, name, and aliases
  const search = args.slice(1).join(' ').toLowerCase()
  // Iterate through each command (and their aliases) until we find a match
  let match;
  commands.forEach(command => {
    if (search === command.id || search === command.name.toLowerCase() || command.aliases.includes(search)) {
      match = command
    }
  })
  let lines = [
    'Name: ' + match.name,
    'ID: ' + match.id,
    'Category: ' + match.category,
    // TODO: Prepend configured prefix to usage
    'Usage: ' + match.usage,
    'Aliases: [ ' + match.aliases.join(' | ') + ' ]',
    'Default Permissions Bit: ' + match.defaultPermissions,
    // 'Custom Permissions Bit: ' + <permissions required>,
    // TODO: Test against custom permissions, or default (if null)
    'Do you have permission? ' + (match.hasPermission(message) ? 'Yes' : 'No'),
    'Description: ' + match.description
  ]
  return message.channel.send('Information for command `' + match.name + '`:\n```\n' + lines.join('\n') + '```')
}

const command = new Command(help, 'help', 'Help', 'Utility', 'help [command]', ['help', '?', 'h'], 'Sends the help information for a specific command, or lists all commands.', 0, false)

module.exports = { command }
