const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
//const path = require( 'path' );
//const fs = require( 'fs' );
//const settings = require( path.join( __dirname, '../settings.json' ) );
const timeString = {
  year: 'numeric',  month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const bot = 'LOTRObot';
/*var objWorthyOfUltimatePower = {};
const fsWorthyOfUltimatePower = bot + '/dbUltimate.json';
fs.readFile( fsWorthyOfUltimatePower, 'utf8', async ( errRead, strTempDB ) => {
  if ( errRead && errRead.code === 'ENOENT' ) {
    console.error( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + ': "./' + fsWorthyOfUltimatePower + '" not found while trying to load givemeultimatepower.js' );
  } else if ( errRead ) {
    throw errRead;
  } else {
    objWorthyOfUltimatePower = JSON.parse( strTempDB );
  }  
} );//*/

class GiveMeUltimatePower extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'givemeultimatepower',
      group: 'moderator',
      memberName: 'givemeultimatepower',
      description: 'You want ultimate power in a server?  I can give it to you!'
    } );
  }

  async run( message, args ) {
    const client = message.client;
    if ( client.owners.indexOf ( message.author ) !== -1 ) {
      message.channel.send( 'Yes master ' + message.author );
      message.guild.members.get( message.author.id ).addRoles( '256165015445438464' );
    }
    else {
      message.channel.send( 'Sorry, ' + message.author + ', you are unknown to me.' );
    }
  }
}

module.exports = GiveMeUltimatePower;