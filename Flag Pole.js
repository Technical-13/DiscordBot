const bot = 'FlagPole';
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
// const puppeteer = require( 'puppeteer' );
// const strScreenShotPath = path.join( __dirname, '/' );
const unirest = require( 'unirest' );
// const later = require( 'later' );
  
var idleMsg = false;
var enableSay = true;
var isDebug = settings[ bot ].onError.isDebugMode;
var isBotIdle = settings[ bot ].onError.isBotIdle;
var dcInfo = settings[ bot ].onError.dcInfo;

var strLogChan = {
//  'serverID': { serverName: '', logChan: { name: '', id: '' } },
//  'serverID': { serverName: '', logChan: { name: '', id: '' } }
}

const client = new commando.Client( {
  unknownCommandResponse: settings[ bot ].unknownCommandResponse,
  owner: settings[ bot ].owners
} );

client.registry
  .registerGroups( [
    [ 'contribs', 'Contributors' ],
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
/*    if ( errReady.indexOf( 'ETIMEDOUT' ) !== -1 ) {
      console.error( '%s: Failed to connect to the Internet on: %o', strErrTime, errReady.split( ' ' )[ ( errReady.split( ' ' ).length - 1 ) ] );
    } else if ( errReady.indexOf( 'ENOTFOUND' ) !== -1 ) {
      console.error( '%s: Failed to connect to Discord on: %o', strErrTime, errReady.split( ' ' )[ ( errReady.split( ' ' ).length - 1 ) ] );
    } else {
      console.error( '%s: READY ERROR: %o', strErrTime, errReady );
    }//*/
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