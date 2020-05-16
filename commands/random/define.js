const commando = require( 'discord.js-commando' );
const unirest = require( 'unirest' );
const path = require( 'path' );
const settings = require( path.join( __dirname, '../../../settings.json' ) );
const timeString = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  timeZone: 'America/New_York'
  };
const bot = 'LOTRObot';
var debugMode = false;

class MyDictionary extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'define',
      group: 'random',
      memberName: 'define',
      description: 'Give the definition of a word from the dictionary (Oxford English dictionary).',
    } );
  }

  async run( message, args ) {
    var query = {
      app_id: settings[ 'Common' ].oxford.appID,
      app_key: settings[ 'Common' ].oxford.appKey,
      url: 'https://od-api.oxforddictionaries.com/api/v1',
      word_id: encodeURIComponent( args.toLowerCase() ).replace( /%20/g, '_' )
      };
    unirest.get( query.url + '/entries/en/' + query.word_id )
      .header( 'Accept', 'application/json' )
      .header( 'app_id', query.app_id )
      .header( 'app_key', query.app_key )
      .end( function ( response ) {
      if ( !response.body || ( response.statusCode !== 200 && response.statusCode !== 404 ) ) {
        message.channel.send( 'Attempting to retrieve the definition of **' + args + '** in the Oxford dictionary resulted in an error.  My owner has been notified.' );
        message.client.channels.get( settings[ bot ].debug[ 0 ] ).send( message.author + ' attempted to retrieve the definition of **' + args + '** in the Oxford dictionary which resulted in a statusCode of `' + response.statusCode + '`.  <@' + settings[ bot ].owners[ 0 ] + '>, check the console for details.' );
        console.log( 'A request to define "' + args + '" by ' + message.author.tag + ' in #' + message.channel.name + ' of "' + message.guild + '" resulted in a ' + response.statusCode + ' status code.  Full response: ' + JSON.stringify( response ) );
      } else if ( response.statusCode === 404 ) {
        message.channel.send( {
          embed: {
            color: 0x00BEF2,
            author: {
              name: '© ' + ( new Date() ).getFullYear() + ' Oxford University Press',
              icon_url: 'https://seekcdn.com/pacman/company-profiles/logos/435419/oxford-university-press-logo.jpg'
            },
            thumbnail: {
              url: 'http://online.prepositionary.com/images/logo-oxford.png'
            },
            title: 'Oxford Dictionary says:',
            description: '**404**: Sorry, [**' + args + '**](https://en.oxforddictionaries.com/definition/' + query.word_id + ') is not in the Oxford Dictionary.',
            timestamp: new Date(),
            footer: {
              icon_url: message.author.avatarURL,
              text: message.author.username
            }
          }
        } );        
      } else {
        message.channel.send( {
          embed: {
            color: 0x00BEF2,
            author: {
              name: '© ' + ( new Date() ).getFullYear() + ' Oxford University Press',
              icon_url: 'https://seekcdn.com/pacman/company-profiles/logos/435419/oxford-university-press-logo.jpg'
            },
            thumbnail: {
              url: 'http://online.prepositionary.com/images/logo-oxford.png'
            },
            title: 'Oxford Dictionary definition of:',
            description: ':blue_book:\t[**' + args + '**](https://en.oxforddictionaries.com/definition/' + query.word_id + ')',
            fields: [
              {
                name: response.body.results[ 0 ].lexicalEntries[ 0 ].lexicalCategory,
                value: response.body.results[ 0 ].lexicalEntries[ 0 ].entries[ 0 ].senses[ 0 ].definitions[ 0 ]
              }
            ],
            timestamp: new Date(),
            footer: {
              icon_url: message.author.avatarURL,
              text: message.author.username
            }
          }
        } );
      }
    } );
	}
}

module.exports = MyDictionary;