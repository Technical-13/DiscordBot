const Discord = require( 'discord.js' );
const Commando = require( 'discord.js-commando' );
const path = require( 'path' );
const sqlite = require( 'sqlite' );
const sqlite3 = require( 'sqlite3' );
const keepAlive = require( './server' );

const client = new Commando.Client( {
  commandPrefix: '~',
  owner: '440752068509040660',
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

client.on( 'ready', () => {
  console.log( `Connected as ${client.user.id}: ${client.user.tag}.` );
} );
