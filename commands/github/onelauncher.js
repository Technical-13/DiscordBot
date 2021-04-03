const commando = require( 'discord.js-commando' );

class OneLauncher extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'onelauncher',
      group: 'github',
      memberName: 'onelauncher',
      description: 'Get information pertaining to <https://github.com/JeremyStepp/OneLauncher>'
    } );
  }
  
  async run( message, args ) {
    message.delete().catch( errDel => { console.error( 'Unable to delete onelauncher request: %o', errDel ); } );
    message.channel.send( 'Check out <@586647088268443697>\'s OneLauncher: <https://github.com/JeremyStepp/OneLauncher>' );
  }
}

module.exports = OneLauncher;