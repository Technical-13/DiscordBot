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
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const isDebug = true;//settings[ bot ].onError.isDebugMode;

class ServerInfo extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'server',
      group: 'util',
      memberName: 'server',
      description: 'Get information about the current server.'
    } );
  }

  async run( message, args ) {
    var guild = null, channel = message.channel;
    var arrOwnerIDs = settings[ bot ].owners, arrBotModIds = settings[ bot ].moderators;
    var arrOwners = [], arrRoledAdmins = [], arrAdmins = [], arrRoledManagers = [], arrManagers = [];
    await arrOwnerIDs.forEach( owner => { arrOwners.push( message.client.fetchUser( owner ) ); } );
    var isOwner = ( arrOwnerIDs.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = ( arrBotModIds.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, canManage = false;
    const isBot = message.author.bot;
    if ( message.guild ) {
      guild = message.guild;
      isCrown = ( message.author.id === guild.owner.user.id ? true : false );
      var arrAdminRoles = [], arrManageRoles = [];
      message.guild.roles.array().forEach( ( role, index ) => {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
        if ( ( new Discord.Permissions( role.permissions ) ).has( 32 ) ) { arrManageRoles.push( role ); }
      } );
      await arrAdminRoles.forEach( async ( role, index ) => {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdmin = true;
        }
        arrRoledAdmins = arrRoledAdmins.concat( Array.from( role.members.values() ) );        
      } );
      await arrManageRoles.forEach( async ( role, index ) => {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          canManage = true;
        }
        arrRoledManagers = arrRoledManagers.concat( Array.from( role.members.values() ) );  
      } );
      await arrRoledAdmins.forEach( async member => {
        let notCrown = ( member.id !== guild.ownerID ? true : false );
        let notBot = !member.user.bot;
        if ( notCrown && notBot ) { arrAdmins.push( member ); }
      } );
      await arrRoledManagers.forEach( async member => {
        let notCrown = ( member.id !== guild.ownerID ? true : false );
        let notAdmin = ( arrAdmins.indexOf( member ) === -1 ? true : false );
        let notBot = !member.user.bot;
        if ( notCrown && notAdmin && notBot ) { arrManagers.push( member ); }
      } );
      arrAdmins = await arrAdmins.sort( ( a, b ) => { return a.joinedTimestamp - b.joinedTimestamp; } );
      arrManagers = await arrManagers.sort( ( a, b ) => { return a.joinedTimestamp - b.joinedTimestamp; } );
      const intAdmins = arrAdmins.length, intManagers = arrManagers.length;
      const arrRoles = guild.roles.array().sort( ( a, b ) => { return a.position - b.position } );
      const intRoles = arrRoles.length;
      const arrArgs = ( args.split( ' ' ).length === 1 && args.split( ' ' )[ 0 ] === '' ? [] : args.split( ' ' ) );
      
      var intArgs = arrArgs.length;console.log( '%s: `!server` fired in "%s#%s" by %s (<#%s>-<@%s>): %o', strNow, guild.name, channel.name, message.author.tag, channel.id, message.author.id, arrArgs );
      if ( intArgs !== 0 ) {
        switch ( arrArgs[ 0 ].toLowerCase() ) {
          case ( RegExp( '(admin(istrator)?|manager|owner)s?' ).test( arrArgs[ 0 ].toLowerCase() ) ? arrArgs[ 0 ].toLowerCase() : false ) :
            if ( !isBot ) {
              message.reply( 'the owner of this server is <@' + guild.ownerID + '>**#**' + guild.owner.user.discriminator + ' (' + guild.owner.user.username + ':id:' + guild.ownerID + ')\n' +
                ( intAdmins > 0 ? '\tAdministrator' + ( intAdmins !== 1 ? 's' : '' ) + ': ' + arrAdmins.join( ' - ' ) + '\n' : '' ) +
                ( intManagers > 0 ? '\tServer Manager' + ( intManagers !== 1 ? 's' : '' ) + ': ' + arrManagers.join( ' - ' ) + '' : '' ) );
            }
              break;
          case 'icon':
            if ( !isBot ) {
              if ( guild.iconURL ) {
                let guildIconURL = ( guild.icon.substr( 0, 2 ) === 'a_' ? guild.iconURL.replace( /\.(jpg|png)/i, '.gif' ) : guild.iconURL );
                message.reply( 'the current icon screen is: <' + guildIconURL + '>', { files: [ { attachment: guildIconURL + '?size=256', name: 'Icon.gif' } ] } );
              } else {
                message.reply( 'this guild, **' + guild.name + '**, does not currently have an icon.' );
              }
            }
            break;
          case 'role': case'roles':
            if ( !isBot ) {
              var intChunk = 0;
              var strRoles = '';
              arrRoles.forEach( ( role, index ) => {
                let arrRole = [];
                if ( role.managed ) { arrRole.push( 'managed' ); }
                if ( role.mentionable ) { arrRole.push( 'mentionable' ); }
                if ( role.hoist ) { arrRole.push( 'hoisted' ); }
                strRoles += '@' + role.name.replace( '@', '' ) + ( arrRole.length > 0 ? ' is a ' + arrRole.join( ', ' ) + ' role' + ( arrRole.length > 1 ? ',' : '' ) + ' and it' : '' ) + ' has **' + ( role.members.size === 0 ? 'no' : role.members.size ) + '** member' + ( role.members.size === 1 ? '' : 's' ) + '.\n';
              } );
              var arrStrRoles = [ strRoles ];
              if ( strRoles.length >= 2000 ) {
                let tempString = strRoles;
                do {
                  arrStrRoles[ intChunk ] = tempString.substr( 0, ( tempString.replace(/[\r\n]*'/g,'\n').indexOf( '\n', 1500 ) === -1 ? tempString.length : tempString.replace(/[\r\n]*'/g,'\n').indexOf( '\n', 1500 ) ) );
                  tempString = tempString.substring( ( tempString.replace(/[\r\n]*'/g,'\n').indexOf( '\n', 1500 ) === -1 ? tempString.length : tempString.replace(/[\r\n]*'/g,'\n').indexOf( '\n', 1500 ) ) );
                  intChunk++;;
                } while ( tempString.length > 0 );
              }
              arrStrRoles.forEach( ( strChunk, intMyChunk ) => {
                if ( intMyChunk === 0 ) {
                  message.author.send( '**' + guild.name + '** has ' + intRoles + ' roles with following member counts: \n' + arrStrRoles[ 0 ] );
                } else {
                  message.author.send( arrStrRoles[ intMyChunk ] );
                }
                if ( intMyChunk >= ( intChunk - 1 ) ) {
                  message.reply( 'this server has ' + intRoles + ' roles, details of each role have been sent in a DM' );
                }
              } );
            }
            break;
          case 'splash':
            if ( !isBot ) {
              if ( guild.splashURL ) {
                message.reply( 'the current splash screen is: <' + guild.splashURL + '>', { files: [ { attachment: guild.splashURL + '?size=1280', name: 'Splash.png' } ] } );
              } else {
                message.reply( 'this guild, **' + guild.name + '** does not currently have a splash.' );
              }
            }
            break;
          default:
            message.channel.send( 'I\'m sorry, ' + message.author + ', I don\'t know what `!server ' + arrArgs.join( ' ' ) + '` is -+- Try again!' );
        }
      }
      else if (
        isOwner || isBotMod || message.member.permissions.has( 'MANAGE_GUILD' ) ||
        message.member.permissions.has( 'MANAGE_NICKNAMES' ) || message.member.permissions.has( 'CREATE_INSTANT_INVITE' )
      ) {
        var inviteUrl = '';
        var channel = '';//message.guild.channels.get( guildWelcomeMesages[ member.guild.id ].channel );// Once I put the welcome messages in a .json I can do this.
        if ( !channel ) {
          guild.channels.array().forEach( function ( defaultChannel ) {
            if ( !channel && defaultChannel.type === 'text' ) {
              channel = defaultChannel;
            }
          } );
        }
        await channel.createInvite( { maxAge: 0 } ).then( Invite => { inviteUrl = Invite.url; } ).catch( errCreateInvite => { console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Error attempting to create an invite for ' + message.guild.name + ' (ID:' + message.guild.id + '): ' + errCreateInvite ); } );
        var response = await message.channel.send( 'Collecting data for your query, please stand by...' );
        var arrExplicitContentFilterEmoji = [ ':no_entry_sign::mag_right:', ':mag::bust_in_silhouette:', ':mag::family_mmgb:' ],
          arrVerificationLevelEmoji = [ ':new_moon_with_face:', ':waning_crescent_moon:', ':last_quarter_moon:', ':waxing_gibbous_moon:', ':full_moon:' ],
          strExplicitContentFilter = '',
          strRegion = '',
          strVerificationLevel = '',
          strRoles = '',
          intUsers = guild.memberCount,
          intHumans = 0,
          intBots = 0,
          intChannels = message.guild.channels.size,
          intTextChannels = 0,
          intVoiceChannels = 0;
        
        if ( message.guild.explicitContentFilter >= 0 && message.guild.explicitContentFilter <= 2 ) {
          strExplicitContentFilter = arrExplicitContentFilterEmoji[ message.guild.explicitContentFilter ];
        } else {
          strExplicitContentFilter = ":grey_question:" + message.guild.explicitContentFilter + ":grey_question:";
        }
        
        switch ( message.guild.region ) {
          case "brazil" :
            strRegion = ":flag_br: Brazil";break;
          case "eu-central" :
            strRegion = ":flag_eu: Central Europe"; break;
          case "hongkong" :
            strRegion = ":flag_hk: Hong Kong";break;
          case "russia" :
            strRegion = ":flag_ru: Russia";break;
          case "singapore" :
            strRegion = ":flag_sg: Singapore";break;
          case "sydney" :
            strRegion = ":flag_au: Sydney";break;
          case "us-central" :
            strRegion = ":flag_us: US Central";break;
          case "us-east" :
            strRegion = ":flag_us: US East";break;
          case "us-south" :
            strRegion = ":flag_us: US South";break;
          case "us-west" :
            strRegion = ":flag_us: US West";break;
          case "eu-west" :
            strRegion = ":flag_eu: Western Europe";break;
          default : strRegion = ":grey_question: " + message.guild.region
        };
        
        if ( message.guild.verificationLevel >= 0 && message.guild.verificationLevel <= 4 ) {
          strVerificationLevel = arrVerificationLevelEmoji[ message.guild.verificationLevel ];
        } else {
          strVerificationLevel = ":grey_question:" + message.guild.verificationLevel + ":grey_question:";
        }
        
        if ( !message.guild.large ) {
          await message.guild.members.forEach( function( member, intMemberIndex ) {
            if ( member.user.bot ) { intBots++; }
            else { intHumans++; }
          } );
        } else {// HORRIBLE HACK -- FIX THIS LATER
          await message.guild.members.forEach( function( member, intMemberIndex ) {
            if ( member.user.bot ) { intBots++; }
          } );
          intHumans = message.guild.memberCount - intBots;
        }
        
        await message.guild.channels.array().forEach( function( channel, intChannelIndex ) {
          if ( channel.type === 'text' ) { intTextChannels++; }
          else { intVoiceChannels++; }
        } );
        
        var intRolesToShow = ( intRoles > 31 ? 31 : ( intRoles - 1 ) );
        var intTrunkatedRoles = ( intRoles > 31 ? ( intRoles - 31 ) : 0 );
        await arrRoles.forEach( function( role, intRoleIndex ) {
          if ( intRoleIndex <= intRolesToShow ) {
            if ( intRoleIndex === intRolesToShow ) {
              strRoles += ', and ' + intTrunkatedRoles + ' more!';
            } else if ( intRoleIndex !== 0 ) {
              strRoles += ', ' + role;
            }
          }
        } );
        
        if ( strRoles.length >= 1024 ) {
          var strRoleText = ': ';
          arrRoles.forEach( function( role, intRoleIndex ) {
            strRoleText += role.name + ' : ';
            if ( intRoleIndex === 39 ) {
              strRoleText += '...SNIP... ...SNIP... ...SNIP... : ';
            }
          } );
          do {
            strRoles = strRoles.substr( 0, strRoles.lastIndexOf( ',' ) );
          } while ( ( strRoles.length + 53 ) >= 1024 );// 38 for the next index (they're all `<@& id >`) and 15 for the ` **+### more!**`
          intTrunkatedRoles += intRolesToShow - strRoles.match( /,/g ).length;
          strRoles += ' **+' + intTrunkatedRoles + ' more!**';
        }
        
        var aboutServer = new Discord.RichEmbed()
          .setTitle( 'Guild information for:')
          .setDescription( ':arrow_right:\t[**' + message.guild.name + '**](' + inviteUrl + ')\t:id: **' + message.guild.id + '**' )
          .setThumbnail( ( message.guild.icon.substr( 0, 2 ) === 'a_' ? message.guild.iconURL.replace( /\.(jpg|png)/i, '.gif' ) : message.guild.iconURL ) )
          .setColor( 0x000080 )
          .addField( 'Created / Owner',
            message.guild.createdAt.toLocaleDateString( 'en-US', objTimeString ) +
            ' - <@' + message.guild.ownerID + '>#' + message.guild.owner.user.discriminator  )
          .addField( 'Region', strRegion )
          .addField( 'Members:', '**' + intUsers + '**: ' +
            ':bust_in_silhouette: ' + intHumans + ' (' + ( Math.round( ( intHumans / intUsers ) * 100 ) ) + '%) ' +
            ':robot: ' + intBots + ' (' + ( Math.round( ( intBots / intUsers ) * 100 ) )  + '%)' )
          .addField( 'Channels:', '**' + intChannels + '**: ' +
            ':notepad_spiral: ' + intTextChannels + ' (' + ( Math.round( ( intTextChannels / intChannels ) * 100 ) )  + '%) ' +
            ':loudspeaker: ' + intVoiceChannels + ' (' + ( Math.round( ( intVoiceChannels / intChannels ) * 100 ) )  + '%)' )
          .addField( 'Roles:', '**' + ( intRoles - 1 ) + '**: ' + strRoles )
          .addField( 'Verification Level', strVerificationLevel, true )
          .addField( 'Explicit Content Filter', strExplicitContentFilter, true )
          .setFooter( message.author.username + ' requested information.', message.author.displayAvatarURL );
        try {
          response.edit( '**Server information** (*embed below*)', { embed: aboutServer } ).catch( console.error );
        } catch( err ) {
          console.log( response );
          console.log( 'Attempting to edit an "!server" response failed with error: ' + err );
          message.channel.send( 'Editing last message failed, here\'s your result:', { embed: aboutServer } ).catch( console.error );
        }
      }
      else {
        message.channel.send( 'I\'m sorry, ' + message.author + ', you don\'t have the required bits to use that command!' );
      }
    }
    else {
      message.channel.send( 'I\'m sorry, ' + message.author + ', you must be in a server to use that command!' );
    }
    message.delete( 8000 ).catch( errDel => { console.error( '%s Unable to delete !server request: %o', strNow, errDel ); } );
  }
}

module.exports = ServerInfo;