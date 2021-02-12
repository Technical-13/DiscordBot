const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const bot = 'LOTRObot';

class YouNoob extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'n00b',
      group: 'random',
      memberName: 'n00b',
      aliases: [ 'noob', 'no0b', 'n0ob', 'noo8', 'n0o8', 'no08', 'n008' ],
      description: 'Have the bot tell {@user} they\'re a n00b.'
    } );
  }
  
  async run ( message, args ) {
    if ( !args ) {
      // + No args, I don't know who you are calling a n00b.
      message.channel.send( 'You\'re such a n00b ' + message.author + ' that you forgot to specify who I should call a n00b!' );
    }
    else if ( message.mentions && ( message.mentions.members.first() !== message.mentions.members.last() || message.mentions.roles.size > 0 || message.mentions.everyone ) && settings[ bot ].owners.indexOf( message.author.id ) !== -1 ) {
      // + Bot owner calls multiple people a n00b, bot agrees.
      message.channel.send( 'Yes, ' + message.author + ', I think they are n00bs!' );
    }
    else if ( message.mentions && ( message.mentions.members.first() !== message.mentions.members.last() || message.mentions.roles.size > 0 || message.mentions.everyone ) ) {
      // + Multiple mentions, you can't mention multiple people at once with this command.
      message.channel.send( 'You\'re such a n00b ' + message.author + ', you can\'t mention multiple users at once!' );
    }
    else if ( message.mentions.members.has( message.client.user.id ) && settings[ bot ].owners.indexOf( message.author.id ) !== -1 ) {
      // + Bot owner calls bot a n00b, bot agrees.
      message.channel.send( 'Yes, ' + message.author + ', I am a n00b!' );
    }
    else if ( message.mentions.members.has( message.author.id ) ) {
      // Author calls themself a n00b, no self hating allowed!
      let msgLove = await message.channel.send( 'No, ' + message.author + ', you\'re not a n00b!  I love you!' );
      msgLove.react( '%E2%9D%A4' ).catch( e => { console.log( ( new Date() ).toLocaleDateString( 'en-US', timeString ) + e ); } );
    }
    else if ( ( message.mentions.members.has( message.client.user.id ) || settings[ bot ].owners.indexOf( message.mentions.members.first().id ) !== -1 ) && settings[ bot ].owners.indexOf( message.author.id ) === -1 ) {
      // + Anyone calls bot owner or bot a n00b (except bot owner), bot retorts.
      message.channel.send( 'No, ' + message.author + ', you\'re a n00b!' );
    }
    else if ( message.mentions.members.first() ) {
      // + None of the above are true, bot agrees with author that target is a n00b.
      message.channel.send( '_agrees with ' + message.author + ' that ' + message.mentions.members.first() + ' is a n00b!_' );
    }
    else {
      // + Args included but no mentions, need to mention the user to get this command to return an appropriate response.
      message.channel.send( 'You\'re such a n00b ' + message.author + ', `' + args + '` doesn\'t include a user mention!' );
    }
  }
}

module.exports = YouNoob;