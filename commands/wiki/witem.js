const commando = require( 'discord.js-commando' );
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
const wikiArticlePath = 'https://lotro-wiki.com/index.php/';

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

class WikiItemCommand extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'witem',
      group: 'wiki',
      memberName: 'witem',
      description: 'Creates a link to a wiki page for an Item: as requested.'
    } );
  }
  
  async run( message, args ) {
    const strWiki = 'Item:' + encodeURI( args )
      .replace( /%20/g, '_' )
      .replace( /\(/g, '%28' )
      .replace( /\)/g, '%29' );
    var msgWait = await message.channel.send( 'You can find the page for ** Item:' + args + '** at <' + wikiArticlePath + strWiki + '>' );
//    remove( message, msgWait );
  }  
}

module.exports = WikiItemCommand;