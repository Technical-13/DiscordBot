const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class MordorCompare extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'mordor',
      group: 'lotro',
      memberName: 'mordor',
      description: 'Mordor expansion option comparisons for The Lord of the Rings Online.',
    } );
  }

  async run( message, args ) {
    if ( args ) {
      switch ( args.toLowerCase() ) {
        case 'de':
        case 'german':
          var language = 'de_DE';
          var msgContent = 'Deutsche (German): ';
          break;
        case 'fr':
        case 'french':
          var language = 'fr_FR';
          var msgContent = 'Français (French): ';
          break;
        case 'gb':
        case 'en-gb':
        case 'british':
        case 'english':
          var language = 'en_GB';
          var msgContent = 'British English: ';
          break;
        case 'en':
        case 'en-us':
        case 'american':
          var language = 'en_US';
          var msgContent = 'American English: ';
          break;
        default :
          var language = 'en_US';
          var msgContent = '`' + args + '` is not a know language, defaulting to American English: ';
      }
    } else {
      var language = 'en_US';
      var msgContent = 'American English: ';
    }
    
    var msgEmbed = new Discord.RichEmbed()
      .setURL( 'https://store.standingstonegames.com/store/ssg/' + language + '/custom/pbpage.lotro-mordor' )
      .setColor( '#B81F24' )
      .setTimestamp()
      .setFooter( '... as requested by ' + message.author.tag + '.' );
      
    switch ( language ) {
      case 'de_DE':
        msgEmbed
          .setTitle( 'Holen Sie sich die Mordor-Erweiterung!' )
          .setDescription( '*Klicken Sie auf das Bild unten, um zu erweitern.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo-de1.png' )
          .setImage( 'https://cdn.discordapp.com/attachments/335080730742882304/347795476545798145/Comparison_table_de.png' );
        break;
      case 'fr_FR':
        msgEmbed
          .setTitle( 'Obtenez l\'extension du Mordor!' )
          .setDescription( '*Cliquez sur l\'image ci-dessous pour l\'agrandir.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo-fr1.png' )
          .setImage( 'https://cdn.discordapp.com/attachments/335080730742882304/347797184844005378/Comparison_table_fr.png' );
        break;
      case 'en_GB':
      case 'en_US':
      default:
        msgEmbed
          .setTitle( 'Get the Mordor Expansion!' )
          .setDescription( '*Click on the image below to expand.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo1.png' )
          .setImage( 'https://cdn.discordapp.com/attachments/335080730742882304/347794086096535572/Comparison_table.png' );
    }
      
    message.channel.send( '**' + msgContent + '** *(embed below)*', { embed: msgEmbed } );
  }
}

module.exports = MordorCompare;