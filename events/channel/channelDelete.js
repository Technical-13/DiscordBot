const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, channel ) => {
  console.log( `${strNow()}:\n\tChannel ${channel.name} of type ${channel.type} deleted from ${channel.guild.name}.` );
};