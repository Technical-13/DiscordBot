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
var strNow = function () { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
var settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const strScreenShotPath = path.join( __dirname, '../../images-lotro/' );
  
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
class Transfers extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'transfer',
      group: bot.toLowerCase().replace( 'bot', '' ),
      memberName: 'transfer',
      description: 'Transfers return!',
      aliases: [ 'transfers' ]
    } );
  }

  async run( message, args ) {
    var strLangCode = 'en';
    var msgContent = 'English: ';
    var baseURL = 'https://www.lotro.com/';
    var msgEmbed = new Discord.RichEmbed()
      .setColor( '#234290' )
      .setTimestamp();
    if ( args ) { switch ( args.toLowerCase() ) {
      case 'de': case 'deutsch':
      case 'german':
        msgContent = 'Deutsche (German): ';
        var strLangCode = 'de';
        break;
      case 'fr': case 'français':
      case 'french':
        msgContent = 'Français (French): ';
        var strLangCode = 'fr';
        break;
      case 'american': case 'en-us':
      case 'british': case 'gb': case 'en-gb':
      case 'en': case 'english': case '':
        break;
      default :
        msgContent = '`' + args + '` is not a known language, defaulting to English:\n';
    } }
    
    var selectedLang = require( path.join( __dirname, '../../Translations/transfers-' + strLangCode + '.json' ) );
    msgEmbed
      .setTitle( selectedLang.Title )
      .setThumbnail( selectedLang.Image )
      .setURL( baseURL + selectedLang.URL )
      .setDescription( selectedLang.Description )
      .setFooter( selectedLang.Footer + message.author.tag + '.' );
      for ( var intField in selectedLang.FieldNames ) {
        msgEmbed.addField( '**' + selectedLang.FieldNames[ intField ] + '**:', selectedLang.FieldValues[ intField ] );
      }

    message.channel.send( '**' + msgContent + '**\n:link: ' + baseURL + selectedLang.URL + '\n*(embed below)*', { embed: msgEmbed } );
  }
}

module.exports = Transfers;