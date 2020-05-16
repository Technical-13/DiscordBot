const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const fsSettings = 'settings.json'
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const objTimeString = { timeZone: 'America/New_York',
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric' };
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const isDebug = true;//settings[ bot ].onError.isDebugMode;

class Messages extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'messages',
      group: 'moderator',
      memberName: 'messages',
      description: 'Get an embed of data on recent messages.',
    } );
  }

  async run( message, args ) {
    var isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, isStaff = false;
    var staffRole = false;
    if ( message.guild ) {
      isCrown = ( message.author.id === message.guild.owner.user.id ? true : false );
      var arrAdminRoles = [];
      message.guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
      } );
      arrAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdmin = true;
        }
      } );
      staffRole = await message.guild.roles.get( '201710935788748800' );
      isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    }

    const arrArgs = args.split( ' ' );console.log( '%s: `!messages` fired: %o', strNow, arrArgs );
    
  }
}

module.exports = Messages;