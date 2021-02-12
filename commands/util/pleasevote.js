const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objTimeString = {
  year: 'numeric',  month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var settings = require( path.join( __dirname, '../../../settings.json' ) );

class PleaseVote extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'pleasevote',
      group: 'util',
      memberName: 'pleasevote',
      format: '<@RoleGroup|RoleGroup ID> <poll msg ID> [poll chan ID|current channel] [poll guild ID|current guild]',
      description: 'Parameters in `<>` are required and those in `[]` are optional.\nCommand to @mention people in `<@RoleGroup|RoleGroup ID>` to vote on `<poll msg ID>` in `[poll chan ID]` in `[poll guild ID]` as needed.'
    } );
  }

  async run( message, strArgs ) {
    var arrArgs = message.content.split( ' ' );
    var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var objAdminRoles = [], isCrown = false, isAdmin = false;
    if ( message.guild ) {
      isCrown = ( message.author.id === message.guild.owner.user.id ? true : false );
      message.guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { objAdminRoles.push( role ); }
      } );
      objAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdmin = true;
        }
      } );
    }

    // message.delete( 3500 );
    if ( arrArgs.length >= 3 ) {
      var guildPoll = ( arrArgs[ 4 ] ? await message.guilds.get( arrArgs[ 4 ] ) : message.guild );
      var chanPoll = ( arrArgs[ 3 ] ? await guildPoll.channels.get( arrArgs[ 3 ] ) : message.channel );
      var msgPoll = await chanPoll.fetchMessage( arrArgs[ 2 ] );
      var rolePoll = await guildPoll.roles.get( arrArgs[ 1 ].replace( /(<@&|>)/g, '' ) );
      var roleMbrs = rolePoll.members.keyArray();
      var voters = [];
      await msgPoll.reactions.array().forEach( reaction => {
        reaction.users.keyArray().forEach( reactor => {
          if ( voters.indexOf( reactor ) === -1 ) { voters.push( reactor ); }
        } );
      } );

      var nonVoters = [];

      await roleMbrs.forEach( mbrVoted => {
        if ( voters.indexOf( mbrVoted ) === -1 ) { nonVoters.push( mbrVoted ); }
      } );
      
      if ( nonVoters.length > 0 ) {
        chanPoll.send( '<@' + nonVoters.join( '> <@' ) + '>: We\'re still waiting for you to vote on <' +
        'https://discordapp.com/channels/' + guildPoll.id + '/' + chanPoll.id + '/' + msgPoll.id + '>!  Please vote today!' );
      }
      else { message.reply( 'everyone with that role has already voted on <https://discordapp.com/channels/' + guildPoll.id + '/' + chanPoll.id + '/' + msgPoll.id + '>!' ); }
      
    }
    else {
      var oppsie = await message.reply( 'you seem to be missing important parameters.  I need at least a role to check and a poll message id.' );
      oppsie.delete( 7500 );
    }
  }
}

module.exports = PleaseVote;