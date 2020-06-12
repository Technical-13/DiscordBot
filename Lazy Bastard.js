const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const sqlite = require( 'sqlite' );
const path = require( 'path' );
const fs = require( 'fs' );
const settings = require( path.join( __dirname, '../settings.json' ) );
const timeString = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZone: 'America/New_York',
  timeZoneName: 'short'
  };
const bot = 'LazyBastard';
const username = 'Lazy Bastard';
const fsTempDB = '/tempDB.json';

var isDebugMode, isBotIdle, idleMsg, dcInfo, objTempDB = {};
fs.readFile( fsTempDB, 'utf8', async ( errRead, strTempDB ) => {
  if ( errRead && errRead.code === 'ENOENT' ) {
    strTempDB = '{"isDebugMode":false,"isBotIdle":false,"idleMsg":false,"dcInfo":""}';
    fs.writeFile( fsTempDB, strTempDB, ( errWrite ) => {
      if ( errWrite ) throw errWrite;
      console.log( 'Created ' + fsTempDB + ' with:\n\t' + strTempDB );
    } );
  } else if ( errRead ) {
    throw errRead;
  }
  objTempDB = JSON.parse( strTempDB );

  isDebugMode = await objTempDB.isDebugMode;
  isBotIdle = await objTempDB.isBotIdle;
  idleMsg = await objTempDB.idleMsg;
  dcInfo = await objTempDB.dcInfo;
} );

function deconstructSnowflake( sfInput ) {
  const { SnowflakeUtil } = require( 'discord.js' );
  var thisSnowflake = SnowflakeUtil.deconstruct( sfInput );
  if ( client.users.get( sfInput ) !== undefined ) {
    if ( client.users.get( sfInput ).id === client.id ) {
      thisSnowflake.type = 'userClient';
    } else { thisSnowflake.type = 'user'; }
  }
  else if ( client.guilds.get( sfInput ) !== undefined ) {
    thisSnowflake.type = 'guild';
  }
  else if ( client.channels.get( sfInput ) !== undefined ) {
    switch ( client.channels.get( sfInput ).type ) {
      case 'category' : thisSnowflake.type = 'categoryChannel'; break;
      case 'text' : thisSnowflake.type = 'textChannel'; break;
      case 'voice' : thisSnowflake.type = 'voiceChannel'; break;
      default : thisSnowflake.type = 'undefinedChannel';
    }
  }
  else {
    thisSnowflake.type = 'undefined';
  }
  
  return thisSnowflake;
}

async function getDefaultChannel( guildID ){
  if ( deconstructSnowflake( guildID ).type !== 'guild' ) {
    throw new Error( 'Failed to specify a valid guildID snowflake for getDefaultChannel()' );
  }//*/
  const guild = client.guilds.get( guildID );
  var intChannelIndex, objChannel;
  var defaultChannel = { 'widget': false, 'systemChannelID': false, 'byPostition': false, 'byCreationIndex': false };
  defaultChannel.widget = await msg.guild.fetchInvites().then( async invites => {
    return await invites.filter( invite => invite.inviter !== undefined ).first().channel.id;
  } );
  if ( guild.channels.get( guild.systemChannelID ).permissionOverwrites.array()[ 0 ].deny === 0 ) {
    defaultChannel.systemChannelID = guild.systemChannelID;
  }
  intChannelIndex = 0;
  objChannel = {};
  do {
    objChannel = guild.channels.find( 'position', intChannelIndex );
    defaultChannel.byPostition = objChannel.id;
    intChannelIndex++;
  } while ( objChannel.type !== 'text' && objChannel.permissionOverwrites.array()[ 0 ] !== undefined && objChannel.permissionOverwrites.array()[ 0 ].deny !== 0 );
  intChannelIndex = 0;
  objChannel = {};
  do {
    objChannel = guild.channels.array()[ intChannelIndex ];
    defaultChannel.byCreationIndex = objChannel.id;
    intChannelIndex++;
  } while ( objChannel.type !== 'text' && objChannel.permissionOverwrites.array()[ 0 ] !== undefined && objChannel.permissionOverwrites.array()[ 0 ].deny !== 0 );
  
  return defaultChannel;
}

function toBoolean( val ){
  val = ( typeof( val ) === 'string' ? val.toLowerCase() : val );
  var arrTrue = [ true, 'true', 1, '1', 'on', 'yes' ];
  return ( arrTrue.indexOf( val ) !== -1 ? true : false );
}

const client = new commando.Client( {
  unknownCommandResponse: settings[ bot ].unknownCommandResponse,
  owner: settings[ bot ].owners
} );

client.registry
  .registerGroups( [
    [ 'random', 'Random' ],
    [ 'utility', 'Utility' ],
    [ 'wiki', 'Wiki' ]
  ] )
  .registerDefaults()
  .registerCommandsIn( path.join( __dirname, 'commands' ) );

client
  .setProvider(
    sqlite.open( path.join( __dirname, 'settings.sqlite3' ) ).then( db => new commando.SQLiteProvider( db ) )
  ).catch( console.error );

client.login( settings[ bot ].token );

client.on( 'ready', async () => {
  Promise.all( [
    await client.user.setActivity( settings[ bot ].game ),
    await client.user.setStatus( settings[ bot ].status )
  ] ).then( () => {
    var readyTime = ( new Date() ).toLocaleDateString( 'en-US', timeString );
    console.log( '\n' + readyTime + ':\t' + settings[ bot ].name + ' is now ready to accept commands.\n' )
    if ( isDebugMode ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is now ready to accept commands at ' + readyTime + '._' );
    }
  } );
} );

client.on( 'disconnect', ( dc ) => {
  var disconnectTime = ( new Date() ).toLocaleDateString( 'en-US', timeString );
  if ( isDebugMode ) {
   dcInfo = '_has disconnected at ' + disconnectTime + ' with: ' + dc;
  }
  console.log( 'I\'ve been disconnected at ' + disconnectTime + ' with: _' + dc );
} );

client.on( 'reconnecting', () => {
  var reconnectTime = ( new Date() ).toLocaleDateString( 'en-US', timeString );
  if ( isDebugMode ) {
    if ( !dcInfo ) {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_has reconnected at ' + reconnectTime + ' and is ready to accept commands._' );
    } else {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( dcInfo + '\n_and has reconnected at ' + reconnectTime + ' and is ready to accept commands._' );
    }
  }
  console.log( 'Reconnected at ' + reconnectTime + '\n' + settings[ bot ].name + ' is now ready to accept commands.\n' );
} );

client.on( 'error', ( err ) => {
  var errorTime = ( new Date() ).toLocaleDateString( 'en-US', timeString );
  if ( isDebugMode ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( ':exclamation: _had an `error` at ' + errorTime + ':_ ' + err );
  }
  console.error( errorTime + ': ' + err );
} );

// Set status -  If the bot hasn't done anything in 10 minutes, set status to idle.
client.setInterval( function() {
  if ( client.user.presence.game.name === 'restarting' ) {
    client.user.setActivity( settings[ bot ].game );// While we're at it checking things every 5 minutes... If the game wasn't updated on restart, try to set it again.
  }
  if ( isBotIdle ) {
    if ( isDebugMode && idleMsg ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is idle_ :frowning2:' );
    }
//    console.log( 'I am idle, no-one loves me!' );
    client.user.setStatus( 'idle' );
  } else {
    if ( isDebugMode && idleMsg ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_wasn\'t idle, but is now._ :frowning:' );
    }
//    console.log( 'I wasn\'t idle, but I am now!' );
    client.user.setStatus( 'online' );
    isBotIdle = true;
  }
}, 300000 );// 300000ms == 5m

client.on( 'message', async ( message ) => {
  var isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
  var isAdmin = false;
  if ( message.guild ) {
    var objAdminRoles = [];
    message.guild.roles.array().forEach( function( role, index ) {
      if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) {
        objAdminRoles[ objAdminRoles.length ] = role;
      }
    } );
    objAdminRoles.forEach( function( role, index ) {
      if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
      isAdmin = true;
      }
    } );
  }
  
  var command = message.content.replace( /  */g, ' ' ).split( ' ' );
  var args, argString;
  if ( command[ 0 ].match( /<@!?(\d*)>/ ) ) {
    if ( command[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] === message.client.user.id ) {
      args = command.slice( 2 );
      argString = args.join( ' ' );
      command = command[ 1 ];
    } else {
      command = false;// Not my command
    }
  } else {
    args = command.slice( 1 );
    argString = args.join( ' ' );
    command = command[ 0 ];
  }
  if ( !command ) {
//    client.channels.get( settings[ bot ].debug[ 0 ] ).send( '`command === ' + command + '` (type: `' + typeof( command ) + '`)' );
  } else if ( command.substr( 0, 1 ) === '!' ) {
    command = command.substr( 1 );
  }
  switch ( command ) {
    case 'about' :
    case 'blueprint' :
    case 'config' :
    case 'define' :
    case 'disable' :
    case 'enable' :
    case 'eval' :
    case 'groups' :
    case 'info' :
    case 'inviteme' :
    case 'load' :
    case 'logs' :
//    case 'n00b' :
    case 'ping' :
    case 'prefix' :
//    case 'prune' :
    case 'reload' :
    case 'roll' :
//    case 'say' :
    case 'server' :
    case 'unload' :
    case 'wblock' :
    case 'winfo' :
    case 'wlink' :
    case 'wuser' :
      if ( isDebugMode ) {
       client.channels.get( settings[ bot ].debug[ 0 ] ).send( 'is processing a `!' + command + '` command.' );
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'help' :
      message.author.lastMessage.react( '%E2%9C%85' ).catch( error => { console.error( error ) } );
      break;
    case 'debug' :
      var debugParameter;
      if ( args[ 0 ] ) {
        debugParameter = args[ 0 ].trim().toLowerCase();
      }
      if ( args[ 0 ] && debugParameter === 'state' ) {
        if ( isDebugMode ) {
         message.react( '1%E2%83%A3' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + e ); } );
        } else {
         message.react( '0%E2%83%A3' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + e ); } );
        }
      }
      else if ( isOwner ) {
        var msgToggle, boolUpdateDebugMode = true;
        var toggle = await toBoolean( debugParameter );
        var strToggle = await ( toggle || ( toggle && !isDebugMode ) ? 'on' : 'off' );
        msgToggle = await client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is attempting to turn ' + strToggle + ' debug mode for_ ' + message.author );
        if ( ( isDebugMode && toggle ) || ( !isDebugMode && !toggle ) ) {
          await msgToggle.edit( '_debug mode was already ' + strToggle + '_' );
          await msgToggle.react( '%F0%9F%A4%A6' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + e ); } );
          message.delete().catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + e ); } );
          boolUpdateDebugMode = false;
        } else if ( toggle ) {
          isDebugMode = true;
        } else if ( !toggle ) {
          isDebugMode = false;
        } else {
          isDebugMode = !isDebugMode;
        }
        if ( boolUpdateDebugMode ) {
          objTempDB.isDebugMode = isDebugMode;
          strTempDB = JSON.stringify( objTempDB );
          fs.writeFile( fsTempDB, strTempDB, ( errWrite ) => {
            if ( errWrite ) {
              throw errWrite;
            } else {
               if ( isDebugMode ) {
                msgToggle.edit( '_debug mode is now on_' );
                msgToggle.react( '1%E2%83%A3' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + e ); } );
              } else {
                msgToggle.edit( '_debug mode is now off_' );
                msgToggle.react( '0%E2%83%A3' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + e ); } );
              }
              message.delete().catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + e ); } );
            }
          } );
        }
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    default : 
    /* Do nothing */
  }
} );

client.on( 'guildCreate', async ( guild ) => {
  if ( isDebugMode ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is processing a `guildCreate` event_' );
  }
  client.user.setStatus( 'online' );
  isBotIdle = false;
  const Invite = await message.guild.defaultChannel.createInvite( { maxAge: 0 } );
  const inviteUrl = Invite.url;
  var explicitContentFilter, region, verificationLevel;
  
  switch ( message.guild.explicitContentFilter ) {
    case 0 :
      explicitContentFilter = ":no_entry_sign::mag_right:";// Don't scan any messages.
      break;
    case 1 :
      explicitContentFilter = ":mag::bust_in_silhouette:";// Scan messages from members without a role.
      break;
    case 2 :
      explicitContentFilter = ":mag::family_mmgb:";// Scan messages sent be all members.
      break;
    default : explicitContentFilter = ":grey_question:" + message.guild.explicitContentFilter + ":grey_question:";
  };
  
  switch ( message.guild.region ) {
    case "brazil" :
      region = ":flag_br: Brazil";
      break;
    case "eu-central" :
      region = ":flag_eu: Central Europe";
      break;
    case "hongkong" :
      region = ":flag_hk: Hong Kong";
      break;
    case "russia" :
      region = ":flag_ru: Russia";
      break;
    case "singapore" :
      region = ":flag_sg: Singapore";
      break;
    case "sydney" :
      region = ":flag_au: Sydney";
      break;
    case "us-central" :
      region = ":flag_us: US Central";
      break;
    case "us-east" :
      region = ":flag_us: US East";
      break;
    case "us-south" :
      region = ":flag_us: US South";
      break;
    case "us-west" :
      region = ":flag_us: US West";
      break;
    case "eu-west" :
      region = ":flag_eu: Western Europe";
      break;
    default : region = ":grey_question: " + message.guild.region
  };
  
  switch ( message.guild.verificationLevel ) {
    case 0 :
      verificationLevel = ":new_moon_with_face:";// None
      break;
    case 1 :
      verificationLevel = ":waning_crescent_moon:";// Low
      break;
    case 2 :
      verificationLevel = ":last_quarter_moon:";// Medium
      break;
    case 3 :
      verificationLevel = ":waxing_gibbous_moon:";// (╯°□°）╯︵ ┻━┻
      break;
    case 4 :
      verificationLevel = ":full_moon:";// ┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻
      break;
    default : verificationLevel = ":grey_question:" + message.guild.verificationLevel + ":grey_question:";
  };
  
  settings[ bot ].debug.forEach( function( log ){
    client.channels.get( log ).send( {
      embed: {
        title: ':arrow_right: Joined a guild named:',
        description: ':arrow_right:\t[**' + guild.name + '**](' + inviteUrl + ')',
        thumbnail: {
          url: message.guild.iconURL
        },
        color: 0x000080,
        fields: [
          {
            name: 'Created / Owner',
            value: message.guild.createdAt.toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' - <@' + message.guild.ownerID + '>#' + message.guild.owner.user.discriminator 
          },
          {
            name: 'Members / Roles / Channels',
            value: message.guild.memberCount + ' / ' + message.guild.roles.size + ' / ' + message.guild.channels.size
          },
          {
            name: 'Moderation',
            value: verificationLevel + '\t|\t' + explicitContentFilter 
          },
          {
            name: 'Region',
            value: region
          }
        ]
      }
    } );
  } );
} );

client.on( 'guildDelete', async ( guild ) => {
  if ( isDebugMode ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is processing a `guildDelete` event_' );
  }
  client.user.setStatus( 'online' );
  isBotIdle = false;
  var Invite = await message.guild.defaultChannel.createInvite( { maxAge: 0 } );
  var inviteUrl = Invite.url;
  var explicitContentFilter, region, verificationLevel;
  
  switch ( message.guild.explicitContentFilter ) {
    case 0 :
      explicitContentFilter = ":no_entry_sign::mag_right:";// Don't scan any messages.
      break;
    case 1 :
      explicitContentFilter = ":mag::bust_in_silhouette:";// Scan messages from members without a role.
      break;
    case 2 :
      explicitContentFilter = ":mag::family_mmgb:";// Scan messages sent be all members.
      break;
    default : explicitContentFilter = ":grey_question:" + message.guild.explicitContentFilter + ":grey_question:";
  };
  
  switch ( message.guild.region.replace( 'vip-', '' ) ) {
    case "brazil" :
      region = ":flag_br: Brazil";
      break;
    case "eu-central" :
      region = ":flag_eu: Central Europe";
      break;
    case "hongkong" :
      region = ":flag_hk: Hong Kong";
      break;
    case "russia" :
      region = ":flag_ru: Russia";
      break;
    case "singapore" :
      region = ":flag_sg: Singapore";
      break;
    case "sydney" :
      region = ":flag_au: Sydney";
      break;
    case "us-central" :
      region = ":flag_us: US Central";
      break;
    case "us-east" :
      region = ":flag_us: US East";
      break;
    case "us-south" :
      region = ":flag_us: US South";
      break;
    case "us-west" :
      region = ":flag_us: US West";
      break;
    case "eu-west" :
      region = ":flag_eu: Western Europe";
      break;
    default : region = ":grey_question: " + message.guild.region
  };
  
  switch ( message.guild.verificationLevel ) {
    case 0 :
      verificationLevel = ":new_moon_with_face:";// None
      break;
    case 1 :
      verificationLevel = ":waning_crescent_moon:";// Low
      break;
    case 2 :
      verificationLevel = ":last_quarter_moon:";// Medium
      break;
    case 3 :
      verificationLevel = ":waxing_gibbous_moon:";// (╯°□°）╯︵ ┻━┻
      break;
    case 4 :
      verificationLevel = ":full_moon:";// ┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻
      break;
    default : verificationLevel = ":grey_question:" + message.guild.verificationLevel + ":grey_question:";
  };
  
  settings[ bot ].debug.forEach( function( log ){
    client.channels.get( log ).send( {
      embed: {
        title: ':arrow_left: Left a guild named:',
        description: ':arrow_left:\t[**' + guild.name + '**](' + inviteUrl + ')',
        thumbnail: {
          url: message.guild.iconURL
        },
        color: 0x000080,
        fields: [
          {
            name: 'Created / Owner',
            value: message.guild.createdAt.toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' - <@' + message.guild.ownerID + '>#' + message.guild.owner.user.discriminator 
          },
          {
            name: 'Members / Roles / Channels',
            value: message.guild.memberCount + ' / ' + message.guild.roles.size + ' / ' + message.guild.channels.size
          },
          {
            name: 'Moderation',
            value: verificationLevel + '\t|\t' + explicitContentFilter 
          },
          {
            name: 'Region',
            value: region
          }
        ]
      }
    } );
  } );
} );