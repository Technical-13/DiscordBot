const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const fs = require( 'fs' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const fsSettings = 'settings.json'
var strNow = function () { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
var settings = require( path.join( __dirname, '../../../' + fsSettings ) );
  
function remove( msgCollect, msgBot, objRemoveOptions ) {
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
  reacted.on( 'collect', r => {
    msgBot.delete().catch( errDel => { console.error( strNow() + ': Failed to delete bot message: ' + errDel ); } );
    msgBot.channel.send( strDelConfirmed )
      .then( message => {
        message.delete( intDelay ).catch( errDelRedacted => { console.error( strNow() + ': Failed to delete `[redacted]` message: ' + errDelRedacted ); } );
      } ).catch( errSendRedacted => { console.error( strNow() + ': Failed to send `[redacted]` message: ' + errSendRedacted ); } );
  } );
}
class Transfers extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'transfer',
      group: bot.toLowerCase().replace( 'bot', '' ),
      memberName: 'transfer',
      description: 'Transfers return!',
      aliases: [ 'transfers' ]
    } );
  }

  async run( message, args ) {
    var baseURL = 'https://www.lotro.com/';
    var pathName = 'en/worldtransfer';
    var msgEmbed = new Discord.RichEmbed()
      .setColor( '#B81F24' )
      .setTitle( 'Character and Shared Item Transfers and FAQ' )
      .setThumbnail( 'http://web.archive.org/web/20200601141932im_/https://www.lotro.com/sites/default/files/lotro_f2p_medium_screen_14.png' )
      .setURL( baseURL + pathName )
      .setDescription( 'Players can once again transfer characters and shared items from one game world to another through the LOTRO game launcher. Please read further to learn more about the process, how it works, and what you should consider prior to transferring.' )
      .addField( '**Transfers are possible from the following game worlds to other game worlds:**',
      ':small_blue_diamond: U.S. game worlds to U.S. game worlds\n:small_blue_diamond: European game worlds to European game worlds\n:small_blue_diamond: The Legendary Worlds of Anor to Ithil, and from Ithil to Anor\n\nTransfers are not currently avaiable from an older, closed game world to an active game world, although we intend to reintroduce those transfers in the future.' )
      .addField( '**The cost to transfer a character or shared items is as follows:**', ':small_blue_diamond: Character Transfer: 2,495 LOTRO Points\n:small_blue_diamond: Shared Items Transfer: 495 LOTRO Points (free with a character transfer, only at the time of the character transfer)\n:small_blue_diamond: Character and Shared Items Transfer from Ithil to Anor: Free\n\nNote that it is not possible to transfer from a U.S. Server to a European Server, or from a European Server to a U.S. Server. It is also not yet possible to transfer from the Legendary Worlds of Anor or Ithil to a non-Legendary game world.' )
      .addField( '**Here is the process to complete the transfer:**', ':one: Log into the game launcher using your user name and password. Select the Transfer button on the launcher.\n:two: Select the server to transfer your character or Shared Items from.\n:three:Select which characters to transfer and whether to transfer Shared Items.\n:four: Select which world you would like to transfer to.\n:five: Confirm your transfer.\n:six: Confirm again.\nShared Items transfer allows for the transfer of account-level items that are shared between your characters on one world to another world. These items include the following:\n:small_blue_diamond: Account Shared Currency (Mithril Coins and Skirmish Marks)\n:small_blue_diamond: Shared Storage\n:small_blue_diamond: Housing Storage\n:small_blue_diamond: Wardrobe\n:small_blue_diamond: Destiny' )
      .setTimestamp()
      .setFooter( '... as requested by ' + message.author.tag + '.' );
    var msgContent = 'English: ';
    if ( args ) { switch ( args.toLowerCase() ) {
      case 'de': case 'deutsch':
      case 'german':
        var pathName = 'de/spiel/aktuelles/übertragung-gemeinsamer-gegenstände-charaktertransfers-und-faq';
        var msgContent = 'Deutsche (German): ';
        msgEmbed
          .setTitle( 'Übertragung gemeinsamer Gegenstände, Charaktertransfers und FAQ' )
          .setThumbnail( 'https://web.archive.org/web/20200601142449im_/https://www.lotro.com/sites/default/files/LOTROcorelogo600DE.png' )
          .setURL( baseURL + pathName )
          .setDescription( 'Spieler können erneut über den HdRO-Launcher Charaktere und gemeinsame Gegenstände von einer Spielwelt in eine andere übertragen. Bitte lest weiter, um mehr über den Vorgang sowie seine Funktionsweise und darüber zu erfahren, was Ihr vor einer Übertragung bedenken solltet.' )
          .addField( '**Übertragungen sind von den folgenden Welten zu anderen Welten möglich:**',
          ':small_blue_diamond: US-Welten zu US-Welten\n:small_blue_diamond: Europäischen Welten zu europäischen Welten\n:small_blue_diamond: Die legendären Welten: Anor zu Ithil und von Ithil zu Anor\n\nÜbertragungen von älteren, geschlossenen Spielwelten zu aktiven Spielwelten sind aktuell nicht möglich, aber wir planen, derartige Übertragungen in der Zukunft wieder anzubieten.' )
          .addField( '**Die Kosten einer Übertragung von Charakteren oder gemeinsamen Gegenständen sind wie folgt:**', ':small_blue_diamond: Charaktertransfer: 2495 LOTRO-Punkte\n:small_blue_diamond: Übertragung gemeinsamer Gegenstände: 495 LOTRO-Punkte (kostenlos mit gleichzeitigem Charaktertransfer)\n:small_blue_diamond: Übertragung gemeinsamer Gegenstände und Charaktertransfer von Ithil zu Anor: Kostenlos\n\nBitte beachtet, dass eine Übertragung von einem US-Server auf einen europäischen Server oder andersherum nicht möglich ist. Es ist auch nicht möglich, von den legendären Welten Anor oder Ithil auf eine nicht-legendäre Welt zu wechseln.' )
          .addField( '**So schließt Ihr die Übertragung ab:**', ':one: Meldet Euch mit Eurem Benutzernamen und Passwort beim Launcher an. Wählt im Launcher die Schaltfläche „Übertragung“.\n:two: Wählt den Server, von dem der Charakter oder die gemeinsamen Gegenstände übertragen werden sollen.\n:three: CWählt, welche Charaktere übertragen werden sollen und ob die gemeinsamen Gegenstände ebenfalls den Server wechseln.\n:four: Wählt die Welt, zu der Ihr umziehen möchtet.\n:five: Bestätigt die Übertragung.\n:six: Bestätigt erneut.\nDie Übertragung gemeinsamer Gegenstände ermöglicht die Übertragung aller Konto-Gegenstände, die Eure Charaktere gemeinsam nutzen, von einer Welt in eine andere. Zu diesen Gegenständen gehören:\n:small_blue_diamond: Kontoweite gemeinsame Währung (Mithril-Münzen & Scharmützel-Zeichen)\n:small_blue_diamond: Gemeinsamer Lagerraum\n:small_blue_diamond: Lagerkammer\n:small_blue_diamond: Kleiderschrank\n:small_blue_diamond: Schicksal' );
        break;
      case 'fr': case 'français':
      case 'french':
        var pathName = 'fr/jeu/articles/transferts-de-personnages-et-dobjets-partagés-et-faq';
        var msgContent = 'Français (French): ';
        msgEmbed
          .setTitle( 'Transferts de personnages et d\'objets partagés, et FAQ' )
          .setThumbnail( 'https://web.archive.org/web/20200601142146im_/https://www.lotro.com/sites/default/files/LOTROcorelogo600FR.png' )
          .setURL( baseURL + pathName )
          .setDescription( 'Le transfert de personnages et d\'objets partagés d\'un monde vers un autre est à nouveau possible via le lanceur du jeu. Prenez connaissance de ce document pour en savoir plus sur son fonctionnement et sur ce à quoi il faut penser avant tout transfert.' )
          .addField( '**Les transferts sont possibles dans les configurations suivantes:**',
          ':small_blue_diamond: Mondes américains (États-Unis) vers d\'autres mondes américains\n:small_blue_diamond: Mondes européens vers d\'autres mondes européens\n:small_blue_diamond: Anor vers Ithil et inversement (mondes légendaires)\n\nLes transferts sont actuellement impossibles depuis d\'anciens mondes fermés vers des mondes actifs, mais nous réfléchissons à les rendre possibles à l\'avenir.' )
          .addField( '**Le coût du transfert de personnages ou d\'objets partagés est le suivant:**', ':small_blue_diamond: Transfert de personnage : 2 495 points SdAO\n:small_blue_diamond: Transfert d\'objets partagés : 495 points SdAO (gratuit lors d\'un transfert de personnage, au moment de ce dernier)\n:small_blue_diamond: Transfert de personnages et d\'objets partagés d\'Ithil vers Anor : gratuit\n\nRemarque : il n\'est pas possible d\'effectuer un transfert depuis un monde américain vers un monde européen et inversement. Il est également impossible d\'effectuer un transfert depuis un monde légendaire (Anor ou Ithil) vers un monde non légendaire.' )
          .addField( '**Procédure de transfert:**', ':one: Connectez-vous au lanceur du jeu en indiquant votre nom d\'utilisateur et votre mot de passe. Cliquez sur le bouton de transfert du lanceur.\n:two: Choisissez le serveur d\'origine de votre personnage ou de vos objets partagés.\n:three: Choisissez les personnages à transférer et indiquez si vous voulez transférer également des objets partagés.\n:four: Choisissez le monde de destination.\n:five: Confirmez le transfert.\n:six: Confirmez à nouveau l\'opération.\nVous pouvez transférer vers un autre monde des objets partagés au niveau du compte entre vos personnages d\'un même monde. Ces objets comprennent:\n:small_blue_diamond: Monnaie partagée au niveau du compte (pièces de mithril et marques d\'escarmouche)\n:small_blue_diamond: Stockage partagé\n:small_blue_diamond: Rangement de maison\n:small_blue_diamond: Garde-robe\n:small_blue_diamond: Points de destinée' );
        break;
      case 'american': case 'en-us':
      case 'british': case 'gb': case 'en-gb':
      case 'en': case 'english':
        var msgContent = 'English: ';
        break;
      default :
        var msgContent = '`' + args + '` is not a known language, defaulting to English:\n';
    } }

    message.channel.send( '**' + msgContent + '**\n:link: ' + baseURL + pathName + '\n*(embed below)*', { embed: msgEmbed } );
  }
}

module.exports = Transfers;