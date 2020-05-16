const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const fsSettings = 'settings.json';
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
var strSettings = JSON.stringify( settings );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const isDebug = true;//settings[ bot ].onError.isDebugMode;
const strWikiName = ( bot === 'DDObot' ? 'DDOwiki' : 'LOTROwiki' );
const myWiki = settings[ bot ].wikis[ strWikiName.toLowerCase() ];
const wikiArticlePath = myWiki.root + myWiki.article;
const unirest = require( 'unirest' );

const arrDefinedStatusCodes = [ 400, 401, 403, 404, 500, 502, 503, 504 ]
const httpStatusCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Page Not Found',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
}

class WikiPing extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'wping',
      group: 'wiki',
      memberName: 'wping',
      description: 'Ping the wiki to see if it\'s up or not.'
    } );
  }
  
  async run( message, strArgs ) {
    var arrArgs = strArgs.split( ' ' );
    if ( arrArgs[ 0 ] !== undefined ) {
      var wikiLinks = [];
      var rawLinks = arrArgs.join( ' ' ).match( /(\[\[(.*?)\]\])*/g ).filter( aMatch => { if ( aMatch !== '' ) { return aMatch; }  } );
      rawLinks.forEach( rawLink => { wikiLinks.push( rawLink.replace( / /g, '_' ).replace( /[\[\]]/g, '' ) ); } );
      var rawTemplateLinks = arrArgs.join( ' ' ).match( /(\{\{(.*?)\}\})*/g ).filter( tMatch => { if ( tMatch !== '' ) { return tMatch; }  } );
      rawTemplateLinks.forEach( rawTemplateLink => { wikiLinks.push( 'Template:' + rawTemplateLink.replace( / /g, '_' ).replace( /[\{\}]/g, '' ) ); } );
//      console.log( '%o', wikiLinks );
    }
    
    let pingPage = ( wikiLinks.length >=1 ? wikiLinks[ 0 ] : 'Ping' );
    
    unirest.get( wikiArticlePath + pingPage ).end( function ( objPingTest ) {
      let intStatCode = objPingTest.statusCode;
      let strDesc = ( arrDefinedStatusCodes.indexOf( intStatCode ) !== -1 ? '`' + intStatCode + '` '+ httpStatusCodes[ intStatCode ] : intStatCode ) + ': https://httpstatuses.com/' + intStatCode;
      console.log( '%s:\n\tPinged: %s\n\tintStatCode: %o\n\tstrDesc: %s', strNow, pingPage, intStatCode, strDesc );
      message.channel.send( strWikiName + ' ' + ( intStatCode === 200 ? 'is **UP**!!!' : 'returned: ' + strDesc ) ).then( () => {
        message.delete( 1000 ).catch( errDel => { console.error( '%s: Failed to delete `!wping` request: %o', strNow, errDel ); } );
      } );
    } );    
  }
}

module.exports = WikiPing;