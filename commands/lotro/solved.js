const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const puppeteer = require( 'puppeteer' );
const fsSettings = 'settings.json'
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const objTimeString = { timeZone: 'America/New_York',
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric' };
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const isDebug = true;//settings[ bot ].onError.isDebugMode;
const strScreenShotPath = path.join( __dirname, '../../' );
var strGameAcronym = bot.replace( 'bot', '' );

class Solved extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'solved',
      group: strGameAcronym.toLowerCase(),
      memberName: 'solved',
      description: 'Copy/Paste text from SSG Help Desk explaining what a ticket marked as `solved` really means.',
    } );
  }

  async run( message, args ) {
		var strGameName = ( strGameAcronym === 'DDO' ? 'Dungeons and Dragons' : 'Lord of the Rings' );
		message.channel.send( 'Thank you for submitting a bug report! Although we are not able to provide status updates or feedback on individual bugs, your bug report has been reviewed by ' + strGameName + ' Online\'s Quality Assurance team. Note that a ticket status of “solved” does not mean a bug has been fixed, only that it has been reviewed by QA and all relevant and helpful information logged internally at Standing Stone Games to help in our continuous attempts to resolve the root cause of any issues encountered.\n\nPlease note: We are unable to provide direct assistance via a Bug Report. This category of ticket is explicitly for providing information to the development team to prevent future occurrences of issues.\n\nThank you for taking the time to provide this valuable information.\n\nSincerely, ' + strGameAcronym + ' QA\n\nStanding Stone Games, LLC.\n\nYou may always search our FAQ or request support at <https://help.standingstonegames.com>' );
    message.delete( 1200 );
	}
}

module.exports = Solved;