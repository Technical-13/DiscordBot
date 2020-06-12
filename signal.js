const bot = 'Signal';
const Discord = require( 'discord.js' );
//const commando = require( 'discord.js-commando' );//Not installed
//const sqlite = require( 'sqlite' );//Not installed
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
const puppeteer = require( 'puppeteer' );
const strScreenShotPath = path.join( __dirname, '/' );
const unirest = require( 'unirest' );
// const later = require( 'later' );//Not installed
  
var idleMsg = false;
var enableSay = true;
var isDebug = settings[ bot ].onError.isDebugMode;
var isBotIdle = settings[ bot ].onError.isBotIdle;
var dcInfo = settings[ bot ].onError.dcInfo;
var dateCheckRoles = new Date( settings[ bot ].onError.dateCheckRoles );

var strLogChan = {
//  '': { serverName: '', logChan: { name: undefined, id: undefined, canLog: false } },
  '385498283738660875': { serverName: 'Geocaching', logChan: { name: 'bot-logs', id: '385596577596833803', canLog: true } },
  '193758587284094978': { serverName: '/r/Geocaching', logChan: { name: 'off-topic', id: '193760602416611328', canLog: false } },
  '192775085420052489': { serverName: 'The Cat Cabin', logChan: { name: 'bot-spam', id: '335080730742882304', canLog: true } },
  '407643811796353035': { serverName: 'CentralJerseyGeocaching', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Synergy', logChan: { name: undefined, id: undefined, canLog: false } },
  '448731649212022784': { serverName: 'GeocacheME', logChan: { name: 'bot-logs', id: '448733793558331392', canLog: true } },
//  '': { serverName: 'Texas geocaching', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Geocaching', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'New York City Geocaching!', logChan: { name: undefined, id: undefined, canLog: false } },
//  '': { serverName: 'Unofficial Geocaching Discord server', logChan: { name: undefined, id: undefined, canLog: false } },
  '558534076198420520': { serverName: 'Promoteing-Central�', logChan: { name: 'loging', id: '568909973824995328', canLog: true } },
  '715558277022351361': { serverName: 'Boston geocaching', logChan: { name: 'signal-log', id: '715561344602210366', canLog: true } }
};

const rot = require( 'rot' );
const fsRank = 'rank.json';
const fsHints = 'hints.json';
var objTimeStringHQ = objTimeString;
  objTimeStringHQ.timeZone = 'America/Los_Angeles';
  objTimeStringHQ.hour12 = false;

async function sendMunzeeDiscordSocial( member, strOnReason = '' ) {
  var objUserToSendTo = member.client.users.get( member.user.id );
  const browser = await puppeteer.launch({headless:false});//DELETE
//  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
  await page.goto( 'https://www.geocaching.com/track/details.aspx?id=7592234' );
  var objTBData = await page.evaluate( async () => {
    var strLastPageURL = document.getElementsByClassName( 'pager-last last' )[ 0 ].childNodes[ 0 ].href;
    var intPages = strLastPageURL.slice( strLastPageURL.lastIndexOf( '=' ) + 1 );
    const browser = await puppeteer.launch({headless:false});//DELETE
//    const browser = await puppeteer.launch( );
    const page = await browser.newPage( );
    var intDiscoveries = 0;
    do {
      await page.goto( 'https://www.geocaching.com/track/details.aspx?id=7592234&page=' + intPages );
      await page.evaluate( () => {
        var domTable = document.getElementsByClassName( 'TrackableItemLogTable Table' );
        var domEntries = domTable[ 0 ].querySelectorAll( 'tr.BorderTop' );
        domEntries.forEach( entry => { if ( entry.innerText.match( 'discovered it' ) ) { intDiscoveries++; } } );
      } );
      intPages--;
    } while ( intPages > 0 );
    
    await browser.close();  
  
    var objTBData = {
      strOwner: document.getElementById( 'ctl00_ContentBody_BugDetails_BugOwner' ).innerText,
      dateReleased: document.getElementById( 'ctl00_ContentBody_BugDetails_BugReleaseDate' ).innerText,
      intDiscoveries: intDiscoveries
    }
    return objTBData;
  } );
  await page.goto( 'https://www.geocaching.com/track/gallery.aspx?ID=7592234' );
  var intPhotos = await page.evaluate( () => {
    return document.getElementById( 'ctl00_ContentBody_GalleryItems_DataListGallery' ).querySelectorAll( 'img' ).length;
  } );
  
  objTBData.intPhotos = objGalleryData;
  await browser.close();
  
  var objDiscordTB = new Discord.RichEmbed()
    .setColor( '#02884D' )
    .setTitle( '**Congratulations!** You have found\nthe Geocaching Discord server!' )
    .setURL( 'https://discord.me/Geocaching' )
    .setThumbnail( member.guild.iconURL )
    .setDescription(
      'Please take a little time to check out our <#385622034622709760> channel and introduce yourself to everyone in <#385498283738660877>.\n\nTell us your player name, how long you\'ve been playing, and about your favorite Geocaches!\n\nFeel free to be Discoverer #' + ( objTBData.intCaptures + 1 ) + ' of the **' + objTBData.strName + '** trackable for your special find!' +
      '\n\n**Released**: ' + ( new Date( objTBData.dateReleased ) ).toLocaleDateString( 'en-us', objTimeStringHQ ) +
      '\n:camera_with_flash: **Photos**: [' + objTBData.intPhotos + ' photos](https://www.geocaching.com/track/gallery.aspx?ID=7592234)'
    )
    .setImage( 'attachment://MunzeeDiscord.png' );
  objUserToSendTo.send( { embed: objMunzeeDiscord, files: [ { attachment: strScreenShotPath + 'Munzee Discord.png', name: 'MunzeeDiscord.png' } ] } )
    .then( async msgSent => {
      let objBotOwner = await member.client.users.get( settings[ bot ].owners[ 0 ] );
      objBotOwner.send( 'I\'ve successfully DMed the **' + objTBData.strName + '** social to **' + objUserToSendTo + '#' + objUserToSendTo.discriminator + '**' + ( strOnReason !== '' ? strOnReason : '' ) );
    } ).catch( async errDM => {
      let objBotOwner = await member.client.users.get( settings[ bot ].owners[ 0 ] );
      objBotOwner.send( 'I was unable to send the **' + objTBData.strName + '** social to **' + objUserToSendTo + '#' + objUserToSendTo.discriminator + '**' + ( strOnReason !== '' ? strOnReason : '' ) + ': __ ' + errDM + ' __' );
    } );
}
const objDiscordTB = new Discord.RichEmbed()
  .setTitle( 'TEST' )
  .setDescription( 'You\'ve found it!' )
  .setColor( '#02884D' )
  .setThumbnail( 'https://cdn.discordapp.com/avatars/445799905177632768/a3629a8dd6a671c865a7c42f3553e904.png' );

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

function toBoolean( val ) {
  val = ( typeof( val ) === 'string' ? val.toLowerCase() : val );
  var arrTrue = [ true, 'true', 1, '1', 'on', 'yes' ];
  return ( arrTrue.indexOf( val ) !== -1 ? true : false );
}

/*async function getGeocacherData( message, strHandleGC, objMessage ) {
//  $( 'input#ctl00_ContentBody_FindUserPanel1_txtUsername' ).val( strUserName );
//  $( 'input#ctl00_ContentBody_FindUserPanel1_GetUsers' ).click();
//
//  IF success -->  $( 'meta#ctl00_ogUrl' ).attr( 'content' ).startsWith( 'https://www.geocaching.com/profile/default.aspx?guid=' );
//  ELSE -->$( 'meta#ctl00_ogUrl' ).attr( 'content' ).startsWith( 'https://www.geocaching.com/find/default.aspx' );
//  var arrOptions = [];
//  var domSelect = $( 'select#ctl00_ContentBody_FindUserPanel1_ddListUsers' ).children();
//  domSelect.each( function( pos, domOption ) {
//    arrOptions.push( { GSusername: domOption.innerText, GSguid: domOption.value } );
//  } );
//  console.log(arrOptions);  
  
  if ( !message ) {// Throw new Error if message is not defined.
    throw new Error( 'object "message" is required to process getGeocacherData()' );
  } else if ( !strHandleGC ) {// Forgot to give me a geocacher to work on, so I'm returning a pseudo-404
    var objEmbed = new Discord.RichEmbed()
      .setColor( '#FF0000' )
      .setThumbnail( 'https://cdn.discordapp.com/attachments/355690877361979393/496803129225117717/dnf-page.png' )
      .setDescription( 'You failed to specify a geocacher to look up.' );
      
    if ( objMessage === undefined ) {
      objMessage = await message.channel.send( '**No geocacher specified!**', { embed: objEmbed } );
    }
    
    objMessage.edit( '**No geocacher specified!** Returning error...', { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "basic information".' ); } );
    
    return {
      error: 404,
      avatar: 'https://cdn.discordapp.com/attachments/355690877361979393/496803129225117717/dnf-page.png'
    };
  }
  else {
    var objEmbed = new Discord.RichEmbed()
      .setTitle( 'Fetching player data' );
    if ( objMessage === undefined ) {
      objMessage = await message.channel.send( 'Fetching player data, please wait...', { embed: objEmbed } );
    }
    
    const browser = await puppeteer.launch( { headless: false } );
    const page = await browser.newPage( );
    const basePage = 'https://www.geocaching.com/find/default.aspx';
    
    await page.goto( basePage );
    
    var objGetMemberPage = await page.evaluate( () => {
      $( 'input#ctl00_ContentBody_FindUserPanel1_txtUsername' ).val( strHandleGC );
      $( 'input#ctl00_ContentBody_FindUserPanel1_GetUsers' ).click();
    } );// end page.evaluate() 
    
//    return objMember;
  }
}//*/

var qPathTags = {
  url: 'https://www.pathtags.com/api/v1.2/',
  username: settings[ bot ].pathtag.username,
  password: settings[ bot ].pathtag.password,
  apikey: settings[ bot ].pathtag.apikey,
  dataType: 'json',
  authkey: '',
  user_id: 'PathTags',
  tagid: '5035',//Default "PathTag" PathTag ID
  log: './PathTag logs/' + ( new Date() ).valueOf( ) + '.json'
};

function parsePathTagResponse( response ) {
  return JSON.parse( response.body.trim() );
}

async function getPathTagId( strSerial ) {
  var objPathTag = {};
  var isSerial = /^[0-9a-zA-Z]+$/.test( strSerial );
    if ( ( strSerial.length == 6 || strSerial.length == 7 ) && isSerial ) {
      unirest.get( qPathTags.url + 'tag.php/gettagimg/' + strSerial + '/500/' + qPathTags.authkey + '?apikey=' + qPathTags.apikey )
        .header( 'type', 'GET' )
        .header( 'dataType', qPathTags.dataType )
        .end( function ( objTagID ) {
        objPathTag.statusCode = objTagID.statusCode;
        objPathTag.response_status = JSON.parse( objTagID.body ).response_status;
        objPathTag.tagid = JSON.parse( objTagID.body ).tagid;
        if ( isDebug ) {
          console.log( 'Completed processing tag with serial: ' + strSerial + ' and am returning objPathTag: \n' + JSON.stringify( objPathTag ) );
        }
        return objPathTag;
      } );
    } else {
      objPathTag.statusCode = '200';
      objPathTag.response_status = 'error';
      objPathTag.response_body = 'Tag serial number is invalid, please check the number on the tag and try again.';// +
//                                 '\n\tTo look up a PathTag by ID number, please use a `#12345` format instead.';
      objPathTag.tagid = '5035';
        if ( isDebug ) {
          console.log( 'Completed processing tag with serial: ' + strSerial + ' and am returning objPathTag: \n' + JSON.stringify( objPathTag ) );
        }
      return objPathTag;
    }
}//*/

function getCacheBasicDetails ( strCache ) {// NOT EVEN CLOSE TO READY!
  const objIconTypes = { 2: 'traditional', 3: 'multicache', 4: 'virtual', 5: 'letterbox', 6: 'event', 8: 'mystery', 9: 'ape', 11: 'webcam', 12: 'locationless', 13: 'cito', 137: 'earthcache', 453: 'mega', 1304: 'gpsadventure', 1858: 'whereigo', 3653: '10years', 3773: 'ghq', 7005: 'giga' };

  var objIcon = $( 'svg.icon.cache-icon > use' )[ 0 ].attributes[ 0 ].value.split( '/' );
  objIcon = objIcon[ objIcon.length - 1 ];
  if ( objIcon.split( '#' )[ 0 ] !== 'cache-types.svg' ) {
    console.warn( 'objIcon is undefined with value of: %o', objIcon );
    objIcon = undefined;
  } else {
    var strID = objIcon.split( '#' )[ 1 ];
    var arrID = strID.split( '-' );
    var intType = arrID[ 1 ];
    if ( arrID.length === 3 ) {
      var isArchived = ( arrID[ 2 ] === 'disabled' ? true : false );
    }
    objIcon = { strID: strID, arrID: arrID, intType: intType, strType: objIconTypes[ intType ], isArchived: ( isArchived ? isArchived : false ) };
  }

  console.log( 'objIcon is: %o', objIcon );
  return objIcon;
}

/*function getPathTagInfo( intTagID ) {
  var objPathTag = { 'tagid': intTagID, 'thumbUrl': 'http://www.pathtags.com/community/blueprints/' + intTagID + '/blueprint.jpg' };
  // Get tag information using ID from getPathTagId( strSerial )
  unirest.get( qPathTags.url + 'tag.php/getpublictagprofile/' + qPathTags.tagid + '/' + qPathTags.authkey + '?apikey=' + qPathTags.apikey )
    .header( 'type', 'GET' )
    .header( 'dataType', qPathTags.dataType )
    .end( function ( objTagProfile ) {
      objPathTag.statusCode = objTagProfile.statusCode;
      objPathTag.response_status = JSON.parse( objTagProfile.body ).response_status;
      objPathTag.tagid = JSON.parse( objTagProfile.body ).tagid;
    } );
//* DEBUG
var thisLogFile = './Signal/PathTag logs/' + ( new Date() ).valueOf( ) + '-tagInfo.json';
var thisLogText = JSON.stringify( objPathTag );
fs.writeFile( thisLogFile, thisLogText, ( errWrite ) => {
  if ( errWrite ) throw errWrite;
  console.log( 'Created ' + thisLogFile + ' with ` ' + thisLogText + '`' );
} );
///// DEBUG
  return objPathTag;
}

function getPathTagUserInfo( intUserID ) {
  // Get user information
  return 0;
}

function logPathTag( intTagID ){
  // Log a tag using ID from getPathTagIdThumb( strSerial ) so the bot always has only one nontransferable tag
}
*/

function sendDM( message, recipient, strContent ) {
  recipient
    .send( strContent )
    .then( dmSent => {
      message.author.send( 'DM, ' + recipient + ' (' + recipient.tag + ') sent: `' + strContent + '`' );
    } ).catch( dmErr => {
      message.author.send( 'Unable to DM, ' + recipient + ' (' + recipient.tag + ') your message: `' + strContent + '`' );
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

function clean( text ) {
  if ( typeof( text ) === 'string' ) {
    return text.replace( /`/g, '`' + String.fromCharCode( 8203 ) ).replace( /@/g, '@' + String.fromCharCode( 8203 ) );
  } else {
    return text;
  }
}

const client = new Discord.Client();

client.login( settings[ bot ].token );

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

function meDiscord( msgIRC, noHash ) {
  if ( noHash === undefined ) {
    var noHash = false;
  }
  var arrMentions = msgIRC.match( /<@!?(\d*)>/gi );
  if ( arrMentions !== null ) {
    arrMentions.forEach( function( user, ndx ) {
      var userID = user.replace( /[<@!>]/g, '' );
      var userTag = client.users.get( userID ).tag;
      if ( noHash ) {
        userTag = client.users.get( userID ).username + '# ' + client.users.get( userID ).discriminator;
      }
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

/*  Can't currently make the bot emote to IRC -- need to do some more digging. :\*/
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
var clientIRC = new ircClient( 'irc.slashnet.org', 6667, 'Signal', 'discord.me/geocaching' );

// This decides the verbosity of the output, set to 1 as default
clientIRC.verbosity = 1; // 0 == Silent, 1 == Normal, 2 == Info

// This is set to false by default, prints out all raw server messages
clientIRC.debug = false;

clientIRC.on( 'ready', function () {
  clientIRC.join( '#Geocaching-discord' );/* #Geocaching, */
//  clientIRC.say( '#Geocaching-discord', 'I\'m connected to the channel!' );
} );
clientIRC.on( 'CHANMSG', function ( data ) {
  if ( data.message.indexOf( 'williampitcock' ) == -1 && data.message.indexOf( 'kaniini' ) == -1 ) {
    client.channels.get( '455532459728044032' ).send( '**' + data.nick + '*' + data.receiver + meIRC( data.message ) );
  }
} );
clientIRC.on( 'PRIVMSG', function ( data ) {
  settings[ bot ].owners.forEach( async function( ownerID, i ) {
    var objOwner = await client.fetchUser( ownerID );
    objOwner.send( 'I have received an IRC DM from **' + data.sender + '**: `' + data.message + '`' );
  } );
  clientIRC.say( data.nick, 'I\'m a bot, I don\'t understand your message.  I\'ve forwarded your message to my owners.' );
} );
client.on( 'message', message => {
  if ( message.channel.id === '455532459728044032' && message.author.id !== client.user.id ) {
    clientIRC.say( '#Geocaching-discord', message.author.tag + ': ' + meDiscord( message.content ) );
  }
} );
//clientIRC.connect();// COMMENT THIS LINE OUT WHEN DEBUGGING TO PREVENT IRC JOIN/PART SPAM! */

/*var cgeoGeocache = new ircClient( 'irc.freenode.net', 6667, 'Signal', 'discord.me/geocaching' );
cgeoGeocache.on( 'ready', function() {
  cgeoGeocache.join( '#cgeo' );
} );
cgeoGeocache.on( 'CHANMSG', function ( dataCgeo ) {
  client.channels.get( '457593331019546625' ).send( '**' + dataCgeo.nick + '*' + dataCgeo.receiver + meIRC( dataCgeo.message ) );
} );
cgeoGeocache.on( 'PRIVMSG', function ( dataCgeo ) {
  settings[ bot ].owners.forEach( async function( ownerID, i ) {
    var objOwner = await client.fetchUser( ownerID );
    objOwner.send( 'IRC DM from **' + dataCgeo.sender + '** *(#cgeo)*: `' + dataCgeo.message + '`' );
  } );
  cgeoGeocache.say( dataCgeo.nick, 'I\'m a bot, I don\'t understand your message.  I\'ve forwarded your message to my owners.' );
} );
client.on( 'message', message => {
  if ( message.channel.id === '457593331019546625' && message.author.id !== client.user.id ) {
    cgeoGeocache.say( '#cgeo', ( message.guild.members.get( message.author.id ).nickname || message.author.username ) + ': ' + meDiscord( message.content, true ) );
  }
} );//*/
//cgeoGeocache.connect();// COMMENT THIS LINE OUT WHEN DEBUGGING TO PREVENT IRC JOIN/PART SPAM! */

var clientGeocache = new ircClient( 'irc.slashnet.org', 6667, 'ShoeMaker', 'Technical_13' );
clientGeocache.on( 'ready', function() {
  clientGeocache.join( '#geocache' );
} );
clientGeocache.on( 'CHANMSG', function ( dataG ) {
  client.channels.get( '456093333274624000' ).send( '**' + dataG.nick + '*' + dataG.receiver + meIRC( dataG.message ) );
} );
clientGeocache.on( 'PRIVMSG', function ( dataG ) {
  settings[ bot ].owners.forEach( async function( ownerID, i ) {
    var objOwner = await client.fetchUser( ownerID );
    objOwner.send( 'IRC DM from **' + dataG.sender + '** *(#geocache)*: `' + dataG.message + '`' );
  } );
} );
client.on( 'message', message => {
  if ( message.channel.id === '456093333274624000' && message.author.id !== client.user.id ) {
    clientGeocache.say( '#geocache', meDiscord( message.content ) );
  }
} );
//clientGeocache.connect();// COMMENT THIS LINE OUT WHEN DEBUGGING TO PREVENT IRC JOIN/PART SPAM! */
/* IRC relay end */

client.on( 'ready', async () => {
//  var objPrimaryOwner = await client.fetchUser( settings[ bot ].owners[ 0 ] );
//  objPrimaryOwner.send( { embed: objDiscordTB } );
  Promise.all( [
    await unirest.get( qPathTags.url + 'user.php/doauth/' + qPathTags.username + '/' + qPathTags.password + '?apikey=' + qPathTags.apikey )
      .header( 'type', 'GET' )
      .end( async function ( objAuth ) {
        var objAuth = JSON.parse( objAuth.body );
        qPathTags.user_id = objAuth.user_id;
        qPathTags.authkey = objAuth.authkey;
        var strPathTags = JSON.stringify( qPathTags );
        await fs.writeFile( qPathTags.log, strPathTags, ( errWrite ) => {
          if ( errWrite ) { throw errWrite; }
          console.log( 'Created ' + qPathTags.log + ' with ` ' + strPathTags + '`' );
        } );
      } ),
    await client.user.setPresence( { status: settings[ bot ].status, afk: false, game: { name: settings[ bot ].game, type: 'PLAYING' } } )
  ] ).then( () => {
    var readyTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
    console.log( '\n' + readyTime + ':\t' + settings[ bot ].name + ' is now ready to accept commands.\n' )
    if ( isDebug ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is now ready to accept commands at ' + readyTime + '._' );
    }
  } );
} );

client.on( 'disconnect', async ( dc ) => {
  var disconnectTime = await ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  objTempDB.dcInfo = await 'I\'ve been disconnected at ' + disconnectTime + ' with: ' + dc;
  strTempDB = await JSON.stringify( objTempDB );
  await fs.writeFile( fsTempDB, strTempDB, ( errWrite ) => {
    if ( errWrite ) {
      throw errWrite;
    }
    if ( isDebug ) {
     dcInfo = '_has disconnected at ' + disconnectTime + ' with:_ ' + dc;
    }
    console.error( 'I\'ve been disconnected at ' + disconnectTime + ' with: ' + dc );
  } );
} );

client.on( 'reconnecting', async ( rc ) => {
  var reconnectTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  if ( isDebug ) {
    if ( !dcInfo ) {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_has reconnected at ' + reconnectTime + ' and is ready to accept commands:_ ' + ( rc ? rc : '' ) );
    } else {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( dcInfo + '\n_and has reconnected at ' + reconnectTime + ' and is ready to accept commands:_ ' + ( rc ? rc : '' ) );
    }
  }
  console.log( 'Reconnected at ' + reconnectTime + '\n' + settings[ bot ].name + ' is now ready to accept commands: ' + ( rc ? rc : '' ) );
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
  if ( client.user.presence.game.name && client.user.presence.game.name === 'restarting...' ) {
    client.user.setPresence( settings[ bot ].game );// While we're at it checking things every 5 minutes... If the game wasn't updated on restart, try to set it again.
  }
  if ( client.user.localPresence.status !== 'idle' ) {
    if ( isBotIdle ) {
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
  }
}, 300000 );// 300000ms == 5m

/*client.setInterval( function() {// !rall
  timeNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  exec( 'move /Y C:\Users\dfortier\.pm2\logs\*.log C:\Users\dfortier\.pm2\logs\backup', { windowsHide: true }, ( errExec, stdout, stderr ) => {
    if ( errExec ) {
      console.error( 'Error: %o', errExec );
      return;
    }
    console.log( 'Result: %o', stdout );
    console.log( 'stderr: %o', stderr );
  } );
  console.log( 'restart of all other bots at ' + timeNow );
  exec( 'pm2 restart "DDObot" "LOTRObot" "Lazy Bastard" "greenie" "Vladdy"', { windowsHide: true }, ( errExec, stdout, stderr ) => {
    if ( errExec ) {// "Gunther" "ShoeBot"
      console.error( 'Error: %o', errExec );
      return;
    }
    console.log( 'Result: %o', stdout );
    console.log( 'stderr: %o', stderr );
  } );
}, 432000000 );// 432000000 == 5 hours */

client.on( 'guildMemberAdd', ( member ) => {
  var guildID = member.guild.id;
  var objUser = member.user;
  var strJoined = ( new Date( member.joinedTimestamp ) ).getHours();
  var guildWelcomeMesages = {
    '448731649212022784': {// Maine Geocaching
      channel: '448731649212022786',//#general
      role: '448733297397334021',//&Nano
      message: 'Good ' + ( strJoined <= 11 ? 'morning' : ( strJoined <= 17 ? 'afternoon' : 'evening' ) ) + ', ' + objUser + '**#' + objUser.discriminator + '**!  Welcome to the **' + member.guild.name + '** Discord server it\'s **' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '** Geocaching HQ time!'
    },
    '385498283738660875': {// Geocaching
      channel: '385498283738660877',//#general
      role: '385598600467447808',//&Nano
      message: 'Good ' + ( strJoined <= 11 ? 'morning' : ( strJoined <= 17 ? 'afternoon' : 'evening' ) ) + ', ' + objUser + '**#' + objUser.discriminator + '**!  Welcome to the **' + member.guild.name + '** Discord server; the current Geocaching HQ time is: **' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '**.  If you share your, case specific, geocaching handle with us, `@Staff` can set you up with a matching nickname and some roles to have more acces to the server. <:Signal:398980726000975914>'
    },
    '407643811796353035': {// CentralJerseyGeocaching
      channel: '407643812408590339',//#general
      role: '420666987212177408',//&CacheNinja
      message: 'Good ' + ( strJoined <= 11 ? 'morning' : ( strJoined <= 17 ? 'afternoon' : 'evening' ) ) + ', ' + objUser + '**#' + objUser.discriminator + '**!  Welcome to the **' + member.guild.name + '** Discord server; the current Geocaching HQ time is: **' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '**'
    },
    '193758587284094978': {// /r/Geocaching
      channel: '193758587284094978',//#general
      role: null,
      message: 'Welcome to the **' + member.guild.name + '** Discord, ' + objUser + '**#' + objUser.discriminator + '**!  Please introduce yourself with `!statbar [your, case sensitive, username here]` to get started!'
    }
  };
  if ( guildWelcomeMesages[ guildID ] ) {
    if ( isDebug ) {
     settings[ bot ].debug.forEach( function ( channel ) {
       client.channels.get( channel ).send( '*is processing a **`guildMemberCreate`** event for: __' + objUser + '**#' + objUser.discriminator + '**__ in __**' + member.guild.name + '**__.*' );
     } );
    }
    var channel = member.guild.channels.get( guildWelcomeMesages[ guildID ].channel );
    if ( !channel ) {
      member.guild.channels.array().forEach( function ( defaultChannel ) {
        if ( !channel && defaultChannel.type === 'text' ) {
          channel = defaultChannel;
        }
      } );
    }
    
    if ( guildWelcomeMesages[ guildID ].blockSpam || true ) {
      var strLowerUserName = objUser.username.toLowerCase();
      var arrSpamNames = ( strLowerUserName.match( /(((discord|paypal)\.(gg|me))|(twitch\.tv)|((facebook|instagram|paypal|reddit|twitter|youtube)\.com?)|(bit.ly))\//i ) || [] );
      if ( arrSpamNames.length >= 1 ) {
        if ( member.guild.members.get( member.id ).bannable ) {
          var strSpamFrom = arrSpamNames[ 0 ].replace( /\//, '' ).replace( /\.(com|gg|me)/, '' );
          strSpamFrom = strSpamFrom.slice( 0, 1 ).toUpperCase() + strSpamFrom.slice( 1 );
          member.ban( { days: 7, reason: strSpamFrom + ' invite spam(bot)' } )
            .then( objBan => { console.log( '%s: Banned %s (%s) from %s (%s)', strNow, objUser.tag, objUser.id, member.guild.name, guildID ); } )
            .catch( errBan => { console.error( '%s: Failed to ban %s (%s) from %s (%s): %o', strNow, objUser.tag, objUser.id, member.guild.name, guildID, errBan ); } );
        } else {
          console.error( '%s: Unable to ban %s (id:%s) from %s (id:%s)', strNow, objUser.tag, objUser.id, member.guild.name, guildID );
        }
      } else {
        channel.send( guildWelcomeMesages[ guildID ].message );
        if ( guildWelcomeMesages[ guildID ].role ) {
          member.addRole( guildWelcomeMesages[ guildID ].role, 'Give our newest member the starter role!' ).catch( errAddRole => { console.error( '%s: Failed to assign %o role to %s (id:%s) in %s (id:%s): %o', strNow, guildWelcomeMesages[ guildID ].role, objUser.tag, objUser.id, member.guild.name, guildID, errAddRole ); } );
        }
      }
    }
  }
  client.user.setStatus( 'online' );
  isBotIdle = false;
} );

client.on( 'guildMemberRemove', ( member ) => {
  var guildID = member.guild.id;
  var objUser = member.user;
  var guildGoodByeMesages = {
    '385498283738660875': {//Geocaching
      channel: '385596577596833803',//#bot-logs
      message: 'Goodbye ' + objUser + '(- ' + objUser.tag + ' -)!  **' + member.guild.name + '** will miss you!'
    },
  };
  if ( guildGoodByeMesages[ guildID ] ) {
    if ( isDebug ) {
     settings[ bot ].debug.forEach( function ( channel ) {
       client.channels.get( channel ).send( '*is processing a **`guildMemberRemove`** event for: __' + objUser + '**#' + objUser.discriminator + '**__ in __**' + member.guild.name + '**__.*' );
     } );
    }
    var channel = member.guild.channels.get( guildGoodByeMesages[ guildID ].channel );
    if ( !channel ) {
      channel = member.guild.defaultChannel;console.log( 'No channel defined for [' + member.guild.name + '].  Using default channel of: ' + getDefaultChannel( guildID ) );
    }
    channel.send( guildGoodByeMesages[ guildID ].message );
  }
  client.user.setStatus( 'online' );
  isBotIdle = false;
} );

client.on( 'messageUpdate', ( msgOld, msgNew ) => {
  if ( msgOld.channel.type === 'dm' ) {
    msgNew.channel.send( 'Editing your message does nothing to trigger me (except to make me tell you that editing your message does nothing to trigger me (except to make me tell you that editing your message does nothing to trigger me (...))).' );
  } else if ( strLogChan[ msgNew.guild.id ] !== undefined ) {
    if ( msgNew.content !== msgOld.content && strLogChan[ msgNew.guild.id ].logChan.canLog ) {
      var msgAuthor = msgOld.author;
      if ( client.user.id !== msgAuthor.id && !msgAuthor.bot ) {
        var objMsgUpdate = new Discord.RichEmbed()
          .setColor( '#F2D201' )
          .setDescription( ':x: ' + ( msgOld || '**`NULL`**' )
            + '\n:white_check_mark: ' + ( msgNew || '**`NULL`**' ) );
        client.channels.get( strLogChan[ msgNew.guild.id ].logChan.id ).send( ':warning: **' + msgAuthor.username + '**#' + msgAuthor.discriminator + ' edited a message in <#' + msgOld.channel.id + '>:', { embed: objMsgUpdate } );
      }
    }
  } else {
    msgNew.channel.send( msgNew.author + ', you seem to have modified your post and I don\'t have a log channel to log to yet!  Please contact <@440752068509040660> to resolve this issue!' );
    console.log( 'Unable to post messageUpdate event for `' + msgNew.guild.name + '` (ID:' + msgNew.guild.id + ') with no log channel defined.' );
  }
} );

client.on( 'messageDelete', ( msg ) => {
  if ( strLogChan[ msg.guild.id ] !== undefined ) {
    var msgAuthor = msg.author;
    if ( client.user.id !== msgAuthor.id && !msgAuthor.bot && strLogChan[ msg.guild.id ].logChan.canLog ) {
      var objMsgDelete = new Discord.RichEmbed()
        .setColor( '#FF0000' )
        .setDescription( ( msg || '**`NULL`**' ) );
      client.channels.get( strLogChan[ msg.guild.id ].logChan.id ).send( ':x: **' + msgAuthor.username + '**#' + msgAuthor.discriminator + '\'s message has been deleted from <#' + msg.channel.id + '>:', { embed: objMsgDelete } );
    }
  } else {
    msg.channel.send( msg.author + ', you seem to have modified your post and I don\'t have a log channel to log to yet!  Please contact <@440752068509040660> to resolve this issue!' );
    console.log( 'Unable to post messageDelete event for `' + msg.guild.name + '` (ID:' + msg.guild.id + ') with no log channel defined.' );
  }
} );

// Trigger commands
client.on( 'message', async message => {
  const isBot = message.author.bot;
  var guild = null;
  var isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
  var strCrownID = '';
  var isCrown = false;
  var isAdmin = false;
  if ( message.guild ) {
    guild = message.guild;
    const guildMember = guild.members.get( message.author.id );
    strCrownID = await guild.owner.user.id;
    isCrown = ( message.author.id === strCrownID ? true : false );
    var objAdminRoles = [];
    guild.roles.array().forEach( function( role, index ) {
      if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) {
        objAdminRoles[ objAdminRoles.length ] = role;
      }
    } );
    objAdminRoles.forEach( function( role, index ) {
      if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) {
        isAdmin = true;
      }
    } );
    let isNano = false, nanoRole = false, microRole = false;
    if ( guild.id === '385498283738660875' ) {
      nanoRole = await guild.roles.get( '385598600467447808' );
      isNano = await ( nanoRole && ( nanoRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      microRole = await guild.roles.get( '385598676896186369' );
      if ( isNano ) {
        guildMember.addRole( microRole, { reason: 'Nano member spoke for the first time!' } ).then( roleAdded => {
          guildMember.removeRole( nanoRole, { reason: 'Nano member spoke for the first time!' } ).then( roleRemoved => {
            message.reply( 'Congratulations!  You\'ve been upsized from ' + nanoRole + ' for posting your first message on the server!' );
          } ).catch( errAddRole => { console.error( ': FAILED to add micro role for ' + ( guildMember.nickname || message.author.username ) + ': ' + errAddRole ); } );
        } ).catch( errAddRole => { console.error( ': FAILED to add micro role for ' + ( guildMember.nickname || message.author.username ) + ': ' + errAddRole ); } );
      }
    }
  }
  
  if ( isDebug ) {
    if ( message.author.id !== message.client.user.id ) {
      console.log( 'Message ID: ' + message.id + ' - author ID: ' + message.author.id + ' -flags- ' + ( message.author.id === message.client.user.id ? '1' : '0' ) + ( isOwner ? '1' : '0' ) + ( isCrown ? '1' : '0' ) + ( isAdmin ? '1' : '0' ) );
      console.log( 'Guild#Channel: ' + message.guild.name + '#' + message.channel.name + ' Author: ' + message.author.tag );
      console.log( 'Message.content: ' + message.content );
    }
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
    /* Do nothing, it's not my command. */
  } else if ( command.substr( 0, 1 ) === '!' ) {
    command = command.substr( 1 ).toLowerCase();
  }
  
  var strUserName;
  if ( command ) {
    if ( arrArgs[ 0 ] !== undefined ) {
      if ( message.guild ) {
        if ( message.guild.members.get( arrArgs[ 0 ].replace( /<@!?/, '' ).replace( />/, '' ) ) !== undefined ) {
          let strID = arrArgs[ 0 ].replace( /<@!?/, '' ).replace( />/, '' );
          objUser = message.guild.members.get( strID );
          strUserName = ( objUser.nickname || objUser.user.username );
        } else {
          strUserName = arrArgs.join( ' ' );
        }
      } else {
        strUserName = 'greenie';
      }
    } else if ( message.guild ) {
        if ( message.guild.members.get( message.author.id ).nickname !== null ) {
          strUserName = message.guild.members.get( message.author.id ).nickname;
        } else {
          strUserName = message.author.username;
        }
    } else {
      strUserName = message.author.username;
    }
  } else {
    strUserName = 'greenie';
  }
  
  if ( message.guild && arrArgs[ 0 ] !== undefined ) {// && !isOwner && !isCrown && !isAdmin
    if ( message.guild.id === '192775085420052489' ) {
      var DiscordInvites = [ ];
      arrArgs.forEach( function( thisArg ) {
        var thisInvite = thisArg.trim().replace( /\W_/g, '' );
        if ( thisArg.match( /(https?:\/\/)?discord(app)?\.(gg|me)\/(.*?)/i ) !== null ) {
          DiscordInvites.push( thisInvite );
        }
      } );
      if ( message.author.id !== client.user.id && DiscordInvites.length >= 1 ) {
        var objCrown = await message.client.fetchUser( strCrownID );
        console.log( 'Invite(s) Detected: ' + DiscordInvites );
        message.delete( { reason: 'Deleting invite posted without permission.' } )
          .then( async doneDel => {
            console.log( 'Done: ' + doneDel );
            await objCrown.send( 'Successfully deleted ' + message.author + '\'s unpermitted guild invite from ' + message.guild.name + '**#**' + message.channel.name + ': `' + DiscordInvites.join( '` - `' ) + '`' );
          } ).catch( async errDel => {
            console.log( 'Error: ' + errDel );
            await objCrown.send( 'Failed to delete ' + message.author + '\'s unpermitted guild invite from ' + message.guild.name + '**#**' + message.channel.name + ': `' + DiscordInvites.join( '` - `' ) + '`' );
          } );
      }
    }
  }
  
  if ( arrArgs[ 0 ] !== undefined ) {
    var GCcodes = [ ];
    var TBcodes = [ ];
    arrArgs.forEach( function( thisArg ) {
      var thisCode = thisArg.trim().replace( /\W_/g, '' );
      if ( thisArg.match( /^GC[A-Z0-9]{2,6}$/i ) !== null ) {
        GCcodes.push( thisCode );
      }
      if ( thisArg.match( /^TB[A-Z0-9]{2,7}$/i ) !== null ) {
        TBcodes.push( thisCode );
      }
    } );
    if ( message.author.id !== client.user.id && GCcodes.length >= 1 ) {
      var strMessage = 'GC code(s) detected, here are links: ';
      var arrDoneCodes = [ ];
      GCcodes.forEach( function( GCcode, ndx ) {
        arrDoneCodes.push( GCcode.toUpperCase() );
        strMessage += '\n\t' + GCcode.toUpperCase() + ' :link: <https://coord.info/' + GCcode.toUpperCase() + '>';
      } );
      if ( arrDoneCodes.length >= 1 ) {
        message.channel.send( strMessage );
      }
    }
    
    if ( message.author.id !== client.user.id && TBcodes.length >= 1 ) {
      var hasDiscordTB = false;
      var strMessage = 'TB reference number(s) detected, here are links: ';
      var arrDoneCodes = [ ];
      TBcodes.forEach( function( TBcode, ndx ) {
        arrDoneCodes.push( TBcode.toUpperCase() );
        strMessage += '\n\t' + TBcode.toUpperCase() + ' :link: <https://coord.info/' + TBcode.toUpperCase() + '>';
        if ( TBcode.toUpperCase() === 'TB8PPBD' ) {
          hasDiscordTB = true;
        }
      } );
      if ( arrDoneCodes.length >= 1 ) {
        message.channel.send( strMessage ).then( msgSent => {
          if ( hasDiscordTB ) {
            msgSent.react( '💚' );
          }
        } );
      }
    }
  }
  
  if ( isDebug ) {
    console.log( 'Attempting to react to command: ' + command );
  }
  switch ( command ) {
    case 'dv' : case 'dver' :
      if ( isOwner ) {
        message.reply( 'I\'m running Discord.js v'+ Discord.version + ' ? <https://discord.js.org/#/docs/main/' + Discord.version + '/general/welcome>' );
        message.delete().catch( errDel => { console.error( '%o: Unable to delete !%s request by %s: %o', strNow(), command, message.author.tag, errDel ); } );
      }
      break;
    case 'about' :
      const strOrdinalEmoji = [ 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'keycap_ten' ];// basic 0-9 and then "10"
      var response = await message.channel.send( 'Collecting data for your query, please stand by...' );
      try {
        var arrMyRoles = message.guild.members.get( message.client.user.id )._roles,
          dateJoinedTimestamp = new Date( message.guild.members.get( message.client.user.id ).joinedTimestamp ),
          intGuildsList = 0,
          intGuilds = 0,
          intGuildIndex = 0,
          intTopIndex = 0,
          intUsers = message.guild.memberCount,
          intHumans = 0,
          intBots = 0,
          intChannels = message.guild.channels.size,
          intTextChannels = 0,
          intVoiceChannels = 0,
          intRoles = message.guild.roles.size,
          strBotType = '',
          strDebugServer = '',
          strInviteMe = '',
          strOwner = '',
          strLastRestart = '',
          strGuildsName = '',
          strGuildsValue = '',
          strTopIndex = '',
          strMyRoles = '',
          strCurrentGuildValue = '',
          strJoinedTimestamp = dateJoinedTimestamp.toLocaleDateString( 'en-US', objTimeString ),
          strCurrentGuildName = message.guild.name;
        var objUptime = { base: Math.floor( message.client.uptime / 1000 ) };
          objUptime.seconds = ( objUptime.base % 60 );
          objUptime.minutes = ( Math.floor( objUptime.base / 60 ) % 60 );
          objUptime.hours   = ( Math.floor( objUptime.base / 3600 ) % 24 );
          objUptime.days    = ( Math.floor( objUptime.base / 86400 ) % 7 );
          objUptime.weeks   = ( Math.floor( objUptime.base / 604800 ) % 4 );
        if ( !message.guild.large ) {
          await message.guild.members.forEach( function( member, intMemberIndex ) {
            if ( member.user.bot ){
              intBots++;
            } else {
              intHumans++;
            }
          } );
        } else {// HORRIBLE HACK -- FIX THIS LATER
          await message.guild.members.forEach( function( member, intMemberIndex ) {
            if ( member.user.bot ){
              intBots++;
            }
          } );
          intHumans = message.guild.memberCount - intBots;
        }

        Promise.all( [
          strBotType = 'In case you didn\'t know, I\'m a ' +
            ( message.client.user.bot ? ':robot: robot' : ':bust_in_silhouette: human' ) + '.\n',
          strDebugServer = 'You can track changes to the bot in my [debugging server](<https://discord.me/TheShoeStore>).\n',
          strInviteMe = 'You can add me to your own server(s): [Invite Me!](https://discordapp.com/api/oauth2/authorize?client_id=' + settings[ bot ].clientID + '&scope=bot&permissions=8)\n',
          strOwner = 'My owner' + ( settings[ bot ].owners.length === 1 ? ' is ' : 's are ' ),
          await settings[ bot ].owners.forEach( async function( ownerID, i ){
            var owner = await message.client.fetchUser( ownerID );
            strOwner += owner + ' (' + owner.tag + ')';
            if ( settings[ bot ].owners.length > 2 && i < settings[ bot ].owners.length ) {
              strOwner += ', ';
            } else if ( settings[ bot ].owners.length > 2 && i === settings[ bot ].owners.length ) {
              strOwner += ', and ';
            } else if ( settings[ bot ].owners.length === 2 ) {
              strOwner += ' and ';
            }
          } ),
          strOwner += '.\n',
          strLastRestart = 'I\'ve been online ' +
            ( objUptime.weeks !== 0 ? '**' + objUptime.weeks + '**w ' : '' ) +
            ( objUptime.days !== 0 ? '**' + objUptime.days + '**d ' : '' ) +
            ( objUptime.hours !== 0 ? '**' + objUptime.hours + '**h ' : '' ) +
            ( objUptime.minutes !== 0 ? '**' + objUptime.minutes + '**m ' : '' ) +
            ( objUptime.seconds !== 0 ? '**' + objUptime.seconds + '**s ' : '' ) +
            ' since:\n\t' + ( new Date( ( new Date( ) ).valueOf() - message.client.uptime ) ).toLocaleDateString( 'en-US', objTimeStringHQ ),
          intGuilds = message.client.guilds.size,
          intGuildsList = 3,
          intTopIndex = ( intGuilds < intGuildsList ? intGuilds : intGuildsList ),
          strGuildsValue = ' ',
          await message.client.guilds.array().sort( function( a, b ){ return b.memberCount - a.memberCount; } ).forEach( function( guild, intGuildIndex ) {
            if ( arrArgs[ 0 ] && arrArgs[ 0 ].toUpperCase() === 'LIST' ) {
              var strThisGuildIndexEmojii = ':';
              if ( intGuildIndex < 10 ) {
                strThisGuildIndexEmojii += strOrdinalEmoji[ ( intGuildIndex + 1 ) ] + ':';
              } else {
                var intGuildIndexParse = intGuildIndex + 1;
                intGuildIndexParse.toString().split( '' ).forEach( function( digit ){
                  strThisGuildIndexEmojii += strOrdinalEmoji[ ( digit ) ] + '::';
                } );
              }
              strGuildsValue += strThisGuildIndexEmojii + ' [**' + guild.name + '**]() (**' + guild.memberCount.toLocaleString( 'en-US' ) + '**)\t';
            } else {
              if ( intGuildIndex < intGuildsList ) {
                strGuildsValue += ':' + strOrdinalEmoji[ ( intGuildIndex + 1 ) ] + ':\t[**' + guild.name + '**]()\t(**' + guild.memberCount.toLocaleString( 'en-US' ) + '**)\n';
              } else if ( intGuildIndex >= intGuildsList && message.guild.id === guild.id ) {
                var strThisGuildIndexEmojii = '\n:';
                if ( intGuildIndex < 10 ) {
                  strThisGuildIndexEmojii += strOrdinalEmoji[ ( intGuildIndex + 1 ) ] + ':';
                } else {
                  var intGuildIndexParse = intGuildIndex + 1;
                  intGuildIndexParse.toString().split( '' ).forEach( function( digit ){
                    strThisGuildIndexEmojii += strOrdinalEmoji[ ( digit ) ] + ':';
                  } );
                }
                strGuildsValue += strThisGuildIndexEmojii + '\t[**' + guild.name + '**]()\t(**' + guild.memberCount.toLocaleString( 'en-US' ) + '**)\n';
              }
              if ( intGuilds > 3 ) {
                strTopIndex = '\nTop ' + strOrdinalEmoji [ intTopIndex ] + ' by server population' +
                  ( intGuildIndex > intTopIndex ? ' (and where you fit in) ' : ' ' ) + 'are:';
              } else if ( intGuilds > 1 ) {
                strTopIndex = '\nListed by server population:';
              }
            }
            if ( message.guild.id === guild.id ) {
              strCurrentGuildName += ' #' + ( intGuildIndex + 1 );
            }
          } ),
          strGuildsName = 'I\'m in a total of ' + intGuilds + ' Discord guilds.' + strTopIndex,
          strCurrentGuildValue += '**Users: ' + intUsers + '**; ' +
            'Humans: ' + intHumans + ' ( ' + Math.round( ( intHumans / intUsers ) * 100 ) + '% ); ' +
            'Bots: ' + intBots + ' ( ' + Math.round( ( intBots / intUsers ) * 100 ) + '% )\n',
          strCurrentGuildValue += ( message.guild.large ? '\t *User count data for large guilds may be inaccurate.*\n' : '' ),
          await message.guild.channels.array().forEach( function( channel, intChannelIndex ) {
            if ( channel.type === 'text' ){
              intTextChannels++;
            } else {
              intVoiceChannels++;
            }
          } ),
          strCurrentGuildValue += '**Channels: ' + intChannels + '**; ' +
            'Text: ' + intTextChannels + ' ( ' + Math.round( ( intTextChannels / intChannels ) * 100 ) + '% ); ' +
            'Voice: ' + intVoiceChannels + ' ( ' + Math.round( ( intVoiceChannels / intChannels ) * 100 ) + '% )\n',

          strCurrentGuildValue += '**Joined: **' + strJoinedTimestamp + '\n',
          await arrMyRoles.forEach( function( strMyRole, intMyRoleIndex ) {
            if ( intMyRoleIndex === ( arrMyRoles.length - 1 ) ) {
              strMyRoles += ', and ';
            } else if ( intMyRoleIndex !== 0 ) {
              strMyRoles += ', ';
            }
            strMyRoles += '<@&' + strMyRole + '>';
          } ),

          strCurrentGuildValue += '**Roles: ' + intRoles + '**; ' +
            'My **' + arrMyRoles.length + '** roles: ' + strMyRoles
        ] ).then( () => {
          var aboutBot = new Discord.RichEmbed()
            .setTitle( 'About me, ' + message.client.user.tag )
            .setDescription( strBotType + strDebugServer + strInviteMe + strOwner + strLastRestart )
            .setThumbnail( message.client.user.displayAvatarURL )
            .setColor( message.guild.me.displayHexColor )
            .addField( strGuildsName, strGuildsValue)
            .addField( strCurrentGuildName, strCurrentGuildValue )
          .addField( 'Total users served:', message.client.users.array().length, true )
          .addField( 'Memory usage:', ( Math.round( ( process.memoryUsage().rss / 1024 / 1024 * 100 ) ) / 100 ) + 'MB', true )
            .setTimestamp()
            .setFooter( '... as requested by ' + message.author.tag + '.', message.author.displayAvatarURL );
          response.edit( '**Here is some information about me:**', { embed: aboutBot } ).catch( error => {
            console.log( response );
            console.log( 'Attempting to edit an "!about" response failed with error: ' + error );
            message.channel.send( 'Editing last message failed, here\'s your result:', { embed: aboutBot } ).catch( console.error );
          } );
        } );
      } catch ( error ) {
        response.edit( 'Attempting to edit an "!about" response failed with error: ' + error );
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
/*    case 'announce' :
      message.client.guilds.forEach( function( guild ){
        message.client.guilds.get( guild.id ).defaultChannel.send( arrArgs.slice( 1 ).join( ' ' ) );// FIX defaultChannel CHANGES!!!!!!!
      } );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;// */
    case 'badgebar' : 
      message.channel.send( 'https://cdn2.project-gc.com/BadgeBar/' + encodeURI( strUserName ).replace( '&', '%26' ) +'.png' );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'clean' :
    case 'clear' :
      if ( isAdmin || isOwner ) {
        var intMessagesToDelete = ( arrArgs.length === 0 ? 1 : parseInt( arrArgs[ 0 ] ) );
        message.channel.fetchMessages( {
          limit: 100
        } ).then( messages => {
          let arrMessages = messages.array();
          arrMessages = arrMessages.filter( thisMessage => thisMessage.author.id === client.user.id );
          arrMessages.length = intMessagesToDelete;
          arrMessages.map( thisMessage => thisMessage.delete( { reason: '!' + command + 'ed ' + ( arrArgs[ 0 ] !== undefined ? arrArgs[ 0 ] : '1' ) + ' message' + ( arrArgs[ 0 ] == 1 ? '' : 's' ) + '.' } ).catch( errDel => { console.error( 'Unable to delete ' + ( arrArgs[ 0 ] !== undefined ? arrArgs[ 0 ] : '1' ) + ' message' + ( arrArgs[ 0 ] == 1 ? '' : 's' ) + ' in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errDel ); } ) );
        } );
      }
      else {
        message.react( '%E2%9D%8C' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react refusing to `!clean` or `!clear`: ' + errReact ); } );
        message.author.send( 'I\'m sorry, ' + message.author.tag + ', but you can\'t delete my messages in the `' + message.guild.name + '` server.' )
          .then( dm => {
            message.react( '%E2%9C%85' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '):  attempting to react in DM refusing to `!clean` or `!clear`' + errReact ); } );
          } ).catch( errSend => {
            message.react( '%E2%9D%8C' ).then( r => {
              message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
            } ).catch( errReact => {
              message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^ @here' );
              console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errReact );
            } );
            console.log( 'Unable to reply via DM to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errSend );
          } );
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'config' :
      switch ( arrArgs[ 0 ] ) {
        case 'debug' :
          var debugParameter;
          if ( arrArgs[ 0 ] ) {
            debugParameter = arrArgs[ 0 ].trim().toLowerCase();
          }
          if ( arrArgs[ 0 ] && debugParameter === 'state' ) {
            if ( isDebug ) {
             message.react( '1%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react to `!config` getting debug state (on): ' + errReact ); } );
            } else {
             message.react( '0%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react to `!config` getting debug state (off): ' + errReact ); } );
            }
          }
          else if ( isOwner ) {
            var msgToggle, boolUpdateDebugMode = true;
            var toggle = await toBoolean( debugParameter );
            var strToggle = await ( toggle || ( toggle && !isDebug ) ? 'on' : 'off' );
            msgToggle = await client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is attempting to turn ' + strToggle + ' debug mode for_ ' + message.author );
            if ( ( isDebug && toggle ) || ( !isDebug && !toggle ) ) {
              await msgToggle.edit( '_debug mode was already ' + strToggle + '_' );
              await msgToggle.react( '%F0%9F%A4%A6' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react to `!config` saying debug already on or off: ' + errReact ); } );
              message.delete().catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to delete msg requesting to `!config` debug to existing state: ' + errDel ); } );
              boolUpdateDebugMode = false;
            } else if ( toggle ) {
              isDebug = true;
            } else if ( !toggle ) {
              isDebug = false;
            } else {
              isDebug = !isDebug;
            }
            if ( boolUpdateDebugMode ) {
              objTempDB.isDebugMode = isDebug;
              strTempDB = JSON.stringify( objTempDB );
              fs.writeFile( fsTempDB, strTempDB, ( errWrite ) => {
                if ( errWrite ) {
                  throw errWrite;
                } else {
                   if ( isDebug ) {
                    msgToggle.edit( '_debug mode is now on_' );
                    msgToggle.react( '1%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react to `!config` saying debug is now on: ' + errReact ); } );
                  } else {
                    msgToggle.edit( '_debug mode is now off_' );
                    msgToggle.react( '0%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react to `!config` saying debug is now off: ' + errReact ); } );
                  }
                  message.delete().catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to delete msg confirming `!config` debug toggled: ' + errDel ); } );
                }
              } );
            }
          }
          client.user.setStatus( 'online' );
          isBotIdle = false;
          break;
        case 'game' :
          client.user.setPresence( { activity: { name: strArgs } } );
          client.user.setStatus( 'online' );
          isBotIdle = false;
          break;
        case 'host' :
          client.user.setPresence( { activity: { name: 'a host of ' + arrArgs[ 0 ], url: 'https://www.twitch.tv/' + arrArgs[ 0 ].toLowerCase() } } );
          client.user.setStatus( 'online' );
          isBotIdle = false;
          break;
        case 'status' :
          client.user.setPresence( { status: arrArgs[ 0 ] } );
          client.user.setStatus( 'online' );
          isBotIdle = false;
          break;
        case 'stream' :
          client.user.setPresence( { game: { name: client.user.presence.game.name, url: arrArgs[ 0 ] } } );
          client.user.setStatus( 'online' );
          isBotIdle = false;
          break;
        case 'unhost' :
    //      console.log( message.author.tag + ' told me to unhost.' );// TRON
          message.client.user.setPresence( settings[ bot ].game ).then( () => {
            message.react( '%E2%9C%85' ).then( MessageReaction => {
              console.log( "I\'m no longer in host mode." );
            } ).catch( errReact => {
              console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errReact );
              message.reply( "I\'m no longer in host mode." );
            } );
          } );
          client.user.setStatus( 'online' );
          isBotIdle = false;
          break;
        default :
          message.channel.send( 'Sorry, you didn\'t mention something you can config.' );
      }
      break;
    case 'c2f' :
      if ( command === 'c2f' ) {
        arrArgs.reverse().push( 'C2F' );
        arrArgs.reverse();
      }
    case 'f2c' :
      if ( command === 'f2c' ) {
        arrArgs.reverse().push( 'F2C' );
        arrArgs.reverse();
      }
    case 'convert' :
      if ( arrArgs.length === 2 ) {
        var strConversionType = arrArgs[ 0 ].toUpperCase();
        switch ( strConversionType ) {
          case 'C2F' :
            var dblCelsius = arrArgs[ 1 ];
            var dblFahrenheit = ( Math.round( ( ( dblCelsius * ( 9 / 5 ) ) + 32 ) * 10 ) / 10 );
            var strConverted = dblCelsius + '\u00B0C is equal to ' + dblFahrenheit + '\u00B0F.';
            break;
          case 'F2C' :
            var dblFahrenheit = arrArgs[ 1 ];
            var dblCelsius = ( Math.round( ( ( dblFahrenheit - 32 ) / 9 * 5 ) * 10 ) / 10 );
            var strConverted = dblFahrenheit + '\u00B0F is equal to ' + dblCelsius + '\u00B0C.';
            break;
          default :
            strConverted = 'I\'m sorry, I don\'t know how to process a `' + arrArgs[ 0 ] + '` conversion.';
        }
      }
      else if ( arrArgs.length === 1 ) {
        const arrConversionOptions = [ 'C2F', 'F2C' ];
        if ( arrConversionOptions.indexOf( arrArgs[ 0 ].toUpperCase() ) != -1 ) {
          strConverted = 'you seem to have forgotten to give me something to do a ' + arrArgs[ 0 ] + ' conversion on.';
        }
        else {
          strConverted = 'you seem to have forgotten to tell me what I\'m supposed to convert `' + arrArgs[ 0 ] + '` from and to.';
        }
      }
      message.reply( strConverted );
      break;
    case 'dm' :
      if ( isOwner || isAdmin ) {
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
    case 'donate' :
      message.author.send( 
        'You can help with the development of this bot and its brother and sister bots by contributing to the developer:' +
        '\n\t**PayPal "Discord bot" pool:** <https://paypal.me/pools/c/82z3HDuQ3y>' +
        '\n\t**Geocaching Gift Membership:** <https://goo.gl/XaPXKj>'
      ).then( async dm => {
        await message.react( '%E2%9C%85' ).catch( errReactDM => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react in DM to `!donate`: ' + errReactDM ); } );
        console.info( message.author.tag + ' just received a DM with the link to donate in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + '!' );
      } ).catch( errSendDM => {
        message.react( '%E2%9D%8C' ).then( r => {
          message.reply( ' since you are not set to accept DMs from members of this server...' +
            '\n\tYou can help with the development of this bot and its brother and sister bots by contributing to the developer:' +
            '\n\t\t**PayPal "Discord bot" pool:** <https://paypal.me/pools/c/82z3HDuQ3y>' +
            '\n\t\t**Geocaching Gift Membership:** <https://goo.gl/XaPXKj>' );
          console.info( message.author.tag + ' just received the link to donate in ' + message.guild.name + '#' + message.channel.name + ' (because they are blocking DMs) at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + '!' );
        } ).catch( errBlocked => {
          message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to see the information they requested?  I\'d appreciate it. :slight_smile: ^^  @here' );
          console.error( 'Unable to react to ' + message.author.tag + '\'s request for donation information in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errBlocked );
          console.info( message.author.tag + ' has requested the link to donate in ' + message.guild.name + '#' + message.channel.name + ' but has not yet gotten the information (because they are blocking me) at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + '!' );
        } );
      } );
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
                message.delete( { reason: 'Deleting completed request to edit a message of mine.' } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to delete a request to `!edit` message ' + thisMessage + ': ' + errDel ); } );
              }, 7500 );
            } ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react success to a request to `!edit` a message of mine: ' + errReact ); } );
          }
          ).catch( errEdit => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to `!edit` a message of mine: ' + errEdit ); } );
        } );
      }
      else {
        message.react( '%E2%9D%8C' ).then( r => {
          message.client.setTimeout( function(){
            message.delete( { reason: 'Deleting rejected request to edit a message of mine.' } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to delete rejected request to `!edit` a message of mine: ' + errDel ); } );
          }, 2500 );
        } ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') attempting to react to reject request to `!edit` a message of mine: ' + errReact ); } );
        message.author.send( 'I\'m sorry, ' + message.author.tag + ', but you can\'t edit my messages in the `' + message.guild.name + '` server.' )
          .then( dm => {
            message.react( '%E2%9C%85' ).catch( errReactDM => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReactDM ); } );
          } ).catch( errSendDM => {
            message.react( '%E2%9D%8C' ).then( r => {
              message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
            } ).catch( errReactDM => {
              message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^ @here' );
              console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errReactDM );
            } );
            console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + errSendDM );
          } );
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'encourage' :
      if ( !isBot ) {
        message.delete().then( async delTrigger => {
          function getRand( intMin, intMax ) {
            if ( intMin === undefined ) { intMin = 1; }
            if ( intMax === undefined ) { intMax = 6; }
            return Math.floor( Math.random() * intMax ) + intMin;
          }
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
      break;
    case 'foobar' :
      message.delete()
        .then( async delTrigger => { message.reply( '__**NO `!foobar` FOR YOU!**__' ); } )
        .catch( errDel => {
        message.reply( 'I am unable to process your request.  Please ask ' + message.guild.owner.user.tag + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ).then( replySuccess => { replySuccess.edit( message.author + ', I am unable to process your request.  Please ask ' + message.guild.owner.user + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ) } );
      } );
      break;
    case 'ftf' :
      var objFTF = await message.channel.send( 'There are two ways for Project-GC to detect your FTFs (**F**irst **T**o **F**inds). Either you tag your logs with one of these tags: `{*FTF*}`, `{FTF}`, or `[FTF]`. Alternatively you can add an FTF bookmark list under <https://project-gc.com/User/Settings/> that will be checked once per day. Please understand that FTF isn\'t anything offical and not everyone tags their FTFs. Therefore this list won\'t be 100% accurate.' );
      message.delete( { reason: 'Cleaning up request for `!FTF` information.' } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') while attempting to delete the request for FTF information: ' + errDel ); } );
      objFTF.react( '1%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') while attempting to react to the result of the request for FTF information: ' + errReact ); } );
      break;
    case 'glossary' :
      message.channel.send( 'You may be able to find information about `' + strArgs + '` on the offical Geocaching.com glossary page at: <https://www.geocaching.com/about/glossary.aspx#' + strArgs.toLowerCase().replace( ' ', '' ) + '>' );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
/*    case 'hint' :
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;//*/
    case 'help' :
      message.author.send( 'Hello ' + message.author + '!  I have the following commands:\n' ).then( async dm => {
        await message.react( '%F0%9F%93%97' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') while attempting to react to the request for help command: ' + errReact ); } );
        await message.author.send(
          '\n\n\n__Commands for everyone:__\n' +
          '\n\t:green_book:\t**`about`**: This command gives you information about me, ' + message.client.user + '#' + message.client.user.discriminator +
          '\n\t:green_book:\t**`badgebar`**: Get the URL to the Project-GC badgebar image for defined user' +
          '\n\t\t\t\t(or yourself by Discord server nick).' +
          '\n\t:closed_book:\t**`debug`**: Only my owners can (dis|en)able my debugging mode,' +
          '\n\t\t\t\tbut you can see if it is on or off with `!debug state`.' +
          '\n\t:green_book:\t**`donate`**: If you enjoy this bot, please consider donating to the developer: <https://goo.gl/FZ3g6g>' +
          '\n\t:green_book:\t**`ftf`**: What does `FTF` stand for?' +
          '\n\t:green_book:\t**`glossary`**: Get a direct link to a term from the official glossary.' +
          '\n\t:green_book:\t**`help`**: This command response!' +
//          '\n\t:green_book:\t**`hint`**: ' +
          '\n\t:green_book:\t**`inviteme`**: This will give you a link to have me on your server.' +
          '\n\t:green_book:\t**`karma`**: What is karma?' +
          '\n\t:green_book:\t**`lmgtfy`**: Let me Google that for You!' +
          '\n\t:green_book:\t**`lookup`**: Geocaching.com search feature' +
          '\n\t:green_book:\t**`pathtag`**: Lookup information on a pathtag *[currently by serial (**code on coin**) only]*' +
          '\n\t:green_book:\t**`ping`**: Test the speed of my connection to Discord.' +
          '\n\t:green_book:\t**`poll`**: Do a poll on your server:' +
          '\n\t\t\t\t\t`!poll Question to poll? || :one: || :two: || :three:`' +
//          '\n\t:green_book:\t**`profilestats`**: Get the URL to the Project-GC profile image for defined user (or yourself).' +
          '\n\t:green_book:\t**`react`**: Make me react to a comment with an emoji!' +
          '\n\t:green_book:\t**`say`**: Make me say something!' +
          '\n\t:green_book:\t**`statbar`**: Get the URL to the Project-GC statbar image for defined user' +
          '\n\t\t\t\t(or yourself by Discord server nick).' +
          '\n\t:green_book:\t**`8ball`**: Magic 8-ball!  Ask me a question!' +
          '\n\t:green_book:\t**`twitter`**: Request a post on the official `@GeocacheME_` twitter feed'// +
//          '\n\t:green_book:\t**`welcome`**: '
        ).catch( errSend => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') sending a DM to ' + message.author.tag + ': ' + errSend ); } );
        if ( isAdmin ) {
          await message.react( '%F0%9F%93%99' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
          await message.author.send(
            '\n\n\n__Commands for `ADMINISTRATOR`s:__\n' +
            '\n\t:orange_book:\t**`clean`** or **`clear`**: Delete messages of mine in the current channel.' +
            '\n\t:orange_book:\t**`edit`**: Did someone make me `!say` something that you wish you could edit?' +
            '\n\t\t\t\tUse: `!edit <messageID> <New content goes here!>`'
          ).catch( errDM => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDM ); } );
        }
        if ( isOwner ) {
          if ( !isAdmin ) {
            await message.author.send(
              '\n\n\n__Commands for `ADMINISTRATOR`s:__\n' +
              '\n\t:orange_book:\t**`clean`** or **`clear`**: Delete messages of mine in the current channel.' +
              '\n\t:orange_book:\t**`edit`**: Did someone make me `!say` something that you wish you could edit?' +
              '\n\t\t\t\tUse: `!edit <messageID> <New content goes here!>`'
            ).catch( errDM => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDM ); } );
          }
          await message.react( '%F0%9F%93%95' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
          await message.author.send(
            '\n\n\n__Owner only commands:__\n' +
  //          '\n\t:closed_book:\t**`announce`**: Make me announce something to all servers I am currently in.' +
            '\n\t:closed_book:\t**`game`**: Change my game.' +
            '\n\t:closed_book:\t**`host`**: Make me host a fellow streamer (Discord only).' +
  //          '\n\t:closed_book:\t**`join`**: Make me join a Discord server.' +
            '\n\t:closed_book:\t**`part`**: Make me leave a Discord server.' +// Move to isAdmin list?
            '\n\t:closed_book:\t**`restart`**: Restart me!' +
            '\n\t:closed_book:\t**`status`**: Set my status to active, idle, or do not disturb.' +
            '\n\t:closed_book:\t**`stream`**: Set my stream URL.' +
            '\n\t:closed_book:\t**`unhost`**: End my hosting of a streamer (Discord only).'
          ).catch( errDM => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDM ); } );
        }
        await message.react( '%E2%9C%85' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
      } ).catch( errDM => {
        message.react( '%E2%9D%8C' ).then( r => {
          message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
        } ).catch( errReact => {
          message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^  @here' );
          console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errReact );
        } );
      } );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'inviteme' :
      message.client.fetchApplication().then( client => { message.channel.send( 'You can invite me to your channel! Please visit: ' +
        '<https://discordapp.com/api/oauth2/authorize?client_id=' + client.id + '&scope=bot&permissions=8>' ); } );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'hooker':
      if ( isOwner ) {
        message.delete();
        let hookArgs = strArgs.trim().split( '||' );
        if ( hookArgs.length < 2 ) {
          return hook( message.channel, 'Hook Usage', '`!hook <title> || <message> || [HEXcolor] || [avatarURL]`\n\n**`<>` parts are required**\n**`[]` parts are optional**' );
        } else if ( hookArgs[ 0 ].match( /<@!?(\d*)>/ ) ) {
          let mbrID = hookArgs[ 0 ].match( /<@!?(\d*)>/ )[ 1 ];
          let user = await message.client.fetchUser( mbrID );
          let userName = await ( message.guild.members.get( user.id ).nickname || user.username );
          hook( message.channel, userName, hookArgs[ 1 ], hookArgs[ 2 ], user.avatarURL );
        } else {
          hook( message.channel, hookArgs[ 0 ], hookArgs[ 1 ], hookArgs[ 2 ], hookArgs[ 3 ] );
        }        
      } else {
        message.delete();
        message.author.send( 'Uh-uh-uh, you didn\'t say the majic word!' );
        console.info( '%o tried to use `!hooker %o` in %o#%o', message.author.tag, strArgs, message.guild.name, message.channel.name );
      }
      break;
    case 'karma' :
      var strCacher = 'Technical_13';
      var intFinds = 547;
      var arrLogs = [ 28, 39, 23, 22, 15, 4, 33, 68, 64, 50, 30, 18, 40, 24, 41, 12, 2, 5, 27, 27, 13, 12, 15, 7, 13, 10, 8, 2, 0, 0 ];
      var intLogsTotal = 0;
      if ( strArgs ) {
        if ( strArgs.match( /<@!?(\d*)>/ ) ) {
          var arrCachers = strArgs.match( /<@!?(\d*)>/ );
          var intCacher = arrCachers[ 0 ].replace( /(<@!?|>)/g, '' );
          var objCacher = await message.guild.fetchMember( intCacher );
          strCacher = ( objCacher.nickname || objCacher.user.username );
          strArgs = strArgs.replace( arrCachers[ 0 ], '' ).trim();
        } else if ( strArgs.match( /(\D*)?( \d*)*/ ) ) {
          strCacher = strArgs.match( /(\D*)?( \d*)*/ )[ 0 ];
          strArgs = strArgs.replace( strCacher, '' ).trim();
        }
        if ( strArgs ) {
          arrArgs = strArgs.split( ' ' );
          intFinds = arrArgs[ 0 ];
          if ( arrArgs[ 1 ] ) {
            arrLogs = arrArgs.slice( 1 );
          }
        }
      }
      var strExample = 'For example, ' + strCacher + ' has created ' + arrLogs.length + ' geocache';
      if ( arrLogs.length === 1 ) {
        intLogsTotal += parseInt( arrLogs[ 0 ] );
        strExample += '. It has a total of ' + arrLogs[ 0 ];
      } else {
        strExample += 's.  They have recieved ';
        arrLogs.forEach( function( intLog, idx ) {
          intLogsTotal += parseInt( intLog );
          strExample += intLog;
          if ( arrLogs.length > 2 ) {
            if ( idx < ( arrLogs.length - 2 ) ) {
              strExample += ', ';
            } else if ( idx < ( arrLogs.length - 1 ) ) {
              strExample += ', and ';
            }
          } else if ( arrLogs.length === 2 && idx === 0 ) {
            strExample += ' and ';
          }
        } );
        strExample += ' respective log entries for a total of ' + intLogsTotal;
      }
      strExample += ' log' + ( intLogsTotal === 1 ? '' : 's' ) + ' received.  ' + strCacher + ' has logged ' + intFinds + ' cache' + ( intFinds === 1 ? '' : 's' ) + ' as <:TFTC:456901919579832320> that others have created.  This will give them a karma score of: ' + intLogsTotal + '/' + intFinds + ' = ' + ( Math.floor( ( intLogsTotal / intFinds ) * 100 ) / 100 ) + '.';
      var objKarma = await message.channel.send( 'Caching karma equals the number of logs you have received on your caches from other cachers divided by the number of caches you have logged. A karma above 1.00 is normally preferred. The idea is that you should give back to the community at the same time as you use it. In other words, hide caches, not only log others.\n\n' + strExample );
      message.delete( { reason: 'Cleaning up request for `!Karma` information.' } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + ') while attempting to delete the request for karma information: ' + errDel ); } );
      break;
    case 'lmgtfy' :
      var q = encodeURI( strArgs.replace( / /g, '+' ) );
      message.channel.send( '<https://lmgtfy.com/?q=' + q + '>' );
      break;
    case 'lookup' :
      message.channel.send( 'You can search for **' + arrArgs[ 0 ].toUpperCase() + '** on the official geocaching website: https://www.geocaching.com/play/search/?origin=' + arrArgs[ 0 ].toUpperCase() );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
/*    case 'part' :
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;//*/
    case 'pathtag' :
    /* Pathtag logging:
    /// Hello!  I am SignalBOT - a https://Discord.me/Geocaching bot! I have a special `!pathtag <code on coin>` command that makes it easier for people to look up and share what a coin they found looks like on Discord with information about who owns it and some other information.  When a Discord user asks me to look up a coin for them, I first delete the request so that the ID on the coin isn't shared anymore than it has to be, then I try to show them what the coin looks like.  Check it out!
    */
      message.delete( { reason: 'Deleting PathTag serial code.' } ).then( async delTrigger => {
        const strPathTag = arrArgs[ 0 ];
        const isSerial = /^[0-9a-zA-Z]+$/.test( strPathTag );
        const isTagID = /^#[0-9]+$/.test( strPathTag );
        if ( !( ( strPathTag.length == 6 || strPathTag.length == 7 ) && isSerial ) && !isTagID ) {
          message.reply( '`' + strPathTag + '` is not a valid pathtag serial code.  Please check the code and try again.' );
        }
        else if ( isTagID ) {
          message.reply( 'Lookup by ID number (`' + strPathTag + '`) is not yet supported.  Please use the pathtag serial code from the coin.  **SOON**:tm:' );
        }
        else {// Passed all client side checks, let's look at the server
          var msgPathtag = await message.channel.send( message.author + ', I\'m looking up that pathtag as you requested.' );
          var msgPathtagEmbed = new Discord.RichEmbed()
            .setColor( '#1E62A1')
            .setAuthor( '© ' + ( new Date() ).getFullYear() + ' PathTags', 'https://cdn.discordapp.com/attachments/253912706824798209/407738631785152512/PathTags_icon.png' )
            .setThumbnail( 'http://www.pathtags.com/community/blueprints/5035/blueprint.jpg' )
            .setTimestamp()
            .setFooter( '... as requested by ' + message.author.tag + '.', message.author.avatarURL );
          unirest.get( qPathTags.url + 'tag.php/gettagimg/' + strPathTag + '/500/' + qPathTags.authkey + '?apikey=' + qPathTags.apikey )
            .header( 'type', 'GET' )
            .header( 'dataType', qPathTags.dataType )
            .end( function ( objTagImage ) {
              objTagImage = JSON.parse( objTagImage.body );
              var strGetTagImg = JSON.stringify( objTagImage );
              fs.appendFile( qPathTags.log, ',\n{"logger":{"id":' + message.author.id + ',"tag":"' + message.author.tag + '"},"serial":"' + strPathTag + '","API_response":' + strGetTagImg + '}', ( errWrite ) => {
                if ( errWrite ) throw errWrite;
                console.log( message.author.tag + ' (' + message.author + ') looked up serial: ' + strPathTag );
              } );
              qPathTags.tagid = objTagImage.tagid;
              qPathTags.thumbUrl = 'http://www.pathtags.com/community' + objTagImage.imagehref;
              unirest.get( qPathTags.url + 'tag.php/getpublictagprofile/' + qPathTags.tagid + '/' + qPathTags.authkey + '?apikey=' + qPathTags.apikey )
  //              unirest.get( qPathTags.url + 'collection.php/gettag/' + qPathTags.tagid + '/' + qPathTags.authkey + '?apikey=' + qPathTags.apikey )
                .header( 'type', 'GET' )
                .header( 'dataType', qPathTags.dataType )
                .end( function ( objTagProfile ) {
                  fs.writeFile( './PathTag logs/' + strPathTag + '.json', JSON.stringify( objTagProfile ), ( errWrite ) => {
                    if ( errWrite ) throw errWrite;
                    console.log( message.author.tag + ' (' + message.author + ') looked up id: ' + qPathTags.tagid );
                  } );
                  if ( !objTagProfile.body || ( objTagProfile.statusCode !== 200 && objTagProfile.statusCode !== 404 ) ) {
                    message.channel.send( 'Attempting to retrieve the pathtag information for **' + strPathTag + '** resulted in an error.  My owner has been notified.' );
                    message.client.channels.get( settings[ bot ].debug[ 0 ] ).send( message.author + ' attempted to retrieve information for a pathtag which resulted in a statusCode of `' + objTagProfile.statusCode + '`.  <@' + settings[ bot ].owners[ 0 ] + '>, check the console for details.' );
                    console.log( 'A request to retrieve the pathtag information for "' + strPathTag + '" by ' + message.author.tag + ' in #' + message.channel.name + ' of "' + message.guild + '" resulted in a ' + objTagProfile.statusCode + ' status code.  Full objTagProfile: ' + JSON.stringify( objTagProfile ) );
                  }
                  else if ( objTagProfile.statusCode === 404 || parsePathTagResponse( objTagProfile ).response_status === 'error' ) {
                    msgPathtagEmbed
                      .setTitle( 'PathTags says:' )
                      .setDescription( '**404**: ' + parsePathTagResponse( objTagProfile ).response_body );
                  }
                  else {
                    var strPathTagDescription = parsePathTagResponse( objTagProfile )
                      .taginfo[ 0 ].profiletext
                      .replace( /<a href=\"(.*?)\"(?:.*?)>(.*?)<\/a>/gi, '[$2]( $1 )' )
                      .replace( /&nbsp;/gi, ' ' )
                      .replace( /<br data-mce-bogus="1">/gi, '' )
                      .replace( /<br(.*?)?>/gi, '\n' )
                      .replace( /<\/?p>/gi, '' );
                    if ( strPathTagDescription.length >= 1500 ) {
                      strPathTagDescription = 'Description length exceeds maximimum size allowed.  Please click on the linked title above to see the full description.';
                    }
                    msgPathtagEmbed
                      .setThumbnail( qPathTags.thumbUrl )
                      .setURL( 'http://www.pathtags.com/community/tag.php?id=' + qPathTags.tagid )
                      .setTitle( 'PathTag #' + qPathTags.tagid + ' - "' + parsePathTagResponse( objTagProfile ).taginfo[ 0 ].tagname + '"' )
                      .setDescription( strPathTagDescription )
                      .addField( 'Created by: ', '[' + parsePathTagResponse( objTagProfile ).taginfo[ 0 ].user_screenname + ']( http://www.pathtags.com/community/viewuserprofile.php?id=' + parsePathTagResponse( objTagProfile ).taginfo[ 0 ].ownerid + ' )', 1 )
                      .addField( 'Available from: ', '' + parsePathTagResponse( objTagProfile ).taginfo[ 0 ].created + '\n' + parsePathTagResponse( objTagProfile ).taginfo[ 0 ].moldexpirationdate, 1 );
                  }
                msgPathtag.edit( { embed: msgPathtagEmbed } );//*/
            } );
          } );
        }
        client.user.setStatus( 'online' );
        isBotIdle = false;
      } ).catch( errDel => {
        message.reply( 'I am unable to process your request.  Please ask ' + message.guild.owner.user.tag + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ).then( replySuccess => { replySuccess.edit( message.author + ', I am unable to process your request.  Please ask ' + message.guild.owner.user + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ) } );
      } );
      break;
    case 'perms' : case 'permission' : case 'permissions' :
      var objOwner = await message.client.fetchUser( settings[ bot ].owners[ 0 ] );
      if ( isOwner ) {
        message.author.send( 'My permissions for **' + message.guild.name + '** (' + message.guild.id + ') are <https://discordapi.com/permissions.html#' + message.guild.members.get( message.client.user.id ).permissions.bitfield + '>.' );
      }
      message.delete( { reason: 'Cleaning up request for permission information from ' + ( isAdmin ? 'an administrator.' : ( isOwner ? 'my owner.' : 'no-one special.' ) ) } ).then( delTrigger => {
        if ( isAdmin && !isOwner ) {
          message.author.send( 'You can view my permissions for **' + message.guild.name + '** (' + message.guild.id + ') on <https://discordapi.com/permissions.html#' + message.guild.members.get( message.client.user.id ).permissions.bitfield + '>.' );
        } else if ( !isOwner ) {
          message.author.send( 'I\'m sorry, you can\'t view my permissions in **' + message.guild.name + '**. Please contact my owner(s) if you think this message is in error.' );
          objOwner.send( message.author + ' attempted to acquire my permissions for ' + message.guild.name + ' (' + message.guild.id + '), but was unable to do so.' );
        }
      } ).catch( errDel => {
        if ( isAdmin && !isOwner ) {
          message.reply( 'I am unable to process your request.  Please ask ' + message.guild.owner.user.tag + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ).then( replySuccess => { replySuccess.edit( message.author + ', I am unable to process your request.  Please ask ' + message.guild.owner.user + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ) } );
        } else if ( !isOwner ) {
          message.author.send( 'I\'m sorry, you can\'t view my permissions in **' + message.guild.name + '**. Please contact my owner(s) if you think this message is in error.' );
          objOwner.send( message.author + ' attempted to acquire my permissions for ' + message.guild.name + ' (' + message.guild.id + '), but was unable to do so.' );
        }
      } );
      break;
    case 'ping' :
      var msgWait = await message.channel.send( message.author + ', Pong!  The heartbeat ping is ' + Math.round( message.client.ping ) + 'ms!' );
      msgWait = await msgWait.edit( message.author + ', Pong!  Gathering round-trip time...  The heartbeat ping is ' + Math.round( message.client.ping ) + 'ms!' );
      msgWait.edit( message.author + ', Pong!  The message round-trip took ' + Math.round( ( new Date() ).valueOf() - msgWait.createdTimestamp ) + 'ms.  The heartbeat ping is ' + Math.round( message.client.ping ) + 'ms!' ).catch( console.error );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
//    case 'profile' :
      /* profile search */
//      client.user.setStatus( 'online' );
//      isBotIdle = false;
//      break;
    case 'poll' :
      var arrArgs = strArgs.split( '||' );
      var rxp = /<:(.*)?:([\d]*)>/;
      var thisPoll = await message.channel.send( '**POLL:** ' + arrArgs[ 0 ] );
      var r = 1;
      do {
        var reaction = arrArgs[ r ].trim();
        if ( rxp.test( reaction ) ) {
          reaction = reaction.match( rxp )[ 2 ];
        }
        else {
          reaction = encodeURI( reaction );
        }
        await thisPoll.react( reaction ).then( () => { r++; } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
      } while ( r < arrArgs.length );
      message.delete( { reason: 'Deleting posted poll question.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'profilestats' :
      message.channel.send( 'https://cdn2.project-gc.com/ProfileStatsImage/' + encodeURI( strUserName ).replace( '&', '%26' ) );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'react' :
        var rxp = /<:(.*)?:([\d]*)>/;
        var guild, channel, thisMessage, reaction;
        var isReaction = true;
        var isDeleted = false;
        if ( arrArgs[ 3 ] ) {
          if ( !message.client.guilds.find( 'id', arrArgs[ 3 ] ) ) {
            isReaction = false;
            message.react( '%E2%9D%8C' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            message.reply( 'I\'m not in guild with id: `' + arrArgs[ 3 ] + '`' );
          } else {
            guild = message.client.guilds.find( 'id', arrArgs[ 3 ] );
          }
        }
        else {
          guild = message.client.guilds.find( 'id', message.guild.id );
        }
        if ( isReaction && arrArgs[ 2 ] ) {
          if ( !guild.channels.find( 'id', arrArgs[ 2 ] ) ) {
            isReaction = false;
            message.react( '%E2%9D%8C' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            message.reply( 'I don\'t have access to the `' + arrArgs[ 2 ] + '` channel of the `' + guild.name + '` guild.' );
          } else {
            channel = guild.channels.find( 'id', arrArgs[ 2 ] );
          }
        }
        else if ( isReaction ) {
          channel = guild.channels.find( 'id', message.channel.id );
        }
    // Should be checking if bot has permission to react in the channel/
        let isMention = false;
        if ( arrArgs[ 1 ] !== undefined ) {
          if ( arrArgs[ 1 ].match( /<@!?(\d*)>/ ) !== null )  {
            if ( message.guild.members.get( arrArgs[ 1 ].match( /<@!?(\d*)>/ )[ 1 ] ) !== undefined ) {
              isMention = true;
            }
          }
        }
        if ( !arrArgs[ 1 ] ) {
          thisMessage = message.id;
        }
        else if ( arrArgs[ 1 ].toUpperCase() === 'LAST' ) {
          let msgList = message.channel.messages.array();
          thisMessage = msgList[ ( msgList.length - 2 ) ];
          message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          isDeleted = true;
        }
        else if ( isMention ) {
          thisMessage = message.guild.members.get( arrArgs[ 1 ].match( /<@!?(\d*)>/ )[ 1 ] ).lastMessageID;
          if ( thisMessage !== null ) {
            message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            isDeleted = true;
          }
          else {
            isReaction = false;
            message.react( '%E2%9D%8C' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            message.reply( 'I can\'t find ' + message.guild.members.get( arrArgs[ 1 ].match( /<@!?(\d*)>/ )[ 1 ] ) + '\'s last message.' );
          }
        }
        else {
          thisMessage = arrArgs[ 1 ];
          message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          isDeleted = true;
        }
    // Should be checking if bot is blocked by the user
        reaction = arrArgs[ 0 ];
        if ( rxp.test( reaction ) ) {
          reaction = reaction.match( rxp )[ 2 ];
        }
        else {
          reaction = encodeURI( reaction );
        }
        if ( isReaction ) {
          channel.fetchMessage( thisMessage ).then( objMsg => {
            objMsg.react( reaction ).then( reacted => {
              if ( !isDeleted ) {
                message.react( '%E2%9C%85' ).catch( e => { console.error( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e ); } ),
                message.react( reaction ).catch( e => { console.error( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e ); } )
              }
            }
            ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          } );
        }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
/*    case 'restart' :// RESTART DISABLED SINCE PM2 QUIT AND IT WON'T WORK LIKE THIS
      if ( isOwner ) {
        Promise.all( [
          message.delete( { reason: 'Processing `!restart` command.' } ).then( async message => {
            timeNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString ),
            message.client.user.setPresence( { status: 'dnd', afk: true, game: { name: 'restarting...', type: 'WATCHING' } } ),
            delNotice = await message.channel.send( '_is restarting as requested by ' + message.author + '._' ),
            console.log( message.author.username + ' ordered a restart at ' + timeNow ),
            delNotice.delete( 10000 );
          } ).catch( errDel => { console.error( 'Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errDel ); } )
        ] ).then( () => {
          process.exit( );
        } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;//*/
    case 'rot13' :
    case 'ceasar' :
      var intRotIndex = 13;
      var strArgs = arrArgs.join( ' ' );
    case 'rot' :
      if ( intRotIndex === undefined ) {
        var intRotIndex = parseInt( arrArgs[ 0 ] );
        var strArgs = arrArgs.slice( 1 ).join( ' ' );
      }
      message.channel.send( '`' + strArgs + '` becomes `' + rot( strArgs, 26 - intRotIndex ) + '` when parsed through a ROT' + intRotIndex + ' cipher.' );
      break;
    case 'roles' :
      var embRoles = new Discord.RichEmbed()
        .setColor( '#05884E' )
        .setTitle( 'Geocaching Discord progressive size role information:' )
        .setDescription( 'Welcome to the Geocaching Discord!  We often get asked what our size roles mean in here.  The idea is to take the concept of [cache size classifications]( <https://www.geocaching.com/help/index.php?pg=kb.chapter&id=97&pgid=815> ) and apply it to contributions to the Discord.  How helpful and chatty you are.\n**Planned automation:**\n\tPoints will be assigned from 10-25 per message based on a complex algorithm that has not yet been defined.\nIt\'ll be a scale of:\n:small_orange_diamond: 0-9 points == Nano\n:small_orange_diamond: 10-99 == Micro\n:small_orange_diamond: 100-999 == Small\n:small_orange_diamond: 1,000-19,999 == Regular\n:small_orange_diamond: 20K-49,999 == Large\n:small_orange_diamond: 50K+ == Huge' )
        .addField( 'Nano:', '<@&385598600467447808> is the starter role for this server.  You have this role until you say something... anything.' )
        .addField( 'Micro:', '<@&385598676896186369> says you\'ve now spoken in a channel!' )
        .addField( 'Regular:', '<@&385598707325730827> says you\'re getting pretty active in here, contributing to many discussions.' )
        .addField( 'Large:', '<@&385598747175944192> says you\'ve been here awhile and have shown great interest in chatting here!' )
        .addField( 'Huge:', '<@&385598764141903872> says you have hit the top of the ranking system, if you\'re not at least <@&385501075001573389> by now, you should probably inquire as to why. :wink:' );
        message.channel.send( 'A little bit about our size roles:', { embed: embRoles } );
      break;
    case 'say' :
      if ( isDebug ) {
        console.log( message.author.tag + ' asked me to say `' + strArgs + '`' + ( enableSay ? '' : ', but the say command is disabled' ) + '.' );
      }
      
      if ( arrArgs[ 0 ] === 'disable' ) {
        enableSay = false;
        message.channel.send( 'The `!say` command has been **disabled**.' );
        break;
      }
      
      if ( enableSay ) {
        if ( isOwner ) {
          message.delete( { reason: "Processing `!say` command mentioning @here or @everyone for my owner(s)." } ).then( msg => { msg.channel.send( strArgs ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
        } else if ( isCrown || isAdmin ) {
          message.delete( { reason: "Processing `!say` command mentioning @here or @everyone for " + ( isCrown ? "the owner" : " an admin" ) + " of this server." } ).then( msg => { msg.channel.send( strArgs ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
        } else if ( !message.mentions.everyone || ( message.mentions.everyone && !message.guild.large ) ) {
          message.delete( { reason: "Processing `!say` command." } ).then( msg => { msg.channel.send( strArgs.replace( '@everyone', message.author ).replace( '@here', message.author ) ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
          if ( message.mentions.everyone ) {
            console.log( message.author.tag + ' mentioned ' + ( strArgs.match( '@everyone' ) ? ( strArgs.match( '@here' ) ? '@everyone & @here' : '@everyone' ) : ( strArgs.match( '@here' ) ? '@here' : 'none' ) ) + ' in ' + message.guild.name + '#' + message.channel.name + ', but I didn\'t.' );
          }
        } else {
          message.delete( { reason: "Refusing `!say` command with a @here or @everyone for someone who\'s not a bot owner." } ).then( msg => { msg.channel.send( ", You\'re a n00b!  You can\'t make me mention that many people on a large server!" ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
        }
      } else {
        message.delete( { reason: "Processing `!say` command." } ).then( msg => { msg.author.send( 'Sorry, the `!say` command is not currently enabled.' ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
      }
      
      if ( arrArgs[ 0 ] === 'enable' ) {
        enableSay = true;
        message.channel.send( 'The `!say` command has been **enabled**.' );
      }
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'server' :
      if ( isOwner || message.member.permissions.has( 'MANAGE_GUILD' ) || message.member.permissions.has( 'CREATE_INSTANT_INVITE' ) ) {
        var inviteUrl = '';
        var channel = '';//message.guild.channels.get( guildWelcomeMesages[ guildID ].channel );// Once I put the welcome messages in a .json I can do this.
        if ( !channel ) {
          message.guild.channels.array().forEach( function ( defaultChannel ) {
            if ( !channel && defaultChannel.type === 'text' ) {
              channel = defaultChannel;
            }
          } );
        }
        await channel.createInvite( { maxAge: 0 } ).then( Invite => { inviteUrl = Invite.url; } ).catch( console.error );
        var response = await message.channel.send( 'Collecting data for your query, please stand by...' );
        var arrArgs = arrArgs,
          arrExplicitContentFilterEmoji = [ ':no_entry_sign::mag_right:', ':mag::bust_in_silhouette:', ':mag::family_mmgb:' ],
          arrVerificationLevelEmoji = [ ':new_moon_with_face:', ':waning_crescent_moon:', ':last_quarter_moon:', ':waxing_gibbous_moon:', ':full_moon:' ],
          arrRoles = message.guild.roles.array().sort( function( a, b ){ return b.position - a.position } ),
          strExplicitContentFilter = '',
          strRegion = '',
          strVerificationLevel = '',
          strRoles = '',
          intUsers = message.guild.memberCount,
          intHumans = 0,
          intBots = 0,
          intRoles = message.guild.roles.size,
          intChannels = message.guild.channels.size,
          intTextChannels = 0,
          intVoiceChannels = 0;
        
        if ( message.guild.explicitContentFilter >= 0 && message.guild.explicitContentFilter <= 2 ) {
          strExplicitContentFilter = arrExplicitContentFilterEmoji[ message.guild.explicitContentFilter ];
        } else {
          strExplicitContentFilter = ":grey_question:" + message.guild.explicitContentFilter + ":grey_question:";
        }
        
        switch ( message.guild.region ) {
          case "brazil" :
            strRegion = ":flag_br: Brazil";
            break;
          case "eu-central" :
            strRegion = ":flag_eu: Central Europe";
            break;
          case "hongkong" :
            strRegion = ":flag_hk: Hong Kong";
            break;
          case "russia" :
            strRegion = ":flag_ru: Russia";
            break;
          case "singapore" :
            strRegion = ":flag_sg: Singapore";
            break;
          case "sydney" :
            strRegion = ":flag_au: Sydney";
            break;
          case "us-central" :
            strRegion = ":flag_us: US Central";
            break;
          case "us-east" :
            strRegion = ":flag_us: US East";
            break;
          case "us-south" :
            strRegion = ":flag_us: US South";
            break;
          case "us-west" :
            strRegion = ":flag_us: US West";
            break;
          case "eu-west" :
            strRegion = ":flag_eu: Western Europe";
            break;
          default : strRegion = ":grey_question: " + message.guild.region
        };
        
        if ( message.guild.verificationLevel >= 0 && message.guild.verificationLevel <= 4 ) {
          strVerificationLevel = arrVerificationLevelEmoji[ message.guild.verificationLevel ];
        } else {
          strVerificationLevel = ":grey_question:" + message.guild.verificationLevel + ":grey_question:";
        }
        
        if ( !message.guild.large ) {
          await message.guild.members.forEach( function( member, intMemberIndex ) {
            if ( member.user.bot ){
              intBots++;
            } else {
              intHumans++;
            }
          } );
        } else {// HORRIBLE HACK -- FIX THIS LATER
          await message.guild.members.forEach( function( member, intMemberIndex ) {
            if ( member.user.bot ){
              intBots++;
            }
          } );
          intHumans = message.guild.memberCount - intBots;
        }
        
        await message.guild.channels.array().forEach( function( channel, intChannelIndex ) {
          if ( channel.type === 'text' ){
            intTextChannels++;
          } else {
            intVoiceChannels++;
          }
        } );
        
        await arrRoles.forEach( function( role, intRoleIndex ) {
          if ( intRoleIndex === ( arrRoles.length - 1 ) ) {
            strRoles += ', and ';
          } else if ( intRoleIndex !== 0 ) {
            strRoles += ', ';
          }
          strRoles += role;
        } );
        
        if ( strRoles.length >= 1024 ) {
          var strRoleText = ': ';
          arrRoles.forEach( function( role, intRoleIndex ) {
            strRoleText += role.name + ' : ';
            if ( intRoleIndex === 39 ) {
              strRoleText += '...SNIP... ...SNIP... ...SNIP... : ';
            }
          } );
          console.log ( '`!server` "' + message.guild.name + '" (ID:' + message.guild.id + ') has too many roles:\n' + strRoleText );
          do {
            strRoles = strRoles.substr( 0, strRoles.lastIndexOf( ',' ) );
          } while ( ( strRoles.length + 53 ) >= 1024 );// 38 for the next index (they're all `<@& id >`) and 15 for the ` **+### more!**`
          let intTrunkatedRoles = arrRoles.length - strRoles.match( /,/g ).length;
          strRoles += ' **+' + intTrunkatedRoles + ' more!**';
        }
        
        var aboutServer = new Discord.RichEmbed()
          .setTitle( 'Guild information for:')
          .setDescription( ':arrow_right:\t[**' + message.guild.name + '**](' + inviteUrl + ')\t:id: **' + message.guild.id + '**' )
          .setThumbnail( message.guild.iconURL )
          .setColor( 0x000080 )
          .addField( 'Created / Owner',
            message.guild.createdAt.toLocaleDateString( 'en-US', objTimeString ) +
            ' - <@' + message.guild.ownerID + '>#' + message.guild.owner.user.discriminator  )
          .addField( 'Region', strRegion )
          .addField( 'Members:', '**' + intUsers + '**: ' +
            ':bust_in_silhouette: ' + intHumans + ' (' + ( Math.round( ( intHumans / intUsers ) * 100 ) ) + '%) ' +
            ':robot: ' + intBots + ' (' + ( Math.round( ( intBots / intUsers ) * 100 ) )  + '%)' )
          .addField( 'Channels:', '**' + intChannels + '**: ' +
            ':notepad_spiral: ' + intTextChannels + ' (' + ( Math.round( ( intTextChannels / intChannels ) * 100 ) )  + '%) ' +
            ':loudspeaker: ' + intVoiceChannels + ' (' + ( Math.round( ( intVoiceChannels / intChannels ) * 100 ) )  + '%)' )
          .addField( 'Roles:', '**' + intRoles + '**: ' + strRoles )
          .addField( 'Verification Level', strVerificationLevel, true )
          .addField( 'Explicit Content Filter', strExplicitContentFilter, true )
          .setFooter( message.author.username + ' requested information.', message.author.displayAvatarURL );
        try {
          response.edit( '**Server information** (*embed below*)', { embed: aboutServer } ).catch( console.error );
        } catch( err ) {
          console.log( response );
          console.log( 'Attempting to edit an "!server" response failed with error: ' + err );
          message.channel.send( 'Editing last message failed, here\'s your result:', { embed: aboutServer } ).catch( console.error );
        }
      }
      break;
    case 'statbar' :
      let intYear = ( new Date() ).getFullYear();
      let intMonth = ( ( new Date() ).getMonth() < 9 ? '0' + ( ( new Date() ).getMonth() + 1 ) : ( ( new Date() ).getMonth() + 1 ) );
      let intDay = ( ( new Date() ).getDate() <= 9 ? '0' + ( ( new Date() ).getDate() ) : ( ( new Date() ).getDate() ) );
      message.channel.send( 'https://cdn2.project-gc.com/statbar.php?includeLabcaches&quote=https://discord.me/Geocaching%20-%20' + intYear + '-' + intMonth + '-' + intDay + '&user=' + encodeURI( strUserName ).replace( '&', '%26' ) );
      client.user.setStatus( 'online' );
      isBotIdle = false;
      break;
    case 'translate' :
        return hook( message.channel, 'GroundSpeak Translator', '`' + strArgs + '` not found in my library.', 'FF8888', 'https://pbs.twimg.com/profile_images/408251185/Logo_Groundspeak_guy_400x400.png' );
      break;
    case 'twitter' :
      var objOwner = await message.client.fetchUser( settings[ bot ].owners[ 0 ] );
      objOwner.send( message.author + ' requested a tweet on the `@GeocacheME_` Twitter feed: `' + strArgs + '`' );
      message.author.send( 'The <:Signal:452859217515249684> frog handler has been notified of your <:Twitter:452858838215819274> request.' );
      message.react( '%E2%9C%85' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.username + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
      break;
//    case 'welcome' :
//      client.user.setStatus( 'online' );
//      isBotIdle = false;
//      break;
/*    case 'rall' :// RESTART DISABLED SINCE PM2 QUIT AND IT WON'T WORK LIKE THIS
      if ( isOwner ) {
        Promise.all( [
          message.delete( { reason: 'Processing `!rall` command.' } ).then( async message => {
            timeNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString ),
            await message.channel.send( '_is restarting all other bots as requested by ' + message.author + '._' ),
            console.log( message.author.username + ' ordered a restart of all other bots at ' + timeNow );
          } ).catch( e => { console.error( 'Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e ); } )
        ] ).then( () => {
          exec( 'pm2 restart "DDObot" "greenie" "LOTRObot" "Lazy Bastard" "Vladdy"', { windowsHide: true }, ( error, stdout, stderr ) => {  if ( error ) {// "Gunther" "ShoeBot"
              console.error( "Error: " + error );
              return;
            }
            console.log( "Result: " + stdout );
            console.log( "stderr: " + stderr );
          } );
        } );
      }
      break;//*/
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
/* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//*
    case 'whois' :
      if ( isOwner ) {
        var embedResult = new Discord.RichEmbed()
          .setTitle( 'Looking up: ' + strUserName )
          .setDescription( 'Looking up information... please wait...' );
        var msgSent = await message.channel.send( 'Collecting Basic Data: ' + strUserName, { embed: embedResult } );
        var objGeocacher = await getGeocacherData( message, strUserName, msgSent );/*
        var objGeocacherAge = {
          years: Math.floor( objGeocacher.age / 365.25 ),
          months: Math.floor( ( objGeocacher.age - ( Math.floor( objGeocacher.age / 365.25 ) * 365.25 ) ) / 30.4375 ),
          days: Math.round( objGeocacher.age - ( Math.floor( objGeocacher.age / 365.25 ) * 365.25 ) - ( Math.floor( ( objGeocacher.age - ( Math.floor( objGeocacher.age / 365.25 ) * 365.25 ) ) / 30.4375 ) * 30.4375 ) )
        };
        var strGeocacherAge = ( objGeocacherAge.years > 0 ? objGeocacherAge.years + ' year' + ( objGeocacherAge.years === 1 ? '' : 's' ) + ( objGeocacherAge.months > 0 && objGeocacherAge.days > 0 ? ', ' : ( objGeocacherAge.months > 0 || objGeocacherAge.days > 0 ? ' and ' : '' ) ) : '' ) + ( objGeocacherAge.months > 0 ? objGeocacherAge.months + ' month' + ( objGeocacherAge.months === 1 ? '' : 's' ) + ( objGeocacherAge.years > 0 && objGeocacherAge.days > 0 ? ', and ' : ( objGeocacherAge.days > 0 ? ' and ' : '' ) ) : '' ) + ( objGeocacherAge.days > 0 ? objGeocacherAge.days + ' day' + ( objGeocacherAge.days === 1 ? '' : 's' ) : '' );
        
        //Post result
        embedResult
          .setTitle( '**Handle:**: ' + objGeocacher.handle )
          .setThumbnail( objGeocacher.avatar )
          .setDescription(
            '\n**Handle:** ' + objGeocacher.handle +
            '\n**Age:** ' + strGeocacherAge +
            '\n**Premium:** ' + ( objGeocacher.isPremium ? ':star2:' : ':no_entry_sign: [Buy!](https://www.geocaching.com/gift?guid=' + objGeocacher.guid + ')' )
          );
        msgSent.edit( 'Player profile for: ' + strUserName + '\n:link: https://www.geocaching.com/?guid=' + objGeocacher.guid, { embed: embedResult } ).catch( errEdit => { console.error( 'Error displaying final result of GCer lookup: ' + errEdit ); } );///
      }
      break;
/* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING */
    default :
    /* Do nothing */
  }
} );

// Leveling system
/*
client.on( 'message', async message => {

} );//*/