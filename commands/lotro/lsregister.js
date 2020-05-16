const commando = require( 'discord.js-commando' );

class RegisterLotROShots extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'lsregister',
      group: 'lotro',
      memberName: 'lsregister',
      description: 'Get a link to register to lotroshots.',
      aliases: [ 'register' ]
    } );
  }
  
  async run( message, args ) {
    var arrAuthorRoles = message.guild.members.get( message.author.id )._roles;
		if ( message.channel.id === '335765066727030786' || arrAuthorRoles.indexOf( '335764864410845185' ) !== -1 ) {
			message.channel.send( 'You can register for lotroshots! Please visit: <http://www.shots.lotrokin.me/register.php>' );
		}
  }  
}

module.exports = RegisterLotROShots;