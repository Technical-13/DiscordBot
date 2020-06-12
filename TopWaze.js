/*
WazeBot ideas

1) Birthday script
2) (down|up)lock request helper

*/
const bot = 'TopWaze';
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
const puppeteer = require( 'puppeteer' );
const strScreenShotPath = path.join( __dirname, '/' );
// const unirest = require( 'unirest' );
  
var idleMsg = false;
var enableSay = true;
var isDebug = settings[ bot ].onError.isDebugMode;
var isBotIdle = settings[ bot ].onError.isBotIdle;
var dcInfo = settings[ bot ].onError.dcInfo;

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

async function getBirthdays() {
  const browser = await puppeteer.launch( { headless: false } );
//  const browser = await puppeteer.launch( );
  const page = await browser.newPage( );
//  await page.goto( 'https://www.waze.com/signin?redirect=%2Fforum%2F' );
  await page.goto( 'https://www.waze.com/forum/' );
  var objBirthdays = await page.evaluate( async () => {
    document.getElementsByClassName( 'wz-text-field' ).username.value = 'Technical_13';
    document.getElementsByClassName( 'wz-text-field' ).password.value = 'Mgf1015!!';
    document.getElementsByClassName( 'submit wz-button wz-button--primary-red' )[ 0 ].click();
    
    var objBirthdayList = {};
    $( 'div#page-body p').eq( 3 ).find( 'strong a' ).each( function( i ){
      var intAge = $( this )[ 0 ].nextSibling.data.trim().replace( /[\(\),]/g, '' );
      objBirthdayList[ $( this ).text() ] = {
        forumURL: $( this )[ 0 ].href,
        birthday: ( isNaN( intAge ) ? '' : ( new Date( ( new Date() ).setYear( ( new Date() ).getFullYear() - 22 ) ) ).getFullYear() + '-' ) + ( ( new Date() ).getMonth() + 1 ) + '-' + ( new Date() ).getDate()
      };
    } );
    
    return objBirthdayList;
  } );
  
//  await browser.close();
  
  console.log( objBirthdays );
//  return objBirthdays;
}

const client = new commando.Client( {
  unknownCommandResponse: settings[ bot ].unknownCommandResponse,
  owner: settings[ bot ].owners
} );

client.registry
  .registerGroups( [
    [ 'waze', 'Waze' ],
    [ 'random', 'Random' ],
    [ 'util', 'Utility' ],
    [ 'wiki', 'Wiki' ]
  ] )
  .registerDefaults()
  .registerCommandsIn( path.join( __dirname, 'commands' ) );

client
  .setProvider(
    sqlite.open( path.join( __dirname, 'settings.sqlite3' ) ).then( db => new commando.SQLiteProvider( db ) )
  ).catch( errSetProvider => { console.error( '%s: Error attempting to setProvider: %o', strNow, errSetProvider ); } );

client.login( settings[ bot ].token );

client.on( 'ready', () => {
  Promise.all( [
//    getBirthdays(),
    client.user.setActivity( settings[ bot ].game ),
    client.user.setStatus( settings[ bot ].status )
  ] ).then( () => {
    console.log( '\n%s:\t%s is now ready to accept commands.\n', strNow, settings[ bot ].name )
    if ( isDebug ) {
     client.channels.get( settings[ bot ].debug[ 0 ] ).send( '_is now ready to accept commands at ' + strNow + '._' );
    }
  } );
} );

client.on( 'disconnect', ( dc ) => {
  var disconnectTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  if ( isDebug ) {
   dcInfo = '_has disconnected at ' + strNow + ' with:_ ' + dc;
  }
  console.log( 'I\'ve been disconnected at %s with: %o', strNow, dc );
} );

client.on( 'reconnecting', () => {
  var reconnectTime = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
  if ( isDebug ) {
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
  if ( isDebug ) {
   client.channels.get( settings[ bot ].debug[ 0 ] ).send( ':exclamation: _had an `error` at ' + errorTime + ':_ ' + err );
  }
  console.error( errorTime + ': ' + err );
} );

client.setInterval( function() {// Set status -  If the bot hasn't done anything in 10 minutes, set status to idle.
  if ( client.user.presence.game.name === 'restarting' ) {
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

/*client.setInterval( function() {//Once a day, bot needs to grab the current list of birthdays from the forums
  getBirthdays();
}, 2073600000 );// 2073600000 once per day */