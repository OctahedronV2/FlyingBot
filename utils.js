const fs = require('fs')
const path = require('path')
const util = require('util')
const moment = require('moment')
const yaml = require('js-yaml')
const mysql = require('mysql')

const readDir = util.promisify(fs.readdir)

let con

class Log {
  static log (prefix, content) {
    const nowUTC = getUTCDate()
    const output = nowUTC + ' | ' + prefix + ' | ' + content.join(' ')
    console.log(output)
    fs.appendFileSync(path.join(__dirname, 'logs', moment.utc().format('YYYY-MM-DD') + '.log'), output + '\n')
  }
  static info (...content) {
    Log.log('INFO', content)
  }
  static debug (...content) {
    Log.log('DEBUG', content)
  }
  static warn (...content) {
    Log.log('WARN', content)
  }
  static error (...content) {
    Log.log('ERROR', content)
  }
}

function getUTCDate () {
  return moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
}

// Returns a string of a number padded with zeroes, to the amount of digits
function padNumber (number, digits = 1) {
  return number < parseInt('1' + '0'.repeat(digits)) ? ('1' + '0'.repeat(digits)).slice(1) + number : number
}

// Returns an array of Command
async function getCommands () {
  const commandFilenames = await readDir(path.join(__dirname, 'commands'))
  const files = commandFilenames.filter(f => f.endsWith('.js'))
  const commands = []
  for (const file of files) {
    const loaded = require(path.join(__dirname, 'commands', file))
    if (!loaded.command) {
      continue
    }
    const { command } = loaded
    commands.push(command)
  }
  return commands
}

// Reads config.yml and returns an object
function getConfig () {
  const config = fs.readFileSync(path.join(__dirname, 'config.yml'))
  return yaml.safeLoad(config)
}

// Assigns con as a new SQL connection if it hasn't been set, and returns it
function getSQLCon () {
  if (!con) {
    const config = getConfig()
    con = mysql.createConnection({
      user: config.db.username,
      password: config.db.password,
      database: config.db.database
    })
    con.connect(err => {
      if (err) {
        Log.error('Error connecting to database:', err)
      }
    })
  }
  return con
}

// Initializes (if it hasn't already been) and queries the database
function queryDB (query, args) {
  return new Promise((resolve, reject) => {
    getSQLCon()
    con.query(query, args, (error, results, fields) => {
      if (error) {
        reject(error)
      }
      resolve(results, fields)
    })
  })
}

// Returns the first guild configuration row for guild_id, and if insert is true, inserts and recursivsly calls the function
async function getGuildConfig (guildID, insert) {
  const res = await queryDB('SELECT * FROM guilds WHERE guild_id = ?', [guildID])
  if (res.length < 1 && insert) {
    await queryDB('INSERT INTO guilds (guild_id) VALUES (?)', [guildID])
    return getGuildConfig(guildID, false)
  }
  return res[0]
}

// Truncates string after length characters and appends '...' if append
function truncateStr(string, length, append = true) {
  if (string.length > length) {
    if (append) {
      return string.substring(0, length) + '...'
    }
    return string.substring(0, length)
  }
  return string
}

// Testing range

module.exports = { Log, getUTCDate, padNumber, getCommands, getConfig, getSQLCon, queryDB, getGuildConfig, truncateStr }
