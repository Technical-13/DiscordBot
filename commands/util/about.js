const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const bot = 'LOTRObot';

class AboutMe extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'about',
      group: 'util',
      memberName: 'about',
      description: 'Information about this bot.',
    } );
  }

  async run( message, args ) {
    const strOrdinalEmoji = [ 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'keycap_ten' ];// basic 0-9 and then "10"
    var response = await message.channel.send( 'Collecting data for your query, please stand by...' );
    var arrArgs = args.split( ' ' ),
      arrMyRoles = message.guild.members.get( message.client.user.id )._roles,
      dateJoinedTimestamp = new Date( message.guild.members.get( message.client.user.id ).joinedTimestamp ),
      intGuildsList = 0,
      intGuilds = 0,
      intGuildIndex = 0,
      intTopIndex = 0,
      intUsers = message.guild.memberCount,
      intHumans = 0,
      intBots = 0,
      intChannels = message.guild.channels.size,
      intTextChannels = 0,
      intVoiceChannels = 0,
      intRoles = message.guild.roles.size,
      strBotType = '',
      strDebugServer = '',
      strInviteMe = '',
      strOwner = '',
      strLastRestart = '',
      strGuildsName = '',
      strGuildsValue = '',
      strTopIndex = '',
      strMyRoles = '',
      strCurrentGuildValue = '',
      strJoinedTimestamp = dateJoinedTimestamp.toLocaleDateString( 'en-US', objTimeString ),
      strCurrentGuildName = message.guild.name;
    var objUptime = { base: Math.floor( message.client.uptime / 1000 ) };
      objUptime.seconds = ( objUptime.base % 60 );
      objUptime.minutes = ( Math.floor( objUptime.base / 60 ) % 60 );
      objUptime.hours   = ( Math.floor( objUptime.base / 3600 ) % 24 );
      objUptime.days    = ( Math.floor( objUptime.base / 86400 ) % 7 );
      objUptime.weeks   = ( Math.floor( objUptime.base / 604800 ) % 4 );
    if ( !message.guild.large ) {
      await message.guild.members.forEach( function( member, intMemberIndex ) {
        if ( member.user.bot ){
          intBots++;
        } else {
          intHumans++;
        }
      } );
    } else {// HORRIBLE HACK -- FIX THIS LATER
      await message.guild.members.forEach( function( member, intMemberIndex ) {
        if ( member.user.bot ){
          intBots++;
        }
      } );
      intHumans = message.guild.memberCount - intBots;
    }
    
    Promise.all( [
      strBotType = 'In case you didn\'t know, I\'m a ' +
        ( message.client.user.bot ? ':robot: robot' : ':bust_in_silhouette: human' ) + '.\n',
      strDebugServer = 'You can track changes to the bot in my [debugging server](<https://discord.me/TheShoeStore>).\n',
      strInviteMe = 'You can add me to your own server(s): [Invite Me!](https://discordapp.com/api/oauth2/authorize?client_id=' + settings[ bot ].clientID + '&scope=bot&permissions=8)\n',
      strOwner = 'My owner' + ( settings[ bot ].owners.length === 1 ? ' is ' : 's are ' ),
      await settings[ bot ].owners.forEach( async function( ownerID, i ){
        var owner = await message.client.fetchUser( ownerID );
        strOwner += owner + ' (' + owner.tag + ')';
        if ( settings[ bot ].owners.length > 2 && i < settings[ bot ].owners.length ) {
          strOwner += ', ';
        } else if ( settings[ bot ].owners.length > 2 && i === settings[ bot ].owners.length ) {
          strOwner += ', and ';
        } else if ( settings[ bot ].owners.length === 2 ) {
          strOwner += ' and ';
        }
      } ),
      strOwner += '.\n',
      strLastRestart = 'I\'ve been online ' +
        ( objUptime.weeks !== 0 ? '**' + objUptime.weeks + '**w ' : '' ) +
        ( objUptime.days !== 0 ? '**' + objUptime.days + '**d ' : '' ) +
        ( objUptime.hours !== 0 ? '**' + objUptime.hours + '**h ' : '' ) +
        ( objUptime.minutes !== 0 ? '**' + objUptime.minutes + '**m ' : '' ) +
        ( objUptime.seconds !== 0 ? '**' + objUptime.seconds + '**s ' : '' ) +
        ' since:\n\t' + ( new Date( ( new Date( ) ).valueOf() - message.client.uptime ) ).toLocaleDateString( 'en-US', objTimeString ),
      intGuilds = message.client.guilds.size,
      intGuildsList = 3,
      intTopIndex = ( intGuilds < intGuildsList ? intGuilds : intGuildsList ),
      strGuildsValue = ' ',
      await message.client.guilds.array().sort( function( a, b ){ return b.memberCount - a.memberCount; } ).forEach( async function( guild, intGuildIndex ) {
        var channel, inviteUrl = '';
//        guild.channels.array().forEach( function ( defaultChannel ) {
//          if ( !channel && defaultChannel.type === 'text' ) {
//            channel = defaultChannel;
//          }
//        } );
//        await channel.createInvite( { maxAge: 0 } ).then( Invite => { inviteUrl = Invite.url; } ).catch( console.error );
        if ( args && arrArgs[ 0 ].toUpperCase() === 'LIST' ) {
          var strThisGuildIndexEmojii = ':';
          if ( intGuildIndex < 10 ) {
            strThisGuildIndexEmojii += strOrdinalEmoji[ ( intGuildIndex + 1 ) ] + ':';
          } else {
            var intGuildIndexParse = intGuildIndex + 1;
            intGuildIndexParse.toString().split( '' ).forEach( function( digit ){
              strThisGuildIndexEmojii += strOrdinalEmoji[ ( digit ) ] + '::';
            } );
          }
          strGuildsValue += strThisGuildIndexEmojii + ' [**' + guild.name + '**]() (**' + guild.memberCount.toLocaleString( 'en-US' ) + '**)\t';
        } else {
          if ( intGuildIndex < intGuildsList ) {
            strGuildsValue += ':' + strOrdinalEmoji[ ( intGuildIndex + 1 ) ] + ':\t[**' + guild.name + '**]()\t(**' + guild.memberCount.toLocaleString( 'en-US' ) + '**)\n';
          } else if ( intGuildIndex >= intGuildsList && message.guild.id === guild.id ) {
            var strThisGuildIndexEmojii = '\n:';
            if ( intGuildIndex < 10 ) {
              strThisGuildIndexEmojii += strOrdinalEmoji[ ( intGuildIndex + 1 ) ] + ':';
            } else {
              var intGuildIndexParse = intGuildIndex + 1;
              intGuildIndexParse.toString().split( '' ).forEach( function( digit ){
                strThisGuildIndexEmojii += strOrdinalEmoji[ ( digit ) ] + ':';
              } );
            }
            strGuildsValue += strThisGuildIndexEmojii + '\t[**' + guild.name + '**](' + inviteUrl + ')\t(**' + guild.memberCount.toLocaleString( 'en-US' ) + '**)\n';
          }        
          if ( intGuilds > 3 ) {
            strTopIndex = '\nTop ' + strOrdinalEmoji [ intTopIndex ] + ' by server population' +
              ( intGuildIndex > intTopIndex ? ' (and where you fit in) ' : ' ' ) + 'are:';
          } else if ( intGuilds > 1 ) {
            strTopIndex = '\nListed by server population:';
          }
        }
        if ( message.guild.id === guild.id ) {
          strCurrentGuildName += ' #' + ( intGuildIndex + 1 );          
        }
      } ),
      strGuildsName = 'I\'m in a total of ' + intGuilds + ' Discord guilds.' + strTopIndex,
      strCurrentGuildValue += '**Users: ' + intUsers + '**; ' +
        'Humans: ' + intHumans + ' ( ' + Math.round( ( intHumans / intUsers ) * 100 ) + '% ); ' +
        'Bots: ' + intBots + ' ( ' + Math.round( ( intBots / intUsers ) * 100 ) + '% )\n',
      strCurrentGuildValue += ( message.guild.large ? '\t *User count data for large guilds may be inaccurate.*\n' : '' ),
      await message.guild.channels.array().forEach( function( channel, intChannelIndex ) {
        if ( channel.type === 'text' ){
          intTextChannels++;
        } else {
          intVoiceChannels++;
        }
      } ),
      strCurrentGuildValue += '**Channels: ' + intChannels + '**; ' +
        'Text: ' + intTextChannels + ' ( ' + Math.round( ( intTextChannels / intChannels ) * 100 ) + '% ); ' +
        'Voice: ' + intVoiceChannels + ' ( ' + Math.round( ( intVoiceChannels / intChannels ) * 100 ) + '% )\n',

      strCurrentGuildValue += '**Joined: **' + strJoinedTimestamp + '\n',
      await arrMyRoles.forEach( function( strMyRole, intMyRoleIndex ) {
        if ( arrMyRoles.length === 2 && intMyRoleIndex === 1 ) {
          strMyRoles += ' and ';
        } else if ( arrMyRoles.length > 2 && intMyRoleIndex === ( arrMyRoles.length - 1 ) ) {
          strMyRoles += ', and ';
        } else if ( arrMyRoles.length > 2 && intMyRoleIndex !== 0 ) {
          strMyRoles += ', ';
        }
        strMyRoles += '<@&' + strMyRole + '>';
      } ),
      
      strCurrentGuildValue += '**Roles: ' + intRoles + '**; ' +
        'My **' + arrMyRoles.length + '** roles: ' + strMyRoles
    ] ).then( () => {
      var aboutBot = new Discord.RichEmbed()
        .setTitle( 'About me, ' + message.client.user.tag )
        .setDescription( strBotType + strDebugServer + strInviteMe + strOwner + strLastRestart )
        .setThumbnail( message.client.user.displayAvatarURL )
        .setColor( message.guild.me.displayHexColor )
        .addField( strGuildsName, strGuildsValue )
        .addField( strCurrentGuildName, strCurrentGuildValue )
        .addField( 'Total users served:', message.client.users.array().length, true )
        .addField( 'Memory usage:', ( Math.round( ( process.memoryUsage().rss / 1024 / 1024 * 100 ) ) / 100 ) + 'MB', true )
        .setTimestamp()
        .setFooter( '... as requested by ' + message.author.tag + '.', message.author.displayAvatarURL );
      
      response.edit( { embed: aboutBot } ).catch( function( err ) {
        console.log( response );
        console.log( 'Attempting to edit an "!about" response failed with error: ' + err );
        message.channel.send( 'Editing last message failed, here\'s your result:', { embed: aboutBot } ).catch(  function( error ) {
          console.log( 'Attempting to send an "!about" response from edit error failed with error: ' + error );
        } );
      } );
    } );
  }
}

module.exports = AboutMe;