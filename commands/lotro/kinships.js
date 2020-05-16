const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const bot = 'LOTRObot';

class LotROkin extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'kinships',
      group: 'lotro',
      memberName: 'kinships',
      description: 'Offer for kinships to have a personalized channel in the LotRODiscord'
    } );
  }
  
  async run( message, args ) {
    if ( settings[ bot ].debug.indexOf( message.channel.id ) !== -1 || message.guild.id === '201024322444197888' ) {
      var targetName = message.author;
      if ( message.mentions.members.first() !== undefined ) {
        targetName = message.mentions.members.first().user;
      } else if ( args !== '' && args !== undefined ) {
        try {
          targetName = message.guild.members.find( member => member.user.username === args ).user;
        } catch ( e ) { console.log( e ); }
      }
      
      message.channel.send( {
        embed: {
          author: {
            name: 'Kinship Channels:',
            icon_url: 'https://lotro-wiki.com/images/7/70/Kinships-icon.png'
          },
          color: 0xDB9407,
          thumbnail: {
            url: message.guild.iconURL
          },
          description: targetName + ' if you would like to have a kinship channel on  the offical **' + message.guild.name + '** server, please read the following guidelines and instructions to make it so!',
          fields: [
            {
              name: 'Kinship channel guidelines:',
              value: ':large_orange_diamond: Must have at  least three kin members here on LotRODiscord.\n' +
                '\t:small_orange_diamond: One of which must be a <@&205811655118946307>.\n' +
                ':large_orange_diamond: Channel must stay active or will be removed.\n' +
                '\t:small_orange_diamond: Reminders will be offered 1, 2, 2.5, and 3 months of inactivity.\n' +
                '\t:small_orange_diamond: Any @Staff member may remove the channel at any point after that.'
            },
            {
              name: 'What to do to get a kinship channel:',
              value: 'Ask <@&201710935788748800> nicely.'
            }
          ],
          timestamp: new Date(),
          footer: {
            icon_url: message.author.avatarURL,
            text: message.author.username
          }
        }
      } );
    }
  }
}

module.exports = LotROkin;