const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const fsSettings = 'settings.json';
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
var strSettings = JSON.stringify( settings );
const fsGuilds = 'guilds.json';
var guilds = require( path.join( __dirname, '../../../' + fsGuilds ) );
var strGuilds = JSON.stringify( guilds );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const strScreenShotPath = path.join( __dirname, '../../' );
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const isDebug = true;//settings[ bot ].onError.isDebugMode;

function toBoolean( val ) {
  switch ( typeof( val ) ) {
    case 'bool':
      return val;
    case 'number':
      return ( ( val % 2 ) === 1 ? true : false );
    case 'string':
      var arrTrue = [ '+', '1', 't', 'true', 'y', 'yes', 'on' ];
      if ( arrTrue.indexOf( val.toLowerCase() ) !== -1 ) { return true; } else { return false; }
    default:
      console.warn( '%s: `!config` is returning `false` for %s: %o', strNow, typeof( val ), val );
      return false;
  }
}

class staffStatus extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'staffstatus',
      group: 'moderator',
      memberName: 'staffstatus',
      description: 'Get the current status of Staff in the ' + bot.replace( 'bot', '' ) + 'discord server',
    } );
  }

  async run( message, args ) {
    if ( message.guild ) {
      var guild = message.guild;
      if ( guild.id === '201024322444197888' ) {
        const isBot = message.author.bot;
        const client = message.client;
        const author = message.author;
        var arrOwnerIDs = settings[ bot ].owners, arrBotModIds = settings[ bot ].moderators, arrOwners = [];
        await arrOwnerIDs.forEach( function( owner ) { arrOwners.push( client.fetchUser( owner ) ); } );
        const isOwner = ( arrOwnerIDs.indexOf( author.id ) !== -1 ? true : false );
        const isBotMod = ( arrBotModIds.indexOf( author.id ) !== -1 ? true : false );
        var isCrown = false, isAdministrator = false, canManageServer = false, canManageRoles = false;
        if ( !isBot ) {
          isCrown = ( author.id === guild.ownerID ? true : false );
          var arrAdministratorRoles = [], arrManageServerRoles = [], arrManageRolesRoles = [];
          guild.roles.array().forEach( function( role, index ) {
            if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdministratorRoles.push( role ); }// ADMINISTRATOR
            if ( ( new Discord.Permissions( role.permissions ) ).has( 32 ) ) { arrManageServerRoles.push( role ); }// MANAGE_SERVER
            if ( ( new Discord.Permissions( role.permissions ) ).has( 268435456 ) ) { arrManageRolesRoles.push( role ); }// MANAGE_ROLES
          } );
          arrAdministratorRoles.forEach( function( role, index ) {
            if ( ( role.members.keyArray() ).indexOf( author.id ) !== -1 || author.id === guild.ownerID ) {
              isAdministrator = true;
            }
          } );
          arrManageServerRoles.forEach( function( role, index ) {
            if ( ( role.members.keyArray() ).indexOf( author.id ) !== -1 || author.id === guild.ownerID ) {
              canManageServer = true;
            }
          } );
          arrManageRolesRoles.forEach( function( role, index ) {
            if ( ( role.members.keyArray() ).indexOf( author.id ) !== -1 || author.id === guild.ownerID ) {
              canManageRoles = true;
            }
          } );
        }

        const arrArgs = args.split( ' ' );console.log( '%s: `!config` fired: %o', strNow, arrArgs );
        var intArgs = arrArgs.length;

        var intStaffRatio = .01;
        var intModRatio = .003;
        var intAdminRatio = .001;
        var intOwnerRatio = .0003;

        var intStaff = guild.roles.get( '201710935788748800' ).members.keyArray().length;
        var intMods = guild.roles.get( '201710877143990272' ).members.keyArray().length;
        var intAdmins = guild.roles.get( '201710817614364673' ).members.keyArray().length;
        var intOwners = guild.roles.get( '240938513598644224' ).members.filter( anOwner => { if ( !anOwner.user.bot ) { return anOwner; } } ).keyArray().length;

        var intMembers = guild.memberCount;
        var intBots = 0, intHumans = 0;
        await message.guild.members.forEach( function( member, intMemberIndex ) {
          if ( member.user.bot ) { intBots++; }
          else { intHumans++; }
        } );

        var strOutput = 'Members: **' + intMembers + '** (bots: __' + intBots + '__; humans: __' + intHumans + '__)';
        strOutput += '\n(' + ( Math.ceil( 1 / intStaffRatio ) === ( 1 / intStaffRatio ) ? '' : '≈' ) + '1 : ' + Math.ceil( 1 / intStaffRatio ) +
          ') Staff: **' + intStaff + '/' + Math.ceil( intMembers * intStaffRatio ) + '**';
        strOutput += '\n(' + ( Math.ceil( 1 / intModRatio ) === ( 1 / intModRatio ) ? '' : '≈' ) + '1 : ' + Math.ceil( 1 / intModRatio ) +
          ') Moderators: **' + intMods + '/' + Math.ceil( intMembers * intModRatio ) + '**';
        strOutput += '\n(' + ( Math.ceil( 1 / intAdminRatio ) === ( 1 / intAdminRatio ) ? '' : '≈' ) + '1 : ' + Math.ceil( 1 / intAdminRatio ) +
          ') Administrators: **' + intAdmins + '/' + Math.ceil( intMembers * intAdminRatio ) + '**';
        strOutput += '\n(' + ( Math.ceil( 1 / intOwnerRatio ) === ( 1 / intOwnerRatio ) ? '' : '≈' ) + '1 : ' + Math.ceil( 1 / intOwnerRatio ) +
          ') Owners: **' + intOwners + '/' + Math.ceil( intMembers * intOwnerRatio ) + '**';

        message.channel.send( strOutput );
      }
    }
  }
}

module.exports = staffStatus;