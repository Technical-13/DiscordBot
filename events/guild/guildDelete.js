const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, guild ) => {
  console.log( `${strNow()}:\n\tGuild ${guild.name} deleted.` );
};