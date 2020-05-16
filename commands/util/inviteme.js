const commando = require( 'discord.js-commando' );

class InviteMe extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'inviteme',
      group: 'util',
      memberName: 'inviteme',
      description: 'Get a link to invite the bot to your server.'
    } );
  }
  
  async run( message, args ) {
    message.client.fetchApplication().then( client => { message.channel.send( 'You can invite me to your channel! Please visit: ' +
      '<https://discordapp.com/api/oauth2/authorize?client_id=' + client.id + '&scope=bot&permissions=8>' ); } );
  }  
}

module.exports = InviteMe;