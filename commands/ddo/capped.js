const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const objTimeString = { year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const bot = 'DDObot';

class Capped extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'capped',
      group: 'ddo',
      memberName: 'capped',
//      aliases: [ '' ],
      description: 'Want to know how close you are to XP cap?  Kobold can help!'
    } );
  }

  async run( message, args ) {
    var arrArgs = args.split( ' ' );
    var objEmbed = new Discord.RichEmbed()
      .setTitle( 'Experience points to level!' )
      .setFooter( 'Information prepared for ' +  message.author.username + ' on ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) , message.author.displayAvatarURL );
    const objXP = {
      champion: [ 0,       4000,    16000,   40000,   72000,   112000,  160000,  225000,  305000,  400000,
                  510000,  630000,  760000,  900000,  1050000, 1210000, 1375000, 1545000, 1720000, 1900000 ],
      hero:     [ 0,       6000,    24000,   60000,   108000,  168000,  240000,  337000,  457000,  600000,
                  765000,  945000,  1140000, 1350000, 1575000, 1815000, 2062000, 2317000, 2580000, 2850000 ],
      legend:   [ 0,       8000,    32000,   80000,   144000,  2224000, 320000,  450000,  610000,  800000,
                  1020000, 1260000, 1520000, 1800000, 2100000, 2420000, 2750000, 3090000, 3440000, 3800000 ],
      epic:     [ 600000,  1250000, 1950000, 2700000, 3500000, 4350000, 5250000, 6200000, 7200000, 8250000 ],
      ed:       [ 0,       180000,  420000,  720000,  1080000, 1500000, 1980000 ]
    };
    if ( parseInt( arrArgs[ 0 ] ) != NaN ) {
      switch ( arrArgs[ 1 ] ) {
        case 'xp' :
          if ( arrArgs[ 2 ] != undefined ){
            switch ( arrArgs[ 2 ].toLowerCase() ) {
              case 'heroic' : case 'champion' : case 'hero' : case 'legend' :
                console.log( 'Requested ' + arrArgs[ 2 ] + ' (heroic) experience information with ' + arrArgs[ 0 ] + ' experience.' );
                break;
              case 'epic' :
                console.log( 'Requested ' + arrArgs[ 2 ] + ' (epic) experience information ' + arrArgs[ 0 ] + ' experience.' );
                break;
              case 'ed' :
                console.log( 'Requested ' + arrArgs[ 2 ] + ' (ed) experience information ' + arrArgs[ 0 ] + ' experience.' );
                break;
              default :
                console.log( 'Requested ' + arrArgs[ 2 ] + ' (unknown type) experience information ' + arrArgs[ 0 ] + ' experience.' );
            }
          } else {
            console.log( 'Requested ' + arrArgs[ 2 ] + ' (undefined type) experience information ' + arrArgs[ 0 ] + ' experience.' );
          }
          break;
        case 'rank' :
          console.log( 'Requested experience information based on rank ' + arrArgs[ 0 ] + '.' );
          break;
        case 'level' :
          console.log( 'Requested experience information based on level ' + arrArgs[ 0 ] + '.' );
          break;
        default :
          console.log( 'Requested experience information based on undefined number: ' + arrArgs[ 0 ] + '.' );
      }
    }
  }
}

module.exports = Capped;