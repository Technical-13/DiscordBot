const commando = require( 'discord.js-commando' );
var PDGoptions = { dry: true, days: 30, reason: 'I don\'t need a reason!' };

class PruneDiscordGuild extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'prune',
      group: 'util',
      memberName: 'prune',
      description: '`!prune {days} [confirm]`: Prunes members from the server that have been inactive for the specified number of days and don\'t have any roles set.\n..... `{days}` is the number of days of inactivity and defaults to 30.\n..... `[confirm]` is needed to actually prune the users from the server.  If it is omitted, a count of the number of users to be removed will be returned instead.'
    } );
  }
  
  async run( message, args ) {
    var pruneGuild = args.match( /([\d]*)( confirm)?/i );
    
    if ( pruneGuild[ 1 ] === '' ) {
      PDGoptions.days = 30;
    } else {
      PDGoptions.days = parseInt( pruneGuild[ 1 ] );
    }
    
    if ( pruneGuild[ 1 ] === '' ) {
      message.channel.send( 'This will prune ${pruned} people!' );
      
      /*guild.pruneMembers( PDGoptions )
        .then( pruned => message.channel.send( 'This will prune ${pruned} people!' ) )
        .catch( console.error );*/
    } else {
      message.channel.send( 'Pretending to prune people that have been inactive ' + PDGoptions.days + ' days.' );
      
/*      PDGoptions.dry = false;
      PDGoptions.reason = 'why be here if you're never ever going to at least say hi!?';
      guild.pruneMembers( PDGoptions )
        .then( pruned => message.channel.send( 'I just pruned ${pruned} people!' ) )
        .catch( console.error );*/
    }
  }  
}

module.exports = PruneDiscordGuild;