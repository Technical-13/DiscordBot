const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const strScreenShotPath = path.join( __dirname, '../../images-lotro/' );

class StarterPack extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'starterpack',
      group: 'lotro',
      memberName: 'starterpack',
      aliases: [ 'samwise', 'starter' ],
      description: 'Samwise Gamgee\'s Starter Pack for The Lord of the Rings Online.'
    } );
  }

  async run( message, args ) {
    var msgAttachment = [];
    var msgEmbed = new Discord.MessageEmbed()
      .setTitle( 'Samwise Gamgee\'s Starter Pack' )
      .setURL( 'https://amzn.to/3eQvnv1' )
      .setColor( '#234290' )
      .setTimestamp()
      .setDescription( '' )
      .setFooter( '... as requested by ' + message.author.tag + '.' );
      
    message.channel.send( { embed: msgEmbed, files: msgAttachment } );
    message.delete().catch( errDel => { console.error( 'Unable to delete `!starterpack` request: %o', errDel ); } );
  }
}

module.exports = StarterPack;
