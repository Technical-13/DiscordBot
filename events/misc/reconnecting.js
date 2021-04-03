const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, rc ) => {
  console.log( `Connected as ${client.user.id}: ${client.user.tag}.` );
};