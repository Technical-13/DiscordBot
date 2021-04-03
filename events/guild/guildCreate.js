const Database = require( '@replit/database' );
const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
var defaultGuild = require( '../../defaultGuild.json' );

module.exports = async ( client, guild ) => {
  defaultGuild.name = guild.name;
  defaultGuild.owner = guild.owner;
  console.log( `${strNow()}:\n\tJoined guild: ${guild.name}` );
  const myGuilds = new Database();
  myGuilds.list().then( guildIDs => {
      if ( guildIDs.indexOf( guild.id ) !== -1 ) {
        myGuilds.get( guild.id ).then( thisGuild => {
          if ( !thisGuild.name ) { thisGuild.name = guild.name; }
          if ( !thisGuild.owner ) { thisGuild.owner = guild.owner; }
          console.log( '\tFound %s (%s) in database: %o', guild.name, guild.id, thisGuild );
          if ( !thisGuild.name || !thisGuild.owner ) { myGuilds.set( guild.id, thisGuild ).then( () => { console.log( `\tAdded guild.name or guild.owner to database for ${guild.name} (${guild.id}).` ); } ); }
        } );
      } else {
        myGuilds.set( guild.id, defaultGuild ).then( () => { console.log( `\tAdded ${guild.name} (${guild.id}) to database.` ); } );
      }
  } ).catch( noGuild => { console.error( `\tError attempting to find ${guild.name} (${guild.id}) in database: ${noGuild}` ); } );
  myGuilds.get( guild.id ).then( thisGuild => {
    if ( thisGuild.blacklisted ) {
      guild.owner.send( 'Someone attempted to add me to your server, **' + guild.name + '**, but it\'s blacklisted in my database.  Please contact my owner on <https://discord.me/TheShoeStore> if you feel this is an error.' ).catch( errSendDM => { console.error( `${strNow()}:\n\tError attempting to DM owner of blacklisted server '${guild.name}' (${guild.id}) on join: ${errSendDM}` ); } );
      guild.leave().then( guildLeft => {
        console.warn( `${strNow()}:\n\tRemoved bot from blacklisted server on join: ${guildLeft.name} (${guildLeft.id})` );
      } ).catch( errLeave => {
        console.error( `${strNow()}:\n\tError attempting to remove bot from blacklisted server '${guild.name}' (${guild.id}) on join: ${errLeave}` );
      } );
    }
  } );
};