const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const objTimeString = require( '../../time.json' );
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );

class Dver extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'dver',
      group: 'util',
      memberName: 'dver',
      aliases: [ 'dv' ],
      description: 'Get the current bot versions.'
    } );
  }
  
  async run( message, args ) {  
    if ( message.client.owners.map( owner => { return owner.id; } ).indexOf( message.author.id ) !== -1 ) {
      message.reply( 'I\'m running Discord.js v'+ Discord.version + ' → <https://discord.js.org/#/docs/main/' + Discord.version + '/general/welcome>\n\twith -commando v'+ commando.version + ' → <https://discord.js.org/#/docs/commando/v' + commando.version + '/general/welcome>' );
      message.delete().catch( errDel => { console.error( '%o: Unable to delete !%s request by %s: %o', strNow(), command, message.author.tag, errDel ); } );
    }
  }  
}

module.exports = Dver;