const commando = require( 'discord.js-commando' );
const path = require( 'path' );
const objFolio = require( path.join( __dirname, '../folio.json' ) );

class FolioItem extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'folio',
      group: 'maize',
      memberName: 'folio',
      description: 'Look up Folio items.'
    } );
  }
  
  async run( message, strArgs ) {
    if ( !strArgs ) {
      message.channel.send( 'Please use `!folio <index>` where index is the item index.' );
    } else if ( parseInt( strArgs ) === NaN ) {
      message.channel.send( 'Searching for items by name not yet ready.  Please use `!folio <index>` where index is the item index between 1 and 75.' );
    } else {
      var intItem = parseInt( strArgs )
      var intIndex = intItem - 1;
      if ( intIndex >= 1 && intIndex <= 75 ) {
        message.channel.send( 'Item #' + strArgs + ': **' + objFolio.items[ intIndex ].name + '** is a chapter ' + objFolio.items[ intIndex ].chapter + ' item that can be found: __' + objFolio.items[ intIndex ].loc + '__.' );
      } else {
        message.channel.send( intItem + ' is out of range!  Please use `!folio <index>` where index is the item index between 1 and 75.' );
      }
    }
  }
}

module.exports = FolioItem;