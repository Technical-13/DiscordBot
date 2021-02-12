const Discord = require( 'discord.js' );
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
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );

function remove( msgCollect, msgBot, objRemoveOptions ) {
  if ( isDebugMode ) { console.log( '%s: !test remove() options: %o', strNow, objRemoveOptions ); }
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
  reacted.on( 'collect', async collectedReaction => {
    if ( !isDebugMode ) { console.log( '%s: !test remove() collectedReaction === %o', strNow, collectedReaction ); }
    msgBot.delete().catch( errDel => {
      console.error( '%s: Failed to delete bot message: %o', strNow, errDel );
    } );
    msgBot.channel.send( strDelConfirmed )
      .then( message => {
        message.delete( intDelay ).catch( errDelRedacted => {
          console.error( '%s: Failed to delete `[redacted]` message: %o', strNow, errDelRedacted );
        } );
      } ).catch( errSendRedacted => {
        console.error( '%s: Failed to send `[redacted]` message: %o', strNow, errSendRedacted );
      } );
      reacted.stop();
  } );
}

class Test extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'test',
      group: 'util',
      memberName: 'test',
      description: 'Testing'
    } );
  }

  async run( message, strArgs ) {
    const guild = message.guild;
    const arrRoles = message.guild.roles.array().sort( function( a, b ){ return b.position - a.position } );
  }
}

module.exports = Test;