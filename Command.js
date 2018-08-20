class Command {
  constructor (executor, id, name, category, usage, aliases, description, defaultPermissions, serverOnly) {
    this.executor = executor
    this.id = id
    this.name = name
    this.category = category
    this.usage = usage
    this.aliases = aliases
    this.description = description
    this.defaultPermissions = defaultPermissions
    this.serverOnly = serverOnly
  }
  run (client, message) {
    this.executor(client, message)
  }
  async hasPermission (message) {
    const utils = require('./utils')
    if (!message.guild) {
      return true
    }
    let hasPermission = true
    const permissionsRows = await utils.queryDB('SELECT * FROM permissions WHERE guild_id = ? AND command_id = ?', [message.guild.id, this.id])
    if (permissionsRows.length < 1) {
      // No extra permissions in the database - use defaultPermissions
      return message.member.hasPermission(this.defaultPermissions)
    }
    const { guild_id, channel_id, role_id, user_id, command_id, permissions, disallow } = permissionsRows[0]
    // Now that we know there's a custom permissions set, time to figure it all out...
    // guild_id is going to be the same as the current guild ID, so no need to use that.
    // allow will determine whether the channel, role, or user is allowed to use command_id.
    // If allow isn't specified, default to checking which channel the user is in, what roles the
    // user has, what ID the user has (obviously), then finally if the member has permission on the
    // guild.
    // guild_id channel_id role_id user_id permissions disallow
    // 0        0          0       0       0           0
    if (guild_id == null) {
      if (channel_id == null) {
        if (role_id == null) {
          if (user_id == null) {
            if (permissions == null) {
              if (disallow == null) {
                // Nothing is available
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              } else {
                // disallow
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            } else if (disallow == null) {
              // permissions
              hasPermission = message.member.hasPermission(permissions)
            } else {
              // permissions, disallow
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          } else if (permissions == null) {
            if (disallow == null) {
              // user_id
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            } else {
              // user_id, disallow
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          } else if (disallow == null) {
            // user_id, permissions
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          } else {
            // user_id, permissions, disallow
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        } else if (user_id == null) {
          if (permissions == null) {
            if (disallow == null) {
              // role_id
              if (message.member.roles.has(role_id)) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            } else {
              // role_id, disallow
              if (message.member.roles.has(role_id)) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          } else if (disallow == null) {
            // role_id, permissions
            if (message.member.roles.has(role_id)) {
              hasPermission = message.member.hasPermission(permissions)
            }
          } else {
            // role_id, permissions, disallow
            if (message.member.roles.has(role_id)) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        } else if (permissions == null) {
          if (disallow == null) {
            // role_id, user_id
            if (message.member.roles.has(role_id)) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            }
          } else {
            // role_id, user_id, disallow
            if (message.member.roles.has(role_id)) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          }
        } else if (disallow == null) {
          // role_id, user_id, permissions
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          }
        } else {
          // role_id, user_id, permissions, disallow
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        }
      } else if (role_id == null) {
        if (user_id == null) {
          if (permissions == null) {
            if (disallow == null) {
              // channel_id
              if (message.channel.id === channel_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            } else {
              // channel_id, disallow
              if (message.channel.id === channel_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          } else if (disallow == null) {
            // channel_id, permissions
            if (message.channel.id === channel_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          } else {
            // channel_id, permissions, disallow
            if (message.channel.id === channel_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        } else if (permissions == null) {
          if (disallow == null) {
            // channel_id, user_id
            if (message.channel.id === channel_id) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            }
          } else {
            // channel_id, user_id, disallow
            if (message.channel.id === channel_id) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          }
        } else if (disallow == null) {
          // channel_id, user_id, permissions
          if (message.channel.id === channel_id) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          }
        } else {
          // channel_id, user_id, permissions, disallow
          if (message.channel.id === channel_id) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        }
      } else if (user_id == null) {
        if (permissions == null) {
          if (disallow == null) {
            // channel_id, role_id
            if (message.channel.id === channel_id) {
              if (message.member.roles.has(role_id)) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            }
          } else {
            // channel_id, role_id, disallow
            if (message.channel.id === channel_id) {
              if (message.member.roles.has(role_id)) {
                hasPermission = message.member.hasPermissiuon(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          }
        } else if (disallow == null) {
          // channel_id, role_id, permissions
          if (message.channel.id === channel_id) {
            if (message.member.roles.has(role_id)) {
              hasPermission = message.member.hasPermission(permissions)
            }
          }
        } else {
          // channel_id, role_id, permissions, disallow
          if (message.channel.id === channel_id) {
            if (message.member.roles.has(role_id)) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        }
      } else if (permissions == null) {
        if (disallow == null) {
          // channel_id, role_id, user_id
          if (message.channel.id === channel_id) {
            if (message.member.roles.has(role_id)) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            }
          }
        } else {
          // channel_id, role_id, user_id, disallow
          if (message.channel.id === channel_id) {
            if (message.member.roles.has(role_id)) {
              if (message.author.id === user) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          }
        }
      } else if (disallow == null) {
        // channel_id, role_id, user_id, permissions
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          }
        }
      } else {
        // channel_id, role_id, user_id, permissions, disallow
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        }
      }
    } else {
      if (channel_id == null) {
        if (role_id == null) {
          if (user_id == null) {
            if (permissions == null) {
              if (disallow == null) {
                // guild_id
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              } else {
                // guild_id, disallow
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            } else if (disallow == null) {
              // guild_id, permissions
              hasPermission = message.member.hasPermission(permissions)
            } else {
              // guild_id, permissions, disallow
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          } else if (permissions == null) {
            if (disallow == null) {
              // guild_id, user_id
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            } else {
              // guild_id, user_id, disallow
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          } else if (disallow == null) {
            // guild_id, user_id, permissions
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          } else {
            // guild_id, user_id, permissions, disallow
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        } else if (user_id == null) {
          if (permissions == null) {
            if (disallow == null) {
              // guild_id, role_id
              if (message.member.roles.has(role_id)) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            } else {
              // guild_id, role_id, disallow
              if (message.member.roles.has(role_id)) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          } else if (disallow == null) {
            // guild_id, role_id, permissions
            if (message.member.roles.has(role_id)) {
              hasPermission = message.member.hasPermission(permissions)
            }
          } else {
            // guild_id, role_id, permissions, disallow
            if (message.member.roles.has(role_id)) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        } else if (permissions == null) {
          if (disallow == null) {
            // guild_id, role_id, user_id
            if (message.member.roles.has(role_id)) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            }
          } else {
            // guild_id, role_id, user_id, disallow
            if (message.member.roles.has(role_id)) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          }
        } else if (disallow == null) {
          // guild_id, role_id, user_id, permissions
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          }
        } else {
          // guild_id, role_id, user_id, permissions, disallow
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        }
      } else if (role_id == null) {
        if (user_id == null) {
          if (permissions == null) {
            if (disallow == null) {
              // guild_id, channel_id
              if (message.channel.id === channel_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            } else {
              // guild_id, channel_id, disallow
              if (message.channel.id === channel_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          } else if (disallow == null) {
            // guild_id, channel_id, permissions
            if (message.channel.id === channel_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          } else {
            // guild_id, channel_id, permissions, disallow
            if (message.channel.id === channel_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        } else if (permissions == null) {
          if (disallow == null) {
            // guild_id, channel_id, user_id
            if (message.channel.id === channel_id) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            }
          } else {
            // guild_id, channel_id, user_id, disallow
            if (message.channel.id === channel_id) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          }
        } else if (disallow == null) {
          // guild_id, channel_id, user_id, permissions
          if (message.channel.id === channel_id) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          }
        } else {
          // guild_id, channel_id, user_id, permissions, disallow
          if (message.channel.id === channel_id) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        }
      } else if (user_id == null) {
        if (permissions == null) {
          if (disallow == null) {
            // guild_id, channel_id, role_id
            if (message.channel.id === channel_id) {
              if (message.member.roles.has(role_id)) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            }
          } else {
            // guild_id, channel_id, role_id, disallow
            if (message.channel.id === channel_id) {
              if (message.member.roles.has(role_id)) {
                hasPermission = message.member.hasPermissiuon(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          }
        } else if (disallow == null) {
          // guild_id, channel_id, role_id, permissions
          if (message.channel.id === channel_id) {
            if (message.member.roles.has(role_id)) {
              hasPermission = message.member.hasPermission(permissions)
            }
          }
        } else {
          // guild_id, channel_id, role_id, permissions, disallow
          if (message.channel.id === channel_id) {
            if (message.member.roles.has(role_id)) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        }
      } else if (permissions == null) {
        if (disallow == null) {
          // guild_id, channel_id, role_id, user_id
          if (message.channel.id === channel_id) {
            if (message.member.roles.has(role_id)) {
              if (message.author.id === user_id) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
              }
            }
          }
        } else {
          // guild_id, channel_id, role_id, user_id, disallow
          if (message.channel.id === channel_id) {
            if (message.member.roles.has(role_id)) {
              if (message.author.id === user) {
                hasPermission = message.member.hasPermission(this.defaultPermissions)
                if (disallow === 1) {
                  hasPermission = false
                }
              }
            }
          }
        }
      } else if (disallow == null) {
        // guild_id, channel_id, role_id, user_id, permissions
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
            }
          }
        }
      } else {
        // guild_id, channel_id, role_id, user_id, permissions, disallow
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              if (disallow === 1) {
                hasPermission = false
              }
            }
          }
        }
      }
    }
    /* switch (true) {
      // 1 1 1 1 1
      case channel_id == null && role_id == null && user_id == null && permissions == null && disallow == null:
        hasPermission = message.member.hasPermission(this.defaultPermissions)
        utils.Log.debug('1 1 1 1 1')
        break
      // 1 1 1 1 0
      case channel_id == null && role_id == null && user_id == null && permissions == null:
        if (disallow === 1) {
          hasPermission = false
          break
        }

        hasPermission = message.member.hasPermission(this.defaultPermissions)
        utils.Log.debug('1 1 1 1 0')
        break
      // 1 1 1 0 1
      case channel_id == null && role_id == null && user_id == null && disallow == null:
        hasPermission = message.member.hasPermission(permissions)
        utils.Log.debug('1 1 1 0 1')
        break
      // 1 1 1 0 0
      case channel_id == null && role_id == null && user_id == null:
        if (disallow === 1) {
          hasPermission = false
          break
        }
        hasPermission = message.member.hasPermission(permissions)
        utils.Log.debug('1 1 1 0 0')
        break
      // 1 1 0 1 1
      case channel_id == null && role_id == null && permissions == null && disallow == null:
        if (message.author.id === user_id) {
          hasPermission = message.member.hasPermission(this.defaultPermissions)
          utils.Log.debug('1 1 0 1 1')
        }
        break
      // 1 1 0 1 0
      case channel_id == null && role_id == null && permissions == null:
        if (message.author.id === user_id) {
          if (disallow === 1) {
            hasPermission = false
            break
          }
          hasPermission = message.member.hasPermission(this.defaultPermissions)
          utils.Log.debug('1 1 0 1 0')
        }
        break
      // 1 1 0 0 1
      case channel_id == null && role_id == null && disallow == null:
        if (message.author.id === user_id) {
          hasPermission = message.member.hasPermission(permissions)
          utils.Log.debug('1 1 0 0 1')
        }
        break
      // 1 1 0 0 0
      case channel_id == null && role_id == null:
        if (message.author.id === user_id) {
          if (disallow === 1) {
            hasPermission = false
            break
          }
          hasPermission = message.member.hasPermission(permissions)
          utils.Log.debug('1 1 0 0 0 ')
        }
        break
      // 1 0 1 1 1
      case channel_id == null && user_id == null && permissions == null && disallow == null:
        if (message.member.roles.has(role_id)) {
          hasPermission = message.member.hasPermission(this.defaultPermissions)
          utils.Log.debug('1 0 1 1 1')
        }
        break
      // 1 0 1 1 0
      case channel_id == null && user_id == null && permissions == null:
        if (message.member.roles.has(role_id)) {
          if (disallow === 1) {
            hasPermission = false
            break
          }
          hasPermission = message.member.hasPermission(this.defaultPermissions)
          utils.Log.debug('1 0 1 1 0')
        }
        break
      // 1 0 1 0 1
      case channel_id == null && user_id == null && disallow == null:
        if (message.member.roles.has(role_id)) {
          hasPermission = message.member.hasPermission(permissions)
          utils.Log.debug('1 0 1 0 1')
        }
        break
      // 1 0 1 0 0
      case channel_id == null && user_id == null:
        if (message.member.roles.has(role_id)) {
          if (disallow === 1) {
            hasPermission = false
            break
          }
          hasPermission = message.member.hasPermission(permissions)
          utils.Log.debug('1 0 1 0 0')
        }
        break
      // 1 0 0 1 1
      case channel_id == null && permissions == null && disallow == null:
        if (message.member.roles.has(role_id)) {
          if (message.author.id === user_id) {
            hasPermission = message.member.hasPermission(this.defaultPermissions)
            utils.Log.debug('1 0 0 1 1')
          }
        }
        break
      // 1 0 0 1 0
      case channel_id == null && permissions == null:
        if (message.member.roles.has(role_id)) {
          if (message.author.id === user_id) {
            if (disallow === 1) {
              hasPermission = false
              break
            }
            hasPermission = message.member.hasPermission(this.defaultPermissions)
            utils.Log.debug('1 0 0 1 0')
          }
        }
        break
      // 1 0 0 0 1
      case channel_id == null && disallow == null:
        if (message.member.roles.has(role_id)) {
          if (message.author.id === user_id) {
            hasPermission = message.member.hasPermission(permissions)
            utils.Log.debug('1 0 0 0 1')
          }
        }
        break
      // 1 0 0 0 0
      case channel_id == null:
        if (message.member.roles.has(role_id)) {
          if (message.author.id === user_id) {
            if (disallow === 1) {
              hasPermission = false
              break
            }
            hasPermission = message.member.hasPermission(permissions)
            utils.Log.debug('1 0 0 0 0')
          }
        }
        break
      // 0 1 1 1 1
      case role_id == null && user_id == null && permissions == null && disallow == null:
        if (message.channel.id === channel_id) {
          hasPermission = message.member.hasPermission(this.defaultPermissions)
          utils.Log.debug('0 1 1 1 1')
        }
        break
      // 0 1 1 1 0
      case role_id == null && user_id == null && permissions == null:
        if (message.channel.id === channel_id) {
          if (disallow === 1) {
            hasPermission = false
            break
          }
          hasPermission = message.member.hasPermission(this.defaultPermissions)
          utils.Log.debug('0 1 1 1 0')
        }
        break
      // 0 1 1 0 1
      case role_id == null && user_id == null && disallow == null:
        if (message.channel.id === channel_id) {
          hasPermission = message.member.hasPermission(permissions)
          utils.Log.debug('0 1 1 0 1')
        }
        break
      // 0 1 1 0 0
      case role_id == null && user_id == null:
        if (message.channel.id === channel_id) {
          if (disallow === 1) {
            hasPermission = false
            break
          }
          hasPermission = message.member.hasPermission(permissions)
          utils.Log.debug('0 1 1 0 0')
        }
        break
      // 0 1 0 1 1
      case role_id == null && permissions == null && disallow == null:
        if (message.channel.id === channel_id) {
          if (message.author.id === user_id) {
            hasPermission = message.member.hasPermission(this.defaultPermissions)
            utils.Log.debug('0 1 0 1 1')
          }
        }
        break
      // 0 1 0 1 0
      case role_id == null && permissions == null:
        if (message.channel.id === channel_id) {
          if (message.author.id === user_id) {
            if (disallow === 1) {
              hasPermission = false
              break
            }
            hasPermission = message.member.hasPermission(this.defaultPermissions)
            utils.Log.debug('0 1 0 1 0')
          }
        }
        break
      // 0 1 0 0 1
      case role_id == null && disallow == null:
        if (message.channel.id === channel_id) {
          if (message.author.id === user_id) {
            hasPermission = message.member.hasPermission(permissions)
            utils.Log.debug('0 1 0 0 1')
          }
        }
        break
      // 0 1 0 0 0
      case role_id == null:
        if (message.channel.id === channel_id) {
          if (message.author.id === user_id) {
            if (disallow === 1) {
              hasPermission = false
              break
            }
            hasPermission = message.member.hasPermission(permissions)
            utils.Log.debug('0 1 0 0 0')
          }
        }
        break
      // 0 0 1 1 1
      case user_id == null && permissions == null && disallow == null:
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            hasPermission = message.member.hasPermission(this.defaultPermissions)
            utils.Log.debug('0 0 1 1 1')
          }
        }
        break
      // 0 0 1 1 0
      case user_id == null && permissions == null:
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (disallow === 1) {
              hasPermission = false
              break
            }
            hasPermission = message.member.hasPermission(this.defaultPermissions)
            utils.Log.debug('0 0 1 1 0')
          }
        }
        break
      // 0 0 1 0 1
      case user_id == null && disallow == null:
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(permissions)
              utils.Log.debug('0 0 1 0 1')
            }
          }
        }
        break
      // 0 0 1 0 0
      case user_id == null:
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              if (disallow === 1) {
                hasPermission = false
                break
              }
              hasPermission = message.member.hasPermission(permissions)
              utils.Log.debug('0 0 1 0 0')
            }
          }
        }
        break
      // 0 0 0 1 1
      case permissions == null && disallow == null:
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(this.defaultPermissions)
              utils.Log.debug('0 0 0 1 1')
            }
          }
        }
        break
      // 0 0 0 1 0
      case permissions == null:
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              if (disallow === 1) {
                hasPermission = false
                break
              }
              hasPermission = message.member.hasPermission(this.defaultPermissions)
              utils.Log.debug('0 0 0 1 0')
            }
          }
        }
        break
      // 0 0 0 0 1
      case disallow == null:
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              hasPermission = message.member.hasPermission(this.defaultPermissions)
              utils.Log.debug('0 0 0 0 1')
            }
          }
        }
        break
      // 0 0 0 0 0
      default:
        if (message.channel.id === channel_id) {
          if (message.member.roles.has(role_id)) {
            if (message.author.id === user_id) {
              if (disallow === 1) {
                hasPermission = false
                break
              }
              hasPermission = message.member.hasPermission(permissions)
              utils.Log.debug('0 0 0 0 0')
            }
          }
        }
        break
    } */
    return hasPermission
  }
}

module.exports = { Command }
