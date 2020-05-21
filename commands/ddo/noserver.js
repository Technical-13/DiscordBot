const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class NoServer extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'noserver',
      group: 'ddo',
      memberName: 'noserver',
      description: 'A little information about each server\'s population to help new players pick the one that is right for them.',
    } );
  }

  async run( message, args ) {
    var msgEmbed = new Discord.RichEmbed()
      .setTitle( 'Server comparison help' )
      .setColor( '#234290' )
      .setTimestamp()
      .setFooter( '... as requested by ' + message.author.tag + '.' );
    switch ( args.toUpperCase() ) {
      case 'ARGO'        :
      case 'ARGONNESSEN' : msgEmbed
        .setDescription( '[Argonnessen](http://ddowiki.com/page/Argonnessen_(server)) is ...' )
        .addField( '**Server** specific guild channels here on Discord', '**None**' )
//        .addField( '**Server** specific guilds elsewhere on Discord',
//          '**Guild Name** :arrow_forward: contact: <@user_id> :arrow_right: <@user_id> :arrow_right: <@user_id>'
//        )
        .addField( '**Argonnessen** Streamers',
          ':movie_camera: <@194812778261905408>' +
          '\n:movie_camera: <@194812778261905408>' +
          '\n:movie_camera: :question:'
          , true )
        .addField( 'Channel',
          '[<:TwitchGlitch:349332792477220871>/DDOStream](https://www.twitch.tv/ddostream)' +
          '\n[<:YouTube:351476364362252288>/user/dungeonsanddragons](https://www.youtube.com/user/dungeonsanddragons)'
          , true )
        .addField( '**Argonnessen** official forums', '[Forum: Argonnessen](https://www.ddo.com/forums/forumdisplay.php?12-Argonnessen) on the official DDO Forums.' );
        break;
      case 'CANNITH' : msgEmbed
        .setDescription( '[Cannith](http://ddowiki.com/page/Cannith) is ...' )
        .addField( '**Server** specific guild channels here on Discord', '**None**' )
//        .addField( '**Server** specific guilds elsewhere on Discord',
//          '**Guild Name** :arrow_forward: contact: <@user_id> :arrow_right: <@user_id> :arrow_right: <@user_id>'
//        )
        .addField( '**Cannith** Streamers',
          ':movie_camera: <@194812778261905408>' +
          '\n:movie_camera: <@194812778261905408>' +
          '\n:movie_camera: :question:'
          , true )
        .addField( 'Channel',
          '[<:TwitchGlitch:349332792477220871>/DDOStream](https://www.twitch.tv/ddostream)' +
          '\n[<:YouTube:351476364362252288>/user/dungeonsanddragons](https://www.youtube.com/user/dungeonsanddragons)'
          , true )
        .addField( '**Cannith** Discord guilds (with invite links)',
          '**None**' )
        .addField( '**Cannith** official forums', '[Forum: Cannith](https://www.ddo.com/forums/forumdisplay.php?219-Cannith) on the official DDO Forums.' );
        break;
      case 'GLAND'     :
      case 'GHALLANDA' : msgEmbed
        .setDescription( '[Ghallanda](http://ddowiki.com/page/Ghallanda) is ...' )
        .addField( '**Server** specific guild channels here on Discord', '**None**' )
//        .addField( '**Server** specific guilds elsewhere on Discord',
//          '**Guild Name** :arrow_forward: contact: <@user_id> :arrow_right: <@user_id> :arrow_right: <@user_id>'
//        )
        .addField( '**Ghallanda** Streamers',
          ':movie_camera: <@194812778261905408>' +
          '\n:movie_camera: <@194812778261905408>' +
          '\n:movie_camera: :question:'
          , true )
        .addField( 'Channel',
          '[<:TwitchGlitch:349332792477220871>/DDOStream](https://www.twitch.tv/ddostream)' +
          '\n[<:YouTube:351476364362252288>/user/dungeonsanddragons](https://www.youtube.com/user/dungeonsanddragons)'
          , true )
        .addField( '**Ghallanda** Discord guilds (with invite links)',
          '**None**' )
        .addField( '**Ghallanda** official forums', '[Forum: Ghallanda](https://www.ddo.com/forums/forumdisplay.php?6-Ghallanda) on the official DDO Forums.' );
        break;
      case 'KHYBER' : msgEmbed
        .setDescription( '[Khyber](http://ddowiki.com/page/Khyber) is ...' )
        .addField( '**Server** specific guild channels here on Discord', '**None**' )
//        .addField( '**Server** specific guilds elsewhere on Discord',
//          '**Guild Name** :arrow_forward: contact: <@user_id> :arrow_right: <@user_id> :arrow_right: <@user_id>'
//        )
        .addField( '**Khyber** Streamers',
          ':movie_camera: <@194812778261905408>' +
          '\n:movie_camera: <@194812778261905408>' +
          '\n:movie_camera: :question:'
          , true )
        .addField( 'Channel',
          '[<:TwitchGlitch:349332792477220871>/DDOStream](https://www.twitch.tv/ddostream)' +
          '\n[<:YouTube:351476364362252288>/user/dungeonsanddragons](https://www.youtube.com/user/dungeonsanddragons)'
          , true )
        .addField( '**Khyber** Discord guilds (with invite links)',
          '**None**' )
        .addField( '**Khyber** official forums', '[Forum: Khyber](https://www.ddo.com/forums/forumdisplay.php?11-Khyber) on the official DDO Forums.' );
        break;
      case 'OREIN' : 
      case 'ORIEN' : msgEmbed
        .setDescription( '[Orien](http://ddowiki.com/page/Orien) is ...' )
        .addField( '**Server** specific guild channels here on Discord', '**None**' )
//        .addField( '**Server** specific guilds elsewhere on Discord',
//          '**Guild Name** :arrow_forward: contact: <@user_id> :arrow_right: <@user_id> :arrow_right: <@user_id>'
//        )
        .addField( '**Orien** Streamers',
          ':movie_camera: <@194812778261905408>' +
          '\n:movie_camera: <@194812778261905408>' +
          '\n:movie_camera: :question:'
          , true )
        .addField( 'Channel',
          '[<:TwitchGlitch:349332792477220871>/DDOStream](https://www.twitch.tv/ddostream)' +
          '\n[<:YouTube:351476364362252288>/user/dungeonsanddragons](https://www.youtube.com/user/dungeonsanddragons)'
          , true )
        .addField( '**Orien** Discord guilds (with invite links)',
          '**None**' )
        .addField( '**Orien** official forums', '[Forum: Orien](https://www.ddo.com/forums/forumdisplay.php?224-Orien) on the official DDO Forums.' );
        break;
      case 'SARLONA' : msgEmbed
        .setDescription( '[Sarlona](http://ddowiki.com/page/Sarlona) ...' )
        .addField( '**Server** specific guild channels here on Discord', '**None**' )
//        .addField( '**Server** specific guilds elsewhere on Discord',
//          '**Guild Name** :arrow_forward: contact: <@user_id> :arrow_right: <@user_id> :arrow_right: <@user_id>'
//        )
        .addField( '**Sarlona** Streamers',
          ':movie_camera: <@194812778261905408>' +
          '\n:movie_camera: <@194812778261905408>' +
          '\n:movie_camera: :question:'
          , true )
        .addField( 'Channel',
          '[<:TwitchGlitch:349332792477220871>/DDOStream](https://www.twitch.tv/ddostream)' +
          '\n[<:YouTube:351476364362252288>/user/dungeonsanddragons](https://www.youtube.com/user/dungeonsanddragons)'
          , true )
        .addField( '**Sarlona** Discord guilds (with invite links)',
          '**None**' )
        .addField( '**Sarlona** official forums', '[Forum: Sarlona](https://www.ddo.com/forums/forumdisplay.php?53-Sarlona) on the official DDO Forums.' );
        break;
      case 'THELANIS' : msgEmbed
        .setDescription( '[Thelanis](http://ddowiki.com/page/Thelanis) ...' )
        .addField( '**Server** specific guild channels here on Discord', '**None**' )
//        .addField( '**Server** specific guilds elsewhere on Discord',
//          '**Guild Name** :arrow_forward: contact: <@user_id> :arrow_right: <@user_id> :arrow_right: <@user_id>'
//        )
        .addField( '**Thelanis** Streamers',
          ':movie_camera: <@194812778261905408>' +
          '\n:movie_camera: <@194812778261905408>' +
          '\n:movie_camera: :question:'
          , true )
        .addField( 'Channel',
          '[<:TwitchGlitch:349332792477220871>/DDOStream](https://www.twitch.tv/ddostream)' +
          '\n[<:YouTube:351476364362252288>/user/dungeonsanddragons](https://www.youtube.com/user/dungeonsanddragons)'
          , true )
        .addField( '**Thelanis** Discord guilds (with invite links)',
          '**None**' )
        .addField( '**Thelanis** official forums', '[Forum: Thelanis](https://www.ddo.com/forums/forumdisplay.php?10-Thelanis) on the official DDO Forums.' );
        break;
      case 'WAYFINDER' : msgEmbed
        .setDescription( '[Wayfinder](http://ddowiki.com/page/Wayfinder_%28server%29) ...' )
        .addField( '**Server** specific guild channels here on Discord', '**None**' )
//        .addField( '**Server** specific guilds elsewhere on Discord',
//          '**Guild Name** :arrow_forward: contact: <@user_id> :arrow_right: <@user_id> :arrow_right: <@user_id>'
//        )
        .addField( '**Wayfinder** Streamers',
          ':movie_camera: <@194812778261905408>' +
          '\n:movie_camera: <@194812778261905408>' +
          '\n:movie_camera: :question:'
          , true )
        .addField( 'Channel',
          '[<:TwitchGlitch:349332792477220871>/DDOStream](https://www.twitch.tv/ddostream)' +
          '\n[<:YouTube:351476364362252288>/user/dungeonsanddragons](https://www.youtube.com/user/dungeonsanddragons)'
          , true )
        .addField( '**Wayfinder** Discord guilds (with invite links)',
          '**None**' )
        .addField( '**Wayfinder** official forums', '[Forum: Wayfinder](https://www.ddo.com/forums/forumdisplay.php?253-Wayfinder) on the official DDO Forums.' );
        break;
      case 'LAM'      :
      case 'LAMA'     :
      case 'LAMANNIA' : msgEmbed
        .setDescription( '[Lamannia](http://ddowiki.com/page/Lamannia) is a public test server which will be opened periodically to test new content, performance enhancements or hardware changes still in development, before they are completed and approved for the live servers.' )
        .addField( '**Lamannia** official forums', '[Forum: Lamannia (Public Test Server)](https://www.ddo.com/forums/forumdisplay.php?9-Lamannia-Server) on the official DDO Forums.' );
        break;
      default : msgEmbed
        .setDescription(
          'Are you new to **Dungeons & Dragons Online** and would like help in deciding which game server is right for you?  Here\'s a little information to help you decide!' )
        .addField( 'Argonnessen', '**Argonnessen** is ...  For more details, please type `!noserver Argonnessen`' )// Argonnessen
        .addField( 'Cannith', '**Cannith** is ...  For more details, please type `!noserver Cannith`' )// Cannith
        .addField( 'Ghallanda', '**Ghallanda** is ...  For more details, please type `!noserver Ghallanda`' )// Ghallanda
        .addField( 'Khyber', '**Khyber** is ...  For more details, please type `!noserver Khyber`' )// Khyber
        .addField( 'Orien', '**Orien** is ...  For more details, please type `!noserver Orien`' )// Orien
        .addField( 'Sarlona', '**Sarlona** is ...  For more details, please type `!noserver Sarlona`' )// Sarlona
        .addField( 'Thelanis', '**Thelanis** is ...  For more details, please type `!noserver Thelanis`' )// Thelanis
        .addField( 'Wayfinder', '**Wayfinder-DE** is ...  For more details, please type `!noserver Wayfinder`' )// Wayfinder
        .addField( 'Lamannia', '**Lamannia** is a public test server which will be opened periodically to test new content, performance enhancements or hardware changes still in development, before they are completed and approved for the live servers.  For more details, please type `!noserver Lamannia`' );// Lamannia
    }
      
    message.channel.send( '**Lord of the Rings Online server guide:**', { embed: msgEmbed } );
  }
}

module.exports = NoServer;
//*/