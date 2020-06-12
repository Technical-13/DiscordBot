const bot = 'greenie';
const Discord = require( 'discord.js' );
//const commando = require( 'discord.js-commando' );
//const sqlite = require( 'sqlite' );
const fs = require( 'fs' );
const path = require( 'path' );
const fsSettings = 'settings.json'
const settings = require( path.join( __dirname, '../' + fsSettings ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = function () { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
const exec = require( 'child_process' ).exec;
const puppeteer = require( 'puppeteer' );
const strScreenShotPath = path.join( __dirname, '/' );
const unirest = require( 'unirest' );
// Accidentally deleted geohash, need to rewrite it
//const geohash = require( path.join( __dirname, '/node_modules/geohash/geohash.js' ) );
const later = require( 'later' );
const strNewFlatFilePath = path.join( __dirname, '/jsonFlats/' );
var objNewFlats;
const strFlatSchedulePath = path.join( __dirname, '/flats.json' );
var objFlatSchedule = require( strFlatSchedulePath );
const jsonLatest = path.join( strNewFlatFilePath + 'latest.json' );
  
var idleMsg = false;
var enableSay = true;
var isDebug = settings[ bot ].onError.isDebugMode;
var isBotIdle = settings[ bot ].onError.isBotIdle;
var dcInfo = settings[ bot ].onError.dcInfo;

var _intConfidence = settings[ bot ].onMap.retiremyths;
var strLogChan = {
//  'serverID': { serverName: '', logChan: { name: '', id: '' } },
  '385498283738660875': { serverName: 'Geocaching', logChan: { name: 'bot-logs', id: '385596577596833803', canLog: false } },
  '464434174661754900': { serverName: 'Munzee', logChan: { name: 'bot-logs', id: '464435153607983115', canLog: true } },
  '192775085420052489': { serverName: 'The Cat Cabin', logChan: { name: 'bot-spam', id: '335080730742882304', canLog: false } },
//  '': { serverName: 'United', logChan: { name: undefined, id: undefined, canLog: false } },
  '497060342254403614': { serverName: 'CuppaZee', logChan: { name: 'nocuppazee', id: '501818270337466388', canLog: true } }
};

var objTimeStringHQ = objTimeString;
  objTimeStringHQ.timeZone = 'America/Chicago';
  objTimeStringHQ.hour12 = false;
  
var allowGreenie = false, allowFlip = false, intFlipCounter = 0;
const ROLE = {// Object of RoleName: RoleID sets
  Administrator: '464434779748827138', Staff: '464434512487514122',
  Player: '464434652573335552', Premium: '485135749549654029',
  ClanMember: '464434384045342721', ClanAdmin: '484748206610186261',
  NewPlayer: '495408507315552268', VeteranPlayer: '496219911044202497',
  MHQ: '495096954934788098', ThirdPartyDev: '494992108671991828'
};

var strRoverReindeerURL = '';
var objWarnings = {};
let fsWarnings = path.join( __dirname, '/warning.json' );
fs.readFile( fsWarnings, 'utf8', ( errRead, fileData ) => {
  if ( errRead && errRead.code === 'ENOENT' ) {
    fs.writeFile( fsWarnings, '{}', ( errWrite ) => {
      if ( errWrite ) {
        console.error( 'Failed to created non-existant ' + fsWarnings + ' with: `' + strWarnings + '`' );
      } else {
        console.warn( 'Created non-existant ' + fsWarnings + ' with: `' + strWarnings + '`' );
      }
    } );
  } else if ( errRead ) {
    throw errRead;
  }
  objWarnings = JSON.parse( fileData );
} );

const objMyths = { includes: [ 'dragon', 'leprechaun', 'pegasus', 'tuli', 'vesi', 'yeti' ], matches: [ 'cherub', 'chimera', 'cyclops', 'faun', 'hydra', 'ogre', 'mermaid', 'rainbowunicorn', 'siren', 'theunicorn' ] };
const objVirtuals = { includes: [ 'flat', 'mvm', 'poi', 'virtual' ], matches: [ 'airmystery', 'canoe', 'carrot', 'carrotplant', 'carrotseed', 'catapult', 'championshiphorse', 'chick', 'chicken', 'colt', 'crossbow', 'eggs', 'family', 'farmer', 'farmerandwife', 'field', 'firstwheel', 'garden', 'motorboat', 'musclecar', 'nightvisiongoggles', 'peas', 'peasplant', 'peasseed', 'penny-farthingbike', 'pottedplant', 'racehorse', 'submarine', 'safaribus', 'safaritruck', 'safarivan', 'surprise' ] };

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

async function getDefaultChannel( guildID ) {
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

Array.prototype.getMin = function( attrib ) {
  return this.reduce( function( prev, curr ) { 
    var prevItem = ( typeof( prev[ attrib ] ) == 'date' ? ( new Date( prev[ attrib ] ) ).valueOf() : prev[ attrib ] );
    var currItem = ( typeof( curr[ attrib ] ) == 'date' ? ( new Date( curr[ attrib ] ) ).valueOf() : curr[ attrib ] );
    return prevItem < currItem ? prev : curr; 
  } );
}
Array.prototype.getMax = function( attrib ) {
  return this.reduce( function( prev, curr ) {
    var prevItem = ( typeof( prev[ attrib ] ) == 'date' ? ( new Date( prev[ attrib ] ) ).valueOf() : prev[ attrib ] );
    var currItem = ( typeof( curr[ attrib ] ) == 'date' ? ( new Date( curr[ attrib ] ) ).valueOf() : curr[ attrib ] );
    return prevItem > currItem ? prev : curr; 
  } );
}

function toUCFirst( strTransform ) {
  return strTransform.substr( 0, 1 ).toUpperCase() + strTransform.substr( 1 );
}

async function checkRetireMyths( boolVerbose, objChannel ) {
  var objMsg, strMsg = 'Checking if Retiremyths are on the map, please stand by...';
  if ( boolVerbose === undefined ) { boolVerbose = false; } else if ( objChannel ) {
    objMsg = await objChannel.send( strMsg ).catch( errSend => {
      console.error( '%s: checkRetireMyths() unable to send to specified channel: %o', strNow(), errSend );
    } );
  } else {
    console.warn( '%s: checkRetireMyths() requested without a valid broadcast channel specified.', strNow() );
    settings[ bot ].debug.forEach( async chanID => {
      var channel = await client.channels.get( chanID );
      channel.send( 'checkRetireMyths() requested without a valid broadcast channel specified.' );
    } );
    return false;
  }
  
  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
  var objTypes = {
    cyclops: { strPage: 'virtuals/2479278', isArchived: false, isOnMap: false },
    dragon: { strPage: 'virtuals/2479254', isArchived: false, isOnMap: false },
    faun: { strPage: 'virtuals/2479265', isArchived: false, isOnMap: false },
    hydra: { strPage: 'virtuals/2479270', isArchived: false, isOnMap: false },
    leprechaun: { strPage: 'virtuals/2479246', isArchived: false, isOnMap: false },
    pegasus: { strPage: 'virtuals/2479276', isArchived: false, isOnMap: false },
    unicorn: { strPage: 'virtuals/2479236', isArchived: false, isOnMap: false },
    yeti: { strPage: 'virtuals/2479261', isArchived: false, isOnMap: false }
  };
  
  console.log( '%s: Checking the map for retiremyths %s', strNow(), ( boolVerbose ? 'by request from: ' + objChannel.guild.name + '#' + objChannel.name : 'on timer.' ) );
  for ( var type in objTypes ) {
    try {
      await page.goto( 'https://www.munzee.com/m/' + objTypes[ type ].strPage + '/map/' );
    } catch ( errGoto ) {
//      console.error( '%s: Error attempting to checkRetireMyths():\n%o', strNow(), puppeteer.errors );
      if ( errGoto instanceof puppeteer.errors.TimeoutError ) {
//        console.error( '%s: Unable to delete own message aborting checkRetireMyths():\n%o', strNow(), errGoto );
        await objMsg.edit( 'Processing failed.  Aborting retiremyth check.' ).catch( errEdit => {
          console.error( '%s: Aborting checkRetireMyths(): Unable to edit own message:\n%o', strNow(), errEdit );
        } );
        objMsg.delete( 5000 ).catch( errDel => {
          console.error( '%s: Unable to delete own message aborting checkRetireMyths():\n%o', strNow(), errDel );
        } );
      } else {
        console.error( '%s: Unknown error attempting to checkRetireMyths(): %o', strNow(), errGoto );
      }
    }
    if ( boolVerbose ) { strMsg += '\nLooking for a **`' + toUCFirst( type ) + '`** retiremyth: ';
    await objMsg.edit( strMsg + ' ...' ).catch( errEdit => {
      console.error( '%s: Aborting checkRetireMyths(): Unable to edit own message: %o', strNow(), errEdit );
      if ( errEdit.code !== 10008 ) {
        objMsg.delete().catch( errDel => {
          console.error( '%s: Unable to delete own message aborting checkRetireMyths(): %o', strNow(), errDel );
        } );
      }
    } ); }
    var objProcessed = await page.evaluate( () => {
      var objProcessedType = {
        isArchived: ( document.getElementById( 'munzee-name' ).getElementsByClassName( 'status-date' )[ 0 ].innerText.indexOf( 'Archived' ) ? false : true ),
        isOnMap: ( document.getElementById( 'locationimage' ) ? true : false )
      };
      return objProcessedType;
    } );
    if ( boolVerbose ) { strMsg += ( objProcessed.isOnMap ? '<:owned:495813337616089092>' : '<:UTL:479663610973519890>' ); await objMsg.edit( strMsg ).catch( errEdit => { console.error( '%s: Aborting checkRetireMyths(): Unable to edit own message: %o', strNow(), errEdit ); if ( errEdit.code !== 10008 ) { objMsg.delete().catch( errDel => { console.error( '%s: Unable to delete own message aborting checkRetireMyths(): %o', strNow(), errDel ); } ); } } ); }
    if ( isDebug ) { console.log( '%s: http://munzee.com/m/%s/map (%s): %o', strNow(), objTypes[ type ].strPage, toUCFirst( type ), objProcessed ); }
    objTypes[ type ].isArchived = objProcessed.isArchived;
    objTypes[ type ].isOnMap = objProcessed.isOnMap;
  }
  
  await browser.close();
//  if ( isDebug ) { console.log( '%s: %o', strNow(), objTypes ); }
  
  var intOnMapSum = 0;
  var intTypeSize = 0;
  for ( var type in objTypes ) {
    if ( !objTypes[ type ].isArchived ) {
      intTypeSize++;
      if ( objTypes[ type ].isOnMap ) { intOnMapSum++; }
    }
    else {
      console.warn( '%o: The \u001b[1;37m\u001b[46m %s \u001b[0m retiremyth used by the checker has been retired!  Please see:\n\thttps://www.munzee.com/m/%s/', strNow(), type, objTypes[ type ].strPage );
    }
  }
  var intConfidence = intOnMapSum / ( intTypeSize || 1 );
  var intPercent = ( Math.round( intConfidence * 1000 ) / 10 );
  if ( isDebug ) { console.log( '%s: Retiremyth confidence level: %i / %i = %f%', strNow(), intOnMapSum, intTypeSize, intPercent ); }
  if ( boolVerbose ) {
    await objMsg.edit( 'I am ' + ( intConfidence === _intConfidence ? '**still** ' : '' ) + ( intPercent !== 0 && intPercent !== 100 ? ( 100 - intPercent ) : '100' ).toString() + '% certain that retiremyths are ' + ( intPercent < 100 ? ( intPercent === 0 ? 'off' : 'falling off' ) : 'on' ) + ' the map!' ).catch( errEdit => { console.error( '%s: Aborting checkRetireMyths(): Unable to edit own message: %o', strNow(), errEdit ); if ( errEdit.code !== 10008 ) { objMsg.delete().catch( errDel => { console.error( '%s: Unable to delete own message aborting checkRetireMyths(): %o', strNow(), errDel ); } ); } } );
  }
  if ( intConfidence !== _intConfidence ) {
    client.channels.get( '509540760819859469' ).send( ( intPercent < 100 ? 'Sad news indeed, ' : 'Good news ' + ( intConfidence >= 50 ? '@everyone! ' : '' ) ) + 'I can say with ' + ( intPercent !== 0 && intPercent !== 100 ? ( 100 - intPercent ) : '100' ).toString() + '% certainty that retiremyths ' + ( intPercent < 100 ? ( intPercent === 0 ? 'have left' : 'are falling off' ) : 'are now on' ) + ' the map!' ).catch( errSend => { console.error( 'Error sending rmcheck result to https://discordapp.gg/' + client.channels.get( '509540760819859469' ).guild.id + '/509540760819859469: %o', errSend ); } );
    client.channels.get( '569965410582003724' ).send( ( intPercent < 100 ? 'Sad news indeed, ' : 'Good news ' + ( intConfidence >= 50 ? '@everyone! ' : '' ) ) + 'I can say with ' + ( intPercent !== 0 && intPercent !== 100 ? ( 100 - intPercent ) : '100' ).toString() + '% certainty that retiremyths ' + ( intPercent < 100 ? ( intPercent === 0 ? 'have left' : 'are falling off' ) : 'are now on' ) + ' the map!' ).catch( errSend => { console.error( 'Error sending rmcheck result to https://discordapp.gg/' + client.channels.get( '569965410582003724' ).guild.id + '/569965410582003724: %o', errSend ); } );
    _intConfidence = intConfidence;
    settings[ bot ].onMap.retiremyths = intConfidence;
    strSettings = JSON.stringify( settings );
    fs.writeFile( path.join( __dirname, '../' + fsSettings ), strSettings, ( errWrite ) => { if ( errWrite ) { throw errWrite; } } );
  }
}

function checkFlats() {//var wasDebug = isDebug, isDebug = true;
  if ( isDebug ) { console.log( '%s: objFlatSchedule: %o', strNow(), objFlatSchedule ); }
  var intDates = Object.keys( objFlatSchedule ).length;
  const objToday = ( new Date() );
  const objYesterday = ( new Date( ( new Date() ).setDate( objToday.getDate() - 1 ) ) );
  var objNextDay = ( new Date( ( new Date() ).setDate( objToday.getDate() + 1 ) ) );
  var strToday = objToday.getFullYear() + '-' + ( ( objToday.getMonth() + 1 ) <= 9 ? '0' : '' ) + ( objToday.getMonth() + 1 ) + '-' + ( objToday.getDate() <= 9 ? '0' : '' ) + objToday.getDate();
  var strYesterday = objYesterday.getFullYear() + '-' + ( ( objYesterday.getMonth() + 1 ) <= 9 ? '0' : '' ) + ( objYesterday.getMonth() + 1 ) + '-' + ( objYesterday.getDate() <= 9 ? '0' : '' ) + objYesterday.getDate();
  var strNextDay = objNextDay.getFullYear() + '-' + ( ( objNextDay.getMonth() + 1 ) <= 9 ? '0' : '' ) + ( objNextDay.getMonth() + 1 ) + '-' + ( objNextDay.getDate() <= 9 ? '0' : '' ) + objNextDay.getDate();
  if ( isDebug ) { console.log( '%s: Compare yesterday and today:\n\tobjFlatSchedule[ %s ]: %o\n\tobjFlatSchedule[ %s ]: %o', strNow(), strYesterday, objFlatSchedule[ strYesterday ], strToday, objFlatSchedule[ strToday ] ); }
  var arrOnNow = [], objFlats = {}, boolNextDay = true, arrOnTheMap = [], arrOffTheMap = [];
  for ( var flat in objFlatSchedule[ strToday ] ) {
    const objFlatNames = { rob: 'Flat Rob', lou: 'Flat Lou', matt: 'Flat Matt', hammock: 'Flat Hammock', qrewzee: 'QRewZees' };
    objFlats[ flat ] = objFlatNames[ flat ] + ' will be on the map ';
    if ( objFlatSchedule[ strToday ][ flat ] ) {
      arrOnNow.push( objFlatNames[ flat ] );
      objFlats[ flat ] += 'until ';
    } else {
      objFlats[ flat ] += 'starting ';      
    }
    if ( isDebug ) { console.log( 'There are %i total dates listed in objFlatSchedule', intDates ); }
    var intKill = intDates;
    do {
      if ( isDebug ) { console.log( '%s: Looking for %s on %s: %o', strNow(), flat, strNextDay, objFlatSchedule[ strNextDay ][ flat ] ); }
      if ( objFlatSchedule[ strToday ][ flat ] !== objFlatSchedule[ strNextDay ][ flat ] ) {
        boolNextDay = false;
        objFlats[ flat ] += ( new Date( strNextDay + 'T06:00:00.000Z' ) ).toLocaleDateString( 'en-us', objTimeStringHQ ) + '.';
      } else {
        objNextDay = ( new Date( objNextDay.setDate( objNextDay.getDate() + 1 ) ) );
        if ( isDebug ) { console.log('objNextDay is now: %o',objNextDay.toLocaleDateString( 'en-us', objTimeStringHQ )); }
        strNextDay = objNextDay.getFullYear() + '-' + ( ( objNextDay.getMonth() + 1 ) <= 9 ? '0' : '' ) + ( objNextDay.getMonth() + 1 ) + '-' + ( objNextDay.getDate() <= 9 ? '0' : '' ) + objNextDay.getDate();
      }
      intKill--;
      if ( intKill === 0 ) { console.warn( 'Something could be wrong in checkFlats() as intKill hit 0.' ); }
    } while ( objFlatSchedule[ strNextDay ] && boolNextDay && intKill !== 0 );
    if ( objFlats[ flat ] === objFlatNames[ flat ] + ' will be on the map until ' ) {
      objFlats[ flat ] = objFlatNames[ flat ] + ' will be on the map for the known future.';
    } else if ( objFlats[ flat ] === objFlatNames[ flat ] + ' will be on the map starting ' ) {
      objFlats[ flat ] = objFlatNames[ flat ] + ' will not be on the map in the known future.';
    }
    objNextDay = ( new Date( ( new Date() ).setDate( objToday.getDate() + 1 ) ) );
    strNextDay = objNextDay.getFullYear() + '-' + ( ( objNextDay.getMonth() + 1 ) <= 9 ? '0' : '' ) + ( objNextDay.getMonth() + 1 ) + '-' + ( objNextDay.getDate() <= 9 ? '0' : '' ) + objNextDay.getDate();
    boolNextDay = true;
    if ( objFlatSchedule[ strToday ][ flat ] !== objFlatSchedule[ strYesterday ][ flat ] ) {
      if ( objFlatSchedule[ strToday ][ flat ] ) {
        arrOnTheMap.push( objFlatNames[ flat ] );
      } else {
        arrOffTheMap.push( objFlatNames[ flat ] );
      }
    }
  }
  if ( isDebug ) { console.log( '%s: Results of check: \n\tarrOnTheMap: %o\n\tarrOffTheMap: %o\n\tarrOnNow: %o', strNow(), arrOnTheMap, arrOffTheMap, arrOnNow ); }
  var strOnTheMap = '';
  if ( arrOnTheMap.length === 4 ) {
    strOnTheMap = 'All of the flat friends are now on the map!';
  } else if ( arrOnTheMap.length === 1 ) {
    strOnTheMap = arrOnTheMap[ 0 ] + ' is now on the map!';
  } else if ( arrOnTheMap.length === 2 ) {
    strOnTheMap = arrOnTheMap[ 0 ] + ' and ' + arrOnTheMap[ 1 ] + ' are now on the map!';
  } else if ( arrOnTheMap.length > 2 ) {
    strOnTheMap = arrOnTheMap.join( ', ' ).replace( ', ' + arrOnTheMap[ arrOnTheMap.length - 1 ], ', and ' + arrOnTheMap[ arrOnTheMap.length - 1 ] ) + ' are now on the map!';
  }
  var strOffTheMap = '';
  if ( arrOffTheMap.length === 4 ) {
    strOffTheMap = 'All of the flat friends are now off the map!';
  } else if ( arrOffTheMap.length === 1 ) {
    strOffTheMap = arrOffTheMap[ 0 ] + ' is now off the map!';
  } else if ( arrOffTheMap.length === 2 ) {
    strOffTheMap = arrOffTheMap[ 0 ] + ' and ' + arrOffTheMap[ 1 ] + ' are now off the map!';
  } else if ( arrOffTheMap.length > 2 ) {
    strOffTheMap = arrOffTheMap.join( ', ' ).replace( ', ' + arrOffTheMap[ arrOffTheMap.length - 1 ], ', and ' + arrOffTheMap[ arrOffTheMap.length - 1 ] ) + ' are now off the map!';
  }
  var strOnNow = '';
  if ( arrOnNow.length === 4 ) {
    strOnNow = 'All of the flat friends are on the map!';
  } else if ( arrOnNow.length === 1 ) {
    strOnNow = arrOnNow[ 0 ] + ' is on the map currently!';
  } else if ( arrOnNow.length === 2 ) {
    strOnNow = arrOnNow[ 0 ] + ' and ' + arrOnNow[ 1 ] + ' are on the map currently!';
  } else if ( arrOnNow.length > 2 ) {
    strOnNow = arrOnNow.join( ', ' ).replace( ', ' + arrOnNow[ arrOnNow.length - 1 ], ', and ' + arrOnNow[ arrOnNow.length - 1 ] ) + ' are on the map currently!';
  }
  
  if ( isDebug ) { console.log( '%s: Returning:\n\tstrOnTheMap: %s\n\tstrOffTheMap: %s\n\tstrOnNow: %s\n\tflats: %o', strNow(), strOnTheMap, strOffTheMap, strOnNow, objFlats ); }
  return {
    onMap: strOnTheMap,
    offMap: strOffTheMap,
    onNow: strOnNow,
    flats: {
      rob: objFlats.rob,
      lou: objFlats.lou,
      matt: objFlats.matt,
      hammock: objFlats.hammock
    }
  };//isDebug = wasDebug; wasDebug = null;
}

async function sendDM( message, recipient, strContent ) {
//function sendDM( sender, recipient, strContent ) {
  if ( typeof( recipient ) !== 'object' ) { recipient = await client.fetchUser( recipient ); }
//  if ( typeof( sender ) !== 'object' ) { sender = await client.fetchUser( sender ); }
  recipient
    .send( strContent )
    .then( dmSent => {
      message.author.send( 'DM, ' + recipient + ' (' + recipient.tag + ') sent: `' + strContent + '`' );
//      sender.send( 'DM, ' + recipient + ' (' + recipient.tag + ') sent: `' + strContent + '`' );
    } ).catch( dmErr => {
      message.author.send( 'Unable to DM, ' + recipient + ' (' + recipient.tag + ') your message: `' + strContent + '`' );
//      sender.send( 'Unable to DM, ' + recipient + ' (' + recipient.tag + ') your message: `' + strContent + '`' );
    } );
}

async function sendReferralCode( recipient, intCaps ) {
  if ( recipient === undefined ) { return false; }
  else {
    recipient = recipient.replace( /(<@!?|>)/g, '' );
    if ( ( new RegExp( '[\\d]+' ) ).test( recipient ) ) {
      recipient = await client.fetchUser( recipient )
        .catch( errFetchUser => {
          console.error( '%o: Unable to fetchUser in sendReferralCode(): %o', strNow(), errFetchUser );
          return false;
        } );
      if ( !recipient ) { return false; }
    }
    else { return false; }
    if ( intCaps === undefined ) { intCaps = -1; }
    var objBotOwner = await client.fetchUser( settings[ bot ].owners[ 0 ] );
    var objReferralCode = new Discord.RichEmbed()
      .setColor( '#5ABB57' )
      .setTitle( 'Welcome to Munzee!' )
      .setURL( 'https://discord.me/Munzee' )
      .setDescription( 'You\'re a new player with less than ten captures!  Feel free to capture my [owner\'s]( <https://www.munzee.com/m/technical13> ) referral code for 50 points!'
      )
      .setImage( 'attachment://Referral.png' );
      
    recipient.send( { embed: objReferralCode, files: [ { attachment: 'technical13 referer.png', name: 'Referral.png' } ] } )
      .then( async msgSent => {
        objBotOwner.send( 'I\'ve successfully DMed your referral code to **' + recipient + '#' + recipient.discriminator + '**' + ( intCaps === -1 ? '' : ', who has ' + intCaps + ' captures!' ) );
      } ).catch( async errDM => {
        objBotOwner.send( 'I was unable to send your referral code to **' + recipient + '#' + recipient.discriminator + '**' + ( intCaps === -1 ? '' : ' (who has ' + intCaps + ' captures!)' ) + ': ' + errDM );
      } );
    return true;
  }
}

async function sendMunzeeDiscordSocial( member, strOnReason = '' ) {
  var objUserToSendTo = member.client.users.get( member.user.id );
  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
  await page.goto( 'https://www.munzee.com/m/technical13/577/' );
  var objSocialData = await page.evaluate( () => {
    const domMN = document.getElementById( 'munzee-name' );
    const domSB = document.getElementsByClassName( 'sidebar' )[ 0 ];
    const domSA = document.getElementsByClassName( 'stat-green' );
    var objMunzeeData = {
      strName: domMN.getElementsByClassName( 'munzee-name' )[ 0 ].childNodes[ 0 ].innerText,
      dateDeployed: domMN.getElementsByClassName( 'deployed-at' )[ 0 ].attributes[ 1 ].value,
      intCaptures: parseInt( domSA[ 0 ].innerText.replace( ' Captures', '' ) ),
      intEntries:  parseInt( domSA[ 1 ].innerText.replace( ' Entries', '' ) ),
      intPhotos:  parseInt( domSA[ 3 ].innerText.replace( ' Photos', '' ) ),
    }
    return objMunzeeData;
  } );
  await browser.close();
  
  var objMunzeeDiscord = new Discord.RichEmbed()
    .setColor( '#5ABB57' )
    .setTitle( '**Congratulations!** You have found\nthe Munzee Discord server!' )
    .setURL( 'https://discord.me/Munzee' )
    .setThumbnail( member.guild.iconURL )
    .setDescription(
      'Please take a little time to check out our <#494952957222191105> channel and introduce yourself to everyone in <#464434174661754902>.\n\nTell us your player name, how long you\'ve been playing, and about your favorite Munzees!\n\nFeel free to be scanner #' + ( objSocialData.intCaptures + 1 ) + ' of the **' + objSocialData.strName + '** social below for your special find! <:social:494972843063508992>' +
      '\n\n**Deployed**: ' + ( new Date( objSocialData.dateDeployed ) ).toLocaleDateString( 'en-us', objTimeStringHQ ) +
      '\n\n:notepad_spiral: **Entries**: [' + objSocialData.intEntries + ' entries](https://www.munzee.com/m/technical13/577/entries/)' +
      ' :camera_with_flash: **Photos**: [' + objSocialData.intPhotos + ' photos](https://www.munzee.com/m/technical13/577/photos/)'
    )
    .setImage( 'attachment://MunzeeDiscord.png' );
  objUserToSendTo.send( { embed: objMunzeeDiscord, files: [ { attachment: strScreenShotPath + 'Munzee Discord.png', name: 'MunzeeDiscord.png' } ] } )
    .then( async msgSent => {
      let objBotOwner = await member.client.users.get( settings[ bot ].owners[ 0 ] );
      objBotOwner.send( 'I\'ve successfully DMed the **' + objSocialData.strName + '** social to **' + objUserToSendTo + '#' + objUserToSendTo.discriminator + '**' + ( strOnReason !== '' ? strOnReason : '' ) );
    } ).catch( async errDM => {
      let objBotOwner = await member.client.users.get( settings[ bot ].owners[ 0 ] );
      objBotOwner.send( 'I was unable to send the **' + objSocialData.strName + '** social to **' + objUserToSendTo + '#' + objUserToSendTo.discriminator + '**' + ( strOnReason !== '' ? strOnReason : '' ) + ': __ ' + errDM + ' __' );
    } );
}

async function getEventData( strEventURL ) {// FUNCTION TO GET EVENT DATA FROM PAGE
  const strPatternURL = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  const strPatternEvent = /https?:\/\/calendar\.munzee\.com(.*)/;
  if ( !strPatternURL.test( strEventURL ) ) {
    return { statusCode: 400, statusMsg: 'Bad Request: `' + strEventURL + '` is not a valid URL.' };
  } else if ( !strPatternEvent.test( strEventURL ) ) {
    return { statusCode: 403, statusMsg: 'Forbidden: `' + strEventURL + '` is not a Munzee Event URL.' };
  }
  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
  await page.goto( strEventURL );
  
  var objEventData = await page.evaluate( async () => {
    var objTimeStringHQ = { year: 'numeric', month: 'long', day: 'numeric' };
    var arrTrue = [ true, 'true', 1, '1', 'on', 'yes' ];
    var boolAlert = ( document.getElementsByClassName( 'alert alert-danger' )[ 0 ] ? true : false );
    if ( boolAlert ) {
      var strStatusMsg = document.getElementsByClassName( 'alert alert-danger' )[ 0 ].childNodes[ 0 ].textContent.trim();
      if ( strStatusMsg === 'Page was not found.' ) { return await { statusCode: 404, statusMsg: 'Page was not found.' }; }
    }
    var strGoogleAdd = document.getElementsByClassName( 'btn btn-default btn-xs pull-right' )[ 0 ].href;
    var arrGoogleParams = strGoogleAdd.substr( strGoogleAdd.indexOf( '?' ) + 1 ).split( '&' );
    var objGoogleParams = {};
    arrGoogleParams.forEach( strParam => {
      let arrParam = strParam.split( '=' );
      let strParamName = ( arrParam[ 0 ].toLowerCase() || 'undefined' );
      let strParamVal = ( ( arrTrue.indexOf( arrParam[ 1 ] ) !== -1 ? true : false ) ? ( arrTrue.indexOf( arrParam[ 1 ] ) !== -1 ? true : false ) : ( arrParam[ 1 ].match( /([^0-9])/ ) ? arrParam[ 1 ] : parseInt( arrParam[ 1 ] )  ) );
      objGoogleParams[ strParamName ] = strParamVal;
    } );
    var objEventData = await {
      host: document.getElementsByClassName( 'creator_username' )[ 0 ].innerText,
      eventPin: document.getElementsByClassName( 'event-indicator' )[ 0 ].href,
      location: decodeURI( objGoogleParams.location ),
      dateStart: ( new Date( Date.parse( objGoogleParams.dates.split( '/' )[ 0 ].replace( /([\d]{4})([\d]{2})([\d]{2})/, '$1-$2-$3' ) ) ) ).toString(),
      dateEnd: ( new Date( Date.parse( objGoogleParams.dates.split( '/' )[ 1 ].replace( /([\d]{4})([\d]{2})([\d]{2})/, '$1-$2-$3' ) ) ) ).toString(),
      onGoogle: strGoogleAdd
    };
      
    return objEventData;
  } );
    
  await browser.close();

  return objEventData;
}

async function getCaptures( strPlayerName, objOptions ) {
  if ( !strPlayerName ) {
    throw new Error( '`strPlayerName` is required to process getCaptures()' );
  }
  
  if ( isDebug ) { console.log( '%s: getCaptures() options: %o', strNow(), objOptions ); }
  var arrCaptureTypes = 'all',
  totalCaptures = -1,
  stopAt = 500;
  if ( objOptions ) {
    if ( objOptions.arrCaptureTypes ) { arrCaptureTypes = objOptions.arrCaptureTypes; }
    if ( objOptions.stopAt ) { optionTwo = objOptions.stopAt; }
    if ( objOptions.totalCaptures ) { totalCaptures = objOptions.totalCaptures; }
  }
  var objResults = { state: 'initializing' };
  
  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
  const basePage = 'https://www.munzee.com/m/' + strPlayerName + '/';
  
  if ( totalCaptures === -1 ) {
    await page.goto( basePage );
    await page.evaluate( () => {
        if ( document.getElementById( 'error' ) ) {
          objResults.state = 'error';
          objResults.errorMsg = 'Failed to retrieve player: ' + strPlayerName;
        } else {
          objResults.state = 'processing';
          domID = document.getElementById( 'user-stats' );
          domClassUS = domID.getElementsByClassName( 'user-stat' );
          objResults.totalCaptures = parseInt( domClassUS[ 1 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) );
          objResults.pagesOfCaptures = Math.ceil( objResults.totalCaptures / 20 );
        }
    } );
  }
  
  if ( objResults.state !== 'error' ) {
    for ( var intCapturePage = 0; intCapturePage < objResults.pagesOfCaptures; intCapturePage++ ) {
      await page.goto( basePage + 'captures/' + intCapturePage + '/' );
      
      var pageData = await page.evaluate( () => {
      /* PROCESSING GOES HERE */
        var arrPage = [];
        var intPageP = parseInt( document.URL.split( '/' )[ 6 ] );
        var capturesPage = document.getElementById( 'munzee-holder' ).querySelectorAll( 'section' );
        for ( var i = 0; i < capturesPage.length; i++ ) {
          var intCapture = ( ( intPageP * 20 ) + i );
          arrPage[ intCapture ] = {
            'id': parseInt( capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 5 ].replace( /,/g, '' ) ),
            'name': capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].innerText,
            'type': capturesPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src.split( '/' )[ 5 ].split( '.' )[ 0 ] ,
            'icon': capturesPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src,
            'captured_at': capturesPage[ i ].getElementsByClassName( 'captured-at' )[ 0 ].attributes[ 1 ].value,
            'capture_points': parseInt( capturesPage[ i ].getElementsByClassName( 'number' )[ 0 ].innerText.replace( /,/g, '' ) ),
            'deployed': {
              'handle': capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 4 ],
              'URL': 'https://www.munzee.com/m/' + capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 4 ] + '/',
              'deployed_at': capturesPage[ i ].getElementsByClassName( 'deployed-at' )[ 0 ].attributes[ 1 ].value
            }
          };
          arrPage[ intCapture ].ago = Math.floor( ( ( new Date() ).valueOf() - ( new Date( arrPage[ intCapture ].captured_at ).valueOf() ) ) / 86400000 );
        }
        return arrPage;
      /* PROCESSING GOES HERE */
      } );
    }
  }
  
  await browser.close()
    .then( browserClosed => {
      if ( isDebug ) { console.log( '%s: getCaptures() has successfully closed the browser: %o', strNow(), browserClosed ); }
      objResults.state = 'success';
    } ).catch( browserOpen => {
      console.error( '%s: getCaptures() has failed to close the browser: %o', strNow(), browserClosed );
      objResults.state = 'error';
      objResults.errorMsg = 'Failed to close browser.'
      console.warn( '%s: getCaptures() is returning objResults: %o', strNow(), objResults );
    } );
    
  return objResults;
}

async function getMunzeeData( message, strMunzeeID, objMessage ) {
  if ( !message ) {// Throw new Error if message is not defined.
    throw new Error( 'object "message" is required to process getBasicPlayerData()' );
  } else if ( !strMunzeeID ) {// Forgot to give me a munzee to work on, so I'm returning a pseudo-404
    var objEmbed = new Discord.RichEmbed()
      .setThumbnail( 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg' )
      .setDescription( 'You failed to specify a munzee to look up.' );
      
    if ( objMessage === undefined ) {
      objMessage = await message.channel.send( '**No munzee specified!**', { embed: objEmbed } );
    }
    
    objMessage.edit( '**No munzee specified!** Returning error...', { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "basic information".' ); } );
    
    return {
      error: 404,
      avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
    };
  }
  else {
    var objEmbed = new Discord.RichEmbed()
      .setTitle( 'Fetching munzee data' );
    
    const browser = await puppeteer.launch( );
    const page = await browser.newPage( );
    const basePage = 'https://www.munzee.com/m/' + strMunzeeID + '/';
    console.log( '%s: getMunzeeData() looking up: %s', strNow(), basePage );
    
    await page.goto( basePage );
      objEmbed
        .setURL( basePage )
        .setDescription(
          '**Name:** __Collecting...__' +
          '\n**Deployed or Archived?** __Checking...__' +
          '\n**On Date:** __Collecting...__' +
          '\n\n**By:** __Collecting...__' +
          '\n**Hosting?** __Checking...__' +
          '\n**Rovers:** __Checking...__' +
          '\n**First to Cap:** __Collecting...__' +
          '\n**Captures:** __Collecting...__'
        );
      if ( objMessage ) { objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "basic information".' ); } ); }
    
    var objMember = await page.evaluate( () => {
      if ( document.getElementById( 'error' ) ) {//return 404 error
        return {
          error: '404',
          avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
        };
      }
      else {
// TEST PAGE (social)       : !munzee https://www.munzee.com/m/technical13/577/2F9V1I/
// TEST PAGE (mythological) : !munzee https://www.munzee.com/m/technical13/725/
// TEST PAGE (archived)     : !munzee https://www.munzee.com/m/technical13/1/GZF207/
// TEST PAGE (live)         : !munzee https://www.munzee.com/m/technical13/100/6E3V1L/
        const domMN = document.getElementById( 'munzee-name' );
        const domD = document.getElementsByClassName( 'deployed' )[ 0 ];
        const domH = document.getElementsByTagName( 'h2' );
        const domLI = document.getElementById( 'locationimage' );
        const domSB = document.getElementsByClassName( 'sidebar' )[ 0 ];
        const domMMA = document.getElementsByClassName( 'munzee-main-area' )[ 0 ];
        const arrMapParams = domLI.children[ 1 ].children[ 0 ].src.substring( domLI.children[ 1 ].children[ 0 ].src.indexOf( '?' ) + 1 ).split( '&' );
        const arrMapCoords = arrMapParams[ 0 ].split( '=' )[ 1 ].split( ',' );
        var objMunzeeData = {
          deployNumber: parseInt( domMN.getElementsByClassName( 'munzee-name' )[ 0 ].childNodes[ 0 ].href.split( '/' )[ 5 ] ),
          name: domMN.getElementsByClassName( 'munzee-name' )[ 0 ].childNodes[ 0 ].innerText,
          statusDate: domMN.getElementsByClassName( 'deployed-at' )[ 0 ].attributes[ 1 ].value,
          expiresDate: ( domMN.getElementsByClassName( 'expires-at' )[ 0 ] ? domMN.getElementsByClassName( 'expires-at' )[ 0 ].attributes[ 1 ].value : false ),
          avatar: domMN.getElementsByClassName( 'pin' )[ 0 ].src,
          ownerName: domD.getElementsByClassName( 'username' )[ 0 ].innerText.trim(),
          ownerAvatar: domD.getElementsByClassName( 'user-photo' )[ 0 ].src,
          isArchived: ( domMN.getElementsByClassName( 'status-date' )[ 0 ].childNodes[ 0 ].nodeValue.trim() === 'Archived' ? true : false ),
          isHosting: ( domMMA.getElementsByClassName( 'unicorn' )[ 0 ] ? true : false ),
          isSocial: ( domH.length === 2 ? ( domH[ 1 ].innerText.includes( 'Social Notes' ) ? true : false ) : false ),
          isMyth: ( domLI ? ( domLI.nextElementSibling.innerText.substr( 0, 2 ) === 'at' ? true : false ) : false ),
          mapLocation: { lat: arrMapCoords[ 0 ], lng: arrMapCoords[ 1 ] },
          hasRover: [],
          whoFTC: ( domSB.getElementsByTagName( 'p' )[ 0 ] ? domSB.getElementsByTagName( 'p' )[ 0 ].childNodes[ 3 ].innerText : false ),
          captures: []
        }
        if ( objMunzeeData.isHosting ) {
          objMunzeeData.hostedMunzee = {
            name: domMMA.getElementsByClassName( 'unicorn' )[ 0 ].childNodes[ 1 ].innerText,
            URL: domMMA.getElementsByClassName( 'unicorn' )[ 0 ].childNodes[ 1 ].href
          };
        }
        if ( objMunzeeData.isSocial ) {
          objMunzeeData.socialImage = document.getElementById( 'room-holder' ).children[ 0 ].src;
        }
        if ( objMunzeeData.isMyth ) {
          objMunzeeData.mythData = {
            lat: document.getElementById( 'locationtext' ).attributes[ 'data-latitude' ].value,
            lng: document.getElementById( 'locationtext' ).attributes[ 'data-longitude' ].value
          };
        }
        return objMunzeeData;
      }
    } );// end page.evaluate() 
    
    console.log( '%s: getMunzeeData() returning obj: %o', strNow(), objMember );
    return objMember;
  }
}

async function getRoverReindeer( message, objMessage ) {
  if ( !message ) {// Throw new Error if message is not defined.
    throw new Error( 'object "message" is required to process getRoverReindeer()' );
  }
  else {
    const browser = await puppeteer.launch( );
    const page = await browser.newPage( );
    await page.goto( 'http://eeznum.co.uk/mythologicals/closest.php?type=roverreindeer2018' );
    var arrRR = await page.evaluate( async () => {
      return await document.getElementById( 'stab' ).children[ 0 ].children[ 1 ].children[ 0 ].children[ 0 ].href;
    } );
    
    const arrMunzee = strRR.split( '/' ).filter( p => p.length >=1 );
    const strMunzeeCode = ( isNaN( arrMunzee[ arrMunzee.length - 1 ] ) ? arrMunzee[ arrMunzee.length - 1 ] : null );
    const strPlayerDeploy = ( isNaN( arrMunzee[ arrMunzee.length - 1 ] ) ? arrMunzee[ arrMunzee.length - 2 ] : arrMunzee[ arrMunzee.length - 1 ] );
    const strPlayerName = ( isNaN( arrMunzee[ arrMunzee.length - 1 ] ) ? arrMunzee[ arrMunzee.length - 3 ] : arrMunzee[ arrMunzee.length - 2 ] );
    const strMunzeeID = strPlayerName + '/' + strPlayerDeploy + ( strMunzeeCode ? '/' + strMunzeeCode : '' );
    
    console.log( '%s: getRoverReindeer() trying to getMunzeeData() for: %s', strNow(), strMunzeeID );
    return await getMunzeeData( message, strMunzeeID, objMessage );
  }
}

async function getPlayerName( strUserName ) {
  if ( !strUserName ) {
    throw new Error( 'String "strUserName" is required to process getMunzeePlayerName()' );
  } 
  else {
    const browser = await puppeteer.launch( );
    const page = await browser.newPage( );
    await page.goto( 'https://www.munzee.com/m/' + strUserName + '/' );
    var strPlayerName = await page.evaluate( () => {
      return ( document.getElementById( 'user-stats' ) ? document.getElementById( 'user-stats' ).getElementsByClassName( 'avatar-username' )[ 0 ].childNodes[ 0 ].innerText : undefined );
    } );
    await browser.close();
    
    if ( strPlayerName === undefined ) {
      console.warn( '%s: Unable to find a Munzee profile page for: %s\n\thttps://www.munzee.com/m/%s/', strNow(), strUserName, strUserName );
      strPlayerName = 'ERROR404: ' + strUserName;
    }
    if ( isDebug ) { console.info( 'Munzee player name for "%s" is "%s"', strUserName, strPlayerName ); }
    
    return strPlayerName;
  }
}

async function getTitleBadges( strUserName ) {
  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
  const basePage = 'https://www.munzee.com/m/' + strUserName + '/';
  
  await page.goto( basePage );
  var objBadges = await page.evaluate( () => {
    if ( document.getElementById( 'error' ) ) {
      return { error: true };
    } else {
      const domUD = document.getElementById( 'user-stats' );
      const domUS = domUD.getElementsByClassName( 'user-stat' );
      const intAge = parseInt( domUS[ domUS.length - 1 ].getElementsByTagName( 'span' )[ 0 ].innerText.replace( /,/g, '' ) );
      var objTitles = { error: false, arrTitles: [], unknownTitles: [], hasUndefined: false, isPremium: false, inClan: false, ageDays: intAge };
      if ( domUD.getElementsByClassName( 'premium' )[ 0 ].childElementCount !== 0 ) {
        objTitles.isPremium = true;
      }
      if ( domUD.getElementsByClassName( 'clan' )[ 0 ].childElementCount !== 0 ) {
        objTitles.inClan = true;
      }
      var arrTitles = Array.from( domUD.getElementsByClassName( 'title-badge' ) );
      arrTitles.forEach( function( title, intTitle ) {
        objTitles.arrTitles.push( title.innerText );
        switch ( title.innerText ) {
          case 'Inactive': objTitles.isInactive = true; break;
          case 'Dormant': objTitles.isDormant = true; break;
          case 'ZeeQRew': objTitles.isZeeQRew = true; break;
          case 'QRew': objTitles.isQRew = true; break;
          case 'Advent': objTitles.isAdvent = true; break;
          case 'GOTM': objTitles.isGOTM = true; break;
          case 'POTM': objTitles.isPOTM = true; break;
          case 'POTW': objTitles.isPOTW = true; break;
          case 'King Munzee': objTitles.isKing = true; break;
          case 'Queen Munzee': objTitles.isQueen = true; break;
          case 'First Lady': objTitles.isFirstLady = true; break;
          case 'MIB': objTitles.isMIB = true; break;
          case 'Authorized Reseller': objTitles.isAuthReseller = true; break;
          case 'Munzee Guide Author': objTitles.isMunzeeGuideAuthor = true; break;
          case 'MHQ' : objTitles.isMHQ = true; break;
          case 'MunzeeSupport': objTitles.isSupport = true; break;
          case 'Freezetag': objTitles.isFreezetag = true; break;
          case 'Freezetag CFO/CTO': objTitles.isFreezetagCFOCTO = true; break;
          case 'Cofounder': objTitles.isCoFounder = true; break;
          case 'CZeeO': objTitles.isCZeeO = true; break;
          default:
            objTitles.unknownTitles.push( title.innerText );
        }
        
        if ( intTitle === 0 ) {
          objTitles.strTitles = '`' + title.innerText + '`';
        } else if ( arrTitles.length === 2 && intTitle === 1 ) {
          objTitles.strTitles += ' and `' + title.innerText + '`';
        } else if ( arrTitles.length > 2 && intTitle === ( arrTitles.length - 1 ) ) {
          objTitles.strTitles += ', and `' + title.innerText + '`';
        } else {
          objTitles.strTitles += ', `' + title.innerText + '`';
        }
      } );
      
      return objTitles;
    }
  } );
  
  await browser.close();
  
  if ( objBadges.hasUndefined ) {
    console.warn( '%s: %i unknown Munzee title%s found: %o', strNow(), objBadges.unknownTitles.length, ( objBadges.unknownTitles.length === 1 ? '' : 's' ), objBadges.unknownTitles );
  }
  if ( isDebug ) { console.info( '%s: Player Badges: %o', strNow(), objBadges ); }
  return objBadges;
}

async function getBasicPlayerData( message, strUserName, objMessage ) {
  if ( !message ) {// Throw new Error if message or strUserName are not defined.
    throw new Error( 'object "message" is required to process getBasicPlayerData()' );
  } else if ( !strUserName ) {
    throw new Error( 'String "strUserName" is required to process getBasicPlayerData()' );
  } 
  else {
    var objEmbed = new Discord.RichEmbed()
      .setTitle( 'Gathering Basic Player Data for: __' + strUserName + '__' );
    
    if ( objMessage === undefined ) {
      objMessage = await message.channel.send( 'Gathering Basic Player Data for: __' + strUserName + '__', { embed: objEmbed } );
    }
    
//    const browser = await puppeteer.launch( { headless: false } );
    const browser = await puppeteer.launch( );
    const page = await browser.newPage( );
    const basePage = 'https://www.munzee.com/m/' + strUserName + '/';
    
    await page.goto( basePage );
      objEmbed
        .setURL( basePage )
        .setDescription(
          '**Handle:** ' + '__Collecting...__' +
          '\n**Age:** ' + '__Collecting...__' +
          '\n**Points:** ' + '__Collecting...__' +
          '\n**Level:** ' + '__Collecting...__' +
          '\n**Premium:** ' + '__Collecting...__' +
          '\n**Clan Name:** ' + '__Collecting...__' +
          '\n**Activity:** ' + '__Collecting...__'
        );
      objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "basic information".' ); } );

    var objMember = await page.evaluate( () => {
      if ( document.getElementById( 'error' ) ) {
        return {
          error: 404,
          avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
        };
      }
      else {
        const domUD = document.getElementById( 'user-stats' );
        const domUS = domUD.getElementsByClassName( 'user-stat' );
        const domClan = domUD.getElementsByClassName( 'clan' )[ 0 ].childNodes;
        const isPremium = ( domUD.getElementsByClassName( 'fa-star' ).length === 1 ? true : false );
//        const strPremiumExpires = ( isPremium ? domUD.getElementsByClassName( 'fa-star' )[ 0 ].attributes[ 'data-original-title' ].value.replace( 'expires ', '' ) : 'July 1, 2011' );
/* Failing here because the information isn't loaded on the page before evaluate tries to read it.
        var domRAbar = [];
        if ( document.getElementsByClassName( 'indicator-box' ).length > 0 ) {
          domRAbar = Array.from( document.getElementsByClassName( 'indicator-box' )[ 0 ].querySelectorAll( 'td' ) );
        }
        var arrRAbar = [];
        if ( domRAbar.length === 0 ) {
          for ( var i = 0; i <= 31; i++ ) {
            arrRAbar.push( { deployed: -1, captured: -1 } );
          }
        } else {
          domRAbar.forEach( function( day ) {
            var arrDay = day.getElementsByClassName( 'indicator' )[ 0 ].attributes[ 1 ].nodeValue.split( ' | ' );
            arrRAbar.push( { deployed: parseInt( arrDay[ 1 ].replace( 'deployed', '' ) ), captured: parseInt( arrDay[ 2 ].replace( 'captured', '' ) ) } );
          } );
        }
        var arrAB = Array.from( arrRAbar ).splice( 17 ).reverse();
        var strActivityBar = '';
        for ( var d = 0; d < 14; d++ ) {
          var objDay = arrAB.pop();
          strActivityBar += ( objDay.captured > 0 && objDay.deployed > 0 ? '<:greenie:464435294414962688>' : ( objDay.captured > 0 ? '<:captured:485226669620199435>' : ( objDay.deployed > 0 ? '<:owned:495813337616089092>' : '<:UTL:479663610973519890>' ) ) );
        }
//*/
        return {
          handle: domUD.getElementsByClassName( 'avatar-username' )[ 0 ].childNodes[ 0 ].innerText,
          avatar: domUD.getElementsByClassName( 'user-photo' )[ 0 ].src,
          level: parseInt( domUD.getElementsByClassName( 'user-rank' )[ 0 ].childNodes[ 0 ].innerText || -1 ),
          points: parseInt( domUS[ 0 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) || -1 ),
          clan: {
            name: ( domClan.length > 1 ? domClan[ 1 ].childNodes[ 4 ].innerText : '' ),
            URL: ( domClan.length > 1 ? domClan[ 3 ].href : '' ),
          },
//          activity: arrRAbar,
          captures: [],
          number_of_captures: parseInt( domUS[ 1 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) || -1 ),
          myth_captures: 0,
          physical_captures: 0,
          social_captures: 0,
          virtual_captures: 0,
          deploys: [],
          number_of_deploys: parseInt( domUS[ 2 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) || -1 ),
          archived_deploys: 0,
          myth_deploys: 0,
          physical_deploys: 0,
          social_deploys: 0,
          virtual_deploys: 0,
          badges: [],
          number_of_badges: parseInt( domUS[ 3 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) || -1 ),
          age: parseInt( domUS[ 4 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) || -1 ),
          isPremium: isPremium,
//          premiumExpires: ( new Date( strPremiumExpires ) ),
//          strActivityBar: strActivityBar
          strActivityBar: 'NO DATA'
        };
      }
    } );
    
    var objTitleBadges = await getTitleBadges( strUserName );
    objMember.strTitles = objTitleBadges.strTitles;
    for ( var title in objTitleBadges ) {
      if ( title !== 'error' && title !== 'strTitles' ) {
        objMember[ title ] = objTitleBadges[ title ];
      }
    }
    
    objEmbed.setThumbnail( objMember.avatar );
    
    if ( objMember.error === 404 ) {
      objEmbed.setDescription( 'Oops, looks like there is no such user as: `' + strUserName + '`' );
    } else {
      objEmbed
        .setDescription(
          '\n**Handle:** ' + objMember.handle +
          '\n**Points:** ' + objMember.points.toLocaleString() +
          '\n**Level:** ' + objMember.level +
          '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
          '\n**Clan Name:** ' + objMember.clan.name +
          '\n**Titles:** ' + objMember.strTitles +
          '\n**Activity:** ' + objMember.strActivityBar +
          '\n\n**__Please stand by... closing connection__**'
        );
    }
    objMessage.edit( '**__CLOSING CONNECTION__**', { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "captures".' ); } );

//    console.info( 'MunzeePlayer:', objMember );
  
    await browser.close();
  
    if ( objTitleBadges.hasUndefined ) {
      console.warn( '%s: %i unknown Munzee title%s found: %o', strNow(), objTitleBadges.unknownTitles.length, ( objTitleBadges.unknownTitles.length === 1 ? '' : 's' ), objTitleBadges.unknownTitles );
    }
    
    objEmbed.setDescription( '**__DATA COLLECTION COMPLETE__**\n\nReturning player information to requesting command.' );
    objMessage.edit( 'DATA COLLECTION COMPLETE:', { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering information is complete.' ); } );
    
    return objMember;
  }
}

async function getClanData( strUserName ) {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  const playerPage = 'https://www.munzee.com/m/' + strUserName + '/';
  await page.goto( playerPage );
  var objClanName = await page.evaluate( () => {
    if ( document.getElementById( 'error' ) ) {
      return {
        error: 404,
        avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
      };
    }
    else {
      const domUD = document.getElementById( 'user-stats' );
      const domClan = domUD.getElementsByClassName( 'clan' )[ 0 ].childNodes;
      return {
        clanName: ( domClan.length > 1 ? domClan[ 1 ].childNodes[ 4 ].innerText : undefined ),
        clanNameURL: ( domClan.length > 1 ? domClan[ 1 ].childNodes[ 4 ].href.split( '/' )[4] : undefined )
      }
    }
  } );
  
  if ( objClanName.error === 404 ) {
    return {
      error: 404,
      errorType: 'player',
      errorName: strUserName,
      avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
    };
  }
  else if ( objClanName.clanNameURL === undefined ) {
    return {
      error: 404,
      errorType: 'no clan',
      avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
    };
  }
  else {
    const clansPage = 'https://www.munzee.com/clans/' + objClanName.clanNameURL + '/';
    await page.goto( clansPage );
    objClansData = await page.evaluate( () => {
      if ( document.getElementById( 'error' ) ) {
        return {
          error: 404,
          errorType: 'clan\'s',
          errorName: objClanName.clanName,
          avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
        };
      }
      else {
        var clanMembers = [];
        $( 'div#munzee-holder > table.table > tbody > tr' ).each( ( row, member ) => {
          let objIdRow = member.children[ 1 ].children[ 0 ];
          let strClanmateId = ( row === 10 ? '' : objIdRow.children[ 0 ].src.split( '/' )[ 5 ].split( '.' )[ 0 ] );
          let strClanmateName = ( row === 10 ? '' : member.children[ 2 ].innerText ).trim();
          let strClanmateAdmin = ( $( member.children[ 2 ] ).has('i.fa.fa-key').length === 1 ? true : false );
          let objClanmatePoints = ( row === 10 ? member.children[ 3 ] : member.children[ 6 ] );
          let intClanmatePoints = parseInt( objClanmatePoints.innerText.replace( ',', '' ) );
          
          clanMembers.push( { place: ( row === 10 ? NaN : ( row + 1 ) ), id: strClanmateId, name: strClanmateName, admin: strClanmateAdmin, points: intClanmatePoints } );
        } );
        return {
          clanLevel:  $( 'h3#weapons span' ).text()[ 0 ],
          clanMembers: clanMembers
        }
      }
    } );
  }
/*  await browser.close().then( browserClosed => {
      if ( isDebug ) { console.log( '%s: getClanData() has successfully closed the browser: %o', strNow(), browserClosed ); }
      objClansData.state = 'success';
    } ).catch( browserOpen => {
      console.error( '%s: getClanData() has failed to close the browser: %o', strNow(), browserOpen );
      objClansData.state = 'error';
      objClansData.errorMsg = 'Failed to close browser.'
      console.warn( '%s: getClanData() is returning objClansData: %o', strNow(), objClansData );
    } );//*/
  
  return objClansData;
}

async function getZeeQRewData( strUserName, message, objMessage ) {
  const intMaxPages = 1000;
  const arrMyths = [ 'pegasus', 'theunicorn', 'leprechaun', 'dragon', 'yeti', 'faun', 'hydra', 'mermaid', 'cyclops', 'rainbowunicorn', 'gnomeleprechaun', 'icedragon', 'sasquatchyeti', 'cherub', 'chimera', 'siren', 'ogre', 'firepagasus', 'tuli', 'vesi', 'tulimber', 'vesial', 'tuliferno', 'vesisaur' ];
  const arrVirtuals = [ 'carrotseed', 'carrotplant', 'carrot', 'peasseed', 'peasplant', 'peas', 'colt', 'racehorse', 'championshiphorse', 'chick', 'chicken', 'eggs', 'farmer', 'farmerandwife', 'family', 'pottedplant', 'garden', 'field', 'canoe', 'motorboat', 'submarine', 'firstwheel', 'penny-farthingbike', 'musclecar', 'safaritruck', 'safarivan', 'safaribus', 'surprise', 'airmystery', 'nightvisiongoggles', 'catapult', 'crossbow',// Throw all the rooms in here for now
  'timeshareroom', 'motel', 'hotel' ];
  
  const isMessage = ( message !== undefined ? true : false );
  if ( isMessage ) {
    var objEmbed = new Discord.RichEmbed()
      .setTitle( '**Gathering player information:** ' );
    
    if ( objMessage === undefined ) {
      var objMessage = await message.channel.send();
    }
  }
  
  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
  const basePage = 'https://www.munzee.com/m/' + strUserName + '/';
  
  await page.goto( basePage );
  
  if ( isMessage ) {
    objEmbed
      .setURL( basePage )
      .setDescription(
        '**Handle:** ' + '__Collecting...__' +
        '\n**Points:** ' + '__Collecting...__' +
        '\n**Premium:** ' + '__Collecting...__' +
        '\n**Deploys:** ' + '__Waiting...__' +
        '\n**Captures:** ' + '__Waiting...__' +
        '\n**Recent Activity:** ' + '__Collecting...__'
      );
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "basic information".' ); } );
  }
  
  var objMember = await page.evaluate( () => {
    if ( document.getElementById( 'error' ) ) {
      return {
        error: '404',
        avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
      }
    } else {
      const domUD = document.getElementById( 'user-stats' );
      const domUS = domUD.getElementsByClassName( 'user-stat' );
      return {
        handle: domUD.getElementsByClassName( 'avatar-username' )[ 0 ].childNodes[ 0 ].innerText,
        avatar: domUD.getElementsByClassName( 'user-photo' )[ 0 ].src,
        level: parseInt( domUD.getElementsByClassName( 'user-rank' )[ 0 ].childNodes[ 0 ].innerText ),
        points: parseInt( domUS[ 0 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        captures: [],
        number_of_captures: parseInt( domUS[ 1 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        myth_captures: 0,
        physical_captures: 0,
        social_captures: 0,
        virtual_captures: 0,
        deploys: [],
        number_of_deploys: parseInt( domUS[ 2 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        archived_deploys: 0,
        myth_deploys: 0,
        physical_deploys: 0,
        social_deploys: 0,
        virtual_deploys: 0,
        badges: [],
        number_of_badges: parseInt( domUS[ 3 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        age: parseInt( domUS[ 4 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        isPremium: ( domUD.getElementsByClassName( 'fa-star' ).length === 1 ? true : false )
      };
    }
  } );
  
  if ( isMessage ) {
    objEmbed.setThumbnail( objMember.avatar );
    
    if ( objMember.error === '404' ) {
      objEmbed.setDescription( 'Oops, looks like there is no such user as: ' + strUserName );
    } else {
      objEmbed
        .setDescription(
          '\n**Handle:** ' + objMember.handle +
          '\n**Points:** ' + objMember.points.toLocaleString() +
          '\n**Level:** ' + objMember.level +
          '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
          '\n**Deploys:** ' + '__Collecting...__' +
          '\n**Captures:** ' + '__Waiting...__'
        );
    }
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "deploys".' ); } );
    
    if ( objMember.error === '404' ) { return objMember; }
  }
  
  var intDeployPages = Math.ceil( objMember.number_of_deploys / 20 );
  intDeployPages = ( intDeployPages <= intMaxPages ? intDeployPages : intMaxPages );
  var intPercentPage = Math.floor( intDeployPages / 100 );
  for ( var intPageD = 0; intPageD < intDeployPages; intPageD++ ) {
    
    var updateEmbed = ( intPercentPage < 100 ? true : ( intPageD % intPercentPage === 0 ? true : false ) );
    if ( isMessage && updateEmbed ) {
      objEmbed.setDescription(
        '\n**Handle:** ' + objMember.handle +
        '\n**Points:** ' + objMember.points.toLocaleString() +
        '\n**Level:** ' + objMember.level +
        '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
        '\n**Deploys:** ' + '__Collecting... ' + ( Math.floor( ( ( 1 + intPageD ) / intDeployPages ) * 1000 ) / 10 ) + '%__' +
        '\n**Captures:** ' + '__Waiting...__'
      );
      objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "deploy page ' + ( 1 + intPageD ) + ' of ' + intDeployPages + '".' ); } );
    }
    
    console.info( 'Processing Deploy page %d of %d', ( 1 + intPageD ), intDeployPages );
    await page.goto( basePage + 'deploys/' + intPageD + '/' );
    var pageData = await page.evaluate( async () => {
      var arrPage = [];
      var deploysPage = document.getElementById( 'munzee-holder' ).querySelectorAll( 'section' );
      for ( var i = 0; i < deploysPage.length; i++ ) {
        var intDeploy = parseInt( deploysPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 5 ].replace( /,/g, '' ) );
        arrPage[ intDeploy ] = await {
          'id': intDeploy,
          'name': deploysPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].innerText,
          'type': deploysPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src.split( '/' )[ 5 ].split( '.' )[ 0 ] ,
          'icon': deploysPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src,
          'deployed_at': deploysPage[ i ].getElementsByClassName( 'deployed-at' )[ 0 ].attributes[ 1 ].value,
          'deploy_points': parseInt( deploysPage[ i ].getElementsByClassName( 'number' )[ 0 ].innerText.replace( /,/g, '' ) ),
          'captures': parseInt( deploysPage[ i ].getElementsByClassName( 'deploytext' )[ 0 ].childNodes[ 3 ].innerText.replace( /,/g, '' ) )
        };
        arrPage[ intDeploy ].age = await Math.floor( ( ( new Date() ).valueOf() - ( new Date( arrPage[ intDeploy ].deployed_at ).valueOf() ) ) / 86400000 );
      }
      return arrPage;
    } );
    pageData.forEach( function( deploy, index ) {
      if ( deploy ) {
        objMember.deploys[ index ] = deploy;
        if ( deploy.type.indexOf( 'social' ) !== -1 ) {
          objMember.social_deploys++;
        } else if ( arrMyths.indexOf( deploy.type ) !== -1 ) {
          objMember.myth_deploys++;
        } else if (
          deploy.type.indexOf( 'virtual' ) !== -1 ||
          deploy.type.indexOf( 'poi' ) !== -1 ||
          deploy.type.indexOf( 'flat' ) !== -1 ||
          deploy.type.indexOf( 'mvm' ) !== -1 ||
          arrVirtuals.indexOf( deploy.type ) !== -1
        ) {
          objMember.virtual_deploys++;
        } else {
          objMember.physical_deploys++;
        }
      }
    } );
  }
  
  var intCapturePages = Math.ceil( objMember.number_of_captures / 20 );
  intCapturePages = ( intCapturePages <= intMaxPages ? intCapturePages : intMaxPages );
  var intPercentPage = Math.floor( intCapturePages / 100 );
  for ( var intPageC = 0; intPageC < intCapturePages; intPageC++ ) {
    var updateEmbed = ( intPageC % intPercentPage === 0 ? true : false );
    if ( isMessage && updateEmbed ) {
      objEmbed.setDescription(
        '\n**Handle:** ' + objMember.handle +
        '\n**Points:** ' + objMember.points.toLocaleString() +
        '\n**Level:** ' + objMember.level +
        '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
        '\n**Deploys:** ' + objMember.number_of_deploys.toLocaleString() +
        '\n**Captures:** ' + '__Collecting... ' + ( Math.floor( ( ( 1 + intPageC ) / intCapturePages ) * 1000 ) / 10 ) + '%__'
      );
      objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "capture page ' + ( 1 + intPageC ) + ' of ' + intCapturePages + '".' ); } );
    }
    
    console.info( 'Processing Capture page %d of %d', ( 1 + intPageC ), intCapturePages );
    await page.goto( basePage + 'captures/' + intPageC + '/' );
    var pageData = await page.evaluate( () => {
      var arrPage = [];
      var intPageP = parseInt( document.URL.split( '/' )[ 6 ] );
      var capturesPage = document.getElementById( 'munzee-holder' ).querySelectorAll( 'section' );
      for ( var i = 0; i < capturesPage.length; i++ ) {
        var intCapture = ( ( intPageP * 20 ) + i );
        arrPage[ intCapture ] = {
          'id': parseInt( capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 5 ].replace( /,/g, '' ) ),
          'name': capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].innerText,
          'type': capturesPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src.split( '/' )[ 5 ].split( '.' )[ 0 ] ,
          'icon': capturesPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src,
          'captured_at': capturesPage[ i ].getElementsByClassName( 'captured-at' )[ 0 ].attributes[ 1 ].value,
          'capture_points': parseInt( capturesPage[ i ].getElementsByClassName( 'number' )[ 0 ].innerText.replace( /,/g, '' ) ),
          'deployed': {
            'handle': capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 4 ],
            'URL': 'https://www.munzee.com/m/' + capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 4 ] + '/',
            'deployed_at': capturesPage[ i ].getElementsByClassName( 'deployed-at' )[ 0 ].attributes[ 1 ].value
          }
        };
        arrPage[ intCapture ].ago = Math.floor( ( ( new Date() ).valueOf() - ( new Date( arrPage[ intCapture ].captured_at ).valueOf() ) ) / 86400000 );
      }
      return arrPage;
    } );
    pageData.forEach( function( capture, index ) {
      if ( capture ) {
        objMember.captures[ index ] = capture;
        if ( capture.type.indexOf( 'social' ) !== -1 ) {
          objMember.social_captures++;
        } else if ( arrMyths.indexOf( capture.type ) !== -1 ) {
          objMember.myth_captures++;
        } else if (
          capture.type.indexOf( 'virtual' ) !== -1 ||
          capture.type.indexOf( 'poi' ) !== -1 ||
          capture.type.indexOf( 'flat' ) !== -1 ||
          capture.type.indexOf( 'mvm' ) !== -1 ||
          arrVirtuals.indexOf( capture.type ) !== -1
        ) {
          objMember.virtual_captures++;
        } else {
          objMember.physical_captures++;
        }
      }
    } );
  }
    
  if ( isMessage ) {
    objEmbed.setDescription(
      '\n**Handle:** ' + objMember.handle +
      '\n**Points:** ' + objMember.points.toLocaleString() +
      '\n**Level:** ' + objMember.level +
      '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
      '\n**Deploys:** ' + objMember.number_of_deploys.toLocaleString() +
      '\n**Captures:** ' + objMember.number_of_captures.toLocaleString()
    );
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "badges".' ); } );
  }
    
  if ( isMessage ) {
    objEmbed.setDescription(
      '\n**Handle:** ' + objMember.handle +
      '\n**Points:** ' + objMember.points.toLocaleString() +
      '\n**Level:** ' + objMember.level +
      '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
      '\n**Deploys:** ' + objMember.number_of_deploys.toLocaleString() +
      '\n**Captures:** ' + objMember.number_of_captures.toLocaleString() +
      '\n\n**__Please stand by... closing connection__**'
    );
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering information is complete.' ); } );
  }
  console.info( 'MunzeePlayer: %o', objMember.deploys );
  
  await browser.close();
  
  if ( isMessage ) {
    objEmbed.setDescription( '**__DATA COLLECTION COMPLETE__**\n\nReturing player information to requesting command.' );
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering information is complete.' ); } );
  }
  
  return objMember;
}

async function getMemberData( strUserName, message, objMessage ) {
  const intMaxPages = 1000;//8815;
  const arrMyths = [ 'pegasus', 'theunicorn', 'leprechaun', 'dragon', 'yeti', 'faun', 'hydra', 'mermaid', 'cyclops', 'rainbowunicorn', 'gnomeleprechaun', 'icedragon', 'sasquatchyeti', 'cherub', 'chimera', 'siren', 'ogre', 'firepagasus', 'tuli', 'vesi', 'tulimber', 'vesial', 'tuliferno', 'vesisaur' ];
  const arrVirtuals = [ 'carrotseed', 'carrotplant', 'carrot', 'peasseed', 'peasplant', 'peas', 'colt', 'racehorse', 'championshiphorse', 'chick', 'chicken', 'eggs', 'farmer', 'farmerandwife', 'family', 'pottedplant', 'garden', 'field', 'canoe', 'motorboat', 'submarine', 'firstwheel', 'penny-farthingbike', 'musclecar', 'safaritruck', 'safarivan', 'safaribus', 'surprise', 'airmystery', 'nightvisiongoggles', 'catapult', 'crossbow' ];
  
  const isMessage = ( message !== undefined ? true : false );
  if ( isMessage ) {
    var objEmbed = new Discord.RichEmbed()
      .setTitle( '**Gathering player information:** ' );
    
    if ( objMessage === undefined ) {
      var objMessage = await message.channel.send();
    }
  }
  
  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
  const basePage = 'https://www.munzee.com/m/' + strUserName + '/';
  
  await page.goto( basePage );
  
  if ( isMessage ) {
    objEmbed
      .setURL( basePage )
      .setDescription(
        '**Handle:** ' + '__Collecting...__' +
        '\n**Points:** ' + '__Collecting...__' +
        '\n**Level:** ' + '__Collecting...__' +
        '\n**Premium:** ' + '__Collecting...__' +
        '\n**Deploys:** ' + '__Waiting...__' +
        '\n**Captures:** ' + '__Waiting...__'
      );
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "basic information".' ); } );
  }
  
  var objMember = await page.evaluate( () => {
    if ( document.getElementById( 'error' ) ) {
      return {
        error: '404',
        avatar: 'https://munzee.global.ssl.fastly.net/images/site/404-not-found.jpg'
      }
    }
    else {
      const domUD = document.getElementById( 'user-stats' );
      const domUS = domUD.getElementsByClassName( 'user-stat' );
      return {
        handle: domUD.getElementsByClassName( 'avatar-username' )[ 0 ].childNodes[ 0 ].innerText,
        avatar: domUD.getElementsByClassName( 'user-photo' )[ 0 ].src,
        level: parseInt( domUD.getElementsByClassName( 'user-rank' )[ 0 ].childNodes[ 0 ].innerText ),
        points: parseInt( domUS[ 0 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        captures: [],
        number_of_captures: parseInt( domUS[ 1 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        myth_captures: 0,
        physical_captures: 0,
        social_captures: 0,
        virtual_captures: 0,
        deploys: [],
        number_of_deploys: parseInt( domUS[ 2 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        archived_deploys: 0,
        myth_deploys: 0,
        physical_deploys: 0,
        social_deploys: 0,
        virtual_deploys: 0,
        badges: [],
        number_of_badges: parseInt( domUS[ 3 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        age: parseInt( domUS[ 4 ].childNodes[ 0 ].innerText.replace( /,/g, '' ) ),
        isPremium: ( domUD.getElementsByClassName( 'fa-star' ).length === 1 ? true : false ),
//        premiumExpires: ( new Date( domUD.getElementsByClassName( 'fa-star' ).length === 1 ? domUD.getElementsByClassName( 'fa-star' )[ 0 ].attributes[ 'data-original-title' ].value.replace( 'expires ', '' ) : 'July 1, 2011' ) )
      };
    }
  } );
  
  var objMemberTitles = await getTitleBadges( strUserName );
  var isZeeQRew = objMemberTitles.isZeeQRew;
  objMember.isZeeQRew = isZeeQRew;
  
  if ( isMessage ) {
    objEmbed.setThumbnail( objMember.avatar );
    
    if ( objMember.error === '404' ) {
      objEmbed.setDescription( 'Oops, looks like there is no such user as: ' + strUserName );
    } else {
      objEmbed
        .setDescription(
          '\n**Handle:** ' + objMember.handle +
          '\n**Points:** ' + objMember.points.toLocaleString() +
          '\n**Level:** ' + objMember.level +
          '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
          '\n**Deploys:** ' + '__Collecting...__' +
          '\n**Captures:** ' + '__Waiting...__'
        );
    }
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "captures".' ); } );
    
    if ( objMember.error === '404' ) { return objMember; }
  }
  
  var intDeployPages = 1;
  var intPercentPage = Math.floor( intDeployPages / 100 );
  var intCapturePages = 1;
  var intPercentPage = Math.floor( intCapturePages / 100 );
  var updateEmbed = false;
  
  intDeployPages = Math.ceil( objMember.number_of_deploys / 20 );
  intDeployPages = ( intDeployPages <= intMaxPages ? intDeployPages : intMaxPages );
  intPercentPage = Math.floor( intDeployPages / 100 );

  intCapturePages = Math.ceil( objMember.number_of_captures / 20 );
  intCapturePages = ( intCapturePages <= intMaxPages ? intCapturePages : intMaxPages );
  intPercentPage = Math.floor( intCapturePages / 100 );
  
  for ( var intPageD = 0; intPageD < intDeployPages; intPageD++ ) {
    updateEmbed = ( intPercentPage < 100 ? true : ( intPageD % intPercentPage === 0 ? true : false ) );
    if ( isMessage && updateEmbed ) {
      objEmbed.setDescription(
        '\n**Handle:** ' + objMember.handle +
        '\n**Points:** ' + objMember.points.toLocaleString() +
        '\n**Level:** ' + objMember.level +
        '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
        '\n**Deploys:** ' + '__Collecting... ' + ( Math.floor( ( ( 1 + intPageD ) / intDeployPages ) * 1000 ) / 10 ) + '%__' +
        '\n**Captures:** ' + '__Waiting...__'
      );
      objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "deploy page ' + ( 1 + intPageD ) + ' of ' + intDeployPages + '".' ); } );
    }
    
    if ( isDebug ) { console.info( 'Processing Deploy page %d of %d for %s', ( 1 + intPageD ), intDeployPages, strUserName ); }
    await page.goto( basePage + 'deploys/' + intPageD + '/' );
    var pageData = await page.evaluate( () => {
      var arrPage = [];
      var deploysPage = document.getElementById( 'munzee-holder' ).querySelectorAll( 'section' );
      for ( var i = 0; i < deploysPage.length; i++ ) {
        var intDeploy = parseInt( deploysPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 5 ].replace( /,/g, '' ) );
        arrPage[ intDeploy ] = {
          'id': intDeploy,
          'name': deploysPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].innerText,
          'type': deploysPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src.split( '/' )[ 5 ].split( '.' )[ 0 ] ,
          'icon': deploysPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src,
          'deployed_at': deploysPage[ i ].getElementsByClassName( 'deployed-at' )[ 0 ].attributes[ 1 ].value,
          'deploy_points': parseInt( deploysPage[ i ].getElementsByClassName( 'number' )[ 0 ].innerText.replace( /,/g, '' ) ),
          'captures': parseInt( deploysPage[ i ].getElementsByClassName( 'deploytext' )[ 0 ].childNodes[ 3 ].innerText.replace( /,/g, '' ) )
        };
        arrPage[ intDeploy ].age = Math.floor( ( ( new Date() ).valueOf() - ( new Date( arrPage[ intDeploy ].deployed_at ).valueOf() ) ) / 86400000 );
      }
      return arrPage;
    } );
    
    pageData.forEach( function( deploy, index ) {
      if ( deploy ) {
        objMember.deploys[ index ] = deploy;
        if ( arrMyths.indexOf( deploy.type ) !== -1 ) {
          objMember.myth_deploys++;
        } else if (
          deploy.type.indexOf( 'virtual' ) !== -1 ||
          deploy.type.indexOf( 'poi' ) !== -1 ||
          deploy.type.indexOf( 'flat' ) !== -1 ||
          deploy.type.indexOf( 'mvm' ) !== -1 ||
          arrVirtuals.indexOf( deploy.type ) !== -1
        ) {
          objMember.virtual_deploys++;
        } else if ( deploy.type.indexOf( 'social' ) !== -1 ) {
          objMember.social_deploys++;
        } else {
          objMember.physical_deploys++;
        }
      }
    } );
    
    if ( objMember.physical_deploys >= 250 ) {
      if ( intPageD < intDeployPages ) {
        objMember.physical_deploys_plus = true;
      }
      intPageD = intDeployPages + 1;
    }
  }
  
  for ( var intPageC = 0; intPageC < intCapturePages; intPageC++ ) {
    updateEmbed = ( intPageC % intPercentPage === 0 ? true : false );
    if ( isMessage && updateEmbed ) {
      objEmbed.setDescription(
        '\n**Handle:** ' + objMember.handle +
        '\n**Points:** ' + objMember.points.toLocaleString() +
        '\n**Level:** ' + objMember.level +
        '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
        '\n**Deploys:** ' + ( objMember.physical_deploys_plus ? '250+' : objMember.physical_deploys.toLocaleString() ) +
        '\n**Captures:** ' + '__Collecting... ' + ( Math.floor( ( ( 1 + intPageC ) / intCapturePages ) * 1000 ) / 10 ) + '%__'
      );
      objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering "capture page ' + ( 1 + intPageC ) + ' of ' + intCapturePages + '".' ); } );
    }
    
    if ( isDebug ) { console.info( '%s: Processing Capture page %d of %d for %s', strNow(), ( 1 + intPageC ), intCapturePages, strUserName ); }
    await page.goto( basePage + 'captures/' + intPageC + '/' );
    var pageData = await page.evaluate( () => {
      var arrPage = [];
      var intPageP = parseInt( document.URL.split( '/' )[ 6 ] );
      var capturesPage = document.getElementById( 'munzee-holder' );
      if ( capturesPage !== null ) {
        capturesPage = capturesPage.querySelectorAll( 'section' );
        for ( var i = 0; i < capturesPage.length; i++ ) {
          var intCapture = ( ( intPageP * 20 ) + i );
          arrPage[ intCapture ] = {
            'id': parseInt( capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 5 ].replace( /,/g, '' ) ),
            'name': capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].innerText,
            'type': capturesPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src.split( '/' )[ capturesPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src.split( '/' ).length - 1 ].split( '.' )[ 0 ],
            'icon': capturesPage[ i ].getElementsByClassName( 'pin' )[ 0 ].src,
            'captured_at': capturesPage[ i ].getElementsByClassName( 'captured-at' )[ 0 ].attributes[ 1 ].value,
            'capture_points': parseInt( capturesPage[ i ].getElementsByClassName( 'number' )[ 0 ].innerText.replace( /,/g, '' ) ),
            'deployed': {
              'handle': capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 4 ],
              'URL': 'https://www.munzee.com/m/' + capturesPage[ i ].getElementsByClassName( 'munzee-id' )[ 0 ].href.split( '/' )[ 4 ] + '/',
              'deployed_at': capturesPage[ i ].getElementsByClassName( 'deployed-at' )[ 0 ].attributes[ 1 ].value
            }
          };
          arrPage[ intCapture ].ago = Math.floor( ( ( new Date() ).valueOf() - ( new Date( arrPage[ intCapture ].captured_at ).valueOf() ) ) / 86400000 );
        }
      }
      return arrPage;
    } );
    if ( pageData.length === 0 ) {
      console.error( '%s: Capture page %d of %d for %s returned empty - may have been an error on the page.', strNow(), ( 1 + intPageC ), intCapturePages, strUserName );
    } else {
      pageData.forEach( function( capture, index ) {
        if ( capture ) {
          objMember.captures[ index ] = capture;
          if ( arrMyths.indexOf( capture.type ) !== -1 ) {
            objMember.myth_captures++;
          } else if (
            capture.type.indexOf( 'virtual' ) !== -1 ||
            capture.type.indexOf( 'poi' ) !== -1 ||
            capture.type.indexOf( 'flat' ) !== -1 ||
            capture.type.indexOf( 'mvm' ) !== -1 ||
            arrVirtuals.indexOf( capture.type ) !== -1
          ) {
            objMember.virtual_captures++;
          } else if ( capture.type.indexOf( 'social' ) !== -1 ) {
            objMember.social_captures++;
          } else {
            objMember.physical_captures++;
          }
        }
      } );
    }
    
    if ( objMember.physical_captures >= 500 ) {
      if ( intPageD < intDeployPages ) {
        objMember.physical_deploys_plus = true;
      }
      intPageC = intCapturePages + 1;
    }
  }
    
  if ( isMessage ) {
    objEmbed.setDescription(
      '\n**Handle:** ' + objMember.handle +
      '\n**Points:** ' + objMember.points.toLocaleString() +
      '\n**Level:** ' + objMember.level +
      '\n**Premium:** ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) +
      '\n**Deploys:** ' + ( objMember.physical_deploys_plus ? '250+' : objMember.physical_deploys.toLocaleString() ) +
      '\n**Captures:** ' + ( objMember.physical_captures_plus ? '500+' : objMember.physical_captures.toLocaleString() ) +
      '\n\n**__Please stand by... closing connection__**'
    );
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering information is complete.' ); } );
  }
//  console.info( 'MunzeePlayer:', objMember );
  
  await browser.close();
  
  if ( isMessage ) {
    objEmbed.setDescription( '**__DATA COLLECTION COMPLETE__**\n\nReturing player information to requesting command.' );
    objMessage.edit( { embed: objEmbed } ).catch( errEdit => { console.error( 'Error updating getMemberData() message to indicate gathering information is complete.' ); } );
  }
  
  return objMember;
}

/*async function createChannel() {// Will be needed for !add event/garden command
  
}//*/

async function createRole( guild, objNewRole, objMembers ) {// Will be needed for !add event/garden command and doAutoRole()
  if ( objNewRole === undefined ) {
    objNewRole = {
      name: 'createRole(Undefined)',
      hoist: false,
      position: 1,
      permissions: 0,
      mentionable: false,
      reason: 'No reason specified.'
    };
  }
  else if ( objNewRole.name === undefined ) {// createRole(Undefined)
    objNewRole.name = 'createRole(Undefined)';
  }
  else if ( objNewRole.reason === undefined ) {// No reason specified.
    objNewRole.reason = 'No reason specified.';
  }
  var result = { success: true, roleParams: objNewRole };
  try {
    var roleCreated = await guild.createRole( objNewRole, objNewRole.reason );
  }
  catch ( errCreate ) {
    result.success = false;
    result.error = errCreate;
    console.error( 'Unable to createRole() in %s with parameters: %o', guild.name, objNewRole, objNewRole.reason );
  }
  if ( result.success && objMembers !== undefined ) {
    if (  objMembers.length === undefined ) {
      objMembers = [ objMembers ];
    }
    result.members = objMembers;
    objMembers.forEach( objMember => {console.log( 'Attempting to add roleCreated to %s#%s', ( objMember.nickname || objMember.user.name ), objMember.discriminator );
      objMember.addRole( roleCreated, 'Adding member to new role I created, as requested.' );
    } );
  }
  
  console.log( 'createRole() is returning a result of: %o', result );
  return result;
}

async function doAutoRole( member, strUserName, channel = false ) {
  console.log( 'Attempting to process doAutoRole( <@%s>, %s ) where member is a `%s`;', member.id, strUserName, typeof( member ) );
  var syncSucceeded = true;
  if ( typeof( member ) !== 'object' ) {
    console.error( 'Failed to process doAutoRole( <@%s>, %s ) where member is a `%s`;', member.id, strUserName, typeof( member ) );
    syncSucceeded = false;
    strPlayerName = ( strUserName || member.toString() || 'undefined' );
  }
  else {
    // console.log( 'Checking if member isPremium, isClanMember, isClanAdmin, isNew, isVet' );
    var isPlayer = ( await member.roles.find( role => { if ( role.id === ROLE.Player ) { return role; } } ) ? true : false );
    var isPremium = ( await member.roles.find( role => { if ( role.id === ROLE.Premium ) { return role; } } ) ? true : false );
    var isClanMember = ( await member.roles.find( role => { if ( role.id === ROLE.ClanMember ) { return role; } } ) ? true : false );
    var isClanAdmin = ( await member.roles.find( role => { if ( role.id === ROLE.ClanAdmin ) { return role; } } ) ? true : false );
    var isNew = ( await member.roles.find( role => { if ( role.id === ROLE.NewPlayer ) { return role; } } ) ? true : false );
    var isVet = ( await member.roles.find( role => { if ( role.id === ROLE.VeteranPlayer ) { return role; } } ) ? true : false );
    // console.log( '\t\t\t\t\t %s\t\t%s\t\t\t%s\t%s\t%s', (isPremium?'true':'false'), (isClanMember?'true':'false'), (isClanAdmin?'true':'false'), (isNew?'true':'false'), (isVet?'true':'false') );
    // console.log( 'Getting a list of current title-badge roles...' );
    var mhqRoles = await member.guild.roles.filter( role => { if ( role.hexColor == '#8bc34a' ) { return role; } } );
    // console.log( 'Found %i title-badge roles.\nAttempting to get case sensitive player name for: %s', mhqRoles.size, ( strUserName || ( member.nickname || member.user.username ) ) );
    var strPlayerName = await getPlayerName( strUserName || ( member.nickname || member.user.username ) );
    if ( strUserName !== undefined ) {
      console.log( 'Setting player\'s nickname to %s', strPlayerName );
      member.setNickname( strPlayerName, 'Setting nickname by !sync command.' )
        .then( () => { console.log( 'doAutoRole() successfully set %s\'s nickname to %s', ( member.nickname || member.user.username ), strUserName ); } )
        .catch( errSetNick => {
          syncSucceeded = false;
          console.error( 'doAutoRole() unable to set %s\'s nickname to %s: %o', ( member.nickname || member.user.username ), strUserName, errSetNick );
        } );
    }
    // console.log( '%s\'s player name is: %s\nAttempting to getTitleBadges( \'%s\' )', ( member.nickname || strUserName ), strPlayerName, strPlayerName );
    var objTitleBadges = await getTitleBadges( strPlayerName );
    
    if ( objTitleBadges.error ) {
      console.error( 'getTitleBadges returned an error: %o', objTitleBadges );
      return { success: false, name: strPlayerName };
    }
    
    // Create array of roles to check
    var arrAddRoleNames = [], arrRemoveRoleNames = [], arrMhqRoles = [];
    var intNewPlayerDays = 366, intVeteranPlayerDays = 1826;
    if ( !isPlayer && ( strUserName === undefined || strUserName.toLowerCase() === strPlayerName.toLowerCase() ) ) {// Add @Player
      arrAddRoleNames.push( 'Player' );
      arrMhqRoles.push( 'Player' );
      // console.log('Add @Player');
    }
    if ( !isNew && objTitleBadges.ageDays <= intNewPlayerDays ) {// Add @New Player
      arrAddRoleNames.push( 'New Player' );
      arrMhqRoles.push( 'New Player' );
      // console.log('Add @New Player (%i)',objTitleBadges.ageDays);
    }
    else if ( isNew && objTitleBadges.ageDays > intNewPlayerDays ) {// Remove @New Player
      arrRemoveRoleNames.push( 'New Player' );
      // console.log('Remove @New Player (%i)',objTitleBadges.ageDays);
    }
    if ( !isVet && objTitleBadges.ageDays >= intVeteranPlayerDays ) {// Add @Veteran Player
      arrAddRoleNames.push( 'Veteran Player' );
      arrMhqRoles.push( 'Veteran Player' );
      // console.log('Add @Veteran Player (%i)',objTitleBadges.ageDays);
    }
    if ( !isPremium && objTitleBadges.isPremium ) {// Add @Premium
      arrAddRoleNames.push( 'Premium' );
      arrMhqRoles.push( 'Premium' );
      // console.log('Add @Premium');
    }
    else if ( isPremium && !objTitleBadges.isPremium ) {// Remove @Premium
      arrRemoveRoleNames.push( 'Premium' );
      // console.log('Remove @Premium');
    }
    if ( !isClanMember && objTitleBadges.inClan ) {// Add @Clan Member
      arrAddRoleNames.push( 'Clan Member' );
      arrMhqRoles.push( 'Clan Member' );
      // console.log('Add @Clan Member');
    }
    else if ( isClanMember && !objTitleBadges.inClan ) {// Remove @Clan Member
      arrRemoveRoleNames.push( 'Clan Member' );
      // console.log('Remove @Clan Member');
    }
    if ( !isClanAdmin && objTitleBadges.isPremium && objTitleBadges.inClan ) {// Add @Clan Admin
      arrAddRoleNames.push( 'Clan Admin' );
      arrMhqRoles.push( 'Clan Admin' );
      // console.log('Add @Clan Admin');
    }
    else if ( isClanAdmin && ( !objTitleBadges.isPremium || !objTitleBadges.inClan ) ) {// Remove @Clan Admin
      arrRemoveRoleNames.push( 'Clan Admin' );
      // console.log('Remove @Clan Admin');
    }
    objTitleBadges.arrTitles.forEach( title => { arrAddRoleNames.push( title ); } );// Add all title-badges, if any
    await mhqRoles.forEach( checkRole => {// Create an array of mhqRoles and remove roles not on MHQ
      arrMhqRoles.push( checkRole.name );
      if ( arrAddRoleNames.indexOf( checkRole.name ) === -1 ) {// Remove roles not on Munzee Website
        arrRemoveRoleNames.push( checkRole.name );
      }
    } );
    
    // Make sure that all of the roles exist that we want to add the member to - if a role is missing, create it.
    // console.log( 'Checking:\n\t%o\nAgainst:\n\t%o', arrAddRoleNames, arrMhqRoles );
    await arrAddRoleNames.forEach( async ( checkAdd, ndx ) => {
      // console.log('%s%s found in arrMhqRoles!',checkAdd,(arrMhqRoles.indexOf( checkAdd ) === -1?' NOT':''));
      if ( arrMhqRoles.indexOf( checkAdd ) === -1 ) {
        var createThis = { name: checkAdd, color: '#8bc34a', permissions: 0, mentionable: true, reason: 'Syncing with Munzee website.' };
        // console.log( 'Removing arrAddRoleNames[ %i ] and processing createRole( %o )', ndx, createThis );
        arrAddRoleNames = arrAddRoleNames.splice( ndx + 1 );
        var createMHQ = await createRole( member.guild, createThis, member );
        if ( createMHQ.success ) {
          // console.log( 'Successful createRole( %o )', createThis );
        }
        else { console.error( 'Failed to createRole( %o ) and add member to it: %o', createThis, createMHQ.error ); }
      }
      // else { console.log( 'Found %s in arrMhqRoles at pos: %i', checkAdd, arrMhqRoles.indexOf( checkAdd ) ); }
    } );
    // console.log( 'Member should NOT have: %o\nMember should have: %o', arrRemoveRoleNames, arrAddRoleNames );
    
    // Remove appropriate roles array
    var arrRemoveRoles = [];
    await arrRemoveRoleNames.forEach( async function ( title, idx ) {
      var objRole = await member.guild.roles.find( role => { if ( role.name === title ) { return role; } } );
      // console.log( 'Checking if %s has "%s"', strPlayerName, title );
      if ( ( objRole.members.keyArray() ).indexOf( member.id ) !== -1 ) {
        // console.log( '\t%s has role "%s", adding to arrRemoveRoles.', strPlayerName, title );
        arrRemoveRoles.push( objRole );
        // console.log( '\t-\tarrRoles now contains %i role%s to remove.', arrRemoveRoles.length, ( arrRemoveRoles.length === 1 ? '' : 's' ) );
      }
      // else { console.log( '\t%s didn\'t have role "%s"', strPlayerName, title ); }
    } );
    
    // Add appropriate roles array
    var arrAddRoles = [];
    await arrAddRoleNames.forEach( async function ( title, idx ) {
      // console.log( 'Attempting to get the objRole for %s', title );
      var objRole = await member.guild.roles.find( role => { if ( role.name === title ) { return role; } } );
      // console.log( 'Checking if %s is "%s"', strPlayerName, title );
      if ( ( objRole.members.keyArray() ).indexOf( member.id ) === -1 ) {
        // console.log( '\t%s doesn\'t have role "%s", adding to arrAddRoles.', strPlayerName, title );
        arrAddRoles.push( objRole );
        // console.log( '\t-\tarrRoles now contains %i role%s to add.', arrAddRoles.length, ( arrAddRoles.length === 1 ? '' : 's' ) );
      } else {
        // console.log( '\t%s already has role "%s"', strPlayerName, title );
      }
    } );
    
    // Actually remove the roles
    if ( arrRemoveRoles.length >= 1 ) {
      // console.log( 'Preparing to remove %i role%s', arrRemoveRoles.length, ( arrRemoveRoles.length === 1 ? '' : 's' ) );
      await member.removeRoles( arrRemoveRoles, 'Syncing roles with Munzee website.' )
        .then( () => {
          // console.log( 'Successfully removed %i role%s from %s', arrRemoveRoles.length, ( arrRemoveRoles.length === 1 ? '' : 's' ), strPlayerName );
        } ).catch( errRemoveRoles => {
          syncSucceeded = false;
          console.error( 'Encountered an error attempting to doAutoRole().removeRoles() for %s: %o', strPlayerName, errRemoveRoles );
        } );
    }
    
    // Actually add the roles
    if ( arrAddRoles.length >= 1 ) {
      // console.log( 'Preparing to add %i role%s', arrAddRoles.length, ( arrAddRoles.length === 1 ? '' : 's' ) );
      await member.addRoles( arrAddRoles, 'Syncing roles with Munzee website.' )
        .then( () => { console.log( 'Successfully added %i role%s to %s', arrAddRoles.length, ( arrAddRoles.length === 1 ? '' : 's' ), strPlayerName ); } )
        .catch( errAddRoles => {
          syncSucceeded = false;
          console.error( 'Encountered an error attempting to doAutoRole().addRoles() for %s: %o', strPlayerName, errAddRoles );
        } );
    }
  }
  
  if ( channel ) {
    var embedResult =  new Discord.RichEmbed()
      .setTitle( ( syncSucceeded ? ':white_check_mark: Sucessfully' : ':x: Failed to' ) + ' synchronize' + ( syncSucceeded ? 'd' : '' ) + ' player roles for ' + ( member.nickname || member.user.username ) + '**#**' + member.user.discriminator + ( strUserName !== undefined && strUserName != member.user.username ? ' (' + strUserName + ')' : '' ) + ':' )
      .setColor( syncSucceeded ? '00FF00' : 'FF0000' )
      .setThumbnail( member.user.avatarURL );
    if ( arrRemoveRoles.length >= 1 ) {
      embedResult.addField( ':ng: **REMOVED:**', arrRemoveRoles.join( ', ' ) );
    }
    if ( arrAddRoles.length >= 1 ) {
      embedResult.addField( ':new: **ADDED:**', arrAddRoles.join( ', ' ) );
    }
    if ( arrRemoveRoles.length <= 0 && arrAddRoles.length <= 0 ) {
      embedResult.setDescription( ':ok: **No ' + ( strUserName !== undefined && ( strUserName != member.nickname || strUserName != member.user.username ) ? 'role ' : '' ) + 'changes made!**' );
    }
    channel.send( 'Player role synchronization result embed for ' + member + ':', { embed: embedResult } );
  }
  return { success: syncSucceeded, name: strPlayerName };
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

client.on( 'ready', async () => {
  await checkRetireMyths();//Are retiremyths on the map?
  await client.user.setPresence( { status: settings[ bot ].status, afk: false, game: { name: settings[ bot ].game, type: 'PLAYING' } } );
//  await client.user.setStatus( settings[ bot ].status );
//  await client.user.setActivity( settings[ bot ].game );
  console.log( '\n%s:\t%s is now ready to accept commands.\n', strNow(), settings[ bot ].name )
  if ( isDebug ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is now ready to accept commands at ' + strNow() + '._' );
  }
} );

client.on( 'disconnect', async ( dc ) => {
  settings[ bot ].onError.dcInfo = 'I\'ve been disconnected at ' + strNow() + ' with: ' + dc;
  strTempDB = JSON.stringify( settings );
  await fs.writeFile( path.join( __dirname, '../' + fsSettings ), strTempDB, ( errWrite ) => {
    if ( errWrite ) {
      throw errWrite;
    }
    if ( isDebug ) {
     dcInfo = '_has disconnected at ' + strNow() + ' with:_ ' + dc;
    }
  } );
  console.error( 'I\'ve been disconnected at %s with: %o', strNow(), dc );
} );

client.on( 'reconnecting', ( rc ) => {
  if ( isDebug ) {
    if ( !dcInfo ) {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_has reconnected at ' + strNow() + ' and is ready to accept commands:_ ' + ( rc ? rc : '' ) );
    } else {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( dcInfo + '\n_and has reconnected at ' + strNow() + ' and is ready to accept commands:_ ' + ( rc ? rc : '' ) );
    }
  }
  console.log( 'Reconnected at %s\n%s is now ready to accept commands: %o', strNow(), settings[ bot ].name, rc );
} );

client.on( 'error', ( err ) => {
  var strErrTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  if ( isDebug ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( ':exclamation: _had an `error` at ' + strErrTime + ':_ `' + err + '`' );
  }
  console.error( '%s: ERROR: %o', strErrTime, err );
  
  if ( err.code === 'ETIMEDOUT' ) {
    console.error( '%o, failed to connect to the Internet on: %o', strNow(), err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
  } else if ( err.code ===  'ENOTFOUND' ) {
    console.error( '%o, failed to connect to Discord on: %o', strNow(), err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ] );
  } else {
    console.error( '%o: ERROR: %o', strNow(), err );
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

var objMidnightMHQ = later.parse.recur().on( '01:00:01' ).time();
later.date.localTime();
later.setInterval( async function() {
  for ( var warning in objWarnings ) {
    if ( objWarnings[ warning ].stage > 0 ) {
      objWarnings[ warning ].stage--;
    }
  }
  let strWarnings = JSON.stringify( objWarnings );
  fs.writeFile( fsWarnings, strWarnings, ( errWrite ) => {
    if ( errWrite ) {
      console.error( 'Failed to update ' + fsWarnings + ' with: `' + strWarnings + '`' );
    } else if ( isDebug ) {
      console.log( 'Updated ' + fsWarnings + ' with: `' + strWarnings + '`' );
    }
  } );
  var objFlatStrings = await checkFlats();
  if ( objFlatStrings.onMap !== '' ) {
    client.channels.get( '509540760819859469' ).send( objFlatStrings.onMap );
    client.channels.get( '569965410582003724' ).send( objFlatStrings.onMap );
  }
  if ( objFlatStrings.offMap !== '' ) {
    client.channels.get( '509540760819859469' ).send( objFlatStrings.offMap );
    client.channels.get( '569965410582003724' ).send( objFlatStrings.offMap );
  }
  client.channels.get( '509540760819859469' ).send( objFlatStrings.onNow === '' ? 'There are no flats on the map currently!' : objFlatStrings.onNow );
  client.channels.get( '569965410582003724' ).send( objFlatStrings.onNow === '' ? 'There are no flats on the map currently!' : objFlatStrings.onNow );
  await checkRetireMyths();
}, objMidnightMHQ );

/*client.setInterval( function() {// !rall
  timeNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  console.log( 'restart of all other bots at ' + timeNow );
  exec( 'pm2 restart "DDObot" "LOTRObot" "Lazy Bastard" "Signal" "Vladdy', { windowsHide: true }, ( error, stdout, stderr ) => {
    if ( error ) {// "Gunther" "ShoeBot"
      console.error( 'Error: %o', error );
      return;
    }
    console.log( 'Result: %o', stdout );
    console.log( 'stderr: %o', stderr );
  } );
}, 950400000 );// 950400000 == 11 hours*/

client.setInterval( async function() {// Once an hour... checkRetireMyths and intFlipCounter--
  await checkRetireMyths();
  if ( intFlipCounter > 0 ) { intFlipCounter--; console.log( 'intFlipCounter is now %i', intFlipCounter ); }
}, 86400000 );// 86400000 == 1 hour
/*client.setInterval( async function() {
  var channel = client.channels.get( '516713423338209281' );
  var guild = channel.guild;
  var mbdRR = new Discord.RichEmbed()
    .setTitle( 'Looking for Rover Reindeer 2018...' )
    .setDescription( 'Please wait...' );
  var msgRR = await channel.send( 'Looking for Rover Reindeer 2018...', { embed: mbdRR } );
  var objRR = await getRoverReindeer( msgRR, msgRR );
  var strCurrentLocRR = objRR.ownerName + '/' + objRR.deployNumber;
  if ( strRoverReindeerURL === strCurrentLocRR ) {
    msgRR.delete();
  }
  else {
    strRoverReindeerURL = strCurrentLocRR;
    var munzeeMember = guild.members.map( user => { if ( user.nickname !== null ) { if ( user.nickname.toLowerCase() === objRR.ownerName.toLowerCase() ) { return user.id } } else if ( user.user.username !== null ) { if ( user.user.username.toLowerCase() === objRR.ownerName.toLowerCase() ) { return user.id } } } ).filter( function( user ) { if ( user ) { return user; } } );
    mbdRR
      .setTitle( objRR.name )
      .setURL( 'https://www.munzee.com/m/' + objRR.ownerName + '/' + objRR.deployNumber + '/' )
      .setThumbnail( objRR.avatar )
      .setDescription(
        '**' + ( objRR.isArchived ? 'Archived' : 'Deployed' ) + '**: ' + ( new Date( objRR.statusDate ) ).toLocaleDateString( 'en-US', objTimeStringHQ ) +
        '\n\n**By:** [' + objRR.ownerName + '](https://www.munzee.com/m/' + objRR.ownerName + '/)' + ( munzeeMember.length !== 0 ? ' (<@' + munzeeMember[ 0 ] + '>)' : '' ) +
        '\n**Hosting:** __Rover Reindeer 2018__' +
        '\n**Rover' + ( objRR.hasRover.length === 1 ? '' : 's' ) + ':** ' + ( objRR.hasRover.length === 0 ? '*none*' : objRR.hasRover.length ) +
        ( objRR.captures.length === 0 ? '' : '\n**Captures:** ' + objRR.captures.length )
      )
      .setImage( 'https://www.munzee.com/staticmap.php?center=' + objRR.mapLocation.lat + ',' + objRR.mapLocation.lng + '&zoom=7' );
    msgRR.edit( 'Rover Reindeer 2018: ' + ( objRR.error || '' ), { embed: mbdRR } ).catch( errEdit => { console.error( 'Error displaying final result of munzee lookup: ' + errEdit ); } );
    guild.channels.get( '507628696224661518' ).send( 'Rover Reindeer 2018: ' + ( objRR.error || '' ), { embed: mbdRR } );//#munzeediscord CLANS
//    guild.channels.get( '509540760819859469' ).send( 'Rover Reindeer 2018: ' + ( objRR.error || '' ), { embed: mbdRR } );//#announcements
  }
}, 900000 );*/// 900000 == 15 minutes

/*client.on( 'channelUpdate', async ( chanOld, chanNew ) => {
  if ( chanNew.parentID !== chanOld.parentID ) {
    var chanOldParent = ( !chanOld.parentID ? undefined : client.channels.get( chanOld.parentID ) );
    var chanOldParentType = ( !chanOldParent ? 'none' : chanOldParent.type );
    var chanOldParentBaseName = ( chanOldParent.name.match( /(.*?) \((\d+)\/\d+\)/ || undefined ) );
    var chanOldIsChecked = ( chanOldParentBaseName[ 2 ] ? true : false );
    chanOldParentBaseName = ( chanOldParentBaseName ? chanOldParentBaseName[ 1 ] : undefined );
    var intOldParentChildren = chanOldParent.children.array().length;
    if ( chanOldIsChecked && chanOldParent.name !== ( ( chanOldParentBaseName || 'none' ) + ' (' + intOldParentChildren + '/50)' ) ) {
      console.log( 'Updating: %o', [ chanOldParent.name, ( ( chanOldParentBaseName || 'none' ) + ' (' + intOldParentChildren + '/50)' ) ] );
      await chanOldParent
        .setName( ( chanOldParentBaseName || 'none' ) + ' (' + intOldParentChildren + '/50)', 'Updating count of channels in counted category.' )
        .catch( errSetName => { console.error( 'Failed to set the channel name for `%s` to `%s`: %o', chanOldParent.name, ( chanOldParentBaseName || 'none' ) + ' (' + intOldParentChildren + '/50)', errSetName ); } );
    }
    
    var chanNewParent = ( !chanNew.parentID ? undefined : client.channels.get( chanNew.parentID ) );
    var chanNewParentType = ( !chanNewParent ? 'none' : chanNewParent.type );
    var chanNewParentBaseName = ( chanNewParent.name.match( /(.*?) \(\d+\/\d+\)/ || undefined ) );
    var chanNewIsChecked = ( chanNewParentBaseName[ 2 ] ? true : false );
    chanNewParentBaseName = ( chanNewParentBaseName ? chanNewParentBaseName[ 1 ] : undefined );
    var intNewParentChildren = chanNewParent.children.array().length;
    if ( chanNewIsChecked && chanNewParent.name !== ( ( chanNewParentBaseName || 'none' ) + ' (' + intNewParentChildren + '/50)' ) ){
      console.log( 'Updating: %o', [ chanNewParent.name, ( ( chanNewParentBaseName || 'none' ) + ' (' + intNewParentChildren + '/50)' ) ] );
      await chanNewParent
        .setName( ( chanNewParentBaseName || 'none' ) + ' (' + intNewParentChildren + '/50)', 'Updating count of channels in counted category.' )
        .catch( errSetName => { console.error( 'Failed to set the channel name for `%s` to `%s`: %o', chanNewParent.name, ( chanNewParentBaseName || 'none' ) + ' (' + intNewParentChildren + '/50)', errSetName ); } );
    }
  }
} );

client.on( 'channelCreate', async ( chanNew ) => {
  var chanNewParent = ( !chanNew.parentID ? undefined : client.channels.get( chanNew.parentID ) );
  var chanNewParentType = ( !chanNewParent ? 'none' : chanNewParent.type );
  var chanNewParentBaseName = ( chanNewParent.name.match( /(.*?) \(\d+\/\d+\)/ || undefined ) );
  var chanNewIsChecked = ( chanNewParentBaseName[ 2 ] ? true : false );
  chanNewParentBaseName = ( chanNewParentBaseName ? chanNewParentBaseName[ 1 ] : undefined );
  var intNewParentChildren = chanNewParent.children.array().length;
  if ( chanNewIsChecked && chanNewParent.name !== ( ( chanNewParentBaseName || 'none' ) + ' (' + intNewParentChildren + '/50)' ) ){
    // console.log( 'Updating: %o', [ chanNewParent.name, ( ( chanNewParentBaseName || 'none' ) + ' (' + intNewParentChildren + '/50)' ) ] );
    await chanNewParent
      .setName( ( chanNewParentBaseName || 'none' ) + ' (' + intNewParentChildren + '/50)', 'Updating count of channels in counted category.' )
      .catch( errSetName => { console.error( 'Failed to set the channel name for `%s` to `%s`: %o', chanNewParent.name, ( chanNewParentBaseName || 'none' ) + ' (' + intNewParentChildren + '/50)', errSetName ); } );
  }
} );

client.on( 'channelDelete', async ( chanOld ) => {
  var chanOldParent = ( !chanOld.parentID ? undefined : client.channels.get( chanOld.parentID ) );
  var chanOldParentType = ( !chanOldParent ? 'none' : chanOldParent.type );
  var chanOldParentBaseName = ( chanOldParent.name.match( /(.*?) \((\d+)\/\d+\)/ || undefined ) );
  var chanOldIsChecked = ( chanOldParentBaseName[ 2 ] ? true : false );
  chanOldParentBaseName = ( chanOldParentBaseName ? chanOldParentBaseName[ 1 ] : undefined );
  var intOldParentChildren = chanOldParent.children.array().length;
  if ( chanOldIsChecked && chanOldParent.name !== ( ( chanOldParentBaseName || 'none' ) + ' (' + intOldParentChildren + '/50)' ) ) {
    // console.log( 'Updating: %o', [ chanOldParent.name, ( ( chanOldParentBaseName || 'none' ) + ' (' + intOldParentChildren + '/50)' ) ] );
    await chanOldParent
      .setName( ( chanOldParentBaseName || 'none' ) + ' (' + intOldParentChildren + '/50)', 'Updating count of channels in counted category.' )
      .catch( errSetName => { console.error( 'Failed to set the channel name for `%s` to `%s`: %o', chanOldParent.name, ( chanOldParentBaseName || 'none' ) + ' (' + intOldParentChildren + '/50)', errSetName ); } );
  }
} );//*/

client.on( 'guildMemberAdd', async ( member ) => {
  var guildID = member.guild.id;
  var objUser = member.user;
  var strJoined = ( new Date( member.joinedTimestamp ) ).getHours();
  var guildWelcomeMesages = {
    '464434174661754900': {// Munzee
      channel: '464434174661754902',//#general
      role: '',
      showPlayer: false,
      message: 'Welcome to the **' + member.guild.name + '** Discord server, ' + objUser + '**#' + objUser.discriminator + '**, it\'s **' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '** MHQ time!'
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
      var strUserName = objUser.username;
      var strLowerUserName = strUserName.toLowerCase();
      var arrSpamNames = ( strLowerUserName.match( /(((discord|paypal)\.(gg|me))|(twitch\.tv)|((facebook|instagram|paypal|reddit|twitter|youtube)\.com?)|(bit.ly))\//i ) || [] );
      if ( arrSpamNames.length >= 1 ) {
        if ( member.guild.members.get( member.id ).bannable ) {
          var strSpamFrom = arrSpamNames[ 0 ].replace( /\//, '' ).replace( /\.(com|gg|me)/, '' );
          strSpamFrom = strSpamFrom.slice( 0, 1 ).toUpperCase() + strSpamFrom.slice( 1 );
          member.ban( { days: 7, reason: strSpamFrom + ' invite spam(bot)' } )
            .then( objBan => { console.log( '%s: Banned %s (%s) from %s (%s)', strNow(), objUser.tag, objUser.id, member.guild.name, guildID ); } )
            .catch( errBan => { console.error( '%s: Failed to ban %s (%s) from %s (%s): %o', strNow(), objUser.tag, objUser.id, member.guild.name, guildID, errBan ); } );
        } else {
          console.error( '%s: Unable to ban%s (%s) from %s (%s)', strNow(), objUser.tag, objUser.id, member.guild.name, guildID );
        }
      } else {
        var msgWelcome = await channel.send( guildWelcomeMesages[ guildID ].message );
        if ( guildWelcomeMesages[ guildID ].showPlayer ) {
          var embedResult = new Discord.RichEmbed()
            .setTitle( 'Setting up: ' + strUserName )
            .setURL( 'https://www.munzee.com/m/' + strUserName + '/' )
            .setDescription( 'Looking up information... please wait...' );
          msgWelcome.edit( guildWelcomeMesages[ guildID ].message, { embed: embedResult } );
          var objMunzeer = await getBasicPlayerData( msgWelcome, strUserName, msgWelcome );
          var objMunzeerAge = {
            years: Math.floor( objMunzeer.age / 365.25 ),
            months: Math.floor( ( objMunzeer.age - ( Math.floor( objMunzeer.age / 365.25 ) * 365.25 ) ) / 30.4375 ),
            days: Math.round( objMunzeer.age - ( Math.floor( objMunzeer.age / 365.25 ) * 365.25 ) - ( Math.floor( ( objMunzeer.age - ( Math.floor( objMunzeer.age / 365.25 ) * 365.25 ) ) / 30.4375 ) * 30.4375 ) )
          };
          var strMunzeerAge = ( objMunzeerAge.years > 0 ? objMunzeerAge.years + ' year' + ( objMunzeerAge.years === 1 ? '' : 's' ) + ( objMunzeerAge.months > 0 && objMunzeerAge.days > 0 ? ', ' : ( objMunzeerAge.months > 0 || objMunzeerAge.days > 0 ? ' and ' : '' ) ) : '' ) + ( objMunzeerAge.months > 0 ? objMunzeerAge.months + ' month' + ( objMunzeerAge.months === 1 ? '' : 's' ) + ( objMunzeerAge.years > 0 && objMunzeerAge.days > 0 ? ', and ' : ( objMunzeerAge.days > 0 ? ' and ' : '' ) ) : '' ) + ( objMunzeerAge.days > 0 ? objMunzeerAge.days + ' day' + ( objMunzeerAge.days === 1 ? '' : 's' ) : '' );
          
          //Post result
          embedResult
            .setTitle( '**Handle:** ' + objMunzeer.handle )
            .setThumbnail( objMunzeer.avatar )
            .setDescription(
    //          '\n**Handle:** ' + objMunzeer.handle +
              '\n**Age:** ' + strMunzeerAge +
              '\n**Points:** ' + objMunzeer.points.toLocaleString() +
              '\n**Level:** ' + objMunzeer.level +
              '\n**Premium:** ' + ( objMunzeer.isPremium ? ':star2:' : ':no_entry_sign: [Buy!](https://store.freezetag.com/products/munzee-premium-membership)' ) +
              ( objMunzeer.strTitles ? '\n**Titles:** ' + objMunzeer.strTitles : '' ) +
              ( objMunzeer.clan.name ? '\n**Clan Name:** ' + objMunzeer.clan.name : '' ) +
              '\n**Recent:** ' + objMunzeer.strActivityBar
            );
          msgWelcome.edit( guildWelcomeMesages[ guildID ].message, { embed: embedResult } ).catch( errEdit => { console.error( 'Error displaying final result of basic player lookup: ' + errEdit ); } );
        }
        if ( guildWelcomeMesages[ guildID ].role !== '' ) {
          member.addRole( guildWelcomeMesages[ guildID ].role, 'Give our newest member the starter role!' ).catch( console.error );
        }
      }
    }
  }
  client.user.setStatus( 'online' );
  isBotIdle = false;
} );

client.on( 'guildMemberRemove', async ( member ) => {
  var guildID = member.guild.id;
  var objUser = member.user;
  var guildGoodByeMesages = {
    '464434174661754900': {// Munzee
      channel: '464435153607983115',//#bot-logs
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
      channel = await getDefaultChannel( guildID );
      console.log( '%s: No welcome channel defined for [%s].  Attempting to use default channel of: %o', strNow(), member.guild.name, channel );// CONSOLE LOG
    }
    channel.send( guildGoodByeMesages[ guildID ].message );
  }
  client.user.setStatus( 'online' );
  isBotIdle = false;
} );

client.on( 'guildMemberUpdate', async ( mbrOld, mbrNew ) => {
  var munzeeDiscord = '464434174661754900';
  if ( mbrOld.guild ) {
    if ( mbrOld.guild.id === munzeeDiscord ) {
      var role = {
        Player: '464434652573335552',
        Premium: '485135749549654029',
        ClanAdmin: '484748206610186261',
        ClanMember: '464434384045342721'
      };
      if ( mbrOld._roles.indexOf( role.Player ) === -1 && mbrNew._roles.indexOf( role.Player ) !== -1 ) {
        // SEND THE MUNZEE DISCORD SOCIAL TO PEOPLE WHEN THEY JOIN THE MUNZEE DISCORD
        sendMunzeeDiscordSocial( mbrNew, ' on promotion to `@Player`' );
      }/*
      if ( ( mbrOld._roles.indexOf( role.Premium ) === -1 || mbrOld._roles.indexOf( role.ClanAdmin ) === -1 )
        && ( mbrNew._roles.indexOf( role.Premium ) !== -1 && mbrNew._roles.indexOf( role.ClanMember ) !== -1 ) ) {
          // IF you didn't have Premium OR Clan Admin AND you now have Premium AND Clan Member THEN add Clan Admin
        var member = await mbrNew.guild.members.get( mbrNew.id );
        member.addRole( role.ClanAdmin, 'Autogrant role for @Premium @Clan Member' );
      }
      if ( mbrNew._roles.indexOf( role.ClanAdmin ) !== -1 && mbrNew._roles.indexOf( role.ClanMember ) === -1 ) {
          // IF you have Clan Admin AND NOT Clan Member THEN ...
        var member = await mbrNew.guild.members.get( mbrNew.id );
        if ( mbrNew._roles.indexOf( role.Premium ) !== -1 ) {
          // ...IF you are Premium THEN add Clan Member
          member.addRole( role.ClanMember, 'Autogrant role for @Premium @Clan Admin' );
        } else {
          // ...ELSE remove Clan Admin
          member.removeRole( role.ClanAdmin, 'Autoclear role for non-@Premium or non-@Clan Member' );
        }
        
      }
      if ( ( mbrOld._roles.indexOf( role.Premium ) !== -1 && mbrOld._roles.indexOf( role.ClanAdmin ) !== -1 )
        && ( mbrNew._roles.indexOf( role.Premium ) === -1 || mbrNew._roles.indexOf( role.ClanMember ) === -1 ) ) {
          // IF you had Premium AND Clan Admin AND you now don't have Premium OR Clan Member THEN remove Clan Admin
        var member = await mbrNew.guild.members.get( mbrNew.id );
        member.removeRole( role.ClanAdmin, 'Autoclear role for non-@Premium or non-@Clan Member' );
      }//*/
    }
  }
} );

client.on( 'messageUpdate', ( msgOld, msgNew ) => {
  if ( msgOld.guild ) {
    if ( msgOld.type !== 'dm' && msgNew.content == msgOld.content && msgOld.guild.id === '464434174661754900' ) {
      if ( strLogChan[ msgNew.guild.id ] !== undefined ) {
        if ( strLogChan[ msgNew.guild.id ].logChan.canLog ) {
          var msgAuthor = msgOld.author;
          if ( client.user.id !== msgAuthor.id && !msgAuthor.bot ) {
            var objMsgUpdate = new Discord.RichEmbed()
              .setColor( '#F2D201' )
              .addField( 'Removed', ( msgOld.content.substr( 0, 1000 ) + ( msgOld.content.length > 1000 ? '...' : '' ) || '**`NULL`**' ) )
              .addField( 'Added', ( msgNew.content.substr( 0, 1000 ) + ( msgNew.content.length > 1000 ? '...' : '' ) || '**`NULL`**' ) );
            client.channels.get( strLogChan[ msgNew.guild.id ].logChan.id ).send( ':warning: **' + msgAuthor.username + '**#' + msgAuthor.discriminator + ' edited a message in <#' + msgOld.channel.id + '>:', { embed: objMsgUpdate } );
          }
        }
      } else {
        console.log( 'Unable to post messageUpdate event for `' + msgNew.guild.name + '` (ID:' + msgNew.guild.id + ') with no log channel defined.' );
      }
    }
  }
} );

client.on( 'messageDelete', ( msg ) => {
  if ( msg.guild.id === '464434174661754900' ) {
    if ( strLogChan[ msg.guild.id ] !== undefined ) {
      if ( strLogChan[ msg.guild.id ].logChan.canLog ) {
        var msgAuthor = msg.author;
        if ( client.user.id !== msgAuthor.id && !msgAuthor.bot ) {
          var objMsgDelete = new Discord.RichEmbed()
            .setColor( '#FF0000' )
            .setDescription( ( msg.content.substr( 0, 1000 ) + ( msg.content.length > 1000 ? '...' : '' ) || '**`NULL`**' ) );
          client.channels.get( strLogChan[ msg.guild.id ].logChan.id ).send( ':x: **' + msgAuthor.username + '**#' + msgAuthor.discriminator + ' message has been deleted from <#' + msg.channel.id + '>:', { embed: objMsgDelete } );
        }
      }
    } else {
      console.log( 'Unable to post messageDelete event for `' + msgNew.guild.name + '` (ID:' + msgNew.guild.id + ') with no log channel defined.' );
    }
  }
} );

client.on( 'message', async message => {// Trigger commands
  const isBot = message.author.bot;
  const isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
  const isBotMod = ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
  var isCrown = false, isAdmin = false, isSysop = false, isStaff = false, isMHQ = false, isThirdPartyDev = false;
  var canManage = false, canInvite = false;
  if ( message.guild ) {
    var guild = message.guild;
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
    var sysopRole = guild.roles.get( ROLE.Administrator );
    isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    var staffRole = guild.roles.get( ROLE.Staff );
    isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    var mhqRole = guild.roles.get( ROLE.MHQ );
    isMHQ = await ( mhqRole && ( mhqRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    var thirdPartyDevRole = guild.roles.get( ROLE.ThirdPartyDev );
    isThirdPartyDev = await ( thirdPartyDevRole && ( thirdPartyDevRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    if ( !isBot ) {
      var objAuthorPerms = ( await guild.fetchMember( message.author.id ).catch( errFetchMbr => { console.error( '%s: Unable to fetch member for %s (%s): %o', strNow(), message.author.tag, message.author.id, errFetchMbr ); } ) ).permissions;
      canManage = ( objAuthorPerms.has( 'MANAGE_GUILD' ) ? true : false );
      canInvite = ( objAuthorPerms.has( 'CREATE_INSTANT_INVITE' ) ? true : false );
    }
  }

  var command = message.content.replace( /  */g, ' ' ).split( ' ' );
  var arrArgs = [];
  if ( command[ 0 ].match( /<@!?(\d*)>/ ) ) {
    if ( command[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] === client.user.id && command.length > 1 ) {
      arrArgs = command.slice( 2 );
      command = command[ 1 ].toLowerCase();
    } else { command = false; }
  } else if ( command[ 0 ].indexOf( '!' ) === 0 ) {
    arrArgs = command.slice( 1 );
    command = command[ 0 ].toLowerCase();
  } else { arrArgs = command; command = false; }
  var strArgs = arrArgs.join( ' ' );
  
  if ( !command ) { /* Do nothing, it's not my command. */ }
  else if ( command.substr( 0, 1 ) === '!' ) { command = command.substr( 1 ).toLowerCase(); }
  
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
  
  if ( isDebug && command && message.channel.type !== 'dm' ) { console.log( 'Attempting to respond to command in %s#%s (%s#%s): %o: %o', message.guild.name, message.channel.name, message.guild.id, message.channel.id, command, arrArgs ); }
  
  /*if ( strArgs.replace( '`', '' ).match( /\b[MPT][O0]+[8B][sS$]?\b/g ) && message.author.id !== client.user.id && message.channel.id !== '494952957222191105' ) {
    command = 'acronymrage';
  }//*/
  
  if ( !allowFlip && message.author.id !== client.user.id ) {
    if ( intFlipCounter > 7 && ( ( strArgs.match( /(.*?)︵ ┻━┻/ ) || strArgs.match( /┻━┻(.*?)┻━┻/ ) ) && message.author.id !== client.user.id ) ) {
      var objNaughtyCorner = await message.guild.channels.get( '572504764361867264' );
      intFlipCounter++;
      if ( strArgs.match( /┻━┻(.*?)┻━┻/ ) && message.author.id !== client.user.id ) { intFlipCounter++; }
      console.warn( 'intFlipCounter is now %i', intFlipCounter );
      message.guild.members.get( message.author.id ).addRole( '572504914538921999', 'Take a break!  Tired of fixing your tables!!!' )
        .catch( errAddRole => { console.error( 'Unable to throw %s in the #naughty-corner: %o', message.author.username, errAddRole ); } );
      objNaughtyCorner.send( 'Welcome to the <#572504764361867264> ' + message.author + '!' );
      let intSecondsTen = ( intFlipCounter - 5 );
      setTimeout( function () { objNaughtyCorner.send( 'I hope you\'ll stop flipping tables now that you\'ve had ' +
      ( intSecondsTen * 10 ) + ' seconds to think about what you did!' ); }, ( intSecondsTen * 10000 ) );
      setTimeout( function () { message.guild.members.get( message.author.id )
        .removeRole( '572504914538921999', 'Tired of fixing their tables, I hope they learned their lesson.' )
        .catch( errAddRole => { console.error( 'Unable to throw %s in the #naughty-corner: %o', message.author.username, errAddRole ); } ); }, ( intSecondsTen * 10000 ) );
    } else if ( intFlipCounter > 4 && ( ( strArgs.match( /╯°□°）╯︵ ┻━┻/ ) || strArgs.match( /┻━┻(.*?)┻━┻/ ) ) && message.author.id !== client.user.id ) ) {
      intFlipCounter++;
      if ( strArgs.match( /┻━┻(.*?)┻━┻/ ) && message.author.id !== client.user.id ) { intFlipCounter++; }
      console.warn( 'intFlipCounter is now %i', intFlipCounter );
      message.channel.send( '_is **tired** of picking up all the tables!!!_ **Knock it off before I start throwing people in the <#572504764361867264>!!!**  ┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻' );
    } else if ( strArgs.match( /╯°□°）╯︵ ┻━┻/ ) && message.author.id !== client.user.id ) {
      intFlipCounter++;console.warn( 'intFlipCounter is now %i', intFlipCounter );
      message.channel.send( 'Put\'s the table that ' + message.author + ' flipped over back... ┬─┬ ノ( ゜-゜ノ)' );
    } else if ( strArgs.match( /┻━┻(.*?)┻━┻/ ) && message.author.id !== client.user.id ) {
      intFlipCounter += 2;console.warn( 'intFlipCounter is now %i', intFlipCounter );
      message.channel.send( 'Put\'s the tables that ' + message.author + ' flipped over back... ┬─┬ ノ( ゜-゜ノ) ┬─┬ ノ( ゜-゜ノ)' );
    }
  }
  
  var arrCZcmds = [ '>announce', '>creatures', '>grub', '>help', '>player', '>rot', '>say', '>valentine', '>valentines' ];
  if ( arrCZcmds.indexOf( ( arrArgs[ 0 ] || '' ).toLowerCase() ) !== -1 ) {
    var delCuppaZee = Math.round( message.client.ping );
    if ( message.attachments.size >= 1 ) {
      delCuppaZee += 2500;
    }
    message.delete( delCuppaZee );
  }
  
  switch ( command ) {
    case 'dv' : case 'dver' :
      if ( isOwner || isBotMod ) {
        message.reply( 'I\'m running Discord.js v'+ Discord.version + ' → <https://discord.js.org/#/docs/main/' + Discord.version + '/general/welcome>' );
        message.delete().catch( errDel => { console.error( '%o: Unable to delete !%s request by %s: %o', strNow(), command, message.author.tag, errDel ); } );
      }
      break;
    case 'ft':
    case 'ftlink':
      if ( message.guild.id === '464434174661754900' ) {
        message.delete();
        let czBotOwner = await client.users.get( '173496373520498688' );
        console.log('Sending %s a reminder to stop asking people to use `!' + command + '` in MD.',czBotOwner.username);
        czBotOwner.send( 'Please ask people to not use the `!' + command + '` command in the **Munzee Discord** again.  Thanks, `@Staff` has decided it\'s not appropriate.' );
        console.log('Sending %s a request to stop using `!' + command + '` in MD.',message.author.username);
        message.author.send( 'Please don\'t advertise the FreezeTag Discord server in the **Munzee Discord**.  `@Staff` has decided it\'s not appropriate.' );
      }
      break;
    case 'about' :
      if ( !isBot ) {
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
              ' since:\n\t' + ( new Date( ( new Date( ) ).valueOf() - message.client.uptime ) ).toLocaleDateString( 'en-US', objTimeString ),
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
            response.edit( '**Here is some information about me:**', { embed: aboutBot } ).catch( errEdit => {
              console.log( '%s: %o', strNow(), response );
              console.log( '%s: Attempting to edit an "!about" response failed with error: %o', strNow(), errEdit );
              message.channel.send( 'Editing last message failed, here\'s your result:', { embed: aboutBot } ).catch( console.error );
            } );
          } );
        } catch ( errTry ) {
          response.edit( '%s: Attempting to edit an "!about" response failed with error: %o', strNow(), errTry );
        }
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'antiflip' :
      if ( !isBot ) {
        message.delete();
        if ( arrArgs.length < 1 ) {
          message.channel.send( 'My antiflip is currently **' + ( allowFlip ? 'off' : 'on' ) + '** and the counter is at `' + intFlipCounter + '`.' );
        }
        else if ( isOwner || isBotMod || isCrown || isAdmin || isStaff ) {
          if ( !isNaN( parseInt( arrArgs[ 0 ] ) ) ) {
            intFlipCounter = parseInt( arrArgs[ 0 ] );
            console.log( 'intFlipCounter manually adjusted to %i by %s#%s', intFlipCounter, message.author.username, message.author.discriminator );
            message.channel.send( 'My antiflip is currently **' + ( allowFlip ? 'off' : 'on' ) + '** and the counter is at `' + intFlipCounter + '`.' );
          } else if ( arrArgs[ 0 ].toUpperCase() === 'RESET' ) {
            allowFlip = false;
            intFlipCounter = 0;
            console.log( 'intFlipCounter manually reset to %i by %s#%s', intFlipCounter, message.author.username, message.author.discriminator );
            message.channel.send( 'My antiflip is currently **' + ( allowFlip ? 'off' : 'on' ) + '** and the counter is at `' + intFlipCounter + '`.' );
          } else if ( toBoolean( arrArgs[ 0 ] ) ) {
            allowFlip = false;
            message.channel.send( '_now turned on antiflip._' );
          } else {
            allowFlip = true;
            message.channel.send( '_now turned off antiflip._' );
          }
        }
      }
      break;
/*    case 'acronymrage' :
      if ( !isBot && !isMHQ && !isStaff ) {
        var usr = ( objWarnings[ message.author.id ] === undefined ? { warnings: 0, stage: 0 } : objWarnings[ message.author.id ] );
        var arrNaughtyEmojis = [ ':frowning:', ':anguished:', ':angry:', ':rage:' ];
        var intNaughtyEmoji = ( usr.stage < arrNaughtyEmojis.length ? usr.stage : ( arrNaughtyEmojis.length - 1 ) );
        var naughtyEmoji = arrNaughtyEmojis[ intNaughtyEmoji ];
        
        var strMessage = naughtyEmoji + ' ' + message.author + ', ' + ( usr.stage <= 3 ? 'we don\'t' : '__**do not**__' ) + ' use `MOB`, `POB`, or `TOB` here.  Please use:\n';
        strMessage += '`MOB` :arrow_right: `MOS` (Munzee Owned Special)\n';
        strMessage += '`POB` :arrow_right: `PRB` (Player Rented Bouncer)\n';
        strMessage += '`TOB` :arrow_right: `SOB` (Staff Owned Bouncer)';
        usr.warnings++; usr.stage++; objWarnings[ message.author.id ] = usr;
        let strWarnings = JSON.stringify( objWarnings );
        fs.writeFile( fsWarnings, strWarnings, ( errWrite ) => {
          if ( errWrite ) {
            console.error( 'Failed to update ' + fsWarnings + ' with: `' + strWarnings + '`' );
          } else if ( isDebug ) {
            console.log( 'Updated ' + fsWarnings + ' with: `' + strWarnings + '`' );
          }
        } );
        
        if ( usr.stage > 7 ) {
          let intMsChanBan = ( usr.stage * 5000 );
          strMessage += '\n\n:octagonal_sign:\tWhy don\'t you take the next ' + ( intMsChanBan / 1000 ) + ' seconds to think about it?';
          message.channel.overwritePermissions(
            message.author,
            { SEND_MESSAGES: false, ADD_REACTIONS: false },
            'User was warned more than four times, so I am channel banning them for ' + ( intMsChanBan / 1000 ) + ' seconds.'
          ).then( ()=> { message.client.channels.get( strLogChan[ message.guild.id ].logChan.id ).send( message.author + ' was banned from speaking in <#' + message.channel.id + '> for ' + ( intMsChanBan / 1000 ) + ' seconds.' ) } ).catch( errOwPerm => {
            console.error( '%s: Error setting %d second OB temp channel ban: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), ( intMsChanBan / 1000 ), errOwPerm );
          } );
          setTimeout( () => {
            message.channel.permissionOverwrites.get( message.author.id )
              .delete( { reason: 'User completed timeout period and I cleared the ban.' } )
              .then( ()=> {
                message.client.channels.get( strLogChan[ message.guild.id ].logChan.id ).send( message.author + ' completed timeout period and ban in <#' + message.channel.id + '> cleared.' );
                message.channel.send( ':eight_spoked_asterisk:\t' + message.author + ', your ' + ( intMsChanBan / 1000 ) + ' second timeout is over now.  I hope you have learned from this experience.' );
              } )
              .catch( errOwPerm => {
                console.error( '%s: Error clearing %d second OB temp channel ban: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), ( intMsChanBan / 1000 ), errOwPerm );
                message.client.channels.get( '464435067297464330' ).send( '<@&464434512487514122>, HELP ME!  I am unable to clear the channel ban I may have created for ' + message.author.tag + '!  Please check the audit log!' );
              } );
          }, intMsChanBan );

          var noOBs = await message.channel.send( strMessage );
          
          noOBs.delete( 15000 );
        } else if ( usr.stage > 3 ) {
          var noOBs = await message.channel.send( strMessage );
          
          let intToDelete = ( ( usr.stage + 1 ) * 3000 );
          noOBs.delete( intToDelete );
        }
      }
      else if ( isMHQ ) {
        var usr = ( objWarnings[ message.author.id ] === undefined ? { warnings: 0, stage: 0 } : objWarnings[ message.author.id ] );
        var strMessage = ':cry: ' + message.author + ', the `MOB`, `POB`, and `TOB` make my owner and I sad, can you please consider changing the official acronyms to:\n';
        strMessage += '`MOB` :arrow_right: `MOS` (Munzee Owned Special)\n';
        strMessage += '`POB` :arrow_right: `PRB` (Player Rented Bouncer)\n';
        strMessage += '`TOB` :arrow_right: `SOB` (Staff Owned Bouncer)';
        var noOBs = await message.channel.send( strMessage );
        usr.warnings++; objWarnings[ message.author.id ] = usr;
        let strWarnings = JSON.stringify( objWarnings );
        fs.writeFile( fsWarnings, strWarnings, ( errWrite ) => {
          if ( errWrite ) {
            console.error( 'Failed to update ' + fsWarnings + ' with: `' + strWarnings + '`' );
          } else if ( isDebug ) {
            console.log( 'Updated ' + fsWarnings + ' with: `' + strWarnings + '`' );
          }
        } );
        noOBs.delete( 10000 );
      }
      else if ( isStaff ) {
        var usr = ( objWarnings[ message.author.id ] === undefined ? { warnings: 0, stage: 0 } : objWarnings[ message.author.id ] );
        var strMessage = ':rage: ' + message.author + ', **You\'re <@&464434512487514122>!!! __You know better!!!__** Use:\n';
        strMessage += '`MOB` :arrow_right: `MOS` (Munzee Owned Special)\n';
        strMessage += '`POB` :arrow_right: `PRB` (Player Rented Bouncer)\n';
        strMessage += '`TOB` :arrow_right: `SOB` (Staff Owned Bouncer)';
        
        var noOBs = await message.channel.send( strMessage );
        usr.warnings++; usr.stage++; objWarnings[ message.author.id ] = usr;
        let strWarnings = JSON.stringify( objWarnings );
        fs.writeFile( fsWarnings, strWarnings, ( errWrite ) => {
          if ( errWrite ) {
            console.error( 'Failed to update ' + fsWarnings + ' with: `' + strWarnings + '`' );
          } else if ( isDebug ) {
            console.log( 'Updated ' + fsWarnings + ' with: `' + strWarnings + '`' );
          }
        } );
        noOBs.delete( 7500 );
      }
      break;//*/
    case 'obreset' :
      message.delete();
      if ( isOwner && ( message.mentions.users.size >= 1 ) ) {
        var intReset = 0;
        var strResets = 'The following people have had their OB acronym warning stage reset:';
        message.mentions.users.forEach( mention => {
          let usr = ( objWarnings[ mention.id ] === undefined ? { warnings: 0, stage: 0 } : objWarnings[ mention.id ] );
          usr.stage = 0;
          objWarnings[ mention.id ] = usr;
          intReset++;
          strResets += '\n:arrow_right:\t<@' + mention.id + '>\t(' + usr.warnings + ' times)';
        } );
        
        let strWarnings = JSON.stringify( objWarnings );
        fs.writeFile( fsWarnings, strWarnings, ( errWrite ) => {
          if ( errWrite ) {
            console.error( 'Failed to update ' + fsWarnings + ' with: `' + strWarnings + '`' );
          } else if ( isDebug ) {
            console.log( 'Updated ' + fsWarnings + ' with: `' + strWarnings + '`' );
          }
        } );
        
        if ( intReset === 0 ) {
          strResets += '\n:asterisk:\t**No-one!**';
        }
        message.channel.send( strResets );
      }
      break;
    case 'warn' :
/*      if ( !arrArgs[ 1 ] && isOwner ) {
        message.delete().then( async delMsg => {
          var noMsgID = await message.reply( ' you seem to have forgotten to include a message worthy of a warning in your command.' );
          noMsgID.delete( 6000 );
        } );
      }
      else if ( arrArgs[ 1 ].toUpperCase() === 'LAST' && isOwner ) {
        let msgList = message.channel.messages.array();
//        thisMessage = msgList[ ( msgList.length - 2 ) ];
        message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
        isDeleted = true;
      }
      else*/ if ( isOwner ) {
//        thisMessage = arrArgs[ 1 ];
        message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
        isDeleted = true;
        message.delete();
        let warnee = await message.client.users.find( user => { if ( user.username === strUserName ) { return user; } } );
        let warnIsBot = warnee.bot;
        let warnIsMHQ = await ( mhqRole && ( mhqRole.members.keyArray() ).indexOf( warnee.id ) !== -1 ? true : false );
        let warnIsStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( warnee.id ) !== -1 ? true : false );
        if ( !warnIsBot && !warnIsMHQ && !warnIsStaff ) {
          var usr = ( objWarnings[ warnee.id ] === undefined ? { warnings: 0, stage: 0 } : objWarnings[ warnee.id ] );
          var arrNaughtyEmojis = [ ':frowning:', ':anguished:', ':angry:', ':rage:' ];
          var intNaughtyEmoji = ( usr.stage < arrNaughtyEmojis.length ? usr.stage : ( arrNaughtyEmojis.length - 1 ) );
          var naughtyEmoji = arrNaughtyEmojis[ intNaughtyEmoji ];
          
          var strMessage = naughtyEmoji + ' ' + warnee + ', ' + ( usr.stage <= 3 ? 'we don\'t' : '__**do not**__' ) + ' use `MOB`, `POB`, or `TOB` here.  Please use:\n';
          strMessage += '`MOB` :arrow_right: `MOS` (Munzee Owned Special)\n';
          strMessage += '`POB` :arrow_right: `PRB` (Player Rented Bouncer)\n';
          strMessage += '`TOB` :arrow_right: `SOB` (Staff Owned Bouncer)';
          usr.warnings++; usr.stage++; objWarnings[ warnee.id ] = usr;
          let strWarnings = JSON.stringify( objWarnings );
          fs.writeFile( fsWarnings, strWarnings, ( errWrite ) => {
            if ( errWrite ) {
              console.error( 'Failed to update ' + fsWarnings + ' with: `' + strWarnings + '`' );
            } else if ( isDebug ) {
              console.log( 'Updated ' + fsWarnings + ' with: `' + strWarnings + '`' );
            }
          } );
          
          if ( usr.stage > 5 ) {
            let intMsChanBan = ( usr.stage * 5000 );
            strMessage += '\n\n:octagonal_sign:\tWhy don\'t you take the next ' + ( intMsChanBan / 1000 ) + ' seconds to think about it?';
            message.channel.overwritePermissions(
              warnee,
              { SEND_MESSAGES: false, ADD_REACTIONS: false },
              'User was warned more than four times, so I am channel banning them for ' + ( intMsChanBan / 1000 ) + ' seconds.'
            ).then( ()=> { message.client.channels.get( strLogChan[ message.guild.id ].logChan.id ).send( warnee + ' was banned from speaking in <#' + message.channel.id + '> for ' + ( intMsChanBan / 1000 ) + ' seconds.' ) } ).catch( errOwPerm => {
              console.error( '%s: Error setting %d second OB temp channel ban: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), ( intMsChanBan / 1000 ), errOwPerm );
            } );
            setTimeout( () => {
              message.channel.permissionOverwrites.get( message.author.id )
                .delete( { reason: 'User completed timeout period and I cleared the ban.' } )
                .then( ()=> {
                  message.client.channels.get( strLogChan[ message.guild.id ].logChan.id ).send( message.author + ' completed timeout period and ban in <#' + message.channel.id + '> cleared.' );
                  message.channel.send( ':eight_spoked_asterisk:\t' + message.author + ', your ' + ( intMsChanBan / 1000 ) + ' second timeout is over now.  I hope you have learned from this experience.' );
                } )
                .catch( errOwPerm => {
                  console.error( '%s: Error clearing %d second OB temp channel ban: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), ( intMsChanBan / 1000 ), errOwPerm );
                  message.client.channels.get( '464435067297464330' ).send( '<@&464434512487514122>, HELP ME!  I am unable to clear the channel ban I may have created for ' + message.author.tag + '!  Please check the audit log!' );
                } );
            }, intMsChanBan );
          }
          
          var noOBs = await message.channel.send( strMessage );
          
          let intToDelete = ( usr.stage < 4 ? ( ( usr.stage + 1 ) * 3000 ) : 15000 );
          noOBs.delete( intToDelete );
        }
        else if ( warnIsMHQ ) {
          var usr = ( objWarnings[ warnee.id ] === undefined ? { warnings: 0, stage: 0 } : objWarnings[ warnee.id ] );
          var strMessage = ':cry: ' + warnee + ', the `MOB`, `POB`, and `TOB` make my owner and I sad, can you please consider changing the official acronyms to:\n';
          strMessage += '`MOB` :arrow_right: `MOS` (Munzee Owned Special)\n';
          strMessage += '`POB` :arrow_right: `PRB` (Player Rented Bouncer)\n';
          strMessage += '`TOB` :arrow_right: `SOB` (Staff Owned Bouncer)';
          var noOBs = await message.channel.send( strMessage );
          usr.warnings++; objWarnings[ warnee.id ] = usr;
          let strWarnings = JSON.stringify( objWarnings );
          fs.writeFile( fsWarnings, strWarnings, ( errWrite ) => {
            if ( errWrite ) {
              console.error( 'Failed to update ' + fsWarnings + ' with: `' + strWarnings + '`' );
            } else if ( isDebug ) {
              console.log( 'Updated ' + fsWarnings + ' with: `' + strWarnings + '`' );
            }
          } );
          noOBs.delete( 10000 );
        }
        else if ( warnIsStaff ) {
          var usr = ( objWarnings[ warnee.id ] === undefined ? { warnings: 0, stage: 0 } : objWarnings[ warnee.id ] );
          var strMessage = ':rage: ' + warnee + ', **You\'re <@&464434512487514122>!!! __You know better!!!__** Use:\n';
          strMessage += '`MOB` :arrow_right: `MOS` (Munzee Owned Special)\n';
          strMessage += '`POB` :arrow_right: `PRB` (Player Rented Bouncer)\n';
          strMessage += '`TOB` :arrow_right: `SOB` (Staff Owned Bouncer)';
          
          var noOBs = await message.channel.send( strMessage );
          usr.warnings++; usr.stage++; objWarnings[ warnee.id ] = usr;
          let strWarnings = JSON.stringify( objWarnings );
          fs.writeFile( fsWarnings, strWarnings, ( errWrite ) => {
            if ( errWrite ) {
              console.error( 'Failed to update ' + fsWarnings + ' with: `' + strWarnings + '`' );
            } else if ( isDebug ) {
              console.log( 'Updated ' + fsWarnings + ' with: `' + strWarnings + '`' );
            }
          } );
          noOBs.delete( 7500 );
        }
      }
      break;
    case 'warnings' :
      message.delete();
      if ( isOwner ) {
        var intWarned = 0;
        var strWarnings = 'The following people have been warned about using OB acronyms:';
        for ( var warned in objWarnings ) {
          if ( objWarnings[ warned ].warnings > 0 ) {
            intWarned++;
            strWarnings += '\n:arrow_right:\t<@' + warned + '>\t(' + objWarnings[ warned ].stage + '/' + objWarnings[ warned ].warnings + ')';
          }
        }
        if ( intWarned === 0 ) {
          strWarnings += '\n:asterisk:\t**Currently none!**';
        }
        message.channel.send( strWarnings );
      }
      break;
    case 'add' :
//format: !add (event https://calendar.munzee.com/EventName|garden name Θ URL to garden sheet on Google)
      if ( isOwner && !isBot && arrArgs.length > 0  ) {
console.log( '%s: Arguments\n\tString: %s\n\tArray: [ \'%s\' ]',strNow(),strArgs,arrArgs.join( '\', \'' ) );//TRON
        var strEventArgs = arrArgs.slice( 1 ).join( ' ' );
        switch ( arrArgs[ 0 ].toLowerCase() ) {
          case 'clan' :
            if ( arrArgs[ 1 ] !== undefined ) {
              if ( message.guild ) {
                if ( message.guild.members.get( arrArgs[ 1 ].replace( /<@!?/, '' ).replace( />/, '' ) ) !== undefined ) {
                  let strID = arrArgs[ 1 ].replace( /<@!?/, '' ).replace( />/, '' );
                  objUser = message.guild.members.get( strID );
                  strUserName = ( objUser.nickname || objUser.user.username );
                } else {
                  strUserName = arrArgs.slice( 1 ).join( ' ' );
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
            message.delete( 5000 );
            var clanData = await getClanData( strUserName );
            if ( clanData.error === 404 ) {
              message.author.send( 'I\'m sorry, I\'m unable to create your Munzee clan chat channel as I\'m unable to find ' + ( clanData.errorType === 'no clan' ? 'any clan' : 'the `' + clanData.errorName + '`' ) + ' page for you' + ( clanData.errorType === 'player' ? '.  Please make sure that your username/nickname in the **' + message.guild.name + '** Discord server matches your player name in game.' : ( clanData.errorType === 'no clan' ? '.' : 'r clan.' ) ) );
            }
            else {
              var clanGoal = ( parseInt( arrArgs[ 1 ] ) || '-1' );
              
              console.log( 'Clan Data: %o', clanData );
            }
          case 'event' :
            var objEvent = await getEventData( arrArgs[ 1 ] );
            console.log( '%s: add event: %o', strNow(), objEvent );
/*              var msgEventEmbed = new Discord.RichEmbed()
                .setTitle( strEventName )
                .setURL( strEventURL )
                .setTimestamp()
                .setFooter( '==>' );
              var msgEvent = await message.channel.send( { embed: msgEventEmbed } );
            }
            else {
              var msgMissingParams = await message.reply( 'you seem to be missing parameters for your event, please try again.' );
              msgMissingParams.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting msgMissingParams: %o', strNow(), errDel ); } );
            }//*/
            break;
          case 'garden' :
              var msgUnderConstruction = await message.reply( 'this portion of the command is currently under construction, please be patient and try again at a later date.' );
              msgMissingParams.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting msgUnderConstruction: %o', strNow(), errDel ); } );
            break;
          default :
            var msgMissingParams = await message.reply( 'I don\'t know how to add `' + arrArgs[ 0 ] + '`, please try again.' );
            msgMissingParams.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting msgMissingParams: %o', strNow(), errDel ); } );
        }
      }
      else {
        var msgMissingParams = await message.reply( 'you forgot to indicate what you wanted to add.  Please try again.' );
        msgMissingParams.delete( 5000 ).catch( errDel => { console.error( '%s: Error deleting msgMissingParams: %o', strNow(), errDel ); } );
      }
      break;
    case 'announce' :
      if ( isOwner ) {
        message.client.guilds.forEach( async function( guild ){
          var defaultChannel = await message.client.guilds.get( guild.id ).defaultChannel( guild.id );
          defaultChannel.send( arrArgs.slice( 1 ).join( ' ' ) );// FIX defaultChannel CHANGES!!!!!!!
        } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'badgezee' :
      if ( isOwner ) {
        var arrPlayers = [];
        message.guild.members.array().forEach( member => {
          if( member.roles.find( role => { if ( role.name === 'Player' ) { return role; } } ) ){
            arrPlayers.push( member.nickname || member.user.username );
          }
        } );
        arrPlayers.filter( function ( value, index, self ) { return self.indexOf( value.username ) === index.username; } );
        arrPlayers.sort( function( a, b ) { return a.toLowerCase().localeCompare( b.toLowerCase() ); } );
        var strPlayers = '\'';
        for ( var intI = 0; intI < arrPlayers.length; intI++ ) {
          if ( intI > 1 && intI < ( arrPlayers.length - 1 ) && ( ( intI + 1 ) % 5 ) === 0 ) {
            strPlayers += arrPlayers[ intI ] + '\',\n\t\t\t\'';
          } else if ( intI === ( arrPlayers.length - 1 ) ) {
            strPlayers += arrPlayers[ intI ];
          } else {
            strPlayers += arrPlayers[ intI ] + '\', \'';
          }
        }
        strPlayers += '\'';
        if ( strPlayers.length <= 2000 ) {
          message.channel.send( strPlayers );
        }
        else {
          message.channel.send( 'String length too long at ' + strPlayers.length.toLocaleString() + ' of 2,000 maximum characters, please check the console.'  );
          console.info( strPlayers );
        }
      }
      break;
    case 'clean' :
    case 'clear' :
      if ( ( isOwner || isBotMod || isCrown || isAdmin ) && !isBot ) {
        var intMessagesToDelete = ( arrArgs.length === 0 ? 1 : parseInt( arrArgs[ 0 ] ) );
        message.channel.fetchMessages( {
          limit: 100
        } ).then( messages => {
          let arrMessages = messages.array();
          arrMessages = arrMessages.filter( thisMessage => thisMessage.author.id === client.user.id );
          arrMessages.length = intMessagesToDelete;
          arrMessages.map( thisMessage => thisMessage.delete( { reason: '!' + command + 'ed ' + ( arrArgs[ 0 ] !== undefined ? arrArgs[ 0 ] : '1' ) + ' message' + ( arrArgs[ 0 ] == 1 ? '' : 's' ) + '.' } ).catch( errDel => { console.error( 'Unable to delete ' + ( arrArgs[ 0 ] !== undefined ? arrArgs[ 0 ] : '1' ) + ' message' + ( arrArgs[ 0 ] == 1 ? '' : 's' ) + ' in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errDel ); } ) );
        } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      else {
        message.react( '%E2%9D%8C' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
        message.author.send( 'I\'m sorry, ' + message.author.tag + ', but you can\'t delete my messages in the `' + message.guild.name + '` server.' )
          .then( dm => {
            message.react( '%E2%9C%85' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          } ).catch( e => {
            message.react( '%E2%9D%8C' ).then( r => {
              message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
            } ).catch( e => {
              message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^ @here' );
              console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e );
            } );
            console.log( 'Unable to reply via DM to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e );
          } );
      }
      break;
    case 'config' :
      if ( ( isOwner || isBotMod ) && arrArgs.length > 0 && !isBot ) {
        switch ( arrArgs[ 0 ].toLowerCase() ) {
          case 'debug' :
            var debugParameter = ( arrArgs[ 1 ] ? arrArgs[ 1 ].trim().toLowerCase() : false );
            if ( debugParameter === 'state' ) {
              if ( isDebug ) {
               message.react( '1%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a "!debug state" request returning TRUE in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
              } else {
               message.react( '0%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a "!debug state" request returning FALSE in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
              }
            } else if ( isOwner ) {
              var msgToggle, boolUpdateDebugMode = true;
              var toggle = await toBoolean( debugParameter );
              var strToggle = await ( toggle || ( toggle && !isDebug ) ? 'on' : 'off' );
              msgToggle = await client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is attempting to turn ' + strToggle + ' debug mode for_ ' + message.author );
              if ( ( isDebug && toggle ) || ( !isDebug && !toggle ) ) {
                await msgToggle.edit( '_debug mode was already ' + strToggle + '_' );
                await msgToggle.react( '%F0%9F%A4%A6' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a request to change the debug state to what it already is in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
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
                fs.writeFile( path.join( __dirname, '../' + fsSettings ), strSettings, ( errWrite ) => {
                  if ( errWrite ) {
                    throw errWrite;
                  } else {
                     if ( isDebug ) {
                      msgToggle.edit( '_debug mode is now on_' );
                      msgToggle.react( '1%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to indicate debug mode is now on in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
                    } else {
                      msgToggle.edit( '_debug mode is now off_' );
                      msgToggle.react( '0%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to indicate debug mode is now off in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
                    }
                  }
                } );
              }
            }
            break;
          case 'flats' :
            if ( isOwner || isBotMod ) {
              switch ( arrArgs[ 1 ].toLowerCase() ) {
                case 'add' :
                  var strNewFlats;
                  var updateFailed = false;
                  var strFlatFilename = ( new Date() ).valueOf() + '.json';
                  if ( message.attachments.size >= 1 ) {
                    var msgTextFile = Array.from( message.attachments )[ 0 ][ 1 ];
                    await unirest.get( msgTextFile.url ).headers( { 'Accept': 'text/plain', 'Content-Type': 'text/plain' } ).end( async function ( file ) {
                      if ( file.error ) {
                        console.error( '%s: Failed to get %s:\n%o', strNow(), msgTextFile.url, file.error );
                        updateFailed = true;
                      } else {
                        strNewFlats = file.body;
                        fs.writeFileSync( strNewFlatFilePath + strFlatFilename, strNewFlats, ( errWrite ) => {
                          if ( errWrite ) {
                            updateFailed = true;
                            console.error( '%s: Failed to read "%s" in \'!config flats add\' (with attachment): %o', strNow(), strNewFlatFilePath + strFlatFilename, errWrite );
                            message.reply( 'failed to save ' + strNewFlatFilePath + strFlatFilename + ' flat schedule:\n' + errWrite + '\nRaw Data:\n\n`' + strNewFlats + '`' );
                          } else {
                            console.log( '%s: %s uploaded %s: %o', strNow(), message.author.tag, strNewFlatFilePath + strFlatFilename, strNewFlats );
                          }
                        } );
                        fs.writeFileSync( jsonLatest, strNewFlats, ( errWrite ) => {
                          if ( errWrite ) {
                            updateFailed = true;
                            console.error( '%s: Failed to read "%s" in \'!config flats add\' (with attachment): %o', strNow(), jsonLatest, errWrite );
                            message.reply( 'failed to save the latest.json flat schedule:\n' + errWrite + '\nRaw Data:\n\n`' + strNewFlats + '`' );
                          } else {
                            console.log( '%s: %s uploaded %s: %o', strNow(), message.author.tag, jsonLatest, strNewFlats );
                          }
                        } );
                      }
                      if ( updateFailed ) {
                        message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Failed to react to failed `!config flats add` request.', strNow(), errReact ); } );
                      } else {
                        message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Failed to react to successful `!config flats add` request.', strNow(), errReact ); } );
                      }
                      var flatsAdded = await message.reply( 'the update to my flat schedule was successfully added. :white_check_mark:' );
                      flatsAdded.delete( 30000 ).catch( errDel => { console.error( '%s: Failed to delete `!config flats build` confirmation from \'%s#%s\': %o', strNow(), message.channel.name, guild.name, errDel ); } );
                    } );
                  } else {
                    var strBody = arrArgs.slice( 1 ).join( ' ' );
                    var intFirstTick = ( ( strBody.indexOf( '`' ) + 1 ) || 0 );
                    var intLastTick = ( strBody.lastIndexOf( '`' ) || strBody.length );
                    var strNewFlats = strBody.substring( intFirstTick, intLastTick );
                    if ( strNewFlats.indexOf( '{' ) !== 0 && strNewFlats.lastIndexOf( '}' ) !== ( strNewFlats.length + 1 ) ) { strNewFlats = '{' + strNewFlats +'}' };
                    fs.writeFileSync( strNewFlatFilePath + strFlatFilename, strNewFlats, ( errWrite ) => {
                      if ( errWrite ) {
                        updateFailed = true;
                        console.error( '%s: Failed to read "%s" in \'!config flats add `{}`\': %o', strNow(), strNewFlatFilePath + strFlatFilename, errWrite );
                        message.reply( 'failed to save ' + strNewFlatFilePath + strFlatFilename + ' flat schedule:\n' + errWrite + '\nRaw Data:\n\n`' + strNewFlats + '`' );
                      } else {
                        console.log( '%s: %s uploaded %s: %o', strNow(), message.author.tag, strNewFlatFilePath + strFlatFilename, strNewFlats );
                      }
                    } );
                    fs.writeFileSync( jsonLatest, strNewFlats, ( errWrite ) => {
                      if ( errWrite ) {
                        updateFailed = true;
                        console.error( '%s: Failed to read "%s" in \'!config flats add `{}`\'`: %o', strNow(), jsonLatest, errWrite );
                        message.reply( 'failed to save the latest.json flat schedule:\n' + errWrite + '\nRaw Data:\n\n`' + strNewFlats + '`' );
                      } else {
                        console.log( '%s: %s uploaded %s: %o', strNow(), message.author.tag, jsonLatest, strNewFlats );
                      }
                    } );
                    if ( updateFailed ) {
                      message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Failed to react to failed `!config flats add` request.', strNow(), errReact ); } );
                    } else {
                      message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Failed to react to successful `!config flats add` request.', strNow(), errReact ); } );
                    }
                    var flatsAdded = await message.reply( 'the update to my flat schedule was successfully added. :white_check_mark:' );
                    flatsAdded.delete( 30000 ).catch( errDel => { console.error( '%s: Failed to delete `!config flats add` confirmation from \'%s#%s\': %o', strNow(), message.channel.name, guild.name, errDel ); } );
                  }              
                  break;
                case 'build' :
                  var updateFailed = false;
                  arrArgs = arrArgs.slice( 2 );
                  var strFlatFilename = ( new Date() ).valueOf() + '.json';
                  var dateToBuild = arrArgs[ 0 ]; arrArgs = arrArgs.slice( 1 );
                  var objNewFlats = {};
                  objNewFlats[ dateToBuild ] = {
                    'rob': ( arrArgs.indexOf( 'rob' ) !== -1 ? true : false ),
                    'lou': ( arrArgs.indexOf( 'lou' ) !== -1 ? true : false ),
                    'matt': ( arrArgs.indexOf( 'matt' ) !== -1 ? true : false ),
                    'hammock': ( arrArgs.indexOf( 'hammock' ) !== -1 ? true : false ),
                    'qrewzee': ( arrArgs.indexOf( 'qrewzee' ) !== -1 ? true : false )
                  };
                  var strNewFlats = JSON.stringify( objNewFlats );
                  fs.writeFileSync( strNewFlatFilePath + strFlatFilename, strNewFlats, ( errWrite ) => {
                    if ( errWrite ) {
                      updateFailed = true;
                      console.error( '%s: Failed to write "%s" in \'!config flats build ...\': %o', strNow(), strNewFlatFilePath + strFlatFilename, errWrite );
                      message.reply( 'failed to save ' + strNewFlatFilePath + strFlatFilename + ' flat schedule:\n' + errWrite + '\nRaw Data:\n\n`' + strNewFlats + '`' );
                    }
                  } );
                  if ( !updateFailed ) {
                    console.log( '%s: %s uploaded %s:\n%o', strNow(), message.author.tag, strNewFlatFilePath + strFlatFilename, strNewFlats );
                  }
                  fs.writeFileSync( jsonLatest, strNewFlats, ( errWrite ) => {
                    if ( errWrite ) {
                      updateFailed = true;
                      console.error( '%s: Failed to write "%s" in \'!config flats build ...\': %o', strNow(), jsonLatest, errWrite );
                      message.reply( 'failed to save the latest.json flat schedule:\n' + errWrite + '\nRaw Data:\n\n`' + strNewFlats + '`' );
                    }
                  } );
                  if ( !updateFailed ) {
                    console.log( '%s: %s uploaded %s:\n%o', strNow(), message.author.tag, jsonLatest, strNewFlats );
                  }
                  if ( updateFailed ) {
                    message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Failed to react to failed `!config flats build ...` request.', strNow(), errReact ); } );
                  } else {
                    message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Failed to react to successful `!config flats build ...` request.', strNow(), errReact ); } );
                  }
                  message.delete( 5000 ).catch( errDel => { console.error( '%s: Failed to delete `!config flats confirm` request from \'%s#%s\': %o', strNow(), message.channel.name, guild.name, errDel ); } );
                  var flatsBuilt = await message.reply( 'the update to my flat schedule was successfully built. :white_check_mark:' );
                  flatsBuilt.delete( 30000 ).catch( errDel => { console.error( '%s: Failed to delete `!config flats build` confirmation from \'%s#%s\': %o', strNow(), message.channel.name, guild.name, errDel ); } );
                  break;
                case 'confirm' :
                  var updateFailed = false;
                  await fs.readFile( jsonLatest, 'utf8', async ( errRead, fileData ) => {
                    if ( errRead ) { updateFailed = true; console.error( '%s: Failed to read "%s" in \'!config flats confirm\': %o', strNow(), jsonLatest, errRead ); }
                    try {
                      objNewFlats = JSON.parse( fileData );
                      console.log( '%s: %s is updating the flat schedule with the following changes:', strNow(), message.author.tag );
                      for ( let [ strDate, objDateFlats ] of Object.entries( objNewFlats ) ) {
                        let strDoing = 'Updating';
                        if ( !objFlatSchedule[ strDate ] ) { strDoing = 'Adding to'; }
                        console.log( '%s: %s %s objFlatSchedule: %o', strNow(), strDoing, strDate, objDateFlats );
                        objFlatSchedule[ strDate ] = objDateFlats;
                      }
                      var strFlatSchedule = JSON.stringify( objFlatSchedule );
                      fs.writeFile( strFlatSchedulePath, strFlatSchedule, ( errWrite ) => {
                        if ( errWrite ) { updateFailed = true; }
                      } );
                    } catch ( errParse ) {
                      updateFailed = true;
                      console.error( '%s: Failed to update objFlatSchedule from %s in \'!config flats confirm\': %o', strNow(), jsonLatest, errParse );
                      message.reply( 'failed to confirm the update to the flat schedule:\n' + errParse + '\n\nRaw Data:\n`' + fileData + '`' );
                    }
                    if ( updateFailed ) {
                      message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Failed to react to failed `!config flats confirm` request.', strNow(), errReact ); } );
                    } else {
                      message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Failed to react to successful `!config flats confirm` request.', strNow(), errReact ); } );
                    }
                    message.delete( 5000 ).catch( errDel => { console.error( '%s: Failed to delete `!config flats confirm` request from \'%s#%s\': %o', strNow(), message.channel.name, guild.name, errDel ); } );
                    var flatsConfirmed = await message.reply( 'the update to my flat schedule was successfully confirmed. :white_check_mark:' );
                    flatsConfirmed.delete( 30000 ).catch( errDel => { console.error( '%s: Failed to delete `!config flats reload` confirmation from \'%s#%s\': %o', strNow(), message.channel.name, guild.name, errDel ); } );
                  } );
                  break;
                case 'reload' :
                default :
                  console.log( '%s: Reloading objFlatSchedule: %o', strNow(), objFlatSchedule );
                  fs.readFile( strFlatSchedulePath, 'utf8', ( errRead, fileData ) => {
                    if ( errRead ) {
                      message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Failed to react to failed `!config flats confirm` request.', strNow(), errReact ); } );
                    } else {
                      objFlatSchedule = JSON.parse( fileData );
                      console.log( '%s: Reloaded objFlatSchedule: %o', strNow(), objFlatSchedule );
                      message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Failed to react to successful `!config flats confirm` request.', strNow(), errReact ); } );
                    }
                  } );
                  message.delete( 5000 ).catch( errDel => { console.error( '%s: Failed to delete `!config flats reload` request from \'%s#%s\': %o', strNow(), message.channel.name, guild.name, errDel ); } );
                  var flatsReloaded = await message.reply( 'my flat schedule was successfully reloaded. :white_check_mark:' );
                  flatsReloaded.delete( 30000 ).catch( errDel => { console.error( '%s: Failed to delete `!config flats reload` confirmation from \'%s#%s\': %o', strNow(), message.channel.name, guild.name, errDel ); } );
              }
            }
            break;
          case 'game' :
            if ( isOwner ) { client.user.setPresence( { activity: { name: strArgs } } ); }
            break;
          case 'greenie' :
            var gParameter = ( arrArgs[ 1 ] ? arrArgs[ 1 ].trim().toLowerCase() : false );
            if ( gParameter === 'state' ) {
              if ( allowGreenie ) {
               message.react( '1%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a "!config greenie state" request returning TRUE in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
              } else {
               message.react( '0%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a "!config greenie state" request returning FALSE in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
              }
            } else if ( isOwner ) {
              var toggle = await toBoolean( gParameter );
              var strToggle = ( toggle || ( toggle && !allowGreenie ) ? 'on' : 'off' );console.log('%o to turn %s', toggle, strToggle);
              var msgToggle = await client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is attempting to turn ' + strToggle + ' allowGreenie for_ ' + message.author );
              if ( ( allowGreenie && toggle ) || ( !allowGreenie && !toggle ) ) {
                await msgToggle.edit( '_allowGreenie was already ' + strToggle + '_' );
                await msgToggle.react( '%F0%9F%A4%A6' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a request to change the config greenie state to what it already is in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
              } else {
                if ( toggle ) {
                  allowGreenie = true;
                } else if ( !toggle ) {
                  allowGreenie = false;
                } else {
                  allowGreenie = !allowGreenie;
                }
                message.react( allowGreenie ? '1%E2%83%A3' : '0%E2%83%A3' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error attempting to react to a "!config greenie' + ( allowGreenie ? ' on' : ' off' ) + '" request in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
              }
            }
            break;
          case 'host' :
            if ( isOwner ) { client.user.setPresence( { activity: { name: 'a host of ' + arrArgs[ 0 ], url: 'https://www.twitch.tv/' + arrArgs[ 0 ].toLowerCase() } } ); }
            break;
          case 'part' :
            if ( isOwner ) {
              /* message.client.part() */
            }
            break;
          case 'perms' : case 'permission' : case 'permissions' :// This needs to be redone.  Should send a message to all bot owners for starts
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
          case 'purge' :
            if ( isOwner ) {
              var intIndex = 1;
              var objUsers = {};
              Promise.all( [
                client.guilds.forEach( objGuild => {
                  if ( isDebug ) { message.channel.send( 'processing guild: ' + objGuild.name ); }
                  objGuild.members.every( async objUser => {
                    if ( isDebug ) {
                      message.channel.send( ':arrow_right: processing user: ' + objUser.username + '#' + objUser.discriminator );
                      console.log( '!config purge is processing: %o ', objUser.username );
                    }
                    return false;
    /*                if ( !objUsers[ objUser.id ] ) {///
                      objUsers[ objUser.id ] = await {
                        'id'            : objUser.id,
                        'username'      : objUser.username,
                        'discriminator' : objUser.discriminator,
                        'tag'           : objUser.username + '#' + objUser.discriminator,
                        'isBot'         : objUser.bot,
                        'avatars'       : [ objUser.avatar ],
                        'nicknames'     : {},
                        'profile' : {},
                        'points' : 0
                      };
                      objUsers[ objUser.id ].nicknames[ objGuild.id ] = ( objUser.nickname || null );
    /*                } else {
                      objUsers[ objUser.id ].username = objUser.username;
                      objUsers[ objUser.id ].tag = objUser.tag;
                      objUsers[ objUser.id ].isBot = objUser.bot;
                      if ( objUser.avatar !== objUsers[ objUser.id ].avatars[ objUsers[ objUser.id ].avatars.length ] ) {
                        objUsers[ objUser.id ].avatar.push( objUser.avatar );
                      }
                      objUsers[ objUser.id ].nicknames[ objGuild.id ] = ( objUser.nickname || null );
                    }//*/
                  } );
                } )
              ] ).then( doneBuildDB => { message.channel.send( 'DB purge complete!' );console.log( objUsers );
              } ).catch( errPurge => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ' error in `!config purge`: ' + errPurge ); } );
            }
            break;
          case 'restart' :
            if ( isOwner ) {
              Promise.all( [
                message.delete( { reason: 'Processing `!restart` command.' } ).then( async message => {
                  timeNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString ),
                  message.client.user.setPresence( { status: 'dnd', afk: true, game: { name: 'restarting...', type: 'WATCHING' } } ),
                  await message.channel.send( '_is' + ( isOwner ? ' ' : ' not ' ) + 'restarting as requested by ' + message.author + '._' ),
                  console.log( message.author.username + ' ordered a restart at ' + timeNow );
                } ).catch( errDel => { console.error( 'Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errDel ); } )
              ] ).then( () => {
                if ( isOwner ) {
                  process.exit( );
                }
              } );
              client.user.setStatus( 'online' );
              isBotIdle = false;
            }
            break;
          case 'status' :
            if ( isOwner ) { client.user.setPresence( { status: arrArgs[ 0 ] } ); }
            break;
          case 'stream' :
            if ( isOwner ) {  client.user.setPresence( { game: { name: client.user.presence.game.name, url: arrArgs[ 0 ] } } ); }
            break;
          case 'unhost' :
            if ( isOwner ) {
              if ( isDebug ) {
                console.log( message.author.tag + ' told me to unhost.' );
              }
              message.client.user.setPresence( settings[ bot ].game ).then( () => {
                message.react( '%E2%9C%85' ).then( MessageReaction => {
                  console.log( "I\'m no longer in host mode." );
                } ).catch( e => {
                  console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e );
                  message.reply( "I\'m no longer in host mode." );
                } );
              } );
            }
            break;
          default :
            message.channel.send( 'Sorry, you didn\'t mention something you can config.' );
        }
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'c2f': case 'f2c': case 'ft2m': case 'km2ft': case 'km2mi': case 'm2ft': case 'mi2ft': case 'mi2km':
    case 'convert' :
      switch ( command ) {
        case 'c2f':
          arrArgs.reverse().push( 'C2F' ); break;
        case 'f2c':
          arrArgs.reverse().push( 'F2C' ); break;
        case 'ft2m':
          arrArgs.reverse().push( 'FT2M' ); break;
        case 'km2ft':
          arrArgs.reverse().push( 'KM2FT' ); break;
        case 'km2mi':
          arrArgs.reverse().push( 'KM2MI' ); break;
        case 'm2ft':
          arrArgs.reverse().push( 'M2FT' ); break;
        case 'mi2ft':
          arrArgs.reverse().push( 'MI2FT' ); break;
        case 'mi2km':
          arrArgs.reverse().push( 'MI2KM' ); break;
        default:
          
      }
      if ( command !== 'convert' ) {
        arrArgs.reverse();
      }
      if ( arrArgs.length === 4 ) {
        const objConversionTypes = { CELCIUS: 'C', FEET: 'FT', FAHRENHEIT: 'F', KILOMETERS: 'KM', MILES: 'MI', METERS: 'M' };
        var strAsAcronym = '';
        var strFrstConv = arrArgs[ 0 ].toUpperCase();
        var strScndConv = arrArgs[ 2 ].toUpperCase();
        if ( arrArgs[ 1 ].toLowerCase() === 'to' ) {
          strAsAcronym = ( objConversionTypes[ strFrstConv ] || strFrstConv ) + '2' + ( objConversionTypes[ strScndConv ] || strScndConv );
        } else if ( arrArgs[ 1 ].toLowerCase() === 'from' ) {
          strAsAcronym = ( objConversionTypes[ strScndConv ] || strScndConv ) + '2' + ( objConversionTypes[ strFrstConv ] || strFrstConv );
        }
        arrArgs = Array.from( arrArgs.slice( 3 ) );
        arrArgs.push( strAsAcronym );
        arrArgs.reverse();
      }
      if ( arrArgs.length === 2 ) {
        var strConversionType = arrArgs[ 0 ].toUpperCase();
        switch ( strConversionType ) {
          case 'C2F' :
            var dblCelsius = parseFloat( arrArgs[ 1 ] );
            var dblFahrenheit = ( Math.round( ( ( dblCelsius * ( 9 / 5 ) ) + 32 ) * 10 ) / 10 );
            var strConverted = dblCelsius + '\u00B0C is equal to ' + dblFahrenheit + '\u00B0F.';
            break;
          case 'F2C' :
            var dblFahrenheit = parseFloat( arrArgs[ 1 ] );
            var dblCelsius = ( Math.round( ( ( dblFahrenheit - 32 ) / 9 * 5 ) * 10 ) / 10 );
            var strConverted = dblFahrenheit + '\u00B0F is equal to ' + dblCelsius + '\u00B0C.';
            break;
          case 'FT2M' :
            var dblFeet = parseFloat( arrArgs[ 1 ] );
            var dblMeters = ( Math.round( dblFeet / 3.2808399 * 100 ) / 100 );
            var strConverted = dblFeet + ' ' + ( Math.floor( dblFeet ) == 1 ? 'foot is' : 'feet are' ) + ' ≈ ' + dblMeters + ' meter' + ( Math.floor( dblMeters ) == 1 ? '' : 's' ) + '.';
            break;
          case 'FT2MI' :
            var dblFeet = parseFloat( arrArgs[ 1 ] );
            var dblMiles = ( Math.round( dblFeet / 5260 * 100 ) / 100 );
            var strConverted = dblFeet + ' ' + ( Math.floor( dblFeet ) == 1 ? 'foot is' : 'feet are' ) + ' ≈ ' + dblMiles + ' mile' + ( Math.floor( dblMiles ) == 1 ? '' : 's' ) + '.';
            break;
          case 'KM2FT' :
            var dblKiloMeters = parseFloat( arrArgs[ 1 ] );
            var dblFeet = ( Math.round( dblKiloMeters * 0.621371 * 5260 * 100 ) / 100 );
            var strConverted = dblKiloMeters + ' kilometer' + ( Math.floor( dblKiloMeters ) == 1 ? ' is' : 's are' ) + ' ≈ ' + dblFeet + ' ' + ( Math.floor( dblFeet ) == 1 ? 'foot' : 'feet' ) + '.';
            break;
          case 'KM2MI' :
            var dblKiloMeters = parseFloat( arrArgs[ 1 ] );
            var dblMiles = ( Math.round( dblKiloMeters * 0.621371 * 100 ) / 100 );
            var strConverted = dblKiloMeters + ' kilometer' + ( Math.floor( dblKiloMeters ) == 1 ? ' is' : 's are' ) + ' ≈ ' + dblMiles + ' mile' + ( Math.floor( dblMiles ) == 1 ? '' : 's' ) + '.';
            break;
          case 'M2FT' :
            var dblMeters = parseFloat( arrArgs[ 1 ] );
            var dblFeet = ( Math.round( dblMeters * 0.000621371 * 5260 * 100 ) / 100 );
            var strConverted = dblMeters + ' meter' + ( Math.floor( dblMeters ) == 1 ? ' is' : 's are' ) + ' ≈ ' + dblFeet + ' ' + ( Math.floor( dblFeet ) == 1 ? 'foot' : 'feet' ) + '.';
            break;
          case 'M2MI' :
            var dblMeters = parseFloat( arrArgs[ 1 ] );
            var dblMiles = ( Math.round( dblMeters * 0.000621371 * 100 ) / 100 );
            var strConverted = dblMeters + ' meter' + ( Math.floor( dblMeters ) == 1 ? ' is' : 's are' ) + ' ≈ ' + dblMiles + ' mile' + ( Math.floor( dblMiles ) == 1 ? '' : 's' ) + '.';
            break;
          case 'MI2FT' :
            var dblMiles = parseFloat( arrArgs[ 1 ] );
            var dblFeet = ( Math.round( dblMiles * 5260 * 100 ) / 100 );
            var strConverted = dblMiles + ' mile' + ( Math.floor( dblMiles ) == 1 ? ' is' : 's are' ) + ' ≈' + dblFeet + ' ' + ( Math.floor( dblFeet ) == 1 ? 'foot' : 'feet' ) + '.';
            break;
          case 'MI2KM' :
            var dblMiles = parseFloat( arrArgs[ 1 ] );
            var dblKiloMeters = ( Math.round( dblMiles * 1.609344 * 100 ) / 100 );
            var strConverted = dblMiles + ' mile' + ( Math.floor( dblMiles ) == 1 ? ' is' : 's are' ) + ' ≈' + dblKiloMeters + ' kilometer' + ( Math.floor( dblKiloMeters ) == 1 ? '' : 's' ) + '.';
            break;
          default :
            strConverted = 'I\'m sorry, I don\'t know how to process a `' + arrArgs[ 0 ] + '` conversion.';
        }
      }
      else if ( arrArgs.length === 1 ) {
        const arrConversionOptions = [ 'C2F', 'F2C', 'FT2M', 'KM2FT', 'KM2MI', 'M2FT', 'MI2FT', 'MI2KM' ];
        if ( arrConversionOptions.indexOf( arrArgs[ 0 ].toUpperCase() ) !== -1 ) {
          strConverted = 'you seem to have forgotten to give me something to do a ' + arrArgs[ 0 ] + ' conversion on.';
        }
        else {
          strConverted = 'you seem to have forgotten to tell me what I\'m supposed to convert `' + arrArgs[ 0 ] + '` from and to.';
        }
      }
      else {
        strConverted = 'So sorry... Not even close to being able to parse this nonsense yet: `' + arrArgs.join( ' ' ) + '`';
      }
      message.reply( strConverted );
      break;
    case 'dm' :
      if ( !isBot && ( isOwner || isCrown || isAdmin ) ) {
        var strWhom;
        strArgs = arrArgs.slice( 1 ).join( ' ' );
        if ( arrArgs[ 0 ].toLowerCase() === 'all' && isOwner ) {
          message.client.users.forEach( function ( user ) {
            sendDM( message, user, strArgs );
          } );
          strWhom = 'everyone';
        } else if ( arrArgs[ 0 ].toLowerCase() === 'server' && ( isAdmin || isOwner ) ) {
          message.guild.members.forEach( function ( member ) {
            sendDM( message, member.user, strArgs );
          } );
          strWhom = 'everyone in ' + message.guild.name;
        } else if ( message.mentions.roles.keyArray().length >= 1 ) {
          message.guild.roles.get( message.mentions.roles.first().id ).members.forEach( function ( member ) {
            sendDM( message, member.user, strArgs );
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
      if ( !isBot ) {
        message.author.send( 
          'You can help with the development of this bot and its brother and sister bots by contributing to the developer:' +
          '\n\t**PayPal "Discord bot" pool:** <https://paypal.me/pools/c/82z3HDuQ3y>'
        ).then( async dm => {
          await message.react( '%E2%9C%85' ).catch( errReactDM => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReactDM ); } );
          console.info( message.author.tag + ' just received a DM with the link to donate in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + '!' );
        } ).catch( errSendDM => {
          message.react( '%E2%9D%8C' ).then( goReact => {
            message.reply( ' since you are not set to accept DMs from members of this server...' +
              '\n\tYou can help with the development of this bot and its brother and sister bots by contributing to the developer:' +
              '\n\t\t**PayPal "Discord bot" pool:** <https://paypal.me/pools/c/82z3HDuQ3y>' );
            console.info( message.author.tag + ' just received the link to donate in ' + message.guild.name + '#' + message.channel.name + ' (because they are blocking DMs) at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + '!' );
          } ).catch( errBlocked => {
            message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to see the information they requested?  I\'d appreciate it. :slight_smile: ^^  @here' );
            console.error( 'Unable to react to ' + message.author.tag + '\'s request for donation information in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errBlocked );
            console.info( message.author.tag + ' has requested the link to donate in ' + message.guild.name + '#' + message.channel.name + ' but has not yet gotten the information (because they are blocking me) at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + '!' );
          } );
        } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'ds':
      if ( isOwner ) {
        message.delete().catch( errDel => { console.error( '%s: %o', strNow(), errDel ); } );
        
        var strID = ( arrArgs[ 0 ] || message.author.id ).replace( /<@!?/, '' ).replace( />/, '' );
        var member = await message.guild.members.get( strID );
        sendMunzeeDiscordSocial( member, ' by request of ' + message.author + '**#' + message.author.discriminator + '**' );
      }
      break;
    case 'edit' :
      if ( ( isOwner || isBotMod || isCrown || isAdmin ) && !isBot ) {
        var guild, channel, thisMessage;
        guild = message.client.guilds.find( 'id', message.guild.id );
        channel = guild.channels.find( 'id', message.channel.id );
        thisMessage = arrArgs[ 0 ];
        var strNewMsg = arrArgs.slice( 1 ).join( ' ' );
        channel.fetchMessage( thisMessage ).then( objMsg => {
          objMsg.edit( strNewMsg ).then( edited => {
            message.react( '%E2%9C%85' ).then( r => {
              message.client.setTimeout( function(){
                message.delete( { reason: 'Deleting completed request to edit a message of mine.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
              }, 7500 );
            } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          }
          ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
        } );
      }
      else {
        message.react( '%E2%9D%8C' ).then( r => {
          message.client.setTimeout( function(){
            message.delete( { reason: 'Deleting rejected request to edit a message of mine.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          }, 2500 );
        } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
        message.author.send( 'I\'m sorry, ' + message.author.tag + ', but you can\'t edit my messages in the `' + message.guild.name + '` server.' )
          .then( dm => {
            message.react( '%E2%9C%85' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          } ).catch( e => {
            message.react( '%E2%9D%8C' ).then( r => {
              message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
            } ).catch( e => {
              message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^ @here' );
              console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e );
            } );
            console.log( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + e );
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
    case 'flat' :
      if ( !isBot ) {
        message.delete();
        var objFlatStrings = await checkFlats();
        var strCheckFlat = '', strFlatCheck = ( arrArgs[ 0 ] ? arrArgs[ 0 ].toLowerCase() : 'none' );
        if ( isDebug ) { console.log( '%s: Checking on !Flat %s: %o', strNow(), arrArgs[ 0 ], objFlatStrings.flats[ strFlatCheck ] ); }
        switch ( strFlatCheck ) {
          case 'rob':
          case 'lou':
          case 'matt':
          case 'hammock':
            strCheckFlat = objFlatStrings.flats[ strFlatCheck ];
            break;
          case 'none':
            strCheckFlat = 'You forgot to specify which flat friend you wanted to check on, please try again.';
            break;
          default:
            strCheckFlat = 'I\'m sorry, I don\'t know who Flat `' + arrArgs[ 0 ] + '` is.';
        }
        if ( isDebug ) { console.log( '%s: Report for !Flat %s: %s', strNow(), arrArgs[ 0 ], strCheckFlat ); }
        message.channel.send( strCheckFlat );
      }
      break;
    case 'flats' :
      if ( !isBot ) {
        message.delete();
        var objFlatStrings = await checkFlats();
        var strFlatsNow = ( objFlatStrings.onNow === '' ? 'There are no flats on the map currently!' : objFlatStrings.onNow );
        message.channel.send( strFlatsNow );
      }
      break;
    case 'foobar' :
      if ( !isBot ) {
        message.delete()
          .then( async delTrigger => { message.reply( '__**NO `!foobar` FOR YOU!**__' ); } )
          .catch( errDel => {
          message.reply( 'I am unable to process your request.  Please ask ' + message.guild.owner.user.tag + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ).then( replySuccess => { replySuccess.edit( message.author + ', I am unable to process your request.  Please ask ' + message.guild.owner.user + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ) } );
        } );
      }
      break;
    case 'help' :
      if ( !isBot ) {
        message.author.send( 'Hello ' + message.author + '!  I have the following commands:\n' ).then( async dm => {
          await message.react( '%F0%9F%93%97' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          await message.author.send(
            '\n\n\n__Commands for everyone:__\n' +
            '\n\t:green_book:\t**`about`**: This command gives you information about me, ' + message.client.user + '#' + message.client.user.discriminator +
            '\n\t:closed_book:\t**`debug`**: Only my owners can (dis|en)able my debugging mode,' +
            '\n\t\t\t\tbut you can see if it is on or off with `!debug state`.' +
            '\n\t:green_book:\t**`donate`**: If you enjoy this bot, please consider donating to the developer: <https://goo.gl/FZ3g6g>' +
            '\n\t:green_book:\t**`help`**: This command response!' +
            '\n\t:green_book:\t**`inviteme`**: This will give you a link to have me on your server.' +
            '\n\t:green_book:\t**`lmgtfy`**: Let me Google that for You!' +
            '\n\t:green_book:\t**`member`**: Get a direct link to a Munzee player\'s profile. **SUPERSCEDED by `!basic`**' +
            '\n\t:green_book:\t**`munzee`**: Get basic information about a munzee.  **ALPHA (<:1000hours:495419263989972992>²)**' +
            '\n\t:green_book:\t**~~`player`~~ `basic`**: Get basic information about a Munzee player.  **BETA (<:1000hours:495419263989972992>)**' +
            '\n\t:green_book:\t**`ping`**: Test the speed of my connection to Discord.' +
            '\n\t:green_book:\t**`poll`**: Do a poll of a server:' +
            '\n\t\t\t\t\t`!poll Question to poll? || :one: || :two: || :three:`' +
            '\n\t:green_book:\t**`ZeeQRew`: Check a Munzee player\'s eligibility for the **ZeeQRew**.  **BETA (<:1000hours:495419263989972992>)**' +
            '\n\t:green_book:\t**`react`**: Make me react to a comment with an emoji!' +
            '\n\t:green_book:\t**`say`**: Make me say something!'// +
//            '\n\t:green_book:\t**`welcome`**: '
          ).catch( errSendDM => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errSendDM ); } );
          if ( isAdmin ) {
            await message.react( '%F0%9F%93%99' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            await message.author.send(
              '\n\n\n__Commands for `ADMINISTRATOR`s:__\n' +
              '\n\t:orange_book:\t**`clean`** or **`clear`**: Delete messages of mine in the current channel.' +
              '\n\t:orange_book:\t**`edit`**: Did someone make me `!say` something that you wish you could edit?' +
              '\n\t\t\t\tUse: `!edit <messageID> <New content goes here!>`'
            ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          }
          if ( isOwner ) {
            if ( !isAdmin ) {
              await message.author.send(
                '\n\n\n__Commands for `ADMINISTRATOR`s:__\n' +
                '\n\t:orange_book:\t**`clean`** or **`clear`**: Delete messages of mine in the current channel.' +
                '\n\t:orange_book:\t**`edit`**: Did someone make me `!say` something that you wish you could edit?' +
                '\n\t\t\t\tUse: `!edit <messageID> <New content goes here!>`'
              ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            }
            await message.react( '%F0%9F%93%95' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            await message.author.send(
              '\n\n\n__Owner only commands:__\n' +
              '\n\t:closed_book:\t**`announce`**: Make me announce something to all servers I am currently in.' +
              '\n\t:closed_book:\t**`game`**: Change my game.' +
              '\n\t:closed_book:\t**`host`**: Make me host a fellow streamer (Discord only).' +
    //          '\n\t:closed_book:\t**`join`**: Make me join a Discord server.' +
              '\n\t:closed_book:\t**`part`**: Make me leave a Discord server.' +// Move to isAdmin list?
              '\n\t:closed_book:\t**`restart`**: Restart me!' +
              '\n\t:closed_book:\t**`status`**: Set my status to active, idle, or do not disturb.' +
              '\n\t:closed_book:\t**`stream`**: Set my stream URL.' +
              '\n\t:closed_book:\t**`unhost`**: End my hosting of a streamer (Discord only).'
            ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          }
          await message.react( '%E2%9C%85' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
        } ).catch( e => {
          message.react( '%E2%9D%8C' ).then( r => {
            message.reply( 'You\'ll need to accept DMs from members of this server in order to get a list of my commands DMed to you.' );
          } ).catch( e => {
            message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of my commands DMed to them. ^^  @here' );
            console.log( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + e );
          } );
        } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'inviteme' :
      if ( !isBot ) {
        message.client.fetchApplication().then( client => { message.channel.send( 'You can invite me to your channel! Please visit: ' +
          '<https://discordapp.com/api/oauth2/authorize?client_id=' + client.id + '&scope=bot&permissions=8>' ); } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'lmgtfy' :
      if ( !isBot ) {
        var q = encodeURI( strArgs.replace( / /g, '+' ) );
        message.channel.send( '<https://lmgtfy.com/?q=' + q + '>' );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'mhq' :
      if ( !isBot ) {
        message.delete( { reason: 'Cleaning up request for the current MHQ time of: ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) } )
          .then( delMsg => {
            message.channel.send( 'The current MHQ time is: **__' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '__**' );
          } ).catch( delErr => {
            message.channel.send( 'The current MHQ time is: **__' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '__**' );
            console.log( 'Unable to delete request in ' + message.guild.name + '#' + message.channel.name + ' for the current MHQ time (' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + ') with error: ' + delErr );
          } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'ping' :
      if ( !isBot ) {
        var msgWait = await message.channel.send( message.author + ', Pong!  The heartbeat ping is ' + Math.round( message.client.ping ) + 'ms!' );
        msgWait = await msgWait.edit( message.author + ', Pong!  Gathering round-trip time...  The heartbeat ping is ' + Math.round( message.client.ping ) + 'ms!' );
        msgWait.edit( message.author + ', Pong!  The message round-trip took ' + Math.round( ( ( new Date() ).valueOf() - msgWait.createdTimestamp ) / 2 ) + 'ms.  The heartbeat ping is ' + Math.round( message.client.ping ) + 'ms!' ).catch( console.error );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'poi' :
      if ( isOwner ) {
        message.channel.send( 'On my todo list, not ready yet.' );
/*        var strTask = ( arrArgs[ 0 ] || 'null' ).toLowerCase();
        switch ( strTask ) {
          case 'offer' :
            /* OFFER *//*
            break;
          case 'request' :
            /* REQUEST *//*
            break;
          case 'null' :
            message.reply( 'you appear to have forgetten to mention if you want to make a `!POI offer` or `!POI request`.' );
            break;
          default :
            message.reply( 'I\'m sorry, `' + arrArgs[ 0 ] + '` is not a valid option.  Please try again with `!POI offer` or `!POI request`.' );
        }
        message.delete(  );// */
      }
      break;
    case 'poll' :
      if ( !isBot ) {
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
          await thisPoll.react( reaction ).then( () => { r++; } ).catch( errReact => {
            console.error( '%s: %s triggered an error in %s#%s (https://discordapp.com/channels/%s/%s/%s): ', strNow(), message.author, message.guild.name, message.channel.name, message.guild.id, message.channel.id, message.id, errReact );
            thisPoll.delete().then( async delTP => {
              var msgFailedPoll = await message.channel.send( '**I\'m sorry, ' + message.author + ', but I cannot create this poll at this time.  You should never receive this message, please contact my owner, <@' + settings[ bot ].owners[ 0 ] + '>.**' );
              msgFailedPoll.react( '%E2%9D%8C' );
            } ).catch(  errDel => {
            console.error( '%s: Error deleting message in %s#%s (https://discordapp.com/channels/%s/%s/%s): ', strNow(), thisPoll.guild.name, thisPoll.channel.name, thisPoll.guild.id, thisPoll.channel.id, thisPoll.id, errDel ); } );
          } );
        } while ( r < arrArgs.length );
        message.delete( { reason: 'Deleting posted poll question.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'react' :
      if ( !isBot ) {
        var rxp = /<:(.*)?:([\d]*)>/;
        var guild, channel, thisMessage, reaction;
        var isReaction = true;
        var isDeleted = false;
        if ( arrArgs[ 3 ] ) {
          if ( !message.client.guilds.find( 'id', arrArgs[ 3 ] ) ) {
            isReaction = false;
            message.react( '%E2%9D%8C' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
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
            message.react( '%E2%9D%8C' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
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
          message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          isDeleted = true;
        }
        else if ( isMention ) {
          thisMessage = message.guild.members.get( arrArgs[ 1 ].match( /<@!?(\d*)>/ )[ 1 ] ).lastMessageID;
          if ( thisMessage !== null ) {
            message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            isDeleted = true;
          }
          else {
            isReaction = false;
            message.react( '%E2%9D%8C' ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
            message.reply( 'I can\'t find ' + message.guild.members.get( arrArgs[ 1 ].match( /<@!?(\d*)>/ )[ 1 ] ) + '\'s last message.' );
          }
        }
        else {
          thisMessage = arrArgs[ 1 ];
          message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
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
            ).catch( e => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + e ); } );
          } );
        }
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'rmcheck' :
      if ( isOwner || isBotMod ) {
        message.delete();
        checkRetireMyths( true, message.channel );
      }
      break;
    case 'roll' :
      if ( !isBot ) {
        var roll = { sets: 1, dice: 1, sides: 6, modifier: 0 };
        var dieRolls = {};
        var diceRoll = 0;
        var parseArgs = strArgs.match( /(([\d]*)[#])?(([\d]*)[dD])?([\d]*)?([\+\-][\d]*)?/ );
        
        if ( parseArgs[ 2 ] != undefined && parseArgs[ 2 ] != '' ) {
          roll.sets = parseInt( parseArgs[ 2 ] );
        }
        
        if ( parseArgs[ 4 ] != undefined && parseArgs[ 4 ] != '' ) {
          roll.dice = parseInt( parseArgs[ 4 ] );
        }
        
        if ( parseArgs[ 5 ] != undefined && parseArgs[ 5 ] != '' ) {
          roll.sides = parseInt( parseArgs[ 5 ] );
        }
        
        if ( parseArgs[ 6 ] != undefined && parseArgs[ 6 ] != '' ) {
          roll.modifier = parseInt( parseArgs[ 6 ] );
        }
        
        var rollMessage = ':game_die: Rolling: ';
        for ( var set = roll.sets; set > 0; set-- ) {
          rollMessage += '(**' + roll.dice + 'd' + roll.sides;
          if ( roll.modifier > 0 ){
            rollMessage += '+' + roll.modifier;
          } else if ( roll.modifier < 0 ) {
            rollMessage += '-' + roll.modifier;        
          }
          
          rollMessage += '**)';
          
          if ( set > 1 ) {
            rollMessage += ' + ';
          } else {
            rollMessage += ':';
          }
        }
        
        message.channel.send( rollMessage );
        var rollSubtotal = '(';
        
        for ( var set = roll.sets; set > 0; set-- ) {
          var intRollSubtotal = 0;
          for ( var die = roll.dice; die > 0; die-- ) {
            dieRolls.die = Math.floor( Math.random() * roll.sides ) + 1;
            diceRoll += dieRolls.die;
            intRollSubtotal += dieRolls.die;
          }
        
          if ( roll.modifier !== 0 ) {
            diceRoll += roll.modifier;
            intRollSubtotal += roll.modifier;
          }
          
          rollSubtotal += intRollSubtotal.toLocaleString() + ')';
          
          if ( set > 1 ) {
            rollSubtotal += ' + (';
          } else {
            rollSubtotal += ':';
          }
        }
        
        message.channel.send( rollSubtotal );
        
        if ( diceRoll > 9999999999 ) {
          diceRoll = 0;
        }
        
        message.channel.send( '**Sum**: ' + diceRoll.toLocaleString() );
      }
      break;
    case 'rps':
      if ( !isBot ) {
        var rollSystem = Math.floor( Math.random() * 3 );
        var rollPlayer = -1;
        var result = 'Hrmm... Something went REALLY wrong, please get in touch with my owner: <@' + settings[ bot ].owners[ 0 ] + '>';
        switch ( ( arrArgs[ 0 ] || 'NONE' ).toLowerCase() ) {
          case 'rock':
            rollPlayer = 0;
            break;
          case 'paper':
            rollPlayer = 1;
            break;
          case 'scissors':
            rollPlayer = 2;
            break;
          default:
            rollPlayer = Math.floor( Math.random() * 3 );
        }
        switch ( rollPlayer ) {
          case 0:
            if ( rollSystem === 1 ) {
              result = ':stuck_out_tongue_closed_eyes: **You Lose!** Paper covers Rock!';
            } else if ( rollSystem === 2 ) {
              result = ':grin: **You Win!** Rock smashes Scissors!';
            } else {
              result = ':neutral_face: **TIE!** Two Rocks in a pile!';
            }
            break;
          case 1:
            if ( rollSystem === 2 ) {
              result = ':stuck_out_tongue_closed_eyes: **You Lose!** Scissors cut Paper!';
            } else if ( rollSystem === 0 ) {
              result = ':grin: **You Win!** Paper covers Rock!';
            } else {
              result = ':neutral_face: **TIE!** Two Papers in the fire!';
            }
            break;
          case 2:
            if ( rollSystem === 1 ) {
              result = ':stuck_out_tongue_closed_eyes: **You Lose!** Rock smashes Scissors!';
            } else if ( rollSystem === 2 ) {
              result = ':grin: **You Win!** Scissors cut Paper!';
            } else {
              result = ':neutral_face: **TIE!** Two Scissors on my desk!';
            }
            break;
          default:
            result = 'Hrmm... Something went wrong, please get in touch with my owner: <@' + settings[ bot ].owners[ 0 ] + '>';
        }
        message.reply( result );
      }
      break;
    case 'say' :
      if ( !isBot ) {
        if ( isDebug ) { console.log( message.author.tag + ' asked me to say `' + strArgs + '`' + ( enableSay ? '' : ', but the say command is disabled' ) + '.' ); }
        
        if ( arrArgs[ 0 ] === 'disable' ) {
          if ( enableSay ) {
            enableSay = false;
            message.channel.send( 'The `!say` command has been **disabled**.' );
          } else {
            message.channel.send( 'The `!say` command was already **disabled**.' );
          }
        }
        else if ( enableSay && strArgs.toLowerCase() !== 'enable' ) {
          var sayChan = message.channel;
          if ( ( isOwner || isCrown || isMHQ || isThirdPartyDev ) && arrArgs[ 0 ].match( /<#[\d]*>/ ) ) {
            var sayChanID = arrArgs[ 0 ].match( /<#([\d]*)>/ )[ 1 ];
            sayChan = message.client.channels.get( sayChanID );
            strArgs = arrArgs.slice( 1 ).join( ' ' );
          }
          if ( isOwner ) {
            message.delete( { reason: "Processing `!say` command mentioning @here or @everyone for my owner(s)." } ).then( msg => { sayChan.send( strArgs ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
          } else if ( isCrown || isAdmin ) {
            message.delete( { reason: "Processing `!say` command mentioning @here or @everyone for " + ( isCrown ? "the owner" : " an admin" ) + " of this server." } ).then( msg => { sayChan.send( strArgs ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
          } else if ( !message.mentions.everyone || ( message.mentions.everyone && !message.guild.large ) ) {
            message.delete( { reason: "Processing `!say` command." } ).then( msg => { sayChan.send( strArgs.replace( '@everyone', message.author ).replace( '@here', message.author ) ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
            if ( message.mentions.everyone ) {
              console.log( message.author.tag + ' mentioned ' + ( strArgs.match( '@everyone' ) ? ( strArgs.match( '@here' ) ? '@everyone & @here' : '@everyone' ) : ( strArgs.match( '@here' ) ? '@here' : 'none' ) ) + ' in ' + message.guild.name + '#' + message.channel.name + ', but I didn\'t.' );
            }
          } else {
            message.delete( { reason: "Refusing `!say` command with a `@here` or `@everyone` for someone not authorized." } ).then( msg => { msg.reply( ", You\'re a n00b!  You can\'t make me mention that many people!" ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
          }
        }     
        else if ( arrArgs[ 0 ] === 'enable' ) {
          if ( enableSay ) {
            message.channel.send( 'The `!say` command was already **enabled**.' );
          } else {
            enableSay = true;
            message.channel.send( 'The `!say` command has been **enabled**.' );
          }
        }
        else {
          message.delete( { reason: "Processing `!say` command." } ).then( msg => { msg.author.send( 'Sorry, the `!say` command is not currently enabled.' ); } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errDel ); } );
        } 
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;
    case 'summon' :
      if( isOwner ) {
        var strSummonedID = ( !isNaN( parseInt( arrArgs[ 0 ].replace( /(<@!?|>)/, '' ) ) ) ? arrArgs[ 0 ].replace( /(<@!?|>)/g, '' ) : message.guild.members.map( user => { if ( user.nickname !== null ) { if ( user.nickname.toLowerCase() === arrArgs[ 0 ].toLowerCase() ) { return user.id } } else if ( user.user.username !== null ) { if ( user.user.username.toLowerCase() === arrArgs[ 0 ].toLowerCase() ) { return user.id } } } ).filter( user => { if ( user ) { return user; } } ) );
        var strSummonChan = ( !isNaN( parseInt( arrArgs[ 2 ].replace( /(<#|>)/, '' ) ) ) ? arrArgs[ 2 ].replace( /(<#|>)/g, '' ) : message.guild.channels.map( channel => { if ( channel.name.toLowerCase() === arrArgs[ 2 ].toLowerCase() ) { return channel.id } } ) );
        if ( isDebug ) { console.log( '%o has been summoned %o %o', strSummonedID, arrArgs[ 1 ].toLowerCase(), message.guild.channels.get( strSummonChan ) ); }
//        message.guild.channels.get( strSummonChan ).send( '<@' + strSummonedID + '>, your presence is requested in <#' + ( arrArgs[ 1 ].toLowerCase() === 'to' ? strSummonChan : message.channel.id ) + '> by ' + message.author );
      }//*/
      break;
    case 'server' :
      if ( isOwner || canManage || canInvite ) {
        var inviteUrl = '';
        var channel = '';//message.guild.channels.get( guildWelcomeMesages[ member.guild.id ].channel );// Once I put the welcome messages in a .json I can do this.
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
/*    case 'twitter' :
      if ( !isBot ) {
        var objOwner = await message.client.fetchUser( settings[ bot ].owners[ 0 ] );
        objOwner.send( message.author + ' requested a tweet on the `@GeocacheME_` Twitter feed: `' + strArgs + '`' );
        message.author.send( 'The <:greenie:452859217515249684> frog handler has been notified of your <:Twitter:452858838215819274> request.' );
        message.react( '%E2%9C%85' ).catch( errReact => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author + ' triggered an error in ' + message.guild.id + '#' + message.channel.id + ' ( ' + message.guild.name + '#' + message.channel.name + '): ' + errReact ); } );
      }
      break;//*/
/*    case 'welcome' :
      if ( !isBot ) {
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;//*/
    case 'rall' :
      if ( isOwner ) {
        Promise.all( [
          message.delete( { reason: 'Processing `!rall` command.' } ).then( async message => {
            timeNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString ),
            await message.channel.send( '_is restarting all other bots as requested by ' + message.author + '._' ),
            console.log( message.author.username + ' ordered a restart of all other bots at ' + timeNow );
          } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ': ' + errDel ); } )
        ] ).then( () => {
          exec( 'pm2 restart "DDObot" "LOTRObot" "Lazy Bastard"', { windowsHide: true }, ( error, stdout, stderr ) => {  if ( error ) {// "Gunther" "ShoeBot"
              console.error( "Error: " + error );
              return;
            }
            console.log( "Result: " + stdout );
            console.log( "stderr: " + stderr );
          } );
        } );
      }
      break;
    case 'syncme' :
    case 'sync' :
      if ( !isBot && message.guild.id === '464434174661754900' ) {
        if ( isOwner && strArgs === 'ALL' ) {
          var allPlayers = await message.guild.roles.get( '464434652573335552' ).members.filter( member => { if ( !member.user.bot ) { return member; } } ).array();
          var intPlayers = allPlayers.length;
          console.warn( 'Attempting to synchronize roles for %i @Players', intPlayers );
          /*
          var processMembers = setInterval( function () {
            let checkPlayer = allPlayers[ --intPlayers ];
            console.log( 'Syncronizing roles for: %s', checkPlayer.user.tag );
            doAutoRole( checkPlayer );
            if ( intPlayers <= 0 ) {
              clearInterval( processMembers );
            }
          }, 2500 );//*/
          /*
          allPlayers.forEach( async ( checkPlayer, ndx ) => {
            console.log( 'Syncronizing roles for: %s', checkPlayer.user.tag );
            setTimeout( async () => { await doAutoRole( checkPlayer ); }, 2500 );
          } );//*/
          message.channel.send('Sorry, just nope.  Not at this time.');
        }
        else if ( strArgs.toUpperCase() === 'CLAN' ) {
          var chanParentType = ( !message.channel.parentID ? 'undefined' : client.channels.get( message.channel.parentID ).type );
          if ( !isClanAdmin ) {
            console.warn( '%s#%s, who is not a @Clan Admin, just tried to run `!sync clan` in %s#%s', message.author.username, message.author.discriminator, message.guild.name, message.channel.name );
            message.channel.send( 'I\'m sorry, ' + message.author + ', that command is restricted to <@&484748206610186261>s.  If you think you\'ve gotten this message in error, try running `!syncme` first to update your roles, then contact my owner for further assistance.' );
          }
          else if ( chanParentType !== 'category' ) {
            console.warn( '%s#%s, who is a @Clan Admin, just tried to run `!sync clan` in %s#%s (not a clan channel)', message.author.username, message.author.discriminator, message.guild.name, message.channel.name );
            message.channel.send( 'I\'m sorry, ' + message.author + ', that command is restricted to subchannels of the `CLANS` category.  If you think you\'ve gotten this message in error, first contact a server <@&464434779748827138>, then contact my owner for further assistance.' );
          }
          else if ( isOwner ) {//TEMP isOwner
            var allClanmates = await message.channel.members.filter( member => { if ( !member.user.bot ) { return member; } } ).array();
            var intPlayers = allClanmates.length;
            console.warn( 'Attempting to synchronize roles for %i @Clan Members', intPlayers );//464434384045342721 @Clan Member
            var processMembers = setInterval( function () {
              let checkPlayer = allClanmates[ --intPlayers ];
              console.log( 'Syncronizing roles for allClanmates[ %i ]: %s', intPlayers, checkPlayer.user.tag );
              doAutoRole( checkPlayer );
              if ( intPlayers <= 0 ) {
                clearInterval( processMembers );
              }
            }, 2500 );
          }
        }
        else {
          var doSync = false;
          var syncResult = { success: false, name: strUserName };
          var intMentions = message.mentions.members.size;
          console.log( 'There are %i mentions in this %s request.', intMentions, command );
          var syncMember = message.guild.members.get( message.author.id );
          console.log( 'isStaff: %o\nintMentions: %i\nRegExp( \'<@!?\\d*>\' ).test( arrArgs[ 0 ] ): %o\narrArgs.length: %i', isStaff, intMentions, RegExp( '<@!?\\d*>' ).test( arrArgs[ 0 ] ), arrArgs.length );
          if ( isStaff && intMentions === 1 ) {// Set syncMember to GuildMember for person mentioned
            syncMember = message.mentions.members.first();
          }
          if ( isStaff && RegExp( '<@!?\\d*>' ).test( arrArgs[ 0 ] ) && arrArgs.length === 2 ) {// doAutoRole( syncMember, strSyncName );
            var strSyncName = arrArgs[ 1 ];
            doSync = true;
          }
          else if ( !isStaff && ( intMentions === 1 || ( RegExp( '<@!?\\d*>' ).test( arrArgs[ 0 ] ) && arrArgs.length === 2 ) ) ) {// Inform author it's a @Staff only command
            console.warn( 'Non-Staff member tried to doAutoRole( \'<@%s>\', \'%s\' )', syncMember.id, strSyncName );
            message.channel.send( 'Sorry ' + message.author + '**#**' + message.author.discriminator + ', only <@&464434512487514122> members are allowed to run that command on other members.' );
          }
          else {// doAutoRole( syncMember );
            doSync = true;
          }
          if ( doSync ) {
            console.log( 'Processing doAutoRole( \'<@%s>\', \'%s\' )', syncMember.id, strSyncName );
            var msgSync = await message.channel.send( 'Processing ' + command + ' request' + ( arrArgs.length > 0 ? ': ' + arrArgs.join( ' :arrow_right: ' ) : ' for ' + message.author + '.' ) )
              .catch( errSend => { console.error( 'Unable to send message to %s#%s: %o', message.guild.name, message.channel.name, errSend ); } );
            syncResult = await doAutoRole( syncMember, strSyncName, message.channel );
          }
          message.delete( 3000 ).catch( errDel => { console.error( 'Unable to delete %s command from %s#%s: %o', command, message.guild.name, message.channel.name, errDel ); } );
          if ( syncResult.success ) {
            msgSync.edit( 'Successfully completed processing ' + command + ' request for player: ' + syncResult.name )
              .then( () => { msgSync.delete( 10000 ).catch( errDel => { console.error( 'Unable to delete %s result from %s#%s: %o', command, message.guild.name, message.channel.name, errDel ); } ); } )
              .catch( errEdit => {
                console.error( 'Unable to edit message in %s#%s: %o', message.guild.name, message.channel.name, errEdit );
                msgSync.delete().catch( errDel => { console.error( 'Unable to delete %s result from %s#%s: %o', command, message.guild.name, message.channel.name, errDel ); } );
              } );
          } else {
            msgSync.edit( 'Failed to complete processing ' + command + ' request for player: ' + syncResult.name )
              .then( () => { msgSync.delete( 10000 ).catch( errDel => { console.error( 'Unable to delete %s result from %s#%s: %o', command, message.guild.name, message.channel.name, errDel ); } ); } )
              .catch( errEdit => {
                console.error( 'Unable to edit message in %s#%s: %o', message.guild.name, message.channel.name, errEdit );
                msgSync.delete().catch( errDel => { console.error( 'Unable to delete %s result from %s#%s: %o', command, message.guild.name, message.channel.name, errDel ); } );
              } );
          }
        }
      }
      else { message.channel.send( 'Sorry ' + message.author + '**#**' + message.author.discriminator + ', this command has been restricted to only work in the <https://Discord.me/Munzee> server at this time.  Please contact my owner if you would like to have it added for your server.  Thanks!' ); }
      break;
    case 'guide' :
      if ( !isBot ) {
        message.delete();
        message.channel.send( 'Karl Witsman\'s __Uncle Karl\'s Guide to Munzee__ - 2019/03:', { files: [ { attachment: './March-2019-Uncle-Karls-Guide-to-Munzee.pdf', name: 'UncleKarlsGuide2Munzee.pdf' } ] } );
      }
      break;
    case 'whoami' :
      if ( message.guild ) {
        var imgAvatar = message.guild.members.get( message.author.id ).user.avatarURL;
        var strDescription =
          '\nUsername: `' + message.author.username + '`' +
          '\nNickname: `' + message.guild.members.get( message.author.id ).nickname + '`';
        if ( strArgs !== '' ) {
          strDescription += '\n\nstrArgs: `' + strArgs + '`'
        } else {
          strDescription += '\n\nstrArgs: __undefined__'
        }
        if ( arrArgs[ 0 ] !== undefined ) {
          strDescription += '\narrArgs: [ \'`' + arrArgs.join( '`\', \'`' ) + '`\' ]';
          if ( arrArgs[ 0 ].replace( /<@!?/, '' ).replace( />/, '' ) !== undefined ) {
            var strParsedID = arrArgs[ 0 ].replace( /<@!?/, '' ).replace( />/, '' );
            imgAvatar = message.guild.members.get( strParsedID ).user.avatarURL;
            strDescription +=
              '\nParsed ID: `' + strParsedID + '`' +
              '\nUsername: `' + message.guild.members.get( strParsedID ).user.username + '`' +
              '\nNickname: `' + message.guild.members.get( strParsedID ).nickname + '`';
          }
        } else {
          strDescription += '\narrArgs: __undefined__';
        }
            
            
        var objWho = new Discord.RichEmbed()
          .setTitle( 'strUserName: `' + strUserName + '`' )
          .setThumbnail( imgAvatar )
          .setDescription( strDescription );
        message.channel.send( 'Result:', { embed: objWho } );
      } else {
        message.reply( 'I do not know you you are because you are not in a guild channel.' );
      }
      break;
    case 'qrew' :
    case 'zeeqrew' :
      if ( !isBot ) {
        message.delete( 3000 );
        var embedResult = new Discord.RichEmbed()
          .setTitle( '(Zee)QRew qualification check for: ' + strUserName )
          .setURL( 'https://www.munzee.com/m/' + strUserName + '/' )
          .setDescription( 'Looking up information... please wait...' );
        var msgSent = await message.channel.send( 'Processing (Zee)QRew qualification check:', { embed: embedResult } );
        var objMember = await getMemberData( strUserName, message, msgSent );
        var objZeeQRew = new Discord.RichEmbed();
        if ( objMember.error !== '404' ) {
          const dateNow = ( new Date() ).toISOString().match( /([\d]{4}-[\d]{2}-[\d]{2}T)(.*)/ )[ 1 ] + '0' + ( ( ( new Date() ).getTimezoneOffset() / 60 ) + 1 ) + ':00:00.000Z';
          var objLastDeploy = ( objMember.deploys.length > 0 ? objMember.deploys.getMax( 'deployed_at' ) : { deployed_at: ( new Date() ), age: -1 } );
          var strDeployAge = ( ( new Date( objLastDeploy.deployed_at ) ).valueOf() >= ( new Date( dateNow ) ).valueOf() ? 'today' : objLastDeploy.age + ' days ago ' );
          var objLastCapture = ( objMember.captures.length > 0 ? objMember.captures.getMax( 'captured_at' ) : { captured_at: ( new Date() ), age: -1 } );
          var strCaptureAgo = ( ( new Date( objLastCapture.deployed_at ) ).valueOf() >= ( new Date( dateNow ) ).valueOf() ? 'today' : objLastCapture.ago + ' days ago ' );
          var isQRew = false, isZeeQRew = false;
          if ( objMember.isPremium  && objLastDeploy.age <= 14 && objLastCapture.ago <= 14 ) {
            if ( objMember.number_of_deploys >= 100 && objMember.number_of_captures >= 1000 ) {
              isQRew = true;
            }
            if ( objMember.points >= 100000 && objMember.physical_deploys >= 250 && objMember.physical_captures >= 500 ) {
              isZeeQRew = true;
            }
          }
          objZeeQRew
            .setThumbnail( objMember.avatar )
            .setTitle( '(Zee)QRew check result for: __' + strUserName + '__' )
            .setURL( 'https://www.munzee.com/m/' + strUserName + '/' )
            .setDescription( 
              ( isQRew ? ':white_check_mark:' : ':x:' ) + ' QRew \t ' + ( isZeeQRew ? ':white_check_mark:' : ':x:' ) + ' ZeeQRew'
            )
            .addField( 'QRew', 
              ( objMember.isPremium ? ':white_check_mark:' : ':x:' ) +
                ' **Premium**: ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) + '\n' +
              ( objLastDeploy.age <= 14 ? ':white_check_mark:' : ':x:' ) +
                ' **Last deploy**: [' + objLastDeploy.name + '](https://www.munzee.com/m/' + strUserName + '/' + objLastDeploy.id + '/) (' + strDeployAge + ')\n' +
              ( objMember.number_of_deploys >= 100 ? ':white_check_mark:' : ':x:' ) +
                ' **Total Deploys**: ' +
                ( objMember.number_of_deploys > 100 ? '**100+**' : objMember.number_of_deploys.toLocaleString() ) + ' out of 100' +
                ( objMember.number_of_deploys > 100 ? '' : ' (' + ( Math.floor( ( objMember.number_of_deploys / 100 ) * 1000 ) / 10 ).toLocaleString() + '%)' ) + '\n' +
              ( objLastCapture.ago <= 14 ? ':white_check_mark:' : ':x:' ) +
                ' **Last capture**: [' + objLastCapture.name + '](' + objLastCapture.deployed.URL + objLastCapture.id + '/) (' + strCaptureAgo + ')\n' +
              ( objMember.number_of_captures >= 1000 ? ':white_check_mark:' : ':x:' ) +
                ' **Total Captures**: ' +
                ( objMember.number_of_captures > 1000 ? '**1,000+**' : objMember.number_of_captures.toLocaleString() ) + ' out of 1,000' +
                ( objMember.number_of_captures > 1000 ? '' : ' (' + ( Math.floor( ( objMember.number_of_captures / 1000 ) * 1000 ) / 10 ).toLocaleString() + '%)' )
              )
            .addField( 'ZeeQRew', 
              ( objMember.isPremium ? ':white_check_mark:' : ':x:' ) +
                ' **Premium**: ' + ( objMember.isPremium ? ':star:' : '[:no_entry_sign:](https://store.freezetag.com/products/munzee-premium-membership)' ) + '\n' +
              ( objMember.points >= 100000 ? ':white_check_mark:' : ':x:' ) +
                ' **Points**: ' + objMember.points.toLocaleString() + ' out of 100,000 (' + ( Math.floor( ( objMember.points / 100000 ) * 1000 ) / 10 ).toLocaleString() + '%)\n' +
              ( objLastDeploy.age <= 14 ? ':white_check_mark:' : ':x:' ) +
                ' **Last deploy**: [' + objLastDeploy.name + '](https://www.munzee.com/m/' + strUserName + '/' + objLastDeploy.id + '/) (' + strDeployAge + ')\n' +
              ( objMember.physical_deploys >= 250 ? ':white_check_mark:' : ':x:' ) +
                ' **Physical Deploys**: ' +
                ( objMember.physical_deploys > 250 ? '**250+**' : objMember.physical_deploys.toLocaleString() ) + ' out of 250' +
                ( objMember.physical_deploys > 250 ? '' : ' (' + ( Math.floor( ( objMember.physical_deploys / 250 ) * 1000 ) / 10 ).toLocaleString() + '%)' ) + '\n' +
              ( objLastCapture.ago <= 14 ? ':white_check_mark:' : ':x:' ) +
                ' **Last capture**: [' + objLastCapture.name + '](' + objLastCapture.deployed.URL + objLastCapture.id + '/) (' + strCaptureAgo + ')\n' +
              ( objMember.physical_captures >= 500 ? ':white_check_mark:' : ':x:' ) +
                ' **Physical Captures**: ' +
                ( objMember.physical_captures > 500 ? '**500+**' : objMember.physical_captures.toLocaleString() ) + ' out of 500' +
                ( objMember.physical_captures > 500 ? '' : ' (' + ( Math.floor( ( objMember.physical_captures / 500 ) * 1000 ) / 10 ).toLocaleString() + '%)' )
            );
        } else {
          objZeeQRew
            .setThumbnail( objMember.avatar )
            .setTitle( '(Zee)QRew check result for: __' + strUserName + '__' )
            .setURL( 'https://www.munzee.com/m/' + strUserName + '/' )
            .setDescription( 'Oops, looks like there is no such user.' );
        }
        msgSent.edit( '(Zee)QRew qualification result:', { embed: objZeeQRew } ).catch( errEdit => { console.error( 'Error displaying final result of (Zee)QRew qualification check: ' + errEdit ); } );
      }
      break;
  default :
  /* Do nothing */
    if ( allowGreenie ) {
      var isBotMentioned = ( message.mentions.users.get( message.client.user.id )
        ? true
        : ( message.content.toLowerCase().indexOf( message.client.user.username.toLowerCase() ) !== -1
          ? true
          : false
        )
      );
      var owner = await message.client.fetchUser( settings[ bot ].owners[ 0 ] );
      if ( isBotMentioned && message.author.id !== message.client.id ) {
        allowGreenie = false;
        message.reply( 'did you need my assistance?  If so, please check my `!help` response for a list of things I can do.  If you think you\'ve recieved this message in error, please inform my owner, ' + owner + ' in my development guild: <https://discord.me/TheShoeStore>' );
      }
      message.client.setTimeout( function(){ allowGreenie = true; }, 3600000 );
    }
    if ( !message.author.bot ) {
      var arrFoundReacts = ( strArgs.match( /\b((1,?000 ?ho?u?r|42 ?day|6 ?we?e?k)s?|blast|coin[sz]?|cuppazee|facebook|munzstat|rovers?|socials?|youtube|flagstack|wallabee|geocach(er?|ing)?)\b/gi ) || [] );
      if ( arrFoundReacts.length > 0 ) {
        if ( !isDebug ) { console.log( '%s: I found  %d fun reaction keywords, [ "%s" ], in the string: %s', strNow(), arrFoundReacts.length, arrFoundReacts.join( '", "' ), strArgs ); }
        var arrDoReactionIDs = [], arrDoReactionNames = [];
        arrFoundReacts.forEach( async function( getReact ) {
          getReact = getReact.toLowerCase().replace( /( |,)/g, '' ).replace( /([sz]|e[dr]|ing)$/, '' ).replace( /ho?u?r/, 'hrs' ).replace( /we?e?k/, 'wks' ).replace( /\brov\b/, 'rover' );
          switch ( getReact ) {
            case '1000hrs': case '42day': case '6wks':
              arrDoReactionIDs.push( '495419263989972992' ); arrDoReactionNames.push( '1000hours' ); break;
            case 'blast':
              arrDoReactionIDs.push( '479663418895499268' ); arrDoReactionNames.push( 'blast' ); break;
            case 'coin':
              arrDoReactionIDs.push( '494972608245268480' ); arrDoReactionNames.push( 'Coinz' ); break;
            case 'cuppazee':
              arrDoReactionIDs.push( '708096310527393873' ); arrDoReactionNames.push( 'CuppaZee' ); break;
            case 'facebook':
              arrDoReactionIDs.push( '364781611679481856' ); arrDoReactionNames.push( 'Facebook' ); break;
            case 'flagstack':case 'geocach':case 'wallabee':
              arrDoReactionIDs.push( '520677636557635587' ); arrDoReactionNames.push( 'coexist' ); break;
            case 'munzstat':
              arrDoReactionIDs.push( '494974658144370689' ); arrDoReactionNames.push( 'MunzStat' ); break;
            case 'rover':
              arrDoReactionIDs.push( '495801408684163072' ); arrDoReactionNames.push( 'rover' ); break;
            case 'social':
              arrDoReactionIDs.push( '494972843063508992' ); arrDoReactionNames.push( 'social' ); break;
            case 'youtube':
              arrDoReactionIDs.push( '364781557887795200' ); arrDoReactionNames.push( 'YouTube' ); break;
            default :
              console.warn( '%s: Received an unrecognized getReact to react to: %s', strNow(), getReact );
          }
        } );
        arrDoReactionIDs = arrDoReactionIDs.reverse();
        arrDoReactionNames = arrDoReactionNames.reverse();
        if ( !isDebug ) { console.log( '%s: I will now attempt to react to the following fun reaction keywords in reverse order: %o (%o)', strNow(), arrDoReactionNames.length, arrDoReactionNames, arrDoReactionIDs ); }
        do {
          var doReactionID = await arrDoReactionIDs.pop(), doReactionName = await arrDoReactionNames.pop();
          if ( isDebug ) { console.log( '%s: Adding reaction `:%s:` to:\n\thttps://discordapp.com/channels/%s/%s/%s', strNow(), doReactionName, message.guild.id, message.channel.id, message.id ); }
          await message.react( doReactionID ).catch( errReact => {
            console.error( '%s: Unable to react with `:%s:` in %s: %o', strNow(), doReactionName, message.guild.name, errReact );
          } );
          if ( isDebug ) { console.warn( '%s: %d reactions left in: %o', strNow(), arrDoReactionIDs.length, arrDoReactionIDs ); }
        } while ( arrDoReactionIDs.length > 0 );
      }
    }
  }
} );

client.on( 'message', async message => {// Test section commands
  const isBot = message.author.bot;
  const isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
  const isBotMod = ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
  var isCrown = false, isAdmin = false, isSysop = false, isStaff = false, isMHQ = false, isThirdPartyDev = false;
  var canManage = false, canInvite = false;
  if ( message.guild && !isBot ) {
    var guild = message.guild;
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
    var sysopRole = guild.roles.get( ROLE.Administrator );
    isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    var staffRole = guild.roles.get( ROLE.Staff );
    isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    var mhqRole = guild.roles.get( ROLE.MHQ );
    isMHQ = await ( mhqRole && ( mhqRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    var thirdPartyDevRole = guild.roles.get( ROLE.ThirdPartyDev );
    isThirdPartyDev = await ( thirdPartyDevRole && ( thirdPartyDevRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    var objAuthorPerms = ( await guild.fetchMember( message.author.id ).catch( errFetchMbr => {
      console.error( '%s: Unable to fetch member for %s (%s): %o', strNow(), message.author.tag, message.author.id, errFetchMbr );
      console.log( '%s: message.author: %o\nmessage.guild.members.get( message.author.id ): %o', strNow(), message.author, message.guild.members.get( message.author.id ) );
    } ) ).permissions;
    canManage = ( objAuthorPerms.has( 'MANAGE_GUILD' ) ? true : false );
    canInvite = ( objAuthorPerms.has( 'CREATE_INSTANT_INVITE' ) ? true : false );
  }

  var command = message.content.replace( /  */g, ' ' ).split( ' ' );
  var arrArgs = [];
  if ( command[ 0 ].match( /<@!?(\d*)>/ ) ) {
    if ( command[ 0 ].match( /<@!?(\d*)>/ )[ 1 ] === client.user.id && command.length > 1 ) {
      arrArgs = command.slice( 2 );
      command = command[ 1 ].toLowerCase();
    } else {
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
  
  if ( isDebug && command && message.channel.type !== 'dm' ) { console.log( 'Attempting to respond to command in %s#%s (%s#%s): %o: %o', message.guild.name, message.channel.name, message.guild.id, message.channel.id, command, arrArgs ); }
  
  switch ( command ) {// TESTING SECTION
/* API TESTING SECTION *//* API TESTING SECTION *//* API TESTING SECTION *//* API TESTING SECTION *//* API TESTING SECTION *//*
    case 'api':
      if ( isOwner ) {
        var objToday = ( new Date() );
        var qMunzee = {
          url: 'https://api.munzee.com/oauth/login',
          apiClient: settings[ bot ].munzee,
          oauthToken: '464486990239367171',//message.author.id,
          log: './greenie/API logs/' + objToday.valueOf( ) + '.json'
        };
        var objUserAPI = qMunzee.apiClient.apiTokens[ qMunzee.oauthToken ];
        
        if ( objUserAPI.access_token !== null && objUserAPI.expires > objToday ) {
          await unirest.post( qMunzee.url )
          .send( {
            'client_id': qMunzee.apiClient.AppID,
            'client_secret': qMunzee.apiClient.AppSecret,
            'grant_type': 'authorization_code',
            'code': objUserAPI.code,
            'redirect_uri': 'https://Discord.me/greenie'
          } ).end( async function ( objAuth ) {
            var objAccessUser = await message.client.fetchUser( qMunzee.oauthToken );
            if ( objAuth.body.status_code === 401 ) {
  console.error( 'Attempting to access the Munzee API as ' + objAccessUser.tag + ' (ID:' + objAccessUser.id + ') failed with a ' + objAuth.body.status_code + ' response: ' + objAuth.body.status_text );
              message.channel.send( 'The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client. Please revalidate: https://api.munzee.com/oauth?response_type=code&scope=read&redirect_uri=https://Discord.me/greenie&client_id=' + qMunzee.apiClient.AppID );
            }
            else if ( objAuth.body.status_code !== 200 ) {
  console.error( 'Attempting to access the Munzee API as ' + objAccessUser.tag + ' (ID:' + objAccessUser.id + ') failed with a ' + objAuth.body.status_code + ' response: ' + objAuth.body.status_text );
            }
            else {
  console.log( objAuth.body );
              qMunzee.user_id = objAuth.body.data.token.user_id;
  console.log( qMunzee.user_id );
              qMunzee.authkey = objAuth.body.authkey;
  console.log( qMunzee.authkey );
              var strMunzee = JSON.stringify( qMunzee );
//              fs.writeFile( qMunzee.log, strMunzee, ( errWrite ) => {
//                if ( errWrite ) throw errWrite;
//                console.log( 'Created ' + qMunzee.log + ' with ` ' + strMunzee + '`' );
//              } );
  console.log( strMunzee );
            }
          } );
        }
      }
      break;
/* API TESTING SECTION *//* API TESTING SECTION *//* API TESTING SECTION *//* API TESTING SECTION *//* API TESTING SECTION */
/* SOCIAL LIBRARY TESTING *//* SOCIAL LIBRARY TESTING *//* SOCIAL LIBRARY TESTING *//* SOCIAL LIBRARY TESTING *//* SOCIAL LIBRARY TESTING *//*
    case 'social' :
      
      
      var objSocialEmbed = new Discord.RichEmbed()
        .setTitle( '2017-63 R.I.P. C.O. Joe Heddy' )
        .setURL( 'https://www.munzee.com/m/DarthMaulMax/3958/' )
        .setDescription(
          'Escambia County Department of Corrections, Florida\n\n' +
          'Correctional Officer\nJoe William Heddy, Jr.\n\n' +
          'Military Veteran\n\n' +
          'EO.W. June 17, 2017\n\n' +
          'Cause: Heart Attack\n\n' )
        .setThumbnail( 'https://munzee.global.ssl.fastly.net/images/avatars/ua3npw.png' )
        .setImage( 'https://munzee.global.ssl.fastly.net/images/social_munzees/j2ijs.png' );
      
      message.channel.send( 'Testing social embed layout:', { embed: objSocialEmbed } );
      break;
/* SOCIAL LIBRARY TESTING *//* SOCIAL LIBRARY TESTING *//* SOCIAL LIBRARY TESTING *//* SOCIAL LIBRARY TESTING *//* SOCIAL LIBRARY TESTING */
/* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING */
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
    case 'zeeops' :
      var strZeeOpsDescription = 'The battle between [The First Clan](https://www.munzeeblog.com/zeeops-august-missions/) and [The Rising Sons](https://www.munzeeblog.com/zeeops-february-2018-missions/) is looming, and it seems everyone is choosing allegiances. Although ZeeOps HQ is firmly a neutral party, it’s important we keep track of other possible factions. Look into the Authorized Reseller group known as R.U.M. for any possible collusion.\n\nWe have received intel that R.U.M. is kickstarting a bidding war between The First Clan and The Rising Sons. Despite their claims to stay neutral, this powerhouse of Authorized Resellers can tip the scales of war! It’s up to you to take control of the situation by capturing different RUMs (Reseller Unique Munzees) throughout the month.\n\nNovember 2018 ZeeOps Operations are now live and you can begin planning your Missions to start on the following day. You can plan your Operations at [munzee.com/ops/](https://munzee.com/ops) and purchase more ZeeCred in the [Freeze Tag Online Store](https://store.freezetag.com/products/zeecred). Remember that if you hit a snag at any point in your Operation you can use the new [Mission Mulligan](https://www.munzeeblog.com/zeeops-mission-mulligan-briefcase-munzee) feature to keep going!\n\nSince this month is focused on Resellers be sure to pop over to one of their stores to stock up on RUMs and everything else you could need. You can find the list of Authorized Resellers [HERE](https://www.munzee.com/retail/).';
      var objZeeOpRewards = {
        cadet: [ '25 ZeeCred' ],
        basic: [ '1 Briefcase Munzee', '1 Virtual', '2 RPS Munzee Credits', '1 Virtual Color Credit', '5 ZeeCred' ],
        advanced: [ '2 Briefcase Munzees', '2 Virtuals', '2 RPS Munzee Credits', '1 Prize Wheel Munzee Credit', '2 Virtual Color Credits', '10 ZeeCred' ],
        mega: [ '3 Briefcase Munzees', '4 Virtuals', '3 RPS Munzee Credits', '2 Prize Wheel Munzee Credit', '4 Color Credits', '25 ZeeCred' ],
        ultra: [ '4 Briefcase Munzees', '5 Virtuals', '4 RPS Munzee Credits', '3 Prize Wheel Munzee Credit', '1 Blast Capture', '5 Color Credits', '50 ZeeCred' ]
      };
      var objZeeOpMissions = {
        1: {
          'Basic Training +': 'Earn at least 1,000 points.',
          'Defensive Training': 'Deploy at least 10 munzees.',
          'Offensive Training': 'Capture at least 25 munzees.',
          'Rule Of RUM I': 'Capture at least 5 RUMs of any type.',
          'Rule Of RUM II': 'Deploy at least 2 RUMs of any type.'
        },
        2: {
          'Group Training +': 'Earn at least 1,000 cap-on points.',
          'Virtual Surreality': 'Capture at least 100 virtual munzees of any type.',
          'Sea Seekers': 'Capture at least 10 RUMs of any type.',
          'At The Helm': 'Deploy at least 5 RUMs of any type.',
          'Double Crossed!': 'Capture at least 5 and deploy at least 1 RUMs of any type.'
        },
        3: {
          'Advanced Training': 'Earn at least 10,000 points.',
          'Always Aware': 'Deploy at least 50 physical munzees of any type.',
          'RUM Repeaters': 'Capture at least 1 RUM from 5 different Resellers.',
          'Deep Zee Divers': 'Deploy at least 10 RUMs of any type.',
          'Green In The Face': 'Capture at least 20 and deploy at least 10 Greenies.'
        },
        4: {
          'Expert Training': 'Earn at least 50,000 points.',
          '“Z” Marks The Spot': 'Capture at least 15 RUMs of any type',
          'Triple Crossed!': 'Deploy at least 10 and capture at least 5 RUMs of any type.',
          'Yo Ho, Yo Ho!': 'Capture at least 50 Greenies.',
          'A Pirate’s Life For Zee': 'Capture at least 250 physical munzees of any type'
        }
      };
      
      const objZeeOpDescriptions = {
        cadet: 'As an Agent in training you\'ll want to complete the [Cadet Op](https://www.munzee.com/ops/new/-1) before moving on to more difficult operations. These missions feature the most basic of Munzee skills and the Operation can only be completed once.',
        basic: '[Basic Ops](https://www.munzee.com/ops/new/1) are for ZeeOps agents in training. These operations feature missions perfect for beginners. Includes only Level 1 Missions.',
        advanced: 'To agents that have mastered their training, [Advanced Ops](https://www.munzee.com/ops/new/5) should prove challenging. Includes Levels 1 and 2 Missions.',
        mega: 'Planning and patience will be key for agents hoping to tackle these [Mega Ops](https://www.munzee.com/ops/new/8). Includes Levels 1, 2 and 3 Missions. Agent must choose a minimum of two Level 3 Missions.',
        ultra: 'WARNING: Only the most expert of agents can handle these 2 week long operations. Featuring the most difficult missions, [Ultra Ops](https://www.munzee.com/ops/new/12) are not for novice agents. Includes Levels 1, 2, 3 and 4 Missions. Agent must choose a minimum of two Level 3 Missions and two Level 4 Missions.'
      };
      const objZeeOps = new Discord.RichEmbed()
        .setTitle( 'ZeeOps Dashboard:' )
        .setURL( 'https://www.munzee.com/ops/new' )
        .setColor( '#9E191E' )
        .setDescription( strZeeOpsDescription )
        .addField( 'Cadet Op', 'Duration: 3 days\nCost: Free, but can only be completed once per player\nRewards: ' + objZeeOpRewards.cadet.join( ', ' ) )
        .addField( 'Basic Op', 'Duration: 3 days\nCost: **25** Zee Creds\nRewards: ' + objZeeOpRewards.basic.join( ', ' ) )
        .addField( 'Advanced Op', 'Duration: 7 days\nCost: **50** Zee Creds\nRewards: ' + objZeeOpRewards.advanced.join( ', ' ) )
        .addField( 'Mega Op', 'Duration: 10 days\nCost: **100** Zee Creds\nRewards: ' + objZeeOpRewards.mega.join( ', ' ) )
        .addField( 'Ultra Op', 'Duration: 14 days\nCost: **250** Zee Creds\nRewards: ' + objZeeOpRewards.ultra.join( ', ' ) );
      message.channel.send( { embed: objZeeOps } );
      break;
    case 'getcaps':
      if ( isOwner ) {
        if ( isDebug ) { console.log('args: %o',arrArgs); }
        console.log( getCaptures( strUserName, ( JSON.parse( arrArgs[ 0 ] || false ) ) ) );
      }
      break;
/* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING *//* LOOKUP TESTING */
/* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING */
    case 'member': case 'player':
    case 'basic':
      if ( !isBot ) {
        message.delete( 3000 );
        var embedResult = new Discord.RichEmbed()
          .setTitle( 'Setting up: ' + strUserName )
          .setURL( 'https://www.munzee.com/m/' + strUserName + '/' )
          .setDescription( 'Looking up information... please wait...' );
        var msgSent = await message.channel.send( 'Collecting Basic Data: ' + strUserName, { embed: embedResult } );
        var objMunzeer = await getBasicPlayerData( message, strUserName, msgSent );
        
//        var objDiscordUser = message.guild.members.get( arrArgs[ 0 ].replace( /(<@!?|>)/g, '' ) );
//        if ( objDiscordUser !== undefined && objMunzeer.number_of_captures < 10 ) { sendReferralCode( objDiscordUser ); }
        
        var objMunzeerAge = {
          years: Math.floor( objMunzeer.age / 365.25 ),
          months: Math.floor( ( objMunzeer.age - ( Math.floor( objMunzeer.age / 365.25 ) * 365.25 ) ) / 30.4375 ),
          days: Math.round( objMunzeer.age - ( Math.floor( objMunzeer.age / 365.25 ) * 365.25 ) - ( Math.floor( ( objMunzeer.age - ( Math.floor( objMunzeer.age / 365.25 ) * 365.25 ) ) / 30.4375 ) * 30.4375 ) )
        };
        var strMunzeerAge = ( objMunzeerAge.years > 0 ? objMunzeerAge.years + ' year' + ( objMunzeerAge.years === 1 ? '' : 's' ) + ( objMunzeerAge.months > 0 && objMunzeerAge.days > 0 ? ', ' : ( objMunzeerAge.months > 0 || objMunzeerAge.days > 0 ? ' and ' : '' ) ) : '' ) + ( objMunzeerAge.months > 0 ? objMunzeerAge.months + ' month' + ( objMunzeerAge.months === 1 ? '' : 's' ) + ( objMunzeerAge.years > 0 && objMunzeerAge.days > 0 ? ', and ' : ( objMunzeerAge.days > 0 ? ' and ' : '' ) ) : '' ) + ( objMunzeerAge.days > 0 ? objMunzeerAge.days + ' day' + ( objMunzeerAge.days === 1 ? '' : 's' ) : '' );
        
        //Post result
        embedResult
          .setTitle( '**Handle:** ' + objMunzeer.handle )
          .setThumbnail( objMunzeer.avatar )
          .setDescription(
  //          '\n**Handle:** ' + objMunzeer.handle +
            '\n**Age:** ' + strMunzeerAge +
            '\n**Points:** ' + objMunzeer.points.toLocaleString() +
            '\n**Level:** ' + objMunzeer.level +
//            '\n**Premium:** ' + ( objMunzeer.isPremium ? ':star2: (expires:' + ( objMunzeer.premiumExpires ).toLocaleDateString( 'en-US', objTimeString ) + ')' : ':no_entry_sign: [Buy!](https://store.freezetag.com/products/munzee-premium-membership)' ) +
            '\n**Premium:** ' + ( objMunzeer.isPremium ? ':star2:' : ':no_entry_sign: [Buy!](https://store.freezetag.com/products/munzee-premium-membership)' ) +
            ( objMunzeer.strTitles ? '\n**Titles:** ' + objMunzeer.strTitles : '' ) +
            ( objMunzeer.clan.name ? '\n**Clan Name:** ' + objMunzeer.clan.name : '' ) +
            '\n**Recent:** ' + objMunzeer.strActivityBar
          );
        msgSent.edit( 'Player profile for: ' + strUserName + '\n:link: https://www.munzee.com/m/' + strUserName, { embed: embedResult } ).catch( errEdit => { console.error( 'Error displaying final result of basic player lookup: ' + errEdit ); } );
      }
      break;
    case 'clan':
    case 'clanwars':
      if ( !isBot ) {
        // Update monthly
        // Instead of manually defining battle #, month, year --- should have it calculated automatically from starting CW.
        var intBattleNumber = 68;
        var intPostNumber = 9917;//
        var strBattleMonth = 'November';//'December';
        var intBattleYear = 2018;
        var objClanWarLevels = {
          one: {
            individual: {
              capture: {
                points: 5000,
                streak: 5,
                jewels: 25,
                fauns: 0,
                leprechauns: 0,
                mermaids: 0,
                hydras: 0,
                yeti: 0,
                weapons: 0,
                virtuals: 0,
                iplaces: 1
              }
            },
            clan: {
              deploy: {
                greenie: 100,
                jewels: 0,
                weapons: 0,
                virtuals: 0
              },
              capture: {
                points: 75000,
                cplaces: 10,
                zodiacs: 0,
                nomads: 0,
                retiremyth: 0,
                pouch: 0
              }
            }
          },
          two: {
            individual: {
              capture: {
                points: 7500,
                streak: 8,
                jewels: 10,
                fauns: 0,
                leprechauns: 0,
                mermaids: 0,
                hydras: 0,
                yeti: 0,
                weapons: 0,
                virtuals: 10,
                iplaces: 2
              }
            },
            clan: {
              deploy: {
                greenie: 100,
                jewels: 0,
                weapons: 0,
                virtuals: 0
              },
              capture: {
                points: 125000,
                cplaces: 20,
                zodiacs: 100,
                nomads: 0,
                retiremyth: 0,
                pouch: 0
              }
            }
          },
          three: {
            individual: {
              capture: {
                points: 15000,
                streak: 10,
                jewels: 0,
                fauns: 0,
                leprechauns: 1,
                mermaids: 0,
                hydras: 0,
                yeti: 0,
                weapons: 20,
                virtuals: 25,
                iplaces: 5
              }
            },
            clan: {
              deploy: {
                greenie: 200,
                jewels: 0,
                weapons: 0,
                virtuals: 0
              },
              capture: {
                points: 225000,
                cplaces: 25,
                zodiacs: 50,
                nomads: 20,
                retiremyth: 0,
                pouch: 0
              }
            }
          },
          four: {
            individual: {
              capture: {
                points: 30000,
                streak: 17,
                jewels: 0,
                fauns: 1,
                leprechauns: 1,
                mermaids: 0,
                hydras: 0,
                yeti: 1,
                weapons: 20,
                virtuals: 25,
                iplaces: 10
              }
            },
            clan: {
              deploy: {
                greenie: 100,
                jewels: 50,
                weapons: 50,
                virtuals: 0
              },
              capture: {
                points: 475000,
                cplaces: 40,
                zodiacs: 50,
                nomads: 10,
                retiremyth: 20,
                pouch: 0
              }
            }
          },
          five: {
            individual: {
              capture: {
                points: 55000,
                streak: 21,
                jewels: 0,
                fauns: 1,
                leprechauns: 1,
                mermaids: 1,
                hydras: 1,
                yeti: 1,
                weapons: 20,
                virtuals: 25,
                iplaces: 10
              }
            },
            clan: {
              deploy: {
                greenie: 50,
                jewels: 50,
                weapons: 50,
                virtuals: 20
              },
              capture: {
                points: 700000,
                cplaces: 40,
                zodiacs: 50,
                nomads: 15,
                retiremyth: 25,
                pouch: 50
              }
            }
          },
          sequential: {
            individual: {
              capture: {
                points: 0,
                streak: 0,
                jewels: 0,
                fauns: 0,
                leprechauns: 0,
                mermaids: 0,
                hydras: 0,
                yeti: 0,
                weapons: 0,
                virtuals: 0,
                iplaces: 0
              }
            },
            clan: {
              deploy: {
                greenie: 0,
                jewels: 0,
                weapons: 0,
                virtuals: 0
              },
              capture: {
                points: 0,
                cplaces: 0,
                zodiacs: 0,
                nomads: 0,
                retiremyth: 0,
                pouch: 0
              }
            }
          }
        };
        var objClanWarRewards = {
          one: { mace: 1, longsword: 0, battleaxe: 0, hammer: 0, crossbow: 1, catapult: 0, blast: 0,
                virtual: 1, virtColor: 1, rps: 1, prizeWheel: 0, surprise: 0, diamond: 0, sapphire: 0, ruby: 0, virtEvo: 0 },
          two: { mace: 0, longsword: 1, battleaxe: 0, hammer: 0, crossbow: 2, catapult: 0, blast: 0,
                virtual: 2, virtColor: 2, rps: 0, prizeWheel: 1, surprise: 1, diamond: 1, sapphire: 0, ruby: 0, virtEvo: 0 },
          three: { mace: 1, longsword: 1, battleaxe: 0, hammer: 0, crossbow: 2, catapult: 0, blast: 0,
                virtual: 3, virtColor: 3, rps: 0, prizeWheel: 0, surprise: 0, diamond: 0, sapphire: 2, ruby: 0, virtEvo: 0 },
          four: { mace: 0, longsword: 0, battleaxe: 1, hammer: 0, crossbow: 1, catapult: 1, blast: 0,
                virtual: 3, virtColor: 3, rps: 0, prizeWheel: 1, surprise: 0, diamond: 0, sapphire: 0, ruby: 1, virtEvo: 0 },
          five: { mace: 0, longsword: 0, battleaxe: 2, hammer: 1, crossbow: 0, catapult: 2, blast: 1,
                virtual: 4, virtColor: 4, rps: 0, prizeWheel: 0, surprise: 0, diamond: 0, sapphire: 0, ruby: 0, virtEvo: 1 },
          sequential: { mace: 0, longsword: 0, battleaxe: 0, hammer: 0, crossbow: 0, catapult: 0, blast: 0,
                virtual: 0, virtColor: 0, rps: 0, prizeWheel: 0, surprise: 0, diamond: 0, sapphire: 0, ruby: 0, virtEvo: 0 }
        };
        var strDesc = ' We tried [something new last month](https://www.munzeeblog.com/october-2018-clan-requirements/), but there are still some kinks that need ironed out.\n**UPDATE:** WE REMOVED A LINE PEOPLE COULDN’T UNDERSTAND HERE.\nYou do not need to complete the levels sequentially in order to earn the rewards.\n**UPDATE:** CHOOSE A LEVEL. COMPLETE THE REQUIREMENTS. EARN THE REWARDS.\n\nRequirements this month are based on both individual and Clan activity, so you’ll need to work together and hold one another accountable.';
        
        // Only update if new requirement/reward names
        const objRequirementNameS = {
          individual: 'Individual', clan: 'Clan', capture: 'Capture', deploy: 'Deploy', points: 'point', streak: 'day streak',
          jewels: 'jewel', weapons: 'clan weapon', virtuals: 'virtual munzee', greenie: 'greenie', zodiacs: 'zodiac',
          fauns: 'faun', leprechauns: 'leprechaun',  mermaids: 'mermaid', hydras: 'hydra', yeti: 'yeti',
          nomads: 'nomad', retiremyth: 'retiremyth', pouch: 'pouch creature', cplaces: 'different place', iplaces: 'place'
        };
        const objRequirementNameP = {
          points: 'points', streak: 'day streak', cplaces: 'different places', iplaces: 'places (can cap same one)',
          jewels: 'jewels', weapons: 'clan weapons', virtuals: 'virtual munzees', greenie: 'greenies', zodiacs: 'zodiacs',
          fauns: 'fauns', leprechauns: 'leprechauns',  mermaids: 'mermaids', hydras: 'hydras', yeti: 'yeti',
          nomads: 'nomads', retiremyth: 'retiremyths', pouch: 'pouch creatures'
        };
        const objRewardNameS = {
          mace: 'mace', longsword: 'longsword', battleaxe: 'Battle Axe', hammer: 'The Hammer', crossbow: 'crossbow',
          catapult: 'catapult', blast: 'blast capture', virtual: 'virtual', virtColor: 'virtual color credit',
          rps: 'RPS credit', prizeWheel: 'prize wheel', surprise: 'Surprise', virtEvo: 'Virtual Evolution Munzepack',
          diamond: 'diamond credit', sapphire: 'sapphire credit', ruby: 'ruby credit'
        };
        const objRewardNameP = {
          mace: 'maces', longsword: 'longswords', battleaxe: 'Battle Axes', hammer: 'The Hammers', crossbow: 'crossbows',
          catapult: 'catapults', blast: 'blast captures', virtual: 'virtuals', virtColor: 'virtual color credits',
          rps: 'RPS credits', prizeWheel: 'prize wheels', surprise: 'Surprises', virtEvo: 'Virtual Evolution Munzepacks',
          diamond: 'diamond credits', sapphire: 'sapphire credits', ruby: 'ruby credits'
        };
        
        // Don't touch
        const arrLevels = [ 'zero', 'one', 'two', 'three', 'four', 'five' ];
        const strDescHeader = '[Clan Battle #' + intBattleNumber + '](https://www.munzee.com/clans/battle/' + intBattleNumber + '/) will start ' + strBattleMonth + ' 3 at 00:01 MHQ!';
        const strDescFooter = '\n\nIf you would like to join a clan for the first time or want to find a new clan you can use our [Clan Randomizer button](http://www.munzee.com/clans), but it is only available from 00:01 ' + strBattleMonth + ' 1 through 23:59 ' + strBattleMonth + ' 2 so act fast!';
        const strBlogzeeURL = 'https://www.munzeeblog.com/' + strBattleMonth.toLowerCase() + '-' + intBattleYear + '-clan-requirements/#post-' + intPostNumber;
        var objClanWars = new Discord.RichEmbed()
          .setTitle( strBattleMonth + ' ' + intBattleYear + ' Clan Requirements:' )
          .setURL( strBlogzeeURL )
          .setColor( '#225538' );

        var arrClanLevelsRequested = [];
        if ( arrArgs.indexOf( '1' ) !== -1 ) { arrClanLevelsRequested.push( 1 ); }
        if ( arrArgs.indexOf( '2' ) !== -1 ) { arrClanLevelsRequested.push( 2 ); }
        if ( arrArgs.indexOf( '3' ) !== -1 ) { arrClanLevelsRequested.push( 3 ); }
        if ( arrArgs.indexOf( '4' ) !== -1 ) { arrClanLevelsRequested.push( 4 ); }
        if ( arrArgs.indexOf( '5' ) !== -1 ) { arrClanLevelsRequested.push( 5 ); }
        
        if ( arrArgs.indexOf( '1' ) !== -1 ) {
          var strClanRewards = '';
          var intPrizeIndex = 0;
          for ( var prize in objClanWarRewards[ arrLevels[ 1 ] ] ) {
            var intCount = objClanWarRewards[ arrLevels[ 1 ] ][ prize ];
            if ( intCount > 0 ) {
              strClanRewards += ( strClanRewards !== '' ? ' - ' : '' ) + intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRewardNameS[ prize ] : objRewardNameP[ prize ] );
              objClanWarRewards.sequential[ prize ] += intCount;
            }
            intPrizeIndex++;
          }
          var strClanRequirements = '';
          for ( var strGroup in objClanWarLevels[ arrLevels[ 1 ] ] ) {
            strClanRequirements += ( strClanRequirements !== '' ? '\n' : '' ) + '**' + objRequirementNameS[ strGroup ] + '**:\n';
            for ( var strCapOrDeploy in objClanWarLevels[ arrLevels[ 1 ] ][ strGroup ] ) {
              strClanRequirements += '🔸 ' + objRequirementNameS[ strCapOrDeploy ] + '\n🔸🔸 ';
              var arrLevelRequirements = [];
              for ( var strNumberOfType in objClanWarLevels[ arrLevels[ 1 ] ][ strGroup ][ strCapOrDeploy ] ) {
                var intCount = objClanWarLevels[ arrLevels[ 1 ] ][ strGroup ][ strCapOrDeploy ][ strNumberOfType ];
                if ( intCount > 0 ) {
                  arrLevelRequirements.push( intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRequirementNameS[ strNumberOfType ] : objRequirementNameP[ strNumberOfType ] ) );
                  if ( intCount > objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] ) {
                    objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] = intCount;
                  }
                }
              }
              strClanRequirements += arrLevelRequirements.join( ', ' ) + '\n';
            }
          }
          if (  arrClanLevelsRequested.length === 1 ) {
            objClanWars
              .addField( 'Level :' + arrLevels[ 1 ] + ': Requirements:', strClanRequirements )
              .addField( 'Level :' + arrLevels[ 1 ] + ': Rewards:', ':heavy_minus_sign:\t' + strClanRewards );
          }
        }
        if ( arrArgs.indexOf( '2' ) !== -1 ) {
          var strClanRewards = '';
          var intPrizeIndex = 0;
          for ( var prize in objClanWarRewards[ arrLevels[ 2 ] ] ) {
            var intCount = objClanWarRewards[ arrLevels[ 2 ] ][ prize ];
            if ( intCount > 0 ) {
              strClanRewards += ( strClanRewards !== '' ? ' - ' : '' ) + intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRewardNameS[ prize ] : objRewardNameP[ prize ] );
              objClanWarRewards.sequential[ prize ] += intCount;
            }
            intPrizeIndex++;
          }
          var strClanRequirements =  '';
          for ( var strGroup in objClanWarLevels[ arrLevels[ 2 ] ] ) {
            strClanRequirements += ( strClanRequirements !== '' ? '\n' : '' ) + '**' + objRequirementNameS[ strGroup ] + '**:\n';
            for ( var strCapOrDeploy in objClanWarLevels[ arrLevels[ 2 ] ][ strGroup ] ) {
              strClanRequirements += '🔸 ' + objRequirementNameS[ strCapOrDeploy ] + '\n🔸🔸 ';
              var arrLevelRequirements = [];
              for ( var strNumberOfType in objClanWarLevels[ arrLevels[ 2 ] ][ strGroup ][ strCapOrDeploy ] ) {
                var intCount = objClanWarLevels[ arrLevels[ 2 ] ][ strGroup ][ strCapOrDeploy ][ strNumberOfType ];
                if ( intCount > 0 ) {
                  arrLevelRequirements.push( intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRequirementNameS[ strNumberOfType ] : objRequirementNameP[ strNumberOfType ] ) );
                  if ( intCount > objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] ) {
                    objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] = intCount;
                  }
                }
              }
              strClanRequirements += arrLevelRequirements.join( ', ' ) + '\n';
            }
          }
          if (  arrClanLevelsRequested.length === 1 ) {
            objClanWars
              .addField( 'Level :' + arrLevels[ 2 ] + ': Requirements:', strClanRequirements )
              .addField( 'Level :' + arrLevels[ 2 ] + ': Rewards:', ':heavy_minus_sign:\t' + strClanRewards );
          }
        }
        if ( arrArgs.indexOf( '3' ) !== -1 ) {
          var strClanRewards = '';
          var intPrizeIndex = 0;
          for ( var prize in objClanWarRewards[ arrLevels[ 3 ] ] ) {
            var intCount = objClanWarRewards[ arrLevels[ 3 ] ][ prize ];
            if ( intCount > 0 ) {
              strClanRewards += ( strClanRewards !== '' ? ' - ' : '' ) + intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRewardNameS[ prize ] : objRewardNameP[ prize ] );
              objClanWarRewards.sequential[ prize ] += intCount;
            }
            intPrizeIndex++;
          }
          var strClanRequirements =  '';
          for ( var strGroup in objClanWarLevels[ arrLevels[ 3 ] ] ) {
            strClanRequirements += ( strClanRequirements !== '' ? '\n' : '' ) + '**' + objRequirementNameS[ strGroup ] + '**:\n';
            for ( var strCapOrDeploy in objClanWarLevels[ arrLevels[ 3 ] ][ strGroup ] ) {
              strClanRequirements += '🔸 ' + objRequirementNameS[ strCapOrDeploy ] + '\n🔸🔸 ';
              var arrLevelRequirements = [];
              for ( var strNumberOfType in objClanWarLevels[ arrLevels[ 3 ] ][ strGroup ][ strCapOrDeploy ] ) {
                var intCount = objClanWarLevels[ arrLevels[ 3 ] ][ strGroup ][ strCapOrDeploy ][ strNumberOfType ];
                if ( intCount > 0 ) {
                  arrLevelRequirements.push( intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRequirementNameS[ strNumberOfType ] : objRequirementNameP[ strNumberOfType ] ) );
                  if ( intCount > objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] ) {
                    objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] = intCount;
                  }
                }
              }
              strClanRequirements += arrLevelRequirements.join( ', ' ) + '\n';
            }
          }
          if (  arrClanLevelsRequested.length === 1 ) {
            objClanWars
              .addField( 'Level :' + arrLevels[ 3 ] + ': Requirements:', strClanRequirements )
              .addField( 'Level :' + arrLevels[ 3 ] + ': Rewards:', ':heavy_minus_sign:\t' + strClanRewards );
          }
        }
        if ( arrArgs.indexOf( '4' ) !== -1 ) {
          var strClanRewards = '';
          var intPrizeIndex = 0;
          for ( var prize in objClanWarRewards[ arrLevels[ 4 ] ] ) {
            var intCount = objClanWarRewards[ arrLevels[ 4 ] ][ prize ];
            if ( intCount > 0 ) {
              strClanRewards += ( strClanRewards !== '' ? ' - ' : '' ) + intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRewardNameS[ prize ] : objRewardNameP[ prize ] );
              objClanWarRewards.sequential[ prize ] += intCount;
            }
            intPrizeIndex++;
          }
          var strClanRequirements =  '';
          for ( var strGroup in objClanWarLevels[ arrLevels[ 4 ] ] ) {
            strClanRequirements += ( strClanRequirements !== '' ? '\n' : '' ) + '**' + objRequirementNameS[ strGroup ] + '**:\n';
            for ( var strCapOrDeploy in objClanWarLevels[ arrLevels[ 4 ] ][ strGroup ] ) {
              strClanRequirements += '🔸 ' + objRequirementNameS[ strCapOrDeploy ] + '\n🔸🔸 ';
              var arrLevelRequirements = [];
              for ( var strNumberOfType in objClanWarLevels[ arrLevels[ 4 ] ][ strGroup ][ strCapOrDeploy ] ) {
                var intCount = objClanWarLevels[ arrLevels[ 4 ] ][ strGroup ][ strCapOrDeploy ][ strNumberOfType ];
                if ( intCount > 0 ) {
                  arrLevelRequirements.push( intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRequirementNameS[ strNumberOfType ] : objRequirementNameP[ strNumberOfType ] ) );
                  if ( intCount > objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] ) {
                    objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] = intCount;
                  }
                }
              }
              strClanRequirements += arrLevelRequirements.join( ', ' ) + '\n';
            }
          }
          if (  arrClanLevelsRequested.length === 1 ) {
            objClanWars
              .addField( 'Level :' + arrLevels[ 4 ] + ': Requirements:', strClanRequirements )
              .addField( 'Level :' + arrLevels[ 4 ] + ': Rewards:', ':heavy_minus_sign:\t' + strClanRewards );
          }
        }
        if ( arrArgs.indexOf( '5' ) !== -1 ) {
          var strClanRewards = '';
          var intPrizeIndex = 0;
          for ( var prize in objClanWarRewards[ arrLevels[ 5 ] ] ) {
            var intCount = objClanWarRewards[ arrLevels[ 5 ] ][ prize ];
            if ( intCount > 0 ) {
              strClanRewards += ( strClanRewards !== '' ? ' - ' : '' ) + intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRewardNameS[ prize ] : objRewardNameP[ prize ] );
              objClanWarRewards.sequential[ prize ] += intCount;
            }
            intPrizeIndex++;
          }
          var strClanRequirements =  '';
          for ( var strGroup in objClanWarLevels[ arrLevels[ 5 ] ] ) {
            strClanRequirements += ( strClanRequirements !== '' ? '\n' : '' ) + '**' + objRequirementNameS[ strGroup ] + '**:\n';
            for ( var strCapOrDeploy in objClanWarLevels[ arrLevels[ 5 ] ][ strGroup ] ) {
              strClanRequirements += '🔸 ' + objRequirementNameS[ strCapOrDeploy ] + '\n🔸🔸 ';
              var arrLevelRequirements = [];
              for ( var strNumberOfType in objClanWarLevels[ arrLevels[ 5 ] ][ strGroup ][ strCapOrDeploy ] ) {
                var intCount = objClanWarLevels[ arrLevels[ 5 ] ][ strGroup ][ strCapOrDeploy ][ strNumberOfType ];
                if ( intCount > 0 ) {
                  arrLevelRequirements.push( intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRequirementNameS[ strNumberOfType ] : objRequirementNameP[ strNumberOfType ] ) );
                  if ( intCount > objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] ) {
                    objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ] = intCount;
                  }
                }
              }
              strClanRequirements += arrLevelRequirements.join( ', ' ) + '\n';
            }
          }
          if (  arrClanLevelsRequested.length === 1 ) {
            objClanWars
              .addField( 'Level :' + arrLevels[ 5 ] + ': Requirements:', strClanRequirements )
              .addField( 'Level :' + arrLevels[ 5 ] + ': Rewards:', ':heavy_minus_sign:\t' + strClanRewards );
          }
        }
        if ( arrClanLevelsRequested.length > 1 ) {
          var strClanRewards = '';
          var intPrizeIndex = 0;
          for ( var prize in objClanWarRewards.sequential ) {
            var intCount = objClanWarRewards.sequential[ prize ];
            if ( intCount > 0 ) {
              strClanRewards += ( strClanRewards !== '' ? ' - ' : '' ) + intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRewardNameS[ prize ] : objRewardNameP[ prize ] );
            }
            intPrizeIndex++;
          }
          var strClanRequirements = '';
          for ( var strGroup in objClanWarLevels.sequential ) {
            strClanRequirements += ( strClanRequirements !== '' ? '\n' : '' ) + '**' + objRequirementNameS[ strGroup ] + '**:\n';
            for ( var strCapOrDeploy in objClanWarLevels.sequential[ strGroup ] ) {
              strClanRequirements += '🔸 ' + objRequirementNameS[ strCapOrDeploy ] + '\n🔸🔸 ';
              var arrLevelRequirements = [];
              for ( var strNumberOfType in objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ] ) {
                var intCount = objClanWarLevels.sequential[ strGroup ][ strCapOrDeploy ][ strNumberOfType ];
                if ( intCount > 0 ) {
                  arrLevelRequirements.push( intCount.toLocaleString() + ' ' + ( intCount === 1 ? objRequirementNameS[ strNumberOfType ] : objRequirementNameP[ strNumberOfType ] ) );
                }
              }
              strClanRequirements += arrLevelRequirements.join( ', ' ) + '\n';
            }
          }
          objClanWars
            .setDescription( '**Consolidated requirements for levels:** ' + arrClanLevelsRequested.join( ' - ' ) )
            .addField( 'Your Requirements:', strClanRequirements )
            .addField( 'Your Rewards:', ':heavy_minus_sign:\t' + strClanRewards );
        }
        if ( arrClanLevelsRequested.length < 1 ) {
          objClanWars
            .setDescription( strDescHeader + strDesc + strDescFooter );
        }
        message.channel.send( 'Requested information for: ' + arrArgs.join( '-' ) , { embed: objClanWars } );
// SHOULDN'T NEED TO EDIT ABOVE HERE EXCEPT TO ADD NEW REQUIREMENT/REWARD NAMES
      }
      break;
    case 'munzee':
      if ( isOwner || isBotMod || isCrown || isSysop || isStaff ) {
        if ( isDebug ) { console.log('args: %o',arrArgs); }// TEST PAGE (archived): !munzee https://www.munzee.com/m/technical13/1/GZF207/
        message.delete( { reason: 'Delete request for munzee data.' } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ': ' + errDel ); } );
        var embedResult = new Discord.RichEmbed()
          .setTitle( 'Collecting munzee data...' )
          .setDescription( 'Looking up information... please wait...' );
        var msgMunzeeInfo = await message.channel.send( 'Collecting munzee data...', { embed: embedResult } );
        if ( arrArgs[ 0 ] ) {
          const arrMunzee = arrArgs[ 0 ].split( '/' ).filter( p => p.length >=1 );
          const strMunzeeCode = ( isNaN( arrMunzee[ arrMunzee.length - 1 ] ) ? arrMunzee[ arrMunzee.length - 1 ] : null );
          const strPlayerDeploy = ( isNaN( arrMunzee[ arrMunzee.length - 1 ] ) ? arrMunzee[ arrMunzee.length - 2 ] : arrMunzee[ arrMunzee.length - 1 ] );
          const strPlayerName = ( isNaN( arrMunzee[ arrMunzee.length - 1 ] ) ? arrMunzee[ arrMunzee.length - 3 ] : arrMunzee[ arrMunzee.length - 2 ] );
          const strMunzeeID = strPlayerName + '/' + strPlayerDeploy + ( strMunzeeCode ? '/' + strMunzeeCode : '' );console.log( 'strMunzeeID: %o', strMunzeeID );
          var objMunzee = await getMunzeeData( message, strMunzeeID, msgMunzeeInfo );
          // Post result
          var munzeeMember = message.guild.members.map( user => { if ( user.nickname !== null ) { if ( user.nickname.toLowerCase() === objMunzee.ownerName.toLowerCase() ) { return user.id } } else if ( user.user.username !== null ) { if ( user.user.username.toLowerCase() === objMunzee.ownerName.toLowerCase() ) { return user.id } } } ).filter( function( user ) { if ( user ) { return user; } } );
          if ( objMunzee.whoFTC ) {
            var munzeeFTC = message.guild.members.map( user => { if ( user.nickname !== null ) { if ( user.nickname.toLowerCase() === objMunzee.whoFTC.toLowerCase() ) { return user.id } } else if ( user.user.username !== null ) { if ( user.user.username.toLowerCase() === objMunzee.whoFTC.toLowerCase() ) { return user.id } } } ).filter( function( user ) { if ( user ) { return user; } } );
          }
          embedResult
            .setTitle( objMunzee.name )
            .setURL( 'https://www.munzee.com/m/' + objMunzee.ownerName + '/' + objMunzee.deployNumber + '/' )
            .setThumbnail( objMunzee.avatar )
            .setDescription(
              '**' + ( objMunzee.isArchived ? 'Archived' : 'Deployed' ) + '**: ' + ( new Date( objMunzee.statusDate ) ).toLocaleDateString( 'en-US', objTimeStringHQ ) +
              '\n\n**By:** [' + objMunzee.ownerName + '](https://www.munzee.com/m/' + objMunzee.ownerName + '/)' + ( munzeeMember.length !== 0 ? ' (<@' + munzeeMember[ 0 ] + '>)' : '' ) +
              '\n**Hosting:** ' + ( objMunzee.isHosting ? '[' + objMunzee.hostedMunzee.name + '](' + objMunzee.hostedMunzee.URL + ')' : 'false' ) +
              '\n**Rover' + ( objMunzee.hasRover.length === 1 ? '' : 's' ) + ':** ' + ( objMunzee.hasRover.length === 0 ? '*none*' : objMunzee.hasRover.length ) +
              '\n**First to Cap:** ' + ( objMunzee.whoFTC ? '[' + objMunzee.whoFTC + '](https://www.munzee.com/m/' + objMunzee.whoFTC + '/)' + ( munzeeFTC.length !== 0 ? ' (<@' + munzeeFTC[ 0 ] + '>)' : '' ) : 'Uncaptured!' ) +
              ( objMunzee.captures.length === 0 ? '' : '\n**Captures:** ' + objMunzee.captures.length )
            );
          if ( objMunzee.isSocial ) {
            embedResult.setImage( objMunzee.socialImage );
          }
          else if ( objMunzee.isMyth ) {
            console.log( '%s: !munzee %s/%s is a myth:\n\t%o', strNow(), objMunzee.ownerName, objMunzee.deployNumber, 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/url-' + encodeURIComponent( objMunzee.avatar ) + '(' + objMunzee.mythData.lng + ',' + objMunzee.mythData.lat + ')/' + objMunzee.mythData.lng + ',' + objMunzee.mythData.lat + ',9,0,0/600x600?access_token=' + settings[ bot ].mapbox.key );
            embedResult.setImage( 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/url-' + encodeURIComponent( objMunzee.avatar ) + '(' + objMunzee.mythData.lng + ',' + objMunzee.mythData.lat + ')/' + objMunzee.mythData.lng + ',' + objMunzee.mythData.lat + ',9,0,0/600x600?access_token=' + settings[ bot ].mapbox.key )
          }
          msgMunzeeInfo.edit( 'Munzee data for: ' + ( objMunzee.error || '' ), { embed: embedResult } ).catch( errEdit => { console.error( 'Error displaying final result of munzee lookup: ' + errEdit ); } );
        }
        else {
          var objMunzee = await getMunzeeData( message, null, msgMunzeeInfo );
          embedResult
            .setTitle( ( objMunzee.error === 404 ? 'No munzee specified!' : '`' + objMunzee.error + '` error!' ) )
            .setURL( 'https://www.munzee.com/404' )
            .setThumbnail( objMunzee.avatar )
            .setDescription( 'You failed to specify a munzee to look up.' );
          msgMunzeeInfo.edit( 'Munzee data for: **' + ( objMunzee.error === 404 ? 'No munzee specified!' : '`' + objMunzee.error + '` error!' ) + '**', { embed: embedResult } ).catch( errEdit => { console.error( 'Error displaying final result of munzee lookup: ' + errEdit ); } );
        }
      }
      break;
    case 'bdtest':
      if ( isOwner ) {
        if ( isDebug ) { console.log( 'args: %o', arrArgs ); }
        var objGuilds = {};
        for ( var guild in message.client.guilds ) {
          var objMember = await guild.members.get( message.author.id );
          if ( objMember !== undefined ) {
            objGuilds[ strGuildID ] = await {
              name: guild.name,
              owner: await guild.members.get( guild.ownerID ),
              icon: guild.icon,
              members: guild.memberCount,
              joinedTimestamp: objMember.joinedTimestamp,
              nickname: objMember.nickname,
              roles: objMember.roles,
              lastMessage: objMember.lastMessage
            };
          }
        }
        var objDiscordUser = {
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator,
          tag: message.author.tag,
          avatar: message.author.avatar,
          bot: message.author.bot,
          guilds: objGuilds
        };
        if ( isDebug ) { console.log( objDiscordUser ); }/*
        var embedResult = new Discord.RichEmbed()
          .setTitle( 'Setting up: ' + strUserName )
          .setURL( 'https://www.munzee.com/m/' + strUserName + '/' )
          .setDescription( 'Looking up information... please wait...' );
        var msgSent = await message.channel.send( 'Collecting Basic Data: ' + strUserName, { embed: embedResult } );
        var objMunzeer = await getBasicPlayerData( message, strUserName, msgSent );
        if ( strUserName !== objMunzeer.handle && message.guild ) {
          message.guild.members.get( message.author.id )
            .setNickname( objMunzeer.handle, 'Synchronizing with Munzee player name.' )
            .catch( errSetNick => {
              console.error( 'Unable to set ' + objDiscordUser.guild[ message.guild.id ].tag + '\'s nickname in ' + message.guild.name + ': ' + errSetNick );
            } );
        }
        //Post result
        embedResult
          .setThumbnail( objMunzeer.avatar )
          .setDescription(
            '\n**Handle:** ' + objMunzeer.handle +
            '\n**Points:** ' + objMunzeer.points.toLocaleString() +
            '\n**Level:** ' + objMunzeer.level +
            '\n**Premium:** ' + ( objMunzeer.isPremium ? ':star2:' : ':no_entry_sign: [Buy!](https://store.freezetag.com/products/munzee-premium-membership)' ) +
            '\n**Titles:** ' + ( objMunzeer.strTitles || 'None' ) +
            '\n**Clan Name:** ' + ( objMunzeer.clan.name || 'None' )
          );
        msgSent.edit( 'Player profile for: ' + strUserName + '\n:link: https://www.munzee.com/m/' + strUserName, { embed: embedResult } ).catch( errEdit => { console.error( 'Error displaying final result of (Zee)QRew qualification check: ' + errEdit ); } );//*/
      }
      break;
/* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING *//* USER PUPPETEER TESTING */
/* GET PLAYERNAME TESTING *//* GET PLAYERNAME TESTING *//* GET PLAYERNAME TESTING *//* GET PLAYERNAME TESTING *//* GET PLAYERNAME TESTING */
    case 'getnames':
      if ( isOwner || isBotMod ) {
        var arrNames = strArgs.replace( /^\[? ?['"](.*?)["'] ?\]?$/, '$1' ).trim().split( /['"][,;] ?["']/ );
        if ( isDebug ) { console.log( '%s: `!getnames` has array: %o', strNow(), arrNames ); }
        for ( var intIndex in arrNames ) {
          if ( intIndex < arrNames.length ) {
            if ( isDebug ) { console.log( '%s: `!getnames` is looking up: %s', strNow(), arrNames[ intIndex ] ); }
            arrNames[ intIndex ] = await getPlayerName( arrNames[ intIndex ] );
          }
        }
        message.channel.send( 'Case sensitive player names for requested values:\n```\n\'' + arrNames.join( '\',\'' ) + '\'\n```' );
      }
      break;
/* GET PLAYERNAME TESTING *//* GET PLAYERNAME TESTING *//* GET PLAYERNAME TESTING *//* GET PLAYERNAME TESTING *//* GET PLAYERNAME TESTING */
    case 'getbadges':
    if ( isOwner ) {
      var objBadges = await getTitleBadges( strUserName );
      message.channel.send( objBadges ).catch( errSend => { console.log( '%s: getTitleBadges( %s ) returned: %o\nERROR: %o', strNow(), strUserName, objBadges, errSend ); } );
    }
    break;
    case 'qqr' :
      if ( ( isOwner || isBotMod || isCrown || isSysop || isStaff )  && !isBot ) {
        message.delete();
        message.channel.send( 'https://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent( strArgs ) );
      }
      break;
    case '8ball' :
      if ( !isBot ) {
        if ( !strArgs || strArgs === '' ) { message.delete( { reason: 'Delete request for munzee data.' } ).catch( errDel => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ': ' + errDel ); } ); }
        
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
    case 'maplink':
      if ( !isBot && isOwner ){
        message.delete( 2000 ).catch( errDel => { console.error( 'Unable to delete %s command from %s#%s: %o', command, message.guild.name, message.channel.name, errDel ); } );
         message.channel.send( 'geohash function not currently installed.' );
      } else if ( !isBot ) {
        message.delete( 2000 ).catch( errDel => { console.error( 'Unable to delete %s command from %s#%s: %o', command, message.guild.name, message.channel.name, errDel ); } );
        if ( arrArgs.length >= 2 ) {
          var geoHashLoc = ( new geohash() ).encode( parseFloat( arrArgs[ 0 ] ), parseFloat( arrArgs[ 1 ] ), 9 );console.log('geoHashLoc: %o',geoHashLoc);
          const zoomLevel = parseFloat( arrArgs[ 2 ] || 18 );console.log('zoomLevel: %o',zoomLevel);
          message.channel.send( 'Map with center coordinates of `' + parseFloat( arrArgs[ 0 ] ) + '`, `' + parseFloat( arrArgs[ 1 ] ) + ' and a zoom level of `' + zoomLevel + '` can be viewed: <https://www.munzee.com/map/' + geoHashLoc + '/' + zoomLevel + '>' );
        }
      }
      break;
    case 'getmap':
      if ( isOwner ) {
        if ( arrArgs.length >= 2 ) {
          const basePage = 'https://www.munzee.com/map/';
          var geoHashLoc = ( new geohash() ).encode( parseFloat( arrArgs[ 0 ] ), parseFloat( arrArgs[ 1 ] ), 9 );
          const zoomLevel = parseFloat( arrArgs[ 2 ] || 18 );
          console.log( 'Attempting to screenshot page: %o', basePage + geoHashLoc + '/' + zoomLevel );
          const browser = await puppeteer.launch( { headless: false } );
          const page = await browser.newPage( );
          await page.goto( basePage + geoHashLoc + '/' + zoomLevel );
          await page.evaluate( async () => {
            await $( 'body' ).html( $( 'div.panel-body' ) );
          } );
          await page.waitFor( 15000 );
          await page.screenshot( { path: strScreenShotPath + 'getMap.png' } );
          await page.close();
          await browser.close();
        }
      }
      break;
    case 'screenshot' :
      if ( isOwner ) {
        const browser = await puppeteer.launch( { headless: false } );
        const page = await browser.newPage( );
        await page.goto( strArgs );
        await page.waitFor( 15000 );
        await page.screenshot( { path: strScreenShotPath + 'screenshot.png' } );
        await page.close();
        await browser.close();

        const headlessBrowser = await puppeteer.launch( );
        const headlessPage = await headlessBrowser.newPage( );
        await headlessPage.goto( strArgs );
        await headlessPage.waitFor( 15000 );
        await headlessPage.screenshot( { path: strScreenShotPath + 'screenshot_headless.png' } );
        await headlessPage.close();
        await headlessBrowser.close();
        
        message.channel.send( 'Screenshot of: ' + strArgs, { files: [ { attachment: strScreenShotPath + 'screenshot.png', name: 'non-headless.png' }, { attachment: strScreenShotPath + 'screenshot_headless.png', name: 'headless.png' }  ] } );
      }
      break;
    case 'alert' :
      message.delete();
      if ( !isBot && arrArgs.length >= 2 ) {
        let objAlert = { distKM: parseFloat( arrArgs[ 0 ] ) };
        if ( arrArgs.length === 2 ) {
          let pinMunzee = await getMunzeeData( message, arrArgs[ 1 ] );
          objAlert.lat = parseFloat( pinMunzee.mapLocation.lat );
          objAlert.lng = parseFloat( pinMunzee.mapLocation.lng );
        } else if ( arrArgs.length === 3 ) {
          objAlert.lat = parseFloat( arrArgs[ 1 ] );
          objAlert.lng = parseFloat( arrArgs[ 2 ] );
        }
        sendDM( message, client.users.get( '173496373520498688' ), '**' + message.author.username + '#' + message.author.discriminator + '** (' + message.author + ') has requested grub alerts within ' + objAlert.distKM + 'km of ' + objAlert.lat + ', ' + objAlert.lng );
      } else if ( !isBot ) {
        message.channel.send( 'You can request grub alerts from **' + client.users.get( '173496373520498688' ).tag + '**\'s **' + client.users.get( '500246611591430145' ).username + '`[BOT]`** using one of the following formats:\n:arrow_right: `!alert <distance in km> <latitude> <longitude>`\n:arrow_right: `!alert <distance in km> <URL of nearby Munzee to center on>`' );
      }
      break;
    case 'addrole':
    if ( isOwner ) {
      var objRoleToCreate = { name: 'Role Creation Test', color: '#8bc34a', position: 1, permissions: 0, mentionable: true, reason: 'TEST ROLE CREATION' };
      var objNewRole = await createRole( message.guild, objRoleToCreate, message.guild.members.get( message.author.id ) );
      console.log( '%o', objNewRole );
    }
    break;
    case 'referral':
      if ( isOwner || isBotMod || isCrown || isSysop || isStaff ) {
        var codeSent = await sendReferralCode( ( arrArgs[ 0 ] ? arrArgs[ 0 ] : message.author ), ( arrArgs[ 1 ] ? parseInt( arrArgs[ 1 ] ) : -1 ) );
        if ( !codeSent ) { message.reply( 'Failed to send referral code to ' + ( arrArgs[ 0 ] ? arrArgs[ 0 ] : message.author ) + '.' ); }
      }
      break;
/*    case 'tomorrow' :
      if ( !isBot && isOwner ) {        
        message.delete( { reason: 'Cleaning up request for info about MHQ tomorrow of: ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) } )
          .then( delMsg => {
            message.channel.send( 'The current MHQ time is: **__' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '__**' );
            message.channel.send( 'MHQ tomorrow starts in: **__' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '__**' );
          } ).catch( delErr => {
            message.channel.send( 'The current MHQ time is: **__' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + '__**' );
            console.log( 'Unable to delete request in ' + message.guild.name + '#' + message.channel.name + ' for the current MHQ time (' + ( new Date() ).toLocaleDateString( 'en-US', objTimeStringHQ ) + ') with error: ' + delErr );
          } );
        client.user.setStatus( 'online' );
        isBotIdle = false;
      }
      break;//*/
  }
} );

// Leveling system
/*
client.on( 'message', async message => {

} );//*/