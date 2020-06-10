const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };

class support extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'support',
      group: bot.toLowerCase().replace( 'bot', '' ),
      memberName: 'support',
      format: '(account|market|forums|bug|character|ban|transfer)',
      description: 'Links to contact SSG support.'
    } );
  }

  run( message, strArgs ) {
    var arrArgs = strArgs.split( ' ' );
		var strCommand = ( arrArgs[ 0 ] || 'NULL' ).toUpperCase();
    var objSupportEmbed = new Discord.RichEmbed()
      .setThumbnail( 'https://help.standingstonegames.com/hc/theme_assets/1376679/115000025568/ssg-logo.png' )
      .setTimestamp()
      .setFooter( 'Standing Stone Games support options' );
    var intFormID = -1;
    var strFormPurpose = '';
    switch ( strCommand ) {
      case 'ACCOUNT' :
        intFormID = 437927;
        strFormPurpose = 'get account help from';
        break;
      case 'MARKET' :
      case 'STORE' :
        intFormID = 437947;
        strFormPurpose = 'get help with the ' + bot.replace( 'bot', '' ) + ' Store or ' + bot.replace( 'bot', '' ) + ' Market from';
        break;        
      case 'FORUMS' :
        intFormID = 437987;
        strFormPurpose = 'get help with a an issue on the ' + bot.replace( 'bot', '' ) + '  forums from';
        break;
      case 'BUG' :
      case 'REPORT' :
        intFormID = 438007;
        strFormPurpose = 'report a bug to';
        break;
      case 'CHARACTER' :
      case 'QUEST' :
      case 'ITEM' :
      case 'PLAYER' :
        intFormID = 526548;
        strFormPurpose = 'get help with a character, quest, item, or player from';
        break;
      case 'BAN' :
      case 'APPEAL' :
        intFormID = 527488;
        strFormPurpose = 'appeal a ban to';
        break;
      case 'TRANSFER' :
        intFormID = 527508;
        strFormPurpose = 'get help with a transfer from';
        break;
      case 'NULL' :
      default :
    }
    var strSupportLink = 'https://help.standingstonegames.com/hc/en-us/requests/new';
    if ( intFormID !== -1 ) {
      strSupportLink += '?ticket_form_id=' + intFormID;
    }
    objSupportEmbed
      .setTitle( 'Click the following link' + ( strFormPurpose === '' ? '' : ' to ' + strFormPurpose + ' SSG support' ) + ':' )
      .setDescription( ':link: ' + strSupportLink );
    message.channel.send( { embed: objSupportEmbed } );
  }
}

module.exports = support;