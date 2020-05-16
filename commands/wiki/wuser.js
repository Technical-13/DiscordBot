const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const request = require( 'request' );
const path = require( 'path' );
const fs = require( 'fs' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const bot = 'LOTRObot';
const fsSettings = 'settings.json'
var settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const isDebugMode = settings[ bot ].onError.isDebugMode;
const myWiki = settings[ bot ].wikis.lotrowiki;
const wikiApiPath = myWiki.root + myWiki.api;

function remove( msgCollect, msgBot, objRemoveOptions ) {
  if ( isDebugMode ) { console.log( '%s: !wuser remove() options: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), objRemoveOptions ); }
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
    reactedFilter = ( reaction, user ) => reaction.emoji.name === 'ðŸ—‘' && user.id === msgCollect.author.id;
  } else {
    reactedFilter = ( reaction, user ) => reaction.emoji.name === 'ðŸ—‘' && !user.bot;
  }
  const reacted = msgBot.createReactionCollector( reactedFilter );
  reacted.on( 'collect', r => {
    msgBot.delete().catch( errDel => {
      console.error( '%s: Failed to delete bot message: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), errDel );
    } );
    msgBot.channel.send( strDelConfirmed )
      .then( message => {
        message.delete( intDelay ).catch( errDelRedacted => {
          console.error( '%s: Failed to delete `[redacted]` message: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), errDelRedacted );
        } );
      } ).catch( errSendRedacted => {
        console.error( '%s: Failed to send `[redacted]` message: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), errSendRedacted );
      } );
  } );
}

class UserInfo extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'wuser',
      group: 'wiki',
      memberName: 'wuser',
      description: 'Display information about a user on wiki.',
    } );
  }

  async run( message, args ) {
    var msgWait = await message.channel.send( 'Collecting data for your query, please stand by...' );
    const strArgs = args.replace( ' ', '_' );
      var strArgsUpperCaseFirst = ( strArgs.charAt( 0 ).toUpperCase() + strArgs.slice( 1 ) || 'User name' );
    var msgEmbed = new Discord.RichEmbed()
      .setTimestamp()
      .setFooter( '... as requested by ' + message.author.tag + '.'/*, 'https://LOTRO-wiki.com/images/Blue_d20.png'*/ );
    var query = wikiApiPath + '?action=query&format=json&list=allusers&auprop=blockinfo|groups|editcount|registration&aulimit=max&auprefix=' + strArgsUpperCaseFirst;
    
    request( query, function ( error, response, body ) {
//console.log( '\nWe queried LOTRO-wiki\'s API with:\n\t`' + query + '`' );
//console.log( '\nThe json string returned by the wiki\'s API was:\n\t`' + body + '`' );
      if ( error !== null ) { // Print the error if one occurred
        console.error( 'error:', error );
        message.delete( { reason: 'Delete request for !wuser information for ' + strArgsUpperCaseFirst + ' as a result of an error.' } );
        msgWait.edit( 'I have encounted an error attempting to retrieve data for ' + strArgsUpperCaseFirst + '.  Please try again later.' ).catch( errEdit => {
          if ( isDebugMode ) { console.log( msgWait ); }
          console.error( '%s: Attempting to edit a "!user" error response failed with error: %o', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errEdit );
          message.channel.send( 'I have encounted an error! My owner has been notified.' ).catch( errSend => { console.error( '%s: %o', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errSend ) } );
        } );
      }
      else if ( response.statusCode !== 200 ) { // Print the response status code if a response was received
        if ( isDebugMode ) { console.log( 'statusCode:', response && response.statusCode ); }
        msgEmbed
          .setColor( '#000000' )
          .setTitle( '**' + response.statusCode + ':**' )
          .setURL( 'https://httpstatuses.com/' + response.statusCode )
//          .setThumbnail( '' )
          .setDescription( 'SOON™' );//https://en.wikipedia.org/w/api.php?action=query&indexpageids=true&format=jsonfm&prop=revisions&rvprop=content&rvsection=0&titles=HTTP_404
        
      }
      else {
        var allUsers = JSON.parse( body ).query.allusers;
        var numberOfUsers = allUsers.length;
        if ( numberOfUsers === 0 ) {
          var queryFrom = wikiApiPath + '?action=query&format=json&list=allusers&auprop=blockinfo|registration&aulimit=5&aufrom=' + args;
          
          request( queryFrom, async function ( errorFrom, responseFrom, bodyFrom ) {
//console.log( '\nWe queried LOTRO-wiki\'s API with:\n\t`' + queryFrom + '`' );
//console.log( '\nThe json string returned by the wiki\'s API was:\n\t`' + bodyFrom + '`' );
            if ( errorFrom !== null ) { // Print the error if one occurred
              console.error( '%s: request() API errorFrom:', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errorFrom );
              message.delete( { reason: 'Delete request due to error for `!wuser` information for list of users from: ' + args } );
              msgWait.edit( 'I have encounted an error attempting to retrieve data for list of users from:' + args + '.  Please try again later.' ).then( msgWaitEdited => {
//                remove( message, msgWait );
              } ).catch( errEdit => {
              console.error( '%s: Attempting to edit an "!user" response failed with error: %o', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errEdit );
              message.channel.send( 'Editing last message failed, here\'s your result:', { embed: msgEmbed } ).catch( errSend => { console.error( '%s: Attempting to send response anyway after edit failure response failed with error: %o', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errSend ); } );
            } );
            }
            else if ( responseFrom.statusCode !== 200 ) { // Print the response status code if a response was received
              console.log( 'statusCode:', responseFrom && responseFrom.statusCode );
              msgEmbed
                .setColor( '#000000' )
                .setTitle( '**' + response.statusCode + ':**' )
                .setURL( 'https://httpstatuses.com/' + response.statusCode )
      //          .setThumbnail( '' )
                .setDescription( 'SOON™' );//https://en.wikipedia.org/w/api.php?action=query&indexpageids=true&format=jsonfm&prop=revisions&rvprop=content&rvsection=0&titles=HTTP_404
            }
            else {
              var allUsersFrom = JSON.parse( bodyFrom ).query.allusers;
              var numberOfUsersFrom = allUsersFrom.length;
              var arrUserFromList = [];
              await allUsersFrom.forEach( async function( user, i ) {
                var userFromRegistration = '';
                if ( allUsersFrom[ i ].registration ) {
                  userFromRegistration = await ' (Created on ' + ( new Date( allUsersFrom[ i ].registration ) ).toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' at ' + ( new Date( allUsersFrom[ i ].registration ) ).toLocaleTimeString( 'en-US', { hour: 'numeric', minute: 'numeric', hour12: false } ) + ')';
                }
                arrUserFromList[ i ] = ':small_blue_diamond: [' + user.name + '](https://LOTRO-wiki.com/index.php/User:' + user.name.replace( ' ', '_' ) + ')' + userFromRegistration;
                if ( allUsersFrom[ i ].blockid ) {
                  arrUserFromList[ i ] = ':x: **(blocked)** ' + arrUserFromList[ i ].replace( ':small_blue_diamond: ', '' );
                }
              } );
              await msgEmbed
//                .setTitle( 'There were no users with a name starting with "' + strArgsUpperCaseFirst + '", so I\'ve pulled a list of the five names starting after that point:' )
//                .setURL( 'http://ddowiki.com/page/Special:UserLogin/signup?wpCreateaccountMail=1&wpName2=' + encodeURI( strArgsUpperCaseFirst ) )
                .setDescription( '**[Create an account](https://LOTRO-wiki.com/index.php/Special:UserLogin/signup?wpCreateaccountMail=1&wpName2=' + encodeURI( strArgsUpperCaseFirst ) + ') or see the [User list](https://LOTRO-wiki.com/index.php?title=Special:ListUsers&username=' + encodeURI( strArgsUpperCaseFirst ) + '&limit=5) on LOTRO-wiki:**' )
//                .setThumbnail( 'https://LOTRO-wiki.com/images/Black_d20.png' )
                .setColor( '#08349B' )
                .addField( '\u200B', arrUserFromList.join( '\n' ) );
            }
            msgWait.edit( { embed: msgEmbed } ).then( msgWaitEdited => {
//              remove( message, msgWait );
            } ).catch( errEdit => {
              console.error( '%s: Attempting to edit an "!user" response failed with error: %o', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errEdit );
              message.channel.send( 'Editing last message failed, here\'s your result:', { embed: msgEmbed } ).catch( errSend => { console.error( '%s: Attempting to send response anyway after edit failure response failed with error: %o', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errSend ); } );
            } );
          } );
        }
        else if ( numberOfUsers === 1 || ( numberOfUsers > 1 && allUsers[ 0 ].name === ( args[ 0 ].toUpperCase() + args.slice( 1 ) ) ) ) {
          var userInfo = allUsers[ 0 ];
          userInfo.nameURL = userInfo.name.replace( ' ', '_' );
          userInfo.userPageURL = 'https://LOTRO-wiki.com/index.php/User:' + userInfo.nameURL;
          msgEmbed
            .setTitle( 'User information for: ' + userInfo.name )
            .setDescription( userInfo.userPageURL )
//            .setThumbnail( 'https://LOTRO-wiki.com/images/Black_d20.png' )
            .setColor( '#542857' )
            .addField( 'Creation:', 'Created ' + ( userInfo.registration ? 'on ' + ( new Date( userInfo.registration ) ).toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' at ' + ( new Date( userInfo.registration ) ).toLocaleTimeString( 'en-US', { hour: 'numeric', minute: 'numeric', hour12: false } ) : 'before April 12, 2006' ) + ' [(log)](https://LOTRO-wiki.com/index.php?title=Special:Log&type=newusers&page=User:' + userInfo.nameURL + ')' )
            .addField( 'Edits:', userInfo.editcount.toLocaleString( 'en-US' ) + ' according to [Special:Contributions/' + userInfo.name + '](https://LOTRO-wiki.com/index.php/Special:Contributions/' + userInfo.nameURL + ')' );
          var arrImpliedGroups = [ '*', 'user' ];
          userInfo.groups = userInfo.groups.filter( group => arrImpliedGroups.indexOf( group ) === -1 );
          if ( userInfo.groups.indexOf( 'sysop' ) !== -1 ) {
            userInfo.groups[ userInfo.groups.indexOf( 'sysop' ) ] = 'administrator';
          }
          if ( userInfo.groups.length > 0 ) {
            msgEmbed
              .addField( 'User groups:', '<:one_ring:236624513586954243> ' + userInfo.groups.sort().join( ', ' ) );
          }
          if ( userInfo.blockid ) {// If user is blocked
            var parsedReason = userInfo.blockreason;
            var brLinks = userInfo.blockreason.match( /\[\[(.*?\|?.*?)\]\]/i );
            if ( brLinks ) {
              brLinks = brLinks.slice( 1 );
              brLinks.forEach( function( wikiLink, index ){
                if ( wikiLink.indexOf( '|' ) === -1 ) {
                  parsedReason = parsedReason.replace( '[[' + wikiLink + ']]' , '[' + wikiLink + '](https://LOTRO-wiki.com/index.php/' + wikiLink + ')' );
                } else {
                  parsedReason = parsedReason.replace( '[[' + wikiLink + ']]' , '[' + wikiLink.substring( wikiLink.indexOf( '|' ) + 1 ) + '](https://LOTRO-wiki.com/index.php/' + wikiLink.substring( 0, wikiLink.indexOf( '|' ) ) + ')' );
                }
              } );
            }
            var blockDate = '';
            if ( userInfo.blockexpiry === 'infinity' ) {
              blockDate = 'an unblock request is granted';
            } else {
              var arrDate = userInfo.blockexpiry.match( /([\d]{4})([\d]{2})([\d]{2})([\d]{2})([\d]{2})([\d]{2})/ ).slice( 1 );
              blockDate = ( new Date( arrDate[ 0 ], ( arrDate[ 1 ] - 1 ), arrDate[ 2 ], ( arrDate[ 3 ] - ( ( new Date() ).getTimezoneOffset() / 60 ) ), arrDate[ 4 ], arrDate[ 5 ] ) )
                .toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timezone: 'America/New_York' } );
            }
            msgEmbed
              .setColor( '#D00000' )
              .addField( 'BLOCKED:', '[' + userInfo.blockedby + '](https://LOTRO-wiki.com/index.php/' + userInfo.blockedby.replace( ' ', '_' ) + ') blocked this user until ' + blockDate + ' with reason: **' + ( !userInfo.blockreason ? '_none specified_' : parsedReason ) + '**' );
          }// End blocked user section
          // Set the thumbnail to show the protection level of the user's page
/*          var queryProtection = wikiApiPath + '?action=query&format=json&indexpageids=true&prop=info&inprop=protection&titles=User:' + strArgsUpperCaseFirst.replace( '_', '%20');
          
          request( queryProtection, function ( errorProtection, responseProtection, bodyProtection ) {
//            console.log( '\nWe queried LOTRO-wiki\'s API with:\n\t`' + queryProtection + '`' );
//            console.log( '\nThe json string returned by the wiki\'s API was:\n\t`' + bodyProtection + '`' );
            
            if ( errorProtection !== null ) {
              console.log( 'error:', errorProtection ); // Print the error if one occurred
            } else if ( responseProtection.statusCode !== 200 ) {              
              console.log( 'statusCode:', responseProtection && responseProtection.statusCode ); // Print the response status code if a response was received
            } else {
              const pageId = parseInt( JSON.parse( bodyProtection ).query.pageids[ 0 ] );
              const protections = JSON.parse( bodyProtection ).query.pages[ pageId ].protection;
              var protectionIcon = 'https://LOTRO-wiki.com/images/';
              if ( protections.length === 0 ) {
                protectionIcon += 'Purple';
              } else if ( protections.length === 1 ) {
                switch ( protections[ 0 ].type ) {
                  case 'edit' :
                    switch ( protections[ 0 ].level ) {
                      case 'autoconfirmed' :
                        protectionIcon += 'BluePurple';
                        break;
                      case 'sysop'         :
                        protectionIcon += 'RedPurple';
                        break;
                      default              :
                        protectionIcon += 'Black';
                    }
                    break;
                  case 'move' :
                    switch ( protections[ 0 ].level ) {
                      case 'autoconfirmed' :
                        protectionIcon += 'PurpleBlue';
                        break;
                      case 'sysop'         :
                        protectionIcon += 'PurpleRed';
                        break;
                      default              :
                        protectionIcon += 'Black';
                    }
                    break;
                  default     :
                    protectionIcon += 'Black';
                }
              } else if ( protections.length === 2 ) {
                var protectionIcons = [];
                switch ( protections[ 0 ].type ) {
                  case 'edit' :
                    switch ( protections[ 0 ].level ) {
                      case 'autoconfirmed' :
                        protectionIcons[ 0 ] = 'Blue';
                        break;
                      case 'sysop'         :
                        protectionIcons[ 0 ] = 'Red';
                        break;
                      default              :
                        protectionIcons = 'Black';
                    }
                    break;
                  case 'move' :
                    switch ( protections[ 0 ].level ) {
                      case 'autoconfirmed' :
                        protectionIcons[ 1 ] = 'Blue';
                        break;
                      case 'sysop'         :
                        protectionIcons[ 1 ] = 'Red';
                        break;
                      default              :
                        protectionIcons = 'Black';
                    }
                    break;
                  default     :
                    protectionIcons = 'Black';
                }
                switch ( protections[ 1 ].type ) {
                  case 'edit' :
                    switch ( protections[ 0 ].level ) {
                      case 'autoconfirmed' :
                        protectionIcons[ 0 ] = 'Blue';
                        break;
                      case 'sysop'         :
                        protectionIcons[ 0 ] = 'Red';
                        break;
                      default              :
                        protectionIcons = 'Black';
                    }
                    break;
                  case 'move' :
                    switch ( protections[ 0 ].level ) {
                      case 'autoconfirmed' :
                        protectionIcons[ 1 ] = 'Blue';
                        break;
                      case 'sysop'         :
                        protectionIcons[ 1 ] = 'Red';
                        break;
                      default              :
                        protectionIcons = 'Black';
                    }
                    break;
                  default     :
                    protectionIcons = 'Black';
                }
                console.log( protectionIcons );
                if ( protectionIcons.indexOf( 'Black' ) !== -1 ) {
                  protectionIcon += 'Black';
                } else if ( protectionIcons[ 0 ] === protectionIcons[ 1 ] ) {
                  protectionIcon += protectionIcons[ 0 ];
                } else {
                  protectionIcon += protectionIcons.join( '' );
                }
              }
              protectionIcon += '_d20.png';
              msgEmbed.setThumbnail( protectionIcon );
            }
          } );//*/
          /* User sub-pages
          ( new mw.Api ).get( { action: 'query', list: 'allpages', aplimit: 'max', apnamespace: 2, apprefix: strArgsUpperCaseFirst + '/' } ).done( function( subpages ){ console.log( '%o', subpages ); } );
          */
        } else {
          var arrUserList = [];
          var arrUserListValue = [];
          allUsers.forEach( function( user, i ) {
            arrUserList[ i ] = user.name;
          } );
          arrUserList.forEach( function( user, i ) {
            var userRegistration = '';
            if ( allUsers[ i ].registration ) {
              userRegistration = ' (Created on ' + ( new Date( allUsers[ i ].registration ) ).toLocaleDateString( 'en-US', objTimeString ) + ' at ' + ( new Date( allUsers[ i ].registration ) ).toLocaleTimeString( 'en-US', { hour: 'numeric', minute: 'numeric', hour12: false } ) + ')';
            }
            arrUserListValue[ i ] = '[' + arrUserList[ i ] + '](https://LOTRO-wiki.com/index.php/User:' + arrUserList[ i ].replace( ' ', '_' ) + ')' + userRegistration;
            if ( allUsers[ i ].blockid ) {
              arrUserListValue[ i ] += ' **(blocked)**';
            }
          } );
          msgEmbed
            .setTitle( 'There were ' + numberOfUsers + ' results for names starting with "' + strArgsUpperCaseFirst + '":' )
            .setDescription( 'See [the list](https://LOTRO-wiki.com/index.php?title=Special:ListUsers&username=' + strArgsUpperCaseFirst + '&limit=' + numberOfUsers + ') on LOTRO-wiki or refine your search to one of the names below:' )
//            .setThumbnail( 'https://LOTRO-wiki.com/images/Black_d20.png' )
            .setColor( '#08349B' )
            .addField( 'User search results for "' + strArgsUpperCaseFirst + '":', ':small_blue_diamond: ' + arrUserListValue.join( '\n:small_blue_diamond: ' ) );
        }
        msgWait.edit( { embed: msgEmbed } ).then( msgWaitEdited => {
//          remove( message, msgWait );
        } ).catch( errEdit => {
              console.error( '%s: Attempting to edit an "!user" response failed with error: %o', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errEdit );
              message.channel.send( 'Editing last message failed, here\'s your result:', { embed: msgEmbed } ).catch( errSend => { console.error( '%s: Attempting to send response anyway after edit failure response failed with error: %o', ( new Date() ).toLocaleDateString( 'en', objTimeString ), errSend ); } );
            } );
      }
    } );
  }  
}

module.exports = UserInfo;