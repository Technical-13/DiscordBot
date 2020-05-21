const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const fs = require( 'fs' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const fsSettings = 'settings.json'
const fsSpecials = bot + '/specials.json';
const today = ( new Date() ).setHours( 0, 0, 0, 0 );
var strNow = function () { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
var settings = require( path.join( __dirname, '../../../' + fsSettings ) );
var objSpecials = require( path.join( __dirname, '../../../' + fsSpecials ) );
const unirest = require( 'unirest' );
const strNewSpecialsFilePath = path.join( __dirname, '../../jsonSpecials/' );
var objUpdated = settings[ bot ].specials.updated;
const strDefaultImage = 'http://www.lotro.com/sites/all/themes/lotro_default/images/logo-lotro-en.png';
  
function remove( msgCollect, msgBot, objRemoveOptions ) {
  var boolOnly = false,
  intDelay = 5000,
  strDelConfirmed = '`[redacted]`',
  useReaction = '%F0%9F%97%91';
  if ( objRemoveOptions ) {
    if ( objRemoveOptions.boolOnly ) { boolOnly = objRemoveOptions.boolOnly; }
    if ( objRemoveOptions.intDelay ) { intDelay = objRemoveOptions.intDelay; }
    if ( objRemoveOptions.strDelConfirmed ) { strDelConfirmed = objRemoveOptions.strDelConfirmed; }
    if ( objRemoveOptions.useReaction ) { 
      let rxp = /<:(.*)?:([\d]*)>/;
      if ( rxp.test( objRemoveOptions.useReaction ) ) {
        useReaction = objRemoveOptions.useReaction.match( rxp )[ 2 ]; }
      else { useReaction = encodeURI( objRemoveOptions.useReaction ); }
    }
  }
  msgBot.react( useReaction );
  var reactedFilter = '';
  if ( boolOnly = true ) {
    reactedFilter = ( reaction, user ) => reaction.emoji.name === '🗑' && user.id === msgCollect.author.id;
  } else {
    reactedFilter = ( reaction, user ) => reaction.emoji.name === '🗑' && !user.bot;
  }
  const reacted = msgBot.createReactionCollector( reactedFilter );
  reacted.on( 'collect', r => {
    msgBot.delete().catch( errDel => { console.error( strNow() + ': Failed to delete bot message: ' + errDel ); } );
    msgBot.channel.send( strDelConfirmed )
      .then( message => {
        message.delete( intDelay ).catch( errDelRedacted => { console.error( strNow() + ': Failed to delete `[redacted]` message: ' + errDelRedacted ); } );
      } ).catch( errSendRedacted => { console.error( strNow() + ': Failed to send `[redacted]` message: ' + errSendRedacted ); } );
  } );
}

async function setSpecials( message, strNewSpecials ) {
  try {
    objSpecials = JSON.parse( strNewSpecials );
    objUpdated.setAuthorID = message.author.id;
    objUpdated.setAuthorName = message.author.username;
    objUpdated.setDateTime = new Date();
    message.react( '%E2%9C%85' );//CATCH THIS
    
    // Show what it will look like now that it's updated
    strUpdaters = ( objUpdated.setAuthorID === objUpdated.conAuthorID ? objUpdated.setAuthorName : objUpdated.setAuthorName + ' & ' + objUpdated.conAuthorName );
    var msgEmbed = new Discord.RichEmbed()
      .setTitle( 'The LOTRO Beacon™' + ( objSpecials.issue ? ': Issue ' + objSpecials.issue : '' ) )
      .setURL( objSpecials.URI )
      .setColor( '#234290' )
      .setImage( objSpecials.image || strDefaultImage )
      .setFooter( 'Last updated ' + ( new Date( objUpdated.setDateTime ) ).toLocaleDateString( 'en-US', objTimeString ) + ' by ' + strUpdaters + '.' );
    for ( var bonusday in objSpecials.bonusDays ) {
      if ( today <= ( new Date( objSpecials.bonusDays[ bonusday ].ends ) ) ) {
        msgEmbed.addField( objSpecials.bonusDays[ bonusday ].name, objSpecials.bonusDays[ bonusday ].value );
      }
    }
    for ( var freebie in objSpecials.freebies ) {
      if ( today <= ( new Date( objSpecials.freebies[ freebie ].ends ) ) ) {
        msgEmbed.addField( objSpecials.freebies[ freebie ].title + ':',
          '[__' + objSpecials.freebies[ freebie ].item.name + '__]( ' + objSpecials.freebies[ freebie ].item.link + ' ) **\u00D7 ' +
          objSpecials.freebies[ freebie ].quantity + '**\n:small_blue_diamond:**CODE:** **__' + objSpecials.freebies[ freebie ].code +
          '__**\n:small_blue_diamond:' + objSpecials.freebies[ freebie ].week
        );
      }
    }
    for ( var sale in objSpecials.sales ) {
      if ( today <= ( new Date( objSpecials.sales[ sale ].ends ) ) ) {
        msgEmbed.addField( objSpecials.sales[ sale ].name, ':small_blue_diamond:' + objSpecials.sales[ sale ].value.join( '\n:small_blue_diamond:' ) );
      }
    }
    var msgPreview = await message.channel.send( ':link: ' + objSpecials.URI, { embed: msgEmbed } );
    let strReminder = message.author + ', don\'t forget to `!specials set confirm` when you have finished setting this week\'s specials.';
    remove( message, msgPreview, { strDelConfirmed: strReminder, intDelay: 30000 } );
    return false;
  } catch ( errSetSpecials ) {
    console.error( '%o: setSpecials() failed to complete: %o', strNow(), errSetSpecials );
    return true;
  }
}

class Specials extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'specials',
      group: bot.toLowerCase().replace( 'bot', '' ),
      memberName: 'specials',
      description: 'What\'s hot this week!',
      aliases: [ 'bonusdays', 'coupon', 'freebie', 'sales', 'special' ]
    } );
  }

  async run( message, args ) {
    const strAlias = message.content.split( ' ' )[ 0 ];
    var objSetUsers = settings[ bot ].moderators;
    var objUpdated = settings[ bot ].specials.updated;
    var strUpdaters = ( objUpdated.setAuthorID === objUpdated.conAuthorID ? objUpdated.setAuthorName : objUpdated.setAuthorName + ' & ' + objUpdated.conAuthorName );
    var isDebug = settings[ bot ].onError.isDebugMode;
    var arrArgs = args.split( ' ' );
    var strCommand = ( arrArgs[ 0 ] ? arrArgs[ 0 ].toUpperCase() : 'NONE' );
    var strElement = ( arrArgs[ 1 ] ? arrArgs[ 1 ].toUpperCase() : 'NONE' );
    var arrParameters = [ 'NONE' ];
    arrArgs.slice( 2 ).forEach( function( parameter, index ) {
      if ( parameter ) {
        arrParameters[ index ] = parameter.toUpperCase();
      }
    } );
    var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = await ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false;
    if ( message.guild ) {
      var strCrownID = await message.guild.owner.user.id;
      isCrown = ( message.author.id === strCrownID ? true : false );
      var arrAdminRoles = [];
      message.guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
      } );
      arrAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) { isAdmin = true; }
      } );
    }
    
    switch ( strCommand ) {
      case 'ADD' :
        if ( isOwner ) {
          message.reply( 'Sorry - this function is not yet ready for testing.' );
        } else { message.reply( 'Sorry - this function is a work in progress, and you do not yet have access.' ); }
        break;
      case 'EDIT' :
        if ( isOwner ) {
          message.reply( 'Sorry - this function is not yet ready for testing.' );
        } else { message.reply( 'Sorry - this function is a work in progress, and you do not yet have access.' ); }
        break;
      case 'GET' :
        switch ( strElement ) {
          case 'OBJECT' :
            if ( JSON.stringify( objSpecials ).length > 1979 ) {
              message.reply( 'Sorry - the ability to return the json as a file due to length being too big is a work in progress, and you do not yet have access.' );
            } else {
              if ( ( isOwner || isBotMod ) && arrParameters[ 0 ] === 'HERE' ) {
                message.channel.send( '```json\n' + JSON.stringify( objSpecials ) + '\n```' );
                message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Unable to react to %s\'s message in %s#%s: %o', strNow(), message.author.tag, message.guild.name, message.channel.name, errReact ); } );
              } else {
                message.author.send( '```json\n' + JSON.stringify( objSpecials ) + '\n```' );
                message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Unable to react to %s\'s message in %s#%s: %o', strNow(), message.author.tag, message.guild.name, message.channel.name, errReact ); } );
              }
            }
            break;
          default :
            message.reply( 'Sorry - I can\'t complete that action yet.' );
            message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Unable to react to %s\'s message in %s#%s: %o', strNow(), message.author.tag, message.guild.name, message.channel.name, errReact ); } );
        }
        break;
      case 'SET' :
        if ( isOwner || isBotMod ) {
          switch ( strElement ) {
            case 'ATTACH' : case 'ATTACHED' :
            case 'OBJECT' :
              var strNewSpecials;
              var updateFailed = false;
              var strSpecialFilename = ( new Date() ).valueOf() + '.json';
              if ( message.attachments.size >= 1 ) {
                var msgTextFile = Array.from( message.attachments )[ 0 ][ 1 ];
                await unirest.get( msgTextFile.url ).headers( { 'Accept': 'text/plain', 'Content-Type': 'text/plain' } ).end( async function ( file ) {
                  if ( file.error ) {
                    console.error( '%s: Failed to get %s:\n%o', strNow(), msgTextFile.url, file.error );
                    updateFailed = true;
                  } else {
                    strNewSpecials = file.body;
                    try { let objJSONparse = JSON.parse( strNewSpecials ); } catch ( notJSON ) {
                      console.error( '%s: Failed to parse JSON from "%s", will JSON.stringify and try again!', strNow(), strNewSpecialsFilePath + strSpecialFilename );
                      strNewSpecials = JSON.stringify( file.body );
                    }
                    try {
                      fs.writeFileSync( strNewSpecialsFilePath + strSpecialFilename, strNewSpecials, ( errWrite ) => {
                        if ( errWrite ) {
                          updateFailed = true;
                          console.error( '%s: Failed to read "%s" in \'%s set %s: %o', strNow(), strNewSpecialsFilePath + strSpecialFilename, strAlias, strElement + ( strElement === 'OBJECT' ? '\' (with attachment)' : '' ), errWrite );
                          message.reply( 'failed to save ' + strNewSpecialsFilePath + strSpecialFilename + ' specials:\n' + errWrite + '\nRaw Data:\n\n`' + strNewSpecials + '`' );
                        } else {
                          console.log( '%s: %s uploaded %s: %o', strNow(), message.author.tag, strNewSpecialsFilePath + strSpecialFilename, strNewSpecials );
                        }
                      } );
                      if ( !updateFailed ) { updateFailed = await setSpecials( message, strNewSpecials ); }
                    } catch ( failedJSON ) {
                      console.error( '%s: Failed to parse JSON from "%s" in \'%s set %s: %o\nfailedJSON: %o', strNow(), strNewSpecialsFilePath + strSpecialFilename, strAlias, strElement + ( strElement === 'OBJECT' ? '\' (with attachment)' : '' ), strNewSpecials, failedJSON );
                      updateFailed = true;
                    }
                  }
                  if ( updateFailed ) {
                    message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Failed to react to failed `%s set %s` request.', strNow(), strAlias, strElement, errReact ); } );
                  } else {
                    message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Failed to react to successful `%s set %s` request.', strNow(), strAlias, strElement, errReact ); } );
                    var specialsAdded = await message.reply( 'the update to the specials was successfully added. :white_check_mark:' );
                    specialsAdded.delete( 30000 ).catch( errDel => { console.error( '%s: Failed to delete `%s set %s` confirmation from \'%s#%s\': %o', strNow(), strAlias, strElement, message.channel.name, guild.name, errDel ); } );
                  }
                } );
              } else {
                var intFirstTick = ( arrArgs.slice( 2 ).join( ' ' ).indexOf( '`' ) + 1 );
                var intLastTick = arrArgs.slice( 2 ).join( ' ' ).lastIndexOf( '`' );
                strNewSpecials = arrArgs.slice( 2 ).join( ' ' ).substring( intFirstTick, intLastTick );
                updateFailed = await setSpecials( message, strNewSpecials );
                if ( updateFailed ) {
                  message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Failed to react to failed `%s set %s` request.', strNow(), strAlias, strElement, errReact ); } );
                } else {
                  message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%s: Failed to react to successful `%s set %s` request.', strNow(), strAlias, strElement, errReact ); } );
                  var specialsAdded = await message.reply( 'the update to the specials was successfully added. :white_check_mark:' );
                  specialsAdded.delete( 30000 ).catch( errDel => { console.error( '%s: Failed to delete `%s set %s` confirmation from \'%s#%s\': %o', strNow(), strAlias, strElement, message.channel.name, guild.name, errDel ); } );
                }
              }
              break;
            case 'CONFIRM' :
              objUpdated.conAuthorID = message.author.id;
              objUpdated.conAuthorName = message.author.username;
              objUpdated.conDateTime = new Date();
              var strSpecials = JSON.stringify( objSpecials );
              fs.writeFile( '../' + fsSpecials, strSpecials, ( errWrite ) => {
                if ( errWrite ) {
                  message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Unable to react to %s\'s message in %s#%s: %o', strNow(), message.author.tag, message.guild.name, message.channel.name, errReact ); } );
                  var strConfirmFailure = strNow() + ': ' + message.author.username + ' (' + message.author + ') failed to committed current specials to ' + fsSpecials + ' with ` ' + strSpecials + '`: ' + errWrite;
                  message.channel.send( 'Please notify <@' + settings[ bot ].owners[ 0 ] + '> that there was an error saving these changes, ' + message.author + ': ' + strConfirmFailure );
                  throw strConfirmFailure;
                } else {
                  message.react( '%E2%9C%85' ).catch( errReact => { console.error( 'Unable to react to ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + strNow() + ': ' + errReact ); } );
                  var strConfirmSuccess = strNow() + ': ' + message.author.username + ' (' + message.author + ') committed current specials to ' + fsSpecials + ' with ` ' + strSpecials + '`';
                  if ( isDebug ) {
                    settings[ bot ].owners.forEach( async function( ownerID, i ) {
                      var objOwner = await message.client.fetchUser( ownerID );
                      objOwner.send( strConfirmSuccess );
                    } );
                    console.log( strConfirmSuccess );
                  } else {
                    settings[ bot ].owners.forEach( async function( ownerID, i ) {
                      if ( ownerID !== message.author.id ) {
                        var objOwner = await message.client.fetchUser( ownerID );
                        objOwner.send( message.author.username + ' (' + message.author + ') updated current specials successfully.' );
                      } else {
                        message.author.send( 'Thank you, ' + message.author.username + ' (' + message.author + '), for updating the current specials.' );
                      }
                    } );
                    settings[ bot ].moderators.forEach( async function( modID, i ) {
                      if ( modID !== message.author.id ) {
                        var objMod = await message.client.fetchUser( modID );
                        objMod.send( message.author.username + ' (' + message.author + ') updated current specials successfully.' );
                      } else {
                        message.author.send( 'Thank you, ' + message.author.username + ' (' + message.author + '), for updating the current specials.' );
                      }
                    } );
                    message.channel.send( 'I will remember these changes, ' + message.author + '.' ).then( msg => { msg.delete( 15000 ).catch( errDel => { console.error( '%s: Error attempting to clean up confirmation of setting specials: %o', strNow(), errDel ); } ) } );
                  }
                }
              } );
              fs.readFile( '../' + fsSettings, 'utf8', ( errRead, fileData ) => {
                if ( errRead ) { throw errRead; }
                fileData = JSON.parse( fileData );
                fileData[ bot ] = settings[ bot ];
                var strSettings = JSON.stringify( fileData );
                fs.writeFile( '../' + fsSettings, strSettings, ( errWrite ) => { if ( errWrite ) { throw errWrite; } } );
              } );
              break;
            default :
              message.reply( 'Sorry - I can\'t complete that action yet.' );
              message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%s: Unable to react to %s\'s message in %s#%s: %o', strNow(), message.author.tag, message.guild.name, message.channel.name, errReact ); } );
          }
        }
        else {
          message.reply( 'Sorry - You don\'t have access to that function.' );
        }
        break;
      case 'NONE' :
      default :
        strUpdaters = ( objUpdated.setAuthorID === objUpdated.conAuthorID ? objUpdated.setAuthorName : objUpdated.setAuthorName + ' & ' + objUpdated.conAuthorName );
        var msgEmbed = new Discord.RichEmbed()
      .setTitle( 'The LOTRO Beacon™' + ( objSpecials.issue ? ': Issue ' + objSpecials.issue : '' ) )
          .setURL( objSpecials.URI )
          .setColor( '#234290' )
          .setImage( objSpecials.image || strDefaultImage )
          .setFooter( 'Last updated ' + ( new Date( objUpdated.conDateTime ) ).toLocaleDateString( 'en-US', objTimeString ) + ' by ' + strUpdaters + '.' );
        for ( var bonusday in objSpecials.bonusDays ) {
          if ( today <= ( new Date( objSpecials.bonusDays[ bonusday ].ends ) ) ) {
            msgEmbed.addField( objSpecials.bonusDays[ bonusday ].name, objSpecials.bonusDays[ bonusday ].value );
          }
        }
        for ( var freebie in objSpecials.freebies ) {
          if ( today <= ( new Date( objSpecials.freebies[ freebie ].ends ) ) ) {
            msgEmbed.addField( objSpecials.freebies[ freebie ].title + ':',
              '[__' + objSpecials.freebies[ freebie ].item.name + '__]( ' + objSpecials.freebies[ freebie ].item.link + ' ) **\u00D7 ' +
              objSpecials.freebies[ freebie ].quantity + '**\n:small_blue_diamond:**CODE:** **__' + objSpecials.freebies[ freebie ].code +
              '__**\n:small_blue_diamond:' + objSpecials.freebies[ freebie ].week
            );
          }
        }
        for ( var sale in objSpecials.sales ) {
          if ( today <= ( new Date( objSpecials.sales[ sale ].ends ) ) ) {
            msgEmbed.addField( objSpecials.sales[ sale ].name, ':small_blue_diamond:' + objSpecials.sales[ sale ].value.join( '\n:small_blue_diamond:' ) );
          }
        }
        var msgSpecials = await message.channel.send( ':link: ' + objSpecials.URI, { embed: msgEmbed } );
        if ( strCommand !== 'STATIC' && strCommand !== 'PIN' ) {
          remove( message, msgSpecials, { strDelConfirmed: 'Thank you for viewing this weeks specials.  Please come again, ' + message.author + '. <:SSGPoint:500026272999669761>' } );
        } else if ( strCommand === 'PIN' && ( isOwner || isBotMod || isCrown || isAdmin ) ) {
          msgSpecials.pin().then( msgPinned => {
            if ( isDebug ) {
              console.log( '%s: I pinned the `!specials` to %s#%s for %s.', strNow(), message.guild.name, message.channel.name, message.author.tag );
            }
          } );
        }
    }
    message.delete( 12000 ).catch( errDel => { console.error( strNow() + ': Failed to delete `!noserver' + ( strCommand ? ' ' + strCommand + ( strElement ? ' ' + strElement + ( arrParameters.length > 0 ? ' ' + arrParameters.join( ' ' ) : '' ) : '' ) : '' ) + '` request: ' + errDel ); } );
  }
}

module.exports = Specials;
