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

class ForumPost extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'forumpost',
      group: bot.toLowerCase().replace( 'bot', '' ),
      memberName: 'forumpost',
      description: 'Get an embed containing a post from the ' + bot.replace( 'bot', '' ) + ' forums.',
    } );
  }

  async run( message, args ) {
    var isOwner = ( settings[ bot ].owners.indexOf( message.author.id ) !== -1 ? true : false );
    var isBotMod = ( settings[ bot ].moderators.indexOf( message.author.id ) !== -1 ? true : false );
    var isCrown = false, isAdmin = false, isStaff = false;
    var staffRole = false;
    if ( message.guild ) {
      isCrown = ( message.author.id === message.guild.owner.user.id ? true : false );
      var arrAdminRoles = [];
      message.guild.roles.array().forEach( function( role, index ) {
        if ( ( new Discord.Permissions( role.permissions ) ).has( 8 ) ) { arrAdminRoles.push( role ); }
      } );
      arrAdminRoles.forEach( function( role, index ) {
        if ( ( role.members.keyArray() ).indexOf( message.author.id ) !== -1 || message.author.id === message.guild.ownerID ) {
          isAdmin = true;
        }
      } );
      staffRole = await message.guild.roles.get( '201710935788748800' );
      isStaff = await ( staffRole && ( staffRole.members.keyArray() ).indexOf( message.author.id ) !== -1 ? true : false );
    }
if ( isOwner || isBotMod ) {
    const arrArgs = args.split( ' ' );console.log( '%s: `!forumpost` fired: %o', strNow, arrArgs );
    var intPostId = parseInt( arrArgs[ 0 ] );
    message.delete( { reason: 'Cleaning up request for forum post.' } ).catch( errDel => { console.log( 'Unable to delete ' + message.author.tag + '\'s message in ' + message.guild.name + '#' + message.channel.name + ' at ' + ( new Date() ).toLocaleDateString( 'en-US', objTimeString ) + ': ' + errDel ); } );
    
    var objPostMsg = await message.channel.send( 'Looking up post, please stand by...' );
    
    const strPostURL = 'https://www.lotro.com/forums/showthread.php?postid=' + intPostId + '#post' + intPostId;

    const browser = await puppeteer.launch( );
    const page = await browser.newPage( );
    await page.goto( strPostURL );
    
    var objForumPost = await page.evaluate( async () => {
      if ( document.getElementsByClassName( 'standard_error' ).length === 1 ) {
        const intPostId = document.URL.slice( ( document.URL.indexOf( '?' ) + 1 ) ).split( '#' )[ 0 ].split( '=' )[ 1 ];
        var objPostData = await {
          statusCode: 404,
          statusMsg: 'Post not found.',
          id: intPostId
        };
      }
      else {
        const arrMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
        const arrDaysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
        const intPostId = document.URL.slice( ( document.URL.indexOf( '?' ) + 1 ) ).split( '&' )[ 1 ].split( '#' )[ 0 ].split( '=' )[ 1 ];
        const domPost = document.getElementById( 'post_' + intPostId );
        const strRawPostDate = domPost.getElementsByClassName( 'date' )[ 0 ].innerText;
        var arrPostDate = strRawPostDate.replace( /,\s/, ' ' ).split( ' ' );
        var strPostDate = '';
        switch ( arrPostDate[ 0 ].toUpperCase() ) {
          case 'YESTERDAY':
            var arrTemp = [];
            var intMonth = ( ( new Date() ).getMonth() + 1 );
            arrTemp.push( parseInt( intMonth <= 9 ? '0' + intMonth : intMonth ) );
            arrTemp.push( ( new Date() ).getDate() - 1 );
            arrTemp.push( ( new Date() ).getFullYear() );
            arrTemp.push( arrPostDate[ 1 ] );
            arrTemp.push( arrPostDate[ 2 ] );
            if ( arrTemp[ 1 ] < 1 ) {
              intMonth--;
              arrTemp[ 0 ] = parseInt( intMonth <= 9 ? '0' + intMonth : intMonth );
              arrTemp[ 1 ] = ( intMonth === 2 ? ( arrTemp[ 2 ] % 4 === 0 ? 29 : 28 ) : arrDaysInMonth[ intMonth ] );
            }
            arrPostDate = Array.from( arrTemp );
            break;
          case 'TODAY':
            var arrTemp = [];
            var intMonth = ( ( new Date() ).getMonth() + 1 );
            arrTemp.push( parseInt( intMonth <= 9 ? '0' + intMonth : intMonth ) );
            arrTemp.push( ( new Date() ).getDate() );
            arrTemp.push( ( new Date() ).getFullYear() );
            arrTemp.push( arrPostDate[ 1 ] );
            arrTemp.push( arrPostDate[ 2 ] );
            arrPostDate = Array.from( arrTemp );
            break;
          default:
            arrPostDate[ 0 ] = parseInt( arrMonths.indexOf( arrPostDate[ 0 ] ) < 9 ? '0' + ( arrMonths.indexOf( arrPostDate[ 0 ] ) + 1 ) : ( arrMonths.indexOf( arrPostDate[ 0 ] ) + 1 ) );
        }
        var arrPostTime = arrPostDate[ 3 ].split( ':' );
        arrPostDate[ 3 ] = 'T' + ( parseInt( arrPostTime[ 0 ] ) + ( arrPostDate.pop().toUpperCase() === 'PM' ? 12 : 0 ) ).toString() + ':' + arrPostTime[ 1 ] + ':00.000Z';
        strPostDate = arrPostDate[ 2 ] + '-' + ( arrPostDate[ 0 ] <= 9 ? '0' : '' ) + arrPostDate[ 0 ] + '-' + ( arrPostDate[ 1 ] <= 9 ? '0' : '' ) + arrPostDate[ 1 ] + arrPostDate[ 3 ];
        const domCreatedBy = domPost.getElementsByClassName( 'username' )[ 0 ];
        const arrCreatedBy = domCreatedBy.href.slice( ( domCreatedBy.href.indexOf( '?' ) + 1 ) ).split( '-' );
        var arrPostFiles = [];
        domPost.getElementsByClassName( 'postcontent' )[ 0 ].querySelectorAll( 'img' ).forEach( domImg => { arrPostFiles.push( domImg.src ); } );
        var objPostData = await {
          statusCode: 200,
          id: intPostId,
          createdBy: {
            id: arrCreatedBy[ 0 ],
            name: arrCreatedBy[ 1 ]
          },
          createdAt: strPostDate,
          title: ( domPost.getElementsByClassName( 'posttitle' ).length !== 0 ? domPost.getElementsByClassName( 'posttitle' )[ 0 ].innerText : document.getElementsByClassName( 'threadtitle' )[ 0 ].innerText ),
          files: Array.from( arrPostFiles ),
          content: domPost.getElementsByClassName( 'postcontent' )[ 0 ].innerHTML.trim()
            .replace( /<br ?\/?>/gi, '\n' ).replace( /\n\n/g, '\n' )
            .replace( /<\/?b>/gi, '**' )
            .replace( /<\/?i>/gi, '*' )
            .replace( /<\/?u>/gi, '__' )
            .replace( /<a href="(.*?)"(?:.*?)?>(.*?)<\/a>/gi, '[$2]($1)' )
        };
      }
      
      return objPostData;
    } );
    
    await browser.close();
    
    console.log( objForumPost );
    
    var objPostEmbed = new Discord.RichEmbed()
      .setURL( strPostURL );
    
    var arrFiles = [];
      
    if ( objForumPost.statusCode === 404 ) {
      objPostEmbed
        .setColor( '#FF0000' )
        .setTitle( objForumPost.statusMsg )
        .setImage( 'attachment://ShallNotPass.png' );
        
      arrFiles.push( { attachment: strScreenShotPath + 'ShallNotPass.png', name: 'ShallNotPass.png' } );
        
    } else {
      objPostEmbed
        .setColor( '#00FF00' )
        .setTitle( objForumPost.title )
        .setThumbnail( 'http://www.lotro.com/forums/image.php?u=' + objForumPost.createdBy.id )
        .setDescription( objForumPost.content.length <= 1500 ? objForumPost.content : 'Sorry, this content currently too long to display.' )
        .setFooter( 'Posted on the LotRO forums by ' + objForumPost.createdBy.name + ' on ' + ( new Date( objForumPost.createdAt ) ).toLocaleDateString( 'en-us', { timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' } ) );
        
      arrFiles = Array.from( objForumPost.files );
    }
      
    objPostMsg.edit( ':link: <' + strPostURL + '>', { embed: objPostEmbed, files: arrFiles } ).catch( errEdit => { console.error( '%s: Unable to edit my message with details on forum post:\nhttps://www.lotro.com/forums/showthread.php?postid=%d#post%d\nERROR: %o', strNow, intPostId, intPostId, errEdit ); } );
}
  }
}

module.exports = ForumPost;