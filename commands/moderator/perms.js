const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

class PermsGuild extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'perms',
      group: 'moderator',
      memberName: 'perms',
      ownerOnly: true,
      format: '<guild.id>',
      description: 'Get the permission set for a certain guild by ID. This is an ownerOnly command.'
    } );
  }
  
  async run( message, args ) {
    const client = message.client;
    const arrArgs = args.split( ' ' );
    var guild;
    if ( arrArgs[ 0 ] ) {
      try {
        guild = arrArgs[ 0 ];
        guild = await client.guilds.cache.get( guild );
        if ( guild === undefined ) {
          guild = arrArgs[ 0 ];
          throw 'invalid ID';
        }
      } catch ( getGuildErr ) {
        message.channel.send( 'Unable to get guild permissions with :id:' + guild + '.' );
        console.error( `${strNow()}:\n\tError attempting to get permissions for guild with id "${guild}": ${getGuildErr}` );
        if ( message.channel.type !== 'dm' ) {
          message.delete( { reason: 'Cleaning up request for permission information from ' + message.author.id + '.' } );
        }
        return;
      }
    } else if ( message.channel.type !== 'dm' ) {
      guild = message.guild;
    }
    if ( guild ) {
      message.author.send( 'My permissions for **' + guild.name + '** (:id:' + guild.id + ') are <https://discordapi.com/permissions.html#' + guild.members.cache.get( message.client.user.id ).permissions.bitfield + '>' );
      if ( message.channel.type !== 'dm' ) {
        message.delete( { reason: 'Cleaning up request for permission information from ' + message.author.id } );
      }
    } else {
      message.channel.send( 'Unable to get guild permissions from DM without guild ID.' );
        console.error( `${strNow()}:\n\tError attempting to get permissions from DM without guild ID.` );
    }
  }
}

module.exports = PermsGuild;
