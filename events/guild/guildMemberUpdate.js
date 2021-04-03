const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, mbrOld, mbrNew ) => {
//  console.log( `${strNow()}:\n\tMember -${mbrOld.user.username}- updated in ${mbrOld.guild.name}` );
};