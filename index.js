const Discord = require('discord.js')
const client = new Discord.Client()
const moment = require('moment')

const utils = require('./utils')
const config = utils.getConfig()

client.on('ready', async () => {
  utils.Log.info('Ready')
  await client.user.setActivity('Ready @ ' + moment.utc().format('HH:mm [UTC]') + ' | -help')
  utils.Log.debug('Handing out unmutes...')
  const mutes = await utils.queryDB('SELECT * FROM mutes')
  for (let i = 0; i < mutes.length; i++) {
    const { id, guild_id, muted, issued_at, reason, unmute_at } = mutes[i]
    const guild = client.guilds.get(guild_id)
    const { muted_role_id } = await utils.getGuildConfig(guild_id, true)
    if (!moment().isAfter(unmute_at)) {
      setTimeout(async () => {
        // await utils.queryDB('DELETE FROM mutes WHERE id = ?', [id])
        try {
          const member = await guild.fetchMember(muted)
          await member.setMute(false, 'Automatic unmute - ' + reason)
          if (muted_role_id) {
            await member.removeRole(muted_role_id, 'Automatic unmute - ' + reason)
          }
        } catch (err) {
          utils.Log.debug('Could not automatically unmute ' + muted)
          utils.Log.error(err)
        }
      }, Math.abs(moment().valueOf() - moment(unmute_at).valueOf()))
      continue
    }
    try {
      const member = await guild.fetchMember(muted)
      await member.setMute(false, 'Automatic unmute - ' + reason)
      if (muted_role_id) {
        await member.removeRole(muted_role_id, 'Automatic unmute - ' + reason)
      }
    } catch (err) {
      utils.Log.debug('Could not unmute ' + muted + '.')
      /*utils.Log.debug('Could not unmute ' + muted + ', removing from DB.')
      utils.Log.error(err)
      await utils.queryDB('DELETE FROM mutes WHERE id = ?', [id])
      utils.Log.debug('Removed mute ' + id + '.')*/
    }
  }
})
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
  await utils.initDB()
  commands = await utils.getCommands()
  await client.login(config.token)
}

main()
