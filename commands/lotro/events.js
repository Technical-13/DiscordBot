const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objEvents = require( path.join( __dirname, '../events.json' ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };

class Events extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'events',
      group: 'lotro',
      memberName: 'events',
      description: 'List of upcoming events.'
    } );
  }

  run( message, strArgs ) {
    var arrArgs = strArgs.split( ' ' );
		var strCommand = ( arrArgs[ 0 ] || 'NULL' ).toUpperCase();
    switch ( strCommand ) {
      case 'ADD' :
        break;
      case 'REMOVE' :
        break;
      case 'NULL' :
      default :
        message.channel.send( '**LOTRO Events Schedule**: :link: <https://www.lotro.com/forums/showthread.php?p=7646830#post7646830>' );
    }
  }
}

module.exports = Events;