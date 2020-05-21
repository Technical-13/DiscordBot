const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class RavenloftCompare extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'ravenloft',
      group: 'ddo',
      memberName: 'ravenloft',
      description: 'Ravenloft expansion option comparisons for Dungeons & Dragons Online.'
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
      .setURL( 'https://store.turbine.com/store/turbine/' + language + '/custom/pbpage.ddo-ravenloft' )
      .setColor( '#B81F24' )
      .setTimestamp()
      .setFooter( '... as requested by ' + message.author.tag + '.' );
      
    switch ( language ) {
      case 'de_DE':
        msgEmbed
          .setTitle( 'Holen Sie sich die Ravenloft!' )
          .setDescription( '*Klicken Sie auf das Bild unten, um zu erweitern.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo-de1.png' )
//          .setImage( 'https://cdn.discordapp.com/attachments/335080730742882304/347795476545798145/Comparison_table_de.png' );
        break;
      case 'fr_FR':
        msgEmbed
          .setTitle( 'Obtenez l\'extension du Ravenloft!' )
          .setDescription( '*Cliquez sur l\'image ci-dessous pour l\'agrandir.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo-fr1.png' )
//          .setImage( 'https://cdn.discordapp.com/attachments/335080730742882304/347797184844005378/Comparison_table_fr.png' );
        break;
      case 'en_GB':
      case 'en_US':
      default:
        msgEmbed
          .setTitle( 'Get the Ravenloft Expansion!' )
          .setDescription( '*Click on the image below to expand.*' )
          .setThumbnail( 'https://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/pb/images/lotro-mordor/lotro-logo1.png' )
//          .setImage( 'https://cdn.discordapp.com/attachments/335080730742882304/347794086096535572/Comparison_table.png' );
    }
      // Ravenloft video on YT: https://youtu.be/R5oQbufNgY4
    message.channel.send( '**' + msgContent + '** *(embed below)*', { embed: msgEmbed } );
  }
}

module.exports = RavenloftCompare;