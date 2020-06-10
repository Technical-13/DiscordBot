const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const fsSettings = 'settings.json'
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const objTimeString = { timeZone: 'America/New_York',
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric' };
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const strScreenShotPath = path.join( __dirname, '../../images-lotro/' );
const isDebug = true;//settings[ bot ].onError.isDebugMode;

class Tanglecorn extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'tanglecorn',
      group: 'lotro',
      memberName: 'tanglecorn',
      description: 'Tanglecorn maps!'
    } );
  }

  async run( message, args ) {
    const arrArgs = args.split( ' ' );
    const arrMaps = [ ':zero:', ':one:', ':two:', ':three:', ':four:', ':five:' ];
    var intMap = ( ( ( ( new Date() ).getDate() % 5 ) + 3 ) % 4 );
    intMap = ( ( new Date() ).getHours() < 10 ? ( intMap - 1 ) : intMap );
    if ( arrArgs.length === 1 && ( parseInt( arrArgs[ 0 ] ) >= 1 && parseInt( arrArgs[ 0 ] ) <= 5 ) ) {
      intMap = parseInt( arrArgs[ 0 ] );
      strTitle = 'Tanglecorn map #' + intMap + ':';
    }
    var strTitle = 'Today\'s Tanglecorn map: ' + arrMaps[ intMap ];
    var strColor = '';
    switch ( intMap ) {
      case 1 : strColor = '#E68D8D'; break; case 2 : strColor = '#00AA00'; break;
      case 3 : strColor = '#AA5500'; break; case 4 : strColor = '#729FCF'; break;
      case 5 : strColor = '#AA00AA'; break; default: strColor = '#FF0000'; }
    
    var objShowMap = new Discord.RichEmbed()
      .setTitle( strTitle )
      .setColor( strColor )
      .setThumbnail( 'https://pbs.twimg.com/profile_images/660667914316419076/AIdjvy2T_400x400.png' )
      .setDescription( 'Tanglecorn maps are brought to you courtesy of:\n[<:Twitter:364781626963787779>@BrandywineFred](https://twitter.com/BrandywineFred/media) (' + await message.client.fetchUser( '193508727393878016' ) +  ')' )
      .setTimestamp()
      .setFooter( 'Requested by: ' + ( message.guild.members.get( message.author.id ).nickname || message.author.username ) + '#' + message.author.discriminator )
      .setImage( 'attachment://showMap.jpg' );
      
    var showMap = await message.channel.send( { embed: objShowMap, files: [ { attachment: strScreenShotPath + 'Tanglecorn' + intMap + '.jpg', name: 'showMap.jpg' } ] } );
    
/*    var intR = 0;
    do {
      let mapRE = ++intR + '%E2%83%A3';
      await showMap.react( mapRE ).catch( errReact => {
        const arrMapReactions = [ ':one:', ':two:', ':three:', ':four:', ':five:' ];
        let mapRN = arrMapReactions[ intR ];
        console.error( '%s: Unable to add reaction %s (Encoded:%s) to Tanglecorn map embed: %o', strNow, mapRN, mapRE, errReact );
        await showMap.delete().catch( errDel => { console.error( '%s: Unable to delete failed `!tanglecorn` attempt: %o', strNow, errDel } );
        return message.channel.send( { embed: objShowMap, files: [ { attachment: strScreenShotPath + 'Tanglecorn' + intMap + '.jpg', name: 'showMap.jpg' } ] } );
      } );
    } while ( intR < 5 );//*/
    
    message.delete().catch( errDel => { console.error( '%s: Unable to delete `!tanglecorn` request: %o', strNow, errDel ); } );
  }
}

module.exports = Tanglecorn;