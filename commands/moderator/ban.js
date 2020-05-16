const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objTimeString = {
  year: 'numeric',  month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var settings = require( path.join( __dirname, '../../../settings.json' ) );
const bot = 'LOTRObot';

class BanUser extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'ban',
      group: 'moderator',
      memberName: 'ban',
      aliases: [ 'banned' ],
      format: '@User [, @User, <@UserID>, ...] [days to delete] [Ban reason]',
      description: 'Command for guild Administrators to easily ban a member.'
    } );
  }

  async run( message, strArgs ) {
    var command = message.content.split( ' ' )[ 0 ].substr( 1 );
    var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var objAdminRoles = [];
    var isCrown = false;
    var isAdmin = false;
    if ( message.guild ) {
      isCrown = ( message.author.id === message.guild.owner.user.id ? true : false );
      message.guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) {
          objAdminRoles.push( role );
        }
      } );
      objAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdmin = true;
        }
      } );
    }
    
    if ( command === 'banned' || strArgs.toUpperCase() === 'LIST' ) {
      message.guild.fetchBans().then( async colBans => {
        message.channel.send( '<:banhammer:510515819772379137><:banhammer:510515819772379137>**__List of banned users:__**\n' );
        await colBans.forEach( async memberBanned => {
          await message.guild.fetchBan( memberBanned.id ).then( memberBanInfo => {
            message.channel.send( '\n:name_badge:**Name:** __' +
              memberBanInfo.user.username + '#' + memberBanInfo.user.discriminator
              + '__ :id:' + memberBanInfo.user.id +
              ' **Reason:**\n\t' + memberBanInfo.reason.replace( /[\n\r]/g, ' ' ).replace( /(https?:\/\/[^\s]*)/g, '<$1>' ) );
          } );
        } );
      } );
      message.delete( { reason: 'Cleaning up request from ' + message.author.tag + ' to list banned members.' } ).catch( delError => { console.log( 'Unable to delete ' + message.author.tag + '\'s request to list banned members in ' + message.guild.id + '#' + message.channel.id + ' (' + message.guild.name + '#' + message.channel.name + ')' ); } );
    }
    else if ( message.guild.id === '201024322444197888' ) {
      var strStaffChanID = '201689362906218497';
      var objModRole = false;
      var isMod = false;
      var objStaffRole = false;
      var isStaff = false;
      if ( message.guild ) {
        objModRole = await message.guild.roles.get( '201710877143990272' );
        isMod = await ( objModRole && ( objModRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        objStaffRole = await message.guild.roles.get( '201710935788748800' );
        isStaff = await ( objStaffRole && ( objStaffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      }
      if ( isOwner || isCrown || isAdmin || isMod ) {
        var arrUnbannable = [];
        var arrArgs = strArgs.split( ' ' );
        var arrBanList = strArgs.match( /<@!?(\d*)>/g );
        var intToBan = ( arrBanList == null ? 0 : ( arrBanList.length ) );
        if ( intToBan >= 1 ) {
          var intReqDel = parseInt( arrArgs[ intToBan ] );
          var boolDaysSet = ( isNaN( intReqDel ) ? false : true );
          var intDelDays = ( boolDaysSet ? ( intReqDel >= 7 ? 7 : ( intReqDel <= 0 ? 0 : intReqDel ) ) : 0 );
          if ( boolDaysSet && ( intReqDel < 0 || intReqDel > 7 ) ) {
            console.warn( 'Days of posts to clear autocorrected to ' + intDelDays + ' due to being out of range 0-7 at ' + intReqDel );
          }
          var hasBanReason = ( arrArgs.length > ( intToBan + ( boolDaysSet ? 1 : 0 ) ) ? true : false );
          if ( hasBanReason ) {
            var strBanReason = message.author.tag + ' - ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + ( arrArgs.length > ( intToBan + ( boolDaysSet ? 1 : 0 ) ) ? arrArgs.slice( intToBan + ( boolDaysSet ? 1 : 0 ) ).join( ' ' ) : 'unspecified' );
            arrBanList.forEach( async function( lstMember ) {
              var intMemberID = lstMember.replace( /(<@!?|>)/g, '' );
              var objMember = message.guild.members.get( intMemberID );
              var boolMemberStaff = await ( objStaffRole && ( objStaffRole.members.keyArray() ).indexOf( intMemberID ) !== -1 ? true : false );
              var boolMemberMod = await ( objModRole && ( objModRole.members.keyArray() ).indexOf( intMemberID ) !== -1 ? true : false );
              var boolBannable = objMember.bannable;
              if ( boolMemberStaff || boolMemberMod ) {
                boolBannable = false;
              }
              if ( boolBannable ) {
                objMember
                  .ban( { days: intDelDays, reason: strBanReason } )
                  .catch( banError => {
                    arrUnbannable.push( intMemberID );
                    console.error( 'Encountered an error attempting to ban ' + objMember.tag + ' from ' + message.guild.name + '#' + message.guild.id + ': ' + banError );
                  } );
              } else {
                arrUnbannable.push( intMemberID );
              }
            } );
            if ( arrUnbannable.length !== 0 ) {
              var arrUnbanned = [];
              arrUnbannable.forEach( function( member ) {
                if ( arrUnbanned.indexOf( member ) === -1 ) {
                  arrUnbanned.push( member );
                }
              } );
              message.reply( 'sorry, I was unable to kick: <@' + arrUnbanned.join( '> - <@' ) + '>' );
            }
          } else {
            var arrNoReasonIDs = [];
            var arrNoReasonUNs = [];
            arrBanList.forEach( function( lstMember ) {
              var intBaneeID = lstMember.replace( /(<@!?|>)/g, '' );
              var objBaneeUser = message.client.users.get( intBaneeID );
              arrNoReasonIDs.push( intBaneeID );
              arrNoReasonUNs.push( objBaneeUser.tag );
            } );
            message.client.channels.get( strStaffChanID ).send( 'I\'m sorry, I\'m unable to ban <@' + arrNoReasonIDs.join( '> - <@' ) + '> for you ' + message.author + ' because you failed to provide a reason.  Please try again in the form of: `!ban @' + arrNoReasonUNs.join( ' @' ) + ' [days] [reason for ban]` or `!ban <@' + arrNoReasonIDs.join( '> <@' ) + '> [days] [reason for ban]`' );
          }
        }
      }
      else if ( isOwner ) {
        console.log( 'You\'re my owner, but you can\'t currently make me do that here yet.' );
      }
      message.delete( { reason: 'Cleaning up request from ' + message.author.tag + ' to ban members.' } ).catch( delError => { console.log( 'Unable to delete ' + message.author.tag + '\'s request to ban members in ' + message.guild.id + '#' + message.channel.id + ' (' + message.guild.name + '#' + message.channel.name + ')' ); } );
    }
    else {
      message.reply( 'I\'m sorry, this command is currently only available for the official **The Lord of the Rings Discord** server: <https://discord.gg/9tMaHUn>' );
    }
  }
}

module.exports = BanUser;