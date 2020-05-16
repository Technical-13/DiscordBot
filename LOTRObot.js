const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const sqlite = require( 'sqlite' );
const fs = require( 'fs' );
const path = require( 'path' );
const fsSettings = 'settings.json';
const fsGuilds = 'guilds.json';
const fsUsers = 'users.json';
const settings = require( path.join( __dirname, '../' + fsSettings ) );
var jsonGuilds = require( path.join( __dirname, fsGuilds ) );
var jsonUsers = require( path.join( __dirname, fsUsers ) );
const strWikiName = ( bot === 'DDObot' ? 'DDOwiki' : 'LOTROwiki' );
const myWiki = settings[ bot ].wikis[ strWikiName.toLowerCase() ];
const wikiArticlePath = myWiki.root + myWiki.article;
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = function () { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
const exec = require( 'child_process' ).exec;
const puppeteer = require( 'puppeteer' );
const strScreenShotPath = path.join( __dirname, '/' );
const unirest = require( 'unirest' );

var idleMsg = false;
var enableSay = true;
var isDebug = settings[ bot ].onError.isDebugMode;//true;//
var isBotIdle = settings[ bot ].onError.isBotIdle;
var dcInfo = settings[ bot ].onError.dcInfo;
var dateCheckRoles = new Date( settings[ bot ].onError.dateCheckRoles );
const logBR = '\n\t\t\t\t-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n';

var strLogChan = {// List all the log channels in a single place here.  Part of a larger overhaul.
//  '': { serverName: '', logChan: { name: '', id: '' } },
  '201024322444197888': { serverName: 'The Lord of the Rings Discord', logChan: { name: 'bot-logs', id: '253534754350170112', fungeon: '235896771547627521', canLog: true } },
//  '': { serverName: 'Os Filhos de Húrin', logChan: { name: undefined, id: undefined, canLog: false } },
  '192775085420052489': { serverName: 'The Cat Cabin', logChan: { name: 'lord-of-the-rings-online', id: '347347432323153924', canLog: true } },
//  '': { serverName: 'One Last Time', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Raiders Of Rohan', logChan: { name: undefined, id: undefined, canLog: false } },
//  '464630580810612756': { serverName: 'LOTRO Arkenstone Discord', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Dances With Wargs', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Guerreros del Valhalla', logChan: { name: undefined, id: undefined, canLog: false } },
  '268414582677045250': { serverName: 'Dr.Mani\'s Place', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'pokemon', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Ones of the Valar', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Chicken deluxe', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Server Prueba', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Bubba\'s Place and Family', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Phobit|Youtube', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'LOTRO Mittelerdes Zukunft Sippe', logChan: { name: undefined, id: undefined, canLog: false } }
};

function remove( msgCollect, msgBot, objRemoveOptions ) {
  if ( isDebug ) { console.log( '%o: !test remove() options: %o', strNow(), objRemoveOptions ); }
  var boolOnly = false,
  intDelay = 5000,
  intDestroy = 900000,// Destroy collector in 15 minutes if untouched
  strDelConfirmed = '`[redacted]`',
  useReaction = '%F0%9F%97%91';
  if ( objRemoveOptions ) {
    if ( objRemoveOptions.boolOnly ) { boolOnly = objRemoveOptions.boolOnly; }
    if ( objRemoveOptions.intDelay ) { intDelay = objRemoveOptions.intDelay; }
    if ( objRemoveOptions.intDestroy ) { intDestroy = objRemoveOptions.intDestroy; }
    if ( objRemoveOptions.strDelConfirmed ) { strDelConfirmed = objRemoveOptions.strDelConfirmed; }
    if ( objRemoveOptions.useReaction ) { 
      let rxp = /<:(.*)?:([\d]*)>/;
      if ( rxp.test( objRemoveOptions.useReaction ) ) {
        useReaction = objRemoveOptions.useReaction.match( rxp )[ 2 ]; }
      else { useReaction = encodeURI( objRemoveOptions.useReaction ); }
    }
  }
  msgBot.react( useReaction );
  var reactedFilter = '';
  if ( boolOnly = true ) {
    reactedFilter = ( reaction, user ) => reaction.emoji.name === 'ðŸ—‘' && user.id === msgCollect.author.id;
  } else {
    reactedFilter = ( reaction, user ) => reaction.emoji.name === 'ðŸ—‘' && !user.bot;
  }
  const reacted = msgBot.createReactionCollector( reactedFilter, { time: intDestroy } );
  reacted.on( 'collect', async collectedReaction => {
    if ( !isDebug ) { console.log( '%o: !test remove() collectedReaction === %o', strNow(), collectedReaction ); }
    msgBot.delete().catch( errDel => {
      console.error( '%o: Failed to delete bot message: %o', strNow(), errDel );
    } );
    msgBot.channel.send( strDelConfirmed )
      .then( message => {
        message.delete( intDelay ).catch( errDelRedacted => {
          console.error( '%o: Failed to delete `[redacted]` message: %o', strNow(), errDelRedacted );
        } );
      } ).catch( errSendRedacted => {
        console.error( '%o: Failed to send `[redacted]` message: %o', strNow(), errSendRedacted );
      } );
      reacted.stop();
  } );
}

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

//async function getDefaultChannel( guildID ) {...}
/*const getDefaultChannel = async ( guildID ) => {
  if ( deconstructSnowflake( guildID ).type !== 'guild' ) {
    throw new Error( 'Failed to specify a valid guildID snowflake for getDefaultChannel()' );
  }//*//*
  const guild = client.guilds.get( guildID );
  var intChannelIndex, objChannel;
  var defaultChannel = { 'original': false, 'general': false, 'widget': false, 'systemChannelID': false, 'byPostition': false, 'byCreationIndex': false };
  defaultChannel.original = await ( guild.channels.has( guild.id ) ? guild.channels.get( guild.id ) : false );
defaultChannel.general = await ( guild.channels.exists( 'name', 'general' ) ? guild.channels.find( chan => { if ( chan.name === 'general' ) { return chan; } } ) : false );
  defaultChannel.widget = await guild.fetchInvites().then( async invites => {
    return await invites.filter( invite => invite.inviter !== undefined ).first().channel.id;
  } );
  if ( guild.channels.get( guild.systemChannelID ).permissionOverwrites.array()[ 0 ].deny === 0 ) {
    defaultChannel.systemChannelID = guild.systemChannelID;
  }
  intChannelIndex = 0;
  objChannel = {};
  do {
    objChannel = guild.channels.find( chan => { if ( chan.position === intChannelIndex ) { return chan; } } );
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
}//*/

function toBoolean( val ){
  val = ( typeof( val ) === 'string' ? val.toLowerCase() : val );
  var arrTrue = [ true, 'true', 1, '1', 'on', 'yes' ];
  return ( arrTrue.indexOf( val ) !== -1 ? true : false );
}

function getRand( intMin, intMax ) {
  if ( intMin === undefined ) { intMin = 1; }
  if ( intMax === undefined ) { intMax = 6; }
  let intRandom = Math.floor( Math.random() * ( intMax - intMin ) ) + intMin;
  console.log( '%o: getRand( %o, %o ) returning: %o', strNow(), intMin, intMax, intRandom );
  return intRandom;
}

async function getDuration( strTimestamp ) {
  const intTotalSeconds = Math.floor( ( ( new Date() ) - ( new Date( strTimestamp ) ) ) / 1000 );
  if ( strTimestamp == '0' ) { return -1; }
  else if ( intTotalSeconds <= 0 ) { return 0; }
  const arrDaysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  const intMonthIndex = parseInt( ( new Date( strTimestamp ) ).getMonth() );
  const intThisMonthIndex = parseInt( ( new Date() ).getMonth() );
  
  const intThisYear = parseInt( ( new Date() ).getFullYear() );
  const intThisMonth = parseInt( ( new Date() ).getMonth() + 1 );
  const intThisDate = parseInt( ( new Date() ).getDate() );
  const intThisHours = parseInt( ( new Date() ).getHours() );
  const intThisMinutes = parseInt( ( new Date() ).getMinutes() );
  const intThisSeconds = parseInt( ( new Date() ).getSeconds() );
  
  const intSecondOfThisDay = parseInt( ( ( ( intThisHours * 60 ) + intThisMinutes ) * 60 ) + intThisSeconds );
  const intSecondOfThisMonth = parseInt( ( intThisDate * 86400 ) + intSecondOfThisDay );
  const intSecondOfThisYear = parseInt( ( intThisMonth * arrDaysInMonth[ intThisMonthIndex ] * 86400 ) + intSecondOfThisMonth );
  
  const intYear = parseInt( ( new Date( strTimestamp ) ).getFullYear() );
  const intLeap = parseInt( ( intYear % 4 === 0 && intYear % 100 !== 0 ) || intYear % 400 === 0 );
  const intMonth = parseInt( ( new Date( strTimestamp ) ).getMonth() + 1 );
  const intDaysInMonth = parseInt( arrDaysInMonth[ intMonthIndex ] + ( intMonth === 2 ? intLeap : 0 ) );
  const intDate = parseInt( ( new Date( strTimestamp ) ).getDate() );
  
  const intSeconds = parseInt( ( 60 + ( intThisSeconds - ( new Date( strTimestamp ) ).getSeconds() ) ) % 60 );
  const intMinutes = parseInt( ( 60 + ( ( intThisMinutes - ( new Date( strTimestamp ) ).getMinutes() ) - ( intSeconds < intThisSeconds ? 0 : 1 ) ) ) % 60 );
  const intHours = parseInt( ( 24 + ( ( intThisHours - ( new Date( strTimestamp ) ).getHours() ) - ( intMinutes < intThisMinutes ? 0 : 1 ) ) ) % 24 );
  
  const intSecondOfDay = parseInt( ( ( ( intHours * 60 ) + intMinutes ) * 60 ) + intSeconds );
  const intSecondOfMonth = parseInt( ( intThisDate * 86400 ) + intSecondOfDay );
  const intSecondOfYear = parseInt( ( intThisMonth * arrDaysInMonth[ intMonthIndex ] * 86400 ) + intSecondOfMonth );
  
  const intDays = parseInt( ( ( intDaysInMonth + ( intThisDate - intDate ) ) % intDaysInMonth ) - 1 + ( intSecondOfThisDay >= intSecondOfDay ? 1 : 0 ) );
  const intMonths = parseInt( ( ( 12 + ( ( intThisMonth - intMonth ) - ( intThisMonth === intMonth ? ( intDate <= intThisDate ? 0 : 1 ) : 0 ) ) ) % 12 ) - 1 + ( intSecondOfThisMonth >= intSecondOfMonth ? 1 : 0 ) );
  const intYears = parseInt( ( ( intThisYear - intYear ) - ( intMonth < intThisMonth ? 0 : 1 ) ) - 1 + ( intSecondOfThisYear >= intSecondOfYear ? 1 : 0 ) );
  
  const boolSeconds = ( intSeconds > 0 ? true : false );
  const boolMinutes = ( intMinutes > 0 ? true : false );
  const boolHours = ( intHours > 0 ? true : false );
  const boolDays = ( intDays > 0 ? true : false );
  const boolMonths = ( intMonths > 0 ? true : false );
  const boolYears = ( intYears > 0 ? true : false );

  var strTimeString = '**';
  if ( boolYears ) {
    strTimeString += intYears + ' year' + ( intYears === 1 ? '' : 's' );
    if ( boolMonths + boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) {
      strTimeString += ', ';
    } else if ( boolMonths + boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolMonths ) {
    strTimeString += intMonths + ' month' + ( intMonths === 1 ? '' : 's' );
    if ( boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) {
      strTimeString += ', ';
    } else if ( boolYears && ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolDays ) {
    strTimeString += intDays + ' day' + ( intDays === 1 ? '' : 's' );
    if ( ( boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) ) {
      strTimeString += ', ';
    } else if ( boolYears && ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolHours ) {
    strTimeString += intHours + ' hour' + ( intHours === 1 ? '' : 's' );
    if ( boolMinutes && boolSeconds ) {
      strTimeString += ', ';
    } else if ( ( boolYears + boolMonths + boolDays >= 1 ) && ( boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolMinutes ) {
    strTimeString += intMinutes + ' minute' + ( intMinutes === 1 ? '' : 's' );
    if ( ( boolYears + boolMonths + boolDays + boolHours >= 1 ) && boolSeconds ) {
      strTimeString += ', and ';
    } else if ( boolSeconds ) {
      strTimeString += ' and ';
    }
  }
  if ( boolSeconds ) {
    strTimeString += intSeconds + ' second' + ( intSeconds === 1 ? '' : 's' );
  }
  strTimeString += '**';
  return strTimeString;
}

function sendDM( message, recipient, strContent ) {
  var arrAuthorized = settings[ bot ].owners.concat( settings[ bot ].moderators );
  recipient
    .send( strContent )
    .then( dmSent => {
      arrAuthorized.forEach( async authorizedID => {
        if ( authorizedID !== message.author.id ) {
          var objAuthorized = await client.fetchUser( authorizedID );
          objAuthorized.send( 'DM sent to ' + recipient + ' (' + recipient.tag + ') for ' + message.author + ' (' + message.author.tag + '):\n```\n' + strContent + '\n```\n' + strContent );
        }
      } );
      message.author.send( 'DM sent to ' + recipient + ' (' + recipient.tag + ') for you:\n```\n' + strContent + '\n```\n' + strContent );
    } ).catch( dmErr => {
      console.warn( 'Unable to DM message to %s (%s) for %s (%s): %o', strNow(), recipient.tag, recipient.id, message.author.tag, message.author.id, dmErr );
      arrAuthorized.forEach( async authorizedID => {
        if ( authorizedID !== message.author.id ) {
          var objAuthorized = await message.client.fetchUser( authorizedID );
          objAuthorized.send( 'Unable to DM ' + recipient + ' (' + recipient.tag + ') for ' + message.author + ' (' + message.author.tag + '): ' + dmErr + '\n```\n' + strContent + '\n```\n' + strContent );
        }
      } );
      message.author.send( 'Unable to DM ' + recipient + ' (' + recipient.tag + ') your message: ' + dmErr + '\n```\n' + strContent + '\n```\n' + strContent );
    } );
}

function hook( channel, title, message, color = 'FF0000', avatarURL = 'https://theme.zdassets.com/theme_assets/678183/af1a442f9a25a27837f17805b1c0cfa4d1725f90.png' ) {
  if ( !channel ) return console.warn( 'Webhook channel not specified.' );
  if ( !title ) return console.warn( 'Webhook title not specified.' );
  if ( !message ) return console.warn( 'Webhook message not specified.' );
  
  color = color.replace( /\s/g, '' );
  avatarURL = avatarURL.replace( /\s/g, '' );
  
  channel.fetchWebhooks()
    .then( webhook => {
      let foundHook = webhook.find( hook => { if ( hook.name === title || hook.name === 'Webhook' ) { return hook; } } );
      
      if ( !foundHook ) {
        channel.createWebhook( ( title || 'Webhook' ), avatarURL )
          .then( async webhook => {
            await webhook.send( '', {
              'username': title,
              'avatarURL': avatarURL,
              'embeds': [ {
                'color': parseInt( `0x${color}` ),
                'description': message
              } ]
            } )
            .catch( errSend => {
              console.error( 'hook(): %o', errSend );
              return channel.send( '**Check console, something went wrong with webhook.**' );
            } );
            webhook.delete();
          } );
      } else {
          foundHook.send( '', {
            'username': title,
            'avatarURL': avatarURL,
            'embeds': [ {
              'color': parseInt( `0x${color}` ),
              'description': message
            } ]
          } )
          .catch( errSend => {
            console.error( 'hook(): %o', errSend );
            return channel.send( '**Check console, something went wrong with webhook.**' );
          } );
      }
    } );
}

const objReactionEmoji = {
  'one': '1%EF%B8%8F%E2%83%A3', 'eight': '8%EF%B8%8F%E2%83%A3', 'five': '5%EF%B8%8F%E2%83%A3',
  'four': '4%EF%B8%8F%E2%83%A3', 'goggles': '%F0%9F%A5%BD', 'keycap_ten': '%F0%9F%94%9F',
  'nine': '9%EF%B8%8F%E2%83%A3', 'seven': '7%EF%B8%8F%E2%83%A3', 'six': '6%EF%B8%8F%E2%83%A3',
  'three': '3%EF%B8%8F%E2%83%A3', 'two': '2%EF%B8%8F%E2%83%A3', 'warning': '%E2%9A%A0%EF%B8%8F',
  'wastebasket': '%F0%9F%97%91%EF%B8%8F', 'wave': '%F0%9F%91%8B', 'white_check_mark': '%E2%9C%85',
  'x': '%E2%9D%8C', 'zany_face': '%F0%9F%A4%AA', 'zero': '0%EF%B8%8F%E2%83%A3',
  'techniCal': '575509342254792734', 'techniLERT': '575509343013830666'
}
/*async function getReactionEmoji( emoji ) {
  if ( objReactionEmoji[ emoji ] ) { return objReactionEmoji[ emoji ]; }
  else {
    var sendDM = await client.fetchUser( settings[ bot ].owners[ 0 ] );
    sendDM.send( 'Master, :' + emoji + ': (`:' + emoji + ':`) is not in objReactionEmoji.' ).catch( errSendDM => {
      console.error( '%o: Master, I was unable to DM you to tell you that %s is not in objReactionEmoji.', strNow(), emoji );
    } );
    return objReactionEmoji.techniCal;
  }
}//*/

async function processDuvodiad( wasForced ) {
  if ( wasForced === undefined ) { wasForced = false; }
  var guild = client.guilds.get( '201024322444197888' );
  await guild.roles.get( '448102416039018516' ).members.forEach( async function( member ) {
    var isOwner = await ( settings[ bot ].owners.indexOf( member.id ) !== -1 ? true : false );
    var isBotMod = await ( settings[ bot ].moderators.indexOf( member.id ) !== -1 ? true : false );
    var isCrown = ( member.id === guild.owner.user.id ? true : false );
    var isPSA = ( member.roles.find( role => { if ( role.name === 'PSA' ) { return role; } } ) ? true : false );
    var staffRole = await guild.roles.get( '201710935788748800' );
    var isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( member.id ) !== -1 ? true : false );
    var isKickable = ( member.kickable && !isOwner && !isBotMod && !isCrown && !isPSA && !isStaff ? true : false );
    var user = member.user;
    if ( !jsonUsers[ user.id ] || !jsonUsers[ user.id ].guilds[ guild.id ] ) {
      var isCrown = ( member.id === guild.owner.user.id ? true : false );
      var isAdmin = false;
      var objAdminRoles = [];
      guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { objAdminRoles[ objAdminRoles.length ] = role; }
      } );
      objAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( member.id ) !== -1 || member.id === guild.ownerID ) { isAdmin = true; }
      } );
      var sysopRole = guild.roles.get( '201710817614364673' );
      var isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( member.id ) !== -1 ? true : false );
      var modRole = guild.roles.get( '201710877143990272' );
      var isMod = await ( modRole && ( modRole.members.keyArray() ).indexOf( member.id ) !== -1 ? true : false );
      var staffRole = guild.roles.get( '201710935788748800' );
      var isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( member.id ) !== -1 ? true : false );
      var objAuthorPerms = ( guild.members.get( member.id ).permissions || ( new Discord.Permissions() ) );
      var canManageServer = ( objAuthorPerms.has( 'MANAGE_GUILD' ) ? true : false );
      var canManageRoles = ( objAuthorPerms.has( 'MANAGE_ROLES' ) ? true : false );
      var canInvite = ( objAuthorPerms.has( 'CREATE_INSTANT_INVITE' ) ? true : false );
      var thisGuild = { 'canManageRoles': canManageRoles, 'canManageServer': canManageServer,
        'intPoints': 0, 'dateLastPoints': ( new Date() ), 'isAdministrator': isAdmin, 'isCrown': isCrown,
        'ntag': ( member.nickname === null ? user.tag : member.nickname + '#' + user.discriminator ),
        'roles': ( member.roles.keyArray() || [] ) };
      if ( !jsonUsers[ member.id ] ) {
        var thisUser = { 'tag': user.tag, 'email': null, 'guilds': {}, 'intGlobalPoints': 0,
          'dateLastPoints': ( new Date() ), 'timezone': null };
        jsonUsers[ user.id ] = thisUser;
      }
      jsonUsers[ user.id ].guilds[ guild.id ] = thisGuild;
      let strJsonUsers = JSON.stringify( jsonUsers );
      fs.writeFile( fsUsers, strJsonUsers, ( errWrite ) => {
        if ( errWrite ) {
          client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( strNow() + ': Failed to save jsonUsers on message.' );
          throw errWrite;
        } else { console.log( '%o: Successfully saved jsonUsers with "%s" on processDuvodiad().', strNow(), thisGuild.ntag ); }
      } );
    }
    var objMessages = {
      'i7': 'Hello ' + user.username + '!  Accounts that are 7+ days without an assigned role in **' + guild.name + '** are frowned upon.  This allows us to catch accidental multiple accounts from people who try to use the website and then the app, for example, and isn\'t representative of you.  Please indicate to any member of `@Staff`, either in DM or in <#637272044056084480>, what server you play LotRO on, if you\'re on the server for lore, or any other dialog that may help them assign you a role to keep you from getting future `@Duvodiad` pings, a second notice at the 30+ day mark, and from being kicked from the server at the 60+ day mark.  Thanks, LOTROdiscord Staff.',
      'i30': 'Hello ' + user.username + '!  Accounts that are 30+ days without an assigned role in **' + guild.name + '** are strongly discouraged.  This allows us to catch accidental multiple accounts from people who try to use the website and then the app, for example, and isn\'t representative of you.  Please indicate to any member of `@Staff`, either in DM or in <#637272044056084480>, what server you play LotRO on, if you\'re on the server for lore, or any other dialog that may help them assign you a role to keep you from getting future `@Duvodiad` pings and from being kicked from the server at the 60+ day mark.  Thanks, LOTROdiscord Staff.',
      'i60': 'Hello **' + user.username + '**!  Accounts that are 60+ days without an assigned role in **' + guild.name + '** are not permitted.  This allows us to catch accidental multiple accounts from people who try to use the website and then the app, for example, and isn\'t representative of you.  You are welcome to rejoin the server at any time by visiting <https://discord.me/LOTROdiscord> from any browser and following the prompts.  If/When you rejoin the server, please indicate to any member of `@Staff`, either in DM or in <#637272044056084480>, what server you play LotRO on, if you\'re on the server for lore, or any other dialog that may help them assign you a role to keep you from getting future `@Duvodiad` pings, a first notice at the 7+ day mark, a second notice at the 30+ day mark, and from being kicked from the server at the 60+ day mark.  Sorry for any inconvience and we hope to see you back when you are ready!'
    };
    var isDuvodiad = true;// Has to be true since this is a list of members with the role --> guild.roles.get( '448102416039018516' ).members
    var hasSeven = await ( guild.roles.find( role => { if ( role.name === 'i7' ) { return role; } } ) && ( guild.roles.find( role => { if ( role.name === 'i7' ) { return role; } } ).members.keyArray() ).indexOf( user.id ) !== -1 );
    var hasThirty = await ( guild.roles.find( role => { if ( role.name === 'i30' ) { return role; } } ) && ( guild.roles.find( role => { if ( role.name === 'i30' ) { return role; } } ).members.keyArray() ).indexOf( user.id ) !== -1 );
    var hasSixty = await ( guild.roles.find( role => { if ( role.name === 'i60' ) { return role; } } ) && ( guild.roles.find( role => { if ( role.name === 'i60' ) { return role; } } ).members.keyArray() ).indexOf( user.id ) !== -1 );
    var intLengthOfStay = ( new Date() ).valueOf() - member.joinedAt.valueOf();
    var intDays = Math.floor( intLengthOfStay / 86400000 );
    var strDays = intDays.toString() + ( intDays >= 60 ? '*' : '' );
    if ( isDebug || wasForced ) { console.log('%o: i7: %o\ti30: %o\ti60: %o\tdaysOld: %o\tisKickable: %o\tID: %s\tTag: %s', strNow(), hasSeven, hasThirty, hasSixty, strDays, isKickable, user.id, user.tag ); }
    var strStaffChan = '201689362906218497';
    var msgID = ( jsonUsers[ user.id ].guilds[ guild.id ].welcomeID || null );
    if ( isDuvodiad && !user.bot && !hasSixty && intLengthOfStay >= ( 86400000 * 60 ) ) {
      await member.send( objMessages.i60 )
        .then( async dm => {
          await client.channels.get( strLogChan[ guild.id ].logChan.id ).send( ( member.nickname || user.username ) + '#' + user.discriminator + ' (' + member + ') :arrow_right: <@&453212243094536206> day inactivity message :mailbox_with_mail:' );
          if ( isKickable ) {            
            await member.addRole( guild.roles.find( role=> { if ( role.name === 'i60' ) { return role; } } ), 'User has had no roles assigned for 60+ days.' )
            .then( async roleAdded => {
              await member.kick( 'New account inactive 60+ days.' ).then( async kicked => {
                isDuvodiad = false; hasSeven = false; hasThirty = false;
                if ( isDebug || wasForced ) { console.log('%o: %s was kicked; welcome msgID: %o', strNow(), user.tag, msgID ); }
                if ( msgID !== null ) {
                  client.channels.get( '637272044056084480' ).fetchMessage( msgID )
                    .then( gotMsg => {
                      gotMsg.react( objReactionEmoji.wastebasket ).catch( errReact => { console.error( '%s: Unable to add :wastebasket: reaction to %s: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, errReact ); } );
                    } )
                    .catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message to add :wastebasket: (ID:%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg ); } );
                }
                await client.channels.get( strLogChan[ member.guild.id ].logChan.id ).send( ':boot:' + guild.roles.find( role => { if ( role.name === 'Moderators' ) { return role; } } ) + ', **I\'ve kicked ' + ( member.nickname || user.username ) + '#' + user.discriminator + ' (' + member + ') from the server for being a new account with no roles for 60+ days.  There are now ' + member.guild.members.size.toLocaleString() + ' members in this server.**' );
              } ).catch( async errKick => {
                console.error( '%o: Error attempting to kick %s: %o', strNow(), user.username, errKick );
                await client.channels.get( strLogChan[ member.guild.id ].logChan.id ).send( ':x:' + guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ', **I was unable to kick ' + ( member.nickname || user.username ) + '#' + user.discriminator + ' (' + member + ') from the server after sending <@&453212243094536206> day inactivity message.**\nPlease use kick reason `New account inactive 60+ days.` and react to this post with :boot:, thanks.' );
              } );
              hasSixty = true;
              if ( msgID !== null ) {
                ( await client.channels.get( '637272044056084480' ).fetchMessage( msgID ).catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message (ID:%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg ); } ) ).react( objReactionEmoji.seven ).catch( errReact => { console.error( '%o: Unable to add :seven: reaction to %s: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, errReact ) } );
              }
            } )
            .catch( async errAddRole => {
              console.error( '%o: Error attempting to add role `@i60` to %s ( %s ): %o', strNow(), user.username, user.id, errAddRole );
              await client.channels.get( strLogChan[ guild.id ].logChan.id ).send( ':x:' + guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ', **I was unable to assign ' + user.username + ' (' + member + ') to ' + guild.roles.find( role => { if ( role.name === 'i60' ) { return role; } } ) + ':** ' + errAddRole );
            } );
          }
        } )
        .catch( async errDM => {
          if ( errDM.code !== 50007 ) {
            console.error( '%o: Error attempting to DM %s ( %s ): %o', strNow(), user.username, user.id, errDM );
          } else {
            console.warn( '%s Error attempting to DM %s (%s): %o', strNow(), user.username, user.id, errDM.message );
          }
          await client.channels.get( strStaffChan ).send( guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ': ' + ( member.nickname || user.username ) + '#' + user.discriminator + ' (' + member + ') :arrow_right: <@&453212243094536206> day inactivity message :mailbox_with_no_mail:\nPlease attempt to send DM with:\n```\n' + objMessages.i60 + '\n```\nThen react to this post with :mailbox_with_mail: or :mailbox_with_no_mail: respectively.  Finally, kick with reason `New account inactive 60+ days.` and react to this post with :boot:, thanks.' ).catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having NOT received the 60 day msg: %o', strNow(), user.username, user.id, errLog ); } );
        } );
    }
    else if ( isDuvodiad && !user.bot && !hasThirty && intLengthOfStay >= ( 86400000 * 30 ) ) {
      await member.addRole( guild.roles.find( role => { if ( role.name === 'i30' ) { return role; } } ), 'User has had no roles assigned for 30+ days.' ).then( async roleAdded => {
        hasThirty = true;
        member.send( objMessages.i30 ).then( dmSent => {
          client.channels.get( strLogChan[ member.guild.id ].logChan.id ).send( user.username + ' (' + member + ') :arrow_right: <@&453212144394174477> day inactivity message :mailbox_with_mail:' )
            .catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having received the 30 day msg: %o', strNow(), user.username, user.id, errLog ); } );
        } ).catch( errDM => {
          console.error( '%o: Error attempting to DM %s ( %s ): %o', strNow(), user.username, user.id, errDM );
          client.channels.get( strLogChan[ member.guild.id ].logChan.id ).send( guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ': ' + user.username + ' (' + member + ') :arrow_right: <@&453212144394174477> day inactivity message :mailbox_with_no_mail:\n```\n' + objMessages.i30 + '\n```' )
            .catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having NOT received the 30 day msg: %o', strNow(), user.username, user.id, errLog ); } );
        } );
        if ( isDebug || wasForced ) { console.log('%o: %s is now @i30; welcome msgID: %o', strNow(), user.tag, msgID ); }
        if ( msgID !== null ) {
          console.log( '%o: Attempting to add :warning: reaction to %s welcome message - %s', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID );
          client.channels.get( '637272044056084480' ).fetchMessage( msgID )
            .then( gotMsg => {
              gotMsg.react( objReactionEmoji.warning ).catch( errReact => { console.error( '%o: Unable to add :warning: reaction to %s: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, errReact ); } );
            } )
            .catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message (ID:%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg ); } );
        }
      } ).catch( errAddRole => {
        console.error( '%o: Error attempting to add role `@i30` to %s ( %s ): %o', strNow(), user.username, user.id, errAddRole );
        client.channels.get( strLogChan[ member.guild.id ].logChan.id ).send( ':x:' + guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ', **I was unable to assign ' + user.username + ' (' + member + ') to ' + guild.roles.find( role => { if ( role.name === 'i30' ) { return role; } } ) + ':** ' + errAddRole )
          .catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having received the @i30 role: %o', strNow(), user.username, user.id, errLog ); } );
      } );
    }
    else if ( isDuvodiad && !user.bot && !hasSeven && intLengthOfStay >= ( 86400000 * 7 ) ) {
      await member.addRole( guild.roles.find( role => { if ( role.name === 'i7' ) { return role; } } ), 'User has had no roles assigned for 7+ days.' ).then( async roleAdded => {
        hasSeven = true;
        member.send( objMessages.i7 ).then( dmSent => {
          client.channels.get( strLogChan[ guild.id ].logChan.id ).send( user.username + ' (' + member + ') :arrow_right: <@&453212071480524821> day inactivity message :mailbox_with_mail:' )
            .catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having received the 7 day msg: %o', strNow(), user.username, user.id, errLog ); } );
        } ).catch( errDM => {
          console.error( '%o: Error attempting to DM %s ( %s ): %o', strNow(), user.username, user.id, errDM );
          client.channels.get( strLogChan[ member.guild.id ].logChan.id ).send( guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ': ' + user.username + ' (' + member + ') :arrow_right: <@&453212071480524821> day inactivity message :mailbox_with_no_mail:\n```\n' + objMessages.i7 + '\n```' )
            .catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having NOT received the 7 day msg: %o', strNow(), user.username, user.id, errLog ); } );
        } );
        if ( isDebug || wasForced ) { console.log('%o: %s is now @i7; welcome msgID: %o', strNow(), user.tag, msgID ); }
        if ( msgID !== null ) {
          console.log( '%o: Attempting to add :seven: reaction to %s welcome message - %s', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID );
          client.channels.get( '637272044056084480' ).fetchMessage( msgID )
            .then( gotMsg => {
              gotMsg.react( objReactionEmoji.warning ).catch( errReact => { console.error( '%o: Unable to add :warning: reaction to %s: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, errReact ); } );
            } )
            .catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message (ID:%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg ); } );
        }
      } ).catch( errAddRole => {
        console.error( '%o: Error attempting to add role `@i7` to %s ( %s ): %o', strNow(), user.username, user.id, errAddRole );
        client.channels.get( strLogChan[ member.guild.id ].logChan.id ).send( ':x:' + guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ', **I was unable to assign ' + user.username + ' (' + member + ') to ' + guild.roles.find( role => { if ( role.name === 'i7' ) { return role; } } ) + ':** ' + errAddRole )
          .catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having received the @i7 role: %o', strNow(), user.username, user.id, errLog ); } );
        } );
    }
    else if ( isDuvodiad && !user.bot && ( ( !hasSeven && intLengthOfStay >= ( 86400000 * 7 ) ) || ( hasSeven && !hasThirty && intLengthOfStay >= ( 86400000 * 30 ) ) || ( hasThirty && !hasSixty && intLengthOfStay >= ( 86400000 * 60 ) ) ) ) {
      if ( !hasSeven && intLengthOfStay >= ( 86400000 * 7 ) ) {
        member.addRole( guild.roles.find( role => { if ( role.name === 'i7' ) { return role; } } ), 'Restored lost `@i7` role.' )
          .then( async roleAdded => {
            client.channels.get( strLogChan[ guild.id ].logChan.id ).send( 'Restored ' + member + '#' + user.discriminator + ' (:id:' + member.id + ')\'s lost ' + guild.roles.find( role => { if ( role.name === 'i7' ) { return role; } } ) + ' role.' );
            if ( isDebug || wasForced ) { console.log('%o: %s is again @i7; welcome msgID: %o', strNow(), user.tag, msgID ); }
            if ( msgID !== null ) {
              console.log( '%o: Attempting to add :seven: reaction to %s welcome message - %s', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID );
              ( await client.channels.get( '637272044056084480' ).fetchMessage( msgID ).catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message (ID:%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg ); } ) ).react( objReactionEmoji.seven ).catch( errReact => { console.error( '%o: Unable to add :seven: reaction to %s: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, errReact ); } );
            }
          } ).catch( errAddRole => { console.error( '%o: Error attempting to add role `@i7` to %s ( %s ): %o', strNow(), user.username, user.id, errAddRole ); } );
      }
      if ( hasSeven && !hasThirty && intLengthOfStay >= ( 86400000 * 30 ) ) {
        member.addRole( guild.roles.find( role => { if ( role.name === 'i30' ) { return role; } } ), 'Restored lost `@i30` role.' )
          .then( async roleAdded => {
            client.channels.get( strLogChan[ member.guild.id ].logChan.id ).send( 'Restored ' + member + '#' + user.discriminator + ' (:id:' + member.id + ')\'s lost ' + guild.roles.find( role => { if ( role.name === 'i30' ) { return role; } } ) + ' role.' );
            if ( isDebug || wasForced ) { console.log('%o: %s is again @i30; welcome msgID: %o', strNow(), user.tag, msgID ); }
            if ( msgID !== null ) {
              console.log( '%o: Attempting to add :warning: reaction to %s welcome message - %s', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID );
              ( await client.channels.get( '637272044056084480' ).fetchMessage( msgID ).catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message (ID:%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg ); } ) ).react( objReactionEmoji.warning ).catch( errReact => { console.error( '%o: Unable to add :warning: reaction to %s: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, errReact ); } );
            }
          } ).catch( errAddRole => { console.error( '%o: Error attempting to add role `@i30` to %s ( %s ): %o', strNow(), user.username, user.id, errAddRole ); } );
      }
      if ( hasThirty && !hasSixty && intLengthOfStay >= ( 86400000 * 60 ) ) {
        member.addRole( guild.roles.find( role => { if ( role.name === 'i60' ) { return role; } } ), 'Restored lost `@i60` role.' )
          .then( async roleAdded => {
            client.channels.get( strLogChan[ guild.id ].logChan.id ).send( 'Restored ' + member + '#' + user.discriminator + ' (:id:' + member.id + ')\'s lost ' + guild.roles.find( role => { if ( role.name === 'i60' ) { return role; } } ) + ' role.' );
            if ( isDebug || wasForced ) { console.log('%o: %s is again @i60; welcome msgID: %o', strNow(), user.tag, msgID ); }
            if ( msgID !== null ) {
              console.log( '%o: Attempting to add :boot: reaction to %s welcome message - %s', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID );
              ( await client.channels.get( '637272044056084480' ).fetchMessage( msgID ).catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message (ID:%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg ); } ) ).react( objReactionEmoji.boot ).catch( errReact => { console.error( '%o: Unable to add :boot: reaction to %s: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, errReact ); } );
            }
          } ).catch( errAddRole => { console.error( '%o: Error attempting to add role `@i60` to %s ( %s ): %o', strNow(), user.username, user.id, errAddRole ); } );
      }
    }
//    else { /* Do nothing at this time */ }
  } );
  return true;
}

async function processAutoRoles( member ) {
  if ( typeof( member ) !== 'object' ) { member = await client.fetchUser( member.toString() ); }
  const guild = member.guild;
  const arrWorldRoles = [ '213328810269999114',// Bullroarer
    '460569121633992737', '460570446811758602', '460569393693327370', '460569481652076554', '460570146671689739',
    '460569474056323073', '460570361830965269', '460570500717084692', '460570587660681226', '460570869341618177',
    '506848072077410314', '510170073915195397' ];
  const arrPrimaryWorldRoles = [ '',//'213328810269999114',// Bullroarer
    '203267062787866626', '203267155683311616', '203266593394786304', '203266513640226817', '203267078139019265',
    '203266549971156994', '203267133499637760', '203266384451469312', '203266569038462977', '203267093372731392',
    '506848426768596992', '510168607549030430' ];
  const arrKinshipRoles = [ '205811655118946307', //Kinship Recruiters
    '205320328136622080', '205320393920217090', '205320421430525952', '205320446311268355', '205320473662193664',
    '205320493945847808', '205320514422439936', '205320581145427969', '205320551177256962', '205320620706234368',
    '506848250238861333', '510170153070362629' ];
  var isKinshipRecruiter = await ( member.roles.find( role => { if ( role.name === 'Kinship Recruiters' ) { return role; } } ) ? true : false );
  var saveNewUser = false;
  
  if ( Object.keys( jsonUsers ).indexOf( member.id ) === -1 ) {
    jsonUsers[ member.id ] = {
      'tag': member.user.tag,
      'email': null,
//            'facebook': null,
      'guilds': {},
      'intGlobalPoints': 0,
      'dateLastPoints': ( new Date() ),
//            'reddit': null,
//            'steam': null,
      'timezone': null,
//            'twitter': null,
//            'twitch': null,
//            'youtube': null
    };
    jsonUsers[ member.id ].guilds[ guild.id ] = {
      'canManageRoles': false,
      'canManageServer': false,
      'intPoints': 0,
      'dateLastPoints': ( new Date() ),
      'isAdministrator': false,
      'isCrown': false,
      'ntag': ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ),
      'roles': ( member.roles.keyArray() || [] )
    };
    saveNewUser = true;
  }
  if ( isDebug ) { console.log( '%o: processAutoRoles( %s ): %s\nisKinshipRecruiter: %o', strNow(), member.id, jsonUsers[ member.id ].guilds[ guild.id ].ntag, isKinshipRecruiter ); }
  
  var arrPrimaryWorlds = [];
  var arrWorlds = [];
  var arrKinships = [];
  
  await arrWorldRoles.forEach( function ( sfSecondary, intSecondary ) {
    if ( member._roles.indexOf( sfSecondary ) === -1 ) { arrWorlds.push( sfSecondary ); }
  } );
  
  await arrPrimaryWorldRoles.forEach( function( sfPrimary, intPrimary ) {
    if ( intPrimary > 0 && member._roles.indexOf( sfPrimary ) !== -1 ) {
      arrPrimaryWorlds.push( sfPrimary );
      var sfSecondary = arrWorldRoles[ intPrimary ];
      if ( member._roles.indexOf( sfSecondary ) === -1 ) {
        arrWorlds.push( sfSecondary );
      }
    }
  } );
  
  arrKinshipRoles.forEach( function( sfKinship, intKinship ) {
		if ( intKinship > 0 && member._roles.indexOf( sfKinship ) !== -1 ) {
      arrKinships.push( sfKinship );
			var sfSecondary = arrWorldRoles[ intKinship ];
			if ( member._roles.indexOf( sfSecondary ) === -1 ) {
				arrWorlds.push( sfSecondary );
			}
		}
  } );
  
  if ( !isKinshipRecruiter && arrKinships.length >= 1 ) {
    member.addRole( arrKinshipRoles[ 0 ], '- Added `@Kinship Recruiters` role for member with at least one `@ServerKin` role.' ).then( roleAdded => {
      jsonUsers[ member.id ].guilds[ guild.id ].roles = member.roles.keyArray();
      saveNewUser = true;
    } ).catch( errAddRole => {
      var isTimedOut = false, errReason = 'Unable to add';
      if ( errAddRole[ 'message' ] == 'Adding the role timed out.' ) { errReason = 'Timed out adding'; isTimedOut = true; }
      console.error( '%o: %s %s\'s `@Kinship Recruiters` role on %s:\n%o', strNow(), errReason, ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ), guild.name, ( isTimedOut ? '' : errAddRole ) );
    } );
  }
  else if ( isKinshipRecruiter && arrKinships.length === 0 ) {
    member.removeRole( arrKinshipRoles[ 0 ], '- Removed `@Kinship Recruiters` role for member with no `@ServerKin` roles.' ).then( roleRemoved => {
      jsonUsers[ member.id ].guilds[ guild.id ].roles = member.roles.keyArray();
      saveNewUser = true;
      if ( !isDebug ) {
        member.send( 'I\'ve automatically removed your `@Kinship Recruiters` role on **' + guild.name + '** due to the lack of a `@ServerKin` role.  If you believe this is incorrect, please go to <#201024322444197888> and ask a member of `@Staff` to give you the `@ServerKin` role for any LotRO game world where you are able to recruit members to your kinship.  Thank you.' ).catch( errDM => {
        guild.channels.get( '253534754350170112' ).send( guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + member + ' (**' + ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ) + '**) has me or the server blocked and was unable to be notified via DM that their `@Kinship Recruiters` role was removed.' );
        console.warn( '%o: %s (%s) has me or the server blocked and was unable to be notified via DM that their `@Kinship Recruiters` role was removed.', strNow(), member, member.tag );
        } );
      }
    } ).catch( errRemRole => {
      var isTimedOut = false, errReason = 'Unable to remove';
      if ( errRemRole[ 'message' ] == 'Removing the role timed out.' ) { errReason = 'Timed out removing'; isTimedOut = true; }
      console.error( '%o: %s %s\'s `@Kinship Recruiters` role on %s:\n%o', strNow(), errReason, ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ), guild.name, ( isTimedOut ? '' : errRemRole ) );
    } );
  }
  if ( arrWorlds.length === 1 ) {
    console.log( '%s: Adding role: %o', strNow(), arrWorlds[ 0 ] );
    /*member.addRole( arrWorlds[ 0 ], '- Added matching world role' ).catch( errAddRole => {
      var isTimedOut = false, errReason = 'Unable to add';
      if ( errAddRole[ 'message' ] == 'Adding the role timed out.' ) { errReason = 'Timed out adding'; isTimedOut = true; }
      console.error( '%o: %s %s\'s matching world role on %s:\n%o', strNow(), errReason, ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ), guild.name, ( isTimedOut ? '' : errAddRole ) );
    } );//*/
  }
  else if ( arrWorlds.length > 1 ) {
    console.log( '%s: Adding %i roles: %o', strNow(), arrWorlds.length, arrWorlds );
    /*member.addRoles( arrWorlds, '- Added matching world roles' ).catch( errAddRole => {
      var isTimedOut = false, errReason = 'Unable to add';
      if ( errAddRole[ 'message' ] == 'Adding the roles timed out.' ) { errReason = 'Timed out adding'; isTimedOut = true; }
      console.error( '%o: %s %s\'s matching world roles on %s:\n%o', strNow(), errReason, ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ), guild.name, ( isTimedOut ? '' : errAddRole ) );
    } );//*/
  }
  
  if ( arrPrimaryWorlds.length > 1 ) {
    var strTooManyMains = 'Hello ' + member.user.username + '!  You seem to have too many (' + arrPrimaryWorlds.length + ') __main__ servers defined.  Please indicate to any member of `@Staff`, either in DM, in <#637272044056084480>, or in <#201024322444197888>, which **1** server is your main server to play LotRO on.  If you play equally on multiple servers and/or don\'t want to specify only one **or** you don\'t play on any server, please let them know that as well and they\'ll assign your main server as `@No server`.  Thanks, LOTROdiscord Staff.';
    await member.send( strTooManyMains ).then( dmSent => {
      client.channels.get( strLogChan[ member.guild.id ].logChan.id )
      .send( member.user.username + ' (' + member + '#' + member.user.discriminator + ') :mailbox_with_mail:\n:arrow_right: Too many (' + arrPrimaryWorlds.length + ') *main* servers message\n:arrow_right::arrow_right: <@&' + arrPrimaryWorlds.join( '>\n:arrow_right::arrow_right: <@&' ) + '>' )
      .catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having received the too many (' + arrPrimaryWorlds.length + ') mains msg: %o', strNow(), member.user.username, member.id, errLog ); } );
    } ).catch( errDM => {
      console.error( '%o: Error attempting to DM %s ( %s ): %o', strNow(), member.user.username, member.id, errDM );
      client.channels.get( strLogChan[ member.guild.id ].logChan.id )
      .send( guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) +  member.user.username + ' (' + member + ') :mailbox_with_no_mail:\n:arrow_right: Too many (' + arrPrimaryWorlds.length + ') *main* servers message\n:arrow_right::arrow_right: <@&' + arrPrimaryWorlds.join( '>\n:arrow_right::arrow_right: <@&' ) + '>\n```\n' + strTooManyMains + '\n```' )
      .catch( errLog => { console.error( '%o: Error attempting to log %s ( %s ) as having NOT received the too many (' + arrPrimaryWorlds.length + ') mains msg: %o', strNow(), member.user.username, member.id, errLog ); } );
    } );
  }
  
  var isPSA = ( member.roles.find( role => { if ( role.name === 'PSA' ) { return role; } } ) ? true : false );
  var hasNoServer = ( member.roles.find( role => { if ( role.name === 'No server' ) { return role; } } ) ? true : false );
  var isDuvodiad = ( member.roles.find( role => { if ( role.name === 'Duvodiad' ) { return role; } } ) ? true : false );
  var hasSeven = ( member.roles.find( role => { if ( role.name === 'i7' ) { return role; } } ) ? true : false );
  var hasThirty = ( member.roles.find( role => { if ( role.name === 'i30' ) { return role; } } ) ? true : false );
  var hasSixty = ( member.roles.find( role => { if ( role.name === 'i60' ) { return role; } } ) ? true : false );
  if ( isDuvodiad && !isPSA && ( arrWorlds.length >= 1 || hasNoServer ) ) {
    await member.removeRole( '448102416039018516', '- Removed `@Duvodiad` role for member with other roles.' ).then( async roleRemoved => {
      jsonUsers[ member.id ].guilds[ guild.id ].roles = member.roles.keyArray();
      saveNewUser = true;
      member.send( 'Congratulations!  You are no longer considered a new member in *' + guild.name + '*!' ).catch( errDM => {
        guild.channels.get( '253534754350170112' ).send( guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ': ' + member + ' (**' + ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ) + '**) has me or the server blocked and was unable to be notified via DM that their `@Duvodiad` role was removed.' );
        console.warn( '%o: %s (ID:%s) has me or the server blocked and was unable to be notified via DM that their `@Duvodiad` role was removed.', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id );
      } );
      var msgID = ( jsonUsers[ member.id ] ? jsonUsers[ member.id ].guilds[ guild.id ].welcomeID : null );
      if ( msgID !== null ) {
        ( await client.channels.get( '637272044056084480' ).fetchMessage( msgID ).catch( errFetchMsg => {
          if ( errFetchMsg.code === 10008 ) { jsonUsers[ member.id ].guilds[ guild.id ].welcomeID = null; saveNewUser = true; }
          else {
            console.error( '%o: Unable to fetch %s\'s welcome message (ID:%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg );
          }
        } ) ).delete().then( isDeleted => { jsonUsers[ member.id ].guilds[ guild.id ].welcomeID = null; saveNewUser = true; } ).catch( async errDel => {
          console.error( '%o: Unable to delete %s\'s welcome message (ID:%s) from "%s" on removal of @Duvodiad role: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, guild.name, errDel );
          ( await client.channels.get( '637272044056084480' ).fetchMessage( msgID ).catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message (https://discordapp.com/channels/201024322444197888/637272044056084480/%s): %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, errFetchMsg ); } ) ).react( objReactionEmoji.wastebasket ).catch( errReact => { console.error( '%s: Unable to react to %s\'s welcome message (ID:%s) after failing to delete from "%s" on removal of @Duvodiad: %o', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag, msgID, guild.name, errReact ); } );
        } );
      }
    } ).catch( errRemRole => {
      console.log( '%s: errRemRole.code === %o', strNow(), errRemRole.code );
      if ( errRemRole.code === 10008 ) { jsonUsers[ member.id ].guilds[ guild.id ].welcomeID = null; saveNewUser = true; }
      else {
        console.error( '%o: There was an error attempting to remove the `@Duvodiad` role from %s (ID:%s): %o', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id, errRemRole );
      }
    } );
    if ( hasSeven ) { member.removeRole( '453212071480524821', 'Removing `@i7` role for user no longer a `@Duvodiad`.' ).then( roleRemoved => { jsonUsers[ member.id ].guilds[ guild.id ].roles = member.roles.keyArray(); saveNewUser = true; } ).catch( errRemRole => { console.error( '%o: There was an error attempting to remove the `@i7` role from %s (ID:%s): %o', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id, errRemRole ); } ); }
    if ( hasThirty ) { member.removeRole( '453212144394174477', 'Removing `@i30` role for user no longer a `@Duvodiad`.' ).then( roleRemoved => { jsonUsers[ member.id ].guilds[ guild.id ].roles = member.roles.keyArray(); saveNewUser = true; } ).catch( errRemRole => { console.error( '%o: There was an error attempting to remove the `@i30` role from %s (ID:%s): %o', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id, errRemRole ); } ); }
    if ( hasSixty ) { member.removeRole( '453212243094536206', 'Removing `@i60` role for user no longer a `@Duvodiad`.' ).then( roleRemoved => { jsonUsers[ member.id ].guilds[ guild.id ].roles = member.roles.keyArray(); saveNewUser = true; } ).catch( errRemRole => { console.error( '%o: There was an error attempting to remove the `@i60` role from %s (ID:%s): %o', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id, errRemRole ); } ); }
  }
  else if ( !isDuvodiad && !isPSA && arrPrimaryWorlds.length === 0 && !hasNoServer && !member.user.bot ) {
    await member.addRole( '448102416039018516', '- Added `@Duvodiad` role for member with no other server role.' ).then( roleAdded => {
      jsonUsers[ member.id ].guilds[ guild.id ].roles = member.roles.keyArray();
      saveNewUser = true;
      member.send( 'Welcome to *' + guild.name + '*!  You\'ve been automatically assigned the `@Duvodiad` role for the server. This means that, until you get in touch with `@Staff` in <#201024322444197888> to let them know which server you play on (or none), you\'ll be pinged every time another new player joins the server.' ).catch( errDM => {
        guild.channels.get( '253534754350170112' ).send( guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ': ' + member + ' (**' + ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ) + '**) has me or the server blocked and was unable to be notified via DM that they\'re now a member of `@Duvodiad`.' );
        console.warn( '%o: %s (ID:%s) has me or the server blocked and was unable to be notified via DM that the `@Duvodiad` role was added.', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id );
      } );
      guild.channels.get( strLogChan[ guild.id ].logChan.id ).send( guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) + ': ' + member + ' (**' + ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ) + '**) has been added to `@Duvodiad`.  This may be because the bot was down when they joined or because all their server roles were removed.  Please see if you can assist them with roles. :slight_smile:' );
    } ).catch( errAddRole => { console.error( '%o: There was an error attempting to add the `@Duvodiad` role to %s (ID:%s): %o', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id, errAddRole ); } );
  }
  
  if ( saveNewUser ) {
    strJsonUsers = JSON.stringify( jsonUsers );
    fs.writeFile( fsUsers, strJsonUsers, ( errWrite ) => {
      if ( errWrite ) {
        client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( strNow() + ': Failed to save "new user" on guild join.' );
        throw errWrite;
      } else { console.log( '%o: Successfully saved %s on processAutoRoles( %s ).', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id ); }
    } );
  }
}

async function nameCheck( mbrNew, mbrOld, checkType ) {
  if ( checkType === undefined ) { checkType = 'nickname'; }
  var guild = mbrNew.guild;
  var isPermitted = ( mbrNew.roles.keyArray().indexOf( '693020345162137610' ) !== -1 ? true : false );
  var isRedacted = ( mbrNew.roles.keyArray().indexOf( '692797584187588710' ) !== -1 ? true : false );
  var oldUser = mbrOld.user, newUser = mbrNew.user;
  var regexInvalidName = /([A-Z\u0400-\u042F]{3,}|[^ \w\u0400-\u04FF]{3,}|[^ -ÿ\u0400-\u04FF]+)/;
  var regexBadWords = /(ass ?w?hole|cock ?su(c|k)+(er|ing)|cunt|drug ?deal(er|ing|ah?)?|fuck(er|ing)?|ni[bg]{2}(ah?|er|ling))s?/gi;
  var useName = ( checkType = 'nickname' ? mbrNew.nickname : newUser.username );
  var isValidGoodName = ( regexInvalidName.test( useName ) || regexBadWords.test( useName ) ? true : false );
  if ( !isPermitted && ( ( checkType === 'nickname' && !isValidGoodName ) || ( checkType === 'username' && !isValidGoodName && !mbrNew.nickname ) ) ) {
    mbrNew.setNickname( '[redacted]', 'Redacting invalid ' + checkType + '.' )
      .then( isRedacted => {
        member.addRole( '692797584187588710', 'Invalid ' + checkType + '.' )
          .then( setNick => { member.send( ':name_badge: Your ' + checkType + ' in ' + guild.name + ' has been changed to `[redacted]` because `' + useName + '` was determined to ' + ( regexInvalidName.test( useName ) ? 'be inappropriate' : 'contain characters that are not properly rendered on most devices' ) + '.  Feel free to change or request a change or reset to your nickname to the server\'s staff.' ).catch( errDM => { console.error( '%o: Failed to DM %s#%s (:id:%s) that their ' + checkType + ' change to `%s` was invalid and they were instead set to `[redacted]` in %s.', strNow(), oldUser.username. oldUser.discriminator, mbrOld.id, useName, guild.name ); } ) } )
          .catch( errAddRole => { console.error( '%o: Error attempting to add role `@[redacted]` to %s ( %s ): %o', strNow(), newUser.username, member.id, errAddRole ); } );
      } )
      .catch( errSetNick => {
        if ( errSetNick.code === 50013 ) { console.warn( '%o: I don\'t have permission to set %s\'s ' + checkType + ' to `[redacted]` in %s', strNow(), oldUser.username, guild.name ); }
        else { console.error( '%o: Unable to set %s\'s ' + checkType + ' to `[redacted]`: %o', strNow(), oldUser.username, errSetNick ); }
      } );
    if ( ( client.guilds.get( '201024322444197888' ).roles.find( role => { if ( role.name === 'Level 3' ) { return role; } } ).members.keyArray() ).indexOf( mbrNew.id ) !== -1 ) {
      client.guilds.get( '201024322444197888' ).channels.get( '253534754350170112' )
        .send( ':name_badge: `' + ( mbrOld.nickname ? mbrOld.nickname : oldUser.username ) + '`\'s nickname was changed to `[redacted]` and they\'ve been added to <@&692797584187588710> because `' + useName + '` ' + ( regexInvalidName.test( useName ) ? 'was not appropriate' : 'contained characters that are not properly rendered on most devices' ) + '(' + mbrNew + ').' )
        .catch( errSend => { console.error( '%o: Unable to send message to %s#%s on nickname change: %o', strNow(), mbrNew.guild.name, client.guilds.get( '201024322444197888' ).channels.get( '253534754350170112' ).name, errSend ); } );
    }
  } else if ( isPermitted || mbrNew.nickname !== '[redacted]' ) {
    if ( isPermitted ) {
      mbrNew.removeRole( '693020345162137610', 'Nickname was permitted.' ).then( roleRemoved => { jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles = mbrNew.roles.keyArray(); } )
        .catch( errRemRole => { console.error( '%o: Error attempting to remove role `@Permitted` from %s ( %s ): %o', strNow(), newUser.username, mbrNew.id, errRemRole ); } );
    }
    if ( isRedacted ) {
      mbrNew.removeRole( '692797584187588710', 'Nickname is now valid.' ).then( roleRemoved => { jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles = mbrNew.roles.keyArray(); } )
        .catch( errRemRole => { console.error( '%o: Error attempting to remove role `@[redacted]` from %s ( %s ): %o', strNow(), newUser.username, mbrNew.id, errRemRole ); } );
    }
    client.guilds.get( '201024322444197888' ).channels.get( '253534754350170112' )
      .send( ':name_badge: `' + ( mbrOld.nickname ? mbrOld.nickname : oldUser.username ) + '`\'s nickname was ' + ( mbrNew.nickname ? 'changed to `' + mbrNew.nickname : 'cleared, and they\'re now known as `' + mbrNew.user.username ) + '` (' + mbrNew + ').' )
      .catch( errSend => { console.error( '%o: Unable to send message to %s#%s on nickname change: %o', strNow(), mbrNew.guild.name, client.guilds.get( '201024322444197888' ).channels.get( '253534754350170112' ).name, errSend ); } );
  }
  if ( !jsonUsers[ mbrNew.id ] || !jsonUsers[ mbrNew.id ].guilds[ guild.id ] ) {
    var isCrown = ( mbrNew.id === guild.owner.user.id ? true : false );
    var isAdmin = false;
    var objAdminRoles = [];
    guild.roles.array().forEach( function( role, index ) {
      if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { objAdminRoles[ objAdminRoles.length ] = role; }
    } );
    objAdminRoles.forEach( function( role, index ) {
      if ( ( role.members.keyArray() ).indexOf( mbrNew.id ) !== -1 || mbrNew.id === guild.ownerID ) {
        isAdmin = true;
      }
    } );
    var sysopRole = guild.roles.get( '201710817614364673' );
    var isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( mbrNew.id ) !== -1 ? true : false );
    var modRole = guild.roles.get( '201710877143990272' );
    var isMod = await ( modRole && ( modRole.members.keyArray() ).indexOf( mbrNew.id ) !== -1 ? true : false );
    var staffRole = guild.roles.get( '201710935788748800' );
    var isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( mbrNew.id ) !== -1 ? true : false );
    var objMemberPerms = ( await guild.fetchMember( mbrNew.id ).catch( errFetchMbr => { console.error( '%o: Unable to fetch member for %s (%s): %o', strNow(), mbrNew.user.tag, mbrNew.id, errFetchMbr ); } ) ).permissions;
    var canManageServer = ( objMemberPerms.has( 'MANAGE_GUILD' ) ? true : false );
    var canManageRoles = ( objMemberPerms.has( 'MANAGE_ROLES' ) ? true : false );
    var canInvite = ( objMemberPerms.has( 'CREATE_INSTANT_INVITE' ) ? true : false );
    var thisGuild = { 'canManageRoles': canManageRoles, 'canManageServer': canManageServer,
      'intPoints': 0, 'dateLastPoints': ( new Date() ), 'isAdministrator': isAdmin, 'isCrown': isCrown,
      'ntag': ( mbrNew.nickname === null ? mbrNew.user.tag : mbrNew.nickname + '#' + mbrNew.user.discriminator ),
      'roles': ( mbrNew.roles.keyArray() || [] ) };
    if ( !jsonUsers[ mbrNew.id ] ) {
      var thisUser = { 'tag': mbrNew.user.tag, 'email': null, 'guilds': {}, 'intGlobalPoints': 0,
        'dateLastPoints': ( new Date() ), 'timezone': null };
      jsonUsers[ mbrNew.id ] = thisUser;
    }
    jsonUsers[ mbrNew.id ].guilds[ guild.id ] = thisGuild;
  }
  else { jsonUsers[ mbrNew.id ].guilds[ guild.id ].ntag = ( mbrNew.nickname ? mbrNew.nickname + '#' + mbrNew.user.discriminator : mbrNew.user.tag ); }
  return true;
}
    
const client = new commando.Client( {
  unknownCommandResponse: settings[ bot ].unknownCommandResponse,
  owner: settings[ bot ].owners
} );

client.registry
  .registerGroups( [
    [ 'lotro', 'LotRO' ],
    [ 'contribs', 'Contributors' ],
    [ 'moderator', 'Moderation' ],
    [ 'random', 'Random' ],
    [ 'util', 'Utility' ],
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
  await processDuvodiad();
//  const guildLD = client.guilds.get( '201024322444197888' );
//  await guildLD.members.forEach( async member => { processAutoRoles( member ); } );
  Promise.all( [
    client.channels.get( settings[ bot ].debug[ 0 ] ).send( 'Bot processing start-up.' )
  ] ).then( () => {
//    client.user.setAFK( false ).catch( errSetAFK => { console.error( '%o: Error setting AFK to `false`: %o', strNow(), errSetAFK ); } ),
    client.user.setStatus( settings[ bot ].status ).catch( errSetS => { console.error( '%o: Error setting status to `%s`: %o', strNow(), settings[ bot ].status, errSetS ); } );
    client.user.setActivity( settings[ bot ].game );
  } ).then( () => {
    var readyTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
    console.log( '\n%s:\t%s is now ready to accept commands.\n', readyTime, settings[ bot ].name )
    if ( isDebug ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is now ready to accept commands at ' + readyTime + '._' );
    }
  } ).catch( errReady => {
    var strErrTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
    if ( isDebug ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( ':exclamation: _had an `error` at ' + strErrTime + ':_ `' + errReady + '`' );
    }
    if ( errReady.indexOf( 'ETIMEDOUT' ) !== -1 ) {
      console.error( '%o: Failed to connect to the Internet on: %o', strErrTime, errReady.split( ' ' )[ ( errReady.split( ' ' ).length - 1 ) ] );
    } else if ( errReady.indexOf( 'ENOTFOUND' ) !== -1 ) {
      console.error( '%o: Failed to connect to Discord on: %o', strErrTime, errReady.split( ' ' )[ ( errReady.split( ' ' ).length - 1 ) ] );
    } else {
      console.error( '%o: READY ERROR: %o', strErrTime, errReady );
    }
  } );
} );

client.on( 'disconnect', ( dc ) => {
  dcInfo = '_has disconnected at ' + strNow() + ' with:_ `' + dc + '`';
  console.log( '%o: I\'ve been disconnected with: %o', strNow(), dc );
} );

client.on( 'reconnecting', ( rc ) => {
  if ( isDebug ) {
    if ( !dcInfo ) {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_has reconnected at ' + strNow() + ' and is ready to accept commands._' );
    } else {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( dcInfo + '\n_and has reconnected at ' + strNow() + ' and is ready to accept commands._' );
    }
  }
  console.log( '%o: Reconnected:\n%s is now ready to accept commands.\n', strNow(), settings[ bot ].name );
} );

client.on( 'error', ( err ) => {
  if ( isDebug ) {
    client.channels.get( settings[ bot ].debug[ 0 ] ).send( ':exclamation: _had an `error` at ' + strNow() + ':_ `' + err + '`' );
  }
  console.error( '%o: ERROR: %o', strNow(), err );
  
  if ( err.code === 'ETIMEDOUT' ) {
    console.error( '%o, failed to connect to the Internet on: %o', strNow(), err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
  } else if ( err.code ===  'ENOTFOUND' ) {
    console.error( '%o, failed to connect to Discord on: %o', strNow(), err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
  } else {
    console.error( '%o: ERROR: %o', strNow(), err );
  }
} );

// 86400000 == 1 hr; 259200000 == 3 hrs; 345600000 == 4 hrs; 518400000 == 6 hrs; 691200000 == 8 hrs; 1036800000 == 12 hrs; 2073600000 == 1 day
client.setInterval( function() {// Idle processing
  if ( client.user.presence.game.name === 'restarting' ) {// While we're at it checking things every 5 minutes...
    client.user.setActivity( settings[ bot ].game );// If the game wasn't updated on restart, try to set it again.
  }
  
  if ( isBotIdle ) {// Set status - If the bot hasn't done anything in 10 minutes, set status to idle.
    if ( isDebug && idleMsg ) {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is idle_ :frowning2:' );
      console.log( 'I am idle, no-one loves me!' );
    }
    client.user.setStatus( 'idle' );
  } else {
    if ( isDebug && idleMsg ) {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_wasn\'t idle, but is now._ :frowning:' );
      console.log( 'I wasn\'t idle, but I am now!' );
    }
    client.user.setStatus( 'online' );
    isBotIdle = true;
  }
}, 300000 );// 300000ms == 5m
client.setInterval( async function() {// processAutoRoles() &&  processDuvodiad() once every three hours.
//  client.guilds.get( '201024322444197888' ).members.forEach( async member => { await processAutoRoles( member ); } );
  await processDuvodiad();
}, 259200000 );

async function doWelcome( guild, guildWelcomeMessages, member, objUser, saveNewUser ) {
  if ( isDebug ) { console.info( '%o: Processing doWelcome() for %s in %s', strNow(), objUser.username, guild.name ); }
  var guildID = guild.id;
  var objGuildWelcome = guildWelcomeMessages[ guildID ];
  var channel = guild.channels.get( objGuildWelcome.channel );
  if ( isDebug ) { console.info( '%o: Processing doWelcome() %s', strNow(), objUser.username, ( !channel ? 'with no welcome channel defined' : 'in #' + channel.name ) ); }
  if ( !channel ) {
    channel = ( guildID || guild.channels.find( chan => { if ( chan.name === 'general' ) { return chan; } } ).id || guild.channels.sort( function( a, b ) { return a.position - b.position; } ).first().id );
    if ( isDebug ) { console.info( '%o: Processing doWelcome() with no welcome channel defined for %s in %s', strNow(), objUser.username, guild.name, channel.name ); }
  }
  var didWelcome = await channel.send( objGuildWelcome.message )
    .catch( errSend => { console.error( '%o: Failed to send objGuildWelcome.message for %s (%s) in %s#%s: %o', strNow(), objUser.tag, objUser.id, guild.name, channel.name, errSend ); } );
  if ( objGuildWelcome.role ) {
    member.addRole( objGuildWelcome.role, ( objGuildWelcome.roleLog || 'Give our newest member the starter role!' ) )
      .then( roleAdded => {
        if ( jsonUsers[ member.id ].guilds[ guildID ].roles.indexOf( '203268031982338049' ) !== -1 ) {
          didWelcome.react( objReactionEmoji.zany_face ).catch( errReact => { console.error( '%o: Error reacting :zany_face: on rejoin in "%s": %o', strNow(), guild.name, errReact ); } );
        } else {
          didWelcome.react( objReactionEmoji.wave ).catch( errReact => { console.error( '%o: Error reacting :wave: on welcome in "%s": %o', strNow(), guild.name, errReact ); } );
        }
        jsonUsers[ member.id ].guilds[ guildID ].welcomeID = didWelcome.id;
        saveNewUser = true;
      } )
      .catch( errAddRole => { console.error( '%o: Failed to addRole for %s (%s): %o', strNow(), objUser.tag, objUser.id, errAddRole ); } );
  }
  return saveNewUser;
}

client.on( 'guildMemberAdd', async ( member ) => {
  var guild = member.guild;
  var guildID = guild.id;
//  var objGlobalBlacklist = require( '' );
//  var objBlacklist = objGlobalBlacklist[ guildID ];
  var objUser = member.user;
  var saveNewUser = false;
  if ( Object.keys( jsonUsers ).indexOf( member.id ) === -1 ) {
    jsonUsers[ member.id ] = {
      'tag': member.user.tag,
      'email': null,
//            'facebook': null,
      'guilds': {},
      'intGlobalPoints': 0,
      'dateLastPoints': ( new Date() ),
//            'reddit': null,
//            'steam': null,
      'timezone': null,
//            'twitter': null,
//            'twitch': null,
//            'youtube': null
    };
    jsonUsers[ member.id ].guilds[ guild.id ] = {
      'canManageRoles': false,
      'canManageServer': false,
      'intPoints': 0,
      'dateLastPoints': ( new Date() ),
      'isAdministrator': false,
      'isCrown': false,
      'ntag': ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ),
      'roles': ( member.roles.keyArray() || [] )
    };
    saveNewUser = true;
  }
  else if ( Object.keys( jsonUsers[ member.id ].guilds ).indexOf( guildID ) === -1 ) {
    jsonUsers[ member.id ].guilds[ guild.id ] = {
      'canManageRoles': false,
      'canManageServer': false,
      'intPoints': 0,
      'dateLastPoints': ( new Date() ),
      'isAdministrator': false,
      'isCrown': false,
      'ntag': ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ),
      'roles': ( member.roles.keyArray() || [] )
    };
    saveNewUser = true;
    console.log( '%o: Added guild to user in jsonUsers: %s: $o', strNow(), member.id, jsonUsers[ member.id ] );
    client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( 'Added guild to user in jsonUsers:\n```JSON\n' + JSON.stringify( jsonUsers[ member.id ] ) + '\n```' );
  }
  else {// Restore roles for returning member
    var nitroID = ( await guild.roles.find( role => { if ( role.name === 'Nitro Booster' ) { return role; } } ).id || null );
    if ( jsonUsers[ member.id ].guilds[ guildID ].roles.indexOf ( guildID ) !== -1 ) {
      jsonUsers[ member.id ].guilds[ guildID ].roles.splice( jsonUsers[ member.id ].guilds[ guildID ].roles.indexOf ( guildID ), 1 );
    }
    if ( nitroID ) { if ( jsonUsers[ member.id ].guilds[ guildID ].roles.indexOf( nitroID ) !== -1 ) {
      jsonUsers[ member.id ].guilds[ guildID ].roles.splice( jsonUsers[ member.id ].guilds[ guildID ].roles.indexOf ( nitroID ), 1 );
    } }
    if ( isDebug ) { console.log( '%o: Attempting to restore %o roles to %s:\n%o', strNow(), jsonUsers[ member.id ].guilds[ guildID ].roles.length, objUser.tag, jsonUsers[ member.id ].guilds[ guildID ].roles ); }
    member.addRoles( jsonUsers[ member.id ].guilds[ guildID ].roles, 'Restore roles for member on rejoin.  Welcome back!' )
      .then( rolesAdded => {
        guild.channels.get( strLogChan[ guildID ].logChan.id ).send( ':white_check_mark: I restored ' + jsonUsers[ member.id ].guilds[ guildID ].roles.length + ' roles for ' + member + ' on rejoin:\n<@&' + jsonUsers[ member.id ].guilds[ guildID ].roles.join( '>, <@&' ) + '>' ).catch( errSend => { console.error( '%o: Unable to notify %s that I restored roles for %s on rejoin: %o', strNow(), guild.name, jsonUsers[ member.id ].guilds[ guildID ].ntag, '<@&' + jsonUsers[ member.id ].guilds[ guildID ].roles.join( '>, <@&' ) + '>' ); } );
        console.error( '%o: Unable to restore roles for %s in %s on rejoin: %o', strNow(), jsonUsers[ member.id ].guilds[ guildID ].ntag, guild.name, '<@&' + jsonUsers[ member.id ].guilds[ guildID ].roles.join( '>, <@&' ) + '>' );
      } )
      .catch( errAddRoles => {
        guild.channels.get( strLogChan[ guildID ].logChan.id ).send( ':no_entry_sign: I was unable to restore ' + jsonUsers[ member.id ].guilds[ guildID ].roles.length + ' roles for ' + member + ' on rejoin:\n<@&' + jsonUsers[ member.id ].guilds[ guildID ].roles.join( '>, <@&' ) + '>' ).catch( errSend => { console.error( '%o: Unable to notify %s that I was unable to restore %o roles for %s on rejoin.', strNow(), jsonUsers[ member.id ].guilds[ guildID ].roles.length, guild.name, jsonUsers[ member.id ].guilds[ guildID ].ntag ); } );
        console.error( '%o: Unable to restore %o roles for %s in %s on rejoin: %o', strNow(), jsonUsers[ member.id ].guilds[ guildID ].roles.length, jsonUsers[ member.id ].guilds[ guildID ].ntag, guild.name, '<@&' + jsonUsers[ member.id ].guilds[ guildID ].roles.join( '>, <@&' ) + '>' );
      } );
  }
  var guildWelcomeMessages = {
    '201024322444197888': {// Official Unofficial Lord of the Rings Discord
      channel: '637272044056084480',
      antiSpam: true,
      role: '448102416039018516',// @Duvodiad
      roleLog: null,
      message: 'The **' + member.guild.name + '** welcomes ' + '<@&448102416039018516>' + ', ' + objUser + '**#**' + objUser.discriminator + ', and asks them to check out the <#447362687807127582> channel and notify `@Staff #server [#server...] [#other roles]` in this channel. *(' + member.guild.members.size.toLocaleString() + ')*'
    },
    '356790691206004736': {// Laurelin RP Group
      channel: '356790691206004737',
      antiSpam: true,
      role: null,
      roleLog: null,
      message: client.me + ' nathla ' + objUser + '**#**' + objUser.discriminator + ' anin sam n\'athrabeth.'
    },
    '203325138601508866': {// LotRO Wiki
      channel: '203325138601508866',
      antiSpam: false,
      role: null,
      roleLog: null,
      message: 'Welcome to the **' + member.guild.name + '** server ' + objUser + ' (- @' + objUser.tag + ' -).'+/*  Please indicate if you are an editor of ' + client.guilds.get( '203325138601508866' ).name + ' by linking your username (- Example `!wuser Example` -).  If you\'re not an editor, please indicate you\'re a reader by typing `%roleme Reader`.*/ ' Thanks and welcome to the server!!!'
      // If you don\'t have an account and would like one, please create an account: <https://lotro-wiki.com/index.php?title=Special:UserLogin&type=signup&wpCreateaccountMail=1&wpName2=' + encodeURIComponent( ( objUser.nickname || objUser.username ).replace( ' ', '_' ) ).replace( '%23', '#' ).replace( '%26', '&' ).replace( '%3F', '?' ) + '> - 
    },
    '201667758893563905': {// LotROstream
      channel: '201667758893563905',
      antiSpam: false,
      role: null,
      roleLog: null,
      message: objUser + ', Welcome to the **' + member.guild.name + '** Discord server!  You can find out what show each host does by typing the (case sensitive) name of the host preceeded by a bang (!).  For example, to see what shows `@Cordovan` hosts, type `!Cordovan` in the <#201667758893563905> channel.'
    },
    '217263579080949760': {// IcyWitchplays
      channel: '217263579080949760',
      antiSpam: true,
      role: null,
      roleLog: null,
      message: objUser + ', Welcome to **' + member.guild.name + '**!  Have a great time here :wink:!'
    },
    '464409721592479754': {// The Unofficial LOTRO RP Server
      channel: '464409722292797441',
      antiSpam: true,
      role: '464782643725336587',// ??
      roleLog: null,
      message: objUser + ', Welcome to **' + member.guild.name + '**, have a look at the <#464409828362551306> and enjoy your stay!'// and assign your roles,
    },
    '516615407843409920': {// Thunder Riders
      channel: '575348343790895114',
      antiSpam: false,
      role: null,//'519442002949963797',// @Kinship Friends♥
      roleLog: null,
      message: 'Hey there ' + objUser + ' and welcome to **' + member.guild.name + '**:tada::hugging::fireworks: Enjoy your stay here and have fun! :smiley: Take a look at the <#707372075148509197> channel for more information about our Discord and Kinship:sunny:If there\'s anything that you need help with, let us know :blush:'
    }
  };
  var objGuildWelcome = guildWelcomeMessages[ guildID ];
  if ( isDebug ) { console.log( '%s: Guild ID:%s is index %o in: %o', strNow(), guildID, Object.keys( guildWelcomeMessages ).indexOf( guildID ), Object.keys( guildWelcomeMessages ) ); }
  if ( Object.keys( guildWelcomeMessages ).indexOf( guildID ) !== -1 ) {
    if ( isDebug ) { console.log( '%o: guildID: %o; welcomeRole: %o; %s\'s roles:\n\t\t\t%o\n\twelcomeRole index: %o', strNow(), guildID, guildWelcomeMessages[ guildID ].role, objUser.tag, ( jsonUsers[ member.id ] ? jsonUsers[ member.id ].guilds[ guild.id ].roles : [ guildID ] ), ( jsonUsers[ member.id ] ? jsonUsers[ member.id ].guilds[ guild.id ].roles : [ guildID ] ).indexOf( guildWelcomeMessages[ guildID ].role ) ); }
    var isDoWelcome = ( guildWelcomeMessages[ guildID ].role ? ( jsonUsers[ member.id ].guilds[ guildID ].roles.indexOf( guildWelcomeMessages[ guildID ].role ) === -1 ? true : false ) : true );
    if ( isDebug ) { console.log( '%o: %s is%s a New Member in server.', strNow(), objUser.tag, ( isDoWelcome ? '' : ' NOT' ) ); }
    if ( isDoWelcome ) {
      if ( isDebug ) {
       client.channels.get( settings[ bot ].debug[ 0 ] ).send( '*is processing a **`guildMemberCreate`** event for: __' + objUser + '**#' + objUser.discriminator + '**__ in __**' + guild.name + '**__.*' );
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      
      if ( objGuildWelcome.antiSpam || true ) {
        var strLowerUserName = objUser.username.toLowerCase();
        var arrSpamNames = ( strLowerUserName.match( /(((discord|paypal)\.(gg|me))|(twitch\.tv)|((facebook|instagram|paypal|reddit|twitter|youtube)\.com?)|(bit.ly))\//i ) || [] );
        if ( arrSpamNames.length >= 1 ) {
          if ( guild.members.get( member.id ).bannable ) {
            var strSpamFrom = arrSpamNames[ 0 ].replace( /\//, '' ).replace( /\.(com|gg|me)/, '' );
            strSpamFrom = strSpamFrom.slice( 0, 1 ).toUpperCase() + strSpamFrom.slice( 1 );
            member.ban( { days: 7, reason: strSpamFrom + ' invite spam(bot)' } )
              .then( objBan => { console.log( '%o: Banned %s (%s) from %s (%s)', strNow(), objUser.tag, objUser.id, guild.name, guildID ); } )
              .catch( errBan => { console.error( '%o: Failed to ban %s (%s) from %s (%s): %o', strNow(), objUser.tag, objUser.id, guild.name, guildID, errBan ); } );
          } else {
            console.error( '%o: Unable to ban%s (%s) from %s (%s)', strNow(), objUser.tag, objUser.id, guild.name, guildID );
          }
        }
        else {
          if ( isDebug ) { console.info( '%s: %s does has antiSpam enabled, and %s didn\'t trigger it.', strNow(), guild.name, objUser.username ); }
          saveNewUser = doWelcome( guild, guildWelcomeMessages, member, objUser, saveNewUser );
        }
      }
      else {
        if ( isDebug ) { console.info( '%s: %s does not have antiSpam enabled.', strNow(), guild.name ); }
        saveNewUser = doWelcome( guild, guildWelcomeMessages, member, objUser, saveNewUser );
      }
    }
  }
//* Let's start building a collection for our users.
  if ( saveNewUser ) {
    strJsonUsers = JSON.stringify( jsonUsers );
    fs.writeFile( fsUsers, strJsonUsers, ( errWrite ) => {
      if ( errWrite ) {
        client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( strNow() + ': Failed to save "new user", ' + jsonUsers[ member.id ].guilds[ guild.id ].ntag + ', on guild join.' );
        throw errWrite;
      } else { console.log( '%o: Successfully saved "new user", %s, on guild join.', strNow(), jsonUsers[ member.id ].guilds[ guild.id ].ntag ); }
    } );
  }
} );

client.on( 'guildBanAdd', async ( guild, member ) => {
  if ( guild.id === '201024322444197888' ) {
    if ( strLogChan[ guild.id ] !== undefined ) {
      if ( strLogChan[ guild.id ].logChan.canLog ) {
        guild.channels.get( strLogChan[ guild.id ].logChan.id ).send( '<:banhammer:248447317617803264> __' + member.username + '**#**' + member.discriminator + '__ (ID:' + member.id + ') was banned from __' + guild.name + '__ (ID:' + guild.id + ').' );
      }
    } else {
      console.log( 'Unable to post guildBanAdd event for `' + guild.name + '` (ID:' + guild.id + ') with no log channel defined.' );
    }
  }
  console.log( member.username + '#' + member.discriminator + ' (ID:' + member.id + ') was banned from ' + guild.name + ' (ID:' + guild.id + ').' );
} );

client.on( 'guildBanRemove', async ( guild, member ) => {
  if ( guild.id === '201024322444197888' ) {
    if ( strLogChan[ guild.id ] !== undefined ) {
      if ( strLogChan[ guild.id ].logChan.canLog ) {
        guild.channels.get( strLogChan[ guild.id ].logChan.id ).send( '<:approved:510515835673247776> __' + member.username + '**#**' + member.discriminator + '__ (ID:' + member.id + ') was unbanned from __' + guild.name + '__ (ID:' + guild.id + ').' );
      }
    } else {
      console.log( 'Unable to post guildBanRemove event for `' + guild.name + '` (ID:' + guild.id + ') with no log channel defined.' );
    }
  }
  console.log( member.username + '#' + member.discriminator + ' (ID:' + member.id + ') was unbanned from ' + guild.name + ' (ID:' + guild.id + ').' );
} );

client.on( 'guildMemberRemove', async member => {
  const guild = member.guild;
  const guildID = guild.id;
  const objUser = member.user;
  const userID = objUser.id;
  var saveNewUser = false
  if ( Object.keys( jsonUsers ).indexOf( userID ) === -1 ) {
    jsonUsers[ userID ] = {
      'tag': member.user.tag,
      'email': null,
//            'facebook': null,
      'guilds': {},
      'intGlobalPoints': 0,
      'dateLastPoints': ( new Date() ),
//            'reddit': null,
//            'steam': null,
      'timezone': null,
//            'twitter': null,
//            'twitch': null,
//            'youtube': null
    };
    jsonUsers[ userID ].guilds[ guildID ] = {
      'canManageRoles': false,
      'canManageServer': false,
      'intPoints': 0,
      'dateLastPoints': ( new Date() ),
      'isAdministrator': false,
      'isCrown': false,
      'ntag': ( member.nickname === null ? objUser.tag : member.nickname + '#' + objUser.discriminator ),
      'roles': ( member.roles.keyArray() || [] )
    };
    saveNewUser = true;
    if ( isDebug ) { console.log( '%o: Added parting user to jsonUsers: %s: $o', strNow(), member.id, jsonUsers[ member.id ] ); }
  }
  else if ( Object.keys( jsonUsers[ userID ].guilds ).indexOf( guildID ) === -1 ) {
    jsonUsers[ userID ].guilds[ guildID ] = {
      'canManageRoles': false,
      'canManageServer': false,
      'intPoints': 0,
      'dateLastPoints': ( new Date() ),
      'isAdministrator': false,
      'isCrown': false,
      'ntag': ( member.nickname === null ? objUser.tag : member.nickname + '#' + objUser.discriminator ),
      'roles': ( member.roles.keyArray() || [] )
    };
    saveNewUser = true;
    console.log( '%o: Added guild to user in jsonUsers: %s: $o', strNow(), userID, jsonUsers[ userID ] );
    client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( 'Added guild to user in jsonUsers:\n```JSON\n' + JSON.stringify( jsonUsers[ userID ] ) + '\n```' );
  }
  var msgID = ( jsonUsers[ userID ].guilds[ guildID ].welcomeID ? jsonUsers[ userID ].guilds[ guildID ].welcomeID : null );
  var guildGoodByeMessages = {
    '201024322444197888': {// Unofficial Lord of the Rings Online Discord
      channel: '253534754350170112',// #bot-logs
      message: 'The **' + guild.name + '** says goodbye to ' + objUser + ' (-' + objUser.tag + '-). (Length of stay: ' + await getDuration( member.joinedTimestamp ) + ').'
    },
    '203325138601508866': {// LotRO-wiki
      channel: '248218901819686923',
      message: objUser + ' (-' + objUser.tag + '-) has left **' + guild.name + '**'
    },
    '201667758893563905': {// LotROstream
      channel: '201689295818457088',
      message: objUser + ' (-' + objUser.tag + '-) has left **' + guild.name + '**'
    }
  };
  if ( guildGoodByeMessages[ guildID ] ) {
    if ( isDebug ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '*is processing a **`guildMemberRemove`** event for: __' + objUser + '**#' + objUser.discriminator + '**__ in __**' + guild.name + '**__.*' );
    }
    client.user.setStatus( 'online' );
    isBotIdle = false;
    var channel = guild.channels.get( guildGoodByeMessages[ guildID ].channel );
    if ( !channel ) {
      channel = ( guildID || guild.channels.find( chan => { if ( chan.name === 'general' ) { return chan; } } ).id || guild.channels.sort( function( a, b ){ return a.position - b.position; } ).first().id );
    }    
    channel.send( guildGoodByeMessages[ guildID ].message );/*
    console.log( objUser.tag + ' left ' + guild.name + '. ' +
      ( new Date() ).toISOString() + ' - ' + ( new Date( member.joinedTimestamp ) ).toISOString() +
        ' = ' + Date().toValue() - Date( member.joinedTimestamp ).toValue() );//*/
  }
  if ( msgID !== null ) {
    await client.channels.get( '637272044056084480' ).fetchMessage( msgID ).then( gotMsg => {
      gotMsg.react( objReactionEmoji.wastebasket ).catch( errReact => { console.error( '%o: Error reacting on welcome message on part in "%s": %o', strNow(), guild.name, errReact ); } );
      gotMsg.delete( 1200 ).then( isDeleted => {
        jsonUsers[ userID ].guilds[ guildID ].welcomeID = null;
        saveNewUser = true;
      } ).catch( async errDel => {
        console.error( '%o: Unable to delete %s\'s welcome message (ID:%s) from "%s" on remove/quit: %o', strNow(), jsonUsers[ userID ].guilds[ guildID ].ntag, msgID, guild.name, errDel );        
      } );
    } ).catch( errFetchMsg => { console.error( '%o: Unable to fetch %s\'s welcome message (ID:%s): %o', strNow(), jsonUsers[ userID ].guilds[ guildID ].ntag, msgID, errFetchMsg ); } );
  }
  if ( saveNewUser ) {
    strJsonUsers = JSON.stringify( jsonUsers );
    fs.writeFile( fsUsers, strJsonUsers, ( errWrite ) => {
      if ( errWrite ) {
        client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( strNow() + ': Failed to save "new user" on guild part.' );
        throw errWrite;
      } else { console.log( '%o: Successfully saved "new user" on guild part.', strNow() ); }
    } );
  }
} );

client.on( 'guildMemberUpdate', async ( mbrOld, mbrNew ) => {
  var oldUser = mbrOld.user, newUser = mbrNew.user;
  var mbrUpdateReason = '';
  var mbrUpdateChanges = { removed: [], added: [] };
  var guild = mbrNew.guild;
  var jsonUserExists = ( Object.keys( jsonUsers ).indexOf( mbrNew.id ) !== -1 ? true : false );
  var jsonUserInGuildExists = ( jsonUserExists ? ( Object.keys( jsonUsers[ mbrNew.id ].guilds ).indexOf( guild.id ) !== -1 ? true : false ) : false );
  if ( mbrOld.guild.id === '201024322444197888' ) {
    if ( newUser.username !== oldUser.username ) {
      mbrUpdateReason = ' username change';
      var isGoodName = await nameCheck( mbrNew, mbrOld, 'username' );
    }
    else if ( mbrNew.nickname !== mbrOld.nickname ) {
      mbrUpdateReason = ' nickname change';
      var isGoodName = await nameCheck( mbrNew, mbrOld, 'nickname' );
    }
    else if ( mbrNew.roles.keyArray().sort() !== mbrOld.roles.keyArray().sort() ) {
      mbrUpdateReason = ' role change' + ( mbrNew.roles.keyArray().length - mbrOld.roles.keyArray().length === 1 ? '' : 's' );
      for ( var idRole in mbrOld.roles.keyArray() ) {
        if ( mbrNew.roles.keyArray().indexOf( mbrOld.roles.keyArray()[ idRole ] ) === -1 ) {
          mbrUpdateChanges.removed.push( mbrOld.roles.keyArray()[ idRole ] );
        }
      }
      for ( var idRole in mbrNew.roles.keyArray() ) {
        if ( mbrOld.roles.keyArray().indexOf( mbrNew.roles.keyArray()[ idRole ] ) === -1 ) {
          mbrUpdateChanges.added.push( mbrNew.roles.keyArray()[ idRole ] );
        }
      }
    if ( isDebug ) { console.log( '%o: Running processAutoRoles( mbrNew ) for %s.', strNow(), newUser.tag ); }
      var isAutoRoled = false;//processAutoRoles( mbrNew );//
      if ( !isAutoRoled ) {
        console.error( '%o: Failed to complete processAutoRoles( mbrNew ) for %s%s.', strNow(), newUser.tag, ( jsonUserInGuildExists ? '. Attempting to store changes to json anyway' : '' ) );
        if ( jsonUserInGuildExists ) { jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles = mbrNew.roles.keyArray(); }
      }
    }
  }
  if ( jsonUserInGuildExists ) {
    var nitroID = ( await guild.roles.find( role => { if ( role.name === 'Nitro Booster' ) { return role; } } ) ? await guild.roles.find( role => { if ( role.name === 'Nitro Booster' ) { return role; } } ).id : null );
    if ( jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles.indexOf ( guild.id ) !== -1 ) {
      jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles.splice( jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles.indexOf ( guild.id ), 1 );
    }
    if ( jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles.indexOf( nitroID ) !== -1 ) {
      jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles.splice( jsonUsers[ mbrNew.id ].guilds[ guild.id ].roles.indexOf ( nitroID ), 1 );
    }
  }
  strJsonUsers = JSON.stringify( jsonUsers );
  fs.writeFile( fsUsers, strJsonUsers, ( errWrite ) => {
    if ( errWrite ) {
      if ( strLogChan[ guild.id ].logChan.canLog ){
        guild.channels.get( strLogChan[ guild.id ].logChan.id )
          .send( 'Failed to save "new user" on guildMemberUpdate: ' + errWrite )
          .catch( errSend => { console.error( '%o: Unable to send message to %s#%s to notify the server I failed to save "new user" on guildMemberUpdate.', strNow(), guild.name, strLogChan[ guild.id ].logChan.name ); } );
      }
      console.error( '%o: Failed to save "new user" on guildMemberUpdate in %s: %o', strNow(), guild.name, errWrite );
    } else { console.log( '%o: Successfully saved jsonUsers with "%s" on guildMemberUpdate%s: %o', strNow(), ( mbrNew.nickname === null ? mbrNew.user.tag : mbrNew.nickname + '#' + mbrNew.user.discriminator ), mbrUpdateReason, ( mbrUpdateChanges.added + mbrUpdateChanges.removed === 0 ? '' : mbrUpdateChanges ) ); }
  } );
} );

client.on( 'messageUpdate', ( msgOld, msgNew ) => {
  if ( msgOld.guild ) {
    if ( msgOld.guild.id === '201024322444197888' ) {
      if ( strLogChan[ msgNew.guild.id ] !== undefined ) {
        if ( strLogChan[ msgNew.guild.id ].logChan.canLog ) {
          var msgAuthor = msgOld.author;
          if ( client.user.id !== msgAuthor.id && !msgAuthor.bot ) {
            var fsMsgUpdate = ( new Date() ).valueOf() + '.txt';
            var fpMsgUpdate = path.join( __dirname, '/msgUpdate/' + fsMsgUpdate );
            var doAttachment = false;
            var strChanges = '';
            if ( msgNew.content !== msgOld.content ) {
              strChanges += '\n**Message content changed:** ' +
                        '\n\n:x: ' + ( msgOld.content || '**`NULL`**' ) +
                        '\n:white_check_mark: ' + ( msgNew.content || '**`NULL`**' );
            }
            if ( msgNew.pinned !== msgOld.pinned ) {
              strChanges += '\n' + ( msgNew.pinned ? ':pushpin:' : ':x:' ) +
                        ' **Message was ' + ( msgNew.pinned ? '' : 'un' ) + 'pinned ' +
                        ( msgNew.pinned ? 'to' : 'from' ) + ' channel:** <#' + msgNew.channel.id + '>' +
                        '\n\n**Content:** ' + msgNew.content;
            }
            if ( msgNew.content === msgOld.content && msgNew.pinned === msgOld.pinned ) {
              strChanges += ':shrug: **Something changed**:\n\t:small_blue_diamond:It wasn\'t pinning\n\t:small_blue_diamond:Not a content change';/*\n\n\t:small_orange_diamond:Please check the console.*/
//              console.log( 'Old msg: %o\nNew msg: %o', msgOld, msgNew );
            }
            if ( strChanges.length > 2000 ) {
              console.log( '%o: Something changed and the description was greater than 2,000 characters!: %o', strNow(), strChanges );
              fs.writeFile( fpMsgUpdate, strChanges, ( errWrite ) => {
                if ( errWrite ) { console.error( '%o: Unable to write to %s.', strNow(), fsMsgUpdate ); }
              } );
              doAttachment = true;
              strChanges = 'Something changed and the description was greater than 2,000 characters!';
            }
            var objMsgUpdate = new Discord.RichEmbed()
              .setColor( doAttachment ? '#FF0000' : '#F2D201' )
              .setDescription( strChanges );
            objSendUpdateContent = ':warning: **' + msgAuthor.username + '**#' + msgAuthor.discriminator + '\'s message in <#' + msgOld.channel.id + '> was changed:';
            var objSendUpdate = { embed: objMsgUpdate };
            if ( doAttachment ) { objSendUpdate.files = [ { attachment: fpMsgUpdate, name: 'msgUpdate.txt' } ]; }
            client.channels.get( strLogChan[ msgNew.guild.id ].logChan.id ).send( objSendUpdateContent, objSendUpdate );
          }
        }
      } else {
        console.error( 'Unable to post messageUpdate event for `' + msgNew.guild.name + '` (ID:' + msgNew.guild.id + ') with no log channel defined.' );
      }
    }
  }
} );

client.on( 'messageDelete', ( msg ) => {
  if ( msg.guild ) {
    if ( msg.guild.id === '201024322444197888' ) {
      if ( strLogChan[ msg.guild.id ] !== undefined ) {
        if ( strLogChan[ msg.guild.id ].logChan.canLog ) {
          var msgAuthor = msg.author;
          if ( client.user.id !== msgAuthor.id && !msgAuthor.bot ) {
            var objMsgDelete = new Discord.RichEmbed()
              .setColor( '#FF0000' )
              .setDescription( ( msg || '**`NULL`**' ) );
            client.channels.get( strLogChan[ msg.guild.id ].logChan.id ).send( ':wastebasket: **' + msgAuthor.username + '**#' + msgAuthor.discriminator + '\'s message has been deleted from <#' + msg.channel.id + '>:', { embed: objMsgDelete } );
          }
        }
      } else {
        console.log( 'Unable to post messageDelete event for `' + msg.guild.name + '` (ID:' + msg.guild.id + ') with no log channel defined.' );
      }
    }
  }
} );

client.on( 'messageDeleteBulk', async ( msgs ) => {
  var msg = msgs.first();
  if ( msg.guild.id === '201024322444197888' && ( client.user.id !== msg.author.id && !msg.author.bot ) ) {
    if ( strLogChan[ msg.guild.id ] !== undefined ) {
      if ( strLogChan[ msg.guild.id ].logChan.canLog ) {
        var strMessages = '';
        await msgs.forEach( function( message ) {
          strMessages += '\n:' + ( message.pinned ? 'pushpin' : ( message.attachments.size > 0 ? 'package' : 'incoming_envelope' ) ) + ': ' + message.content;
        } );
        var objMsgDelete = new Discord.RichEmbed()
          .setColor( '#FF0000' )
          .setDescription( ( strMessages || '**`NULL`**' ) );
        var msgMsgBulkDel = await client.channels.get( strLogChan[ msg.guild.id ].logChan.id ).send( ':wastebasket: ' + msgs.size + ' of **' + msg.author.username + '**#' + msg.author.discriminator + '\'s message' + ( msgs.size === 1 ? 'has' : 's have' ) + ' been deleted from <#' + msg.channel.id + '>:', { embed: objMsgDelete } );
      }
    } else {
      console.log( 'Unable to post messageDeleteBulk event for `' + msg.guild.name + '` (ID:' + msg.guild.id + ') with no log channel defined.' );
    }
  }
} );

/*client.on( 'channelCreate', ( channel ) => {
  if ( isDebug ) {
    var strConsoleName;
    if ( channel.type === 'dm' ) {
      var strUser = ( channel.recipient.username || 'undefined' );
      strConsoleName = 'to "' + strUser + '"';
    } else if ( channel.type === 'text' || channel.type === 'voice' || channel.type === 'category' ) {
      strConsoleName = 'in the "' + channel.guild.name + '" guild named ' + ( channel.type == 'text' ? '#' : ( channel.type == 'voice' ? '+' : '' ) ) + channel.name;
    } else {
      console.log( channel.type );console.log( channel );// LOG channel.type LOG channel
      strConsoleName = '';
    }
    console.log( 'A' + ( channel.nsfw ? ' NSFW ' : ' ' ) + channel.type + ' channel ' + strConsoleName + ' was just created!' );
  }
  
  if ( channel.type !== 'dm' && channel.guild.id === '201024322444197888' ) {
    if ( strLogChan[ channel.guild.id ] !== undefined ) {
      if ( strLogChan[ channel.guild.id ].logChan.canLog ) {
        if ( isDebug ) {
          client.channels.get( settings[ bot ].debug[ 0 ] ).send( 'A' + ( channel.nsfw ? ' NSFW ' : ' ' ) + channel.type + ' channel ' + strConsoleName +' was just created in position #' + channel.position + '.' );
        }
        
        var objChanCreate = new Discord.RichEmbed()
          .setColor( '#008000' )
          .addField( 'Name', ( channel.type === 'text' ? '<#' + channel.id + '>' : ( channel.type === 'voice' ? '+' : '' ) + ( channel.type === 'dm' ? channel.recipient.username : channel.name ) ) )
          .addField( 'Type', channel.type, true )
          .addField( 'Position', channel.position, true )
          .addField( 'NSFW', ( channel.nsfw ? ':white_check_mark:' : ':x:' ), true );
        client.channels.get( strLogChan[ channel.guild.id ].logChan.id ).send( ':new::hash: A new channel was just created:', { embed: objChanCreate } );
      }
    } else {
      console.log( 'Unable to post channelCreate event for `' + channel.guild.name + '` (ID:' + channel.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'channelUpdate', ( oldChannel, newChannel ) => {
//console.log( oldChannel );console.log( ' ---> ---VVV ' );console.log( newChannel );
  if ( oldChannel.guild.id === '201024322444197888' ) {
    if ( strLogChan[ newChannel.guild.id ] !== undefined ) {
      if ( strLogChan[ newChannel.guild.id ].logChan.canLog ) {
        
        var strChanges = ( oldChannel.type == 'text' ? '#' : ( oldChannel.type == 'voice' ? '+' : '' ) ) + oldChannel.name + ' has been changed.';
        
        if ( newChannel.name !== oldChannel.name ) {
          strChanges += '\n\n\tThe name has been changed:';
          strChanges += '\n\t:x: ' + ( oldChannel.type == 'text' ? '#' : ( oldChannel.type == 'voice' ? '+' : '' ) ) + oldChannel.name;
          strChanges += '\n\t:white_check_mark: <#' + newChannel.id + '>'; 
        }
        
        if ( newChannel.topic !== oldChannel.topic ) {
          strChanges += '\n\n\tThe topic has been ';
          if ( newChannel.topic ) {
            strChanges += 'changed:\n\t:x: ' + ( oldChannel.topic || '`null`' );
            strChanges += '\n\t:white_check_mark: ' + newChannel.topic;
          } else {
            strChanges += 'cleared.';
          }
        }
        
    /*    if ( newChannel.position !== oldChannel.position ) {
          var intMoved = newChannel.position - oldChannel.position;
          strChanges += '\n\n\tThe channel has been moved ' + ( intMoved > 0 ? ':arrow_down: ' + intMoved : ':arrow_up: ' + ( intMoved * -1 ) );
          if ( newChannel.parentID !== oldChannel.parentID ) {
            if ( newChannel.parentID && oldChannel.parentID ) {
              strChanges += ' into category <#' + newChannel.parentID + '> from category <#' + oldChannel.parentID + '>.';
            } else if ( newChannel.parentID ) {
              strChanges += ' into category <#' + newChannel.parentID + '>.';
            } else {
              strChanges += ' from category <#' + oldChannel.parentID + '>.';
            }
          }
        }
        
        if ( newChannel.nsfw !== oldChannel.nsfw ) {
          strChanges += '\n\n\tThe channel has been ' + ( newChannel.nsfw ? '' : 'un' ) + 'marked as **NSFW**';
        }

    /*
        var boolPermissionsChanged = false;
        var strPermissionChanges = '\n\n\tThe permissions for the channel have been changed:';
        if ( newChannel.permissionOverwrites.size !== oldChannel.permissionOverwrites.size ) {
          boolPermissionsChanged = true;
          /* Figure out if new or old is bigger, iterate through the larger and see which roles/members don't exist in the smaller
          /* If more or less than the difference is found, iterate through the smaller to see which don't exist in the larger
          /* Lots of add/remove logic
        }
        oldChannel.permissionOverwrites.each( function( intIndex, objOverwrite ) {
          var objComplimentary = ( newChannel.permissionOverwrites.get( objOverwrite.id ) || null );
          if ( objComplimentary ) {
            if ( objOverwrite.allow !== objComplimentary.allow || objOverwrite.deny !== objComplimentary.deny ) {
              boolPermissionsChanged = true;
              strPermissionChanges += '\n\t:recycle: <@' + ( objOverwrite.type === 'role' ? '&' : '' ) + objOverwrite.id + '>';
            }
          } else {
            boolPermissionsChanged = true;
            strPermissionChanges += '\n\t:x: <@' + ( objOverwrite.type === 'role' ? '&' : '' ) + objOverwrite.id + '>';
          }
        } );
        if ( boolPermissionsChanged ) {
          strChanges += strPermissionChanges;
        }
        client.channels.get( strLogChan[ newChannel.guild.id ].logChan.fungeon ).send( strChanges );
      }
    } else {
      console.log( 'Unable to post channelUpdate event for `' + newChannel.guild.name + '` (ID:' + newChannel.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'channelDelete', ( channel ) => {
  if ( isDebug ) {
    var strConsoleName;
    if ( channel.type === 'dm' ) {
      var strUser = ( channel.recipient.username || 'undefined' );
      strConsoleName = 'to "' + strUser + '"';
    } else if ( channel.type === 'text' || channel.type === 'voice' || channel.type === 'category' ) {
      strConsoleName = 'in the "' + channel.guild.name + '" guild named ' + ( channel.type == 'text' ? '#' : ( channel.type == 'voice' ? '+' : '' ) ) + channel.name;
    } else {
      console.log( channel.type );console.log( channel );// LOG channel.type LOG channel
      strConsoleName = '';
    }
    console.log( 'A' + ( channel.nsfw ? ' NSFW ' : ' ' ) + channel.type + ' channel ' + strConsoleName + ' was just deleted from position #' + channel.position + '.' + ( channel.type === 'text' ? '  The topic was: ' + channel.topic : '' ) );
  }
  
  if ( channel.type !== 'dm' && channel.guild.id === '201024322444197888' ) {
    if ( strLogChan[ channel.guild.id ] !== undefined ) {
      if ( strLogChan[ channel.guild.id ].logChan.canLog ) {
        if ( isDebug ) {
        client.channels.get( strLogChan[ channel.guild.id ].logChan.id ).send( 'A' + ( channel.nsfw ? ' NSFW ' : ' ' ) + channel.type + ' channel ' + strConsoleName + ' was just deleted from position #' + channel.position + '.' + ( channel.type === 'text' ? '  The topic was: ' + channel.topic : '' ) );
        }
        
        var objChanDelete = new Discord.RichEmbed()
          .setColor( '#FF0000' )
          .addField( 'Name', ( channel.type === 'text' ? '#' : ( channel.type === 'voice' ? '+' : '' ) ) + ( channel.type === 'dm' ? channel.recipient.username : channel.name ) )
          .addField( 'Topic', ( channel.topic || '`null`' ) )
          .addField( 'Type', channel.type, true )
          .addField( 'Position', channel.position, true )
          .addField( 'NSFW', ( channel.nsfw ? ':white_check_mark:' : ':x:' ), true );
        client.channels.get( strLogChan[ channel.guild.id ].logChan.id ).send( ':wastebasket::hash: A channel was just deleted:', { embed: objChanDelete } );
      }
    } else {
      console.log( 'Unable to post channelDelete event for `' + channel.guild.name + '` (ID:' + channel.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'roleCreate', ( role ) => {
//  console.log( role );
  if ( role.guild.id === '201024322444197888' ) {
    if ( strLogChan[ role.guild.id ] !== undefined ) {
      if ( strLogChan[ role.guild.id ].logChan.canLog ) {
        client.channels.get( strLogChan[ role.guild.id ].logChan.fungeon ).send( role );
      }
    } else {
      console.log( 'Unable to post roleCreate event for `' + role.guild.name + '` (ID:' + role.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'roleUpdate', ( oldRole, newRole ) => {
//  console.log( oldRole + ' -> ' + newRole );
  if ( oldRole.guild.id === '201024322444197888' ) {
    if ( strLogChan[ oldRole.guild.id ] !== undefined ) {
      if ( strLogChan[ oldRole.guild.id ].logChan.canLog ) {
        client.channels.get( strLogChan[ oldRole.guild.id ].logChan.fungeon ).send( oldRole + ' -> ' + newRole );
      }
    } else {
      console.log( 'Unable to post roleUpdate event for `' + oldRole.guild.name + '` (ID:' + oldRole.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'roleDelete', ( role ) => {
//  console.log( role );
  if ( role.guild.id === '201024322444197888' ) {
    if ( strLogChan[ role.guild.id ] !== undefined ) {
      if ( strLogChan[ role.guild.id ].logChan.canLog ) {
        client.channels.get( strLogChan[ role.guild.id ].logChan.fungeon ).send( role );
      }
    } else {
      console.log( 'Unable to post roleDelete event for `' + role.guild.name + '` (ID:' + role.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'emojiCreate', ( emoji ) => {
//  console.log( '<' + ( emoji.requiresColons ? ':' : '' ) + emoji.name + ( emoji.requiresColons ? ':' : '' ) + emoji.id + '> was added to *' + emoji.guild.name + '*' );
  if ( emoji.guild.id === '201024322444197888' ) {
    if ( strLogChan[ emoji.guild.id ] !== undefined ) {
      if ( strLogChan[ emoji.guild.id ].logChan.canLog ) {
        client.channels.get( strLogChan[ emoji.guild.id ].logChan.fungeon ).send( '<' + ( emoji.requiresColons ? ':' : '' ) + emoji.name + ( emoji.requiresColons ? ':' : '' ) + emoji.id + '> was added to **' + emoji.guild.name + '**' );
      }
    } else {
      console.log( 'Unable to post emojiCreate event for `' + emoji.guild.name + '` (ID:' + emoji.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'emojiUpdate', ( oldEmoji, newEmoji ) => {
//  console.log( oldEmoji + ' -> ' + newEmoji );
  if ( oldEmoji.guild.id === '201024322444197888' ) {
    if ( strLogChan[ newEmoji.guild.id ] !== undefined ) {
      if ( strLogChan[ newEmoji.guild.id ].logChan.canLog ) {
        client.channels.get( strLogChan[ newEmoji.guild.id ].logChan.fungeon ).send( oldEmoji + ' -> ' + newEmoji );
      }
    } else {
      console.log( 'Unable to post emojiUpdate event for `' + newEmoji.guild.name + '` (ID:' + newEmoji.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'emojiDelete', ( emoji ) => {
//  console.log( '<' + ( emoji.requiresColons ? ':' : '' ) + emoji.name + ( emoji.requiresColons ? ':' : '' ) + emoji.id + '> was removed from *' + emoji.guild.name + '*' );
  if ( emoji.guild.id === '201024322444197888' ) {
    if ( strLogChan[ emoji.guild.id ] !== undefined ) {
      if ( strLogChan[ emoji.guild.id ].logChan.canLog ) {
        client.channels.get( strLogChan[ emoji.guild.id ].logChan.fungeon ).send( '<' + ( emoji.requiresColons ? ':' : '' ) + emoji.name + ( emoji.requiresColons ? ':' : '' ) + emoji.id + '> was removed from **' + emoji.guild.name + '**' );
      }
    } else {
      console.log( 'Unable to post emojiDelete event for `' + emoji.guild.name + '` (ID:' + emoji.guild.id + ') with no log channel defined.' );
    }
  }
} );//*/

client.on( 'guildCreate', async ( guild ) => {
  const guildBlackList = jsonGuilds.blacklist;
  const guildID = guild.id;
  if ( guildBlackList.indexOf( guildID ) !== -1 ) {
    var msgSent = false, leftGuild = false;
    var guildOwner = await guild.members.get( guild.ownerID );
    guildOwner
      .send( 'Hello!  Someone has requested that I join your server (' + guild.name + '); however, one of my bot moderators has forced me to part this server before.  In order for me to join this server again, you\'ll have to send a DM to my primary owner, <@' + settings[ bot ].owners[ 0 ] + '>, and request to have the server removed from my blacklist.  Sorry for any inconvience, have a nice day.' )
      .then( msgSent => { msgSent = true; } )
      .catch( errSend => {
        console.error( '%o: I was unable to DM the owner of %s (ID:%s), %s to let them know their server has been blacklisted: %o', strNow(), guild.name, guildID, guildOwner.tag, errSend );
      } );

    guild.leave()
      .then( guildLeft => {
        leftGuild = true;
        console.log( '%o:\tLeft blacklisted \'%s\' (ID:%s): %o', strNow(), guild.name, guild.id, guildLeft );
        var msgEmbed = new Discord.RichEmbed()
          .setColor( '#FF0000' )
          .setTitle( ':arrow_left: Left blacklisted guild named:' )
          .setThumbnail( guild.iconURL )
          .setDescription( ':arrow_left:\t**' + guild.name + '**' )
          .addField( 'Founded on ... by ...', guild.createdAt.toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' - <@' + guild.ownerID + '> (' + guild.owner.user.username + '#' + guild.owner.user.discriminator + ')' )
          .addField( 'Members / Channels', guild.memberCount + ' / ' + guild.channels.size )
          .addField( 'Region', guild.region );
        settings[ bot ].debug.forEach( function( log ){
          message.client.channels.get( log ).send( { embed: msgEmbed } );
        } );
      } )
      .catch( errLeave => {
        console.error( '%o: Error attempting to leave blacklisted \'%s\' (%s): %o', strNow(), guild.name, guild.id, errLeave );
      } );

    var arrAuthorized = settings[ bot ].owners.concat( settings[ bot ].moderators );
    arrAuthorized.forEach( async authorizedID => {
      if ( authorizedID !== author.id ) {
        var objAuthorized = await client.fetchUser( authorizedID );
        objAuthorized.send( 'I was requested to join blacklisted guild :id:' + guildID + ' (' + guild.name + ').  I ' + ( msgSent ? 'successfully sent' : 'failed to send' ) + ' the owner of the guild a DM explaining the guild is blacklisted, and then I ' + ( leftGuild ? 'left' : 'failed to leave' ) + ' the guild.' );
      }
    } );
  }
  else {
    if ( isDebug ) { client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is processing a `guildCreate` event_' ); }
    client.user.setStatus( 'online' );
    isBotIdle = false;
    var strGuildInviteLink = guild.name;
  //  const Invite = await guild.channels.get( getDefaultChannel( guildID ) ).createInvite( { maxAge: 0 } ).catch( error => { console.error( error ) } );
  //  if ( Invite.url !== null ) { strGuildInviteLink = ' [**' + guild.name + '**]( ' + Invite.url + ' )'; }
    var explicitContentFilter, region, verificationLevel;
    
    switch ( guild.explicitContentFilter ) {
      case 0  : explicitContentFilter = ":no_entry_sign::mag_right:"; break;// Don't scan any messages.      
      case 1  : explicitContentFilter = ":mag::bust_in_silhouette:";  break;// Scan messages from members without a role.      
      case 2  : explicitContentFilter = ":mag::family_mmgb:";         break;// Scan messages sent be all members.      
      default : explicitContentFilter = ":grey_question:" + guild.explicitContentFilter + ":grey_question:";
    };
    
    switch ( guild.region.replace( 'vip-', '' ) ) {
      case "brazil"     : region = ":flag_br: Brazil";         break;
      case "eu-central" : region = ":flag_eu: Central Europe"; break;
      case "hongkong"   : region = ":flag_hk: Hong Kong";      break;
      case "russia"     : region = ":flag_ru: Russia";         break;
      case "singapore"  : region = ":flag_sg: Singapore";      break;
      case "sydney"     : region = ":flag_au: Sydney";         break;
      case "us-central" : region = ":flag_us: US Central";     break;
      case "us-east"    : region = ":flag_us: US East";        break;
      case "us-south"   : region = ":flag_us: US South";       break;
      case "us-west"    : region = ":flag_us: US West";        break;
      case "eu-west"    : region = ":flag_eu: Western Europe"; break;
      default : region = ":grey_question: " + guild.region
    };
    
    switch ( guild.verificationLevel ) {
      case 0 : verificationLevel = ":new_moon_with_face:";   break;// None
      case 1 : verificationLevel = ":waning_crescent_moon:"; break;// Low
      case 2 : verificationLevel = ":last_quarter_moon:";    break;// Medium
      case 3 : verificationLevel = ":waxing_gibbous_moon:";  break;// (╯°□°）╯︵ ┻━┻
      case 4 : verificationLevel = ":full_moon:";            break;// ┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻
      default : verificationLevel = ":grey_question:" + guild.verificationLevel + ":grey_question:";
    };
    
    settings[ bot ].debug.forEach( log => {
      client.channels.get( log ).send( {
        embed: {
          title: ':arrow_right: Joined a guild named:',
          description: ':arrow_right:' + strGuildInviteLink,
          thumbnail: { url: guild.iconURL },
          color: 0x000080,
          fields: [
            { name: 'Created / Owner', value: guild.createdAt.toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' - <@' + guild.ownerID + '>#' + guild.owner.user.discriminator },
            { name: 'Members / Roles / Channels', value: guild.memberCount + ' / ' + guild.roles.size + ' / ' + guild.channels.size },
            { name: 'Moderation', value: verificationLevel + '\t|\t' + explicitContentFilter },
            { name: 'Region', value: region }
          ]
        }
      } );
    } );
    
  //* Let's start building a collection for our guilds.
    if ( Object.keys( jsonGuilds ).indexOf( guildID ) === -1 ) {
      jsonGuilds[ guildID ] = {
        'levels': {
          'doInactive': false,
          'doXP': false,
          'maxXP': undefined,
          'minXP': undefined,
          'msgChan': 'DM',
          'perHour': undefined,
          'perMin': undefined
        },
        'logChan': {
          'name': undefined,
          'id': undefined,
          'canLog': false
        },
        'serverName': guild.name,
        'welcome': {
          'antiSpam': false,
          'channel': undefined,
          'message': '{$user}, Welcome to **{$guild.name}**!  Have a great time here :wink:!',
          'role': null,
          'rolelog': null
        }
      };
      console.log( '%o: Added guild to jsonGuilds: %s: $o', strNow(), guildID, jsonGuilds[ guildID ] );
    }
  }
} );
//*/

/*client.on( 'guildDelete', async ( guild ) => {
  if ( isDebug ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is processing a `guildDelete` event_' );
  }
  client.user.setStatus( 'online' );
  isBotIdle = false;
  var strGuildInviteLink = guild.name;
  const Invite = await guild.channels.get( getDefaultChannel( guildID ) ).createInvite( { maxAge: 0 } ).catch( error => { console.error( error ) } );
  if ( Invite.url !== null ) {
    strGuildInviteLink = ' [**' + guild.name + '**]( ' + Invite.url + ' )';
  }
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
        title: ':arrow_left: Left a guild named:',
        description: ':arrow_left:\t' + strGuildInviteLink,
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
//*/

client.on( 'message', async ( message ) => {// Regular messages
  var saveNewUser = false;
  var isBot = message.author.bot;
  if ( !isBot ) {
    var guild = null;
    var arrAuthorized = settings[ bot ].owners.concat( settings[ bot ].moderators );
  /*  var strResponse = 'I\'m sorry, did you really just try to DM a bot?';
    if ( message.channel.type === 'dm' && !message.author.bot && arrAuthorized.indexOf( message.author.id ) === -1 ) {
      message.reply( strResponse )
      .then( sentDmReply => {
        arrAuthorized.forEach( async authorizedID => {
          var objAuthorized = await message.client.users.get( authorizedID );
          objAuthorized.send( 'I responded `' + strResponse + '` to a DM from ' + message.author + ' (' + message.author.tag + '):\n```\n' + message.content + '\n```' + message.content );
        } );
      } ).catch( errDmReply => {
        arrAuthorized.forEach( async authorizedID => {
          var objAuthorized = await message.client.users.get( authorizedID );
          objAuthorized.send( 'I was unable to respond to a DM from ' + message.author + ' (' + message.author.tag + '): ' + errDmReply + '\n```\n' + message.content + '\n```\n' + message.content );
        } );
      } );
    }//*/
    /* Section for message processing categorization */
    var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = await ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, isSysop = false, isMod = false, isStaff = false;
    var sysopRole = false, modRole = false, staffRole = false;
    var isMoorMaster = false, isMonsterPlayer = false;
    if ( message.guild ) {
      guild = message.guild;
      isCrown = ( message.author.id === guild.owner.user.id ? true : false );
      var arrAdminRoles = [];
      guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
      } );
      arrAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) { isAdmin = true; }
      } );
      sysopRole = await guild.roles.get( '201710817614364673' );
      isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      modRole = await guild.roles.get( '201710877143990272' );
      isMod = await ( modRole && ( modRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      staffRole = await guild.roles.get( '201710935788748800' );
      isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      isMoorMaster = await ( guild.roles.find( role => { if ( role.name === 'Moor Masters' ) { return role; } } ) && ( guild.roles.find( role => { if ( role.name === 'Moor Masters' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      isMonsterPlayer = await ( guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ) && ( guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
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
    var strArgs = arrArgs.join( ' ' );
    
    if ( arrArgs[ 0 ] !== undefined ) {
      var wikiLinks = [];
      var rawLinks = arrArgs.join( ' ' ).match( /(\[\[(.*?)\]\])*/g ).filter( aMatch => { if ( aMatch !== '' ) { return aMatch; }  } );
      rawLinks.forEach( rawLink => { wikiLinks.push( rawLink.replace( / /g, '_' ).replace( /[\[\]]/g, '' ) ); } );
      var rawTemplateLinks = arrArgs.join( ' ' ).match( /(\{\{(.*?)\}\})*/g ).filter( tMatch => { if ( tMatch !== '' ) { return tMatch; }  } );
      rawTemplateLinks.forEach( rawTemplateLink => { wikiLinks.push( 'Template:' + rawTemplateLink.replace( / /g, '_' ).replace( /[\{\}]/g, '' ) ); } );
  //    console.log( '%i wikiLink' + ( wikiLinks.length === 1 ? '' : 's' ) + ' found.', wikiLinks.length );    
      if ( message.author.id !== client.user.id && wikiLinks.length >= 1 ) {
        var strMessage = 'Wiki link' + ( wikiLinks.length === 1 ? '' : 's' ) + ' detected: ';
        var arrDoneLinks = [];
        wikiLinks.forEach( function( wikiLink, ndx ) {
          arrDoneLinks.push( wikiLink.toUpperCase() );
          strMessage += '\n\t__' + wikiLink.replace( '_', ' ' ) + '__ :link: <' + wikiArticlePath + wikiLink + '>';
        } );
        if ( arrDoneLinks.length >= 1 ) {
          message.channel.send( strMessage );
        }
      }
    }//*/
      
  /*    if ( message.author.id !== client.user.id && wikiLinks.length >= 1 ) {
        console.log( '%i wikiLink' + ( wikiLinks.length === 1 ? '' : 's' ) + ' found: %o', wikiLinks.length, wikiLinks );
        var strMessage = 'Wiki link' + ( wikiLinks.length === 1 ? '' : 's' ) + ' detected: ';
        var intDoneLinks = 0;
        for ( const wikiLink of wikiLinks ) {
          console.log( 'Looking up [[%s]]', wikiLink );
          await unirest.head( wikiArticlePath + wikiLink ).end( objPingTest => {
            console.log( 'Looking for page [[%s]] (%s): %i', wikiLink, ( wikiArticlePath + wikiLink ), objPingTest.code );
            if ( objPingTest.ok ) {
              strMessage += '\n\t__' + wikiLink.replace( '_', ' ' ) + '__ :link: <https://lotro-wiki.com/index.php/' + wikiLink + '>';
            }
            else if ( objPingTest.notFound ) {
              strMessage += '\n\t__' + wikiLink.replace( '_', ' ' ) + '__ was not found, search for it: <https://lotro-wiki.com/index.php?title=Special:Search&search=' + wikiLink.replace( '_', '+' ) + '>';
            }
            else {
              strMessage += '\n\tLotro-wiki returned a `' + objPingTest.code + '` and may be experiencing technical difficulties. (https://httpstatuses.com/' + objPingTest.code + ')';
            }
            intDoneLinks++;
          } );
        }
        if ( intDoneLinks >= 1 ) {
          console.log( 'SEND strMessage: %s', strMessage );
          message.channel.send( strMessage );
        }
      }
    }//*/
    
    if ( !command ) {
  //    client.channels.get( settings[ bot ].debug[ 0 ] ).send( '`command === ' + command + '` (type: `' + typeof( command ) + '`)' );
    } else if ( command.substr( 0, 1 ) === '!' ) {
      command = command.substr( 1 ).toLowerCase();
    }
    /* Section to filter chat in #pvmp on LOTROdiscord */
    // Channel == #shoemakers-fungeon == 235896771547627521
    // Channel == #pvmp == 389446825570074624
    // Role == @MonsterPlayer == 392108949782134784
    var strAcceptRules = settings[ bot ].customKeys.strAcceptRules;
    if ( guild ) {
      if ( guild.id === '201024322444197888' ) {
        var strRules = 'Thanks for your interest in chatting in the <#389446825570074624> channel of the LOTROdiscord server;' +
              ' however, there are some rules we will have to go over first.\n' +
              '\t:one: __Respect your fellow players so that they may respect you in turn.__\n' +
              '\t:two: __Everyone can have a frustrating day; be considerate and helpful.__\n' +
              '\t:three: __Express yourself in a sensible civil manner.__\n' +
              '\t:four: __We can help with existing gameplay but we are not SSG support.__\n' +
              '\t:five: __Notify ' + staffRole + ' if there are any issues and they\'ll respond appropriately.__\n' +
              'Got it?  If so, please accept the terms and respond in <#389446825570074624> with `!' + strAcceptRules + '`';
              
        if ( message.channel.id === '389446825570074624' && command !== strAcceptRules.toLowerCase() ) {
          if ( message.author.bot ) {/* Let's not trigger by bot (could open a loophole - deal with it later) */
            var msgLogged = client.channels.get( '253534754350170112' )
              .send( ':robot: ( ' + message.author + ' ) to <#' + message.channel.id + '>: ' + message.content )
          }
          else if ( isStaff || isMoorMaster ) {/* Let's not harrass @Staff or @Moor Masters */
            client.channels.get( '253534754350170112' ).send( '<:Eye_of_Sauron:389576184280776705> ( ' + message.author.tag + ' ) to <#' + message.channel.id + '>: ' + message.content );
          }
          else if ( !isMonsterPlayer ) {
            client.channels.get( '253534754350170112' )
              .send( '<:denied:389470413748699137> ( ' + message.author + ' ) to <#' + message.channel.id + '>: ' + message.content );
            if ( command == strAcceptRules.toLowerCase() ) {
              message.reply( 'sorry, but the "magic word" **IS** case sensitive.  Try again!' );
            } else {
              message.author.send( strRules + '\n\n**Your comment to copy and paste in after accepting the conditions:**\n\n\t`' + message.content + '`' )
                .then( dm => {
                  message.react( objReactionEmoji.white_check_mark ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
                } ).catch( e => {
                  message.react( objReactionEmoji.x ).then( r => {
                    message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
                  } ).catch( e => {
                    message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^ <@&201710935788748800> <@&449348961787052032> <@&392105529411108864>' );
                    console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e );
                  } );
                  console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e );
                } );
            }
            message
              .delete( { reason: 'Not authorized to speak in channel.' } )
              .catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
          }
          else {
            client.channels.get( '253534754350170112' ).send( '<:approved:510515835673247776> ( ' + message.author + ' ) to <#' + message.channel.id + '>: ' + message.content );
            /* Do nothing */
          }
        } 
      }
    }
    
    switch ( command ) {
      case 'dv' : case 'dver' :
        if ( isOwner || isBotMod ) {
          message.reply( 'I\'m running Discord.js v'+ Discord.version + ' → <https://discord.js.org/#/docs/main/' + Discord.version + '/general/welcome>' );
          message.delete().catch( errDel => { console.error( '%o: Unable to delete !%s request by %s: %o', strNow(), command, message.author.tag, errDel ); } );
        }
        break;
      case 'apvmp' :// Change the #pvmp password to speak.
        if ( isOwner || isBotMod || isCrown || isAdmin || isSysop || isMod ) {
          if ( arrArgs[ 0 ] !== undefined ) {
            strAcceptRules = arrArgs[ 0 ];
            settings[ bot ].customKeys.strAcceptRules = strAcceptRules;
            strSettings = JSON.stringify( settings );
            fs.writeFile( fsSettings, strSettings, ( errWrite ) => {
              if ( errWrite ) {
                message.channel.send( 'Unable to change `strAcceptRules`, please check the error logs. Currently set to: **`' + strAcceptRules + '`**' );
                throw errWrite;
              } else {
                message.channel.send( ( message.guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) || message.author ) + ': `strAcceptRules` is now set to: **`' + strAcceptRules + '`** by: ' + message.author );
              }
            } );
          } else {
            message.channel.send( ( message.guild.roles.find( role => { if ( role.name === 'Staff' ) { return role; } } ) || message.author ) + ': `strAcceptRules` is set as: **`' + strAcceptRules + '`**.' );
          }
        } else {
          message.channel.send( 'Nice try, ' + message.author + ', but you\'re not my master.' );
        }
        break;
      case strAcceptRules.toLowerCase() :// Someone uttered the password, let them speak!
        if ( message.channel.id === '389446825570074624' ) {// #pvmp
          if ( message.guild.members.get( message.author.id ).roles.keyArray().indexOf( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ).id ) === -1 ) {
            message.delete( { reason: message.author + ' has accepted the rules of the channel by using the `!' + strAcceptRules + '` command.' } ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
            message.guild.members.get( message.author.id ).addRole( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ), '- ' + message.author.tag + ' has promised to not to be a dick.' );
            message.channel.send( message.author + ' has promised to not violate Wheaton\'s Law and may now speak.' );
          }
          else {
            message.delete( { reason: 'Cleaning up a DICKish `!' + strAcceptRules + '` in the wrong channel.' } ).catch( errDel => { console.error( '%o: %o', strNow(), errDel ); } );
            message.channel.send( message.author + ' you already have ' + message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ) + ', and I don\'t think your shenanigans are funny!' );
          }
        }
        else if ( message.channel.id === '201689362906218497' || message.channel.id === '235896771547627521' ) {// #staff-room or #fungeons
          message.react( objReactionEmoji.white_check_mark ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
          message.channel.send( strRules );
        }
        else {
          message.delete( { reason: 'Cleaning up a salty `!' + strAcceptRules + '` in the wrong channel.' } ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
          message.channel.send( 'Sorry, ' + message.author + ', but this isn\'t the right channel for that.' );
        }
        break;
      case 'pvpmp' :
      case 'pvmpmp' :// Staff has overridden the need for the person to utter the magic word.
        if ( message.channel.id === '389446825570074624' && isStaff ) {// #pvmp && @Staff
          if ( arrArgs[ 0 ] !== undefined ) {
            if ( arrArgs[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] ) {
              let usrMarancil = message.guild.members.get( arrArgs[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] );
              usrMarancil.addRole( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ), '- User was a given an override by ' + message.author.tag + '.' );
              message.react( '510515835673247776' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
              message.channel.send( '<:approved:510515835673247776> ' + usrMarancil + ' has been given special permission by ' + message.author + ' and may now speak in this channel.' );
              message.delete().catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
            }
          }
          else {
            message.delete( { reason: 'Cleaning up a staffer\'s `!' + command + '` missing a user.' } ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
            message.channel.send( 'Sorry, ' + message.author + ', but you forgot to tell me who was a naughty.' );
          }
        } else {
          message.author.send( 'The **`!' + command + '`** command needs to be triggered by a **' + staffRole.name + '** member (which you are' + ( isStaff ? '' : ' **not**' ) + ') in the <#389446825570074624> channel and not in <#' + message.channel.id + '>.' );
        }
        break;
      case 'pvpban' :
      case 'pvmpban' :
        if ( message.channel.id === '389446825570074624' && ( isStaff || isMoorMaster ) ) {// #pvmp && @Staff || @Moor Masters
          if ( arrArgs[ 0 ] !== undefined ) {
            if ( arrArgs[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] ) {
              let usrDick = message.guild.members.get( arrArgs[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] );
            message.channel.overwritePermissions( usrDick, { SEND_MESSAGES: false, ADD_REACTIONS: false }, 'User was a dick and ' + message.author.tag + ' had me channel ban them.' ).catch( permError => { console.error( 'Error trying to overwritePermissions for %o: %o', usrDick.id, permError ); } );
              usrDick.removeRole( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ), '- User was a dick and ' + message.author.tag + ' had me remove this role.' ).then( roleRemoved => { jsonUsers[ member.id ].guilds[ guild.id ].roles = member.roles.keyArray(); saveNewUser = true; } ).catch( errRemRole => { console.error( '%s: Unable to remove role "MonsterPlayer" from %s: %o', strNow(), usrDick.user.tag, errRemRole ); } );
              message.react( '248447317617803264' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
              message.channel.fetchMessages( {
                limit: 100
              } ).then( messages => {
                let arrMessages = messages.array();
                arrMessages = arrMessages.filter( thisMessage => thisMessage.author.id === usrDick.id );
                arrMessages.length = 100;
                arrMessages.map( thisMessage => thisMessage.delete().catch( errMap => { console.error( '%o: %o', strNow(), errMap ); } ) );
              } );
              message.channel.send( '<:banhammer:248447317617803264> ' + usrDick + ' has violated Wheaton\'s Law and may no longer speak. <:RIP:474572596646510622>' );
            }
          }
          else {
            message.delete( { reason: 'Cleaning up a staffer\'s `!' + command + '` missing a user.' } ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
            message.channel.send( 'Sorry, ' + message.author + ', but you forgot to tell me who was a naughty.' );
          }
        }
        else {
          message.delete( { reason: 'Cleaning up a staffer\'s `!' + command + '` in the wrong channel.' } ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
          message.channel.send( 'Sorry, ' + message.author + ', but this isn\'t the right channel for that.' );
        }
        break;
      case 'pvpunban' :
      case 'pvmpunban' :
        if ( message.channel.id === '389446825570074624' && isStaff ) {// #pvmp && @Staff
          if ( arrArgs[ 0 ] !== undefined ) {
            if ( arrArgs[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] ) {
              let usrBryn = message.guild.members.get( arrArgs[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] );
              message.channel.permissionOverwrites.get( usrBryn.id ).delete( { reason: 'User was forgiven and ' + message.author.tag + ' had me clear ban.' } ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
              usrBryn.addRole( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ), '- User was a forgiven and ' + message.author.tag + ' had me re-add this role.' );
              message.react( '510515835673247776' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e ); } );
              message.channel.send( '<:approved:510515835673247776> ' + usrBryn + ' has been forgiven and may speak yet again. <:approved:510515835673247776>' );
            }
          }
          else {
          message.delete( { reason: 'Cleaning up a staffer\'s `!' + command + '` missing a user.' } ).catch( errDel => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + errDel ); } );
          message.channel.send( 'Sorry, ' + message.author + ', but you forgot to tell me who was a forgiven.' );
          }
        }
        else {
          message.delete( { reason: 'Cleaning up a staffer\'s `!' + command + '` in the wrong channel.' } ).catch( errDel => { console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + errDel ); } );
          message.channel.send( 'Sorry, ' + message.author + ', but this isn\'t the right channel for that.' );
        }
        break;
      case 'deactivate' :
        message.react( objReactionEmoji.white_check_mark ).catch( errReact => { console.error( '%o: Failed to react to !deactivate request: %o', strNow(), errReact ); } );
        sendDM( message, await message.client.users.get( settings[ bot ].owners[ 0 ] ), message.author + '#' + message.author.discriminator + ' (:id:' + message.author.id + ') "deactivated": ' + strArgs );
        break;
      case 'edit' :
        if ( isOwner || isBotMod || isCrown || isAdmin || isSysop ) {
          var guild, channel, thisMessage;
          guild = message.client.guilds.find( guild => { if ( guild.id === message.guild.id ) { return guild; } } );
          channel = guild.channels.find( chan => { if ( chan.id === message.channel.id ) { return chan; } } );
          thisMessage = arrArgs[ 0 ];
          var strNewMsg = arrArgs.slice( 1 ).join( ' ' );
          channel.fetchMessage( thisMessage ).then( objMsg => {
            objMsg.edit( strNewMsg ).then( edited => {
              message.react( objReactionEmoji.white_check_mark ).then( r => {
                message.client.setTimeout( function(){
                  message.delete().catch( errDel => { console.error( '%o: %o', strNow(), errDel ); } );
                }, 7500 );
              } ).catch( errReact => { console.error( '%o: %o', strNow(), errReact ); } );
            } ).catch( errEdit => { console.error( '%o: %o', strNow(), errEdit ); } );
          } );
        }
        else {
          message.react( objReactionEmoji.x ).then( r => {
            message.client.setTimeout( function(){
              message.delete().catch( errDel => { console.error( '%o: %o', strNow(), errDel ); } );
            }, 2500 );
          } ).catch( errReact => { console.error( '%o: %o', strNow(), errReact ); } );
          message.author.send( 'I\'m sorry, ' + message.author.tag + ', but you can\'t edit my messages in the `' + message.guild.name + '` server.' )
            .then( dm => {
              message.react( objReactionEmoji.white_check_mark ).catch( errReact => { console.error( '%o: %o', strNow(), errReact ); } );
            } ).catch( errDM => {
              message.react( objReactionEmoji.x ).then( resReact => {
                message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
              } ).catch( errReact => {
                message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^ <@&201710935788748800>' );
                console.error( '%o: %o', strNow(), errReact );
              } );
              console.error( '%o: %o', strNow(), errDM );
            } );
        }
        break;
      case 'debug' :
        var debugParameter;
        if ( arrArgs[ 0 ] !== undefined ) {
          debugParameter = arrArgs[ 0 ].trim().toLowerCase();
        }
        if ( arrArgs[ 0 ] !== undefined && debugParameter === 'state' ) {
          if ( isDebug ) {
           message.react( objReactionEmoji.one ).catch( e => { console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e ); } );
          } else {
           message.react( objReactionEmoji.zero ).catch( e => { console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e ); } );
          }
        }
        else if ( isOwner ) {
          var msgToggle, boolUpdateDebugMode = true;
          var toggle = await toBoolean( debugParameter );
          var strToggle = await ( toggle || ( toggle && !isDebug ) ? 'on' : 'off' );
          msgToggle = await client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is attempting to turn ' + strToggle + ' debug mode for_ ' + message.author );
          if ( ( isDebug && toggle ) || ( !isDebug && !toggle ) ) {
            await msgToggle.edit( '_debug mode was already ' + strToggle + '_' );
            await msgToggle.react( objReactionEmoji.person_facepalming ).catch( e => { console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e ); } );
            message.delete().catch( e => { console.log( 'Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e ); } );
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
                    msgToggle.react( objReactionEmoji.one ).catch( errReact => { console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errReact ); } );
                  } else {
                    msgToggle.edit( '_debug mode is now off_' );
                    msgToggle.react( objReactionEmoji.zero ).catch( errReact => { console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errReact ); } );
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
  /*    case 'encourage' :
        if ( !isBot ) {
          message.delete().then( async delTrigger => {
            async function getEncouraged( intMsgID ) {
              if ( intMsgID === undefined ) { intMsgID = await getRand( 1, 6 ); }
              switch ( intMsgID ) {
                case 1 :
                  return 'you\'re an idiot...'; break;
                case 2 :
                  return 'I love you.  :heart:'; break;
                case 3 :
                  return 'you\'re a super :star:'; break;
                case 4 :
                  return 'you are awesome today!'; break;
                case 5 :
                  return 'you\'re a silly goose...'; break;
                case 6 :
                  return 'you\'re great.'; break;
                default :
                  return 'I don\'t feel so good...';
              }
            }
            let toEncourage = ( message.mentions.members.first() || message.author );
            message.channel.send( toEncourage + ', ' + await getEncouraged() ).then( async msgSent => {
              client.setTimeout( async function() {
                if ( message.channel.lastMessage !== msgSent ) {
                  message.channel.send( toEncourage + ', ' + await getEncouraged() );
                }
              }, ( await getRand( 12, 27 ) * 1000 ) );
            } );
          } ).catch( errDel => {
            message.reply( 'I am unable to process your request.  Please ask ' + message.guild.owner.user.tag + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ).then( replySuccess => { replySuccess.edit( message.author + ', I am unable to process your request.  Please ask ' + message.guild.owner.user + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ) } );
          } );
        }
        break;//*/
      case 'dm' :
        if ( isOwner || isBotMod || isCrown || isAdmin ) {
          var strWhom;
          strArgs = arrArgs.slice( 1 ).join( ' ' );
          if ( arrArgs[ 0 ].toLowerCase() === 'all' && isOwner ) {
            message.client.users.forEach( function ( user ) {
              sendDM( message, user.user, strArgs );
            } );
            strWhom = 'everyone';
          } else if ( arrArgs[ 0 ].toLowerCase() === 'server' ) {
            message.guild.members.forEach( function ( user ) {
              sendDM( message, user.user, strArgs );
            } );
            strWhom = 'everyone in ' + message.guild.name;/*
          } else if ( message.mentions.roles.keyArray().length >= 1 ) {
            message.guild.roles.get( message.mentions.roles.first().id ).members.forEach( function ( user ) {
              sendDM( message, user.user, strArgs );
            } );
            strWhom = 'everyone with ' + message.guild.name + '\'s ' + message.guild.roles.get( message.mentions.roles.first().id ).name + ' role';//*/
          } else {
            var user = await message.client.fetchUser( arrArgs[ 0 ].match( /<@!?[\d]*>/g )[ 0 ].replace( /[<@!>]/g, '' ) );
            sendDM( message, user, strArgs );
            strWhom = user.tag;
          }
        }
        else {
          message.channel.send( 'I\'m sorry, ' + message.author + ', you don\'t have the authority to use that command.' );
        }
        message.delete( { reason: 'Cleaning up ' + message.author + '\'s request to DM `' +  + '` to ' + strWhom + '.' } );
        break;
      case 'report' :
        if ( message.guild.id === '464630580810612756' ) {
          message.guild.channels.get( '482699262350721046' ).send( message.author + '**#' + message.author.discriminator + '** reported in <#' + message.channel.id + '>: ' + strArgs );
          message.delete();
        }
        break;
      case 'about' :
      case 'account' :
      case 'config' :
      case 'define' :
      case 'disable' :
      case 'enable' :
      case 'eval' :
      case 'groups' :
      case 'install' :
      case 'inviteme' :
      case 'kinships' :
      case 'load' :
  //    case 'log' :
      case 'logs' :
      case 'lsregister' :
      case 'mordor' :
      case 'noserver' :
      case 'n00b' :
      case 'ping' :
      case 'prefix' :
  //    case 'prune' :
      case 'reload' :
      case 'roll' :
      case 'say' :
      case 'server' :
      case 'unload' :
        if ( isDebug ) {
          client.channels.get( settings[ bot ].debug[ 0 ] ).send( 'is processing a `!' + command + '` command.' );
        }
        client.user.setStatus( 'online' );
        isBotIdle = false;
        break;
  /*    case 'dc' :
        var defaultChannelIs = await getDefaultChannel( message.guild.id );
        console.log( 'The default channel for %o is: %o', message.guild.name, defaultChannelIs );
        break;//*/
      default : 
        /* Do nothing */
        var objReactionBlacklist = [ '700808423692042382' ];
        if ( message.author.id !== message.client.user.id && objReactionBlacklist.indexOf( message.guild.id ) === -1 ) {
          var arrFoundReacts = ( strArgs.match( /\b(Smeagol|beornings?|captains?|champions?|burglars?|guardians?|hunters?|lore[ \-]?masters?|minstrels?|rune[ \-]?keepers?|wardens?|dwar(f|ve(n|s))|el(f|ve(n|s))|hobbits?|(hu)?mans?|mithril[ \-]?coins?|l(?:otro )?p(?:oint)?s?|ssg|twitch|youtube|lotro-?wiki|pie|rip|the( one( true)?)? ring|troll(?:(ol)*|ing|s)?|(ShoeMaker|Technical_13)|salt(y)?)\b/gi ) || [] );
          if ( arrFoundReacts.length > 0 ) {
            if ( isDebug ) { console.log( '%o: I found  %d fun reaction keywords, [ "%s" ], in the string: %s', strNow(), arrFoundReacts.length, arrFoundReacts.join( '", "' ), strArgs ); }
            var arrDoReactionIDs = [], arrDoReactionNames = [];
            arrFoundReacts.forEach( async function( getReact ) {
              getReact = getReact.toLowerCase().replace( /[^A-Za-z0-9]/g, '' ).replace( /s$/, '' );
              getReact = ( getReact.indexOf( 'trollol' ) !== -1 ? 'troll' : getReact );
              getReact = ( getReact.indexOf( 'ring' ) !== -1 ? 'onering' : getReact );
              getReact = ( getReact.indexOf( 'shoemaker' ) !== -1 || getReact.indexOf( 'technical_13' ) !== -1 ? 'techniCal' : getReact );
              switch ( getReact ) {
                case 'smeagol':
                  arrDoReactionIDs.push( '510515649085308929' ); arrDoReactionNames.push( 'Smeagol' ); break;
                case 'beorning':
                  arrDoReactionIDs.push( '237646627521691648' ); arrDoReactionNames.push( 'beorning' ); break;
                case 'captain':
                  arrDoReactionIDs.push( '237647949927022593' ); arrDoReactionNames.push( 'captain' ); break;
                case 'champion':
                  arrDoReactionIDs.push( '237647952577822720' ); arrDoReactionNames.push( 'champion' ); break;
                case 'burglar':
                  arrDoReactionIDs.push( '237647950124154892' ); arrDoReactionNames.push( 'burglar' ); break;
                case 'guardian':
                  arrDoReactionIDs.push( '237647981728235520' ); arrDoReactionNames.push( 'guardian' ); break;
                case 'hunter':
                  arrDoReactionIDs.push( '237648076880347146' ); arrDoReactionNames.push( 'hunter' ); break;
                case 'loremaster':
                  arrDoReactionIDs.push( '237648082228084736' ); arrDoReactionNames.push( 'loremaster' ); break;
                case 'minstrel':
                  arrDoReactionIDs.push( '237648098493595651' ); arrDoReactionNames.push( 'minstrel' ); break;
                case 'runekeeper':
                  arrDoReactionIDs.push( '237648127891341312' ); arrDoReactionNames.push( 'runekeeper' ); break;
                case 'warden':
                  arrDoReactionIDs.push( '237648209286135811' ); arrDoReactionNames.push( 'warden' ); break;
                case 'dwarf':case 'dwarve':case 'dwarven':
                  arrDoReactionIDs.push( '249042757954437122' ); arrDoReactionNames.push( 'dwarf' ); break;
                case 'elf':case 'elve':case 'elven':
                  arrDoReactionIDs.push( '249042861792690176' ); arrDoReactionNames.push( 'elf' ); break;
                case 'hobbit':
                  arrDoReactionIDs.push( '249042886740410369' ); arrDoReactionNames.push( 'hobbit' ); break;
                case 'man':case 'human':
                  arrDoReactionIDs.push( '249042932785479690' ); arrDoReactionNames.push( 'human' ); break;
                case 'mithrilcoin':
                  arrDoReactionIDs.push( '502489088507510804' ); arrDoReactionNames.push( 'Mithril_coin' ); break;
                case 'lp':case 'lotropoint':
                  arrDoReactionIDs.push( '510518319535882251' ); arrDoReactionNames.push( 'LP' ); break;
                case 'ssg':
                  arrDoReactionIDs.push( '510517453311180822' ); arrDoReactionNames.push( 'SSG_logo' ); break;
                case 'twitch':
                  arrDoReactionIDs.push( '364781668222894080' ); arrDoReactionNames.push( 'Twitch' ); break;
                case 'youtube':
                  arrDoReactionIDs.push( '364781557887795200' ); arrDoReactionNames.push( 'YouTube' ); break;
                case 'lotrowiki':
                  arrDoReactionIDs.push( '510515621944098848' ); arrDoReactionNames.push( 'lotrowiki' ); break;
                case 'pie':
                  arrDoReactionIDs.push( '510515687337230346' ); arrDoReactionNames.push( 'Pie' ); break;
                case 'rip':
                  arrDoReactionIDs.push( '474572596646510622' ); arrDoReactionNames.push( 'RIP' ); break;
                case 'onering':
                  arrDoReactionIDs.push( '510520724373635072' ); arrDoReactionNames.push( 'one_ring' ); break;
                case 'salt':case 'salty':
                  if ( isStaff ) { arrDoReactionIDs.push( '510633122501754898' ); arrDoReactionNames.push( 'salt~1' ); } break;
  /*              case 'techniCal':
                  arrDoReactionIDs.push( '575509342254792734' ); arrDoReactionNames.push( 'techniCal' ); break;//*/
                case 'troll':case 'trolling':
                  arrDoReactionIDs.push( '474576105215492117' ); arrDoReactionNames.push( 'trollololol' ); break;
                default :
                  console.warn( '%o: Received an unrecognized getReact to react to: %s', strNow(), getReact );
              }
            } );
            if ( arrDoReactionIDs.length > 0 ) {
              arrDoReactionIDs = arrDoReactionIDs.reverse();
              arrDoReactionNames = arrDoReactionNames.reverse();
              if ( isDebug ) { console.log( '%o: I will now attempt to react to the following fun reaction keywords in reverse order: %o (%o)', strNow(), arrDoReactionNames.length, arrDoReactionNames, arrDoReactionIDs ); }
              do {
                var doReactionID = await arrDoReactionIDs.pop(), doReactionName = await arrDoReactionNames.pop();
                if ( isDebug ) { console.log( '%o: Adding reaction `:%s:` to:\n\thttps://discordapp.com/channels/%s/%s/%s', strNow(), doReactionName, message.guild.id, message.channel.id, message.id ); }
                await message.react( doReactionID ).catch( errReact => {
                  if ( errReact.code === 90001 ) {
                    message.channel.send( 'You really should consider unblocking me, ' + message.author + '.  It\'s not nice to block me for no good reason. :angry:' );
                    arrDoReactionIDs = [];
                  } else if ( errReact.code === 10014 ) {
                    console.error( '%o: Unable to react with unknown emoji of `:%s:` in %s.', strNow(), doReactionName, message.guild.name );
                  } else if ( errReact.code === 10008 ) {
                    console.error( '%o: Unable to react to unknown message with `:%s:` in %s.', strNow(), doReactionName, message.guild.name );
                  } else {
                    console.error( '%o: Unable to react with `:%s:` in %s: %o', strNow(), doReactionName, message.guild.name, errReact );
                  }
                } );
                if ( isDebug ) { console.warn( '%o: %d reactions left in: %o', strNow(), arrDoReactionIDs.length, arrDoReactionIDs ); }
              } while ( arrDoReactionIDs.length > 0 );
            }
          }

  /*        var arrFoundKeyWords = ( strArgs.match( /\b(quad ?pack)\b/gi ) || [] ) ;
          if ( arrFoundKeyWords.length > 0 ) {
            if ( isDebug ) { console.log( '%o: I found  %d fun keywords, [ "%s" ], in the string: %s', strNow(), arrFoundKeyWords.length, arrFoundKeyWords.join( '", "' ), strArgs ); }
            var arrDoKeywords = [];
            arrFoundKeyWords.forEach( async function( getKeyword ) {
              getKeyword = getKeyword.toLowerCase().replace( /[^A-Za-z0-9]/g, '' ).replace( /s$/, '' );
            }
              do {
            
              } while ( arrDoKeywords.length > 0 );
          }//*/
      }
    }
    if ( saveNewUser && guild !== null ) {
      strJsonUsers = JSON.stringify( jsonUsers );
      fs.writeFile( fsUsers, strJsonUsers, ( errWrite ) => {
        if ( errWrite ) {
          client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( strNow() + ': Failed to save "new user" on guild join.' );
          throw errWrite;
        } else { console.log( '%o: Successfully saved %s on processAutoRoles( %s ).', strNow(), ( jsonUsers[ member.id ].guilds[ guild.id ].ntag || member.user.tag ), member.id ); }
      } );
    }
  }
} );

client.on( 'message', async ( message ) => {// TEST SECTION
  var isBot = message.author.bot;
  if ( !isBot ) {
    var guild = null;
    var arrAuthorized = settings[ bot ].owners.concat( settings[ bot ].moderators );
    /* Section for message processing categorization */
    var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = await ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, isSysop = false, isMod = false, isStaff = false;
    var sysopRole = false, modRole = false, staffRole = false;
    var isMoorMaster = false, isMonsterPlayer = false;
    if ( message.guild ) {
      guild = message.guild;
      isCrown = ( message.author.id === guild.owner.user.id ? true : false );
      var arrAdminRoles = [];
      guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
      } );
      arrAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) { isAdmin = true; }
      } );
      sysopRole = await guild.roles.get( '201710817614364673' );
      isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      modRole = await guild.roles.get( '201710877143990272' );
      isMod = await ( modRole && ( modRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      staffRole = await guild.roles.get( '201710935788748800' );
      isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      isMoorMaster = await ( guild.roles.find( role => { if ( role.name === 'Moor Masters' ) { return role; } } ) && ( guild.roles.find( role => { if ( role.name === 'Moor Masters' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      isMonsterPlayer = await ( guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ) && ( guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
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
    var strArgs = arrArgs.join( ' ' );
    
    if ( !command ) {
  //    client.channels.get( settings[ bot ].debug[ 0 ] ).send( '`command === ' + command + '` (type: `' + typeof( command ) + '`)' );
    } else if ( command.substr( 0, 1 ) === '!' ) {
      command = command.substr( 1 ).toLowerCase();
    }
    
    switch ( command ) {
      case 'hooker':
        if ( isOwner || isBotMod ) {
          message.delete();
          let hookArgs = strArgs.trim().split( '||' );
          if ( hookArgs.length < 2 ) {
            return hook( message.channel, 'Hook Usage', '`!hooker <title|@mention> || <embedded message> || [HEXcolor] || [avatarURL]`\n\n**`<>` parts are required**\n**`[]` parts are optional**' );
          } else if ( hookArgs[ 0 ].match( /<@!?(\d*)>/ ) ) {
            let mbrID = hookArgs[ 0 ].match( /<@!?(\d*)>/ )[ 1 ];
            let user = await message.client.fetchUser( mbrID );
            let userName = await ( message.guild.members.get( user.id ).nickname || user.username );
            let userAvatar = await ( user.avatarURL || user.defaultAvatarURL );
            hook( message.channel, userName, hookArgs[ 1 ], hookArgs[ 2 ], userAvatar );
          } else {
            hook( message.channel, hookArgs[ 0 ], hookArgs[ 1 ], hookArgs[ 2 ], hookArgs[ 3 ] );
          }        
        } else {
          message.delete();
          message.author.send( 'I\'m sorry, you don\'t have permission to use the `!hooker` command in **' + message.guild.name + '#' + message.channel.name + '**!' );
          console.info( '%o tried to use `!hooker %o` in %o#%o', message.author.tag, strArgs, message.guild.name, message.channel.name );
        }
        break;
      case 'cordovan' :
        if ( isOwner || isBotMod || isStaff ) {   
          message.delete();
          let hookArgs = strArgs.trim().split( '||' );
          if ( hookArgs.length < 1 ) {
            return hook( message.channel, 'Cordovan Usage', '`!Cordovan <message> || [HEXcolor] `\n\n**`<>` part is required**\n**`[]` part is optional**' );
          } else {
            let Cordovan = await message.client.fetchUser( '162592158665277441' );
            hook( message.channel, '+Cordovan (SSG Community Manager)', hookArgs[ 0 ], ( hookArgs[ 1 ] || 'FFFFFF' ), Cordovan.avatarURL );
          }         
        } else {
          message.delete();
          message.author.send( 'I\'m sorry, you don\'t have permission to use the `!Cordovan` command in **' + message.guild.name + '#' + message.channel.name + '**!' );
          console.info( '%o tried to use `!Cordovan %o` in %o#%o', message.author.tag, strArgs, message.guild.name, message.channel.name );
        }
        break;
      case '8ball' :
        if ( !isBot ) {
          function getRand( intMin, intMax ) {
            if ( intMin === undefined ) { intMin = 1; }
            if ( intMax === undefined ) { intMax = 6; }
            return Math.floor( Math.random() * intMax ) + intMin;
          }
          
          async function getMagicResponse( intMsgID ) {
            if ( intMsgID === undefined ) { intMsgID = ( ( await getRand( 1, 20 ) ) - 1 ); }
            let arrResponse = [
                  'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes - definitely.', 'You may rely on it.',
                  'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Yes.', 'Signs point to yes.',
                  'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
                  'Don\'t count on it.', 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'
            ];
            let mrEmoji = ( intMsgID > 14 ? ':x:' : ( intMsgID < 10 ? ':white_check_mark:' : ':thinking:' ) );
            let hexColor = ( intMsgID > 14 ? 'FF0000' : ( intMsgID < 10 ? '008800' : 'FFFF00' ) );
            return [ arrResponse[ intMsgID ], mrEmoji, hexColor  ];
          }
          
          let mrResponse = await getMagicResponse();
          hook( message.channel, 'Magic 8-Ball', mrResponse[ 1 ] + ' ' + mrResponse[ 0 ], mrResponse[ 2 ], 'https://www.clipartmax.com/png/small/44-444284_clip-art-8-ball.png' );
        }
        break;
      case 'duvodiad' :
        if ( ( isOwner || isBotMod ) && guild.id === '201024322444197888' ) {
          console.log( '%o: %s initiated `!duvodiad` to manually force processDuvodiad() to run.', strNow(), message.author.tag );
          message.delete( 1000 );
          var msgProcessing = await message.reply( 'running processDuvodiad( true )... Please wait.' );
          isSuccess = await processDuvodiad( true );
          msgProcessing.edit( message.author + ', I f' + ( isSuccess ? 'inished' : 'ailed to finish' ) + ' processDuvodiad()' + ( isSuccess ? ' successfully.' : '.' ) )
            .then( editDone => {
              if ( isSuccess ) { console.log( '%o: Finished running processDuvodiad( true ) successfully.', strNow() ); }
              else { console.warn( '%o: Failed to finish running processDuvodiad( true ).', strNow() ); }
            } )
            .catch( errEdit => {
              console.error( '%o: Failed to announce that I %ssuccessfully finished running processDuvodiad( true ): %o', strNow(), ( isSuccess ? '' : 'un' ), errEdit );
            } );
          msgProcessing.delete( 30000 );
        }
        break;
      case 'autorole' :
        if ( isOwner ) {
          client.guilds.get( '201024322444197888' ).members.forEach( async member => { await processAutoRoles( member ); } );
        }
        break;
      case 'nitro' :
        if ( isOwner || isBotMod ) {
          message.channel.send( '`@everyone` role ID: ' + guild.roles.find( role => { if ( role.name === '@everyone' ) { return role; } } ).id );
          message.channel.send( '`Nitro Booster` role ID: ' + guild.roles.find( role => { if ( role.name === 'Nitro Booster' ) { return role; } } ).id );
        }
        break;
    }
  }
} );

client.on( 'message', async ( message ) => {// Glorious XP!
  var isBot = message.author.bot;
  if ( !isBot ) {
    var guild = null;
    var arrAuthorized = settings[ bot ].owners.concat( settings[ bot ].moderators );
    var isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, isSysop = false, isMod = false, isStaff = false;
    var sysopRole = false, modRole = false, staffRole = false;
    var isMoorMaster = false, isMonsterPlayer = false, isTroll = false, isEveryone = false;
    var canManage = false, canInvite = false;
    var thisUser = jsonUsers[ message.author.id ]
    var thisGuild = null;
    if ( message.guild ) {
      guild = message.guild;
      thisGuild = thisUser.guilds[ guild.id ];
      var member = guild.members.get( message.author.id );
      isCrown = ( message.author.id === guild.owner.user.id ? true : false );
      isAdmin = false;
      var objAdminRoles = [];
      guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { objAdminRoles[ objAdminRoles.length ] = role; }
      } );
      objAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) {
          isAdmin = true;
        }
      } );
      if ( guild.id === '201024322444197888' ) {
        sysopRole = guild.roles.get( '201710817614364673' );
        isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        modRole = guild.roles.get( '201710877143990272' );
        isMod = await ( modRole && ( modRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        staffRole = guild.roles.get( '201710935788748800' );
        isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isMoorMaster = await ( message.guild.roles.find( role => { if ( role.name === 'Moor Masters' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'Moor Masters' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isMonsterPlayer = await ( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isTroll = await ( message.guild.roles.find( role => { if ( role.name === 'Discord Troll' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'Discord Troll' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isEveryone = await ( message.guild.roles.find( role => { if ( role.name === 'everyone' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'everyone' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      }
      var objAuthorPerms = ( await guild.fetchMember( message.author.id ).catch( errFetchMbr => { console.error( '%o: Unable to fetch member for %s (%s): %o', strNow(), message.author.tag, message.author.id, errFetchMbr ); } ) ).permissions;
      canManageServer = ( objAuthorPerms.has( 'MANAGE_GUILD' ) ? true : false );
      canManageRoles = ( objAuthorPerms.has( 'MANAGE_ROLES' ) ? true : false );
      canInvite = ( objAuthorPerms.has( 'CREATE_INSTANT_INVITE' ) ? true : false );
    }
    else { console.error( '%o: Can\'t give XP on messages not in a guild for %s (ID: %o): %o', strNow(), message.author.tag, message.author.id, message.content ); }
    
    var command = message.content.replace( /  */g, ' ' ).split( ' ' );
    var arrArgs = [];
    if ( command[ 0 ].match( /<@!?(\d*)>/ ) ) {
      if ( command[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] === client.user.id && command.length > 1 ) {
        arrArgs = command.slice( 2 );
        command = command[ 1 ].toLowerCase();
      } else { arrArgs = command; command = false; }
    } else if ( command[ 0 ].indexOf( '!' ) === 0 ) {
      arrArgs = command.slice( 1 );
      command = command[ 0 ].toLowerCase();
    } else { arrArgs = command; command = false; }
    var strArgs = arrArgs.join( ' ' );
    
    if ( guild !== null && !isBot ) {
      var baseXP = getRand( 10, 25 ), intXP = 0;
      if ( Object.keys( jsonGuilds ).indexOf( guild.id ) === -1 ) {
        jsonGuilds[ guild.id ] = {
          'levels': {
            'doInactive': false,
            'doXP': false,
            'maxXP': undefined,
            'minXP': undefined,
            'msgChan': 'DM',
            'perHour': undefined,
            'perMin': undefined
          },
          'logChan': {
            'name': undefined,
            'id': undefined,
            'canLog': false
          },
          'serverName': guild.name,
          'welcome': {
            'antiSpam': false,
            'channel': undefined,
            'message': '{$user}, Welcome to **{$guild.name}**!  Have a great time here :wink:!',
            'role': null,
            'rolelog': null
          }
        };
        console.log( '%o: Added guild to jsonGuilds: %s: $o', strNow(), guild.id, jsonGuilds[ guild.id ] );
        message.client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( 'Added guild to jsonGuilds:\n```JSON\n' + guild.id + ': ' + JSON.stringify( jsonGuilds[ guild.id ] ) + '\n```' );
        let strJsonGuilds = JSON.stringify( jsonGuilds );
        fs.writeFile( fsGuilds, strJsonGuilds, ( errWrite ) => {
          if ( errWrite ) {
            client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( strNow() + ': Failed to save jsonGuilds on message.' );
            throw errWrite;
          } else { console.log( '%o: Successfully saved jsonGuilds on message.', strNow() ); }
        } );
      }
      if ( Object.keys( jsonUsers ).indexOf( message.author.id ) === -1 ) {
        jsonUsers[ message.author.id ] = {
          'tag': message.author.tag,
          'email': null,
  //        'facebook': null,
          'guilds': {},
          'intGlobalPoints': 0,
          'dateLastPoints': ( new Date() ),
  //        'reddit': null,
  //        'steam': null,
          'timezone': null,
  //        'twitter': null,
  //        'twitch': null,
  //        'youtube': null
        };
        jsonUsers[ message.author.id ].guilds[ guild.id ] = {
          'canManageRoles': canManageRoles,
          'canManageServer': canManageServer,
          'intPoints': 0,
          'dateLastPoints': ( new Date() ),
          'isAdministrator': isAdmin,
          'isCrown': isCrown,
          'ntag': ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ),
          'roles': ( member.roles.keyArray() || [] )
        };
  //      console.log( 'Added user to jsonUsers: %o', jsonUsers[ message.author.id ] );
  //      message.client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( 'Added user to jsonUsers:\n```JSON\n' + message.author.id + ': ' + JSON.stringify( jsonUsers[ message.author.id ] ).replace( /"roles":\[(.*?)\]/g, p1 => { return '"roles":[ ' + ( p1.split( ',' ).length - 1 ) + ' role' + ( ( p1.split( ',' ).length - 1 ) === 1 ? '' : 's' ) + ' ]'; } ) + '\n```' );
      } else if ( Object.keys( jsonUsers[ message.author.id ].guilds ).indexOf( guild.id ) === -1 ) {
        jsonUsers[ message.author.id ].guilds[ guild.id ] = {
          'canManageRoles': canManageRoles,
          'canManageServer': canManageServer,
          'intPoints': 0,
          'dateLastPoints': ( new Date() ),
          'isAdministrator': isAdmin,
          'isCrown': isCrown,
          'ntag': ( member.nickname === null ? member.user.tag : member.nickname + '#' + member.user.discriminator ),
          'roles': ( member.roles.keyArray() || [] )
        };
  //      console.log( 'Added guild to jsonUser: %s\n\t%o', jsonUsers[ message.author.id ], jsonUsers[ message.author.id ].guilds[ message.guild.id ] );
        message.client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( 'Added guild `' + guild.id + '` (' + guild.name + ') to jsonUser:\n```JSON\n' + message.author.id + ': ' + JSON.stringify( jsonUsers[ message.author.id ] ).replace( /"roles":\[(.*?)\]/g, p1 => { return '"roles":[ ' + ( p1.split( ',' ).length - 1 ) + ' role' + ( ( p1.split( ',' ).length - 1 ) === 1 ? '' : 's' ) + ' ]'; } ) + '\n```' );
      }

      if ( !command ) { console.log( '%o: No command found in %o#%o (ID: %o): %o', strNow(), guild.name, message.channel.name, message.channel.id, message.content ); }
      else { console.log( '%o: Command: %s\n\tarrArgs: %o', strNow(), command.toLowerCase().slice( 1 ), arrArgs ); }
  //*/
      if ( !command ) {
        intXP = baseXP * 2;
      } else if ( isOwner && ( command.toLowerCase().replace( guild.commandPrefix, '' ) === 'jsonuser' || command.toLowerCase().replace( guild.commandPrefix, '' ) === 'jsonusers' ) ) {
        intXP = baseXP * 3;
        if ( arrArgs[ 0 ] ) {
          if ( arrArgs[ 0 ].toUpperCase() === 'TAG' && arrArgs[ 1 ] ) {
            /*
            let userId = jsonUsers.find( user => user.tag === arrArgs[ 1 ] );
            let showUser = JSON.stringify( jsonUsers[ userId ] );
  //          console.log( '%o: %o', arrArgs[ 1 ], showUser );
            message.client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( ': ```JSON\n' + showUser + '\n```' );
            //*/
            message.reply( 'Currently unable to find jsonUsers by tag, please use id or mention instead.  Thanks.' );
          } else if ( arrArgs[ 0 ].toUpperCase() === 'TAG' ) {
            message.reply( 'You specified to lookup jsonUser by tag but forgot to add the tag to lookup.' );
          } else {
            let userId = arrArgs[ 0 ].replace( /(<@!?|>)/g, '' );
            let showUser = JSON.stringify( jsonUsers[ userId ] );
  //          console.log( '%o: %o', arrArgs[ 0 ],  );
            message.channel.send( userId + ': ```JSON\n' + ( showUser.length >= 1950 ? showUser.replace( /"roles":\[(.*?)\]/g, p1 => { return '"roles":[ ' + ( p1.split( ',' ).length - 1 ) + ' role' + ( ( p1.split( ',' ).length - 1 ) === 1 ? '' : 's' ) + ' ]'; } ) : showUser ) + '\n```'  );
          }
        } else {
  //        console.log( 'List of users: %o', Object.keys( jsonUsers ) );
          message.channel.send( 'List of ' + Object.keys( jsonUsers ).length + ' users:\n<@' + Object.keys( jsonUsers ).join( '>, <@' ) + '>' );
        }
      } else {
        intXP = Math.floor( baseXP / 5 );    
      }

      if ( !thisUser.dateLastPoints ) {
        thisUser.dateLastPoints = ( new Date() );
      }
      if ( !thisGuild.dateLastPoints ) {
        thisGuild.dateLastPoints = ( new Date() );
      }
      var skipIt = false, saveUpdatedUser = false;
      var minutesSinceLastGuild = ( ( new Date() ) - ( new Date( thisGuild.dateLastPoints ) ) ) / 60000;
      if ( minutesSinceLastGuild >= 1 ) {
        if ( !saveUpdatedUser ) { saveUpdatedUser = true; }
        thisGuild.intPoints += intXP;
        thisGuild.dateLastPoints = ( new Date() );
        console.log( '%o: Added %o points in %o for %s (ID: %s) (%o minutes from last).', strNow(), intXP, guild.name, thisUser.tag, message.author.id, minutesSinceLastGuild );
        skipIt = true;
      } else { console.log( '%o: %s (ID: %s) didn\'t get %o points in %o#%o for post %o minutes from the previous in guild.', strNow(), thisUser.tag, message.author.id, intXP, guild.name, message.channel.name, minutesSinceLastGuild ); }
      var minutesSinceLastUser = ( ( new Date() ) - ( new Date( thisUser.dateLastPoints ) ) ) / 60000;
      if ( minutesSinceLastUser >= 1 ) {
        if ( !saveUpdatedUser ) { saveUpdatedUser = true; }
        thisUser.intGlobalPoints += intXP;
        thisUser.dateLastPoints = ( new Date() );
        if ( skipIt ) { console.log( '%o: Added %o global points for %s (ID: %s) (%o minutes from last).', strNow(), intXP, thisUser.tag, message.author.id, minutesSinceLastUser ); }
        else { console.log( '%o: Added %o global points for %s (ID: %s) (%o minutes from last).', strNow(), intXP, thisUser.tag, message.author.id, minutesSinceLastUser ); }
      } else { console.log( '%o: %s (ID: %s) didn\'t get %o global points for post %o minutes from the previous.', strNow(), thisUser.tag, message.author.id, intXP, minutesSinceLastUser ); }
      thisUser.intLevel = Math.floor( Math.cbrt( thisUser.intGlobalPoints ) );
      thisGuild.intLevel = Math.floor( Math.cbrt( thisGuild.intPoints ) );
      if ( saveUpdatedUser ) {
        let strJsonUsers = JSON.stringify( jsonUsers );
        fs.writeFile( fsUsers, strJsonUsers, ( errWrite ) => {
          if ( errWrite ) {
            client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( strNow() + ': Failed to save ' + thisUser.tag + ' to jsonUsers on message.' );
          } else { console.log( '%o: Successfully saved %s (ID: %s) to jsonUsers on message (Glorious XP!).', strNow(), thisUser.tag, message.author.id ); }
        } );
      }
    }
    var everyoneExcludedChans = [
      '325399391223414786',// #glamband
      '510592301479755786'// #deleted-channel
    ];
    if ( guild.id === '201024322444197888' && ( isTroll || isEveryone ) && everyoneExcludedChans.indexOf( message.channel.id ) === -1 ) {
      var isSpoiler = false;
      var intAttachments = message.attachments.size;
      var msgContent = ':link: [Posted]( <https://discordapp.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + '> ) in <#' + message.channel.id + '> by ' + message.author + ':\n';
      var objAttachments = { files: [] };
      var trollMsg = undefined;
      if ( intAttachments >= 1 ) {
        Array.from( message.attachments ).forEach( thisAttachment => {
          var thisImageURL = thisAttachment[ 1 ].proxyURL;
          isSpoiler = ( thisAttachment[ 1 ].filename.substr( 0, 8 ) === 'SPOILER_' ? true : false );
          var thisFilename = ( isSpoiler ? thisAttachment[ 1 ].filename.substr( 8 ) : thisAttachment[ 1 ].filename );
          var intFileSize = parseInt( thisAttachment[ 1 ].filesize );
          if ( intFileSize <= 5242880 ) {
            objAttachments.files.push( { attachment: thisImageURL, name: thisFilename } );
          } else { msgContent += '\n' + ( isSpoiler ? ':goggles:' : ':link:' ) + ' ' + thisImageURL; }
        } );
        trollMsg = await guild.channels.get( '708657524617904139' )
          .send( msgContent, objAttachments )
          .catch( errSend => { console.error( '%o: Failed to report that @%s posted in %s#%s: %s\nError: %o', strNow(), thisGuild.ntag, guild.name, message.channel.name, message.content, errSend ); } );
        if ( trollMsg && isSpoiler ) {
          trollMsg.react( objReactionEmoji.goggles )
            .catch( errReact => { console.error( '%o: Failed to react with :goggles: to troll msg with spoiler img: %o', strNow(), errReact ); } );
        }
      }/**/if(!trollMsg){//*/
      msgContent += message.content;
      var msgUser = message.author;
      var msgMember = await message.guild.fetchMember( msgUser.id );
      var msgWebhook = new Discord.RichEmbed()
        .setThumbnail( msgUser.avatarURL )
        .setColor( msgMember.displayHexColor || '#000000' )
        .setDescription( msgContent );
      guild.channels.get( '708657524617904139' ).createWebhook( ( msgMember.nickname || msgUser.username ), msgUser.avatarURL )
        .then( async webhook => {
          await webhook.send( '', {
            'username': ( msgMember.nickname || msgUser.username ),
            'avatarURL': msgUser.avatarURL,
            'embeds': [ msgWebhook ]
          } )
          .catch( errSend => {
            console.error( '%o: trollMsg webhook failed to send: %o', strNow(), errSend );
            return guild.channels.get( '253534754350170112' ).send( '**Have <@440752068509040660> check the console, something went wrong with the trollMsg webhook.**' );
          } );
          webhook.delete();
        } );/**/}//*/
    }
  }
} );//*/
/* client.on( 'message', async ( message ) => {// Translator
  if ( message.guild.id === '201024322444197888' ) {
    const objLanguages = {
      en: '427819685883412490',// translator
      da: '426816183468294146',// danish
      nl: '426816564445184011',// dutch
      fr: '426816243895369728',// french
      de: '426816366268514319',// german
      el: '426816589665402890',// greek
      hu: '426816418390999040',// hungarian
      pl: '426816644921425931',// polish
      pt: '426816675313352705',// portuguese
      ro: '426816734717018113',// romanian
      ru: '426816223070912512',// russian
      es: '426816313080676392',// spanish
      sv: '426816390805192704',// swedish
      tr: '426816781630570496'//  turkish
    };
    const strChannelIndex = Object.values( objLanguages ).indexOf( message.channel.id );
    if ( strChannelIndex !== -1 ) {
      const translate = require( 'google-translate-api' );
      const strFromLang = Object.entries( objLanguages )[ strChannelIndex ][ 0 ];
      translate( message, { from: strFromLang, to: 'en' } )
        .then( res => {
          console.log( res.text );//=> Result text
          console.log( res.from.text.autoCorrected );//=> true/false
          console.log( res.from.text.value );//=> Auto-correct text 
          console.log( res.from.text.didYouMean );//=> true/false 
        } ).catch( err => {
          console.error( err );
        } );
//      console.log(  );
    }
  }
} );//*/