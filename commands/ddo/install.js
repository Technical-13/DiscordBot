const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const timeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York' };

class Install extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'install',
      group: 'ddo',
      memberName: 'install',
      description: 'Display information about installing the game client.',
    } );
  }

  async run( message, args ) {
    args = args.split( ' ' );
    var isRaw = ( args[ 1 ] ? ( args[ 1 ].toLowerCase() === 'raw' ? true : false ) : ( args[ 0 ] ? ( args[ 0 ].toLowerCase() === 'raw' ? true : false ) : false ) );
    var strArg = ( args[ 0 ] ? args[ 0 ].toLowerCase() : 'all' );
    var strMsg, msgEmbed = new Discord.RichEmbed();
    const strPC = [
      [ 'Download MS Visual C++ 2005 Redistributable Package (x86)', 'https://www.microsoft.com/en-us/download/confirmation.aspx?id=3387' ],
      [ 'Download DirectX 9.0c End-User Runtime', 'https://www.microsoft.com/en-us/download/confirmation.aspx?id=34429' ],
      [ 'Download DDO Client', 'http://content.turbine.com/sites/clientdl/ddo/ddolive.exe' ]
    ];
    const strMac = [
      [ 'Download DDO Client', 'http://content.turbine.com/sites/clientdl/ddo/ddolive.dmg' ]
    ];
    const strSysReq = ':calendar_spiral: Updated: ' + ( !isRaw ? '[' : '*__' ) + 'December 12, 2017 09:48' + ( !isRaw ? ']( ' : '__*: ' ) + '<https://help.standingstonegames.com/hc/en-us/articles/115002040207>' + ( !isRaw ? ' )' : '' );
    var strEmbedPC = '';
    var strEmbedMac = '';
    strPC.forEach( function( v, i ) {
      strEmbedPC += ( i >= 1 ? '\n' : '' ) + ':' + ( isRaw ? 'link' : 'small_blue_diamond' ) + ': ' + ( !isRaw ? '[' : '' ) + v[ 0 ] + ( !isRaw ? '](' : ': <' ) + v[ 1 ] + ( !isRaw ? ')' : '>' );
    } );
    strMac.forEach( function( v, i ) {
      strEmbedMac += ( i >= 1 ? '\n' : '' ) + ':' + ( isRaw ? 'link' : 'small_blue_diamond' ) + ': ' + ( !isRaw ? '[' : '' ) + v[ 0 ] + ( !isRaw ? '](' : ': <' ) + v[ 1 ] + ( !isRaw ? ')' : '>' );
    } );
    if ( isRaw ) {
      strMsg = '**Download "Dungeons & Dragons Online"**\n' +
        'So, you need help getting started?\n';
      switch ( strArg ) {
        case 'pc'  :
          strMsg += '\n**PC Client:**\n';
          strMsg += strEmbedPC;
          strMsg += '\n\n**Offical system requirements:**\n';
          strMsg += strSysReq;
          break;
        case 'mac' :
          strMsg += '\n**Mac Client:**\n';
          strMsg += strEmbedMac;
          break;
        default    :
          strMsg += '\n**PC Client:**\n';
          strMsg += strEmbedPC;
          strMsg += '\n\n**Offical system requirements:**\n';
          strMsg += strSysReq;
          strMsg += '\n\n**Mac Client:**\n';
          strMsg += strEmbedMac;
      }
      message.channel.send( strMsg );
    }
    else {
      msgEmbed
        .setTitle( 'Download "Dungeons & Dragons Online"' )
        .setURL( 'https://www.ddo.com/en/game/download' )
        .setThumbnail( 'http://www.ddo.com/sites/all/themes/ddo2/images/logo-ddo-en2.png' )
        .setColor( '#FEFA34' )
        .setDescription( 'So, you need help getting started?' )
        .setImage( 'https://cdn.discordapp.com/attachments/253912706824798209/421333204784644106/unknown.png' )
        .setTimestamp()
        .setFooter( 'Updated: 2018-03-08.' );
      strMsg = 'See nothing below?  Try `!install raw`';
      switch ( strArg ) {
        case 'pc'  :
          msgEmbed
            .addField( 'PC client:', strEmbedPC )
            .addField( 'Offical system requirements:', strSysReq );
          break;
        case 'mac' :
          msgEmbed.addField( 'Mac Client:', strEmbedMac );
          break;
        default    : 
          msgEmbed
            .addField( 'PC client:', strEmbedPC )
            .addField( 'Offical system requirements:', strSysReq )
            .addField( 'Mac Client:', strEmbedMac );
      }
      message.channel.send( strMsg, { embed: msgEmbed } );
    }
  }
}

module.exports = Install;