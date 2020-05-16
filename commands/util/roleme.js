const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const fs = require( 'fs' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const bot = 'LOTRObot';
//const fsRoleMeDB = bot + '/roleme.json';
const objTempDB = {
  '192775085420052489': {
    'pink': { 'name': 'pink', 'id': '253576067921608704', 'groups': [ 'Red' ] },
    'orange': { 'name': 'orange', 'id': '25617015018776166', 'groups': [ 'Red', 'Yellow' ] },
    'red': { 'name': 'red', 'id': '256169871656615946', 'groups': [ 'Red' ] },
    'blue': { 'name': 'blue', 'id': '256170137332350978', 'groups': [ 'Blue' ] },
    'green': { 'name': 'green', 'id': '256170100623671297', 'groups': [ 'Blue', 'Yellow' ] }
  }
};
var objRoles = {};
/*fs.readFile( fsRoleMeDB, 'utf8', ( errRead, strTempDB ) => {
  if ( errRead && errRead.code === 'ENOENT' ) {
    strTempDB = JSON.stringify( objTempDB );
    fs.writeFile( fsRoleMeDB, strTempDB, ( errWrite ) => {
      if ( errWrite ) throw errWrite;
      console.log( 'Created ' + fsRoleMeDB + ' with:\n\t' + strTempDB );
    } );
  } else if ( errRead ) {
    throw errRead;
  }
  objRoles = JSON.parse( strTempDB );
} );//*/

class RoleMe extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'roleme',
      group: 'util',
      memberName: 'roleme',
      description: 'Add or remove roles from self.',
    } );
  }

  async run( message, args ) {
    message.client.user.setStatus( 'online' );    
    const arrArgs = args.split( ' ' );
    if ( arrArgs !== undefined ) {
      var strCommand = arrArgs[ 0 ].toLowerCase();
      var strRole = arrArgs.slice( 1 ).join( ' ' );
    } else {
      strCommand = false;
    }
    var guilds = [];
    for ( var keyGuilds in objRoles ) {
      guilds.push( keyGuilds );
    }
    var objByGroupRaw = {};
    for ( var keyRoles in objRoles[ message.guild.id ] ) {
      var role = objRoles[ message.guild.id ][ keyRoles ];
      role.groups.forEach( function( group ) {
        if ( objByGroupRaw[ group ] === undefined ) {
          objByGroupRaw[ group ] = { name: group, members: [ role.name ] };
        } else {
          objByGroupRaw[ group ].members.push( role.name );
        }
        objByGroupRaw[ group ].members.sort();
      } );
    }
    var objByGroup = {};
    Object.keys( objByGroupRaw ).sort().forEach( function( key ) {
      objByGroup[ key ] = objByGroupRaw[ key ];
    } );
    var strKeyMatch = strRole.toLowerCase().replace( ' ', '' );
    switch ( strCommand ) {
      case 'add'    :
        var boolRoleIsAvailable = false;
        /*
          Find the id for the role if and it's available to give.
        */
        if ( boolRoleIsAvailable ) {
          message.author
            .addRole( message.guild.roles.find( 'name', 'MonsterPlayer' ), 'User was a forgiven and ' + message.author.tag + ' had me re-add this role.' )
            .catch( errAddRole => {
              console.error( 'Unable to give ' + message.author.tag + ' the ' + strRole +
                ' role in ' + message.guild.name + '#' + message.channel.name + ' at ' +
                ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errAddRole
              );
            } );
        }
        else {
          message.channel.send( 'I\'m sorry, ' + message.author + ', but **' + strRole + '** is not available as a **RoleMe** option in **' + message.guild.name + '**.' );
        }
        break;
      case 'deny'   :
        var boolWasRemoved = false;
        for ( var keyGroup in objByGroup ) {
          if ( strKeyMatch === keyGroup ) {
            await objByGroup[ keyGroup ].members.pop( strKeyMatch );
            boolWasRemoved = await true;
          }
        }
        if ( boolWasRemoved ) {
          message.channel.send( '`' + strRole + '` was removed from the list of allowed roles in **' + message.guild.name + '**.' );
        } else {
          message.channel.send( '`' + strRole + '` was not in the list of allowed roles in **' + message.guild.name + '**.' );
        }
        break;
      case 'help'   :
        message.author.send( 'This command will allow you to set most of your own game related roles!\n' );
      case 'lst'    :
      case 'list'   :
        if ( message.guild.embedEnabled ) {
          message.channel.send( 'send an embed' );
        } else {
          if ( guilds.indexOf( message.guild.id ) === -1 ) {
            var nonEmbed = message.author + ' I\'m sorry, **' + message.guild.name + '** currently has no available **RoleMe** roles.';
          } else {
            var nonEmbed = message.author + ' the available **RoleMe** roles on **' + message.guild.name + '** are:';
            for ( var keyGroup in objByGroup ) {
              var group = objByGroup[ keyGroup ];
              nonEmbed += '\n\t--- **' + group.name + '** ---';
              group.members.forEach( function ( member ) {
                nonEmbed += '\n\t\t' + member;
              } );
              nonEmbed += '\n';
            }
          }
          if ( strCommand !== 'help' ) {
            message.delete().catch( errDelete => { console.error( 'Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errDelete ); } );
            message.channel.send( nonEmbed );
          } else {
            message.author.send( nonEmbed ).then( dm => {
              message.react( '%E2%9C%85' ).catch( errSentReact => { console.error( 'Unable to react to ' + message.author.tag + '\'s message in "' + message.guild.name + '#' + message.channel.name + '" on ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errSentReact ); } );
            } ).catch( errNotSent => {
              message.react( '%E2%9D%8C' ).then( r => {
                message.channel.send( message.author + ', you\'ll need to accept DMs from members of this server in order to get a list of available **RoleMe** roles DMed to you.' );
              } ).catch( errNotSentReact => {
                message.channel.send( 'Can anyone tell ' + message.author + ' that they\'ll need to unblock me in order to get a list of available **RoleMe** roles DMed to them. ^^  @here' );
                console.error( 'Unable to react to ' + message.author.tag + '\'s message in "' + message.guild.name + '#' + message.channel.name + '" on ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errNotSentReact );
              } );
              console.error( 'Unable to respond to ' + message.author.tag + '\'s message in "' + message.guild.name + '#' + message.channel.name + '" on ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errNotSent );
            } );
          }
        }
        break;
      case 'permit'   :
        message.channel.send( 'add role ' + strRole + ' to the list of allowed roles in the server' );
        break;
/*        case 'txt'   :
        var nonEmbed = 'RoleMe roles on **' + message.guild.name + '**:';
        objRoles.forEach( function( group, oi ) {
          nonEmbed += '\n' + group;
          group.forEach( function( role, ii ) {
            nonEmbed += '\n' + role;
          } );
        } );
        message.channel.send( nonEmbed );
        break;//*/
      case 'rem'    :
      case 'remove' :
        message.channel.send( 'remove role ' + strRole + ' and send an embed with result' );
        break;
      default       :
        message.reply( 'I think you left something out.  Try using `!roleme (add|remove|permit|deny|list|help) <role>` instead of `!roleme ' + args + '`' );
    }
  }
}

module.exports = RoleMe;