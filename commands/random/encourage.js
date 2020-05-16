const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const fsSettings = 'settings.json';
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
var strSettings = JSON.stringify( settings );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = ( new Date() ).toLocaleDateString( 'en-US', objTimeString );
const isDebug = true;//settings[ bot ].onError.isDebugMode;

class Encourage extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'encourage',
      group: 'random',
      memberName: 'encourage',
      description: 'Send another member an encouraging bot message, or get on yourself.'
    } );
  }

  async run( message, args ) {
    var guild = null;
    var client = message.client;
    var arrOwnerIDs = settings[ bot ].owners, arrBotModIds = settings[ bot ].moderators;
    var arrOwners = [], arrRoledAdmins = [], arrAdmins = [], arrRoledManagers = [], arrManagers = [];
    await arrOwnerIDs.forEach( owner => { arrOwners.push( message.client.fetchUser( owner ) ); } );
    var isOwner = ( arrOwnerIDs.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = ( arrBotModIds.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, canManage = false;
    const isBot = message.author.bot;
    if ( message.guild ) {
      guild = message.guild;
      isCrown = ( message.author.id === guild.owner.user.id ? true : false );
      var arrAdminRoles = [], arrManageRoles = [];
      message.guild.roles.array().forEach( ( role, index ) => {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
        if ( ( new Discord.Permissions( role.permissions ) ).has( 32 ) ) { arrManageRoles.push( role ); }
      } );
      await arrAdminRoles.forEach( async ( role, index ) => {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdmin = true;
        }
        arrRoledAdmins = arrRoledAdmins.concat( Array.from( role.members.values() ) );        
      } );
      await arrManageRoles.forEach( async ( role, index ) => {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          canManage = true;
        }
        arrRoledManagers = arrRoledManagers.concat( Array.from( role.members.values() ) );  
      } );
      await arrRoledAdmins.forEach( async member => {
        let notCrown = ( member.id !== guild.ownerID ? true : false );
        let notBot = !member.user.bot;
        if ( notCrown && notBot ) { arrAdmins.push( member ); }
      } );
      await arrRoledManagers.forEach( async member => {
        let notCrown = ( member.id !== guild.ownerID ? true : false );
        let notAdmin = ( arrAdmins.indexOf( member ) === -1 ? true : false );
        let notBot = !member.user.bot;
        if ( notCrown && notAdmin && notBot ) { arrManagers.push( member ); }
      } );
      arrAdmins = await arrAdmins.sort( ( a, b ) => { return a.joinedTimestamp - b.joinedTimestamp; } );
      arrManagers = await arrManagers.sort( ( a, b ) => { return a.joinedTimestamp - b.joinedTimestamp; } );
      const intAdmins = arrAdmins.length, intManagers = arrManagers.length;
      const arrRoles = guild.roles.array().sort( ( a, b ) => { return a.position - b.position } );
      const intRoles = arrRoles.length;
      const arrArgs = ( args.split( ' ' ).length === 1 && args.split( ' ' )[ 0 ] === '' ? [] : args.split( ' ' ) );
      
      var intArgs = arrArgs.length;console.log( '%s: `!server` fired with %i parameters: %o', strNow, intArgs, arrArgs );
    }
    
		if ( !isBot ) {
			message.delete().then( async delTrigger => {
				function getRand( intMin, intMax ) {
					if ( intMin === undefined ) { intMin = 1; }
					if ( intMax === undefined ) { intMax = 6; }
					return Math.floor( Math.random() * intMax ) + intMin;
				}
				async function getEncouraged( intMsgID ) {
					if ( intMsgID === undefined ) { intMsgID = await getRand( 1, 6 ); }
					switch ( intMsgID ) {
						case 1 :
							return 'you\'re an idiot...'; break;
						case 2 :
							return 'I love you.  :heart:'; break;
						case 3 :
							return 'you\'re a super :star:'; break;
						case 4 :
							return 'you are awesome today!'; break;
						case 5 :
							return 'you\'re a silly goose...'; break;
						case 6 :
							return 'you\'re great.'; break;
						default :
							return 'I don\'t feel so good...';
					}
				}
				let toEncourage = ( message.mentions.members.first() || message.author );
				message.channel.send( toEncourage + ', ' + await getEncouraged() ).then( async msgSent => {
					client.setTimeout( async function() {
						if ( message.channel.lastMessage !== msgSent ) {
							message.channel.send( toEncourage + ', ' + await getEncouraged() );
						}
					}, ( await getRand( 12, 27 ) * 1000 ) );
				} );
			} ).catch( errDel => {
				message.reply( 'I am unable to process your request.  Please ask ' + message.guild.owner.user.tag + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ).then( replySuccess => { replySuccess.edit( message.author + ', I am unable to process your request.  Please ask ' + message.guild.owner.user + ' to make sure I have the `MANAGE_MESSAGES` permission.  Thanks! :heart:' ) } );
			} );
		}
	}
}

module.exports = Encourage;