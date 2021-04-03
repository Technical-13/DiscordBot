const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objTimeString = require( '../../time.json' );
const strScreenShotPath = path.join( __dirname, '../../images-lotro/' );

class QuadPack extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'quadpack',
      group: 'lotro',
      memberName: 'quadpack',
      aliases: [ 'quad' ],
      description: 'Quad Pack for The Lord of the Rings Online.'
    } );
  }

  async run( message, args ) {
    var msgAttachment = [];
    var msgEmbed = new Discord.MessageEmbed()
      .setTitle( 'Quad Pack' )
      .setURL( 'https://amzn.to/3bWQFW2' )
      .setColor( '#234290' )
      .setTimestamp()
      .setDescription( 'Get the first four Award-winning The Lord of the Rings Online™ Expansion Packs in a single purchase! Explore [Moria](<https://amzn.to/30Y1ZuO>), a truly vast underground environment like you’ve never seen before. Join the elves of Lothlórien in war against Sauron among the ancient ruins, spider-haunted canyons, and foul bogs of Mirkwood. Journey eastward toward the tower of Orthanc where an army of Isengard Orcs and Uruk-hai make ready for war. Ride into Combat atop your loyal War-steed as you defend the people of [Rohan](<https://amzn.to/3eTdv2t>) from the forces of Isengard and Mordor, and join the Rohirrim across the sprawling plains of Eastern Rohan.\n\n\t[Buy Quad Pack!](<https://amzn.to/3bWQFW2>) - $39.99 on Amazon' )
      .setFooter( '... as requested by ' + message.author.tag + '.' );
      
    message.channel.send( { embed: msgEmbed, files: msgAttachment } );
    message.delete().catch( errDel => { console.error( 'Unable to delete `!quadpack` request: %o', errDel ); } );
  }
}

module.exports = QuadPack;