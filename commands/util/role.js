const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };

class Role extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'role',
      group: 'util',
      memberName: 'role',
      description: 'This command provides a count of members with a certain role.'
    } );
  }

  async run( message, strArgs ) {
    var arrArgs = strArgs.split( ' ' );
    var arrRoleIDs = [];
    var boolAuthor = false;
    if ( strArgs ) {// Try to find the role specified
console.log( strArgs + ' exists' );
      if ( message.mentions.roles.keyArray()[ 0 ] ) {// Exact match via mention
console.log( strArgs + ' has mention(s)' );
        arrRoleIDs = message.mentions.roles.keyArray();
      }
      else if ( /[\d]{17,19}/.test( strArgs ) ) {// Exact match via role ID
console.log( strArgs + ' is 17-19 digits' );
        if ( message.client.guilds.get( message.guild.id ).roles.get( strArgs ) !== undefined ) {// Exact match via role ID
console.log( strArgs + ' is role.id' );
          arrRoleIDs.push( message.client.guilds.get( message.guild.id ).roles.get( strArgs ).id );
        }
      }
      else if ( message.client.guilds.get( message.guild.id ).roles.find( 'name', strArgs ) !== null ) {// Exact match via name
console.log( strArgs + ' is exact name' );
        message.client.guilds.get( message.guild.id ).roles.findAll( 'name', strArgs ).forEach( function( member ) { arrRoleIDs.push( member.id ) } );
      }
      else if ( message.client.guilds.get( message.guild.id ).roles.map( role => { if ( role.name !== null ) { if ( role.name.toLowerCase() === strArgs.toLowerCase() ) { return role.id } } } ).filter( function( role ) { if ( role ) { return role; } } ).length !== 0 ) {// Case insensitive match via name
console.log( strArgs + ' is name' );
        message.client.guilds.get( message.guild.id ).roles.map( role => {
          if ( role.name !== null ) {
            if ( role.name.toLowerCase() === strArgs.toLowerCase() ) {
              arrRoleIDs.push( role.id );
            }
          }
        } );
      }
//      else if (  ) {// Case insensitive partial match via name
//console.log( strArgs + ' is partial name' );
  //      arrRoleIDs[ 0 ] = ;
  //    }
      else {
console.log( strArgs + ' didn\'t match any criteria - returning requesting role\'s ID' );
        arrRoleIDs.push( message.guild.members.get( message.author.id ).roles.array().slice( 1 ).sort( function( a, b ){ return ( b.position - a.position ); } )[ 0 ].id );
        boolAuthor = !boolAuthor;
      }
    }
    else {// Default to role calling command
      arrRoleIDs.push( message.author.id );
    }
    const today = ( new Date() ).setHours( 0, 0, 0, 0 );
    var strContent = 'NULL';
    var msgEmbed = new Discord.RichEmbed();
    strContent = message.client.guilds.get( message.guild.id ).roles.get( arrRoleIDs[ 0 ] ).name + ' has ' + message.client.guilds.get( message.guild.id ).roles.get( arrRoleIDs[ 0 ] ).members.array().length + ' members.';
		
//    message.delete( { reason: 'Cleaning up a request for member count for the ' + message.client.guilds.get( message.guild.id ).roles.get( arrArgs[ 0 ] ).name + ' role.' } ).catch( errDelete => { console.log( 'Unable to delete message ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ' because: ' + errDelete ); } );
    message.channel.send( strContent/*, { embed: msgEmbed }*/ );
  }
}

module.exports = Role;