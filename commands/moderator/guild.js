const Database = require( '@replit/database' );
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const defaultGuild = require( '../../defaultGuild.json' );
const objTimeString = require( '../../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

class GuildInfo extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'guild',
      group: 'moderator',
      memberName: 'guild',
      ownerOnly: true,
      format: '<guild.id> [getinfo|whitelist|blacklist|dumps3tt!ng5]',
      description: 'Force exit a guild by ID. This is an ownerOnly command. <guild.id> is required to use optional parameters.'
    } );
  }
  
  async run( message, args ) {
    const myGuilds = new Database();
    var client = message.client;
    var isGuild = true;
    var guild;
    var noguild = false,
    getinfo = false,
    whitelist = false,
    blacklist = false,
    dumpsettings = false;
    const arrArgs = args.toLowerCase().split( ' ' );
    if ( arrArgs.length > 1 ) {
      if ( arrArgs.indexOf( 'getinfo' ) !== -1 ) { getinfo = true; }
      if ( arrArgs.indexOf( 'whitelist' ) !== -1 ) { whitelist = true; }
      if ( arrArgs.indexOf( 'blacklist' ) !== -1 ) { blacklist = true; }
      if ( arrArgs.indexOf( 'dumps3tt!ng5' ) !== -1 ) { dumpsettings = true; }
    } else if ( arrArgs[ 0 ] === '' ) { noguild = true; }
    var thisPrefix = '';
    if ( message.channel.type !== 'dm' ) {
      thisPrefix = client.guilds.cache.get(message.guild.id).commandPrefix;
      message.delete( { reason: 'Cleaning up request for guild information from ' + message.author.id + '.' } );
    }
    var verbose = true;
    var ojbGuildInfo = await message.author.send( 'Processing your request for guild information...' )
      .catch( async errSendDM => {
        verbose = false;
        console.log( `${strNow()}:\n\tI was unable to DM ${message.author.tag} information about ${thisPrefix}guild request,\n\tThe Results are in the console below:` );
        let secondsToSelfDestruct = 5;
        var noDM = await message.reply( 'I was unable to DM you to process your request for guild information, see the results in the console.\nThis message will self destruct in ' + secondsToSelfDestruct-- + ' seconds.' );
        var delCountdown = setInterval( () => {
          noDM.edit( 'I was unable to DM you to process your request for guild information, see the results in the console.\nThis message will self destruct in ' + secondsToSelfDestruct-- + ' seconds.' );
          if ( secondsToSelfDestruct <= 0 ) {
            clearInterval( delCountdown );
            noDM.delete();
          }
        }, 1000 );
      } );
    if ( arrArgs[ 0 ] ) {
      var inDB = await myGuilds.list().then( guildIDs => {
        if ( guildIDs.indexOf( arrArgs[ 0 ] ) !== -1 ) { return true; }
        else { return false };
      } );
      try {
        guild = arrArgs[ 0 ];
        guild = await client.guilds.cache.get( guild );
        if ( guild === undefined && !inDB ) {
          guild = arrArgs[ 0 ];
          throw 'Invalid guild ID: ' + guild;
        } else if ( guild === undefined && inDB ) {
          isGuild = false;
          guild = { id: arrArgs[ 0 ] };
          guild.name = await myGuilds.list().then( guildIDs => {
            if ( guildIDs.indexOf( guild.id ) !== -1 ) {
              myGuilds.get( guild.id ).then( thisGuild => {
                if ( thisGuild.name ) { return thisGuild.name; }
              } );
            }
          } );
          guild.owner = await myGuilds.list().then( guildIDs => {
            if ( guildIDs.indexOf( guild.id ) !== -1 ) {
              myGuilds.get( guild.id ).then( thisGuild => {
                if ( thisGuild.owner ) { return thisGuild.owner; }
              } );
            }
          } );
        }
        if ( verbose ) { await ojbGuildInfo.edit( 'Processing your request for information on **' + guild.name + '**.' ); }
      } catch ( getGuildErr ) {
        if ( verbose ) { await ojbGuildInfo.edit( 'Unable to get guild :id:' + guild + '.\n\t' + getGuildErr ); }
        console.error( `${strNow()}:\n\tError attempting to get guild id:${guild}:\n\t\t${getGuildErr}` );
        return;
      }
    } else if ( message.channel.type !== 'dm' ) {
      guild = message.guild;
      if ( verbose ) { await ojbGuildInfo.edit( 'Processing your request to leave **' + guild.name + '**.' ); }
    }
    if ( guild ) {
      if ( noguild ) { console.log('noguild');
        myGuilds.list().then( guildIDs => { console.log( `${strNow()}:\n\tYou didn't mention a guild id!  Here's a list to pick from: ${guildIDs}` ); } );
      }
      if ( dumpsettings ) {console.log('dumpsettings');
        if ( isGuild ) {
          defaultGuild.name = guild.name;
          defaultGuild.owner = guild.owner;
        }
        myGuilds.set( guild.id, defaultGuild ).catch( async errSetDB => {
            if ( !verbose ) { console.error( `${strNow()}:\n` ); }
            else {
              await ojbGuildInfo.edit( 'I\'m aborting your request to blacklist **' + guild.name + '** and blacklist the server as I was unable to set the key in *myGuilds.db*:\n\tPlease check the console and try again.' );
              console.error( `\tFailed to set server as blacklisted in myGuilds.db: ${errSetDB}` );
            }
          } );
      }
      if ( blacklist ) {console.log('blacklist');
        myGuilds.get( guild.id ).then( thisGuild => {
          thisGuild.blacklisted = true;
          myGuilds.set( guild.id, { 'blacklisted': true } ).catch( async errSetDB => {
            if ( !verbose ) { console.error( `${strNow()}:\n` ); }
            else {
              await ojbGuildInfo.edit( 'I\'m aborting your request to blacklist **' + guild.name + '** and blacklist the server as I was unable to set the key in *myGuilds.db*:\n\tPlease check the console and try again.' );
              console.error( `\tFailed to set server as blacklisted in myGuilds.db: ${errSetDB}` );
            }
          } );
        } );
      }
      if ( whitelist ) {console.log('whitelist');
        myGuilds.get( guild.id ).then( thisGuild => {
          thisGuild.blacklisted = false;
          myGuilds.set( guild.id, thisGuild ).catch( async errSetDB => {
            if ( !verbose ) { console.error( `${strNow()}:\n` ); }
            else {
              await ojbGuildInfo.edit( 'I\'m aborting your request to whitelist **' + guild.name + '** as I was unable to set the key in *myGuilds.db*:\n\tPlease check the console and try again.' );
              console.error( `\tFailed to set server as whitelisted in myGuilds.db: ${errSetDB}` );
            }
          } );
        } );
      }
      if ( getinfo ) {console.log('getinfo');
        myGuilds.get( guild.id ).then( thisGuild => {
          console.log( 'thisGuild: %o', thisGuild );
          let ojbGuildInfoEmbed = new Discord.MessageEmbed()
            .setDescription( 'See console.' );
          message.channel.send( 'Test:', { embed: ojbGuildInfoEmbed } );
        } );
      }
    }
  }
}
module.exports = GuildInfo;