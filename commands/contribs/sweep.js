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
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const isDebugMode = settings[ bot ].onError.isDebugMode;
const strNow = function () { return ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) };

class Sweep extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'sweep',
      group: 'contribs',
      memberName: 'sweep',
      description: 'A command that will look at the 100 most recent comments in the current channel and "sweep" up any of those that are yours.'
    } );
  }

  async run( message, strArgs ) {
    var isOwner = await ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = await ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isContributor = await ( settings[ bot ].contributors[ message.author.id ] ?
      ( settings[ bot ].contributors[ message.author.id ].commands.indexOf( 'sweep' ) !== -1 ? true : false )
      : false );
    var staffRole = false;
    var isStaff = false;
    if ( message.guild ) {
      if ( message.guild.id === '201024322444197888' ) {
        staffRole = await message.guild.roles.get( '201710935788748800' );
        isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
      }
    }
    
    await message.delete( { reason: 'Deleting `!sweep` request.' } ).catch( errDel => { console.error( '%s: !sweep encounted an error attempting to delete https://discordapp.com/channels/%s/%s/%s : %o', strNow, thisMessage.guild.id, thisMessage.channel.id, thisMessage.id, errDel ); } );
    
    try {
      if ( isContributor && ( new Date() ) >= ( new Date( settings[ bot ].contributors[ message.author.id ].expires ) ) ) {
        message.channel.send( 'I\'m sorry, ' + message.author + ', this command is reserved for bot contributors.  Your subscription seems to have lapsed.  To make a new contribution to the bot, please run the `!donate` command.' );
      }
      else if ( isOwner || isBotMod || isStaff || isContributor ) {
        var arrArgs = strArgs.split( ' ' );
        var intMessagesToDelete = ( arrArgs.length === 0 ? 1 : ( arrArgs[ 0 ].toUpperCase() === 'ALL' ? 100 : ( parseInt( arrArgs[ 0 ] ) > 100 ? 100 : parseInt( arrArgs[ 0 ] ) ) ) );
        message.channel.fetchMessages( { limit: 100 } ).then( messages => {
          let arrMessages = messages.array();
          arrMessages = arrMessages.filter( thisMessage => thisMessage.author.id === message.author.id && !thisMessage.system );
          arrMessages.length = ( intMessagesToDelete < arrMessages.length ? intMessagesToDelete : arrMessages.length );
          message.channel.bulkDelete( arrMessages )
            .catch( errDel => { console.error( '%s: !sweep encountered an error attempting to bulkDelete messages: %o', strNow, errDel ); } );
        } );
      }
      else {
        message.channel.send( 'I\'m sorry, ' + message.author + ', this command is reserved for bot contributors.  To learn how to make a contribution to the bot, please run the `!donate` command.' );
      }
    }
    catch ( errSweep ) {
      console.error( '%s: %o', strNow, errSweep );
      message.channel.send( 'I\'m sorry, ' + message.author + ', there was a critical error attempting to run this command.  You should never see this message, please contact <@' + settings[ bot ].owners[ 0 ] + '> to alert them to this issue.' );
    }
  }
}

module.exports = Sweep;