const utils = require('../utils')
const { Command } = require('../Command')

async function ping(client, message) {
  message.channel.send('Pong!')
}

const command = new Command(ping, 'ping', 'Ping', 'Utility', 'ping', ['ping'], 'Sends "Pong!"', 0, false)

module.exports = { command }

