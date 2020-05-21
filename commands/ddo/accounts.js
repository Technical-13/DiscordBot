const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class AccountCompare extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'accounts',
      group: 'ddo',
      memberName: 'accounts',
      description: 'Account option comparisons for Dungeons & Dragons Online.',
    } );
  }

  async run( message, args ) {
    var msgEmbed = new Discord.RichEmbed()
      .setTitle( 'Account type comparison help' )
      .setURL( 'http://ddowiki.com/page/Account_comparisons' )
      .setColor( '#234290' )
      .setTimestamp()
      .setFooter( '... as requested by ' + message.author.tag + '.' );
    switch ( args.toUpperCase() ) {
      case 'F2P' : msgEmbed
        .setDescription( '**Free to Play** (abbreviated **F2P**) ...' )
        .setThumbnail( 'http://games.mistrealm.com/DDO/Untitled-1a.jpg' )
        break;
      case 'PREMIUM' : msgEmbed
        .setDescription( 'A **premium** subscription (sometimes called **Freemium**) means that real world money has been spent on the account in the form of a purchase from the [DDO Market](http://store.turbine.com/store/turbine/en_US/list/categoryID.58733100/parentCategoryID.58516100) or as a previous [VIP subscription](https://www.ddo.com/en/game/vip) that has been canceled or lapsed.  There are ways to acquire this subscription status without actually spending *your* cash on it, if you\'re willing to do a little work.  Many streamers of DDO and other entities (such as this Discord server) do giveaways and contests on their personal channels and/or the official channel.' )
        .setThumbnail( 'http://drh.img.digitalriver.com/DRHM/Storefront/Site/turbine/cm/images/2012/DDO/logo-ddo.png' );
        break;
      case 'VIP' : msgEmbed
        .setDescription( 'More details for **VIP** will be available soon:tm:' )
        .setImage( 'https://www.ddo.com/sites/default/files/chart-en.png' );
        break;
      case 'FOUNDER' : msgEmbed
        .setDescription( 'A "[**Founder**](http://ddowiki.com/page/Founder)" is a person who created a game account during the one-week headstart period immediately prior to DDO\'s original launch date of February 28, 2006. This also required pre-ordering the game.' )
//        .setImage( 'https://raebidus.files.wordpress.com/2015/12/boxfront-large.png' );
        break;
//      case 'LIFETIME' : msgEmbed
//        .setDescription( 'Lifetime subscriptions have only been available as prizes for special contests.' );
//        break;
      default : msgEmbed
        .setDescription( 'Are you new to **Dungeons & Dragons Online** and would like help in deciding which account type is right for you?  Here\'s a little information to help you decide!  You can get more details on each type with `!accounts (F2P|Premium|VIP|Founder)` depending on what you want to see.' )
        .addField( 'Free to Play', 'The "**F2P**" model was launched in the Fall of ...' )
        .addField( 'Premium', '**PF2P** is an automatic subscription type for anyone who\'s account has something that was acquired for real world money. This can be the addition of content/classes, purchase of DP, or downgrade from VIP status.' )
        .addField( 'VIP', 'DDO\'s **VIP** program offers unlimited access to the majority of DDO\'s game content and features.  The only content not directly available with your VIP subscription are [expansion packs](http://ddowiki.com/page/Category:Expansion_Packs), which must be purchased separately.', false )
        .addField( 'VIP Founder', 'A player who pre-ordered the original release prior to DDO\'s original launch date of February 28, 2006.', true )
//        .addField( 'Lifetime VIP', 'Was offered to **Founders** at\n$199 until release when it became\noffered to others for $299.\nDiscontinued in 2009.', true )
        .addField( 'Comparison table of available account types:', 'Not yet available.'/*Click on image to make bigger'*/ )
//        .setImage( 'https://cdn.discordapp.com/attachments/253912706824798209/345655856710287361/Account_Comparisons.png' );
    }
      
    message.channel.send( { embed: msgEmbed } );
  }
}

module.exports = AccountCompare;