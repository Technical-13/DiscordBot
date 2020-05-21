// TODO:  Create a wiki api library for the bot

const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const request = require( 'request' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const bot = 'DDObot';
const myWiki = settings[ bot ].wikis.ddowiki;
const wikiArticlePath = myWiki.root;
const wikiApiPath = myWiki.root + myWiki.api;

class RecentChangesLast extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'wrclast',
      group: 'wiki',
      memberName: 'wrclast',
      description: 'Pulls information from the wiki about the most recent change.'
    } );
  }
  
  async run( message, args ) {
    var query = wikiApiPath + '?action=query&format=json&list=recentchanges&rclimit=1';
    
    request( query, function ( error, response, body ) {
      console.log( '\nWe queried DDOwiki\'s API with:\n\t`' + query + '`' );
      console.log( '\nThe json string returned by the wiki\'s API was:\n\t`' + body + '`' );
      
      if ( error !== null ) {
        console.log( 'error:', error ); // Print the error if one occurred
        
      } else if ( response.statusCode !== 200 ) {
        console.log( 'statusCode:', response && response.statusCode ); // Print the response status code if a response was received
        
      } else {
        var rcInfo = JSON.parse( body ).query.recentchanges[ 0 ];
        var rcItem = {
          isNew: ( rcInfo.type = 'new' ? true : false ),
          nsNum: rcInfo.ns,
          title: rcInfo.title,
          curid: rcInfo.pageid,
          diff: rcInfo.revid,
          oldid: rcInfo.old_revid,
          timestamp: rcInfo.timestamp
        }
      }
      message.channel.send( '`' + rcItem.title + '` was edited (diff: http://ddowiki.com/index.php?title=' + rcItem.title.replace( / /g, '_' ) + '&curid=' + rcItem.curid + '&diff=' + rcItem.diff + '&oldid=' + rcItem.oldid + ') at: ' + rcItem.timestamp );
    } );
  }  
}

module.exports = RecentChangesLast;