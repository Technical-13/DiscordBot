const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, channel ) => {
  if ( channel.type === 'dm' ) {
    console.log( `${strNow()}:\n\tDM channel created with ${channel.recipient.tag} (${channel.recipient.id})` );
  } else {
    console.log( `${strNow()}:\n\tChannel ${channel.name} of type ${channel.type} deleted from ${channel.guild.name}.` );
  }
};