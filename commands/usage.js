const os = require('os')
const humanize = require('humanize-duration')
const utils = require('../utils')
const { Command } = require('../Command')

async function usage(client, message) {
  const freemem = os.freemem()
  const totalmem = os.totalmem()
  let lines = [
    '**System Uptime:** ' + humanize(os.uptime() * 1000),
    '**Total Memory:** ' + Math.round(totalmem / 1024 / 1024) + ' megabytes',
    '**Free Memory:** ' + Math.round(freemem / 1024 / 1024) + ' megabytes',
    '**Used Memory:** ' + Math.round((totalmem - freemem) / 1024 / 1024) + ' megabytes',
  ]
  return message.channel.send('Usage:\n' + lines.join('\n'))
}

const command = new Command(usage, 'usage', 'Usage', 'Utility', 'usage', ['usage'], 'Provides usage statistics of the FlyingBot process.', 0, false)

module.exports = { command }

