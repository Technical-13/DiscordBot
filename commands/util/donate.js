const commando = require( 'discord.js-commando' );
const objTimeString = require( '../../time.json' );
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );

class Donate extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'donate',
      group: 'util',
      memberName: 'donate',
      description: 'Offer ways to donate to the bots\' development and help the coder.'
    } );
  }
  
  async run( message, args ) {
    var strChannelName = 'DM';
    if ( message.channel.type !== 'dm' ) {
      strChannelName = message.guild.name + '#' + message.channel.name;
    }
    message.author.send( 'You can help with the development of this bot and its brother and sister bots by contributing to the "Discord bot" pool on PayPal: <https://paypal.me/pools/c/82z3HDuQ3y>' ).then( async dm => {
      await message.react( '%E2%9C%85' ).catch( errReactDM => { console.error( 'Unable to react to ' + message.author.tag + '\'s request for donation information in ' + strChannelName + ' at ' + strNow() + ': ' + errReactDM ); } );
      console.info( message.author.tag + ' just received a DM with the link to donate in ' + strChannelName + ' at ' + strNow() + '!' );
    } ).catch( errSendDM => {
      message.react( '%E2%9D%8C' ).then( r => {
        message.reply( ' since you are not set to accept DMs from members of this server; You can help with the development of this bot and its brother and sister bots by contributing to the "Discord bot" pool on PayPal: <https://paypal.me/pools/c/82z3HDuQ3y>.' );
        console.info( message.author.tag + ' just received the link to donate in ' + strChannelName + ' (because they are blocking DMs) at ' + strNow() + '!' );
      } ).catch( errBlocked => {
        message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to see the information they requested?  I\'d appreciate it. :slight_smile: ^^  @here' );
        console.error( 'Unable to react to ' + message.author.tag + '\'s request for donation information in ' + strChannelName + ' at ' + strNow() + ': ' + errBlocked );
        console.info( message.author.tag + ' has requested the link to donate in ' + strChannelName + ' but has not yet gotten the information (because they are blocking me) at ' + strNow() + '!' );
      } );
    } );
  }  
}

module.exports = Donate;