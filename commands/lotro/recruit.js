const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const bot = 'LOTRObot';

class Recruited extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'recruit',
      group: 'lotro',
      memberName: 'recruit',
      aliases: [ 'remove' ],
      format: '<user>',
      examples: [
        '\t!recruit <@445791608609308702>', '\t!recruit 445791608609308702', '\t!recruit LOTRObot#2621', '\t!recruit LOTRObot',
        '\t!remove <@445791608609308702>', '\t!remove 445791608609308702', '\t!remove LOTRObot#2621', '\t!remove LOTRObot'
      ],
      description: 'Allow kinship recruiters to add AND/OR remove members to their kinship channel on LOTROdiscord.\n\t' +
        'This command ONLY works for `@Kinship Recruiters` and ONLY from inside the text channel of the kin for the user to be invited to in the LOTRODiscord server.'
    } );
  }
  
  async run( message, strArgs ) {
    var strCommand = message.content.split( ' ' )[ 0 ].replace( '!', '' );
    if ( message.guild.id === '201024322444197888' ) {// Only should work in LOTROdiscord for now
      /* Section for message processing categorization */
      var strChanName = message.channel.name;
      var strWorldName = message.client.channels.get( message.channel.parentID ).name.substr( 0, 5 );
      var isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
      var isAdmin = false, staffRole = false, isStaff = false, isRecruiter = false, strKinRole = false, strWorldRole = false;
      var strRecruit = false;
      if ( message.guild ) {
        staffRole = message.guild.roles.get( '201710935788748800' );
        isStaff = ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isRecruiter = ( message.guild.roles.find( 'name', 'Kinship Recruiters' ) && ( message.guild.roles.find( 'name', 'Kinship Recruiters' ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        var objAdminRoles = [];
        message.guild.roles.array().forEach( function( role, index ) {
          if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) {
            objAdminRoles[ objAdminRoles.length ] = role;
          }
        } );
        objAdminRoles.forEach( function( role, index ) {
          if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdmin = true;
          }
        } );
        message.guild.roles.map( role => {
          if ( role.name.toLowerCase().replace( / /g, '-' ) === strChanName ) { return role.id; } else { return false; }
        } ).forEach( function( roleID ) { if ( roleID ) { strKinRole = message.guild.roles.get( roleID ); } } );
        message.guild.roles.map( role => {
          if ( role.name.substr( 0, 5 ) === strWorldName ) { return role.id; } else { return false; }
        } ).forEach( function( roleID ) { if ( roleID && ( message.guild.roles.get( roleID ).name.substr( -3 ) !== 'Kin' ) ) { strWorldRole = message.guild.roles.get( roleID ); } } );
      }
      if ( strArgs ) {// Try to find the user
        if ( message.mentions.members.keyArray()[ 0 ] ) {// Exact match via mention
          strRecruit = message.client.users.get( message.mentions.members.keyArray()[ 0 ] );
        }
        else if ( /[\d]{17,19}/.test( strArgs ) && message.client.users.get( strArgs ) !== undefined ) {// Exact match via user ID
          strRecruit = message.client.users.get( strArgs );
        }
        else if ( message.client.users.find( 'tag', strArgs ) !== null ) {// Exact match via tag
          strRecruit = message.client.users.find( 'tag', strArgs );
        }
        else if ( message.client.users.find( 'username', strArgs ) !== null ) {// Exact match via username
          strRecruit = message.client.users.find( 'username', strArgs );
        }
        else if ( message.guild.members.find( 'nickname', strArgs ) !== null ) {// Exact match via nickname in a guild
          strRecruit = message.guild.members.find( 'nickname', strArgs );
        }
/*        else if ( message.client.users.map( user => { if ( user.tag !== null ) { if ( user.tag.toLowerCase() === strArgs.toLowerCase() ) { return user.id } } } ).filter( function( user ) { if ( user ) { return user; } } ).length !== 0 ) {// Case insensitive match via tag
          message.client.users.map( user => {
            if ( user.tag !== null ) {
              if ( user.tag.toLowerCase() === strArgs.toLowerCase() ) {
                strRecruit = user;
              }
            }// FOR SOME REASON, THIS METHOD RETURNS `TypeError: Cannot read property 'toLowerCase' of undefined` --- probably because user.tag is undefined.
          } );
        }//*/
        else if ( message.client.users.map( user => { if ( user.username !== null ) { if ( user.username.toLowerCase() === strArgs.toLowerCase() ) { return user.id } } } ).filter( function( user ) { if ( user ) { return user; } } ).length !== 0 ) {// Case insensitive match via username
          message.client.users.map( user => {
            if ( user.username !== null ) {
              if ( user.username.toLowerCase() === strArgs.toLowerCase() ) {
                strRecruit = user;
              }
            }
          } );
        }
        else if ( message.client.users.map( user => { if ( user.nickname !== null ) { if ( user.nickname.toLowerCase() === strArgs.toLowerCase() ) { return user.id } } } ).filter( function( user ) { if ( user ) { return user; } } ).length !== 0 ) {// Case insensitive match via nickname
          message.client.users.map( user => {
            if ( user.nickname !== null ) {
              if ( user.nickname.toLowerCase() === strArgs.toLowerCase() ) {
                strRecruit = user;
              }
            }
          } );
        }
        else {// Unable to find any matches
          message.reply( 'I\'m unable to find any members of this guild that match your criteria.  Please, try again using a different method.' ).then( () => { message.delete(  ).then( () => { return false; } ).catch(  ); } ).catch(  );
        }
      }
      if ( strKinRole && strRecruit ) {// if a role is not defined, either it doesn't exist or the author isn't in a kinship channel - strRecruit should always exist at this point as the command is suppose to exit out if it couldn't find a match.
        if ( isRecruiter || isStaff || isOwner ) {// Needs to be a recruiter in the kinship channel or needs to be Staff/Owner to recruit.
          if ( strCommand === 'recruit' ) {
            var arrRolesToAdd = [ strKinRole.id ];
            if ( message.guild.members.get( strRecruit.id )._roles.indexOf( strWorldRole.id ) === -1 ) {
              arrRolesToAdd.push( strWorldRole.id );
            }
            message.guild.members.get( strRecruit.id ).addRoles( arrRolesToAdd, 'Recruited into ' + strKinRole.name + ' by ' + message.author.tag ).then( () => { message.react( '%E2%9C%85' ).then(  ).catch(  ); } ).catch( errRole => { console.error( 'While attempting to add role(s): `' + strKinRole.name + '`, `' + strWorldRole.name + '` to `' + strRecruit.username + '`\n\tError:\n\t' + errRole ); } );
          }
          else if ( strCommand === 'remove' ) {
            message.guild.members.get( strRecruit.id ).removeRole( strKinRole.id, 'Removed from ' + strKinRole.name + ' by ' + message.author.tag ).then( () => { message.react( '%E2%9C%85' ).then(  ).catch(  ); } ).catch( errRole => { console.error( 'While attempting to remove role: ' + strKinRole.id + ' from ' + strRecruit.id + '\n\tError:\n\t' + errRole ); } );
          }
        }
        else {// Not able to recruit
          message.reply( 'I\'m sorry, you don\'t seem to have the needed permissions to manage member ' + strRecruit ).then( () => { message.delete(  ).then( () => { return false; } ).catch(  ); } ).catch(  );
        }
      }
      else {// Wrong channel
        message.reply( 'I\'m sorry, you need to be in a kinship channel to manage members.  If you believe this message is in error, please DM my master, <@440752068509040660> and let them know.  Thanks!' ).then( () => { message.delete(  ).then( () => { return false; } ).catch(  ); } ).catch(  );
      }
    }
  }
}

module.exports = Recruited;