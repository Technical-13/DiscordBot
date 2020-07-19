const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objTimeString = {
  year: 'numeric',  month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var settings = require( path.join( __dirname, '../../../settings.json' ) );

class KickUser extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'kick',
      group: 'moderator',
      memberName: 'kick',
      format: '@User [, @User, <@UserID>, ...] [Kick reason]',
      description: 'Command for guild Administrators to easily kick a member.'
    } );
  }

  async run( message, strArgs ) {if(message.guild.id==='201024322444197888'){
    var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = await ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false;
    var objAdminRoles = [], isAdmin = false;
    var objModRole = false, isMod = false;
    var objStaffRole = false, isStaff = false;
    var strStaffChanID = '201689362906218497';
    if ( message.guild ) {
      isCrown = ( message.author.id === message.guild.owner.user.id ? true : false );
      objModRole = await message.guild.roles.get( '201710877143990272' );
      isMod = await ( objModRole && ( objModRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      objStaffRole = await message.guild.roles.get( '201710935788748800' );
      isStaff = await ( objStaffRole && ( objStaffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      message.guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { objAdminRoles.push( role ); }
      } );
      objAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdmin = true;
        }
      } );
    }
    
    if ( isOwner || isBotMod || isCrown || isAdmin || isMod || isStaff ) {
      var arrUnkickable = [];
      var arrArgs = strArgs.split( ' ' );
      var arrKickList = strArgs.match( /<@!?(\d*)>/g );
      var intToKick = ( arrKickList == null ? 0 : ( arrKickList.length ) );
      if ( intToKick >= 1 ) {
        var hasKickReason = ( arrArgs.length > intToKick ? true : false );
        if ( hasKickReason ) {
          var strKickReason = message.author.tag + ' - ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + ( arrArgs.length > intToKick ? arrArgs.slice( intToKick ).join( ' ' ) : 'unspecified' );
          arrKickList.forEach( async function( lstMember ) {
            var intMemberID = lstMember.replace( /(<@!?|>)/g, '' );
            var objMember = message.guild.members.get( intMemberID );
            var boolMemberMod = await ( objModRole && ( objModRole.members.keyArray() ).indexOf( intMemberID ) !== -1 ? true : false );
            var boolMemberStaff = await ( objStaffRole && ( objStaffRole.members.keyArray() ).indexOf( intMemberID ) !== -1 ? true : false );
            var objSixtyRole = await message.guild.roles.get( '453212243094536206' );
            var boolMemberSixty = await ( objSixtyRole && ( objSixtyRole.members.keyArray() ).indexOf( intMemberID ) !== -1 ? true : false );
            var boolKickable = objMember.kickable;
            if ( boolMemberMod || boolMemberStaff ) { boolKickable = false; }
            if ( !( isOwner || isBotMod || isCrown || isAdmin || isMod ) && !boolMemberSixty ) { boolKickable = false; }
            if ( boolKickable ) {
              objMember.kick( strKickReason )
                .catch( kickError => {
                  arrUnkickable.push( intMemberID );
                  console.error( 'Encountered an error attempting to kick ' + objMember.user.tag + ' from ' + message.guild.name + '#' + message.guild.id + ': ' + kickError );
                } );
            }
            else { arrUnkickable.push( intMemberID ); }
          } );
          if ( arrUnkickable.length !== 0 ) {
            var arrUnkicked = [];
            arrUnkickable.forEach( function( member ) {
              if ( arrUnkicked.indexOf( member ) === -1 ) { arrUnkicked.push( member ); }
            } );
            console.log( 'arrUnkicked has ' + arrUnkicked.length + ' unique members.' );
            message.reply( 'sorry, I was unable to kick: <@' + arrUnkicked.join( '> - <@' ) + '>' );
          }
        } else {
          var arrNoReasonIDs = [];
          var arrNoReasonUNs = [];
          arrKickList.forEach( function( lstMember ) {
            var intKickeeID = lstMember.replace( /(<@!?|>)/g, '' );
            var objKickeeUser = message.client.users.get( intKickeeID );
            arrNoReasonIDs.push( intKickeeID );
            arrNoReasonUNs.push( objKickeeUser.tag );
          } );
          message.client.channels.get( strStaffChanID ).send( 'I\'m sorry, I\'m unable to kick <@' + arrNoReasonIDs.join( '> - <@' ) + '> for you ' + message.author + ' because you failed to provide a reason.  Please try again in the form of: `!kick @' + arrNoReasonUNs.join( ' @' ) + ' [reason for kick]`' );
        }
      }
    }
    else if ( isOwner ) {
      console.log( 'You\'re my owner, but you can\'t currently make me do that here yet.' );
    }
    message.delete( { reason: 'Cleaning up request from ' + message.author.tag + ' to kick members.' } ).catch( delError => { console.log( 'Unable to delete ' + message.author.tag + '\'s request to kick members in ' + message.guild.id + '#' + message.channel.id + ' (' + message.guild.name + '#' + message.channel.name + ')' ); } );
	}else{message.reply( 'I\'m sorry, this command is currently only available for the official **The Lord of the Rings Discord** server: <https://discord.gg/9tMaHUn>' );} }
}

module.exports = KickUser;