const Discord = require('discord.js')
const client = new Discord.Client()

const utils = require('./utils')
const config = utils.getConfig()

client.on('ready', () => utils.Log.info('Ready'))
client.on('message', async message => {
  if (message.author.bot) {
    return
  }
  const args = message.content.split(' ')
  args[0] = args[0].toLowerCase()
  let command
  let guildConfig
  let prefix = config.prefix
  if (message.guild) {
    guildConfig = await utils.getGuildConfig(message.guild.id, true)
    prefix = guildConfig.prefix
  }
  for (const cmd of commands) {
    for (const alias of cmd.aliases) {
      if (args[0] === prefix + alias || args[0] === config.prefix + alias) {
        command = cmd
      }
    }
  }
  if (!command) {
    return
  }
  if (command.serverOnly) {
    if (!message.guild) {
      return message.channel.send('This command may only be run from a server.')
    }
  }
  if (message.guild) {
    const hasPermission = await command.hasPermission(message)
    if (!hasPermission) {
      return message.channel.send('You do not have permission to run this command.')
    }
  }
  command.run(client, message)
})
client.on('guildCreate', g => utils.getGuildConfig(g.id, true))

async function main() {
  commands = await utils.getCommands()
  await client.login(config.token)
}

main()
