const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class UrlEncode extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'encode',
      group: 'util',
      memberName: 'encode',
      aliases: [ 'decode', 'urldecode', 'urlencode' ],
      description: 'Simply encoding...'
    } );
  }
  
  async run( message, args ) {
    const command = message.content.split( ' ' )[ 0 ].replace( '!', '' ).toUpperCase();
    if ( command === 'ENCODE' || command === 'URLENCODE' ) {
      const strEncodeURI = encodeURI( args );
      const strAnchor = encodeURI( args )
        .replace( /%/g, '.' );
      const strWiki = encodeURI( args )
        .replace( /%20/g, '_' )
        .replace( /\(/g, '%28' )
        .replace( /\)/g, '%29' );
      var strContent = 'Standard : `' + strEncodeURI + '` :: ' + 'Anchor : `' + strAnchor + '` :: ' + 'Wiki : `' + strWiki + '`';
      var objEmbed = new Discord.RichEmbed()
        .setTitle( 'Encoding for: ')
        .setDescription( args )
        .addField( 'Standard encode :', '`' + strEncodeURI + '`' )
        .addField( 'Anchor encode :', '`' + strAnchor + '`' )
        .addField( 'Wiki encode :', '`' + strWiki + '`' )
        .setTimestamp()
        .setFooter( '... as requested by ' + message.author.tag + '.', message.author.displayAvatarURL );
      message.channel.send( strContent, { embed: objEmbed } );
    } else {
      var strDecoded = message.channel.send( 'Standard decode: `' + decodeURI( args ) + '`' );
    }
  }
}

module.exports = UrlEncode;