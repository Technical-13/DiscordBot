const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objTimeString = {
  year: 'numeric',  month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var settings = require( path.join( __dirname, '../../../settings.json' ) );
const bot = 'LOTRObot';
const strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const isEnabled = true;

class NaughtyUser extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'bandrim',
      group: 'moderator',
      memberName: 'bandrim',
      format: '@User [, @User, <@UserID>, ...] [reason]',
      description: 'Command for guild Administrators to easily throw member(s) of LotRODiscord in the <#325399391223414786>.'
    } );
  }

  async run( message, strArgs ) {if(message.guild.id==='201024322444197888' && ( isEnabled )){
    const client = message.client;
    var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var objAdminRoles = [];
    var isAdmin = false;
    var objModRole = false;
    var isMod = false;
    var objStaffRole = false;
    var isStaff = false;
    var strStaffChanID = '201689362906218497';
    if ( message.guild ) {
      objModRole = await message.guild.roles.get( '201710877143990272' );
      isMod = await ( objModRole && ( objModRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      objStaffRole = await message.guild.roles.get( '201710935788748800' );
      isStaff = await ( objStaffRole && ( objStaffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
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
    
    if ( isStaff || isMod || isAdmin ) {
      var arrUnGlamable = [];
      var arrArgs = strArgs.split( ' ' );
      var arrGlamList = strArgs.match( /<@!?(\d*)>/g );
      var intToGlam = ( arrGlamList == null ? 0 : ( arrGlamList.length ) );
      if ( intToGlam >= 1 ) {
        var hasGlamReason = ( arrArgs.length > intToGlam ? true : false );
        if ( hasGlamReason ) {
          var strGlamReason = message.author.tag + ' - ' + strNow + ': ' + ( arrArgs.length > intToGlam ? arrArgs.slice( intToGlam ).join( ' ' ) : 'unspecified' );
          var arrGlamed = [];
          console.log( 'intToGlam: %i; arrGlamList.length: %i', intToGlam, arrGlamList.length );
          arrGlamList.forEach( async function( lstMember ) {
            var intMemberID = lstMember.replace( /(<@!?|>)/g, '' );
            console.log('intMemberID: %o',intMemberID);
            var objMember = message.guild.members.get( intMemberID );
            var boolMemberMod = await ( objModRole && ( objModRole.members.keyArray() ).indexOf( intMemberID ) !== -1 ? true : false );
            var boolMemberStaff = await ( objStaffRole && ( objStaffRole.members.keyArray() ).indexOf( intMemberID ) !== -1 ? true : false );
            var boolGlamable = ( ( boolMemberMod || boolMemberStaff ) ? false : true );
            if ( boolGlamable ) {
              objMember
                .addRole( '203268031982338049', strGlamReason )
                .then( objGlamed => {
                  console.log( '(objGlamed): objMember.id: %o', objMember.id );
                  arrGlamed.push( objMember.id );                  
                  message.channel.fetchMessages( { limit: 100 } ).then( messages => {
                    let arrMessages = messages.array();
                    arrMessages = arrMessages.filter( thisMessage => thisMessage.author.id === objMember.id && ( new Date() ).valueOf() <= ( thisMessage.createdTimestamp + 3600 ) && !thisMessage.system );
                    arrMessages.length = ( 100 < arrMessages.length ? 100 : arrMessages.length );
                    message.channel.bulkDelete( arrMessages )
                      .catch( errDel => { console.error( '%s: !bandrim encountered an error attempting to bulkDelete messages: %o', strNow, errDel ); } );
                  } );
                  intToGlam--;
                } ).catch( errGlam => {
                  console.log( '(errGlam): objMember.id: %o', objMember.id );
                  arrUnGlamable.push( objMember.id );
                  console.error( 'Encountered an error attempting to throw ' + objMember.user.tag + ' (' + objMember + ') into the <#325399391223414786>: ' + errGlam );
                  intToGlam--;
                } );
            } else {
              arrUnGlamable.push( intMemberID );
              intToGlam--;
            }
          } );
          var doneGlammingTimeOut = 300;
          var doneGlamming = client.setInterval( function() {
            console.log( 'intToGlam (%i): %o', doneGlammingTimeOut, intToGlam );
            if ( intToGlam === 0 ) {
              console.log( 'arrGlamed: %o', arrGlamed );
              console.log( 'arrUnGlamable: %o', arrUnGlamable );
              if ( arrGlamed.length !== 0 ) {
                var strWelcomeParty = '<@';
                arrGlamed.forEach( function( intWelcomee, intNdx ) {
                  if ( arrGlamed.length === 1 || ( arrGlamed.length >= 2 && intNdx === ( arrGlamed.length - 1 ) ) ) {
                    strWelcomeParty += intWelcomee;
                  } else if ( arrGlamed.length === 2 && intNdx === 0 ) {
                    strWelcomeParty += intWelcomee + '> and <@';
                  } else if ( arrGlamed.length > 2 ) {
                    if ( intNdx <= ( arrGlamed.length - 2 ) ) {
                      strWelcomeParty += intWelcomee + '>, <@';                  
                    } else if ( intNdx === ( arrGlamed.length - 2 ) ) {
                      strWelcomeParty += intWelcomee + '>, and <@';
                    }
                  }
                } );
                strWelcomeParty += '>';
                console.log( 'strWelcomeParty: %o', strWelcomeParty );
                message.guild.channels.get( '325399391223414786' ).send( strWelcomeParty + ', welcome to the <#325399391223414786>!  This is a place where ' + objStaffRole + ' members of this server put people who are causing disruption to the server to give them a chance to settle down and talk it out.' );
                message.channel.send( strWelcomeParty + ' ' + ( arrGlamed.length === 1 ? 'has' : 'have' ) + ' safely arrived in the <#325399391223414786> and their 100 previous messages have been deleted forever!  Sorry for any disruption they may have caused ~-~ ' + message.guild.name + ' management.' );
              }
              if ( arrUnGlamable.length !== 0 ) {
                var strUnGlamable = '<@';
                arrUnGlamable.forEach( function( intWelcomee, intNdx ) {
                  if ( arrUnGlamable.length === 1 || ( arrUnGlamable.length >= 2 && intNdx === ( arrUnGlamable.length - 1 ) ) ) {
                    strUnGlamable += intWelcomee;
                  } else if ( arrUnGlamable.length === 2 && intNdx === 0 ) {
                    strUnGlamable += intWelcomee + '> or <@';
                  } else if ( arrUnGlamable.length > 2 ) {
                    if ( intNdx <= ( arrUnGlamable.length - 2 ) ) {
                      strUnGlamable += intWelcomee + '>, <@';                  
                    } else if ( intNdx === ( arrUnGlamable.length - 2 ) ) {
                      strUnGlamable += intWelcomee + '>, or <@';
                    }
                  }
                } );
                strUnGlamable += '>';
                console.log( 'strUnGlamable: %o', strUnGlamable );
                message.channel.send( 'Sorry, I was unable to throw ' + strUnGlamable + ' into the <#325399391223414786>.' );
              }
              client.clearInterval( doneGlamming );
            }
            if ( doneGlammingTimeOut === 0 ) {
              console.error( 'Timed out running: !bandrim %o', strArgs );
              client.clearInterval( doneGlamming );
            } else {
              doneGlammingTimeOut--;
            }
          }, 100 );
        } else {
          var arrNoReasonIDs = [];
          var arrNoReasonUNs = [];
          arrGlamList.forEach( function( lstMember ) {
            var intGlameeID = lstMember.replace( /(<@!?|>)/g, '' );
            var objGlameeUser = message.client.users.get( intGlameeID );
            arrNoReasonIDs.push( intGlameeID );
            arrNoReasonUNs.push( objGlameeUser.tag );
          } );
          message.client.channels.get( strStaffChanID ).send( 'I\'m sorry, I\'m unable to throw <@' + arrNoReasonIDs.join( '> - <@' ) + '> into the <#325399391223414786> for you ' + message.author + ' because you failed to provide a reason.  Please try again in the form of: `!bandrim @' + arrNoReasonUNs.join( ' @' ) + ' [reason]` or `!bandrim <@' + arrNoReasonIDs.join( '> <@' ) + '> [reason]`' );
        }
      }
    }
    else if ( isOwner ) {
      console.log( 'You\'re my owner, but you can\'t currently make me do that here yet.' );
    }
    message.delete( { reason: 'Cleaning up request from ' + message.author.tag + ' to throw members.' } ).catch( delError => { console.log( 'Unable to delete ' + message.author.tag + '\'s request to throw members into the <#325399391223414786>.' ); } );
	}else{message.reply( 'I\'m sorry, this command is currently only available for the official **The Lord of the Rings Discord** server: <https://discord.gg/9tMaHUn>' );} }
}

module.exports = NaughtyUser;