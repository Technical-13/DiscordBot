const commando = require( 'discord.js-commando' );
const forumPath = {
  lotro: 'https://www.lotro.com/forums/'
  };

class ForumThread extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'forums',
      group: 'random',
      memberName: 'forums',
			aliases: [ 'forum', 'fthread', 'fpost' ],
      description: 'Creates a link to the forum asked for.'
    } );
  }
  
  async run( message, args ) {
    var strCommand = message.content.split( ' ' )[ 0 ].replace( '!', '' ).toUpperCase();
    var intIndex = args.replace( / /g, '_' );
    var strType = 'thread';
    var strPHP = 'showthread.php?' + intIndex;
    switch ( strCommand ) {
      case 'FORUM' :
      case 'FORUMS' :
        strType = 'forum';
        strPHP = 'forumdisplay.php?' + intIndex;
        break;
      case 'FPOST' :
        strType = 'post';
        strPHP = 'showthread.php?p=' + intIndex + '#post' + intIndex;
        break;
      case 'FTHREAD' :
      default :
        strType = 'thread';
        strPHP = 'showthread.php?' + intIndex;
    }
    message.channel.send( 'You can find ' + strType + ' #**' + args + '** at <' + forumPath.lotro + strPHP + '>' );
  }  
}

module.exports = ForumThread;