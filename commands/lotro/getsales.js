const bot = 'LOTRObot';
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const fs = require( 'fs' );
const path = require( 'path' );
const fsSettings = 'settings.json'
const settings = require( path.join( __dirname, '../../../' + fsSettings ) );
const fsSpecials = bot + '/specials.json';
var objSpecials = require( path.join( __dirname, '../../../' + fsSpecials ) );
const objTimeString = {
  year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  timeZone: 'America/New_York', timeZoneName: 'short' };
var strNow = ( new Date() ).toLocaleDateString( 'en-us', objTimeString );
const exec = require( 'child_process' ).exec;
const puppeteer = require( 'puppeteer' );

class getSales extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'getsales',
      group: bot.toLowerCase().replace( 'bot', '' ),
      memberName: 'getsales',
//      aliases: [ '' ],
      description: 'Get the offical SSG sales information!'
    } );
  }

  async run( message, args ) {
    const isBot = message.author.bot;
    const client = message.client;
    var guild = null;
    var arrOwnerIDs = settings[ bot ].owners, arrBotModIds = settings[ bot ].moderators, arrOwners = [];
    await arrOwnerIDs.forEach( function( owner ) { arrOwners.push( client.fetchUser( owner ) ); } );
    const isOwner = ( arrOwnerIDs.indexOf( message.author.id ) !== -1 ? true : false );
    const isBotMod = ( arrBotModIds.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdministrator = false, canManageServer = false, canManageRoles = false;
    if ( message.guild ) {
      guild = message.guild;
      isCrown = ( message.author.id === guild.ownerID ? true : false );
      var arrAdministratorRoles = [], arrManageServerRoles = [], arrManageRolesRoles = [];
      message.guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdministratorRoles.push( role ); }// ADMINISTRATOR
        if ( ( new Discord.Permissions( role.permissions ) ).has( 32 ) ) { arrManageServerRoles.push( role ); }// MANAGE_SERVER
        if ( ( new Discord.Permissions( role.permissions ) ).has( 268435456 ) ) { arrManageRolesRoles.push( role ); }// MANAGE_ROLES
      } );
      arrAdministratorRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdministrator = true;
        }
      } );
      arrManageServerRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          canManageServer = true;
        }
      } );
      arrManageRolesRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          canManageRoles = true;
        }
      } );
    }

    const arrArgs = args.split( ' ' );console.log( '%s: `!getSales` fired: %o', strNow, arrArgs );
    var intArgs = arrArgs.length;
    if ( isOwner || isBotMod || !isBot ) {
      const strPeriodicalName = ( bot === 'DDObot' ? 'Chronicle' : 'Beacon' );console.log('strPeriodicalName: %o',strPeriodicalName);
      const baseURL = ( bot === 'DDObot' ? 'http://www.ddo.com/en/news/ddo-chronicle-issue-' : 'https://www.lotro.com/en/game/articles/lotro-beacon-issue-' );console.log('baseURL: %o',baseURL);
      var intPeriodical = ( parseInt( arrArgs[ 0 ] ) || ( parseInt( objSpecials.URI.slice( ( objSpecials.URI.lastIndexOf( '-' ) + 1 ) ) ) + 1 ) );console.log('intPeriodical: %o',intPeriodical);
      const strPeriodicalURL = baseURL + intPeriodical;console.log('strPeriodicalURL: %o',strPeriodicalURL);
      
      const browser = await puppeteer.launch( );
      const page = await browser.newPage( );
      await page.goto( strPeriodicalURL );
      
      var objSalesData = await page.evaluate( async () => {
        if ( document.getElementsByClassName( 'standard_error' ).length === 1 ) {
          const intSaleId = document.URL.slice( ( document.URL.lastIndexOf( '-' ) + 1 ) );
          var objSaleData = await {
            statusCode: 404,
            statusMsg: strPeriodicalName + ' ' + intSaleId + ' not found.',
            id: intSaleId
          };
        }
        else {
          // Define which game we're parsing data for
          var strGame = document.URL.replace( /https?:\/\/(www\.)?/i, '' );
          strGame = strGame.slice( 0, strGame.indexOf( '.' ) ).toLowerCase();

          // Initialize variables
          var arrSalesFree = [],
          arrSalesVal = [],
          strBonusDaysName = '',
          arrBonusDaysVal = [],
          strWeeklyCoupon = '',
          arrWeeklyCoupon = [],
          strFreebieCode = '',
          strFreebieName = '',
          strFreebieLink = '',
          intFreebieQuantity = 0,
          strFreebieWeek = '',
          strSaleName = '';

          // Populate variables depending on which game
          if ( strGame === 'ddo' ) {
            arrSalesFree = document.getElementsByClassName( 'news content' )[ 0 ].childNodes[ 8 ].innerText.split( /[\r\n]{1,2}/ );
            strBonusDaysName = arrSalesFree[ 0 ].slice( 27, arrSalesFree[ 0 ].toLowerCase().indexOf( ' now through' ) );
            arrBonusDaysVal = arrSalesFree[ 1 ].split( /[\.\?!] /g );
            strWeeklyCoupon = arrSalesFree[ ( arrSalesFree.length - 1 ) ];
            arrWeeklyCoupon = strWeeklyCoupon.slice( 27, strWeeklyCoupon.toLowerCase().indexOf( ' now through' ) ).replace( /with the Coupon Code /i, '' ).split( ' ' );
            strFreebieCode = arrWeeklyCoupon.pop();
            intFreebieQuantity = parseInt( arrWeeklyCoupon.pop().replace( /[^0-9]/g, '' ) );
            strFreebieName = arrWeeklyCoupon.join( ' ' );
            strFreebieLink = '';
            strFreebieWeek = '';
            strSaleName = arrSalesFree[ 2 ].slice( 0, arrSalesFree[ 2 ].toLowerCase().indexOf( ' now through' ) ) + ':';
            arrSalesVal = [];
          } else {
            arrSalesFree = document.getElementsByTagName( 'h3' )[ 6 ].nextSibling.nextSibling.childNodes[ 0 ].innerText.split( /[\r\n]{1,2}/ );
            strBonusDaysName = '';
            arrBonusDaysVal = '';
            strFreebieCode = '';
            strFreebieName = '';
            strFreebieLink = '';
            intFreebieQuantity = 0;
            strFreebieWeek = '';
            strSaleName = arrSalesFree[ 0 ].slice( 0, arrSalesFree[ 0 ].toLowerCase().indexOf( ' now through' ) ) + ':';
            arrSalesVal = [];
          }
          // Hand validate all components and make any needed adjustments
          /* Do the thing. */

          // Create our object
          var objSpecials = {
            URI: document.URL,
            image: document.querySelectorAll( 'p.rtecenter span img' )[ 0 ].getAttribute( 'src' ).replace( 'https://', 'http://' ),
            ssotw: document.querySelectorAll( 'p.rtecenter span img' )[ 1 ].getAttribute( 'src' ),
            bonusDays: {
              ends: ( new Date() ),
              name: strBonusDaysName,
              value: arrBonusDaysVal
            },
            freebie: {
              ends: ( new Date() ),
              code: strFreebieCode,
              item: {
                name: strFreebieName,
                link: strFreebieLink
              },
              quantity: intFreebieQuantity,
              week: strFreebieWeek
            },
            sales: {
              ends: ( new Date() ),
              name: strSaleName,
              value: Array.from( arrSalesVal )
            }
          }

        console.log( '%o', objSpecials );
        }
      
        return objSaleData;
      } );
      
      await browser.close();
      
      console.log( objSalesData );
    }
  }
}

module.exports = getSales;