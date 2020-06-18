const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const fsSettings = 'settings.json';
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
var strSettings = JSON.stringify( settings );
const fsGuilds = 'guilds.json';
var guilds = require( path.join( __dirname, '../../../' + fsGuilds ) );
var strGuilds = JSON.stringify( guilds );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const strScreenShotPath = path.join( __dirname, '../../images-' + bot.toLowerCase().replace( 'bot', '' ) + '/' );
var strNow = function () { return ( new Date() ).toLocaleDateString( 'en-US', objTimeString ); };
const isDebug = true;//settings[ bot ].onError.isDebugMode;

function toBoolean( val ) {
  switch ( typeof( val ) ) {
    case 'bool':
      return val;
    case 'number':
      return ( ( val % 2 ) === 1 ? true : false );
    case 'string':
      var arrTrue = [ '+', '1', 't', 'true', 'y', 'yes', 'on' ];
      if ( arrTrue.indexOf( val.toLowerCase() ) !== -1 ) { return true; } else { return false; }
    default:
      console.warn( '%s: `!config` is returning `false` for %s: %o', strNow(), typeof( val ), val );
      return false;
  }
}

class BotConfig extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'config',
      group: 'moderator',
      memberName: 'config',
      description: 'Make changes to bots channels, presences, or...',
    } );
  }

  async run( message, args ) {
    const isBot = message.author.bot;
    const client = message.client;
    var guild = null;
    var arrOwnerIDs = settings[ bot ].owners, arrBotModIds = settings[ bot ].moderators, arrOwners = [];
    await arrOwnerIDs.forEach( function( owner ) { arrOwners.push( client.fetchUser( owner ) ); } );
    const isOwner = ( arrOwnerIDs.indexOf( message.author.id ) !== -1 ? true : false );
    const isBotMod = ( isOwner || arrBotModIds.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdministrator = false, canManageServer = false, canManageRoles = false;
    if ( message.guild ) {
      guild = message.guild;
      isCrown = ( message.author.id === guild.ownerID ? true : false );
      var arrAdministratorRoles = [], arrManageServerRoles = [], arrManageRolesRoles = [];
      guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdministratorRoles.push( role ); }// ADMINISTRATOR
        if ( ( new Discord.Permissions( role.permissions ) ).has( 32 ) ) { arrManageServerRoles.push( role ); }// MANAGE_SERVER
        if ( ( new Discord.Permissions( role.permissions ) ).has( 268435456 ) ) { arrManageRolesRoles.push( role ); }// MANAGE_ROLES
      } );
      arrAdministratorRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) {
          isAdministrator = true;
        }
      } );
      arrManageServerRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) {
          canManageServer = true;
        }
      } );
      arrManageRolesRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) {
          canManageRoles = true;
        }
      } );
    }

    const arrArgs = args.split( ' ' );console.log( '%s: `!config` fired: %o', strNow(), arrArgs );
    var intArgs = arrArgs.length;
    if ( intArgs > 0 && !isBot ) {
      const defaultChanID = ( guild.systemChannelID ? guild.systemChannelID : ( guild.id ? guild.id : message.channel.id ) );
 /*     const objDefaultGuild = {
        name: guild.name,
        crown: {
          tag: client.users.get( guild.ownerID ).tag,
          nickname: ( guild.members.get( guild.ownerID ).nickname || null )
        },
        depart: {
          canDepart: false,
          chanID: defaultChan,
          chanName: guild.channels.get( defaultChanID ).name,
          message: null
        },
        departEnabled: false,
        doReassign: false,
        initialized: false,
        log: {
          canLog: false,
          chanID: defaultChan,
          chanName: guild.channels.get( defaultChanID ).name
        },
        welcome: {
          antiSpam: true,
          canWelcome: false,
          canWelcomeAdmin: false,
          canWelcomeManager: false,
          chanID: defaultChan,
          chanName: guild.channels.get( defaultChanID ).name,
          message: null,
          role: null,
          roleLog: null
        },
        welcomeEnabled: false
      };//*/
 /*     const objDefaultUser = {
        tag: member.user.tag,
        email: null,
        facebook: null,
        guilds: {
/*          guild.id: {
            canManageRoles: canManageRoles,
            canManageServer: canManageServer,
            intPoints: 0,
            isAdministrator: isAdministrator,
            isCrown: isCrown,
            roles: [],
            welcomeID: null
          }//*//*
        },
        intGlobalPoints: 0,
        reddit: null,
        steam: null,
        timezone: null,
        twitter: null,
        twitch: null,
        youtube: null
      };//*/
      switch ( arrArgs[ 0 ].toLowerCase() ) {
/*        case 'announce' :
          if ( isOwner ) {
            message.client.guilds.forEach( function( guild ){
              message.client.guilds.get( guild.id ).defaultChannel.send( arrArgs.slice( 1 ).join( ' ' ) );
            } );
          }
          break;// */
        case 'debug' :
          if ( isOwner ) {
            var debugParameter = ( arrArgs[ 1 ] ? arrArgs[ 1 ].trim().toLowerCase() : false );
            if ( debugParameter === 'state' ) {
              if ( isDebug ) {
               message.react( '1%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a "!debug state" request returning TRUE in ' + guild.id + '#' + message.channel.id + ' ( ' + guild.name + '#' + message.channel.name + '): ' + errReact ); } );
              } else {
               message.react( '0%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a "!debug state" request returning FALSE in ' + guild.id + '#' + message.channel.id + ' ( ' + guild.name + '#' + message.channel.name + '): ' + errReact ); } );
              }
            } else if ( isOwner ) {
              var msgToggle, boolUpdateDebugMode = true;
              var toggle = await toBoolean( debugParameter );
              var strToggle = await ( toggle || ( toggle && !isDebug ) ? 'on' : 'off' );
              msgToggle = await client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is attempting to turn ' + strToggle + ' debug mode for_ ' + message.author );
              if ( ( isDebug && toggle ) || ( !isDebug && !toggle ) ) {
                await msgToggle.edit( '_debug mode was already ' + strToggle + '_' );
                await msgToggle.react( '%F0%9F%A4%A6' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a request to change the debug state to what it already is in ' + guild.id + '#' + message.channel.id + ' ( ' + guild.name + '#' + message.channel.name + '): ' + errReact ); } );
                boolUpdateDebugMode = false;
              } else if ( toggle ) {
                isDebug = true;
              } else if ( !toggle ) {
                isDebug = false;
              } else {
                isDebug = !isDebug;
              }
              if ( boolUpdateDebugMode ) {
                settings[ bot ].onError.isDebugMode = isDebug;
                strSettings = JSON.stringify( settings );
                fs.writeFile( fsSettings, strSettings, ( errWrite ) => {
                  if ( errWrite ) {
                    throw errWrite;
                  } else {
                     if ( isDebug ) {
                      msgToggle.edit( '_debug mode is now on_' );
                      msgToggle.react( '1%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to indicate debug mode is now on in ' + guild.id + '#' + message.channel.id + ' ( ' + guild.name + '#' + message.channel.name + '): ' + errReact ); } );
                    } else {
                      msgToggle.edit( '_debug mode is now off_' );
                      msgToggle.react( '0%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to indicate debug mode is now off in ' + guild.id + '#' + message.channel.id + ' ( ' + guild.name + '#' + message.channel.name + '): ' + errReact ); } );
                    }
                  }
                } );
              }
            }
          }
          break;//*/
        case 'game' ://WAI using .setStatus() .setActivity() instead of .setPresence()
          if ( isOwner ) {
            var strGame;
            if ( arrArgs[ 1 ] ) {
              strGame = arrArgs[ 1 ].toUpperCase();
            } else {
              strGame = '';
            }
            if ( isDebug ) { console.log( '%s: %s fired `!config game %s`.', strNow(), message.author.tag, ( arrArgs[ 1 ] || 'RESET' ) ); }
            switch ( strGame ) {
              case 'CLEAR' : case 'NULL' :
//                message.client.user.setPresence( { status: 'online', activity: { name: null } } )
                message.client.user.setStatus( 'online' ).catch( errSetS => { console.error( '%s: Error setting status to `online`: %o', strNow(), errSetS ); } );
                message.client.user.setActivity( null )
                  .then( () => {
                    message.react( '%E2%9C%85' )
                      .then( reacted => { message.reply( 'My game has been cleared.' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting `!config game clear` confirmation message: ', strNow(), errDel ); } ); } ); } )
                      .catch( errReact => { console.error( '%s: Error reaction confirmating `!config game clear`: %o', strNow(), errReact ); } );
                  } ).catch( errSetP => { console.error( '%s: Error setting presence for `!config game clear`: %o', strNow(), errSetP ); } );
                break;
              case 'RESET' :
//                message.client.user.setPresence( { status: 'online', activity: { name: settings[ bot ].game } } )
                message.client.user.setStatus( 'online' ).catch( errSetS => { console.error( '%s: Error setting status to `online`: %o', strNow(), errSetS ); } );
                message.client.user.setActivity( settings[ bot ].game )
                  .then( () => {
                    message.react( '%E2%9C%85' )
                      .then( reacted => { message.reply( 'My game is now set to: `' + settings[ bot ].game + '`' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting `!config game reset` confirmation message: ', strNow(), errDel ); } ); } ); } )
                      .catch( errReact => { console.error( '%s: Error reaction confirmating `!config game reset`: %o', strNow(), errReact ); } );
                  } ).catch( errSetP => { console.error( '%s: Error setting presence for `!config game`: %o', strNow(), errSetP ); } );
                break;
              case '' :
                message.react( '%E2%9D%8C' )
                  .then( reacted => { message.reply( 'you forgot to specify a game.  Please use:\n\t**`!config game clear`** to clear the game\n\t**`!config game reset`** to reset the game to default\n\t**`!config game NEW GAME`** to set the game to "NEW GAME"' ); } )
                  .catch( errReact => { console.error( '%s: Error reaction confirmating `!config game`: %o', strNow(), errReact ); } );
                break;
              default :
//                message.client.user.setPresence( { status: 'online', activity: { name: arrArgs.slice( 1 ).join( ' ' ) } } )
                message.client.user.setStatus( 'online' ).catch( errSetS => { console.error( '%s: Error setting status to `online`: %o', strNow(), errSetS ); } );
                message.client.user.setActivity( arrArgs.slice( 1 ).join( ' ' ) )
                  .then( () => {
                    message.react( '%E2%9C%85' )
                      .then( reacted => { message.reply( 'My game is now set to: `' + arrArgs.slice( 1 ).join( ' ' ) + '`' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting `!config game NEW GAME` confirmation message: ', strNow(), errDel ); } ); } ); } )
                      .catch( errReact => { console.error( '%s: Error reaction confirmating `!config game NEW GAME`: %o', strNow(), errReact ); } );
                  } ).catch( errSetP => { console.error( '%s: Error setting presence for `!config game NEW GAME`: %o', strNow(), errSetP ); } );
            }
          }
          break;
        case 'host'://WAI using .setStatus() .setActivity() instead of .setPresence()
          if ( isOwner ) {
            if ( arrArgs[ 1 ] ) {
              var arrActivity = [ arrArgs[ 1 ] + ' stream on Twitch!', 'https://www.twitch.tv/' + arrArgs[ 1 ].toLowerCase() ];
//              message.client.user.setPresence( { status: 'online', activity: { name: arrActivity[ 0 ], url: arrActivity[ 1 ] } } )
              message.client.user.setStatus( 'online' ).catch( errSetS => { console.error( '%s: Error setting status to `online`: %o', strNow(), errSetS ); } );
              message.client.user.setActivity( arrActivity[ 0 ], { url: arrActivity[ 1 ] } )
                .then( presence => { console.log( '%s: presence successfully set: %o', strNow(), presence ); } )
                .catch( errSetP => { console.error( '%s: Error setting presence in `!config host`: %o', strNow(), errSetP ) } );
            } else {
              message.reply( 'you forgot to specify a streamer to host.\n\t**Please try again with `!config host <name of streamer>`**' );
            }
          }
          break;
        case 'part' : 
          if ( isBotMod ) {
            var partGuild = guild;
            if ( intArgs === 2 ) {
              try {
                partGuild = arrArgs[ 1 ];
                partGuild = await client.guilds.get( partGuild );
              } catch ( getGuildErr ) {
                message.channel.send( 'Unable to part guild: ' + partGuild );
                console.error( '%s: Error attempting to get guild with id `%s`: %o', strNow(), partGuild, getGuildErr );
              }
            }
            await message.channel.send( 'I\'m leaving **' + partGuild.name + '** as requested by ' + message.author + '; visit <https://discordapp.com/api/oauth2/authorize?client_id=' + message.client.user.id + '&scope=bot&permissions=8> to get me to rejoin.' );
            partGuild.leave()
              .then( guildLeft => {
                console.log( '%s:\tBot forced to leave \'%s\' (%s) by %s: %o', strNow(), partGuild.name, partGuild.id, message.author.tag, guildLeft );
                var msgEmbed = new Discord.RichEmbed()
                  .setColor( '#FF0000' )
                  .setTitle( ':arrow_left: Left a guild named:' )
                  .setThumbnail( partGuild.iconURL )
                  .setDescription( ':arrow_left:\t**' + mpartGuild.name + '**' )
                  .addField( 'Founded on ... by ...', partGuild.createdAt.toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' - <@' + partGuild.ownerID + '> (' + partGuild.owner.user.username + '#' + partGuild.owner.user.discriminator + ')' )
                  .addField( 'Members / Channels', partGuild.memberCount + ' / ' + partGuild.channels.size )
                  .addField( 'Region', partGuild.region );
                settings[ bot ].debug.forEach( function( log ){
                  message.client.channels.get( log ).send( { embed: msgEmbed } );
                } );
              } )
              .catch( errLeave => {
                console.error( '%s: Error attempting to leave \'%s\' (%s) %o', strNow(), partGuild.name, partGuild.id, errLeave );
              } );

// NEED TO ADD FUNCTION TO REMOVE GUILD FROM jsonGuilds AND ADD TO BLACKLIST.

          }
          break;
        case 'whitelist':
          // ADD FUNCTION TO REMOVE GUILD FROM jsonGuilds BLACKLIST TO ALLOW BOT TO JOIN GUILD.
          break;
        case 'perms' : case 'permission' : case 'permissions' :
          if ( isBotMod ) {
            var ojbPermsInfo = await message.channel.send( 'Gathering information, please stand by...' );
            
            ojbPermsInfo.edit( 'Opening screenshot window...' ).catch( errEdit => {
              console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to send file `' + strScreenShotPath + 'perms.png' + '` to ' + guild.name + '#' + message.channel.name + ': ' + errEdit );
            } );
            
            const browser = await puppeteer.launch( );
            const page = await browser.newPage( );
            ojbPermsInfo.edit( 'Taking screenshot...' ).catch( errEdit => {
              console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to send file `' + strScreenShotPath + 'perms.png' + '` to ' + guild.name + '#' + message.channel.name + ': ' + errEdit );
            } );
            await page.setViewport( { width: 1024, height: 920 } );
            await page.goto( 'https://discordapi.com/permissions.html#' + guild.members.get( message.client.user.id ).permissions.bitfield );
            await page.screenshot( { path: strScreenShotPath + 'perms.png' } );
            
            ojbPermsInfo.edit( 'Closing screenshot window...' ).catch( errEdit => {
              console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to send file `' + strScreenShotPath + 'perms.png' + '` to ' + guild.name + '#' + message.channel.name + ': ' + errEdit );
            } );

            await browser.close( );            
            message.author.send( 'My permissions for **' + guild.name + '** (' + guild.id + ') are <https://discordapi.com/permissions.html#' + guild.members.get( message.client.user.id ).permissions.bitfield + '>:', { files: [ { attachment: strScreenShotPath + 'perms.png', name: 'perms.png' } ] } );
            
            ojbPermsInfo.edit( 'The screenshot window has been closed and the result sent to you in a DM.' );
            ojbPermsInfo.delete( 8000, { reason: 'Cleaning up perms request progress dialog.' } );
          }
          message.delete( { reason: 'Cleaning up request for permission information from ' + ( isAdministrator ? 'a guild administrator.' : ( isBotMod ? 'a bot moderator.' : 'no-one special.' ) ) } )
            .then( delTrigger => {
              if ( isAdministrator && !isBotMod ) {
                message.author.send( 'You can view my permissions for **' + guild.name + '** (' + guild.id + ') on <https://discordapi.com/permissions.html#' + guild.members.get( message.client.user.id ).permissions.bitfield + '>.' );
              } else if ( !isBotMod ) {
                message.author.send( 'I\'m sorry, you can\'t view my permissions in **' + guild.name + '**. Please contact my owner(s) if you think this message is in error.' );
                arrOwners.forEach( owner => { owner.send( message.author + ' attempted to acquire my permissions for ' + guild.name + ' (' + guild.id + '), but was unable to do so.' ); } );
              }
            } ).catch( errDel => {
              if ( isAdministrator && !isBotMod ) {
                message.reply( 'I am unable to process your request.  Please ask ' + guild.owner.user.tag + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ).then( replySuccess => { replySuccess.edit( message.author + ', I am unable to process your request.  Please ask ' + guild.owner.user + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ) } );
              } else if ( !isBotMod ) {
                message.author.send( 'I\'m sorry, you can\'t view my permissions in **' + guild.name + '**. Please contact my owner(s) if you think this message is in error.' );
                arrOwners.forEach( owner => { owner.send( message.author + ' attempted to acquire my permissions for ' + guild.name + ' (' + guild.id + '), but was unable to do so.' ); } );
              }
            } );
          break;
/*        case 'restart' : //WAI using .setStatus() .setActivity() instead of .setPresence()
          if ( isOwner ) {
            Promise.all( [
//              message.client.user.setPresence( { afk: true, status: 'dnd', activity: { name: 'restarting...' } } )
//              message.client.user.setAfk( true ).catch( errSetAFK => { console.error( '%s: Error setting AFK to `true`: %o', strNow(), errSetAFK ); } ),
              message.client.user.setStatus( 'dnd' ).catch( errSetS => { console.error( '%s: Error setting status to `dnd`: %o', strNow(), errSetS ); } ),
              message.client.user.setActivity( 'restarting...' )
                .catch( errSetP => { console.error( '%s: Error setting presence for restart: %o', strNow(), errSetP ) } ),
              message.channel.send( '_is restarting as requested by ' + message.author + '._' ),
              console.log( '%s: restart requested by %s@%s.', strNow(), message.author.username, message.author.discriminator )
            ] ).then( () => { process.exit(); } );
          }
          break;//*/
        case 'status' ://WAI using .setStatus() instead of .setPresence()
          if ( isOwner ) {
            var statuses = [ 'online', 'idle', 'dnd', 'invisible' ];
            var intSetStatusIndex = ( !arrArgs[ 1 ] ? -1 : statuses.indexOf( arrArgs[ 1 ].toLowerCase() ) );
            if ( !arrArgs[ 1 ] || intSetStatusIndex === -1 ) {
//              message.client.user.setPresence( { status: settings[ bot ].status } )
              message.client.user.setStatus( settings[ bot ].status )
                .catch( errSetP => { console.error( '%s: Error setting presence in `!config status`: %o', strNow(), errSetP ) } );
              message.reply( 'sorry - `' + arrArgs[ 1 ] + '` is not one of the valid options of `online`, `idle`, `dnd`, or `invisible`.\n\tDefaulted back to: **`' + settings[ bot ].status + '`**' )
                .then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting invalid `!config status` confirmation message: ', strNow(), errDel ); } ); } );
            } else {
//              message.client.user.setPresence( { status: statuses[ intSetStatusIndex ] } )
              message.client.user.setStatus( statuses[ intSetStatusIndex ] )
                .then( () => {
                  message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Error reacting to status set: %o', strNow(), errReact ) } );
                  message.reply( 'My status is now set to: `' + statuses[ intSetStatusIndex ].toUpperCase() + '`' ).then( msg => { msg.delete( 15000 ).catch( errDel => { console.error( '%s: Error deleting `!config status NEW STATUS` confirmation message: ', strNow(), errDel ); } ); } );
                } ).catch( errSetP => { console.error( '%s: Error setting presence in `!config status`: %o', strNow(), errSetP ) } );
            }
          }
          break;
        case 'stream' :
          if ( isOwner ) {
            var gameAndUrl = arrArgs.slice( 1 ).join( ' ' ).match( /(.*?)( (https?:\/\/[^ ]*))/i ).slice( 1 ).filter( v => v.indexOf( ' http' ) === -1 );
            if ( isDebug ) { console.log( message.author.tag + ' told me to stream "' + gameAndUrl.join( '", "' ) + '".' ); }// TRON
            if ( gameAndUrl.length === 2 ) {
              message.client.user.setPresence( { status: 'online', activity: { name: gameAndUrl[ 0 ], url: gameAndUrl[ 1 ] } } ).catch( errSetP => { console.error( '%s: Error setting presence in `!config stream`: %o', strNow(), errSetP ) } );
              message.channel.send( message.author + ', my game is now set as `' + gameAndUrl[ 0 ] + '` on ' + gameAndUrl[ 1 ] + ' as you requested.' );
            } else {
              message.reply( 'you forgot to specify a game or URL.\n\t**Please try again with `!config stream <name of game/title> <https://stream.link/channel>`**' );
            }
          }
          break;
        case 'unhost' ://WAI using .setStatus() .setActivity() instead of .setPresence()
          if ( isOwner ) {
            if ( isDebug ) { console.log( message.author.tag + ' told me to unhost.' ); }// TRON
//            message.client.user.setPresence( status: 'online', { activity: { name: settings[ bot ].game } } )
            message.client.user.setStatus( 'online' ).catch( errSetS => { console.error( '%s: Error setting status to `online`: %o', strNow(), errSetS ); } );
            message.client.user.setActivity( settings[ bot ].game )
              .then( () => {
                message.react( '%E2%9C%85' ).then( () => {
                  message.reply( 'I\'m no longer in host mode.' )
                    .then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting `!config unhost` confirmation message: ', strNow(), errDel ); } ); } );
                } ).catch( errDel => { console.error( '%s: Error attempting to react to `!unhost` request: %o', strNow(), errDel ) } );
              } ).catch( errSetP => { console.error( '%s: Error setting presence in `!config unhost`: %o', strNow(), errSetP ) } );
          }
          break;
        case 'guild' :
          if ( guild && intArgs > 1 ) {
            switch ( arrArgs[ 1 ].toLowerCase() ) {
              case 'get':
                if ( intArgs > 2 ) {
                  switch ( arrArgs[ 2 ].toLowerCase() ) {
                    case 'splash':
                      if ( guild.splashURL ) {
                        message.reply( 'the current splash screen is: <' + guild.splashURL + '>', { files: [ { attachment: guild.splashURL + '?size=1280', name: 'Splash.png' } ] } );
                      } else {
                        message.reply( 'this guild, **' + guild.name + '** does not currently have a splash.' );
                      }
                      break;
                    case 'welcome':
                      if ( !isBot ) {
                        let objGuild = ( guilds[ guild.id ] ? guilds[ guild.id ] : {} );console.log('objGuild (length:%i): %o',Object.keys( objGuild ).length,objGuild);
                        let canManageServer = ( Object.keys( objGuild ).length > 0 ? ( objGuild.canWelcomeAdmin || objGuild.canWelcomeManager ) : false );console.log('arrArgs[ 3 ]: %o',arrArgs[ 3 ]);
                        let getConfig = ( arrArgs[ 3 ] ? arrArgs[ 3 ].toLowerCase() : undefined );
                        switch ( getConfig ) {
                          case 'admin':
                            if ( !isBot ) {
                              message.reply( 'I' + ( objGuild.welcome.canWelcomeAdmin ? ' ' : ' do not ' ) + 'allow those with `ADMINISTRATOR` to manage the server welcome.' );
                            }
                            break;
                          case 'manager':
                            if ( !isBot ) {
                              message.reply( 'I' + ( objGuild.welcome.canWelcomeManager ? ' ' : ' do not ' ) + 'allow those with `MANAGE_SERVER` to manage the server welcome.' );
                            }
                            break;
                          case 'chan': case 'channel':
                            if ( !isBot ) {
                              message.reply( 'The welcoming channel is to <#' + objGuild.welcome.channel + '>.' );
                            }
                            break;
                          case 'as': case 'antispam':
                            if ( !isBot ) {
                              message.reply( 'My antispam feature is ' + ( objGuild.welcome.antiSpam ? 'enabled' : 'disabled' ) + '.' );
                            }
                            break;
                          case 'role':
                            if ( !isBot ) {
                              if ( objGuild.welcome.role ) {
                                message.reply( 'I currently assign the <@&' + objGuild.welcome.role + '> role to new members.' );
                              } else {
                                message.reply( 'I currently don\'t assign a role to new members.' );
                              }
                            }
                            break;
                          case 'rolelog':
                            if ( !isBot ) {
                              if ( objGuild.welcome.role && objGuild.welcome.roleLog ) {
                                message.reply( 'I currently use `' + objGuild.welcome.roleLog + '` as an audit log message when I assign a role to new members.' );
                              } else if ( objGuild.welcome.role ) {
                                message.reply( 'I currently use the default audit log message when I assign a role to new members.' );
                              } else if ( objGuild.welcome.roleLog ) {
                                message.reply( 'I currently don\'t assign a role to new members, but have `' + objGuild.welcome.roleLog + '` stored as an audit log message.' );
                              } else {
                                message.reply( 'I currently don\'t assign a role to new members.' );
                              }
                            }
                            break;
                          case 'msg': case 'message':
                            if ( !isBot ) {
                              if ( objGuild.welcome.message ) {
                                message.reply( 'I currently use `' + objGuild.welcome.message + '` as a welcome message.' );
                              } else {
                                message.reply( 'I currently use the default welcome message.' );
                              }
                            }
                            break;
                          case 'embed':
                            if ( !isBot && isOwner ) {
                              message.reply( ':octagonal_sign:**THIS OPTION NOT YET AVAILABLE!**:octagonal_sign:' );
                            }
                            break;
                          default:
                            message.reply( 'you failed to specify something I know about.\n' +
                              '`!config guild get welcome admin`:\n\tReport if server members with `ADMINISTRATOR` are allowed to manage the server welcome.\n' +
                              '`!config guild get welcome manager`:\n\tReport if server members with `MANAGE_SERVER` are allowed to manage the server welcome.\n' +
                              '`!config guild get welcome channel`:\n\tGet channel the server welcome is sent to.\n' +
                              '`!config guild get welcome antispam`:\n\tReport if antispam that block new members with links for usernames.\n' +
                              '`!config guild get welcome role`:\n\tGet role all new members get on join, if set.\n' +
                              '`!config guild get welcome rolelog`:\n\tGet new member audit log message if role assigned.\n' +
                              '`!config guild get welcome embed`:\n\t\t:octagonal_sign:**THIS OPTION NOT YET AVAILABLE!**:octagonal_sign:\n\tGet new member audit log message if role assigned.\n\t\t:octagonal_sign:**THIS OPTION NOT YET AVAILABLE!**:octagonal_sign:\n' +
                              '`!config guild get welcome message`:\n\tGet server welcome message.' );
                        }
                      }
                      break;
                    default:
                      if ( isBotMod || isCrown || isAdministrator || canManageServer ) {
                        message.reply( 'I don\'t know how to config "`' + arrArgs.join( ' ' ) + '`" -+- Try again!' );
                      }
                      else {
                        message.channel.send( 'Nice try ' + message.author + ', but you\'re not the boss of me!' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error attempting to clean up request to "' + arrArgs.join( ' ' ).toLowerCase() + '" by a user with no permission: %o', strNow(), errDel ); } ); } );
                      }
                  }
                }
                break;
              case 'set':
                if ( intArgs > 2 ) {
                  switch ( arrArgs[ 2 ].toLowerCase() ) {
                    case 'splash':
                      if ( isBotMod || isCrown || isAdministrator ) {
                        let oldSplash = guild.splashURL + '?size=1280';
                        if ( message.attachments.size >= 1 ) {
                          guild.setSplash( Array.from( message.attachments )[ 0 ][ 1 ].proxyURL, 'Updated the guild splash screen for ' + ( guild.members.get( message.author.id ).nickname || message.author.username ) ).then( splashSet => { message.reply( 'the splash screen has been changed:\n:x:<' + oldSplash + '>\n:new:<' + guild.splashURL + '>', { files: [ { attachment: oldSplash, name: 'oldSplash.png' }, { attachment: guild.splashURL + '?size=1280', name: 'newSplash.png' } ] } ); } ).catch( errSplash => { console.error( '%s: I was unable to change the splash screen for "%o": %o', strNow(), guild.name, errSplash ); } );
                        }
                        else if ( RegExp( 'https?://(.*?).(jpg|png)', 'i' ).test( arrArgs[ 3 ] ) ) {
                          guild.setSplash( arrArgs[ 3 ], 'Updated the guild splash screen for ' + ( guild.members.get( message.author.id ).nickname || message.author.username ) ).then( splashSet => { message.reply( 'the splash screen has been changed:\n:x:<' + oldSplash + '>\n:new:<' + guild.splashURL + '>', { files: [ { attachment: oldSplash, name: 'oldSplash.png' }, { attachment: guild.splashURL + '?size=1280', name: 'newSplash.png' } ] } ); } ).catch( errSplash => { console.error( '%s: I was unable to change the splash screen for "%o": %o', strNow(), guild.name, errSplash ); } );
                        }
                        else {
                          message.reply( '`' + arrArgs[ 3 ] + '` is not a valid `.jpg` or `.png` file URL **AND** you didn\'t attach an image to your message.  Please try again!\n**USE:** `!config guild set splash [http...optional URL.jpg]` with a valid `.jpg` or `.png` file URL **OR** just attach the file to your message.' );
                        }
                      }
                      break;
                    case 'welcome' :
                      let objGuild = ( guilds[ guild.id ] ? guilds[ guild.id ] : {} );
                      canManageServer = ( Object.keys( objGuild ).length > 0 ? ( objGuild.canWelcomeAdmin || objGuild.canWelcomeManager ) : false );
                      let guildOwnerName = ( guild.members.get( guild.ownerID ).nickname || client.users.get( guild.ownerID ).username || guild.ownerID );
                      if ( isBotMod || isCrown || canManageServer ) {
                        let doConfig = ( arrArgs[ 3 ] ? arrArgs[ 3 ].toLowerCase() : undefined );
                        switch ( doConfig ) {
                          case 'admin':
                            if ( !isBot ) {
                              objGuild.welcome.canWelcomeAdmin = ( arrArgs[ 4 ] ? ( toBoolean( arrArgs[ 4 ] ) ) : !objGuild.welcome.canWelcomeAdmin );
                              message.reply( 'Updated! I will no' + ( objGuild.welcome.canWelcomeAdmin ? 'w' : 't' ) + ' allow those with `ADMINISTRATOR` to manage the server welcome.' );
                              console.log('%s: Updated cWA for guild:\n %o',strNow(),guilds);//TRON
                            }
                            break;
                          case 'manager':
                            if ( !isBot ) {
                              objGuild.welcome.canWelcomeManager = ( arrArgs[ 4 ] ? ( toBoolean( arrArgs[ 4 ] ) ) : !objGuild.welcome.canWelcomeManager );
                              message.reply( 'Updated! I will no' + ( objGuild.welcome.canWelcomeManager ? 'w' : 't' ) + ' allow those with `MANAGE_SERVER` to manage the server welcome.' );
                              console.log('%s: Updated cWM for guild:\n %o',strNow(),guilds);//TRON
                            }
                            break;
                          case 'chan': case 'channel':
                            if ( !arrArgs[ 4 ] ) {
                              objGuild.welcome.channel = message.channel.id;
                              message.reply( 'you failed to specify a channel to send welcome messages to, I\'ve defaulted to ' + message.channel + '.  Please try again with a valid channel on this server if that is not where you want the message to go.' );
                            } else if ( !guild.channels.has( arrArgs[ 4 ].replace( /(<#|>)/g, '' ) ) ) {
                              let chanID = arrArgs[ 4 ].replace( /(<#|>)/g, '' );
                              message.reply( '<#' + chanID + '> is not a valid channel on the **' + guild.name + '** server' + ( client.channels.has( chanID ) ? ' (It\'s on the __' + client.channels.get( chanID ).guild.name + '__ server).' : '.' ) );
                            } else {
                              objGuild.welcome.channel = arrArgs[ 4 ].replace( /(<#|>)/g, '' );
                              message.reply( 'I\'ve set the welcoming channel to <#' + objGuild.welcome.channel + '> as you requested.' );
                            }console.log('%s: Updated chan for guild:\n %o',strNow(),guilds);//TRON
                            break;
                          case 'as': case 'antispam':
                            if ( !isBot ) {
                              objGuild.welcome.antiSpam = ( arrArgs[ 4 ] ? ( toBoolean( arrArgs[ 4 ] ) ) : !objGuild.welcome.antiSpam );
                              message.reply( 'Updated! I will no' + ( objGuild.welcome.canWelcomeManager ? 'w' : 't' ) + ' allow those with usernames that appear to be spam links into the server.' );console.log('%s: Updated as for guild:\n %o',strNow(),guilds);//TRON
                            }
                            break;
                          case 'role':
                            if ( !isBot && arrArgs[ 4 ] ) {
                              let roleID = arrArgs[ 4 ].replace( /(<@&|>)/g, '' );
                              if ( guild.roles.has( roleID ) ) {
                                objGuild.welcome.role = roleID;
                              message.reply( 'I\'ve set the new member role to <@&' + objGuild.welcome.role + '> as you requested.' );
                              } else {
                                let roleOn = Array.from( message.client.guilds.filter( guild => guild.roles.has( roleID ) ).values() );
                                let roleName = client.guilds.get( roleOn[ 0 ].id ).roles.get( roleID ).name;
                                roleOn = ( roleOn ? roleOn[ 0 ].name : null );
                                message.reply( '`@' + roleName + '` (:id:' + roleID + ') is not a valid role in the **' + guild.name + '** server' + ( roleOn ? ' (It\'s on the __' + roleOn + '__ server).' : '.' ) );
                              }
                            } else {
                              message.reply( 'you failed to specify a role to give new members upon joining the **' + guild.name + '** server.' );
                            }
                            console.log('%s: Updated starter role for guild:\n %o',strNow(),guilds);
                            break;
                          case 'rolelog':
                            if ( !isBot ) {
                              objGuild.welcome.roleLog = arrArgs.slice( 4 ).join( ' ' );
                              guilds[ guild.id ] = objGuild;
                              message.reply( 'Updated audit log message!' );
                              console.log('%s: Updated a-msg for guild:\n %o',strNow(),guilds);//TRON
                            }
                            break;
                          case 'msg': case 'message':
                            if ( !isBot ) {
                              objGuild.welcome.message = arrArgs.slice( 4 ).join( ' ' );
                              guilds[ guild.id ] = objGuild;
                              message.reply( 'Updated welcome message!' );
                              console.log('%s: Updated msg for guild:\n %o',strNow(),guilds);//TRON
                            }
                            break;
                          case 'cls':
                            message.delete().catch(errDel=>{console.error('%s: Failed to delete guilds cls request: %o',strNow(),errDel);});
                            if ( isOwner ) {
                              guilds = {};
                              var isCleared = await message.reply('**CLEARED!**');
                              isCleared.delete( 3000 ).catch(errDel=>{console.error('%s: Failed to delete cleared guilds cls reply: %o',strNow(),errDel);});
                              console.log('%s: cleared all guilds for testing:\n %o',strNow(),guilds);//TRON
                            } else {
                              var notAllowed = await message.reply('you are **not** allowed to do that.');
                              notAllowed.delete( 3000 ).catch(errDel=>{console.error('%s: Failed to delete disallowed guilds cls reply: %o',strNow(),errDel);});
                            }
                            break;
                          default:
                            message.reply( 'you failed to specify something I know how to modify for the **' + guild.name + '** server.\n' +
                              '`!config guild set welcome admin [on|off]`:\n\tToggle ability for `ADMINISTRATOR` members to manage the server welcome.\n\tYou may explicitly set it with `on` or `off`\n' +
                              '`!config guild set welcome manager [on|off]`:\n\tToggle ability for `MANAGE_SERVER` members to manage the server welcome.\n\tYou may explicitly set it with `on` or `off`\n' +
                              '`!config guild set welcome channel <#chanID>`:\n\tSet server welcome channel to current channel or `<#chanID>`\n' +
                              '`!config guild set welcome antispam [on|off]`:\n\tToggle antispam to block new members with links for usernames.\n\tYou may explicitly set it with `on` or `off`\n' +
                              '`!config guild set welcome role <@&roleID>`:\n\tGive all new members `<@&roleID>` on join.\n' +
                              '`!config guild set welcome rolelog log`:\n\tSet new member audit log message to `logmsg`.\n' +
                              '`!config guild set welcome message msg`:\n\tSet server welcome message to `msg`.' );
                        }
                      } else {
                        let canWelcomeAdmin = ( objGuild.welcome ? objGuild.welcome.canWelcomeAdmin : false );
                        let canWelcomeManager = ( objGuild.welcome ? objGuild.welcome.canWelcomeManager : false );
                        let notAllowed = await message.reply( 'I\'m sorry, you don\'t have the needed permissions to modify my server welcoming system on **' + guild.name + '**!\n\tPlease have the server owner' + ( canWelcomeAdmin ? ( canWelcomeManager ? ', an administrator, a server manager,' : ', an administrator,' ) : ( canWelcomeManager ? ', a server manager,' : '' ) ) + ' or one of my bot moderators to set it up.' );
                        notAllowed.delete( 15000 ).catch( errDel => { console.error( '%s: Failed to delete disallowed guilds set reply: %o', strNow(), errDel ); } );
                      }
                      break;
                    default:
                      if ( isBotMod || isCrown || isAdministrator || canManageServer ) {
                        message.reply( 'I don\'t know how to config "`' + arrArgs.join( ' ' ) + '`" -+- Try again!' );
                      }
                      else {
                        message.channel.send( 'Nice try ' + message.author + ', but you\'re not the boss of me!' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error attempting to clean up request to "' + arrArgs.join( ' ' ).toLowerCase() + '" by a user with no permission: %o', strNow(), errDel ); } ); } );
                      }
                  }
                }
                break;
              default:
                if ( isBotMod || isCrown || isAdministrator || canManageServer ) {
                  message.reply( 'I don\'t know how to config "`' + arrArgs.join( ' ' ) + '`" -+- Try again!' );
                }
                else {
                  message.channel.send( 'Nice try ' + message.author + ', but you\'re not the boss of me!' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error attempting to clean up request to "' + arrArgs.join( ' ' ).toLowerCase() + '" by a user with no permission: %o', strNow(), errDel ); } ); } );
                }
            }
          }
          break;
        case 'mod' : case 'mods' :
          if ( ( isBotMod || isCrown || isAdministrator || canManageServer ) && intArgs > 1 ) {
            let hasMention = false, toModDemod = null;
            if ( intArgs > 2 ) {
              hasMention = ( arrArgs[ 2 ].match( /<@!?(\d*)>/ ) ? true : false );console.log('hasMention: %o',hasMention);
              toModDemod = await guild.members.get( arrArgs[ 2 ].match( /<@!?(\d+)>/ )[ 1 ] );console.log('toModDemod.id: %o',toModDemod.id);
            }
            switch ( arrArgs[ 1 ].toLowerCase() ) {
              case 'get' : case 'list' :
                if ( isBotMod || isCrown || isAdministrator || canManageServer ) {
                  message.channel.send(  'Owner' + ( arrOwnerIDs.length !== 1 ? 's' : '' ) + ': <@' + arrOwnerIDs.join( '>, <@' ) + '>\nMod' + ( settings[ bot ].moderators.length !== 1 ? 's' : '' ) + ': <@' + arrBotModIds.join( '>, <@' ) + '>' );
                }
                break;
              case 'add' :
                if ( isOwner && hasMention ) {
                  if ( arrBotModIds.indexOf( toModDemod.id ) !== -1 ) {
                    message.delete( 3000 ).catch( delErr => { console.error( '%s: Error deleting author message attempting to add mod: %o', strNow(), delErr ); } );
                    let msgIdiot = await message.reply( 'you\'re an idiot, ' + toModDemod + '**#**' + toModDemod.user.discriminator + ' (`' + toModDemod.id + '`) is already a moderator of me and can\'t be added as such. :face_palm:' );
                    msgIdiot.delete( 8000 ).catch( delErr => { console.error( '%s: Error deleting msgIdiot attempting to add mod: %o', strNow(), delErr ); } );
                  } else {
                    settings[ bot ].moderators.push( toModDemod.id );
                    arrBotModIds = settings[ bot ].moderators;
                    strSettings = JSON.stringify( settings );
                    fs.writeFile( '../' + fsSettings, strSettings, ( errWrite ) => {
                      if ( errWrite ) {
                        throw errWrite;
                      } else {
                        message.delete( 3000 ).catch( delErr => { console.error( '%s: Error deleting author message attempting to remove mod: %o', strNow(), delErr ); } );
                        message.reply( 'I\'ve successfully added ' + toModDemod + '**#**' + toModDemod.user.discriminator + ' (`' + toModDemod.id + '`) as my moderator! :hugging:' );
                      }
                    } ); 
                  }
                }
                break;
              case 'remove' :
                if ( isOwner && hasMention ) {
                  if ( arrBotModIds.indexOf( toModDemod.id ) === -1 ) {
                    message.delete( 3000 ).catch( delErr => { console.error( '%s: Error deleting author message attempting to remove mod: %o', strNow(), delErr ); } );
                    let msgIdiot = await message.reply( 'you\'re an idiot, ' + toModDemod + '**#**' + toModDemod.user.discriminator + ' (`' + toModDemod.id + '`) isn\'t a moderator of me and can\'t be removed as such. :face_palm:' );
                    msgIdiot.delete( 8000 ).catch( delErr => { console.error( '%s: Error deleting msgIdiot attempting to remove mod: %o', strNow(), delErr ); } );
                  } else {
                    settings[ bot ].moderators.splice( arrBotModIds.indexOf( toModDemod.id ), 1 );
                    arrBotModIds = settings[ bot ].moderators;
                    strSettings = JSON.stringify( settings );
                    fs.writeFile( '../' + fsSettings, strSettings, ( errWrite ) => {
                      if ( errWrite ) {
                        throw errWrite;
                      } else {
                        message.delete( 3000 ).catch( delErr => { console.error( '%s: Error deleting author message attempting to remove mod: %o', strNow(), delErr ); } );
                        message.reply( 'I\'ve successfully removed ' + toModDemod + '**#**' + toModDemod.user.discriminator + ' (`' + toModDemod.id + '`) as my moderator! :wave:' );
                      }
                    } );              
                  }
                }
                break;
              default:
            }
          }
          break;
        default :
          if ( isOwner || isAdministrator ) {
            message.reply( 'I don\'t know how to config "' + arrArgs.join( ' ' ) + '" -+- Try again!' );
          } else {
            console.log( message.author.tag + ' tried to get me to "' + arrArgs.join( ' ' ).toLowerCase() + '"' + ( !arrArgs.slice( 1 ) ? '' : ' ' + arrArgs.slice( 1 ).join( ' ' ) ) + ', but isn\'t listed as authorized to do so.' );// TRON
            message.channel.send( 'Nice try ' + message.author + ', but you\'re not the boss of me!' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error attempting to clean up request to "' + arrArgs.join( ' ' ).toLowerCase() + '" by a user with no permission: %o', strNow(), errDel ); } ); } );
          }
      }
    }
    else {
      if ( isBotMod || isCrown || isAdministrator || canManageServer ) {
        message.reply( 'You forgot to specify a command (that you can use) - Try again!' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error attempting to clean up request to `!config` with no parameters: %o', strNow(), errDel ); } ); } );
      } else {
        message.reply( 'Nice try ' + message.author + ', but you\'re not the boss of me!' ).then( msg => { msg.delete( 5000 ).catch( errDel => { console.error( '%s: Error attempting to clean up request to `!config` by a user with no permission: %o', strNow(), errDel ); } ); } );
      }
    }
  }
}

module.exports = BotConfig;