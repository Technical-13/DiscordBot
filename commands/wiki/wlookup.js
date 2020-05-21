//*
const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );
const request = require( 'request' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const bot = 'DDObot';
const myWiki = settings[ bot ].wikis.ddowiki;
var isItem = false, isMonster = false, isNPC = false, isQuest = false;

class WikiLookUp extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'wlookup',
      group: 'wiki',
      memberName: 'wlookup',
      description: 'Looks up information on an NPC, Item, Monster, or Quest'
    } );
  }
  
  async run( message, args ) {
    var query = myWiki.api + '?action=query&format=json&indexpageids=1&prop=templates&tllimit=max&tltemplates=Template:Named%20item|Template:Monster|Template:NPC|Template:Quest&titles=';
    
    request( query, function ( error, response, body ) {
      console.log( '\nWe queried DDOwiki\'s API with:\n\t`' + query + '`' );
      console.log( '\nThe json string returned by the wiki\'s API was:\n\t`' + body + '`' );
      
      if ( error !== null ) {
        console.log( 'error:', error ); // Print the error if one occurred
        
      } else if ( response.statusCode !== 200 ) {
        console.log( 'statusCode:', response && response.statusCode ); // Print the response status code if a response was received
        
      } else {
        const objCatList = JSON.parse( body ).query;
        var strPageType = '';
        objCatList.pages[ objCatList ].templates.forEach( function( template ){
          if ( template.title === 'Template:Named item' ) {
            isItem = true;
          } else if ( template.title === 'Template:Monster' ) {
            isMonster = true;
          } else if ( template.title === 'Template:NPC' ) {
            isNPC = true;
          } else if ( template.title === 'Template:Quest' ) {
            isQuest = true;
          } else {
            isItem = false; isMonster = false; isNPC = false; isQuest = false;
          }
        } );
      }
    } );
  }  
}

module.exports = WikiLookUp;
//*/