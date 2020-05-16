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

async function getDuration( strTimestamp ) { 
  const intTotalSeconds = Math.floor( ( ( new Date() ) - ( new Date( strTimestamp ) ) ) / 1000 );
  if ( strTimestamp == '0' ) { return -1; }
  else if ( intTotalSeconds <= 0 ) { return 0; }
  const arrDaysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  const intMonthIndex = parseInt( ( new Date( strTimestamp ) ).getMonth() );
  const intThisMonthIndex = parseInt( ( new Date() ).getMonth() );
  
  const intThisYear = parseInt( ( new Date() ).getFullYear() );
  const intThisMonth = parseInt( ( new Date() ).getMonth() + 1 );
  const intThisDate = parseInt( ( new Date() ).getDate() );
  const intThisHours = parseInt( ( new Date() ).getHours() );
  const intThisMinutes = parseInt( ( new Date() ).getMinutes() );
  const intThisSeconds = parseInt( ( new Date() ).getSeconds() );
  
  const intSecondOfThisDay = parseInt( ( ( ( intThisHours * 60 ) + intThisMinutes ) * 60 ) + intThisSeconds );
  const intSecondOfThisMonth = parseInt( ( intThisDate * 86400 ) + intSecondOfThisDay );
  const intSecondOfThisYear = parseInt( ( intThisMonth * arrDaysInMonth[ intThisMonthIndex ] * 86400 ) + intSecondOfThisMonth );
  
  const intYear = parseInt( ( new Date( strTimestamp ) ).getFullYear() );
  const intLeap = parseInt( ( intYear % 4 === 0 && intYear % 100 !== 0 ) || intYear % 400 === 0 );
  const intMonth = parseInt( ( new Date( strTimestamp ) ).getMonth() + 1 );
  const intDaysInMonth = parseInt( arrDaysInMonth[ intMonthIndex ] + ( intMonth === 2 ? intLeap : 0 ) );
  const intDate = parseInt( ( new Date( strTimestamp ) ).getDate() );
  
  const intSeconds = parseInt( ( 60 + ( intThisSeconds - ( new Date( strTimestamp ) ).getSeconds() ) ) % 60 );
  const intMinutes = parseInt( ( 60 + ( ( intThisMinutes - ( new Date( strTimestamp ) ).getMinutes() ) - ( intSeconds < intThisSeconds ? 0 : 1 ) ) ) % 60 );
  const intHours = parseInt( ( 24 + ( ( intThisHours - ( new Date( strTimestamp ) ).getHours() ) - ( intMinutes < intThisMinutes ? 0 : 1 ) ) ) % 24 );
  
  const intSecondOfDay = parseInt( ( ( ( intHours * 60 ) + intMinutes ) * 60 ) + intSeconds );
  const intSecondOfMonth = parseInt( ( intThisDate * 86400 ) + intSecondOfDay );
  const intSecondOfYear = parseInt( ( intThisMonth * arrDaysInMonth[ intMonthIndex ] * 86400 ) + intSecondOfMonth );
  
  const intDays = parseInt( ( ( intDaysInMonth + ( intThisDate - intDate ) ) % intDaysInMonth ) - 1 + ( intSecondOfThisDay >= intSecondOfDay ? 1 : 0 ) );
  const intMonths = parseInt( ( ( 12 + ( ( intThisMonth - intMonth ) - ( intThisMonth === intMonth ? ( intDate <= intThisDate ? 0 : 1 ) : 0 ) ) ) % 12 ) - 1 + ( intSecondOfThisMonth >= intSecondOfMonth ? 1 : 0 ) );
  const intYears = parseInt( ( ( intThisYear - intYear ) - ( intMonth < intThisMonth ? 0 : 1 ) ) - 1 + ( intSecondOfThisYear >= intSecondOfYear ? 1 : 0 ) );
  
  const boolSeconds = ( intSeconds > 0 ? true : false );
  const boolMinutes = ( intMinutes > 0 ? true : false );
  const boolHours = ( intHours > 0 ? true : false );
  const boolDays = ( intDays > 0 ? true : false );
  const boolMonths = ( intMonths > 0 ? true : false );
  const boolYears = ( intYears > 0 ? true : false );

  var strTimeString = '**';
  if ( boolYears ) {
    strTimeString += intYears + ' year' + ( intYears === 1 ? '' : 's' );
    if ( boolMonths + boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) {
      strTimeString += ', ';
    } else if ( boolMonths + boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolMonths ) {
    strTimeString += intMonths + ' month' + ( intMonths === 1 ? '' : 's' );
    if ( boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) {
      strTimeString += ', ';
    } else if ( boolYears && ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolDays ) {
    strTimeString += intDays + ' day' + ( intDays === 1 ? '' : 's' );
    if ( ( boolDays + boolHours + boolMinutes + boolSeconds >= 2 ) ) {
      strTimeString += ', ';
    } else if ( boolYears && ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolDays + boolHours + boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolHours ) {
    strTimeString += intHours + ' hour' + ( intHours === 1 ? '' : 's' );
    if ( boolMinutes && boolSeconds ) {
      strTimeString += ', ';
    } else if ( ( boolYears + boolMonths + boolDays >= 1 ) && ( boolMinutes + boolSeconds === 1 ) ) {
      strTimeString += ', and ';
    } else if ( boolMinutes + boolSeconds === 1 ) {
      strTimeString += ' and ';
    }
  }
  if ( boolMinutes ) {
    strTimeString += intMinutes + ' minute' + ( intMinutes === 1 ? '' : 's' );
    if ( ( boolYears + boolMonths + boolDays + boolHours >= 1 ) && boolSeconds ) {
      strTimeString += ', and ';
    } else if ( boolSeconds ) {
      strTimeString += ' and ';
    }
  }
  if ( boolSeconds ) {
    strTimeString += intSeconds + ' second' + ( intSeconds === 1 ? '' : 's' );
  }
  strTimeString += '**';
  return strTimeString;
}

class Info extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'info',
      group: 'util',
      memberName: 'info',
      description: 'This command provides basic information about the given user, or the caller of the command if no user is provided. If used within a guild, and the given user is in the guild, additional information about the user in the guild will also be provided.',
      aliases: [ 'user' ]
    } );
  }

  async run( message, strArgs ) {
    var arrArgs = strArgs.split( ' ' );
    var arrUserIDs = [];
    var boolAuthor = false;
    if ( strArgs ) {// Try to find the user specified
//console.log( strArgs + ' exists' );
      if ( message.mentions.members.keyArray()[ 0 ] ) {// Exact match via mention
//console.log( strArgs + ' has mention(s)' );
        arrUserIDs = message.mentions.members.keyArray();
      }
      else if ( /[\d]{17,19}/.test( strArgs ) && message.client.users.get( strArgs ) !== undefined ) {// Exact match via user ID
//console.log( strArgs + ' is 17-19 digits' );
//console.log( strArgs + ' is user.id' );
        arrUserIDs.push( message.client.users.get( strArgs ).id );
      }
      else if ( message.client.users.find( 'username', strArgs ) !== null ) {// Exact match via username
//console.log( strArgs + ' is exact username' );
        message.client.users.findAll( 'username', strArgs ).forEach( function( member ) { arrUserIDs.push( member.id ) } );
      }
      else if ( message.guild.members.find( 'nickname', strArgs ) !== null ) {// Exact match via nickname in a guild
//console.log( strArgs + ' is exact nickname' );
        message.guild.members.findAll( 'nickname', strArgs ).forEach( function( member ) { arrUserIDs.push( member.id ) } );
      }
      else if ( message.client.users.map( user => { if ( user.username !== null ) { if ( user.username.toLowerCase() === strArgs.toLowerCase() ) { return user.id } } } ).filter( function( user ) { if ( user ) { return user; } } ).length !== 0 ) {// Case insensitive match via username
//console.log( strArgs + ' is username' );
        message.client.users.map( user => {
          if ( user.username !== null ) {
            if ( user.username.toLowerCase() === strArgs.toLowerCase() ) {
              arrUserIDs.push( user.id );
            }
          }
        } );
      }
      else if ( message.guild.members.map( user => { if ( user.nickname !== null ) { if ( user.nickname.toLowerCase() === strArgs.toLowerCase() ) { return user.id } } } ).filter( function( user ) { if ( user ) { return user; } } ).length !== 0 ) {// Case insensitive match via nickname in a guild
//console.log( strArgs + ' is nickname' );
        message.guild.members.map( user => {
          if ( user.nickname !== null ) {
            if ( user.nickname.toLowerCase() === strArgs.toLowerCase() ) {
              arrUserIDs.push( user.id );
            }
          }
        } );
      }
//      else if (  ) {// Case insensitive partial match via username
//console.log( strArgs + ' is partial username' );
  //      arrUserIDs[ 0 ] = ;
  //    }
//      else if (  ) {// Case insensitive partial match via nickname in a guild
//console.log( strArgs + ' is partial nickname' );
  //      arrUserIDs[ 0 ] = ;
//      }
      else {// strArgs didn't match any criteria - returning requesting user's ID
//console.log( strArgs + ' didn\'t match any criteria - returning requesting user\'s ID' );
        arrUserIDs.push( message.author.id );
        boolAuthor = !boolAuthor;
      }
    }
    else {// Default to user calling command
      arrUserIDs.push( message.author.id );
    }
    arrUserIDs = arrUserIDs.sort( function( a, b ) {//Let's sort the users by last timestamp
      var intTimestampA = ( message.client.users.get( a ).lastMessage !== null ? message.client.users.get( a ).lastMessage.createdTimestamp : 0 );
      var intTimestampB = ( message.client.users.get( b ).lastMessage !== null ? message.client.users.get( b ).lastMessage.createdTimestamp : 0 );
      return intTimestampB - intTimestampA;//Most recently active first
    } );//Let's sort the users by last timestamp
    const today = ( new Date() ).setHours( 0, 0, 0, 0 );
    var strContent = 'null';
    var msgEmbed = new Discord.RichEmbed();
    if ( arrUserIDs.length > 1 ) {
      strContent = ':busts_in_silhouette: Information about ' + /*( arrUserIDs.length < 4 ? arrUserIDs.length : 'the first **3** of **' + arrUserIDs.length + '**' )*/arrUserIDs.length + ' users matching ' + strArgs + ':';
      var strListOfUsers = '**Are you looking for:**\n';
      arrUserIDs.forEach( function( user, index ) {
        strListOfUsers += '\n\t:id:**' + user + '\t:\t<@' + user + '>#' +
        message.client.users.get( user ).discriminator + '**\n\t\t\t(*Last message sent:* __' +
        ( new Date( message.client.users.get( user ).lastMessage !== null ? message.client.users.get( user ).lastMessage.createdTimestamp : 0 ) ).toLocaleDateString( 'en-US', objTimeString ) + '__)';
      } );
      msgEmbed
        .setTitle( 'I found multiple results matching that query.' )
        .setDescription( strListOfUsers );
    } else {
      var objDiscordUser = await message.client.fetchUser( arrUserIDs[ 0 ] );
      var objGuildUser = await message.guild.fetchMember( arrUserIDs[ 0 ] );
      strContent = ( objDiscordUser.bot ? ':robot:' : ':bust_in_silhouette:' ) + ' Information about **' + objDiscordUser.tag + '**:';
      var strUserID = ':white_small_square:Discord ID: **' + objDiscordUser.id + '**';
      var strNickname = ( objGuildUser.nickname !== null ? ':white_small_square:Nickname: **' + objGuildUser.nickname + '**' : '' );
      var strRoles = '';
        if ( objGuildUser.roles.size > 1 ) {
          strRoles = ':white_small_square:Roles: ';
          objGuildUser.roles.array().slice( 1 ).sort( ( a, b ) => { return ( b.position - a.position ); } ).forEach( ( objThisRole, intThisRole ) => {
            if ( objThisRole.name !== '@everyone' ) {
              strRoles += '`@' + objThisRole.name + '`';
              if ( objGuildUser.roles.size === 1 ) {
                strRoles += ' and ';
              } else if ( objGuildUser.roles.size > 2 && intThisRole < ( objGuildUser.roles.size - 3 ) ) {
                strRoles += ', ';
              } else if ( objGuildUser.roles.size > 2 && intThisRole === ( objGuildUser.roles.size - 3 ) ) {
                strRoles += ', and ';
              }
            }
          } );
        }
      var strStatus = ':white_small_square:Status: ';
        switch ( objDiscordUser.presence.status ) {
          case 'online'    :
            strStatus += ':white_check_mark: **ONLINE**';
            break;
          case 'idle'      :
            strStatus += ':thinking: **IDLE**';
            break;
          case 'dnd'       :
            strStatus += ':octagonal_sign: **DO NOT DISTURB**';
            break;
          case 'invisible' :
          case 'offline'   :
            strStatus += ':bust_in_silhouette: **OFFLINE**';
            break;
          default          :
            strStatus += ':x: **ERROR**: ' + objDiscordUser.presence.status;
        }
      if ( objDiscordUser.presence.game !== null ) {
        var strActivityType = '';
        switch ( objDiscordUser.presence.game.type ) {
          case 3 :
            strActivityType = 'Watching';
            break;
          case 2 :
            strActivityType = 'Listening to';
            break;
          case 1 :
            strActivityType = 'Streaming';
            break;
          case 0 :
          default :
            strActivityType = 'Playing';
        }
        var strActivity = '';
        strActivity = ( objDiscordUser.presence.game.url === null ? '' : '[' )
          + objDiscordUser.presence.game.name +
          ( objDiscordUser.presence.game.url === null ? '' : ']( ' + objDiscordUser.presence.game.url + ' )' );
        strStatus += ' (' + strActivityType + ' *' + strActivity + '*)';
      }
      var strLastMessage = '';
        if ( objDiscordUser.lastMessageID !== null ) {
          var strAgo = await getDuration( objDiscordUser.lastMessage.createdTimestamp );
          if ( strAgo != -1 ) {
            strLastMessage = ':white_small_square:Last Message: ' + ( strAgo == 0 ? '**Just now!**' : strAgo + ' ago' );
          }
        }
      var strUserCreated = ':white_small_square:Account Creation: **' + objDiscordUser.createdAt.toLocaleDateString( 'en-US', objTimeString ) + '**';
      var strCreated = await getDuration( objDiscordUser.createdAt );
      if ( strCreated != -1 ) { strUserCreated += '\n' + ( strCreated == 0 ? '**Just now!**' : strCreated + ' ago' ); }
      var colJoinIndex = await message.guild.members.filter( a => { if ( a.joinedTimestamp !== 0 ) { return a; } } ).sort( ( a, b ) => { return a.joinedTimestamp - b.joinedTimestamp; } );
      var intJoinIndex;
      await colJoinIndex.array().forEach( ( v, i ) => { if ( v.id === objGuildUser.id ) { intJoinIndex = ++i; } } );
      var intBefore = ( intJoinIndex <= 4 ? 0 : ( intJoinIndex - 4 ) );
      var intAfter = ( intJoinIndex >= ( colJoinIndex.size - 3 ) ? colJoinIndex.size : ( intJoinIndex + 3 ) );
      var arrJoinOrder = colJoinIndex.array().slice( intBefore, intAfter );
      var strUserJoined = ':white_small_square:Guild Join Date: **' + ( new Date( objGuildUser.joinedTimestamp ) ).toLocaleDateString( 'en-US', objTimeString ) + '**';
      var strJoined = await getDuration( objGuildUser.joinedTimestamp );
      if ( strJoined != -1 ) { strUserJoined += '\n`(#' + intJoinIndex + ')` ' + ( strJoined == 0 ? '**Just now!**' : strJoined + ' ago' ); }
      else { strUserJoined += ' `(#' + intJoinIndex + ')`'; }
      var strUserJoinOrder = ':white_small_square:Join Order: **';
      await arrJoinOrder.forEach( ( v, i ) => {
        strUserJoinOrder += ( v.id === objDiscordUser.id ? v : ( v.nickname ? v.nickname : v.user.username ) + '#' + v.user.discriminator ) + ( ( i + 1 ) < arrJoinOrder.length ? ' >> ' : '**' );
      } );
      msgEmbed
        .setColor( ( objGuildUser.displayHexColor ? objGuildUser.displayHexColor : '#000000' ) )
        .setThumbnail( objDiscordUser.avatarURL )
        .setDescription(
          strUserID +
          ( strNickname === '' ? '' : '\n' ) + strNickname +
          ( strRoles === '' ? '' : '\n' ) + strRoles +
          ( strStatus === '' ? '' : '\n' ) + strStatus +
          ( strLastMessage === '' ? '' : '\n' ) + strLastMessage +
          ( strUserCreated === '' ? '' : '\n' ) + strUserCreated +
          ( strUserJoined === '' ? '' : '\n' ) + strUserJoined +
          ( strUserJoinOrder === '' ? '' : '\n' ) + strUserJoinOrder );
    }
    if ( boolAuthor ) {
      msgEmbed.setFooter( 'Defaulting to ' + message.author.tag + ' because I\'m unable to find a user for: ' + strArgs );
    }
    message.delete( { reason: 'Cleaning up a request for information about ' + arrUserIDs } ).catch( errDelete => { console.log( 'Unable to delete message in ' + message.guild.name + '#' + message.channel.name + ' on ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ' because: ' + errDelete ); } );
    message.channel.send( strContent, { embed: msgEmbed } );
  }
}

module.exports = Info;