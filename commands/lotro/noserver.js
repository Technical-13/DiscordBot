const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const fs = require( 'fs' );
const bot = 'LOTRObot';
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const fsSettings = 'settings.json'
const fsSpecials = bot + '/specials.json';
const strNow = ( new Date() ).toLocaleDateString( 'en', objTimeString );
var settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const isDebugMode = true;//settings[ bot ].onError.isDebugMode;
const strScreenShotPath = path.join( __dirname, '../../' );
/*const fsNoServer = bot + '/dbNoServer.json';
fs.readFile( fsNoServer, 'utf8', async ( errRead, strTempDB ) => {
  if ( errRead && errRead.code === 'ENOENT' ) {
    console.error( '%s: "./%s" not found while trying to load noserver.js', strNow, fsNoServer );
  } else if ( errRead ) {
    throw errRead;
  } else {
    objServers = JSON.parse( strTempDB );
  }  
} );//*/
var objServers = {};

function remove( msgCollect, msgBot, objRemoveOptions ) {
  if ( isDebugMode ) { console.log( '%s: !noserver remove() options: %o', strNow, objRemoveOptions ); }
  var boolOnly = false,
  intDelay = 5000,
  strDelConfirmed = '`[redacted]`',
  useReaction = '%F0%9F%97%91';
  if ( objRemoveOptions ) {
    if ( objRemoveOptions.boolOnly ) { boolOnly = objRemoveOptions.boolOnly; }
    if ( objRemoveOptions.intDelay ) { intDelay = objRemoveOptions.intDelay; }
    if ( objRemoveOptions.strDelConfirmed ) { strDelConfirmed = objRemoveOptions.strDelConfirmed; }
    if ( objRemoveOptions.useReaction ) { 
      let rxp = /<:(.*)?:([\d]*)>/;
      if ( rxp.test( objRemoveOptions.useReaction ) ) {
        useReaction = objRemoveOptions.useReaction.match( rxp )[ 2 ]; }
      else { useReaction = encodeURI( objRemoveOptions.useReaction ); }
    }
  }
  msgBot.react( useReaction );
  var reactedFilter = '';
  if ( boolOnly = true ) {
    reactedFilter = ( reaction, user ) => reaction.emoji.name === '🗑' && user.id === msgCollect.author.id;
  } else {
    reactedFilter = ( reaction, user ) => reaction.emoji.name === '🗑' && !user.bot;
  }
  const reacted = msgBot.createReactionCollector( reactedFilter );
  reacted.on( 'collect', async collectedReaction => {
    if ( isDebugMode ) { console.log( '%s: !noserver remove() collectedReaction === %o', strNow, collectedReaction ); }
    msgBot.delete().catch( errDel => {
      console.error( '%s: Failed to delete bot message: %o', strNow, errDel );
    } );
    msgBot.channel.send( strDelConfirmed )
      .then( message => {
        message.delete( intDelay ).catch( errDelRedacted => {
          console.error( '%s: Failed to delete `[redacted]` message: %o', strNow, errDelRedacted );
        } );
      } ).catch( errSendRedacted => {
        console.error( '%s: Failed to send `[redacted]` message: %o', strNow, errSendRedacted );
      } );
      reacted.stop();
  } );
}

class NoServer extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'noserver',
      group: 'lotro',
      memberName: 'noserver',
      aliases: [ 'servers' ],
      description: 'A little information about each server\'s population to help new players pick the one that is right for them.',
    } );
  }

  async run( message, args ) {
    if ( message.guild ) {
      console.log( '%s: %s#%s requested !noserver: %o\n\thttps://discordapp.com/channels/%s/%s/%s',
          strNow, message.guild.name, message.channel.name, args.toUpperCase(),
          message.guild.id, message.channel.id, message.id
        );
      if ( message.guild.id === '201024322444197888' ) {// || message.guild.id === '192775085420052489' ) {
/* Going to need this when I make it so I can make modifications via command
    fs.writeFile( fsNoServer, strTempDB, ( errWrite ) => {
      if ( errWrite ) throw errWrite;
      console.log( 'Created ' + fsNoServer + ' with:\n\t' + strTempDB );
    } );
*/
        const strRankedGuild = '201024322444197888';
        var intAnor = 0, intArk = 1, intBele = 2, intBrandy = 3, intCrick = 4, intEnight = 5,
          intGlad = 6, intGwaihir = 7, intIthil = 8, intLandy = 9, intLaurie = 10, intSira = 11, intBr = 12;
        var lstHomeServers = [
          '506848426768596992', '203267062787866626', // Anor, Arkenstone,
          '203267155683311616', '203266593394786304', // Belegaer, Brandywine,
          '203266513640226817', '203267078139019265', // Crickhollow, Evernight,
          '203266549971156994', '203267133499637760', // Gladden, Gwaihir,
          '510168607549030430', '203266384451469312', // Ithil, Landroval,
          '203266569038462977', '203267093372731392', // Laurelin, Sirannon
          '213328810269999114'  // Bullroarer
        ];//*/TEMP
        var lstServers = [
          '506848072077410314', '460569121633992737', // Anor, Arkenstone,
          '460570446811758602', '460569393693327370', // Belegaer, Brandywine,
          '460569481652076554', '460570146671689739', // Crickhollow, Evernight,
          '460569474056323073', '460570361830965269', // Gladden, Gwaihir,
          '510170073915195397', '460570500717084692', // Ithil, Landroval,
          '460570587660681226', '460570869341618177', // Laurelin, Sirannon
          '213328810269999114'  // Bullroarer
        ];
        var fromServer = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        var onServer = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        lstServers.forEach( function( svr, ind ) {
          let objServer = message.client.guilds.get( strRankedGuild ).roles.get( svr ).members.array();
          fromServer[ ind ] = objServer.length;
          objServer.forEach( function( mbr, ndx ){ if ( mbr.presence.status != 'offline' ) { onServer[ ind ]++ } } );
        } );
        var srtdServers = [];
        lstServers.forEach( function( v, i ) { if ( v != lstServers[ intBr ] ) { srtdServers.push( v ); } } );
        srtdServers.sort( function( a, b ) { return fromServer[ lstServers.indexOf( b ) ] - fromServer[ lstServers.indexOf( a ) ]; } );
        var msgEmbed = new Discord.RichEmbed()
          .setTitle( 'Server comparison help' )
          .setColor( '#234290' )
          .setTimestamp()
          .setFooter( '... as requested by ' + message.author.tag + '.' );
        var strServer;
        switch ( args.toUpperCase() ) {
          case 'ANOR'       : msgEmbed
            .setDescription( '<@&506848426768596992> (#' + ( srtdServers.indexOf( lstServers[ intAnor ] ) + 1 ) + ': ' + onServer[ intAnor ] + '/' + fromServer[ intAnor ] + ' = ' + Math.floor( ( onServer[ intAnor ] / fromServer[ intAnor ] ) * 100 ) + '%) is the first [Legendary](https://lotro-wiki.com/index.php/Legendary_Server_Announcement) LotRO server.' )
            .addField( '**Anor** specific kinship channels here on LOTROdiscord', '**None**' )
            .addField( '**Anor** specific kinship guilds elsewhere on Discord',
              '[**Flame of Anor**](http://discord.gg/HV3KwX5) :arrow_forward: contact: <@301268626206359554> :arrow_right: <@421609838385037312> :arrow_right: <@211240599838261249>' +
              '\n[**There and Back Again**](https://discord.gg/mCUPwwt) :arrow_forward: contact: <@126692665298255872> :arrow_right: <@231959424116326400>'
            )
//            .addField( '**Anor** Streamers',
//              ':movie_camera: <@>'//
//              + '\n:movie_camera: <@>'//
//              , true )
//            .addField( 'Channel',
//              '[<:Twitch:364781668222894080>/]( <https://www.twitch.tv/> )'
//              + '\n[<:YouTube:364781557887795200>/]( <https://www.youtube.com/> )'
//              , true )
            .addField( '**Anor** Discord guilds (with invite links)',
              '**Future** [(join)](https://discord.gg/N6nY4rU)' )
            .addField( '**Anor** official forums', '[Forum: Anor](https://www.lotro.com/forums/forumdisplay.php?815-Anor) on the official LotRO Forums.' );
            strServer = 'Anor';
            break;
          case 'ARK'        :
          case 'ARKENSTONE' : msgEmbed
            .setDescription( '<@&203267062787866626> (#' + ( srtdServers.indexOf( lstServers[ intArk ] ) + 1 ) + ': ' + onServer[ intArk ] + '/' + fromServer[ intArk ] + ' = ' + Math.floor( ( onServer[ intArk ] / fromServer[ intArk ] ) * 100 ) + '%) is the main [PvMP](https://lotro-wiki.com/index.php/PvP) and a popular [Raiding](https://lotro-wiki.com/index.php/Raids)/[Kinship](https://lotro-wiki.com/index.php/Kinship) server with decent <@&278949792481148929>, <@&411255511997087744>, and English/American speaking populations and peak play time being between 7pm-2am Eastern (4-11 Pacific).' )
//            .addField( '**Arkenstone** specific kinship channels here on LOTROdiscord', '**None**' )
            .addField( '**Arkenstone** specific kinship guilds elsewhere on Discord',
              '[**One Last Time**](https://discord.gg/dXMFayQ) :arrow_forward: contact: <@430192944960765962> :arrow_right: <@445908693268037633> :arrow_right: <@172802024860155904>'
            )
            .addField( '**Arkenstone** Streamers',
              ':movie_camera: <@188726074560086018>'//bigedmustafa
              + '\n:movie_camera: <@212253660099510273>'//icywitch
              + '\n:movie_camera: <@211473719653171210>'//
              , true )
            .addField( 'Channel',
              '[<:Twitch:364781668222894080>/BigEdMustafa]( <https://www.twitch.tv/bigedmustafa> )'
              + '\n[<:Twitch:364781668222894080>/IcyWitch]( <https://www.twitch.tv/icywitch> )'
              + '\n[<:YouTube:364781557887795200>/c/Louey7]( <https://www.youtube.com/c/Louey7> )'
              , true )
            .addField( '**Arkenstone** Discord guilds (with invite links)',
              '[**LOTRO Arkenstone**](https://discord.me/Arkenstone) run by <@240208419825385472>' )
            .addField( '**Arkenstone** official forums', '[Forum: Arkenstone](https://www.lotro.com/forums/forumdisplay.php?113-Arkenstone) on the official LotRO Forums.' );
            strServer = 'Arkenstone';
            break;
          case 'BELE' : 
          case 'BELEGAER' : msgEmbed
            .setDescription( '<@&203267155683311616> (#' + ( srtdServers.indexOf( lstServers[ intBele ] ) + 1 ) + ': ' + onServer[ intBele ] + '/' + fromServer[ intBele ] + ' = ' + Math.floor( ( onServer[ intBele ] / fromServer[ intBele ] ) * 100 ) + '%) is a primarily <@&206386014648926208> speaking mature [RP](https://lotro-wiki.com/index.php/Roleplaying) server.' )
            .addField( '**Belegaer** specific kinship channels here on LOTROdiscord', '**None**' )
    //        .addField( '**Belegaer** specific kinship channels here on LOTROdiscord',
    //          '<@&418607146612031489> lead by <@243793394634063873> :arrow_right: <@244201346113339402> and hosted in the <#418607463164542976> channel.'
    //        )
            .addField( '**Belegaer** Streamers',
              '**None**'
              , true )
            .addField( 'Channel',
              '**None**'
              , true )
            .addField( '**Belegaer** Discord guilds (with invite links)',
              '**None**' )
            .addField( '**Belegaer** official forums', '[Forum: Belegaer](https://www.lotro.com/forums/forumdisplay.php?577-Belegaer-DE-RP) on the official LotRO Forums.' );
            strServer = 'Belegaer';
            break;
          case 'BRANDY'     :
          case 'BRANDYWINE' : msgEmbed
            .setDescription( '<@&203266593394786304> (#' + ( srtdServers.indexOf( lstServers[ intBrandy ] ) + 1 ) + ': ' + onServer[ intBrandy ] + '/' + fromServer[ intBrandy ] + ' = ' + Math.floor( ( onServer[ intBrandy ] / fromServer[ intBrandy ] ) * 100 ) + '%) is a fairly high poplation diverse server ([PvMP](https://lotro-wiki.com/index.php/PvP), Raiding, RP, and music events) with decent <@&278949792481148929> and English/American speaking populations.' )
            .addField( '**Brandywine** specific kinship guilds elsewhere on Discord',
              '[**Casual Raiders**](https://discord.gg/zMXJG8V) :arrow_forward: contact: <@221885276950102017>' +
              '\n**Riders of Middle Earth** :arrow_forward: contact: <@313034997193900034>' +
              '\n**White Company** :arrow_forward: contact: <@122513674731520000> :arrow_forward: <@141764628580401152> :arrow_forward: <@211550181844320258>'
            )
            .addField( '**Brandywine** Streamers',
              ':movie_camera: <@167730778321453057>'// Alexanda
              + '\n:movie_camera: <@118820750135132160>'// Fathidros
//              + '\n:movie_camera: <@208370488991416330>'// MaidenOfRohan// Left the server
              + '\n:movie_camera: <@114114498469691395>'// Teh_Martin
              + '\n:movie_camera: <@440752068509040660>'// Technical_13
              , true )
            .addField( 'Channel',
              '[<:YouTube:364781557887795200>/Benjamin Kobeski](https://www.youtube.com/channel/UC1iI9IKDRA43Oz8Ns5u9URw)'
              + '\n[<:Twitch:364781668222894080>/Fathidros](https://www.twitch.tv/fathidros)'
//              + '\n[<:Twitch:364781668222894080>/MaidenOfRohan](https://www.twitch.tv/maidenofrohan)'
              + '\n[<:Twitch:364781668222894080>/Teh_Martin](https://www.twitch.tv/teh_martini)'
              + '\n[<:Twitch:364781668222894080>/Technical_13](https://www.twitch.tv/technical_13)'
              , true )
            .addField( '**Brandywine** Discord guilds (with invite links)',
              '**None**' )
            .addField( '**Brandywine** official forums', '[Forum: Brandywine](https://www.lotro.com/forums/forumdisplay.php?78-Brandywine) on the official LotRO Forums.' );
            strServer = 'Brandywine';
            break;
          case 'CRICK'       :
          case 'CRICKHOLLOW' : msgEmbed
            .setDescription( '<@&203266513640226817> (#' + ( srtdServers.indexOf( lstServers[ intCrick ] ) + 1 ) + ': ' + onServer[ intCrick ] + '/' + fromServer[ intCrick ] + ' = ' + Math.floor( ( onServer[ intCrick ] / fromServer[ intCrick ] ) * 100 ) + '%) is a relatively low population casual questing kinship server that sports an active music and special events community.' )
            .addField( '**Crickhollow** specific kinship channels here on LOTROdiscord',
              '**None**'
              )
            .addField( '**Crickhollow** Streamers',
              ':movie_camera: <@532773855077466112>'// Viscinium
              , true )
            .addField( 'Channel',
              '[<:YouTube:364781557887795200>/Viscinium](https://www.youtube.com/channel/UCuE2jO7SrmwNUxwmqw2FrMA)'
              , true )
            .addField( '**Crickhollow** Discord guilds (with invite links)',
              '**The Lost Goat Riders** :arrow_forward: contact: <@328514942653431818>'
              )
            .addField( '**Crickhollow** official forums', '[Forum: Crickhollow](https://www.lotro.com/forums/forumdisplay.php?508-Crickhollow) on the official LotRO Forums.' );
            strServer = 'Crickhollow';
            break;
          case 'ENIGHT' : 
          case 'EVERNIGHT' : msgEmbed
            .setDescription( '<@&203267078139019265> (#' + ( srtdServers.indexOf( lstServers[ intEnight ] ) + 1 ) + ': ' + onServer[ intEnight ] + '/' + fromServer[ intEnight ] + ' = ' + Math.floor( ( onServer[ intEnight ] / fromServer[ intEnight ] ) * 100 ) + '%) is a well populated mostly English/American speaking European server.' )
            .addField( '**Evernight** specific kinship channels here on LOTROdiscord', '**None**' )
            .addField( '**Evernight** specific kinship guilds elsewhere on Discord',
              '**Blades of Anarion** :arrow_forward: contact: <@210531160458133504>' +
              '\n[**|Nexus|**](https://discord.gg/N52WMU4)\t\t\t\t\t:arrow_forward: contact: <@136842619945746432> :arrow_forward: <@160671844867899392>'
            )
            .addField( '**Evernight** Streamers',
              ':movie_camera: <@98842517776130048>'// Phecker
              , true )
            .addField( 'Channel',
              '[<:Twitch:364781668222894080>/pheckr](https://www.twitch.tv/pheckr)'
              , true )
            .addField( '**Evernight** Discord guilds (with invite links)',
              '**None**' )
            .addField( '**Evernight** official forums', '[Forum: Evernight](https://www.lotro.com/forums/forumdisplay.php?543-Evernight) on the official LotRO Forums.' );
            strServer = 'Evernight';
            break;
          case 'GLAD' :
          case 'GLADDEN' : msgEmbed
            .setDescription( '<@&203266549971156994> (#' + ( srtdServers.indexOf( lstServers[ intGlad ] ) + 1 ) + ': ' + onServer[ intGlad ] + '/' + fromServer[ intGlad ] + ' = ' + Math.floor( ( onServer[ intGlad ] / fromServer[ intGlad ] ) * 100 ) + '%) is a casual, mostly English/American server with peak times between 2-11pm Eastern (11am-8pm Pacific).' )
            .addField( '**Gladden** specific kinship channels here on LOTROdiscord', '**None**' )
            .addField( '**Gladden** Streamers',
              ':movie_camera: <@247277978982154241>'// ivy_l
              , true )
            .addField( 'Channel',
              '[<:Twitch:364781668222894080>/Ivy_L](https://www.twitch.tv/ivy_l)'
              , true )
            .addField( '**Gladden** Discord guilds (with invite links)',
              '**None**' )
            .addField( '**Gladden** official forums', '[Forum: Gladden](https://www.lotro.com/forums/forumdisplay.php?80-Gladden) on the official LotRO Forums.' );
            strServer = 'Gladden';
            break;
          case 'GWAIHIR' : msgEmbed
            .setDescription( '<@&203267133499637760> (#' + ( srtdServers.indexOf( lstServers[ intGwaihir ] ) + 1 ) + ': ' + onServer[ intGwaihir ] + '/' + fromServer[ intGwaihir ] + ' = ' + Math.floor( ( onServer[ intGwaihir ] / fromServer[ intGwaihir ] ) * 100 ) + '%) is a primarily <@&206386014648926208> speaking server.  It\'s presence here on Discord is low, please let <@&201710935788748800> know if you can improve this description.' )
            .addField( '**Gwaihir** specific kinship channels here on LOTROdiscord', '**None**' )
            .addField( '**Gwaihir** Streamers',
              '**None**'
              , true )
            .addField( 'Channel',
              '**None**'
              , true )
            .addField( '**Gwaihir** Discord guilds (with invite links)',
              '**None**' )
            .addField( '**Gwaihir** official forums', '[Forum: Gwaihir](https://www.lotro.com/forums/forumdisplay.php?559-Gwaihir-DE) on the official LotRO Forums.' );
            strServer = 'Gwaihir';
            break;
          case 'ITHIL'    : msgEmbed
            .setDescription( '<@&510168607549030430> (#' + ( srtdServers.indexOf( lstServers[ intIthil ] ) + 1 ) + ': ' + onServer[ intIthil ] + '/' + fromServer[ intIthil ] + ' = ' + Math.floor( ( onServer[ intIthil ] / fromServer[ intIthil ] ) * 100 ) + '%) is the second [Legendary](https://lotro-wiki.com/index.php/Legendary_Server_Announcement) LotRO server created in response to an overwhelming wait queue for <@&506848426768596992> when it first opened.' )
            .addField( '**Ithil** specific kinship channels here on LOTROdiscord',
              '**The Way of the Tortoise** (no invite) :arrow_forward: contacts: <@456936754650546176> :arrow_forward: <@285551276073287680> :arrow_right: <@219918663250083840>' )
//            .addField( '**Ithil** Streamers',
//              ':movie_camera: <@>'//
//              + '\n:movie_camera: <@>'//
//              + '\n:movie_camera: <@>'//
//              , true )
//            .addField( 'Channel',
//              '[<:Twitch:364781668222894080>/]( <https://www.twitch.tv/> )'
//              + '\n[<:Twitch:364781668222894080>/]( <https://www.twitch.tv/> )'
//              + '\n[<:YouTube:364781557887795200>/]( <https://www.youtube.com/> )'
//              , true )
            .addField( '**Ithil** Discord guilds (with invite links)', '**None**' )
            .addField( '**Ithil** official forums', '[Forum: Ithil](https://www.lotro.com/forums/forumdisplay.php?816-Ithil) on the official LotRO Forums.' );
            strServer = 'Ithil';
            break;
          case 'LANDY'     :
          case 'LANDROVAL' : msgEmbed
            .setDescription( '<@&203266384451469312> (#' + ( srtdServers.indexOf( lstServers[ intLandy ] ) + 1 ) + ': ' + onServer[ intLandy ] + '/' + fromServer[ intLandy ] + ' = ' + Math.floor( ( onServer[ intLandy ] / fromServer[ intLandy ] ) * 100 ) + '%) is a fairly well populated at all times of day [RP](https://lotro-wiki.com/index.php/Roleplaying) Encouraged server.' )
            .addField( '**Landroval** specific kinship channels here on LOTROdiscord',
              '**None**'
            )
            .addField( '**Landroval** specific kinship guilds elsewhere on Discord',
              '[**Guerreros del Valhalla**](https://discord.gg/WxrAnPz) :arrow_forward: contacts: <@232687688493301761> :arrow_forward: <@373568397176209428> :arrow_right: <@287303757585448960>' +
              '\n[**House of Play**](https://discord.gg/HkTGhNx) :arrow_forward: contacts: <@237740786731581440> :arrow_forward: <@237337402148913153> :arrow_right: <@239507759031123968>'
            )
            .addField( '**Landroval** Streamers',
              ':movie_camera: <@222117670152175616>'// DrMani
              + '\n:movie_camera: <@132923200693731328>'// Earthlynn
              + '\n:movie_camera: <@150294375744798721>'// EpicGamerXD
              + '\n:movie_camera: <@118820750135132160>'// Fathidros
              + '\n:movie_camera: <@240955474957041684>'// ForteMaestro
              + '\n:movie_camera: <@440752068509040660>'// Technical_13
              + '\n:movie_camera: <@120070294076391424>'// Zero
              , true )
            .addField( 'Channel',
              '[<:Twitch:364781668222894080>/Drmani](https://www.twitch.tv/drmani)'
              + '\n[<:Twitch:364781668222894080>/Earthlynn](https://www.twitch.tv/earthlynn)'
              + '\n[<:Twitch:364781668222894080>/EpicGamerXD](https://www.twitch.tv/epicgamerxd)'
              + '\n[<:Twitch:364781668222894080>/Fathidros](https://www.twitch.tv/fathidros)'
              + '\n[<:Twitch:364781668222894080>/ForteMaestro](https://www.twitch.tv/fortemaestro)'
              + '\n[<:Twitch:364781668222894080>/Technical_13](https://www.twitch.tv/technical_13)'
              + '\n[<:Twitch:364781668222894080>/zerocracy](https://www.twitch.tv/zerocracy)'
              , true )
            .addField( '**Landroval** Discord guilds (with invite links)', '**None**' )
            .addField( '**Landroval** official forums', '[Forum: Landroval](https://www.lotro.com/forums/forumdisplay.php?81-Landroval-EN-RE) on the official LotRO Forums.' );
            strServer = 'Landroval';
            break;
          case 'LAURIE'   :
          case 'LAURELIN' : msgEmbed
            .setDescription( '<@&203266569038462977> (#' + ( srtdServers.indexOf( lstServers[ intLaurie ] ) + 1 ) + ': ' + onServer[ intLaurie ] + '/' + fromServer[ intLaurie ] + ' = ' + Math.floor( ( onServer[ intLaurie ] / fromServer[ intLaurie ] ) * 100 ) + '%) is a fairly well populated at all times of day [RP](https://lotro-wiki.com/index.php/Roleplaying) server.' )
            .addField( '**Laurelin** specific kinship channels here on LOTROdiscord',
    //          '<@&305119078153191425> lead by <@215766751785254913> and hosted in the <#305120082453987329> channel.\n' +
              'none at this time.' )
            .addField( '**Laurelin** specific kinship guilds elsewhere on Discord',
              '[**Brothers In Arms**](https://discord.gg/GMQPvJK) :arrow_forward: contacts: Timitost :arrow_forward: <@306246281112846339>' +
              '\n[**The Battalion**](https://discord.gg/KGc8Ad) :arrow_forward: contacts: <@242332874991206400> :arrow_forward: <@477902018124447767> :arrow_right: <@492356211237453834>' +
              '\n[**Uialtum**](https://discord.me/uialtum) :arrow_forward: contacts: <@373269927865483264> :arrow_forward: <@166902969030279178> :arrow_right: <@484082181510004756>'
            )
            .addField( '**Laurelin** Streamers',
              ':movie_camera: <@243357556162953218>'// Bryn
//              + '\n:movie_camera: <@228351189618524160>'// Asathrorr__Eriadan// Left the server
              + '\n:movie_camera: <@440752068509040660>'// Technical_13
              , true )
            .addField( 'Channel',
              '[<:Twitch:364781668222894080>/vickyoflotro](https://www.twitch.tv/vickyoflotro)'
//              + '\n[<:Twitch:364781668222894080>/asathrorr__eriadan](https://www.twitch.tv/asathrorr__eriadan)'
              + '\n[<:Twitch:364781668222894080>/Technical_13](https://www.twitch.tv/technical_13)'
              , true )
            .addField( '**Laurelin** Discord guilds (with invite links)',
              '[Laurelin RP Community](https://discord.gg/aK7JmpK)\n' +
              '[Laurelin RP Group](https://discord.gg/z72t34W) by <@243357556162953218>\n' )
            .addField( '**Laurelin** official forums', '[Forum: Laurelin](https://www.lotro.com/forums/forumdisplay.php?539-Laurelin-EN-RP) on the official LotRO Forums.' )
            .addField( '**Laurelin Archives**', 'Do you like to RP outside of the game and share stories?  Maybe the [Laurelin RolePlaying forum](http://laurelinarchives.org/) is for you!  Check it out!' );
            strServer = 'Laurelin';
            break;
          case 'SIRA' : 
          case 'SIRANNON' : msgEmbed
            .setDescription( '<@&203267093372731392> (#' + ( srtdServers.indexOf( lstServers[ intSira ] ) + 1 ) + ': ' + onServer[ intSira ] + '/' + fromServer[ intSira ] + ' = ' + Math.floor( ( onServer[ intSira ] / fromServer[ intSira ] ) * 100 ) + '%) is a primarily <@&226397066887168000> speaking server.  It\'s presence here on Discord is low, please let <@&201710935788748800> know if you can improve this description.' )
            .addField( '**Sirannon** specific kinship channels here on LOTROdiscord',
              '**None**' )
            .addField( '**Sirannon** Streamers',
              '**None**'
              , true )
            .addField( 'Channel',
              '**None**'
              , true )
            .addField( '**Sirannon** Discord guilds (with invite links)',
              '**None**' )
            .addField( '**Sirannon** official forums', '[Forum: Sirannon](https://www.lotro.com/forums/forumdisplay.php?586-Sirannon-FR) on the official LotRO Forums.' );
            strServer = 'Sirannon';
            break;
          case 'BR'         :
          case 'BULLROARER' : msgEmbed
            .setDescription( '**Bullroarer** (' + onServer[ intBr ] + '/' + fromServer[ intBr ] + ' = ' + Math.floor( ( onServer[ intBr ] / fromServer[ intBr ] ) * 100 ) + '%) (Managed by the <@&213328810269999114>) is a public test server which will be opened periodically to test new content, performance enhancements or hardware changes still in development, before they are completed and approved for the live servers.' )
            .addField( '**Bullroarer** official forums', '[Forum: Bullroarer (Public Test Server)](https://www.lotro.com/forums/forumdisplay.php?787-Bullroarer-%28Public-Test-Server%29) on the official LotRO Forums.' );
            strServer = 'Bullroarer';
            break;
          default : msgEmbed
            .setDescription(
              'Are you new to **The Lord of the Rings Online** and would like help in deciding which game server is right for you?  Here\'s a little information to help you decide!' )
            .addField( 'Anor (#' + ( srtdServers.indexOf( lstServers[ intAnor ] ) + 1 ) + ': ' + onServer[ intAnor ] + '/' + fromServer[ intAnor ] + ' = ' + Math.floor( ( onServer[ intAnor ] / fromServer[ intAnor ] ) * 100 ) + '%)', '<@&506848426768596992> is the first [Legendary](https://lotro-wiki.com/index.php/Legendary_Server_Announcement) LotRO server.  For more details, please visit <#201689631861899264> and type `!noserver Anor`' )// Anor
            .addField( 'Arkenstone (#' + ( srtdServers.indexOf( lstServers[ intArk ] ) + 1 ) + ': ' + onServer[ intArk ] + '/' + fromServer[ intArk ] + ' = ' + Math.floor( ( onServer[ intArk ] / fromServer[ intArk ] ) * 100 ) + '%)', '<@&203267062787866626> is the main [PvMP](https://lotro-wiki.com/index.php/PvP) and a popular [Raiding](https://lotro-wiki.com/index.php/Raids)/[Kinship](https://lotro-wiki.com/index.php/Kinship) server with decent <@&278949792481148929> and English/American speaking populations and peak play time being between 7pm-2am Eastern (4-11 Pacific).  For more details, please visit <#201689631861899264> and type `!noserver Arkenstone`' )// Arkenstone
            .addField( 'Belegaer (#' + ( srtdServers.indexOf( lstServers[ intBele ] ) + 1 ) + ': ' + onServer[ intBele ] + '/' + fromServer[ intBele ] + ' = ' + Math.floor( ( onServer[ intBele ] / fromServer[ intBele ] ) * 100 ) + '%)', '<@&203267155683311616> is a primarily <@&206386014648926208> speaking mature [RP](https://lotro-wiki.com/index.php/Roleplaying) server.  For more details, please visit <#201689631861899264> and type `!noserver Belegaer`' )// Belegaer
            .addField( 'Brandywine (#' + ( srtdServers.indexOf( lstServers[ intBrandy ] ) + 1 ) + ': ' + onServer[ intBrandy ] + '/' + fromServer[ intBrandy ] + ' = ' + Math.floor( ( onServer[ intBrandy ] / fromServer[ intBrandy ] ) * 100 ) + '%)', '<@&203266593394786304> is a fairly high poplation diverse server ([PvMP](https://lotro-wiki.com/index.php/PvP), Raiding, RP, and music events) with decent <@&278949792481148929> and English/American speaking populations.  For more details, please visit <#201689631861899264> and type `!noserver Brandywine`' )// Brandywine
            .addField( 'Crickhollow (#' + ( srtdServers.indexOf( lstServers[ intCrick ] ) + 1 ) + ': ' + onServer[ intCrick ] + '/' + fromServer[ intCrick ] + ' = ' + Math.floor( ( onServer[ intCrick ] / fromServer[ intCrick ] ) * 100 ) + '%)', '<@&203266513640226817> is a relatively low population casual questing kinship server that sports an active music and special events community.  For more details, please visit <#201689631861899264> and type `!noserver Crickhollow`' )// Crickhollow
            .addField( 'Evernight (#' + ( srtdServers.indexOf( lstServers[ intEnight ] ) + 1 ) + ': ' + onServer[ intEnight ] + '/' + fromServer[ intEnight ] + ' = ' + Math.floor( ( onServer[ intEnight ] / fromServer[ intEnight ] ) * 100 ) + '%)', '<@&203267078139019265> is a well populated mostly English/American speaking European server.  For more details, please visit <#201689631861899264> and type `!noserver Evernight`' )// Evernight
            .addField( 'Gladden (#' + ( srtdServers.indexOf( lstServers[ intGlad ] ) + 1 ) + ': ' + onServer[ intGlad ] + '/' + fromServer[ intGlad ] + ' = ' + Math.floor( ( onServer[ intGlad ] / fromServer[ intGlad ] ) * 100 ) + '%)', '<@&203266549971156994> is a casual, mostly English/American server with peak times between 2-11pm Eastern (11am-8pm Pacific).  For more details, please visit <#201689631861899264> and type `!noserver Gladden`' )// Gladden
            .addField( 'Gwaihir (#' + ( srtdServers.indexOf( lstServers[ intGwaihir ] ) + 1 ) + ': ' + onServer[ intGwaihir ] + '/' + fromServer[ intGwaihir ] + ' = ' + Math.floor( ( onServer[ intGwaihir ] / fromServer[ intGwaihir ] ) * 100 ) + '%)', '<@&203267133499637760> is a primarily <@&206386014648926208> speaking server.  For more details, please visit <#201689631861899264> and type `!noserver Gwaihir`' )// Gwaihir
            .addField( 'Ithil (#' + ( srtdServers.indexOf( lstServers[ intIthil ] ) + 1 ) + ': ' + onServer[ intIthil ] + '/' + fromServer[ intIthil ] + ' = ' + Math.floor( ( onServer[ intIthil ] / fromServer[ intIthil ] ) * 100 ) + '%)', '<@&510168607549030430> is the second [Legendary](https://lotro-wiki.com/index.php/Legendary_Server_Announcement) LotRO server created in response to an overwhelming wait queue for <@&506848426768596992> when it first opened.  For more details, please visit <#201689631861899264> and type `!noserver Ithil`' )// Ithil
            .addField( 'Landroval (#' + ( srtdServers.indexOf( lstServers[ intLandy ] ) + 1 ) + ': ' + onServer[ intLandy ] + '/' + fromServer[ intLandy ] + ' = ' + Math.floor( ( onServer[ intLandy ] / fromServer[ intLandy ] ) * 100 ) + '%)', '<@&203266384451469312> is a fairly well populated at all times of day [RP](https://lotro-wiki.com/index.php/Roleplaying) Encouraged server.  For more details, please visit <#201689631861899264> and type `!noserver Landroval`' )// Landroval
            .addField( 'Laurelin (#' + ( srtdServers.indexOf( lstServers[ intLaurie ] ) + 1 ) + ': ' + onServer[ intLaurie ] + '/' + fromServer[ intLaurie ] + ' = ' + Math.floor( ( onServer[ intLaurie ] / fromServer[ intLaurie ] ) * 100 ) + '%)', '<@&203266569038462977> is a fairly well populated at all times of day [RP](https://lotro-wiki.com/index.php/Roleplaying) server.  For more details, please visit <#201689631861899264> and type `!noserver Laurelin`' )// Landroval
            .addField( 'Sirannon (#' + ( srtdServers.indexOf( lstServers[ intSira ] ) + 1 ) + ': ' + onServer[ intSira ] + '/' + fromServer[ intSira ] + ' = ' + Math.floor( ( onServer[ intSira ] / fromServer[ intSira ] ) * 100 ) + '%)', '<@&203267093372731392> is a primarily <@&226397066887168000> speaking server.  For more details, please visit <#201689631861899264> and type `!noserver Sirannon`' )// Sirannon
            .addField( 'Bullroarer (' + onServer[ intBr ] + '/' + fromServer[ intBr ] + ' = ' + Math.floor( ( onServer[ intBr ] / fromServer[ intBr ] ) * 100 ) + '%)', '**Bullroarer** (Managed by the <@&213328810269999114>) is a public test server which will be opened periodically to test new content, performance enhancements or hardware changes still in development, before they are completed and approved for the live servers.  For more details, please visit <#201689631861899264> and type `!noserver Bullroarer`' );// Bullroarer
            strServer = 'NONE';
        }
        message
          .delete( { reason: 'Cleaning up `!noserver` request.' } )
          .catch( errDelete => { console.error( strNow + ': ' + errDelete ); } );
    /*    var strMsg = '';
        if ( message.mentions.users.array.length !== 0 ) {
          strMsg = 'Hey, ' + message.mentions.users.first() + ', here is our ';
        }
        strMsg += '**Lord of the Rings Online server guide:**';//*/
        var noServer = await message.channel.send( '**Lord of the Rings Online server guide:**', { embed: msgEmbed } );
        console.log( '%s: !noserver response: %o\n%s#%s (https://discordapp.com/channels/%s/%s/%s)',
            strNow, args.toUpperCase(),
            noServer.guild.name, noServer.channel.name,
            noServer.guild.id, noServer.channel.id, noServer.id
          );
        let strThankYou = message.author + ', thank you for checking out ' + ( strServer.toUpperCase() === 'NONE' ? 'our `!noserver` command.' : 'the details for the **`' + strServer + '`** server.' );
        remove( message, noServer, { strDelConfirmed: strThankYou, intDelay: 10000 } );
        const objTimedChannels = {
          '235896771547627521': { name: 'fungeons', expires: 10, unit: 6 },
          '201024322444197888': { name: 'world', expires: 10, unit: 60 }
        };
        if ( objTimedChannels[ message.channel.id ] ) {
          if ( isDebugMode ) { console.info( 'Triggered! at ' + ( new Date() ) ); }
          const intExpires = ( objTimedChannels[ message.channel.id ].expires || 10 );// Units CURRENTLY MAX OF TEN
          const intUnit = ( objTimedChannels[ message.channel.id ].unit || 60 );// 1==Second; 60==Minute; 3600==Hour; 86400==Day
          var arrCountdown = [ '0%E2%83%A3',
            '1%E2%83%A3', '2%E2%83%A3', '3%E2%83%A3', '4%E2%83%A3', '5%E2%83%A3',
            '6%E2%83%A3', '7%E2%83%A3', '8%E2%83%A3', '9%E2%83%A3', '%F0%9F%94%9F' ];
          var intTimer = ( intExpires - 1 );
          if ( intExpires <= 10 ) {
            await noServer.react( arrCountdown[ intExpires ] )
              .catch( errReact => {
                if ( errReact.message === 'Unknown Message' ) {
                  if ( isDebugMode ) { console.log( '!noserver in an inappropriate channel already deleted; terminating countdown (%o).', ( new Date() ).toISOString() ); }
                  message.client.clearInterval( countDown );
                } else {
                  console.error( '%s: %o', strNow, errReact );// Add :keycap_ten:
                }
              } );
          }
          var countDown = message.client.setInterval( async function() {
            if ( isDebugMode ) { console.info( '!noserver in an inappropriate channel counting down to deletion (%o): %o', ( new Date() ).toISOString(), intTimer ); }
            if ( intTimer === 0 ) {
              await noServer
                .delete( { reason: 'Cleaning up result of `!noserver` request in #world chat.' } )
                .catch( errDelete => {
                  if ( errDelete.message === 'Unknown Message' ) {
                    if ( isDebugMode ) { console.log( '!noserver in an inappropriate channel already deleted; terminating countdown (%o).', ( new Date() ).toISOString() ); }
                    message.client.clearInterval( countDown );
                  } else {
                    console.error( '%s: %o', strNow, errDelete );
                  }
                } );
              message.client.clearInterval( countDown );
            }
            else if ( intTimer < 0 ) {
              throw new Error( 'ERROR @ ' + strNow + ': !noserver TIMER < 0: ' + intTimer );
            }
            else if ( intTimer > 10 ) {
              /* DO NOTHING UNTIL WE HIT 10 SECONDS TO GO... for now. */
            }
            else if ( intTimer === 10 ) {
              await noServer.react( arrCountdown[ 10 ] )
                .catch( errReact => {
                  if ( errReact.message === 'Unknown Message' ) {
                    if ( isDebugMode ) { console.log( '!noserver in an inappropriate channel already deleted; terminating countdown (%o).', ( new Date() ).toISOString() ); }
                    message.client.clearInterval( countDown );
                  } else {
                    console.error( '%s: %o', strNow, errReact );// Add :keycap_ten:
                  }
                } );
              intTimer--;
            }
            else if ( intTimer <= 9 && intTimer > 0 ) {
              await noServer.react( arrCountdown[ intTimer ] )
/*                .then( newReact => {
                  newReact.message.reactions.get( decodeURI( arrCountdown[ ( intTimer +1 ) ] ) ).remove( newReact.message.reactions.users.get( message.client.user.id ) )
                    .catch( errRemove => {
                      if ( errRemove.message === 'Unknown Message' ) {
                        if ( isDebugMode ) { console.log( '!noserver in an inappropriate channel already deleted; terminating countdown (%o).', ( new Date() ).toISOString() ); }
                        message.client.clearInterval( countDown );
                      } else {
                        console.error( '%s: %o', strNow, errRemove );// Remove last digit
                      }
                    } );
                } )//*/
                .catch( errReact => {
                  if ( errReact.message === 'Unknown Message' ) {
                    if ( isDebugMode ) { console.log( '!noserver in an inappropriate channel already deleted; terminating countdown (%o).', ( new Date() ).toISOString() ); }
                    message.client.clearInterval( countDown );
                  } else {
                    console.error( '%s: %o', strNow, errReact );// Add current digit
                  }
                } );
              intTimer--;
            }
            else {
              intTimer--;
            }
          }, ( intUnit * 1000 ) );
        }
      } else {
        var fileSmeagol;
        if ( ( new Date() ).getMonth() === 10 ) {
          if ( ( new Date() ).getDate() >= 25 ) {
            fileSmeagol = 'smeagol_movember_santa.png';
          } else {
            fileSmeagol = 'smeagol_movember.png';
          }
        } else if ( ( new Date() ).getMonth() === 11 ) {
          if ( ( new Date() ).getDate() <= 18 ) {
            fileSmeagol = 'smeagol_movember_santa.png';
          } else {
            fileSmeagol = 'smeagol_santa.png';
          }
        } else {
          fileSmeagol = 'smeagol.png';
        }
        let strEmbedNotHere = '**__ERROR:__ __The Lord of the Rings Discord__** only command:';
        let objEmbedNotHere = new Discord.RichEmbed()
          .setColor( '#FF0000' )
          .setThumbnail(  'attachment://Smeagol.png'  )
          .setTitle( 'Smeagol says,' )
          .setURL( 'https://Discord.me/LOTROdiscord' )
          .setDescription( 'Smeagol sorry, this command only work in __**The Lord of the Rings Discord**__.  [Click here](https://Discord.me/LOTROdiscord) to pop in and check it out!' );
        message.channel.send( strEmbedNotHere, { embed: objEmbedNotHere, files: [ { attachment: strScreenShotPath + fileSmeagol, name: 'Smeagol.png' } ] } );
      }
    }
  }
}

module.exports = NoServer;//*/