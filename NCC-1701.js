const bot = 'NCC-1701';
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
// const exec = require( 'child_process' ).exec;
// const puppeteer = require( 'puppeteer' );
// const strScreenShotPath = path.join( __dirname, '/' );
// const unirest = require( 'unirest' );
  
var idleMsg = false;
var enableSay = true;
var isDebug = settings[ bot ].onError.isDebugMode;
var isBotIdle = settings[ bot ].onError.isBotIdle;
var dcInfo = settings[ bot ].onError.dcInfo;

var strLogChan = {// List all the log channels in a single place here.  Part of a larger overhaul.
//  '': { serverName: '', logChan: { name: '', id: '', canLog: true } },
  '549634608128327681': { serverName: 'Star Trek: Fleet Command', logChan: { name: 'bot-logs', id: '549724890375389204', canLog: true } }
};

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
    [ 'stfc', 'STFC' ],
    [ 'moderator', 'Moderation' ],
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

client.on( 'ready', async () => {
  Promise.all( [
    client.channels.get( settings[ bot ].debug[ 0 ] ).send( 'Bot processing start-up.' )
  ] ).then( () => {
//    client.user.setAFK( false ).catch( errSetAFK => { console.error( '%s: Error setting AFK to `false`: %o', strNow, errSetAFK ); } ),
    client.user.setStatus( settings[ bot ].status ).catch( errSetS => { console.error( '%s: Error setting status to `%s`: %o', strNow, settings[ bot ].status, errSetS ); } );
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
      console.error( '%s: Failed to connect to the Internet on: %o', strErrTime, errReady.split( ' ' )[ ( errReady.split( ' ' ).length - 1 ) ] );
    } else if ( errReady.indexOf( 'ENOTFOUND' ) !== -1 ) {
      console.error( '%s: Failed to connect to Discord on: %o', strErrTime, errReady.split( ' ' )[ ( errReady.split( ' ' ).length - 1 ) ] );
    } else {
      console.error( '%s: READY ERROR: %o', strErrTime, errReady );
    }
  } );
} );

client.on( 'disconnect', ( dc ) => {
  dcInfo = '_has disconnected at ' + strNow + ' with:_ `' + dc + '`';
  console.log( '%s: I\'ve been disconnected with: %o', strNow, dc );
} );

client.on( 'reconnecting', ( rc ) => {
  if ( isDebug ) {
    if ( !dcInfo ) {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_has reconnected at ' + strNow + ' and is ready to accept commands._' );
    } else {
      client.channels.get( settings[ bot ].debug[ 0 ] ).send( dcInfo + '\n_and has reconnected at ' + strNow + ' and is ready to accept commands._' );
    }
  }
  console.log( '%s: Reconnected:\n%s is now ready to accept commands.\n', strNow, settings[ bot ].name );
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

client.on( 'message', async ( message ) => {// Regular messages
  var arrAuthorized = settings[ bot ].owners.concat( settings[ bot ].moderators );
  var strResponse = 'I\'m sorry, did you really just try to DM a bot?';
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
  }
  /* Section for message processing categorization */
  var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
  var isBotMod = false;
  var isCrown = false, isAdmin = false, isSysop = false, isStaff = false;
  var sysopRole = false, staffRole = false;
  if ( message.guild ) {
    isCrown = ( message.author.id === message.guild.owner.user.id ? true : false );
    var arrAdminRoles = [];
    message.guild.roles.array().forEach( function( role, index ) {
      if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
    } );
    arrAdminRoles.forEach( function( role, index ) {
      if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) { isAdmin = true; }
    } );
    sysopRole = await message.guild.roles.get( '549645915498217487' );
    isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    staffRole = await message.guild.roles.get( '549646060000378893' );
    isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
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
    default: 
      /* No command found */
  }
} );