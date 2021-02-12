const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const fsSettings = 'settings.json';
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
var strSettings = JSON.stringify( settings );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = function () { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
const isDebug = true;//settings[ bot ].onError.isDebugMode;

class OneLauncher extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'onelauncher',
      group: 'github',
      memberName: 'onelauncher',
      description: 'Get information pertaining to <https://github.com/JeremyStepp/OneLauncher>'
    } );
  }
  
  async run( message, args ) {
  }
}

module.exports = OneLauncher;