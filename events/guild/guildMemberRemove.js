const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, member ) => {
  console.log( `${strNow()}:\n\tMember -${member.user.username}- removed from ${member.guild.name}` );
};