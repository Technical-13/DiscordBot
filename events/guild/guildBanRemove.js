const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, guild, member ) => {
  console.log( `${strNow()}:\n\t${member.tag} (ID:${member.id}) was unbanned from ${guild.name} (ID:${guild.id}).` );

  /* THIS SHOULD BE A FUNCTION THAT'S RUNNABLE ON ALL SERVERS WITH A CONFIG */
  if ( guild.id === '201024322444197888' ) {
    if ( strLogChan[ guild.id ] !== undefined ) {
      if ( strLogChan[ guild.id ].logChan.canLog ) {
        guild.channels.get( strLogChan[ guild.id ].logChan.id ).send( '<:approved:510515835673247776> __' + member.username + '**#**' + member.discriminator + '__ (ID:' + member.id + ') was unbanned from __' + guild.name + '__ (ID:' + guild.id + ').' );
      }
    } else {
      console.log( 'Unable to post guildBanRemove event for `' + guild.name + '` (ID:' + guild.id + ') with no log channel defined.' );
    }
  }
  /* THIS SHOULD BE A FUNCTION THAT'S RUNNABLE ON ALL SERVERS WITH A CONFIG */
};