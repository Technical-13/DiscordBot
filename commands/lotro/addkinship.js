const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class AddKinship extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'addkinship',
      group: 'lotro',
      memberName: 'addkinship',
      aliases: [ 'addkin', 'kinme' ],
      description: 'Get details on what to do to get your kinship added to the `!noserver` list for your server.'
    } );
  }
  
  async run( message, args ) {
    var kinEmbed = new Discord.RichEmbed()
      .setColor( '#FF00FF' )
      .setTitle( 'Add Kinship' )
      .setDescription( 'So, I hear you\'d like to have your kinship listed in your server\'s `!noserver` details.\n' + 
        'To have this happen, send a DM to <@440752068509040660> with the following information:\n\n' +
        ':regional_indicator_a: Server name that your kinship is on\n' +
        ':regional_indicator_b: Case sensitive kinship name\n' +
        ':regional_indicator_c: Leader name (preferably Discord name)\n' +
        ':regional_indicator_d: Up to 2 additional contact names here on Discord for those interested in joining\n' +
        ':regional_indicator_e: Discord invite (if you have your own Discord server).  Thanks! :smiley:' )
      .setTimestamp()
      .setFooter( message.author.username + ' requested information.', message.author.displayAvatarURL );
      message.channel.send( 'Embed below: ' + args, { embed: kinEmbed } );
  }  
}

module.exports = AddKinship;