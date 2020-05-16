const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class LetMeGoogle extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'lmgtfy',
      group: 'random',
      memberName: 'lmgtfy',
      description: 'Let Me Google That For You!'
    } );
  }

  async run( message, args ) {
    var q = encodeURI( args.replace( / /g, '+' ) );
		message.channel.send( '<https://lmgtfy.com/?q=' + q + '>' );
	}
}

module.exports = LetMeGoogle;