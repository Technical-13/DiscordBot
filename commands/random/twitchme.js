const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class TwitchMe extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'twitchme',
      group: 'random',
      memberName: 'twitchme',
      description: 'Explaination of how streams are announced in the stream announcement channel and helps troubleshoot why one might not be there.',
    } );
  }
  
  async run( message, args ) {
    var msgEmbed = new Discord.RichEmbed()
      .setColor( '#6441A4' )
      .setThumbnail( 'http://ddowiki.com/page/File:Twitch_Glitch_icon.png' )
      .setTitle( 'Why doesn\'t the bot announce my streams?' )
      .setDescription( 'This is a pretty frequent question here on Discord.  There are multiple reasons you may not see your stream announced.  Let\'s see if we can work through it with you and figure it out!' )
      .addField( 'Reason #1:', 'The bot\'s not online!  Go pester the bot\'s developer and staff over on [Now Live!](https://discord.gg/gKbbrFK)' )
      .addField( 'Reason #2:', 'Your game isn\'t properly set to "[The Lord of the Rings Online](https://www.twitch.tv/directory/game/The%20Lord%20of%20the%20Rings%20Online)" **OR** you\'re not part of the [lotro](https://www.twitch.tv/communities/lotro) community.  You\'ll need to have one of those for the bot to announce you here.' )
      .addField( 'Reason #3:', 'You didn\'t give enough time!  Due to the way that both the Twitch.tv API and the Discord API work (with network delays and rate limiting), it *may* take up to 15 minutes for the bot to actually display an announcement that you\'re live!' )
      .addField( 'Reason #4:', 'The bot **IS** announcing your stream! :open_mouth:  How can this be?  I go live and when I\'m done I come here to see if it announced and there\'s nothing here!  Well, quite simply, the bot deletes announcements once channels go offline!  If you want to see the announcement, you\'ll need to pop in and check it __**before**__ going offline.' )
      .addField( 'Reason #5:', 'I can\'t see any of the stream announcements... What the!?  Well... If that\'s the case, I\'m guessing that you have embeds disabled.  I\'ve removed the need to view embeds for the most part, but I have been finding the bot has been reseting some of it\'s configurations in relation to some recent updates.  Send <@440752068509040660> a quick DM and he\'ll resolve it the best he can.  We may be doing away with <@240729664035880961> sooner than later as a result of this.' )
      .addField( 'None of the above!', 'Well then, quite a strange situation here.  Get in touch with <@440752068509040660> personally via DM and he\'d be happy to try and help you work it out.' )
      .setTimestamp()
      .setFooter( 'Now Live!', 'https://cdn.discordapp.com/avatars/240729664035880961/fc1d3b807261f224bb566beff75c2327.png' );
    message.channel.send( '**Streamer help** *(embed below)*', { embed: msgEmbed } );
  }
}

module.exports = TwitchMe;