const commando = require( 'discord.js-commando' );
const objTimeString = { year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };

class React extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'react',
      group: 'util',
      memberName: 'react',
      description: 'React to a comment, if possible.'
    } );
  }
  
  async run( message, args ) {console.log('%o: args: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ),args);
    args = args.split( ' ' );
    var rxp = /<:(.*)?:([\d]*)>/;
		var guild, channel, thisMessage, reaction;
    var isReaction = true;
    var isDeleted = false;
    if ( args[ 3 ] ) {
      if ( !message.client.guilds.find( guild => { if ( guild.id === args[ 3 ] ) { return guild; } } ) ) {
        isReaction = false;
        message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%o: Unable to `%o`: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), message.content, errReact ) } );
        message.reply( 'I\'m not in guild with id: `' + args[ 3 ] + '`' );
      } else {
        guild = message.client.guilds.find( guild => { if ( guild.id === args[ 3 ] ) { return guild; } } );
      }
    }
    else {
      guild = message.guild;
    }
    if ( isReaction && args[ 2 ] ) {
      if ( !guild.channels.find( channel => { if ( channel.id === args[ 2 ] ) { return channel; } } ) ) {
        isReaction = false;
        message.react( '%E2%9D%8C' ).catch( errReact => { console.error( '%o: Unable to `%o`: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), message.content, errReact ) } );
        message.reply( 'I don\'t have access to the `' + args[ 2 ] + '` channel of the `' + guild.name + '` guild.' );
      } else {
        channel = guild.channels.find( channel => { if ( channel.id === args[ 2 ] ) { return channel; } } );
      }
    }
    else if ( isReaction ) {
      channel = message.channel;
    }
/* Should be checking if bot has permission to react in the channel */
    let isMention = false;
    if ( args[ 1 ] !== undefined ) {
      if ( args[ 1 ].match( /<@!?(\d*)>/ ) !== null )  {
        if ( message.guild.members.get( args[ 1 ].match( /<@!?(\d*)>/ )[ 1 ] ) !== undefined ) {
          isMention = true;
        }
      }
    }
    if ( !args[ 1 ] ) {
      thisMessage = message.id;
    }
    else if ( args[ 1 ].toUpperCase() === 'LAST' ) {
      let msgList = message.channel.messages.array();
      thisMessage = msgList[ ( msgList.length - 2 ) ]; 
      message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( errDel => { console.error( '%o: Unable to delete `%o`: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), message.content, errDel ); } );
      isDeleted = true;
    }
    else if ( isMention ) {
      thisMessage = message.guild.members.get( args[ 1 ].match( /<@!?(\d*)>/ )[ 1 ] ).lastMessageID;
      if ( thisMessage !== null ) {
        message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( errDel => { console.error( '%o: Unable to delete `%o`: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), message.content, errDel ); } );
        isDeleted = true;
      }
      else {
        isReaction = false;
        message.react( '%E2%9D%8C' ).catch( error => { console.error( error ) } );
        message.reply( 'I can\'t find ' + message.guild.members.get( args[ 1 ].match( /<@!?(\d*)>/ )[ 1 ] ) + '\'s last message.' );
      }
    }
    else {
      thisMessage = args[ 1 ];
      message.delete( { reason: 'Processing `!react` command on message `' + thisMessage + '`.' } ).catch( errDel => { console.error( '%o: Unable to delete `%o`: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), message.content, errDel ); } );
      isDeleted = true;
    }
/* Should be checking if bot is blocked by the user */
    reaction = args[ 0 ];
		if ( rxp.test( reaction ) ) {
      reaction = reaction.match( rxp )[ 2 ];
		}
    else {
      reaction = encodeURI( reaction );
    }
    if ( isReaction ) {
      channel.fetchMessage( thisMessage ).then( objMsg => {
        objMsg.react( reaction ).then( reacted => {
          if ( !isDeleted ) {
            message.react( '%E2%9C%85' ).catch( errReact => { console.error( '%o: Unable to `%o`: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), message.content, errReact ) } ),
            message.react( reaction ).catch( errReact => { console.error( '%o: Unable to `%o`: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), message.content, errReact ) } )
          }
        }
        ).catch( errReact => { console.error( '%o: Unable to `%o`: %o', ( new Date() ).toLocaleDateString( 'en-US', objTimeString ), message.content, errReact ) } );
      } );
    }
  }
}

module.exports = React;