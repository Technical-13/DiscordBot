const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const puppeteer = require( 'puppeteer' );
const fsSettings = 'settings.json'
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const strScreenShotPath = path.join( __dirname, '../../' );
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const isDebug = true;//settings[ bot ].onError.isDebugMode;

class build extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'build',
      group: 'lotro',
      memberName: 'build',
      format: '071930553065307530933113313331553163317331833191320132123223324332553262329333033323',
      description: 'Show an example build.  Uses format: **`!build http://tp.thebeardedminstrel.com/?071930553065307530933113313331553163317331833191320132123223324332553262329333033323`** where `http://tp.thebeardedminstrel.com/?` is optional'
    } );
  }

  async run( message, strArgs ) {
    message.delete( { reason: 'Cleaning up request for build.' } ).catch( errDel => { console.log( 'Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errDel ); } );
    
    var ojbBuildInfo = await message.channel.send( 'Gathering information, please stand by...' );
    
    const basePage = 'http://tp.thebeardedminstrel.com/?';
    const arrClasses = [ 'beorning', 'burglar', 'captain', 'champion', 'guardian', 'hunter', 'lore master', 'minstrel', 'rune keeper', 'warden' ];
    const arrLineColors = [ '#3353FF', '#FF0404', '#FFFF05' ];
    const arrLineNames = [
      [ 'The Hide', 'The Claw', 'The Roar' ],
      [ 'The Gambler', 'The Quiet Knife', 'The Mischief-maker' ],
      [ 'Hands of Healing', 'Lead the Charge', 'Leader of Men' ],
      [ 'The Martial Champion', 'The Berserker', 'The Deadly Storm' ],
      [ 'The Defender of the Free', 'The Keen Blade', 'The Fighter of Shadow' ],
      [ 'Huntsman', 'Bowmaster', 'Trapper of Foes' ],
      [ 'Keeper of Animals', 'Master of Nature\'s Fury', 'The Ancient Master' ],
      [ 'The Watcher of Resolve', 'The Warrior-skald', 'The Protector of Song' ],
      [ 'Benediction of Peace', 'Cleansing Flame', 'Solitary Thunder' ],
      [ 'Determination', 'Recklessness', 'Assailment' ],
    ];
    
    var buildSpec = '0101';
		const arrArgs = strArgs.split( ' ' );
    if ( arrArgs[ 0 ] ) {
      if ( [ 'blue', 'red', 'yellow' ].indexOf( arrArgs[ 0 ].toLowerCase() ) !== -1 ) {
        if ( arrClasses.indexOf( arrArgs.slice( 1 ).join( ' ' ).toLowerCase() ) !== -1 ) {
          var intSpecBuilderClass = ( parseInt( arrClasses.indexOf( arrArgs.slice( 1 ).join( ' ' ).toLowerCase() ) ) + 1 );
          var intSpecBuilderLine = ( ( intSpecBuilderClass - 1 ) * 3 ) + ( parseInt( [ 'blue', 'red', 'yellow' ].indexOf( arrArgs[ 0 ].toLowerCase() ) ) + 1 );
          buildSpec = '0' + intSpecBuilderClass + ( intSpecBuilderLine < 10 ? '0' : '' ) + intSpecBuilderLine;
        }
      } else if ( arrClasses.indexOf( strArgs.toLowerCase() ) !== -1  ) {
        var intSpecBuilderClass = ( parseInt( arrClasses.indexOf( strArgs.toLowerCase() ) ) + 1 );
        var intSpecBuilderLine = ( ( ( intSpecBuilderClass - 1 ) * 3 ) + 2 );
        buildSpec = '0' + intSpecBuilderClass + ( intSpecBuilderLine < 10 ? '0' : '' ) + intSpecBuilderLine;
      } else {
        buildSpec = arrArgs[ 0 ].replace( basePage, '' );
      }
    }

    var intClass = ( parseInt( buildSpec.substr( 0, 2 ) ) - 1 );
    var intLine = ( parseInt( buildSpec.substr( 2, 2 ) ) - ( intClass * 3 ) - 1 );
    
    var objEmbed = new Discord.RichEmbed()
      .setTitle( arrClasses[ intClass ].toLowerCase().replace( /\b[a-z]/g, function ( letter ) { return letter.toUpperCase(); } ) + ' ' + arrLineNames[ intClass ][ intLine ] )
      .setURL( basePage + buildSpec )
      .setColor( arrLineColors[ intLine ] );
    ojbBuildInfo.edit( 'Opening screenshot window...', { embed: objEmbed } ).catch( errEdit => {
      console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to send file `' + strScreenShotPath + 'build.png' + '` to ' + message.guild.name + '#' + message.channel.name + ': ' + errEdit );
    } );

    const browser = await puppeteer.launch( );
    const page = await browser.newPage( );
    ojbBuildInfo.edit( 'Taking screenshot...', { embed: objEmbed } ).catch( errEdit => {
      console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to send file `' + strScreenShotPath + 'build.png' + '` to ' + message.guild.name + '#' + message.channel.name + ': ' + errEdit );
    } );
    await page.setViewport( { width: 1024, height: 920 } );
    await page.goto( basePage + buildSpec );
    await page.screenshot( { path: strScreenShotPath + 'build.png' } );
    
    ojbBuildInfo.edit( 'Closing screenshot window...', { embed: objEmbed } ).catch( errEdit => {
      console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to send file `' + strScreenShotPath + 'build.png' + '` to ' + message.guild.name + '#' + message.channel.name + ': ' + errEdit );
    } );

    await browser.close( );

    objEmbed
      .setImage( 'attachment://build.png' );
    ojbBuildInfo.delete( { reason: 'Cleaning up build request progress dialog.' } );
    message.channel.send( 'Your requested build:', { embed: objEmbed, files: [ { attachment: strScreenShotPath + 'build.png', name: 'build.png' } ]
    } ).catch( errSend => {
      console.error( ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': Unable to send file `' + strScreenShotPath + 'build.png' + '` to ' + message.guild.name + '#' + message.channel.name + ': ' + errSend );
    } );
  }
}

module.exports = build;