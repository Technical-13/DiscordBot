const bot = 'DDObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const sqlite = require( 'sqlite' );
const fs = require( 'fs' );
const path = require( 'path' );
const fsSettings = 'settings.json'
const settings = require( path.join( __dirname, '../' + fsSettings ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = ( new Date() ).toLocaleDateString( 'en-us', objTimeString );
const exec = require( 'child_process' ).exec;
//const puppeteer = require( 'puppeteer' );
//const strScreenShotPath = path.join( __dirname, '/' );
//const unirest = require( 'unirest' );
  
var idleMsg = false;
var enableSay = true;
var isDebug = settings[ bot ].onError.isDebugMode;
var isBotIdle = settings[ bot ].onError.isBotIdle;
var dcInfo = settings[ bot ].onError.dcInfo;
var dateCheckRoles = new Date( settings[ bot ].onError.dateCheckRoles );

var strLogChan = {
//  '': { serverName: '', logChan: { name: '', id: '' } },
  '153007361655570432': { serverName: 'DDOwiki', logChan: { name: 'logs', id: '195064130762178560', canLog: true } },
  '192775085420052489': { serverName: 'The Cat Cabin', logChan: { name: 'dungeons-and-dragons-online', id: '347347787505205248', canLog: true } },
  '159038425599705088': { serverName: 'DDOstream', logChan: { name: 'logs', id: '502830911302270977', canLog: true } },
  '207922289931452426': { serverName: 'SamuisGurobo', logChan: { name: 'bot-logs', id: '502830561807695950', canLog: true } },
  '337691947424546817': { serverName: 'Dragon\'s Domain', logChan: { name: 'ddo', id: '337692118426583040', canLog: true } },
  '199261489050157056': { serverName: 'Titan\'s Personal', logChan: { name: 'bot_spam', id: '336599079545208832', canLog: true } },
  '460060547023634442': { serverName: 'Templar', logChan: { name: 'bot-logs', id: '502830218558439436', canLog: true } },
  '433847498734567425': { serverName: 'Blood Moon Den', logChan: { name: 'ddo', id: '445066388269170708', canLog: true } },
  '516387336389394442': { serverName: 'Steiner\'s Realm', logChan: { name: 'dungeons-and-dragons', id: '692395086956462101', canLog: false } }
};

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
    [ 'ddo', 'DDO' ],
    [ 'moderator', 'Moderation' ],
    [ 'random', 'Random' ],
    [ 'utility', 'Utility' ],
    [ 'wiki', 'Wiki' ]
  ] )
  .registerDefaults()
  .registerCommandsIn( path.join( __dirname, 'commands' ) )

client
  .setProvider(
    sqlite.open( path.join( __dirname, 'settings.sqlite3' ) ).then( db => new commando.SQLiteProvider( db ) )
  )
  .catch( console.error );

/* IRC relay start */
function meIRC( msgChan ) {
  if ( msgChan.match( /ACTION(.*?)/ ) !== null ) {
    msgChan = '*** _' + msgChan.replace( //g, '' ).substr( 7 ) + '_';
  }
  else {
    msgChan = '*** :arrow_right: ' + msgChan;
  }
  
  return msgChan;
}

function meDiscord( msgIRC ) {
  var arrMentions = msgIRC.match( /<@!?(\d*)>/gi );
  if ( arrMentions !== null ) {
    arrMentions.forEach( function( user, ndx ) {
      var userID = user.replace( /[<@!>]/g, '' );
      var userTag = client.users.get( userID ).tag;
      msgIRC = msgIRC.replace( user, '@' + userTag );
    } );
  }
  var arrChannels = msgIRC.match( /<#(\d*)>/gi );
  if ( arrChannels !== null ) {
    arrChannels.forEach( function( chan, ndx ) {
      var chanID = chan.replace( /[<#>]/g, '' );
      var chanName = client.channels.get( chanID ).name;
      msgIRC = msgIRC.replace( chan, '#' + chanName );
    } );
  }

/*  Can't currently make the bot emote to IRC -- need to do some more digging. :\
  if ( msgIRC.match( /_(.*?)_/ ) !== null ) {
    msgIRC = msgIRC.substr( 1, ( msgIRC.length - 2 ) );
    msgIRC = '\u0001ACTION ' + msgIRC + '\u0001';
  }
  else {
    // pass it straight back through
  }
//*/  
  
  return msgIRC;
}

const ircClient = require( 'node-irc' );
var clientIRC = new ircClient( 'irc.freenode.net', 6667, 'DDObot', 'discord.me/TheShoeStore' );

// This decides the verbosity of the output, set to 1 as default
clientIRC.verbosity = 1; // 0 == Silent, 1 == Normal, 2 == Info, 3 == debug

// This is set to false by default, prints out all raw server messages
clientIRC.debug = false;

clientIRC.on( 'ready', function () {
  clientIRC.join( '##DDOwiki' );
} );

clientIRC.on( 'CHANMSG', function ( data ) {
  client.channels.get( '460470237117153282' ).send( '**' + data.nick + '*' + data.receiver + meIRC( data.message ) );
} );

clientIRC.on( 'PRIVMSG', function ( data ) {
  settings[ bot ].owners.forEach( async function( ownerID, i ) {
    var objOwner = await client.fetchUser( ownerID );
    objOwner.send( 'I have received an IRC DM from **' + data.sender + '**: ' + data.message );
  } );
  clientIRC.say( data.nick, 'I\'m a bot, I don\'t understand your message.  I\'ve forwarded your message to my owners.' );
} );

client.on( 'message', message => {
  if ( message.channel.id === '460470237117153282' && message.author.id !== client.user.id ) {
    clientIRC.say( '##DDOwiki', message.author.tag + ': ' + meDiscord( message.content ) );
  }
} );

clientIRC.connect();
/* IRC relay end */

client.login( settings[ bot ].token );

client.on( 'ready', () => {
  Promise.all( [
    client.user.setActivity( settings[ bot ].game ),
    client.user.setStatus( settings[ bot ].status )
  ] ).then( () => {
    console.log( '\n%s:\t%s is now ready to accept commands.\n', strNow, settings[ bot ].name )
    if ( isDebug ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is now ready to accept commands at ' + strNow + '._' );
    }
  } ).catch( err => {
    var errorTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
    if ( isDebug ) {
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
  if ( isDebug ) {
   dcInfo = '_has disconnected at ' + strNow + ' with: ' + dc + '_';
  }
  console.log( 'I\'ve been disconnected at %s with: %o', strNow, dc );
} );

client.on( 'reconnecting', () => {
  if ( isDebug ) {
    if ( !dcInfo ) {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_has reconnected at ' + strNow + ' and is ready to accept commands._' );
    } else {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( dcInfo + '\n_and has reconnected at ' + strNow + ' and is ready to accept commands._' );
    }
  }
  console.log( 'Reconnected at ' + strNow + '\n' + settings[ bot ].name + ' is now ready to accept commands.\n' );
} );

client.on( 'error', ( err ) => {
  if ( isDebug ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( ':exclamation: _had an `error` at ' + strNow + ':_ `' + err + '`' );
  }
  console.error( '%s: ERROR: %o', strNow, err );
  
  if ( err.code === 'ETIMEDOUT' ) {
    console.error( '%o, failed to connect to the Internet on: %o', strNow, err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
  } else if ( err.code ===  'ENOTFOUND' ) {
    console.error( '%o, failed to connect to Discord on: %o', strNow, err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
  } else {
    console.error( '%o: ERROR: %o', strNow, err );
  }
} );

// Set status -  If the bot hasn't done anything in 10 minutes, set status to idle.
client.setInterval( function() {
  if ( client.user.presence.game && client.user.presence.game.name === 'restarting' ) {
    client.user.setActivity( settings[ bot ].game );// While we're at it checking things every 5 minutes... If the game wasn't updated on restart, try to set it again.
  }
  if ( isBotIdle ) {
    if ( isDebug && idleMsg ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is idle_ :frowning2:' );
    }
//    console.log( 'I am idle, no-one loves me!' );
    client.user.setStatus( 'idle' );
  } else {
    if ( isDebug && idleMsg ) {
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
  var arrArgs = [];
  if ( command[ 0 ].match( /<@!?(\d*)>/ ) ) {
    if ( command[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] === client.user.id && command.length > 1 ) {
      arrArgs = command.slice( 2 );
      command = command[ 1 ].toLowerCase();
    } else {
      arrArgs = command;
      command = false;
    }
  } else if ( command[ 0 ].indexOf( '!' ) === 0 ) {
    arrArgs = command.slice( 1 );
    command = command[ 0 ].toLowerCase();
  } else {
    arrArgs = command;
    command = false;
  }
  var argString = arrArgs.join( ' ' );
  
  if ( !command ) {
    /* Do nothing, it's not my command. */
  } else if ( command.substr( 0, 1 ) === '!' ) {
    command = command.substr( 1 ).toLowerCase();
  }
  
  if ( arrArgs[ 0 ] !== undefined ) {
    var wikiLinks = [];
    var rawLinks = arrArgs.join( ' ' ).match( /(\[\[(.*?)\]\])*/g ).filter( aMatch => { if ( aMatch !== '' ) { return aMatch; }  } );
    rawLinks.forEach( rawLink => { wikiLinks.push( rawLink.replace( / /g, '_' ).replace( /[\[\]]/g, '' ) ); } );
    var rawTemplateLinks = arrArgs.join( ' ' ).match( /(\{\{(.*?)\}\})*/g ).filter( tMatch => { if ( tMatch !== '' ) { return tMatch; }  } );
    rawTemplateLinks.forEach( rawTemplateLink => { wikiLinks.push( 'Template:' + rawTemplateLink.replace( / /g, '_' ).replace( /[\{\}]/g, '' ) ); } );
//    console.log( '%o', wikiLinks );
    
    if ( message.author.id !== client.user.id && wikiLinks.length >= 1 ) {
      var strMessage = 'Wiki link' + ( wikiLinks.length === 1 ? '' : 's' ) + ' detected: ';
      var arrDoneLinks = [];
      wikiLinks.forEach( function( wikiLink, ndx ) {
        arrDoneLinks.push( wikiLink.toUpperCase() );
        strMessage += '\n\t__' + wikiLink.replace( '_', ' ' ) + '__ :link: <http://ddowiki.com/page/' + wikiLink + '>';
      } );
      if ( arrDoneLinks.length >= 1 ) {
        message.channel.send( strMessage );
      }
    }
  }
  
  switch ( command ) {
    case 'debug' :
      var debugParameter;
      if ( arrArgs[ 0 ] ) {
        debugParameter = arrArgs[ 0 ].trim().toLowerCase();
      }
      if ( arrArgs[ 0 ] && debugParameter === 'state' ) {
        if ( isDebug ) {
         message.react( '1%E2%83%A3' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
        } else {
         message.react( '0%E2%83%A3' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
        }
      }
      else if ( isOwner ) {
        var msgToggle, boolUpdateDebugMode = true;
        var toggle = await toBoolean( debugParameter );
        var strToggle = await ( toggle || ( toggle && !isDebug ) ? 'on' : 'off' );
        msgToggle = await client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is attempting to turn ' + strToggle + ' debug mode for_ ' + message.author );
        if ( ( isDebug && toggle ) || ( !isDebug && !toggle ) ) {
          await msgToggle.edit( '_debug mode was already ' + strToggle + '_' );
          await msgToggle.react( '%F0%9F%A4%A6' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
          message.delete().catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
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
          fs.readFile( fsSettings, 'utf8', ( errRead, fileData ) => {
            if ( errRead ) { throw errRead; }
            fileData = JSON.parse( fileData );
            fileData[ bot ] = settings[ bot ];
            var strSettings = JSON.stringify( fileData );
            fs.writeFile( fsSettings, strSettings, ( errWrite ) => {
              if ( errWrite ) { throw errWrite; } else {
                 if ( isDebug ) {
                  msgToggle.edit( '_debug mode is now on_' );
                  msgToggle.react( '1%E2%83%A3' ).catch( errReact => { console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errReact ); } );
                } else {
                  msgToggle.edit( '_debug mode is now off_' );
                  msgToggle.react( '0%E2%83%A3' ).catch( errReact => { console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errReact ); } );
                }
                message.delete().catch( errDel => { console.log( 'Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errDel ); } );
              }
            } );
          } );
        }
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'edit' :
      if ( isAdmin || isOwner ) {
        var guild, channel, thisMessage;
        guild = message.client.guilds.find( 'id', message.guild.id );
        channel = guild.channels.find( 'id', message.channel.id );
        thisMessage = arrArgs[ 0 ];
        var strNewMsg = arrArgs.slice( 1 ).join( ' ' );
        channel.fetchMessage( thisMessage ).then( objMsg => {
          objMsg.edit( strNewMsg ).then( edited => {
            message.react( '%E2%9C%85' ).then( r => {
              message.client.setTimeout( function(){
                message.delete().catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
              }, 7500 );
            } ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
          }
          ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
        } );
      }
      else {
        message.react( '%E2%9D%8C' ).then( r => {
          message.client.setTimeout( function(){
            message.delete().catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
          }, 2500 );
        } ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
        message.author.send( 'I\'m sorry, ' + message.author.tag + ', but you can\'t edit my messages in the `' + message.guild.name + '` server.' )
          .then( dm => {
            message.react( '%E2%9C%85' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
          } ).catch( e => {
            message.react( '%E2%9D%8C' ).then( r => {
              message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
            } ).catch( e => {
              message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^ @here' );
              console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e );
            } );
            console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e );
          } );
      }
      break;
    case 'help' :
      message.author.lastMessage.react( '%E2%9C%85' ).catch( error => { console.error( error ) } );
      break;
    case 'about' :
//    case 'chat' :
    case 'config' :
    case 'define' :
    case 'disable' :
    case 'enable' :
    case 'eval' :
    case 'groups' :
    case 'install' :
    case 'inviteme' :
    case 'load' :
//    case 'log' :
//    case 'n00b' :
    case 'ping' :
    case 'prefix' :
//    case 'prune' :
    case 'register' :
    case 'reload' :
    case 'roll' :
    case 'say' :
    case 'server' :
    case 'unload' :
    case 'wblock' ://wikiblock
    case 'winfo' ://wikiinfo
    case 'wlink' ://wikilink
    case 'wlookup' ://wikilookup
    case 'wrclast' ://wiki recent changes
    case 'wuser' ://wikiuser
      if ( isDebug ) {
       client.channels.get( settings[ bot ].debug[ 0 ] ).send( 'is processing a `!' + command + '` command.' );
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    default : 
    // Do nothing
  }
} );

client.on( 'guildMemberAdd', ( member ) => {
  var guildID = member.guild.id;
  var objUser = member.user;
  var guildWelcomeMesages = {
    '153007361655570432': {//DDOwiki
      channel: '153007361655570432',
      banInviteNames: true,
      role: null,
      roleLog: null,
      message: 'Welcome to the **' + client.guilds.get( '153007361655570432' ).name + '** Discord server ' + member.user + ' (- @' + member.user.tag + ' -).  Please indicate if you are an editor of ' + client.guilds.get( '153007361655570432' ).name + ' by linking your bot (- Example `!wuser ' + ( ( member.user.nickname || member.user.bot ) || 'Example' ) + '` -).  If you\'re not an editor, please indicate you\'re a reader by typing `%roleme Reader`.  If you don\'t have an account and would like one, please create an account: <http://ddowiki.com/page/Special:UserLogin/signup?wpName=' + encodeURIComponent( member.user.username.replace( ' ', '_' ).replace( '%23', '#' ).replace( '%26', '&' ).replace( '%3F', '?' ) ) + '&wpRealName=' + encodeURIComponent( member.user.tag.replace( ' ', '_' ).replace( '%23', '#' ).replace( '%26', '&' ).replace( '%3F', '?' ) ) + '> - Thanks and welcome to the server!!!'
    },
    '337691947424546817': {//Dragon's Domain
      channel: '337691947424546817',
      banInviteNames: true,
      role: '500015818197958667',
      roleLog: null,
      message: 'Welcome to the **' + client.guilds.get( '337691947424546817' ).name + '** home to the __Fire of the Dragon\'s__ guild and our friends, ' + member.user + ' (- @' + member.user.tag + ' -)!'
    },
    '460060547023634442' : {// Templar
      channel: '460060547023634444',
      banInviteNames: true,
      role: null,
      roleLog: null,
      message: 'Welcome to the Discord server for **' + client.guilds.get( '460060547023634442' ).name + '** ' + member.user + ' (- @' + member.user.tag + ' -)!',
    },
    '516387336389394442' : {// Steiner's Realm
      channel: '516387336389394445',
      banInviteNames: true,
      role: null,
      roleLog: null,
      message: 'Welcome to the HPG Net for **' + client.guilds.get( '516387336389394442' ).name + '** ' + member.user + ' (- @' + member.user.tag + ' -)!  Please change your nickname to something that First Lord <@359043842269249547> would recognize with  `/nick Death to all Wobbies`.  Thanks and welcome to the server!',
    }
  };
  if ( guildWelcomeMesages[ guildID ] ) {
    var objGuildWelcome = guildWelcomeMesages[ guildID ];
    if ( isDebug ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '*is processing a **`guildMemberCreate`** event for: __' + objUser + '**#' + objUser.discriminator + '**__ in __**' + member.guild.name + '**__.*' );
    }
    client.user.setStatus( 'online' );
    isBotIdle = false;
    var channel = member.guild.channels.get( objGuildWelcome.channel );
    if ( !channel ) {
      channel = ( guildID || member.guild.channels.find( 'name', 'general' ).id || member.guild.channels.sort( function( a, b ){ return a.position - b.position; } ).first().id );
    }
    
    if ( guildWelcomeMesages[ guildID ].blockSpam || true ) {
      var strLowerUserName = objUser.username.toLowerCase();
      var arrSpamNames = ( strLowerUserName.match( /(((discord|paypal)\.(gg|me))|(twitch\.tv)|((facebook|instagram|paypal|reddit|twitter|youtube)\.com?))\//i ) || [] );
      if ( arrSpamNames.length >= 1 ) {
        if ( member.guild.members.get( member.id ).bannable ) {
          var strSpamFrom = arrSpamNames[ 0 ].replace( /\//, '' ).replace( /\.(com|gg|me)/, '' );
          strSpamFrom = strSpamFrom.slice( 0, 1 ).toUpperCase() + strSpamFrom.slice( 1 );
          member.ban( { days: 7, reason: strSpamFrom + ' invite spam(bot)' } )
            .then( objBan => { console.log( '%s: Banned %s (%s) from %s (%s)', strNow, objUser.tag, objUser.id, member.guild.name, guildID ); } )
            .catch( errBan => { console.error( '%s: Failed to ban %s (%s) from %s (%s): %o', strNow, objUser.tag, objUser.id, member.guild.name, guildID, errBan ); } );
        } else {
          console.error( '%s: Unable to ban%s (%s) from %s (%s)', strNow, objUser.tag, objUser.id, member.guild.name, guildID );
        }
      } else {
        channel.send( guildWelcomeMesages[ guildID ].message );
        if ( guildWelcomeMesages[ guildID ].role ) {
          member.addRole( guildWelcomeMesages[ guildID ].role, 'Give our newest member the starter role!' ).catch( console.error );
        }
      }
    }
  }
} );

client.on( 'guildCreate', async ( guild ) => {
//  const Invite = await guild.defaultChannel.createInvite( { maxAge: 120 } );
//  const inviteUrl = Invite.url;
  
  settings[ bot ].debug.forEach( function( log ){
    client.channels.get( log ).send( {
      embed: {
        title: ':arrow_right: Joined a guild named:',
//        description: ':arrow_right:\t[**' + guild.name + '**](' + inviteUrl + ')',
        description: ':arrow_right:\t**' + guild.name + '**',
        thumbnail: {
          url: guild.iconURL
        },
        color: 0x008000,
        fields: [
          {
          name: 'Founded on ... by ...',
          value: guild.createdAt.toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' - <@' + guild.ownerID + '> (' + guild.owner.user.bot + '#' + guild.owner.user.discriminator + ')'
          },
          {
          name: 'Members / Channels',
          value: guild.memberCount + ' / ' + guild.channels.size
          },
          {
          name: 'Region',
          value: guild.region
          }
        ],
      }
    } );
  } );
} );