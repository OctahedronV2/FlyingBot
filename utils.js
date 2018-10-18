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
      database: config.db.database,
      charset: 'utf8mb4_general_ci'
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
function truncateStr (string, length, append = true) {
  if (string.length > length) {
    if (append) {
      return string.substring(0, length) + '...'
    }
    return string.substring(0, length)
  }
  return string
}

const timeRegex = /([0-9]+) ?((month|mnth|mth|mo)|(week|wk|w)|(day|d)|(hour|hr|h)|(minute|min|m)|(second|sec|s))s?/i

function strToTime (string, extract = false) {
  const split = string.split(' ')
  const ret = []
  let retStrParts = []
  let prevPart = null
  for (let i = 0; i < split.length; i++) {
    const a = split[i].match(/([0-9]+)([\w])/i)
    if (a != null && a.length === 3) {
      // original, amount, unit
      retStrParts.push(split[i])
      const amount = parseInt(a[1])
      let unit = split[i].replace(a[1], '')
      switch (unit) {
        case 'mo': case 'mth': case 'mnth': case 'month':
          unit = 'month'
          break
        case 'w': case 'wk': case 'week':
          unit = 'week'
          break
        case 'h': case 'hr': case 'hour':
          unit = 'hour'
          break
        case 'm': case 'min': case 'minute':
          unit = 'minute'
          break
        case 's': case 'sec': case 'second':
          unit = 'second'
          break
      }
      ret.push({ unit: unit, amount: amount })
      continue
    }
    if (prevPart == null) {
      if (isNaN(split[i])) {
        break
      }
      prevPart = parseInt(split[i])
    } else {
      if (timeRegex.test(prevPart + ' ' + split[i])) {
        retStrParts.push(prevPart + ' ' + split[i])
        switch (split[i].replace(/s$/i, '')) {
          case 'mo': case 'mth': case 'mnth': case 'month':
            split[i] = 'month'
            break
          case 'w': case 'wk': case 'week':
            split[i] = 'week'
            break
          case 'h': case 'hr': case 'hour':
            split[i] = 'hour'
            break
          case 'm': case 'min': case 'minute':
            split[i] = 'minute'
            break
          case 's': case 'sec': case 'second':
            split[i] = 'second'
            break
        }
        const sanitized = split[i]
        ret.push({ unit: sanitized, amount: prevPart })
      }
      prevPart = null
    }
  }
  if (extract) {
    return [ret, retStrParts.join(' ')]
  }
  return ret
}

function timeToMs (timeArr) {
  let ms = 0
  timeArr.forEach(time => {
    switch (time.unit) {
      case 'month':
        ms += 2629746000 * time.amount
        break
      case 'week':
        ms += 604800000 * time.amount
        break
      case 'day':
        ms += 86400000 * time.amount
        break
      case 'hour':
        ms += 3600000 * time.amount
        break
      case 'minute':
        ms += 60000 * time.amount
        break
      case 'second':
        ms += 1000 * time.amount
        break
    }
  })
  return ms
}

// Testing range

module.exports = { Log, getUTCDate, padNumber, getCommands, getConfig, getSQLCon, queryDB, getGuildConfig, truncateStr, timeRegex, strToTime, timeToMs }
