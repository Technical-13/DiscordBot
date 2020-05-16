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

class SayThis extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'say',
      group: 'util',
      memberName: 'say',
      description: 'Make the bot speak.'
    } );
  }
  
  async run( message, args ) {console.log('%o: args: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ),args);
    const isBot = message.author.bot;
    const client = message.client;
    var guild = null;
    var arrOwnerIDs = settings[ bot ].owners, arrBotModIds = settings[ bot ].moderators, arrOwners = [];
    await arrOwnerIDs.forEach( function( owner ) { arrOwners.push( client.fetchUser( owner ) ); } );
    const isOwner = ( arrOwnerIDs.indexOf( message.author.id ) !== -1 ? true : false );
    const isBotMod = ( arrBotModIds.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, canManage = false;
    if ( message.guild ) {
      guild = message.guild;
      isCrown = ( message.author.id === guild.owner.user.id ? true : false );
      var arrAdminRoles = [], arrManageRoles = [];
      guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
        if ( ( new Discord.Permissions( role.permissions ) ).has( 32 ) ) { arrManageRoles.push( role ); }
      } );
      arrAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) {
          isAdmin = true;
        }
      } );
      arrManageRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === guild.ownerID ) {
          canManage = true;
        }
      } );
      if ( guild.id === '201024322444197888' ) {
        var sysopRole = await guild.roles.get( '201710817614364673' );
        var isSysop = await ( sysopRole && ( sysopRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        var modRole = await guild.roles.get( '201710877143990272' );
        var isMod = await ( modRole && ( modRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        var staffRole = await guild.roles.get( '201710935788748800' );
        var isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        var moorMasterRole = await guild.roles.get( '449348961787052032' );
        var isMoorMaster = await ( moorMasterRole && ( moorMasterRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
        var monsterPlayerRole = await guild.roles.get( '392105529411108864' );
        var isMonsterPlayer = await ( monsterPlayerRole && ( monsterPlayerRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      }
    }

    const arrArgs = args.split( ' ' );console.log( '%s: `!say` fired: %o', strNow(), arrArgs );
    var intArgs = arrArgs.length;
    
    var msgChannel = ( arrArgs[ 0 ].match( /<#([\d]*)>/ ) ? arrArgs[ 0 ].match( /<#([\d]*)>/ )[ 1 ] : message.channel.id );
    msgChannel = ( client.channels.has( msgChannel ) ? await client.channels.get( msgChannel ) : message.channel );
    var msgGuild = msgChannel.guild;
    if ( msgChannel.id !== message.channel.id ) { args = arrArgs.slice( 1 ).join( ' ' ); }
    if ( !( isOwner || isBotMod ) && !msgGuild.channels.has( msgChannel.id ) ) {
      message.delete( { reason: 'Refusing `!say` command outside of the current server for someone without permission.' } ).then( message => { message.channel.send( message.author + ', I\'m very sorry, but you can\'t send `' + args + '` to **' + msgGuild.name + '#' + msgChannel.name + '**' ); } ).catch( errDel => { console.error( '%s: Unable to delete say request: %o', strNow(), errDel ); } );
      console.info( message.author.tag + ' attempted to `!say ' + arrArgs.join( ' ' ) + '` from ' + msgGuild.name + '#' + message.channel.name + ' (<#' + message.channel.id + '>)' );
    } else if ( !( isOwner || isBotMod || isCrown || isAdmin ) && /[nN][oO0]*[bB]/.test( args ) ) {
      message.delete( { reason: 'Refusing `!say` command with some variation of `n00b` in it.' } ).then( message => { msgChannel.send( message.author + ', You\'re a n00b!  You can\'t make me say that!  Use the `!n00b` command instead!' ); } ).catch( errDel => { console.error( '%s: Unable to delete say request: %o', strNow(), errDel ); } );
    } else if ( !message.mentions.everyone || ( message.mentions.everyone && !msgGuild.large ) ) {
      message.delete( { reason: 'Processing `!say` command.' } ).then( message => { msgChannel.send( args ); } ).catch( errDel => { console.error( '%s: Unable to delete say request: %o', strNow(), errDel ); } );
    } else if ( isOwner ) {
      message.delete( { reason: 'Processing `!say` command mentioning @here or @everyone for an owner.' } ).then( message => { msgChannel.send( args ); } ).catch( errDel => { console.error( '%s: Unable to delete say request: %o', strNow(), errDel ); } );
    } else {
      message.delete( { reason: 'Refusing `!say` command with a @here or @everyone for someone who\'s not a bot owner.' } ).then( message => { msgChannel.send( message.author + ', You\'re a n00b!  You can\'t make me mention that many people on a large server!  Consider this your warning, a moderator may take action next time.  Thanks!' ); } ).catch( errDel => { console.error( '%s: Unable to delete say request: %o', strNow(), errDel ); } );
    }
  }
}

module.exports = SayThis;