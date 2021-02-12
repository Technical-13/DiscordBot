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

class WhoAmI extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'whoami',
      group: 'util',
      memberName: 'whoami',
      description: 'Find out who you are to me.'
    } );
  }
  
  async run( message, args ) {
    var isBot = message.author.bot;
    var guild = null;
    var arrAuthorized = settings[ bot ].owners.concat( settings[ bot ].moderators );
    var isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, isSysop = false, isMod = false, isStaff = false;
    var sysopRole = false, modRole = false, staffRole = false;
    var isMoorMaster = false, isMonsterPlayer = false, isTroll = false, isEveryone = false, isStaffNom = false, isNitro = false;
    var canManage = false, canInvite = false;
    var thisUser = jsonUsers[ message.author.id ];// Default to new user if not exist// getJsonUser( message.author.id )
    var thisGuild = null;
    if ( message.guild ) {
      guild = message.guild;
      thisGuild = thisUser.guilds[ guild.id ];// Add user to guild if not exist// getJsonUserGuild( message.author.id, guild.id )
      var member = guild.members.get( message.author.id );
      isCrown = ( message.author.id === guild.owner.user.id ? true : false );
      isAdmin = false;
      var objAdminRoles = [];
      guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { objAdminRoles[ objAdminRoles.length ] = role; }
      } );
      objAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) {
          isAdmin = true;
        }
      } );
      isNitro = await ( message.guild.roles.find( role => { if ( role.name === 'Nitro Booster' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'Nitro Booster' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      if ( guild.id === '201024322444197888' ) {
        sysopRole = guild.roles.get( '201710817614364673' );
        isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        modRole = guild.roles.get( '201710877143990272' );
        isMod = await ( modRole && ( modRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        staffRole = guild.roles.get( '201710935788748800' );
        isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isMoorMaster = await ( message.guild.roles.find( role => { if ( role.name === 'Moor Masters' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'Moor Masters' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isMonsterPlayer = await ( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'MonsterPlayer' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isTroll = await ( message.guild.roles.find( role => { if ( role.name === 'Discord Troll' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'Discord Troll' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isEveryone = await ( message.guild.roles.find( role => { if ( role.name === 'everyone' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'everyone' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        isStaffNom = await ( message.guild.roles.find( role => { if ( role.name === 'Moi' ) { return role; } } ) && ( message.guild.roles.find( role => { if ( role.name === 'Moi' ) { return role; } } ).members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      }
      var objAuthorPerms = ( await guild.fetchMember( message.author.id ).catch( errFetchMbr => { console.error( '%o: Unable to fetch member for %s (%s): %o', strNow(), message.author.tag, message.author.id, errFetchMbr ); } ) ).permissions;
      canManageServer = ( objAuthorPerms.has( 'MANAGE_GUILD' ) ? true : false );
      canManageRoles = ( objAuthorPerms.has( 'MANAGE_ROLES' ) ? true : false );
      canInvite = ( objAuthorPerms.has( 'CREATE_INSTANT_INVITE' ) ? true : false );
    }
    strKnownToMeAs = 'You are known to me as ';
  }
}

module.exports = WhoAmI;