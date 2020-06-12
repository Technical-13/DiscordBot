const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const sqlite = require( 'sqlite' );
const path = require( 'path' );
const fs = require( 'fs' );
var settings = require( path.join( __dirname, '../settings.json' ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const bot = 'Vladdy';
//const fsTempDB = 'tempDB.json';

var idleMsg = false;
var isDebugMode, isBotIdle, dcInfo, objTempDB = {};
/*fs.readFile( fsTempDB, 'utf8', async ( errRead, strTempDB ) => {
  if ( errRead && errRead.code === 'ENOENT' ) {
    strTempDB = '{"isDebugMode":false,"isBotIdle":false,"dcInfo":""}';
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
  dcInfo = await objTempDB.dcInfo;
} );//*/

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
function toBoolean( val ){
  val = ( typeof( val ) === 'string' ? val.toLowerCase() : val );
  var arrTrue = [ true, 'true', 1, '1', 'on', 'yes' ];
  return ( arrTrue.indexOf( val ) !== -1 ? true : false );
}

function sendDM( message, recipient, strContent ) {
  recipient
    .send( strContent )
    .then( dmSent => {
      message.author.send( 'DM, ' + recipient + ' (' + recipient.tag + ') sent: `' + strContent + '`' );
    } ).catch( dmErr => {
      message.author.send( 'Unable to DM, ' + recipient + ' (' + recipient.tag + ') your message: `' + strContent + '`' );
    } );
}

async function getDuration( strTimestamp ) {
  if ( strTimestamp == '0' ) {
    return '__NO DATA__';
  }
  const arrDaysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  const intThisYearIndex = ( new Date() ).getYear();
  const intThisMonthIndex = ( new Date() ).getMonth();
  const intThisDateIndex = ( new Date() ).getDate();
  const intThisHoursIndex = ( new Date() ).getHours();
  const intThisMinutesIndex = ( new Date() ).getMinutes();
  const intThisSecondsIndex = ( new Date() ).getSeconds();
  
  const intYearIndex = ( new Date( strTimestamp ) ).getYear();
  const intLeap = ( ( intYearIndex % 4 === 0 && intYearIndex % 100 !== 0) || intYearIndex % 400 === 0 );
  const intMonthIndex = ( new Date( strTimestamp ) ).getMonth();
  const intDaysInMonth = ( arrDaysInMonth[ intMonthIndex ] + ( intMonthIndex == 2 ? ( intLeap ) : 0 ) );
  const intDateIndex = ( new Date( strTimestamp ) ).getDate();
  const intHoursIndex = ( new Date( strTimestamp ) ).getHours();
  const intMinutesIndex = ( new Date( strTimestamp ) ).getMinutes();
  const intSecondsIndex = ( new Date( strTimestamp ) ).getSeconds();
  
  const intSeconds = ( ( 60 + ( intThisSecondsIndex - intSecondsIndex ) ) % 60 );
  const intMinutes = ( ( 60 + ( ( intThisMinutesIndex - intMinutesIndex ) - ( intSecondsIndex < intThisSecondsIndex ? 0 : 1 ) ) ) % 60 );
  const intHours = ( ( 24 + ( ( intThisHoursIndex - intHoursIndex ) - ( intMinutesIndex < intThisMinutesIndex ? 0 : 1 ) ) ) % 24 );
  const intDays = ( ( intDaysInMonth + ( intThisDateIndex - intDateIndex ) ) % intDaysInMonth );
  const intMonths = ( ( 12 + ( ( intThisMonthIndex - intMonthIndex ) - ( intThisMonthIndex === intMonthIndex ? ( intDateIndex <= intThisDateIndex ? 0 : 1 ) : 0 ) ) ) % 12 );
  const intYears = ( ( intThisYearIndex - intYearIndex ) - ( intMonthIndex < intThisMonthIndex ? 0 : 1 ) );
  
  const boolSeconds = ( intSeconds > 0 ? true : false );
  const boolMinutes = ( intMinutes > 0 ? true : false );
  const boolHours = ( intHours > 0 ? true : false );
  const boolDays = ( intDays > 0 ? true : false );
  const boolMonths = ( intMonths > 0 ? true : false );
  const boolYears = ( intYears > 0 ? true : false );
  
  var strTimeString = '**';
  if ( boolYears ) {
    strTimeString += intYears + ' years';
    if ( boolMonths + boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) {
      strTimeString += ', ';
    } else if ( boolMonths + boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolMonths ) {
    strTimeString += intMonths + ' months';
    if ( boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) {
      strTimeString += ', ';
    } else if ( boolYears && ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolDays ) {
    strTimeString += intDays + ' days';
    if ( ( boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) ) {
      strTimeString += ', ';
    } else if ( boolYears && ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolHours ) {
    strTimeString += intHours + ' hours';
    if ( boolMinutes && boolSeconds ) {
      strTimeString += ', ';
    } else if ( ( boolYears + boolMonths + boolDays >= 1 ) && ( boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolMinutes ) {
    strTimeString += intMinutes + ' minutes';
    if ( ( boolYears + boolMonths + boolDays + boolHours >= 1 ) && boolSeconds ) {
      strTimeString += ', and ';
    } else if ( boolSeconds ) {
      strTimeString += ' and ';
    }
  }
  if ( boolSeconds ) {
    strTimeString += intSeconds + ' seconds';
  }
  strTimeString += '**';
  return await strTimeString;
}

const client = new commando.Client( {
  unknownCommandResponse: settings[ bot ].unknownCommandResponse,
  owner: settings[ bot ].owners
} );

client.registry
  .registerGroups( [
    [ 'maize', 'Maize' ],
    [ 'random', 'Random' ],
    [ 'util', 'Utility' ]
  ] )
  .registerDefaults()
  .registerCommandsIn( path.join( __dirname, 'commands' ) );

client
  .setProvider(
    sqlite.open( path.join( __dirname, 'settings.sqlite3' ) ).then( db => new commando.SQLiteProvider( db ) )
  ).catch( console.error );

client.login( settings[ bot ].token );

client.on( 'ready', () => {
  Promise.all( [
    client.user.setActivity( settings[ bot ].game ),
    client.user.setStatus( settings[ bot ].status )
  ] ).then( () => {
    var readyTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
    console.log( '\n' + readyTime + ':\t' + settings[ bot ].name + ' is now ready to accept commands.\n' )
    if ( isDebugMode ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is now ready to accept commands at ' + readyTime + '._' );
    }
  } ).catch( err => {
    var errorTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
    if ( isDebugMode ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( ':exclamation: _had an `error` at ' + errorTime + ':_ `' + err + '`' );
    }
    if ( err.indexOf( 'ETIMEDOUT' ) !== -1 ) {
      console.error( '%o, failed to connect to the Internet on: %o', errorTime, err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
    } else if ( err.indexOf( 'ENOTFOUND' ) !== -1 ) {
      console.error( '%o, failed to connect to Discord on: %o', errorTime, err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
    } else {
      console.error( '%o: READY ERROR: %o', errorTime, err );
    }
  } );
} );

client.on( 'disconnect', ( dc ) => {
  var disconnectTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  dcInfo = '_has disconnected at ' + disconnectTime + ' with:_ `' + dc + '`';
  console.log( 'I\'ve been disconnected at ' + disconnectTime + ' with:_`' + dc + '`' );
} );

client.on( 'reconnecting', () => {
  var reconnectTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
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
  var errorTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  if ( isDebugMode ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( ':exclamation: _had an `error` at ' + errorTime + ':_ `' + err + '`' );
  }
  if ( err.indexOf( 'ETIMEDOUT' ) ) {
    console.error( '%o, failed to connect to the Internet on: %o', errorTime, err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
  } else if ( err.indexOf( 'ENOTFOUND' ) ) {
    console.error( '%o, failed to connect to Discord on: %o', errorTime, err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
  } else {
    console.error( '%o: ERROR: %o', errorTime, err );
  }
} );

// Set status -  If the bot hasn't done anything in 10 minutes, set status to idle.
client.setInterval( function() {
  if ( client.user.presence.game.name === 'restarting' ) {
    client.user.setActivity( settings[ bot ].game );// While we're at it checking things every 5 minutes... If the game wasn't updated on restart, try to set it again.
  }
  if ( isBotIdle ) {
    if ( isDebugMode /*&& idleMsg*/ ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is idle_ :frowning2:' );
    }
//    console.log( 'I am idle, no-one loves me!' );
    client.user.setStatus( 'idle' );
  } else {
    if ( isDebugMode /*&& idleMsg*/ ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_wasn\'t idle, but is now._ :frowning:' );
    }
//    console.log( 'I wasn\'t idle, but I am now!' );
    client.user.setStatus( 'online' );
    isBotIdle = true;
  }
}, 300000 );// 300000ms == 5m

client.on( 'message', async ( message ) => { // Regular messages
  /* Section for message processing categorization */
  var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
  var isAdmin = false;
  var staffRole = false;
  var isStaff = false;
  if ( message.guild ) {
    staffRole = await message.guild.roles.get( '201710935788748800' );
    isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    isMoorMaster = await ( message.guild.roles.find( role => { if ( role.name = 'Moor Masters' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name = 'Moor Masters' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    isMonsterPlayer = await ( message.guild.roles.find( role => { if ( role.name = 'MonsterPlayer' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name = 'MonsterPlayer' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
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
  var arrArgs, strArgs;
  if ( command[ 0 ].match( /<@!?(\d*)>/ ) ) {
    if ( command[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] === message.client.user.id ) {
      arrArgs = command.slice( 2 );
      strArgs = arrArgs.join( ' ' );
      command = command[ 1 ];
    } else {
      command = false;// Not my command
    }
  } else {
    arrArgs = command.slice( 1 );
    strArgs = arrArgs.join( ' ' );
    command = command[ 0 ];
  }
  if ( !command ) {
//    client.channels.get( settings[ bot ].debug[ 0 ] ).send( '`command === ' + command + '` (type: `' + typeof( command ) + '`)' );
  } else if ( command.substr( 0, 1 ) === '!' ) {
    command = command.substr( 1 ).toLowerCase();
  }
  
  switch ( command ) {
    case 'dm' :
      if ( isOwner || isAdmin ) {
        var strWhom;
        strArgs = arrArgs.slice( 1 ).join( ' ' );
        if ( arrArgs[ 0 ].toLowerCase() === 'all' && isOwner ) {
          message.client.users.forEach( function ( user ) {
            sendDM( message, user.user, strArgs );
          } );
          strWhom = 'everyone';
        } else if ( arrArgs[ 0 ].toLowerCase() === 'server' && ( isAdmin || isOwner ) ) {
          message.guild.members.forEach( function ( user ) {
            sendDM( message, user.user, strArgs );
          } );
          strWhom = 'everyone in ' + message.guild.name;
        } else if ( message.mentions.roles.keyArray().length >= 1 ) {
          message.guild.roles.get( message.mentions.roles.first().id ).members.forEach( function ( user ) {
            sendDM( message, user.user, strArgs );
          } );
          strWhom = 'everyone with ' + message.guild.name + '\'s ' + message.guild.roles.get( message.mentions.roles.first().id ).name + ' role';
        } else {
          var user = message.mentions.users.first();
          sendDM( message, user, strArgs );
          strWhom = user.tag;
        }
      }
      else {
        message.channel.send( 'I\'m sorry, ' + message.author + ', you don\'t have the authority to use that command.' );
      }
      message.delete( { reason: 'Cleaning up ' + message.author + '\'s request to DM `' +  + '` to ' + strWhom + '.' } );
      break;
    case 'nick':
      if ( message.guild ) {
        if ( arrArgs[ 0 ] ) {
          message.guild.members.get( message.author.id )
            .setNickname( strArgs, 'Setting nickname for user.' )
            .catch( errSetNick => {
              console.error( 'Unable to set ' + objDiscordUser.guild[ message.guild.id ].tag + '\'s nickname in ' + message.guild.name + ': ' + errSetNick );
            } );
        } else {
          message.guild.members.get( message.author.id )
            .setNickname( message.author.username, 'Clearing nickname for user.' )
            .catch( errSetNick => {
              console.error( 'Unable to set ' + objDiscordUser.guild[ message.guild.id ].tag + '\'s nickname in ' + message.guild.name + ': ' + errSetNick );
            } );
        }
      }
      break;
    default:
      /* Do nothing */
	}
} );

client.on( 'guildMemberAdd', ( member ) => {
  var guildWelcomeMesages = {
    '454423799404953611': {// Waize
      channel: '454423799404953613',
      role: '454525425075617794',// &stupid
      message: 'Hey <@&454525425075617794>, ' + member.user + '**#**' + member.user.discriminator + ', welcome to **' + member.guild.name + '**.'
    }
  };
  if ( guildWelcomeMesages[ member.guild.id ] ) {
    if ( isDebugMode ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '*is processing a **`guildMemberCreate`** event for: __' + member.user + '**#' + member.user.discriminator + '**__ in __**' + member.guild.name + '**__.*' );
    }
    client.user.setStatus( 'online' );
    isBotIdle = false;
    var channel = member.guild.channels.get( guildWelcomeMesages[ member.guild.id ].channel );
    if ( !channel ) {
      channel = ( member.guild.id || member.guild.channels.find( chan => { if ( chan.name = 'general' ) { return role; } } ).id || member.guild.channels.sort( function( a, b ){ return a.position - b.position; } ).first().id );
    }
    channel.send( guildWelcomeMesages[ member.guild.id ].message );
    if ( guildWelcomeMesages[ member.guild.id ].role !== '' ) {
      member.addRole( guildWelcomeMesages[ member.guild.id ].role, 'Give our newest member the starter role!' ).catch( console.error );
    }
  }
} );

client.on( 'guildMemberRemove', async member => {
  var guildGoodByeMesages = {
    '454423799404953611': {// Waize
      channel: '454441207058399232',
      message: 'Stupid, ' + member.user + ' (-' + member.user.tag + '-), left **' + member.guild.name + '**. (Length of stay: ' + await getDuration( member.joinedTimestamp ) + ').'
    }
  };
  if ( guildGoodByeMesages[ member.guild.id ] ) {
    if ( isDebugMode ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '*is processing a **`guildMemberRemove`** event for: __' + member.user + '**#' + member.user.discriminator + '**__ in __**' + member.guild.name + '**__.*' );
    }
    client.user.setStatus( 'online' );
    isBotIdle = false;
    var channel = member.guild.channels.get( guildGoodByeMesages[ member.guild.id ].channel );
    if ( !channel ) {
      channel = ( member.guild.id || member.guild.channels.find( chan => { if ( chan.name = 'general' ) { return role; } } ).id || member.guild.channels.sort( function( a, b ){ return a.position - b.position; } ).first().id );
    }    
    channel.send( guildGoodByeMesages[ member.guild.id ].message );/*
    console.log( member.user.tag + ' left ' + member.guild.name + '. ' +
      ( new Date() ).toISOString() + ' - ' + ( new Date( member.joinedTimestamp ) ).toISOString() +
        ' = ' + Date().toValue() - Date( member.joinedTimestamp ).toValue() );//*/
  }
} );

client.on( 'guildMemberUpdate', ( mbrOld, mbrNew ) => {
  const guild = mbrOld.guild;
  const member = guild.members.get( mbrNew.id ).user;
} );//*/