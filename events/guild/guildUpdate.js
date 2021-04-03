const Database = require( '@replit/database' );
const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
var defaultGuild = require( '../../defaultGuild.json' );

module.exports = async ( client, oldGuild, newGuild ) => {
  console.log( `${strNow()}:\n\t${newGuild.name} - guild updated!` );
  const myGuilds = new Database();
  myGuilds.list().then( guildIDs => {
    if ( guildIDs.indexOf( newGuild.id ) !== -1 ) {
      myGuilds.get( newGuild.id ).then( thisGuild => {
        var updateDB = false;
        if ( oldGuild.name !== newGuild.name ) {
          thisGuild.name = newGuild.name;
          updateDB = true;
        }
        if ( oldGuild.owner !== newGuild.owner ) {
          thisGuild.owner = newGuild.owner;
          updateDB = true;
        }
        console.log( '\t%s (%s) - found in database: %o', thisGuild.name, newGuild.id, thisGuild );
        if ( updateDB ) { myGuilds.set( newGuild.id, thisGuild ).then( () => { console.log( `\tUpdated guild.name and/or guild.owner to database for: ${newGuild.name} (${newGuild.id})` ); } ); }
      } );
    } else {
      defaultGuild.name = newGuild.name;
      defaultGuild.owner = newGuild.owner;
      myGuilds.set( newGuild.id, defaultGuild ).then( () => { console.log( `\tAdded ${newGuild.name} (${newGuild.id}) to database.` ); } );
    }
  } ).catch( noGuild => { console.error( `\tError attempting to find ${newGuild.name} (${newGuild.id}) in database: ${noGuild}` ); } );
};