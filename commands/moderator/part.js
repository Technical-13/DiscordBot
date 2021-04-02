const Database = require( '@replit/database' );
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

class PartGuild extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'part',
      group: 'moderator',
      memberName: 'part',
      ownerOnly: true,
      format: '<guild.id> [blacklist|skipnotice]',
      description: 'Force exit a guild by ID. This is an ownerOnly command. <guild.id> is required to use optional parameters.'
    } );
  }
  
  async run( message, args ) {
    const myGuilds = new Database();
    var client = message.client;
    var blacklist = false, skipnotice = false;
    const arrArgs = args.toLowerCase().split( ' ' );
    if ( arrArgs.length > 1 ) {
      if ( arrArgs.indexOf( 'skipnotice' ) !== -1 ) { skipnotice = true; }
      if ( arrArgs.indexOf( 'blacklist' ) !== -1 ) { blacklist = true; }
    }
    var partGuild;
    if ( arrArgs[ 0 ] ) {
      try {
        partGuild = arrArgs[ 0 ];
        partGuild = await client.guilds.cache.get( partGuild );
        if ( partGuild === undefined ) {
          partGuild = arrArgs[ 0 ];
          throw 'invalid guild ID';
        }
      } catch ( getGuildErr ) {
        message.channel.send( 'Unable to part guild with :id:' + partGuild + '.' );
        console.error( `${strNow()}:\n\tError attempting to get guild with id "${partGuild}": ${getGuildErr}` );
        if ( message.channel.type !== 'dm' ) {
          message.delete( { reason: 'Cleaning up request to part guild from ' + message.author.id + '.' } );
        }
        return;
      }
    } else if ( message.channel.type !== 'dm' ) {
      partGuild = message.guild;
    }
    if ( partGuild ) {
      var ojbPartInfo = await message.channel.send( 'I\'m leaving **' + partGuild.name + '** as requested by <@' + message.author.id + '>.' );
      myGuilds.set( guild.id, { 'blacklist': true } ).catch( errSetDB => {
        console.error( `Failed to set server as blacklisted in myGuilds.db: ${errSetDB}` );
        ojbPartInfo.delete();
         message.author.send( 'I\'m aborting your request to leave **' + partGuild.name + '** and blacklist the server as I was unable to set the key in *myGuilds.db*:\n\tPlease check the console and try again.' ).catch( errSendDM => { console.error( `\t${message.author.tag} I was unable to DM you and let you know I aborted the request to leave ${partGuild.name} and blacklist the server as I was unable to set the key in myGuilds.db:\n\tPlease check the console above and try again:\n\t${errSendDM}` ); } );
      } );
      if ( message.author.id !== partGuild.owner.user.id && !skipnotice ) {
        let notice = '<@' + message.author.id + '>, has forced me to leave your server, **' + partGuild.name + '**.';
        if ( !blacklist ) {
          notice += '\nTo get me back visit:\n<https://discordapp.com/api/oauth2/authorize?client_id=' + message.client.user.id + '&scope=bot&permissions=8>';
        } else {
          notice += '\nYour server has been blacklisted, please contact an owner in <https://discord.me/TheShoeStore> if you think this is in error.';
        }
        partGuild.owner
        .send( notice ).then( dmSent => {
          ojbPartInfo.edit( ojbPartInfo.content + '\nNotified <@' + partGuild.owner.user.id + '> by DM of forced server part.' );
        } ).catch( errSend => {
          console.error( `${strNow()}:\n\tError attempting to DM owner of guild "${partGuild.name}", ${partGuild.owner.user.tag}, notification of forced server part: ${errSend}` );
          ojbPartInfo.edit( ojbPartInfo.content + '\nFailed to DM <@' + partGuild.owner.user.id + '> notification of forced server part.' );
        } );
      } else if ( skipnotice ) {
        ojbPartInfo.edit( ojbPartInfo.content + '\nSkipped DM of part because as requested.' );
      } else {
        ojbPartInfo.edit( ojbPartInfo.content + '\nSkipped DM of part because you\'re the owner.' );
      }//*/
      /*partGuild.leave()
        .then( guildLeft => {
          console.log( `${strNow()}:\tBot forced to leave '${partGuild.name}' (${partGuild.id}) by ${message.author.tag}: ${guildLeft}` );
          var msgEmbed = new Discord.MessageEmbed()
            .setColor( '#FF0000' )
            .setTitle( ':arrow_left: Left a guild named:' )
            .setThumbnail( partGuild.iconURL )
            .setDescription( ':arrow_left:\t**' + mpartGuild.name + '**' )
            .addField( 'Founded on ... by ...', partGuild.createdAt.toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ) + ' - <@' + partGuild.ownerID + '> (' + partGuild.owner.user.username + '#' + partGuild.owner.user.discriminator + ')' )
            .addField( 'Members / Channels', partGuild.memberCount + ' / ' + partGuild.channels.size )
            .addField( 'Region', partGuild.region );
          settings[ bot ].debug.forEach( function( log ){
            message.client.channels.get( log ).send( { embed: msgEmbed } );
          } );
        } )
        .catch( errLeave => {
          console.error( `${strNow()}: Error attempting to leave '${partGuild.name}' (${partGuild.id}) ${errLeave}` );
        } );//*/
        console.log( `${strNow()}:\tBot forced to leave '${partGuild.name}' (${partGuild.id}) by ${message.author.tag}: SIMULATION` );
    }
  }
}
module.exports = PartGuild;
