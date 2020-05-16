const commando = require( 'discord.js-commando' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );

class JustAsk extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'ask',
      group: 'util',
      memberName: 'ask',
      description: 'You\'re much more likely to get an answer to your question if you **JUST ASK** it.'
    } );
  }
  
  async run( message, args ) {
    message.delete().catch( errDel => { console.error( '%s: Error attempting to delete message: %o', strNow, errDel ); } );
    var strArgs = args;
    var arrArgs = args.split( ' ' );
    var strMentions = '';
    if ( message.mentions.members.size >= 1 ) {
      var arrMentions = message.mentions.members.array();
      await arrMentions.forEach( function ( ObjMentioned, intIndex ) {
        strMentions += '<@' + ObjMentioned.user.id + '>';
        if ( arrMentions.length > 2 && intIndex === ( arrMentions.length - 2 ) ) {
          strMentions += ', and ';
        } else if ( arrMentions.length > 2 && intIndex < ( arrMentions.length - 2 ) ) {
          strMentions += ', ';
        } else if ( arrMentions.length === 2 && intIndex === 0 ) {
          strMentions += ' and ';
        }
      } );
      strMentions += ', y';
    } else {
      strMentions = 'Y';
    }
    return message.channel.send( strMentions + 'ou\'re much more likely to get an answer to your question if you ask it.' );
  }  
}

module.exports = JustAsk;