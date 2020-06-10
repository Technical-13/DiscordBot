const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const strScreenShotPath = path.join( __dirname, '../../images-lotro/' );

class PourFourty extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'pour40',
      group: 'random',
      memberName: 'pour40',
      description: 'For dumb people being dumb.'
    } );
  }
  
  async run ( message, args ) {
    var isDumb = '';
    message.delete();
    if ( !args ) {
      // + No args, I don't know who you are calling dumb.
    } else if ( ( message.mentions.members.size === 1 && ( message.mentions.members.has( message.client.user.id ) || settings[ bot ].owners.indexOf( message.mentions.members.first().id ) !== -1 ) ) && settings[ bot ].owners.indexOf( message.author.id ) === -1 ) {
      // + Anyone calls bot owner or bot dumb (except bot owner), bot retorts.
      isDumb = ', ' + message.author + ', trying to insult my master';
    } else if ( message.mentions.members.first() ) {
      // + None of the above are true, bot agrees with author that target is dumb.
      isDumb = ', ' + message.mentions.members.first();
    } else {
      // + Args included but no mentions, need to mention the user to get this command to return an appropriate response.
    }
    message.channel.send( 'You\'re a special kind of special, aren\'t you' + isDumb + '?', { files: [ { attachment: strScreenShotPath + 'pour40.gif', name: 'pour40.gif' } ] } )
	}
}

module.exports = PourFourty;