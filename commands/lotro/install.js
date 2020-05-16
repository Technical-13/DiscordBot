const commando = require( 'discord.js-commando' );
const timeString = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZone: 'America/New_York'
  };

class Install extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'install',
      group: 'lotro',
      memberName: 'install',
      description: 'Display information about installing the game client.',
    } );
  }

  async run( message, args ) {
		message.channel.send( {
      embed: {
        title: 'Download "The Lord of the Rings Online"',
        url: 'https://www.lotro.com/en/game/download',
        description: 'So, you need help getting started?  ',
        thumbnail: {
//          url: 'https://www.lotro.com/sites/all/themes/lotro_default/images/logo-lotro-en.png'//LotRO Logo
          url: 'https://i0.wp.com/braxwolf.files.wordpress.com/2016/01/2376243912_fd5f042a45_o.jpg?resize=200%2C200&ssl=1'
        },
        image: {
          url: 'https://cdn.discordapp.com/attachments/268516726730260481/344544317760864257/LotRO_system_requirements.png'
        },
        color: 0xFEFA34,
        fields: [
          {
            name: 'PC client',
            value: ':small_blue_diamond: [Microsoft Visual C++ 2005 Service Pack 1 Redistributable Package MFC Security Update]( <https://www.microsoft.com/en-us/download/details.aspx?id=26347> )\n' +
              ':small_blue_diamond: [Microsoft Visual C++ 2010 Redistributable Package (x64)]( <https://www.microsoft.com/en-us/download/details.aspx?id=14632> )\n' +
              ':large_blue_diamond: DirectX v9:\n' +
              ':small_blue_diamond::small_orange_diamond: Windows 10: [Download DirectX 9.29.1974 End-User Runtimes (June 2010)]( <https://www.microsoft.com/en-us/download/details.aspx?id=8109> )\n' +
              ':small_blue_diamond::small_orange_diamond: Earlier: [Download DirectX 9.0c End-User Runtime]( <https://www.microsoft.com/en-us/download/confirmation.aspx?id=34429> )\n' +
              ':small_blue_diamond: [Download LotRO Client]( <http://content.turbine.com/sites/clientdl/lotro/lotrolive.exe> )'
          },
          {
            name: 'Mac Client',
            value: ':small_blue_diamond: [Download LotRO Client]( <http://content.turbine.com/sites/clientdl/lotro/lotrolive.dmg> )'
          }
        ],
        timestamp: new Date(),
        footer : {
          text: 'Updated: 2017-08-08.'
        }
      }
		} );
  }  
}

module.exports = Install;