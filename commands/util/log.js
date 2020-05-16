const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const fs = require( 'fs' );
const fsLog = 'msgLogs.json';
const fsLogBackup = 'msgLogs.json.bak';
var arrDisabledChannels = [ '335080730742882304', '347347787505205248', '347347889590239232', '347347432323153924', '347347825325244417', '260445479949697034', '260110551399661569' ];
var objLogs = {};
fs.readFile( fsLog, 'utf8', ( errRead, strLogs ) => {
  if ( errRead && errRead.code === 'ENOENT' ) {
    strLogs = '{"logs":[]}';
    fs.writeFile( fsLog, strLogs, ( errWrite ) => {
      if ( errWrite ) throw errWrite;
      console.log( 'Created ' + fsLog + ' with ` ' + strLogs + '`' );
    } );
  } else if ( errRead ) {
    throw errRead;
  }
  objLogs = JSON.parse( strLogs );
} );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };

function truncateField( strFieldContent, strAddContent, intContentIndex, strAttachment ) {
  if ( strFieldContent.indexOf( '\t\t**TRUNCATED...**' ) !== -1 ) {
    /* ALREADY TRUNCATED!!! */
  } else if ( strAttachment && ( strFieldContent.length + strAddContent.length + strAttachment.length + 33 ) < 1024  ) {
    strFieldContent += '**' + ( intContentIndex + 1 ) + ')** ' + strAddContent + '[:package:](' + strAttachment + ')\n';
  } else if ( ( strFieldContent.length + strAddContent.length + 18 ) < 1024 ) {
    strFieldContent += '**' + ( intContentIndex + 1 ) + ')** ' + strAddContent + '\n';
  } else if ( strFieldContent.indexOf( 'TRUNCATED...' ) === -1 ) {
    strFieldContent += '\t\t**TRUNCATED...**'
  }
  
  return strFieldContent;
}

class BotNotesLog extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'log',
      memberName: 'log',
      aliases: [ 'logs' ],
      group: 'util',
      description: 'Allows adding, reading, and managing logged notes.'
    } );
  }
  
  async run( message, args ) {
    var arrArgs = args.split( ' ' );
    var strCommand = '', strTask = '', intIndex = 0;
    if ( arrArgs[ 0 ] ) {
      strCommand = arrArgs[ 0 ].toUpperCase();
      if ( strCommand === 'ADD' ) {
        strTask = arrArgs.slice( 1 ).join( ' ' );
      } else if ( arrArgs[ 1 ] && isNaN( parseInt( arrArgs[ 1 ] ) ) ) {
        strTask = arrArgs[ 1 ].toUpperCase();
      } else {
        intIndex = parseInt( arrArgs[ 1 ] ) - 1;
        if ( arrArgs[ 2 ] && ( strCommand === 'APPEND' || strCommand === 'EDIT' ) ) {
          strTask = arrArgs.slice( 2 ).join( ' ' );
        } else if ( arrArgs[ 2 ] ) {
          strTask = arrArgs[ 2 ].toUpperCase();
        }
      }
    } else {
      strCommand = 'HELP';
    }
    if ( message.guild.id !== '192775085420052489' && strCommand !== 'HELP' && strCommand !== 'LIST' && strCommand !== 'VIEW' ) {
      message.channel.send( { embed: { color: 16711680, description: 'I\'m sorry, only **`help`**, **`list`**, and **`view`** are available outside of [**The Shoe Store**](https://discord.me/TheShoeStore)' } } );
      return;
    }
    if ( arrDisabledChannels.indexOf( message.channel.id ) !== -1 ) {
      if ( message.author.id !== '152628871567507456' ) { 
        message.author.send( 'Unable to respond to `!log` command requests in **' + message.guild.name + '#' + message.channel.name + '**.  Please visit <https://discord.me/TheShoeStore> for more help.' ).then( DM => { message.react( '%E2%9D%8C' );/*Red X*/ } );// This needs work!
      }
      console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + message.author.tag + ' attempted to use the disabled `!log` command in: ' + message.guild.name + '#' + message.channel.name );
      return;
    }
    fs.readFile( fsLog, 'utf8', ( errRead, strLogs ) => {
      if ( errRead ) {
        throw errRead;
      }
      const arrOrdinalEmoji = [ 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'keycap_ten' ];// basic 0-9 and then "10"
      const arrPriority = [ 'NONE', 'LOW', 'MEDIUM', 'ELEVATED', 'HIGH' ];
      const arrStatus = [ 'NEW', 'ACTIVE', 'PAUSED', 'DONE' ];
      const arrStatusEmoji = [ ':new:', ':tools:', ':thinking:', ':white_check_mark:' ];
      objLogs = JSON.parse( strLogs );
      var msgContent = '**Log management** *(embed below)*',
      msgEmbed = new Discord.RichEmbed()
        .setTitle( 'Logging Console:' )
        .setThumbnail( 'http://ddowiki.com/images/History_Scroll_%28color%29.png' )
        .setColor( 0x00FA00 )
        .setTimestamp()
        .setFooter( message.author.tag, message.author.avatarURL );
      if ( strCommand === 'ADD' ) {
        var thisNote = strTask,
        mentionedTags = [],
        mentionedIds = [],
        arrMentioned = Array.from( message.mentions.members );
        arrMentioned.forEach( function( v, i ) {
          mentionedIds[ i ] = v[ 0 ];
          mentionedTags[ i ] = v[ 1 ].user.tag;
        } );
        mentionedIds.forEach( function( v, i ){
          thisNote = thisNote.replace( '<@' + v + '>', '(' + mentionedTags[ i ] + ')' )
        } );
        thisNote = thisNote.replace( /`(.*?)`/g, '[$1]' );
        var emjPriority = '\u200B';
        for ( var i = 1; i < 6; i++ ) {
          if ( i !== 3 ) {
            emjPriority += ':' + arrOrdinalEmoji[ i ] + ':';
          } else {
            emjPriority += ':white_check_mark:';
          }
        }
        var objViewLog = {
          timestamp: new Date(),
          author: {
            id: message.author.id,
            username: message.author.username,
            discriminator: message.author.discriminator,
            tag: message.author.tag,
            avatarURL: ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL ),
            bot: message.author.bot
            },
          note: thisNote,
          attachment: ( message.message.attachments.array().length === 1 ? message.message.attachments.array()[ 0 ].url : null ),
          priority: 2,
          status: 0
          };
        objLogs.logs.push( objViewLog );
        var strLogs = JSON.stringify( objLogs );
        var strLogMessage = 'on ' + objViewLog.timestamp + ', ' + objViewLog.author.tag + ' logged a note of: \n\t' + objViewLog.note + '\n';
        fs.writeFile( fsLog, strLogs, ( err ) => {
          if ( err ) throw err;
        } );
        
        msgEmbed
          .setDescription( '**Message ' + objLogs.logs.length + ' logged!**' )
          .addField( 'Priority: **' + arrPriority[ objViewLog.priority ] + '**', emjPriority, true )
          .addField( 'Status: **' + arrStatus[ objViewLog.status ] + '**', arrStatusEmoji[ objViewLog.status ], true )
          .addField( 'Note:', objViewLog.note )
          .setFooter( 'Logged by ' + objViewLog.author.tag, objViewLog.author.avatarURL );
        if ( objViewLog.attachment ) {
          msgEmbed
            .setImage( objViewLog.attachment );
        }
      }
      else if ( strCommand === 'APPEND' && intIndex >= 0 && intIndex < objLogs.logs.length ) {
        var objViewLog = objLogs.logs[ intIndex ],
        objLogAuthor = message.guild.members.get( objViewLog.author.id ).user,
        emjPriority = '\u200B';
        for ( var i = 1; i < 6; i++ ) {
          if ( i !== ( objViewLog.priority + 1 ) ) {
            emjPriority += ':' + arrOrdinalEmoji[ i ] + ':';
          } else {
            emjPriority += ':asterisk:';
          }
        }
        var mentionedTags = [],
        mentionedIds = [],
        arrMentioned = Array.from( message.mentions.members );
        arrMentioned.forEach( function( v, i ){
          mentionedIds[ i ] = v[ 0 ];
          mentionedTags[ i ] = v[ 1 ].user.tag;
        } );
        
        mentionedIds.forEach( function( v, i ){
          objViewLog.note = objViewLog.note.replace( '<@' + v + '>', '(' + mentionedTags[ i ] + ')' )
        } );
        objLogs.logs[ intIndex ].note += ' ' + strTask;
        if ( objLogAuthor !== undefined && ( objViewLog.author.avatarURL !== ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL ) ) ) {
          objViewLog.author.avatarURL = ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL );
        }
        var strLogs = JSON.stringify( objLogs );
        fs.writeFile( fsLog, strLogs, ( err ) => {
          if ( err ) throw err;
        } );
        msgEmbed
          .setDescription( 'Below is the current information for log #**' + ( intIndex + 1 ) + '**' )
          .addField( 'Priority: **' + arrPriority[ objViewLog.priority ] + '**', emjPriority, true )
          .addField( 'Status: **' + arrStatus[ objViewLog.status ] + '**', arrStatusEmoji[ objViewLog.status ], true )
          .addField( 'New Note:', objViewLog.note )
          .setTimestamp( objViewLog.timestamp )
          .setFooter( 'Logged by ' + objLogAuthor.tag, objViewLog.use.avatarURL );
      }
      else if ( strCommand === 'APPEND' && ( intIndex < 0 || intIndex >= objLogs.logs.length ) ) {// No such log
        message.channel.send( 'I\'m sorry, I can\'t append to log #__**` ' + parseInt( arrArgs[ 1 ] ) + ' `**__ because it is not in range.  Please enter a value from **1-' + objLogs.logs.length + '**' );
        return;
      }
      else if ( strCommand === 'ATTACH' && intIndex >= 0 && intIndex < objLogs.logs.length ) {
        var objViewLog = objLogs.logs[ intIndex ];
        if ( message.message.attachments.array().length > 1 ) {
          msgEmbed
            .setColor( 0xFF0000 )
            .setDescription( '__**You can\'t attach more than one thing per log!**__' );
        }
        else if ( message.message.attachments.array().length === 1 ) {
          objViewLog.attachment = message.message.attachments.array()[ 0 ].url;
          var objLogAuthor = message.guild.members.get( objViewLog.author.id ).user;
          var emjPriority = '\u200B';
          for ( var i = 1; i < 6; i++ ) {
            if ( i !== ( objViewLog.priority + 1 ) ) {
              emjPriority += ':' + arrOrdinalEmoji[ i ] + ':';
            } else {
              emjPriority += ':asterisk:';
            }
          }
          var arrLinks = objViewLog.note.match( /(https?:\/\/[^ ]*)/gi );
          if ( arrLinks ) {
            msgContent += '\n';
            arrLinks.forEach( function( strLink, intLinkIndex ) {
              msgContent += '\n:link:\t' + strLink;
            } );
          }
          msgEmbed
            .setDescription( 'Attached image to log #**' + ( intIndex + 1 ) + '**' )
            .addField( 'Priority: **' + arrPriority[ objViewLog.priority ] + '**', emjPriority, true )
            .addField( 'Status: **' + arrStatus[ objViewLog.status ] + '**', arrStatusEmoji[ objViewLog.status ], true )
            .addField( 'Note:', objViewLog.note )
            .setImage( objViewLog.attachment )
            .setTimestamp( objViewLog.timestamp )
            .setFooter( 'Logged by ' + objLogAuthor.tag, objViewLog.author.avatarURL );
          if ( objLogAuthor !== undefined && ( objViewLog.author.avatarURL !== ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL ) ) ) {
            objViewLog.author.avatarURL = ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL );
          }
          var strLogs = JSON.stringify( objLogs );
          fs.writeFile( fsLog, strLogs, ( err ) => {
            if ( err ) throw err;
          } );
        } else {
          msgEmbed
            .setColor( 0xFF0000 )
            .setDescription( '__**Nothing attached.**__' );
        }
      }
      else if ( strCommand === 'ATTACH' && ( intIndex < 0 || intIndex >= objLogs.logs.length ) ) {// No such log
        message.channel.send( 'I\'m sorry, I can\'t attach your file to log #__**` ' + parseInt( arrArgs[ 1 ] ) + ' `**__ because it is not in range.  Please enter a value from **1-' + objLogs.logs.length + '**' );
        return;
      }
      else if ( strCommand === 'DELETE' ) {
        msgEmbed
          .setColor( 0xFF0000 )
          .setThumbnail( 'http://ddowiki.com/images/History_Scroll_%28BW%29.png' )
        var objViewLogs = objLogs.logs;
        var arrDeleteLogs = [];
        if ( intIndex ) {
          arrDeleteLogs.push( intIndex );
        } else if ( strTask === 'DONE' ) {
          objViewLogs.forEach( function( arrLog, intLogIndex ) {
            if ( arrLog.status === 3 && arrLog.priority === 0 ) {
              arrDeleteLogs.push( intLogIndex );
            }
          } );
        }
        if ( !arrDeleteLogs || arrDeleteLogs.length === 0 ) {
          const arrLogs = objLogs.logs;
          var strStatusDone = '',
            arrStatusDone = [],
            arrPriorityZero = [],
            arrPriorityOne = [],
            arrPriorityTwo = [],
            arrPriorityThree = [],
            arrPriorityFour = [];
          arrLogs.forEach( function( v, i ) {
            if ( v.status === 3 ) {
              if ( v.priority === 4 ) {
                arrPriorityFour.push( { intLog: i, strNote: ':five: ' + v.note + '\n', attachment: ( v.attachment || false ) } );
              } else if ( v.priority === 3 ) {
                arrPriorityThree.push( { intLog: i, strNote: ':four: ' + v.note + '\n', attachment: ( v.attachment || false ) } );
              } else if ( v.priority === 2 ) {
                arrPriorityTwo.push( { intLog: i, strNote: ':three: ' + v.note + '\n', attachment: ( v.attachment || false ) } );
              } else if ( v.priority === 1 ) {
                arrPriorityOne.push( { intLog: i, strNote: ':two: ' + v.note + '\n', attachment: ( v.attachment || false ) } );
              } else {
                arrPriorityZero.push( { intLog: i, strNote: ':one: ' + v.note + '\n', attachment: ( v.attachment || false ) } );
              }
            }
          } );
          arrStatusDone = arrPriorityFour.concat( arrPriorityThree, arrPriorityTwo, arrPriorityOne, arrPriorityZero );
          arrStatusDone.forEach( function( v ) {
            strStatusDone = truncateField( strStatusDone, v.strNote, v.intLog, v.attachment );
          } );
          msgEmbed
            .setDescription( 'Get to work!\n\tThere are no logs marked as :white_check_mark::one: **Done** & **None** to delete!' )
            .addField( 'Logs that are Done:', ( strStatusDone.length === 0 ? '**None**' : strStatusDone ) );
        } else {
          arrDeleteLogs.sort( function( a, b ) { return b - a; } ).forEach( function( intIndexValue, intIndex ) {
            var objViewLog = objViewLogs[ intIndexValue ];
            var objDeleteLog = JSON.parse( JSON.stringify( objViewLog ) );
            objViewLogs.splice( intIndexValue, 1 )
            var objLogAuthor = message.guild.members.get( objDeleteLog.author.id ).user;
            var emjPriority = '\u200B';
            for ( var i = 1; i < 6; i++ ) {
              if ( i !== ( objDeleteLog.priority + 1 ) ) {
                emjPriority += ':' + arrOrdinalEmoji[ i ] + ':';
              } else {
                emjPriority += ':asterisk:';
              }
            }
            if ( arrDeleteLogs.length === 1 ) {
              msgEmbed
                .setDescription( ':wastebasket:\t**INDEX #' + ( intIndexValue + 1 ) + ' DELETED!**' )
                .addField( 'Priority: **' + arrPriority[ objDeleteLog.priority ] + '**', emjPriority, true )
                .addField( 'Status: **' + arrStatus[ objDeleteLog.status ] + '**', arrStatusEmoji[ objDeleteLog.status ], true )
                .addField( 'Note #' + ( intIndexValue + 1 ) + ':', objDeleteLog.note )
                .setTimestamp( objDeleteLog.timestamp )
                .setFooter( 'Logged by ' + objDeleteLog.author.tag, ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL ) );
              if ( objDeleteLog.attachment ) {
                msgEmbed
                  .setImage( objDeleteLog.attachment );
              }
            } else if ( intIndex === 0 ) {
              msgEmbed
                .setDescription( ':wastebasket:\t**DELETED __' + arrDeleteLogs.length + '__ INDEXES:** ' + ( intIndexValue + 1 ) )
                .addField( 'Priority: **' + arrPriority[ objDeleteLog.priority ] + '**', emjPriority, true )
                .addField( 'Status: **' + arrStatus[ objDeleteLog.status ] + '**', arrStatusEmoji[ objDeleteLog.status ], true )
                .addField( 'Note #' + ( intIndexValue + 1 ) + ':', objDeleteLog.note );
            } else {
              msgEmbed
                .setDescription( msgEmbed.description + ', ' + ( intIndexValue + 1 ) )
                .addField( 'Note #' + ( intIndexValue + 1 ) + ':', objDeleteLog.note );
            }
          } );
          var strLogs = JSON.stringify( objLogs );
          fs.writeFile( fsLog, strLogs, ( err ) => {
            if ( err ) throw err;
          } );
        }
      }
      else if ( strCommand === 'EDIT' && intIndex >= 0 && intIndex < objLogs.logs.length ) {
        var objViewLog = objLogs.logs[ intIndex ],
        oldLogNote = objViewLog.note,
        objLogAuthor = message.client.users.get( objViewLog.author.id ).user,
        emjPriority = '\u200B';
        for ( var i = 1; i < 6; i++ ) {
          if ( i !== ( objViewLog.priority + 1 ) ) {
            emjPriority += ':' + arrOrdinalEmoji[ i ] + ':';
          } else {
            emjPriority += ':asterisk:';
          }
        }
        var mentionedTags = [],
        mentionedIds = [],
        arrMentioned = Array.from( message.mentions.members );
        arrMentioned.forEach( function( v, i ) {
          mentionedIds[ i ] = v[ 0 ];
          mentionedTags[ i ] = v[ 1 ].user.tag;
        } );
        mentionedIds.forEach( function( v, i ) {
          objViewLog.note = objViewLog.note.replace( '<@' + v + '>', '(' + mentionedTags[ i ] + ')' )
        } );
        objLogs.logs[ intIndex ].note = strTask;
        if ( objLogAuthor !== undefined && ( objViewLog.author.avatarURL !== ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL ) ) ) {
          objViewLog.author.avatarURL = ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL );
        }
        var strLogs = JSON.stringify( objLogs );
        fs.writeFile( fsLog, strLogs, ( err ) => {
          if ( err ) throw err;
        } );
        msgEmbed
          .setDescription( 'Below is the current information for log #**' + ( intIndex + 1 ) + '**' )
          .addField( 'Priority: **' + arrPriority[ objViewLog.priority ] + '**', emjPriority, true )
          .addField( 'Status: **' + arrStatus[ objViewLog.status ] + '**', arrStatusEmoji[ objViewLog.status ], true )
          .addField( 'Old Note:', oldLogNote )
          .addField( 'New Note:', objViewLog.note )
          .setTimestamp( objViewLog.timestamp )
          .setFooter( 'Logged by ' + objLogAuthor.tag,  );
      }
      else if ( strCommand === 'EDIT' && ( intIndex < 0 || intIndex >= objLogs.logs.length ) ) {// No such log
        message.channel.send( 'I\'m sorry, I can\'t change the content of log #__**` ' + parseInt( arrArgs[ 1 ] ) + ' `**__ for you because it is not in range.  Please enter a value from **1-' + objLogs.logs.length + '**' );
        return;
      }
      else if ( strCommand === 'HELP' ) {
        msgEmbed
          .setDescription(
            'This is a tool to read and manage logged notes.' +
            '\nRecognized commands **`( `*` required `*` | `__` default `__` )`**:' +
            '\n\t**`add `*` <text>`***' +
            '\n\t\tAdd a new log with default priority and status.' +
            '\n\t**`append `*` index <add text>`***' +
            '\n\t\tAppend text to the end of the note attached to the log.' +
            '\n\t**`attach `*` index`***' +
            '\n\t\tAttach an item to the log.' +
            '\n\t\tRequires you to attach an image to the command.' +
            '\n\t**`delete `*`( `__` index `__` | done )`***' +
            '\n\t\t\t(**__CAN\'T BE UNDONE__**)' +
            '\n\t\tDelete note #__index__ forever.' +
            '\n\t\tDelete all `DONE` notes with `NONE` priority forever.' +
            '\n\t**`edit `*` index <new text>`***' +
            '\n\t\tEdit the note attached to the log.' +
            '\n\t**`help`** (or no parameters)' +
            '\n\t\tThis help message.' +
            '\n\t**`list ( status | `__` priority `__` | submitter )`**' +
            '\n\t\tSort list by status, submitter, or priority.' +
            '\n\t\t\tYou can filter by a specific status or priority.' +
            '\n\t\tFiltered by submitter (case sensitive).' +
            '\n\t**`priority `*`index`*` ( 1 - `__` 3 `__` - 5 )`**' +
            '\n\t\tChange the priority of the note to indicated priority.' +
            '\n\t**`status `*`index`*` ( `__` new `__` | active | paused | done )`**' +
            '\n\t\tChange the status of the note to indicated state.' +
            '\n\t**`view `*` index`***' +
            '\n\t\tView the details of a log.'
          );
      }
      else if ( strCommand === 'LIST' ) {
        const arrLogs = objLogs.logs;
        var objLogCount = { none: 0, low: 0, medium: 0, elevated: 0, high: 0, by: 0, new: 0, active: 0, paused: 0, done: 0 };
        const strStatusReq = ( arrArgs[ 2 ] ? arrArgs[ 2 ].toUpperCase() : false );
        switch ( strTask ) {
          case 'STATUS' :
            switch ( strStatusReq ) {
              case 'NEW' : case 'ACTIVE' : case 'PAUSED' : case 'DONE' :
                const intStatus = ( strStatusReq === 'DONE' ? 3 : ( strStatusReq === 'PAUSED' ? 2 : ( strStatusReq === 'ACTIVE' ? 1 : 0 ) ) );
                var strPriorityZero = '', strNoneIndices = '',
                  strPriorityOne = '', strLowIndices = '',
                  strPriorityTwo = '', strMediumIndices = '',
                  strPriorityThree = '', strElevatedIndices = '',
                  strPriorityFour = '', strHighIndices = '';
                arrLogs.forEach( function( v, i ) {
                  if ( v.status === intStatus && v.priority === 2 ) {
                    objLogCount.medium++;
                    strMediumIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityTwo = truncateField( strPriorityTwo, v.note, i, ( v.attachment || false ) );
                  } else if ( v.status === intStatus && v.priority === 0 ) {
                    objLogCount.none++;
                    strNoneIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityZero = truncateField( strPriorityZero, v.note, i, ( v.attachment || false ) );
                  } else if ( v.status === intStatus && v.priority === 4 ) {
                    objLogCount.high++;
                    strHighIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityFour = truncateField( strPriorityFour, v.note, i, ( v.attachment || false ) );
                  } else if ( v.status === intStatus && v.priority === 1 ) {
                    objLogCount.low++;
                    strLowIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityOne = truncateField( strPriorityOne, v.note, i, ( v.attachment || false ) );
                  } else if ( v.status === intStatus ) {
                    objLogCount.elevated++;
                    strElevatedIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityThree = truncateField( strPriorityThree, v.note, i, ( v.attachment || false ) );
                  }
                } );
                var strNone = ':one: (' + objLogCount.none + ') None: ' + strNoneIndices,
                  strLow = ':two: (' + objLogCount.low + ') Low: ' + strLowIndices,
                  strMedium = ':three: (' + objLogCount.medium + ') Medium: ' + strMediumIndices,
                  strElevated = ':four: (' + objLogCount.elevated + ') Elevated: ' + strElevatedIndices,
                  strHigh = ':five: (' + objLogCount.high + ')' + 'High: ' + strHighIndices,
                  intStatusIndices = objLogCount.none + objLogCount.low + objLogCount.medium + objLogCount.elevated + objLogCount.high;
                msgEmbed
                  .setDescription( 'Below are the **' + intStatusIndices + '/' + objLogs.logs.length +
                    '** logged message' + ( intStatusIndices !== 1 ? 's' : '' ) +
                    ' with **Status:__ ' + arrArgs[ 2 ] + ' __** sorted by **Priority**' )
                  .addField( strHigh, ( strPriorityFour.length === 0 ? '**None**' : strPriorityFour ) )
                  .addField( strElevated, ( strPriorityThree.length === 0 ? '**None**' : strPriorityThree ) )
                  .addField( strMedium, ( strPriorityTwo.length === 0 ? '**None**' : strPriorityTwo ) )
                  .addField( strLow, ( strPriorityOne.length === 0 ? '**None**' : strPriorityOne ) )
                  .addField( strNone, ( strPriorityZero.length === 0 ? '**None**' : strPriorityZero ) )
                break;
              default :
                var strStatusNew = '', strNewIndices = '',
                  strStatusActive = '', strActiveIndices = '',
                  strStatusPaused = '', strPausedIndices = '',
                  strStatusDone = '', strDoneIndices = '';
                arrLogs.forEach( function( v, i ) {
                  if ( v.status === 0 ) {
                    objLogCount.new++;
                    strNewIndices += ' [**' + ( i + 1 ) + '**]';
                    strStatusNew = truncateField( strStatusNew, v.note, i, ( v.attachment || false ) );
                  } else if ( v.status === 3 ) {
                    objLogCount.done++;
                    strDoneIndices += ' [**' + ( i + 1 ) + '**]';
                    strStatusDone = truncateField( strStatusDone, v.note, i, ( v.attachment || false ) );
                  } else if ( v.status === 2 ) {
                    objLogCount.paused++;
                    strPausedIndices += ' [**' + ( i + 1 ) + '**]';
                    strStatusPaused = truncateField( strStatusPaused, v.note, i, ( v.attachment || false ) );
                  } else {
                    objLogCount.active++;
                    strActiveIndices += ' [**' + ( i + 1 ) + '**]';
                    strStatusActive = truncateField( strStatusActive, v.note, i, ( v.attachment || false ) );
                  }
                } );
                var strNew = ':new: (' + objLogCount.new + ') New: ' + strNewIndices,
                  strActive = ':tools: (' + objLogCount.active + ') Active: ' + strActiveIndices,
                  strPaused = ':thinking: (' + objLogCount.paused + ') Paused: ' + strPausedIndices,
                  strDone = ':white_check_mark: (' + objLogCount.done + ') Done: ' + strDoneIndices;
                msgEmbed
                  .setDescription( 'Below are the **' + objLogs.logs.length + '** logged message' + ( objLogs.logs.length !== 1 ? 's' : '' ) + ' sorted by **Status**' )
                  .addField( strNew, ( strStatusNew.length === 0 ? '**None**' : strStatusNew ) )
                  .addField( strActive, ( strStatusActive.length === 0 ? '**None**' : strStatusActive ) )
                  .addField( strPaused, ( strStatusPaused.length === 0 ? '**None**' : strStatusPaused ) )
                  .addField( strDone, ( strStatusDone.length === 0 ? '**None**' : strStatusDone ) );
            }
            break;
          case 'MEMBER' :
            var strMemberBy = '', strByIndices = '';
            if ( arrArgs[ 2 ] ) {
              arrLogs.forEach( function( v, i ) {
                if ( v.author.username === arrArgs[ 2 ] ) {
                  objLogCount.by++;
                  strByIndices += ( strByIndices.length >= 150 ? '.' : ' [**' + ( i + 1 ) + '**]' );
                  strMemberBy = truncateField( strMemberBy, v.note, i, ( v.attachment || false ) );
                }
              } );
              strByIndices.replace( /\.*/, '...' );
              var strBy = ':bust_in_silhouette: (' + objLogCount.by + ') By __' + arrArgs[ 2 ] + '__: ' + strByIndices
              msgEmbed
                .setDescription( 'Below are the **' + objLogCount.by + '/' + objLogs.logs.length + '** logged message' + ( objLogs.logs.length !== 1 ? 's' : '' ) + ' filtered to **Member**: ' + arrArgs[ 2 ] )
                .addField( strBy, ( strMemberBy.length === 0 ? '**None**' : strMemberBy ) )
                .setColor( 0xFF0000 );
            }
            else {
              var arrAuthors = [];
              arrLogs.forEach( function( v, i ) {
                if ( arrAuthors.indexOf( v.author.username ) === -1 ) {
                  arrAuthors.push( v.author.username );
                }
              } );
              arrAuthors.forEach( function( author, index ) {
                strByIndices += '\n\t:bust_in_silhouette: **__' + author + '__**';
              } );
              msgEmbed
                .setDescription( ':busts_in_silhouette: There are ' + arrAuthors.length + ' unique log creators:\n' + strByIndices )
                .setColor( 0xFF0000 );
            }
            break;
          default :
          case 'PRIORITY' :
            switch ( strStatusReq ) {
              case 1 : case 'NONE' : case 2 : case 'LOW' : case 3 : case 'MEDIUM' : case 4 : case 'ELEVATED' : case 5 : case 'HIGH' :
                const intPriority = ( !isNaN( parseInt( strStatusReq ) ) ? strStatusReq : ( strStatusReq === 'HIGH' ? 4 : ( strStatusReq === 'ELEVATED' ? 3 : ( strStatusReq === 'MEDIUM' ? 2 : ( strStatusReq === 'LOW' ? 1 : 0 ) ) ) ) );
                var strStatusNew = '', strNewIndices = '',
                  strStatusActive = '', strActiveIndices = '',
                  strStatusPaused = '', strPausedIndices = '',
                  strStatusDone = '', strDoneIndices = '';
                arrLogs.forEach( function( v, i ) {
                  if ( v.priority === intPriority && v.status === 0 ) {
                    objLogCount.new++;
                    strNewIndices += ' [**' + ( i + 1 ) + '**]';
                    strStatusNew = truncateField( strStatusNew, v.note, i, ( v.attachment || false ) );
                  } else if ( v.priority === intPriority && v.status === 3 ) {
                    objLogCount.done++;
                    strDoneIndices += ' [**' + ( i + 1 ) + '**]';
                    strStatusDone = truncateField( strStatusDone, v.note, i, ( v.attachment || false ) );
                  } else if ( v.priority === intPriority && v.status === 2 ) {
                    objLogCount.paused++;
                    strPausedIndices += ' [**' + ( i + 1 ) + '**]';
                    strStatusPaused = truncateField( strStatusPaused, v.note, i, ( v.attachment || false ) );
                  } else if ( v.priority === intPriority ) {
                    objLogCount.active++;
                    strActiveIndices += ' [**' + ( i + 1 ) + '**]';
                    strStatusActive = truncateField( strStatusActive, v.note, i, ( v.attachment || false ) );
                  }
                } );
                var strNew = ':new: (' + objLogCount.new + ') New: ' + strNewIndices,
                  strActive = ':tools: (' + objLogCount.active + ') Active: ' + strActiveIndices,
                  strPaused = ':thinking: (' + objLogCount.paused + ') Paused: ' + strPausedIndices,
                  strDone = ':white_check_mark: (' + objLogCount.done + ') Done: ' + strDoneIndices,
                  intPriorityIndices = objLogCount.new + objLogCount.active + objLogCount.paused + objLogCount.done;
                msgEmbed
                  .setDescription( 'Below are the **' + intPriorityIndices + '/' + objLogs.logs.length +
                    '** logged message' + ( intPriorityIndices !== 1 ? 's' : '' ) +
                    ' with **Priority:__ ' + arrArgs[ 2 ] + ' __** sorted by **Status**' )
                  .addField( strNew, ( strStatusNew.length === 0 ? '**None**' : strStatusNew ) )
                  .addField( strActive, ( strStatusActive.length === 0 ? '**None**' : strStatusActive ) )
                  .addField( strPaused, ( strStatusPaused.length === 0 ? '**None**' : strStatusPaused ) )
                  .addField( strDone, ( strStatusDone.length === 0 ? '**None**' : strStatusDone ) );
                break;
              default :
                var strPriorityZero = '', strNoneIndices = '',
                  strPriorityOne = '', strLowIndices = '',
                  strPriorityTwo = '', strMediumIndices = '',
                  strPriorityThree = '', strElevatedIndices = '',
                  strPriorityFour = '', strHighIndices = '';
                arrLogs.forEach( function( v, i ) {
                  if ( v.priority === 2 ) {
                    objLogCount.medium++;
                    strMediumIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityTwo = truncateField( strPriorityTwo, v.note, i, ( v.attachment || false ) );
                  } else if ( v.priority === 0 ) {
                    objLogCount.none++;
                    strNoneIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityZero = truncateField( strPriorityZero, v.note, i, ( v.attachment || false ) );
                  } else if ( v.priority === 4 ) {
                    objLogCount.high++;
                    strHighIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityFour = truncateField( strPriorityFour, v.note, i, ( v.attachment || false ) );
                  } else if ( v.priority === 1 ) {
                    objLogCount.low++;
                    strLowIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityOne = truncateField( strPriorityOne, v.note, i, ( v.attachment || false ) );
                  } else {
                    objLogCount.elevated++;
                    strElevatedIndices += ' [**' + ( i + 1 ) + '**]';
                    strPriorityThree = truncateField( strPriorityThree, v.note, i, ( v.attachment || false ) );
                  }
                } );
                var strNone = ':one: (' + objLogCount.none + ') None: ' + strNoneIndices,
                  strLow = ':two: (' + objLogCount.low + ') Low: ' + strLowIndices,
                  strMedium = ':three: (' + objLogCount.medium + ') Medium: ' + strMediumIndices,
                  strElevated = ':four: (' + objLogCount.elevated + ') Elevated: ' + strElevatedIndices,
                  strHigh = ':five: (' + objLogCount.high + ')' + 'High: ' + strHighIndices;
                msgEmbed
                  .setDescription( 'Below are the **' + objLogs.logs.length + '** logged message' + ( objLogs.logs.length !== 1 ? 's' : '' ) + ' sorted by **Priority**' )
                  .addField( strHigh, ( strPriorityFour.length === 0 ? '**None**' : strPriorityFour ) )
                  .addField( strElevated, ( strPriorityThree.length === 0 ? '**None**' : strPriorityThree ) )
                  .addField( strMedium, ( strPriorityTwo.length === 0 ? '**None**' : strPriorityTwo ) )
                  .addField( strLow, ( strPriorityOne.length === 0 ? '**None**' : strPriorityOne ) )
                  .addField( strNone, ( strPriorityZero.length === 0 ? '**None**' : strPriorityZero ) );
            }
        }
      }
      else if ( strCommand === 'PRIORITY' && intIndex >= 0 && intIndex < objLogs.logs.length ) {
        if ( !strTask ) strTask = 'MEDIUM';
        var objViewLog = objLogs.logs[ intIndex ];
        var strPriorityOld = ( objViewLog.priority + 1 );
        switch ( strTask ) {
          case '1' :
          case 'NONE' :
            objLogs.logs[ intIndex ].priority = 0;
            break;
          case '2' :
          case 'LOW' :
            objLogs.logs[ intIndex ].priority = 1;
            break;
          case '3' :
          case 'MEDIUM' :
            objLogs.logs[ intIndex ].priority = 2;
            break;
          case '4' :
          case 'ELEVATED' :
            objLogs.logs[ intIndex ].priority = 3;
            break;
          case '5' :
          case 'HIGH' :
            objLogs.logs[ intIndex ].priority = 4;
            break;
          default :
            message.channel.send( 'I\'m sorry, __**` ' + parseInt( arrArgs[ 1 ] ) + ' `**__ is not a valid priority.  Please try again with **(none|low|medium|elevated|high)** or an integer from **1-5**' );
            return;
        }
        var objLogAuthor = message.guild.members.get( objViewLog.author.id ).user;
        var emjPriority = '\u200B';
        for ( var i = 1; i < 6; i++ ) {
          if ( i !== strPriorityOld && i !== ( objViewLog.priority + 1 ) ) {
            emjPriority += ':' + arrOrdinalEmoji[ i ] + ':';
          } else if ( i === ( objViewLog.priority + 1 ) ) {
            emjPriority += ':white_check_mark:';
          } else {
            emjPriority += ':asterisk:';
          }
        }
        if ( objLogAuthor !== undefined && ( objViewLog.author.avatarURL !== ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL ) ) ) {
          objViewLog.author.avatarURL = ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL );
        }
        var strLogs = JSON.stringify( objLogs );
        fs.writeFile( fsLog, strLogs, ( err ) => {
          if ( err ) throw err;
        } );
        fs.writeFile( fsLogBackup, strLogs, ( err ) => {
          if ( err ) throw err;
        } );
        msgEmbed
          .setDescription( 'Below is the current information for log #**' + ( intIndex + 1 ) + '**' )
          .addField( 'Priority: **' + arrPriority[ objViewLog.priority ] + '**', emjPriority, true )
          .addField( 'Status: **' + arrStatus[ objViewLog.status ] + '**', arrStatusEmoji[ objViewLog.status ], true )
          .addField( 'Note:', objViewLog.note )
          .setTimestamp( objViewLog.timestamp )
          .setFooter( 'Logged by ' + objViewLog.author.tag, objViewLog.author.avatarURL );
      }
      else if ( strCommand === 'PRIORITY' && ( intIndex < 0 || intIndex >= objLogs.logs.length ) ) {// No such log
        message.channel.send( 'I\'m sorry, I can\'t change the priority of log #__**` ' + parseInt( arrArgs[ 1 ] ) + ' `**__ for you because it is not in range.  Please enter a value from **1-' + objLogs.logs.length + '**' );
        return;
      }
      else if ( strCommand === 'STATUS' && intIndex >= 0 && intIndex < objLogs.logs.length ) {
        if ( arrStatus.indexOf( strTask.toUpperCase() || 'NEW' ) !== -1 ) {
          var objViewLog = objLogs.logs[ intIndex ];
          var oldStatus = objViewLog.status;
          var objLogAuthor = message.guild.members.get( objViewLog.author.id ).user;
          var emjPriority = '\u200B';
          for ( var i = 1; i < 6; i++ ) {
            if ( i !== ( objViewLog.priority + 1 ) ) {
              emjPriority += ':' + arrOrdinalEmoji[ i ] + ':';
            } else {
              emjPriority += ':asterisk:';
            }
          }
          objLogs.logs[ intIndex ].status = arrStatus.indexOf( strTask.toUpperCase() );
          if ( objLogAuthor !== undefined && ( objViewLog.author.avatarURL !== ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL ) ) ) {
            objViewLog.author.avatarURL = ( objLogAuthor.avatarURL || objLogAuthor.defaultAvatarURL );
          }
          var strLogs = JSON.stringify( objLogs );
          fs.writeFile( fsLog, strLogs, ( err ) => {
            if ( err ) throw err;
          } );
          fs.writeFile( fsLogBackup, strLogs, ( err ) => {
            if ( err ) throw err;
          } );
          msgEmbed
            .setDescription( 'Below is the current information for log #**' + ( intIndex + 1 ) + '**' )
            .addField( 'Priority: **' + arrPriority[ objViewLog.priority ] + '**', emjPriority, true )
            .addField( 'Status: **' + arrStatus[ objViewLog.status ] + '**', arrStatusEmoji[ oldStatus ] + '\t:arrow_right:\t' + arrStatusEmoji[ objViewLog.status ], true )
            .addField( 'Note:', objViewLog.note )
            .setTimestamp( objViewLog.timestamp )
            .setFooter( 'Logged by ' + objViewLog.author.tag, objViewLog.author.avatarURL );
        } else {
          message.channel.send( 'I\'m sorry, __**` ' + parseInt( arrArgs[ 1 ] ) + ' `**__ is not a valid status.  Please try again with **(new|active|paused|done)**' );
          return;
        }
      }
      else if ( strCommand === 'STATUS' && ( intIndex < 0 || intIndex >= objLogs.logs.length ) ) {// No such log
        message.channel.send( 'I\'m sorry, I can\'t change the status of log #__**` ' + parseInt( arrArgs[ 1 ] ) + ' `**__ for you because it is not in range.  Please enter a value from **1-' + objLogs.logs.length + '**' );
        return;
      }
      else if ( strCommand === 'VIEW' && intIndex >= 0 && intIndex < objLogs.logs.length ) {
        var objViewLog = objLogs.logs[ intIndex ];
        var objLogAuthor = message.guild.members.get( objViewLog.author.id ).user;
        var emjPriority = '\u200B';
        for ( var i = 1; i < 6; i++ ) {
          if ( i !== ( objViewLog.priority + 1 ) ) {
            emjPriority += ':' + arrOrdinalEmoji[ i ] + ':';
          } else {
            emjPriority += ':asterisk:';
          }
        }
        var arrLinks = objViewLog.note.match( /(https?:\/\/[^ ]*)/gi );
        if ( arrLinks ) {
          msgContent += '\n';
          arrLinks.forEach( function( strLink, intLinkIndex ) {
            msgContent += '\n:link:\t' + strLink;
          } );
        }
        msgEmbed
          .setDescription( 'Below is the current information for log **#' + ( intIndex + 1 ) + '**' )
          .addField( 'Priority: **' + arrPriority[ objViewLog.priority ] + '**', emjPriority, true )
          .addField( 'Status: **' + arrStatus[ objViewLog.status ] + '**', arrStatusEmoji[ objViewLog.status ], true )
          .addField( 'Note:', objViewLog.note )
          .setTimestamp( objViewLog.timestamp )
          .setFooter( 'Logged by ' + objViewLog.author.tag, objViewLog.author.avatarURL );
        if ( objViewLog.attachment ) {
          msgEmbed
            .setImage( objViewLog.attachment );
        }
      }
      else if ( strCommand === 'VIEW' && ( intIndex < 0 || intIndex >= objLogs.logs.length ) ) {// No such log
        message.channel.send( 'I\'m sorry, I can\'t display log #__**` ' + parseInt( arrArgs[ 1 ] ) + ' `**__ for you because it is not in range.  Please enter a value from **1-' + objLogs.logs.length + '**' );
        return;
      }
      else {
        message.channel.send( '__**`' + args + '`**__ is not a valid command per `!logs help`.' );
        return;
      }
      message.channel.send( msgContent, { embed: msgEmbed } );
    } );
  }
}

module.exports = BotNotesLog;
//*/