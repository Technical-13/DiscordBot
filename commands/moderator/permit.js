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

class AllowedNick extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'permit',
      group: 'moderator',
      memberName: 'permit',
      format: '@User [allowed nickname]',
      description: 'Command for Staff to allow otherwise invalid nicknames.'
    } );
  }

  async run( message, strArgs ) {if(message.guild.id==='201024322444197888' && ( isEnabled )){
    const isBot = message.author.bot;
    const client = message.client;
    var guild = null;
    var arrOwnerIDs = settings[ bot ].owners, arrBotModIds = settings[ bot ].moderators, arrOwners = [];
    await arrOwnerIDs.forEach( function( owner ) { arrOwners.push( client.fetchUser( owner ) ); } );
    const isOwner = ( arrOwnerIDs.indexOf( message.author.id ) !== -1 ? true : false );
    const isBotMod = ( isOwner || arrBotModIds.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isTargetCrown = false;
    var objAdminRoles = [];
    var isAdmin = false, isTargetAdmin = false;
    var objModRole = false;
    var isMod = false, isTargetMod = false;
    var objStaffRole = false;
    var isStaff = false, isTargetStaff = false;
    if ( message.guild ) {
      guild = message.guild;
      isCrown = ( message.author.id === guild.ownerID ? true : false );
      objModRole = await message.guild.roles.get( '201710877143990272' );
      isMod = await ( objModRole && ( objModRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      objStaffRole = await message.guild.roles.get( '201710935788748800' );
      isStaff = await ( objStaffRole && ( objStaffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      message.guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { objAdminRoles.push( role ); }
      } );
      objAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) { isAdmin = true; }
      } );
      
      if ( isStaff || isMod || isAdmin || isCrown || isBotMod || isOwner ) {      
        var arrArgs = strArgs.split( ' ' );
        var mbrToNick = ( message.mentions.members.first() ? message.mentions.members.first() : null );// Set mbrToNick to GuildMember for person mentioned
        var newNickname = ( arrArgs.length >= 2 ? arrArgs.slice( 1 ).join( ' ' ).trim() : null );
        if ( mbrToNick && newNickname ) {
          var userToNick = mbrToNick.user;
          var isTargetOwner = ( arrOwnerIDs.indexOf( mbrToNick.id ) !== -1 ? true : false );
          var isTargetBotMod = ( isTargetOwner || arrBotModIds.indexOf( mbrToNick.id ) !== -1 ? true : false );
          isTargetCrown = ( mbrToNick.id === guild.ownerID ? true : false );
          isTargetMod = await ( objModRole && ( objModRole.members.keyArray() ).indexOf( mbrToNick.id ) !== -1 ? true : false );
          isTargetStaff = await ( objStaffRole && ( objStaffRole.members.keyArray() ).indexOf( mbrToNick.id ) !== -1 ? true : false );
          objAdminRoles.forEach( function( role, index ) {
            if ( ( role.members.keyArray() ).indexOf( mbrToNick.id ) !== -1 || mbrToNick.id === message.guild.ownerID ) { isTargetAdmin = true; }
          } );
          mbrToNick.addRole( '693020345162137610', message.author.tag + ' permitted nick change.' )
            .then( roleAdded => {
              mbrToNick.setNickname( newNickname, 'Permitting invalid nickname.' )
                .then( nickSet => { console.log( '%s\'s nickname was set to %s by %s', mbrToNick.user.tag, newNickname, message.author.tag ); } )
                .catch( async errSetNick => {
                  if ( errSetNick.code === 50013 ) {
                    console.warn( '%s: I do not have permissions to set %s\'s nickname to `%s`%s.', strNow, userToNick.username, newNickname, ( isTargetCrown ? ', They can do it themself..' : '' ) );
                    var noPermission = await message.reply( 'I do not have permission to change ' + ( isTargetCrown ? 'the guild owner' : mbrToNick.user.tag ) + '\'s nickname.' );
                    noPermission.delete( 30000 ).catch( errDel => { console.error( '%o: Unable to delete noPermission reply: %o', strNow(), errDel ); } );
                  } else {
                    console.error( '%s: Unable to set %s\'s nickname to `%s`: %o', strNow, userToNick.username, newNickname, errSetNick );
                  }
                  mbrToNick.removeRole( '693020345162137610', message.author.tag + ' permitted nick change.' )
                    .catch( errRemRole => { console.error( '%s: Error attempting to remove role `@Permitted` from %s ( %s ) after failed nick change: %o', strNow, userToNick.username, mbrToNick.id, errRemRole ); } );
                } );
            } )
            .catch( errAddRole => { console.error( '%s: Error attempting to add role `@Permitted` to %s ( %s ): %o', strNow, userToNick.username, mbrToNick.id, errAddRole ); } );
        }
        message.delete( { reason: 'Cleaning up request from ' + message.author.tag + ' to permit nickname.' } ).catch( delError => { console.error( 'Unable to delete ' + message.author.tag + '\'s request to permit nickname.' ); } );
      } else if ( !mbrToNick && !newNickname ) {
        var tryAgain = await message.reply( 'You forgot a required parameter.  Please try again with:\n`!permit @userMention New Nickname` **or** `!permit <@userID> New Nickname`' );
        tryAgain.delete( 30000 ).catch( errDel => { console.error( '%o: Unable to delete tryAgain reply: %o', strNow(), errDel ); } );
      }
    }
  } else { message.reply( 'I\'m sorry, this command is currently only available for the official **The Lord of the Rings Discord** server: <https://discord.gg/7DAQHhW>' ); } }
}

module.exports = AllowedNick;