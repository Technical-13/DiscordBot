const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const fs = require( 'fs' );
const fsIcons = 'roleIcons.json';
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };

class AdminIcon extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'adminicon',
      group: 'moderator',
      memberName: 'adminicon',
      description: 'This command will (pre|suf)fix a member of the guild with an appropriate icon based on roles.'
    } );
  }

  async run( message, strArgs ) {
    var arrArgs = strArgs.split( ' ' );
    var strCommand = ( arrArgs[ 0 ] || 'NONE' ).toUpperCase();
    switch ( strCommand ) {
      case 'NONE' : case 'HELP' :
        
        break;
      case 'SET' :
        var boolAuthorized;
        if ( boolAuthorized ) {
          let strOption = ( arrArgs[ 1 ] || 'NONE' ).toUpperCase();
          switch ( strOption ) {
            case 'NONE' :
              message.react( 'x' ).then( rReact => {// DON'T FORGET TO REPLACE 'x' with an encoded :x:
                message.reply( 'You forgot to tell me what you wanted to set.  Please try again.' );
              } ).catch( rErr => {
                
              } );
              break;
            default :
          }
        }
        break;
      default :
    }
  }
}

module.exports = AdminIcon;