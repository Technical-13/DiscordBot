const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
const strScreenShotPath = path.join( __dirname, '../../images-lotro/' );

class AccountCompare extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'accounts',
      group: 'lotro',
      memberName: 'accounts',
      aliases: [ 'account' ],
      description: 'Account option comparisons for The Lord of the Rings Online.'
    } );
  }

  async run( message, args ) {
    var msgAttachment = [];
    var msgEmbed = new Discord.MessageEmbed()
      .setTitle( 'Account type comparison help' )
      .setURL( 'https://lotro-wiki.com/index.php/Account_Types#Account_type_comparison_table' )
      .setColor( '#234290' )
      .setTimestamp()
      .setFooter( '... as requested by ' + message.author.tag + '.' );
    switch ( args.toUpperCase() ) {
      case 'F2P': case 'FREE' : msgEmbed
        .setDescription( '**Free to Play** (abbreviated **F2P**) was launched in the fall 2010 and introduced a new business model. Players can play for free with significant restrictions and remove those restrictions by making a purchase in the in-game [LOTRO Store](https://lotro-wiki.com/index.php/Lotro_Store) with <:LP:510518319535882251>[LOTRO Points]( <https://lotro-wiki.com/index.php/LOTRO_Point> ).\n\nYou can [download]( <http://lotro.com/en/game/download> ) the game for free(*you can check system requirements with `!install`*) and start playing without a subscription or even a credit card. Anyone can join the game for free as a F2P player.' )
        .setThumbnail( 'https://nintendookie.files.wordpress.com/2010/09/capture.png' )
        break;
      case 'PF2P': case 'PREMIUM' : msgEmbed
        .setDescription( 'A **premium** subscription (sometimes called **Freemium**) means that real world money has been spent on the account in the form of a purchase from the [LOTRO Market]( <https://store.standingstonegames.com/store/ssg/en_US/list/categoryID.58516200/ThemeID.4823088100> ) or as a previous [VIP subscription]( <https://www.lotro.com/en/game/vip> ) that has been canceled or lapsed.  There are ways to acquire this subscription status without actually spending *your* cash on it, if you\'re willing to do a little work.  Many <@&201711028260569090> of LotRO and other entities (such as this Discord server) do giveaways and contests on their personal channels and/or the official channel' )
        break;
      case 'VIP': case 'SUBSCRIBER': case 'SUBSCRIPTION' : msgEmbed
        .setDescription( 'LOTRO\'s **VIP** program offers unlimited access to the majority of LOTRO\'s game content and features and is required for access to the Legendary servers.\n\nThe only content/race/class features not directly available with your VIP subscription and must be purchased separately are:' )
        .addField( '**Expansion packs:**', 
        ':arrow_right: [**`!quadpack`**]( <https://bit.ly/QuadPackLotRO> )\n' +
        ':fast_forward: [**Mines of Moria**]( <https://bit.ly/MoriaLotRO> )\n' +
        ':fast_forward: [**Siege of Mirkwood**]( <https://bit.ly/MirkwoodLotRO> )\n' +
        ':fast_forward: [**Rise of Isengard**]( <https://bit.ly/IsengardLotRO> )\n' +
        ':fast_forward: [**Riders of Rohan**]( <https://bit.ly/RohanLotRO> )\n' +
        ':arrow_right: [**Helm\'s Deep**]( <https://bit.ly/HelmsDeepLotRO> )\n' +
        ':arrow_right: [**`!Mordor`**]( <https://bit.ly/MordorLotRO> )\n' +
        ':arrow_right: [**Minas Morgul**]( <https://lotro.com/en/minasithil/> )' )
        .addField( '**Races/Classes:**',
        '<:elf:249042861792690176> [**High-Elf**]( <https://lotro-wiki.com/index.php/High_Elf> ) race\n' +
        '<:dwarf:249042757954437122> [**Stout-axe**]( <https://lotro-wiki.com/index.php/Stout-axe> ) race\n' +
        '<:beorning:237646627521691648> [**Beorning**]( <https://lotro-wiki.com/index.php/Beorning_(Race)> ) race/class\n' +
        '<:runekeeper:237648127891341312> [**Rune Keeper**]( <https://lotro-wiki.com/index.php/Rune-keeper> ) class\n' +
        '<:warden:237648209286135811> [**Warden**]( <https://lotro-wiki.com/index.php/Warden> ) class' )
        .setThumbnail( 'https://tagn.files.wordpress.com/2010/06/lotrovip.jpg' )
        break;
      case 'FOUNDER' : msgEmbed
        .setDescription( 'A "[**Founder**]( <https://lotro-wiki.com/index.php/LOTRO_Founder> )" is a player who pre-ordered the original [*Shadows of Angmar*](< https://lotro-wiki.com/index.php/Shadows_of_Angmar> ) release in April of 2007. Benefits at the time included participation in the beta testing, special lower pricing for monthly and lifetime subscriptions, and special benefits for all characters (a ring of agility +3 and a [special cloak]( <https://lotro-wiki.com/index.php/Item:Wayfarer%27s_Cloak> )). When Free to Play was released in 2010, Founders automatically became **VIPs**, as long as they kept paying their monthly fees (or were *Lifetime* members).\n\n\t*(Please indicate to <@&201710935788748800> if this is you to get the <@&305022132872675328> role in here!)*' )
        .setThumbnail( 'https://lotro-wiki.com/images/a/ad/Cloak_2_%28uncommon%29-icon.png' )
        .setImage( 'https://raebidus.files.wordpress.com/2015/12/boxfront-large.png' );
        break;
      case 'LIFETIME' : msgEmbed
        .setDescription( 'Lifetime subscriptions were offered to Founders for $199. After LotRO was released, a lifetime subscription was offered to everyone for $299. This subscription option was discontinued in 2009.' )
        break;
      default : msgEmbed
        .setDescription( 'Are you new to **The Lord of the Rings Online** and would like help in deciding which account type is right for you?  Here\'s a little information to help you decide!  You can get more details on each type with `!accounts (F2P|Premium|VIP|Founder|Lifetime)` depending on what you want to see.' )
        .addField( '**Free to Play:**', 'The "**F2P**" model was launched in the Fall of 2010, where players can play for free with significant restrictions that are removable with purchases in either the in-game LotRO Store with <:LP:510518319535882251> LOTRO Points or in the [LOTRO Market]( <https://store.standingstonegames.com/store/ssg/en_US/list/categoryID.58516200/ThemeID.4823088100> ) for real world money.' )
        .addField( '**Premium:**', '**PF2P** is an automatic subscription type for anyone who\'s account has something that was acquired for real world money. This can be the addition of content/classes, purchase of <:LP:510518319535882251>, or downgrade from VIP status.' )
        .addField(
          '**VIP:**', 'LOTRO\'s **VIP** program offers unlimited access to the majority of LOTRO\'s game content and features.  The only content not directly available with your VIP subscription are [expansion packs]( <https://lotro-wiki.com/index.php/Category:LOTRO_Store_Expansion_Packs> ), which must be purchased separately.' +
          '\n\n**VIP Founder:** A player who pre-ordered the original Shadows of Angmar release in 2007.' +
          '\n\n**Lifetime VIP:** Was offered to **Founders** at $199 until release when it became offered to others for $299. Discontinued in 2009.', false )
        .addField( 'Comparison table of available account types:', '*Click on image to make bigger*' )
        .setImage( 'attachment://accounts.png' );
        msgAttachment = [ { attachment: strScreenShotPath + 'accounts.png', name: 'accounts.png' } ];
    }
      
    message.channel.send( { embed: msgEmbed, files: msgAttachment } );
  }
}

module.exports = AccountCompare;
