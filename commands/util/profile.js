const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const sqlite = require( 'sqlite' );
const fs = require( 'fs' );
const unirest = require( 'unirest' );
const path = require( 'path' );
const fsSettings = 'settings.json'
const fsSpecials = bot + '/specials.json';
const fsGuilds = bot + '/guilds.json';
const fsUsers = bot + '/users.json';
var settings = require( path.join( __dirname, '../../../' + fsSettings ) );
var jsonGuilds = require( path.join( __dirname, '../../../' + fsGuilds ) );
var jsonUsers = require( path.join( __dirname, '../../../' + fsUsers ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = ( new Date() ).toLocaleDateString( 'en-us', objTimeString );
var idleMsg = false;
var enableSay = true;
var isDebug = settings[ bot ].onError.isDebugMode;
var isBotIdle = settings[ bot ].onError.isBotIdle;

function isValidEmail( email ) { return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test( email ); }

/*function isValidFacebook( fb ) {
  return unirest
    .head( 'https://www.facebook.com/' + fb )
    .header( 'User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0' )
    .then( ( getFb ) => { return ( getFb.statusCode === 404 ? false : true ); } )
    .catch( ( errFb ) => { console.error( '%s: errFB (%s): %o', strNow, fb, errFb ); return false; } );
}//*/

function isValidTimeZone( tz ) {
  if ( !Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone ) { throw 'Time zones are not available in this environment'; }
  try { Intl.DateTimeFormat( undefined, { timeZone: tz } ); return true; } catch ( ex ) { return false; }
}

class Profile extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'profile',
      group: 'util',
      memberName: 'profile',
      description: 'Set your public profile!'
    } );
  }

  async run( message, strArgs ) {
    const isBot = message.author.bot;
    const client = message.client;
    var arrOwnerIDs = settings[ bot ].owners, arrBotModIds = settings[ bot ].moderators, arrOwners = [];
    await arrOwnerIDs.forEach( function( owner ) { arrOwners.push( client.fetchUser( owner ) ); } );
    const isOwner = ( arrOwnerIDs.indexOf( message.author.id ) !== -1 ? true : false );
    const isBotMod = ( arrBotModIds.indexOf( message.author.id ) !== -1 ? true : false );
    var saveUser = false;
    var arrArgs = strArgs.split( ' ' );
    var setItem = ( arrArgs[ 0 ] || 'view' ).toLowerCase();
    const thisUser = jsonUsers[ message.author.id ];

console.log( '%s: %s ran %s: %o', strNow, thisUser.tag, setItem , message.content );

    switch ( setItem ) {
      case 'email':
        if ( arrArgs[ 1 ] ) {
          if ( arrArgs[ 1 ].toLowerCase() === 'clear' || arrArgs[ 1 ].toLowerCase() === 'reset' ) {
            thisUser.email = null;
            saveUser = true;
            message.reply( 'your email has been cleared.' );
          }
          else if ( isValidEmail( arrArgs[ 1 ] ) ) {
            thisUser.email = arrArgs[ 1 ];
            saveUser = true;
            message.reply( 'your email has been set to: ' + thisUser.email );
          }
          else { message.reply( arrArgs[ 1 ] + ' is not a valid email.' ); }
        }
        else if ( thisUser.email !== null ) { message.reply( 'current email: __**' + thisUser.email + '**__' ); }
        else { message.reply( 'no email information is currently available for you.' ); }
        break;
      case 'fb': case 'facebook':
        if ( arrArgs[ 1 ] ) {
          if ( arrArgs[ 1 ].toLowerCase() === 'clear' || arrArgs[ 1 ].toLowerCase() === 'reset' ) {
            thisUser.facebook = null;
            saveUser = true;
            message.reply( 'your Facebook has been cleared.' );
          }
          else /*if ( await isValidFacebook( arrArgs[ 1 ].replace( /https?:\/\/(?:www\.)?facebook\.com\//i, '' ) ) )//*/ {
            thisUser.facebook = 'https://www.facebook.com/' + arrArgs[ 1 ].replace( /https?:\/\/(?:www\.)?facebook\.com\//i, '' );
            saveUser = true;
            message.reply( 'your Facebook has been set to: <' + thisUser.facebook + '>' );
          }/*
          else { message.reply( arrArgs[ 1 ] + ' is not a valid Facebook.' ); }//*/
        }
        else if ( thisUser.facebook !== null ) { message.reply( 'current Facebook: __**<' + thisUser.facebook + '>**__' ); }
        else { message.reply( 'no Facebook information is currently available for you.' ); }
        break;
      case 'reddit':
        message.reply( 'This will allow you to set your *reddit* account on your profile.' );
        break;
      case 'steam':
        message.reply( 'This will allow you to set your *steam* account on your profile.' );
        break;
      case 'tz': case 'timezone':
        if ( arrArgs[ 1 ] ) {
          if ( arrArgs[ 1 ].toLowerCase() === 'clear' || arrArgs[ 1 ].toLowerCase() === 'reset' ) {
            thisUser.timezone = null;
            saveUser = true;
            message.reply( 'your timezone has been cleared.' );
          }
          else if ( isValidTimeZone( arrArgs[ 1 ] ) ) {
            thisUser.timezone = arrArgs[ 1 ];
            saveUser = true;
            message.reply( 'your timezone has been set to: ' + thisUser.timezone );
          }
          else { message.reply( arrArgs[ 1 ] + ' is not a valid timezone.' ); }
        }
        else if ( thisUser.timezone !== null ) { message.reply( 'current timezone: __**' + thisUser.timezone + '**__' ); }
        else { message.reply( 'no timezone information is currently available for you.' ); }
        break;
      case 'twitter':
        if ( arrArgs[ 1 ] ) {
          if ( arrArgs[ 1 ].toLowerCase() === 'clear' || arrArgs[ 1 ].toLowerCase() === 'reset' ) {
            thisUser.twitter = null;
            saveUser = true;
            message.reply( 'your Twitter has been cleared.' );
          }
          else /*if ( await isValidTwitter( arrArgs[ 1 ].replace( /(https?:\/\/(?:www\.)?twitter\.com\/|@)/i, '' ) ) )//*/ {
            thisUser.twitter = 'https://www.twitter.com/' + arrArgs[ 1 ].replace( /(https?:\/\/(?:www\.)?twitter\.com\/|@)/i, '' );
            saveUser = true;
            message.reply( 'your Twitter has been set to: <' + thisUser.twitter + '>' );
          }/*
          else { message.reply( arrArgs[ 1 ] + ' is not a valid Twitter.' ); }//*/
        }
        else if ( thisUser.twitter !== null ) { message.reply( 'current Twitter: __**<' + thisUser.twitter + '>**__' ); }
        else { message.reply( 'no Twitter information is currently available for you.' ); }
        break;
      case 'twitch':
        message.reply( 'This will allow you to set your *youtube* account on your profile.' );
        break;
      case 'youtube':
        message.reply( 'This will allow you to set your *youtube* account on your profile.' );
        break;
      case 'view':
        message.reply( 'This will allow you to *view* your profile.' );
        break;
      default : message.reply( 'You failed to specify a valid profile option.  Please try again.' );
    }

    message.delete( 3000 ).catch( errDel => { console.error( '%s: Unable to delete for `%s`: %o', strNow, message.content, errDel ); } );

    if ( saveUser ) {
      var strJsonUsers = JSON.stringify( jsonUsers );
      fs.writeFile( '../' + fsUsers, strJsonUsers, ( errWrite ) => {
        if ( errWrite ) {
          client.guilds.get( '201024322444197888' ).channels.get( '235896771547627521' ).send( strNow + ': Failed to save jsonUsers on message.' );
          throw errWrite;
        } else { console.log( '%s: Successfully saved jsonUsers on message.', strNow ); }
      } );
    }
  }
}

module.exports = Profile;