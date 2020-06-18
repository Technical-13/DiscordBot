const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const objTimeString = { timeZone: 'America/New_York',
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric' };
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const strScreenShotPath = path.join( __dirname, '../../images-' + bot.toLowerCase().replace( 'bot', '' ) + '/' );
const isDebug = settings[ bot ].onError.isDebugMode;

class Soon extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'soon',
      group: bot.toLowerCase().replace( 'bot', '' ),
      memberName: 'soon',
      description: 'Soon?'
    } );
  }

  async run( message, args ) {
    message.delete();
    message.channel.send( { files: [ { attachment: strScreenShotPath + bot.replace( 'bot', '' ) + '-SOON.png', name: 'SOON.png' } ] } )
	}
}

module.exports = Soon;