const Discord = require( 'discord.js' );
const Commando = require( 'discord.js-commando' );
const fs = require( 'fs' ).promises;
const path = require( 'path' );
const sqlite = require( 'sqlite' );
const sqlite3 = require( 'sqlite3' );
const keepAlive = require( './server' );

const client = new Commando.Client( {
  commandPrefix: '~',
  owner: '440752068509040660',
//  owner: [ '440752068509040660', '313034997193900034' ],
  invite: '<https://discord.me/TheShoeStore>',
  unknownCommandResponse: false
} );

client.registry
  .registerDefaults()
  .registerGroups( [
    [ 'contribs', 'Contributors' ],
    [ 'ddo', 'DDO' ],
    [ 'github', 'GitHub' ],
    [ 'lotro', 'LotRO' ],
    [ 'moderator', 'Moderation' ],
    [ 'munzee', 'Munzee' ],
    [ 'random', 'Random' ],
    [ 'util', 'Utility' ],
    [ 'wiki', 'Wiki' ]
  ] )
  .registerCommandsIn( path.join( __dirname, 'commands' ) );

client.setProvider(
    sqlite.open( { filename: 'database.db', driver: sqlite3.Database } )
      .then( db => new Commando.SQLiteProvider( db ) )
      .catch( errOpenSQLite => { console.error( 'Error opening database.db: %o', errOpenSQLite ); } )
  ).catch( errSetProvider => {
    console.error( 'Error setting provider db: %o', errSetProvider );
  } );

keepAlive();
client.login( process.env.TOKEN );// Don't forget to change to greenie's token when done.

( async function registerEvents( dir = 'events' ) {
  let files = await fs.readdir( path.join( __dirname, dir ) );
  for ( let file of files ) {
    let stat = await fs.lstat( path.join( __dirname, dir, file ) );
    if ( stat.isDirectory() ) { registerEvents( path.join( dir, file ) ); } else {
      if ( file.endsWith( '.js' ) ) {
        let eventName = file.substring( 0, file.indexOc( '.js' ) );
        try {
          let eventModule = require( path.join( __dirname, dir, file ) );
          client.on( eventName, eventModule.bind( null, client ) );
        } catch( errRegEvent ) { console.error( 'Error occured attempting to register event: %o', errRegEvent ); }
      }
    }
  }
} )();
