const commando = require( 'discord.js-commando' );

class LetMeGoogle extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'lmgtfy',
      group: 'random',
      memberName: 'lmgtfy',
      description: 'Let Me Google That For You!',
      aliases: [ 'lmgt' ]
    } );
  }

  run( message, args ) {
    var prefix = message.guild.client.commandPrefix;
    var msg = message.content;
    var service = msg.split( ' ' )[ 0 ].split( prefix )[ 1 ].toLowerCase();
    var q = encodeURI( args.replace( / /g, '+' ) );
    if ( service === 'lmgt' ) {
		  message.channel.send( '<https://letmegooglethat.com/?q=' + q + '>' );
    } else {
		  message.channel.send( '<https://lmgtfy.com/?q=' + q + '>' );
    }
	}
}

module.exports = LetMeGoogle;