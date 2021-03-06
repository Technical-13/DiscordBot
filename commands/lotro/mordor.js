const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class MordorCompare extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'mordor',
      group: bot.toLowerCase().replace( 'bot', '' ),
      memberName: 'mordor',
      description: 'Mordor expansion option comparisons for The Lord of the Rings Online.',
    } );
  }

  async run( message, args ) {
    var storeURL = 'https://bit.ly/MordorLotRO';
    if ( args ) {
      switch ( args.toLowerCase() ) {
        case 'de':
        case 'german':
          var language = 'de_DE';
          var msgContent = 'Deutsche (German): ';
          storeURL = storeURL + '-DE';
          break;
        case 'fr':
        case 'french':
          var language = 'fr_FR';
          var msgContent = 'Français (French): ';
          storeURL = storeURL + '-FR';
          break;
        case 'gb':
        case 'en-gb':
        case 'british':
        case 'english':
          var language = 'en_GB';
          var msgContent = 'British English: ';
          storeURL = storeURL + '-GB';
          break;
        case 'en':
        case 'en-us':
        case 'american':
          var language = 'en_US';
          var msgContent = 'American English: ';
          break;
        default :
          var language = 'en_US';
          var msgContent = '`' + args + '` is not a known language, defaulting to American English:\n';
      }
    } else {
      var language = 'en_US';
      var msgContent = 'American English: ';
    }
    
    var imageBaseURL = 'https://cdn.discordapp.com/attachments/335080730742882304/';
    var msgEmbed = new Discord.RichEmbed()
      .setURL( storeURL )
      .setColor( '#B81F24' )
      .setTimestamp()
      .setFooter( '... as requested by ' + message.author.tag + '.' );
      
    switch ( language ) {
      case 'de_DE':
        msgEmbed
          .setTitle( 'Holen Sie sich die Mordor-Erweiterung!' )
          .setDescription( '*Klicken Sie auf das Bild unten, um zu erweitern.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo-de1.png' )
          .setImage( imageBaseURL + '347795476545798145/Comparison_table_de.png' );
        break;
      case 'fr_FR':
        msgEmbed
          .setTitle( 'Obtenez l\'extension du Mordor!' )
          .setDescription( '*Cliquez sur l\'image ci-dessous pour l\'agrandir.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo-fr1.png' )
          .setImage( imageBaseURL + '347797184844005378/Comparison_table_fr.png' );
        break;
      case 'en_GB':
      case 'en_US':
      default:
        msgEmbed
          .setTitle( 'Get the Mordor Expansion!' )
          .setDescription( '*Click on the image below to expand.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo1.png' )
          .setImage( imageBaseURL + '347794086096535572/Comparison_table.png' );
    }
      
    message.channel.send( '**' + msgContent + '**\n:link: ' + storeURL + '\n*(embed below)*', { embed: msgEmbed } );
  }
}

module.exports = MordorCompare;