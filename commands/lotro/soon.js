const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const bot = 'lotro';
const strScreenShotPath = path.join( __dirname, '../../images-' + bot + '/' );

class Soon extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'soon',
      group: bot,
      memberName: 'soon',
      description: 'Soon? SOON:tm:'
    } );
  }

  async run( message, args ) {
    message.delete();
    message.channel.send( { files: [ { attachment: strScreenShotPath + bot.toUpperCase() + '-SOON.png', name: 'SOON.png' } ] } )
	}
}

module.exports = Soon;