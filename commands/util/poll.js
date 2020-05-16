const Discord = require( 'discord.js' );
const commando = require( 'discord.js-commando' );

class Poll extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'poll',
      group: 'util',
      memberName: 'poll',
      aliases: [ 'tally' ],
      description: 'Poll the server using emoji for your votes. WIP: tally an existing poll, not yet available for use.',
      format: 'Question to poll? || :option 1: || :option 2: || :option ...:',
      details: 'The parameters of the `!poll` command are delimited by a double pipe - `||`\n\tParameter one is the question to ask (with descriptions of each vote emoji if needed)\n\tAll following parameters must be emoji responses people can click on to indicate their answers.',//\n\n The parameter of the `!tally` command is just the message id of the poll post to tally results.
      examples: [ '!poll Are you having fun here? || `:white_check_mark:` || `:x:`', '!poll How many points are in a Star of David? || `:three:` || `:five:` || `:six:` || `:eight:`', '!poll What should we call our new group? `:regional_indicator_a:` Awesome Possums `:regional_indicator_b:` Clever Foxes `:regional_indicator_c:` Eager Beavers || `:regional_indicator_a:` || `:regional_indicator_b:` || `:regional_indicator_c:`' ]//, '!tally ##################'
    } );
  }

  async run( message, args ) {
    const command = message.content.split( ' ' )[ 0 ].replace( '!', '' ).toUpperCase();
    if ( command === 'TALLY' ) {
      var arrArgs = args.split( );
      message.channel.send( '**Work in progress:** This command is not quite ready yet.  Please check back later!' );
        message.channel.fetchMessage( arrArgs[ 0 ] ).then( objMsg => {
          console.log( objMsg.reactions.array() );
          objMsg.react( '🔐' ).then( reacted => {
            /* NOTHING */
          } ).catch( errReact => {
            console.error( 'errReact: ' + errReact )
          } );
        } );
    }
    else {
      var arrArgs = args.split( '||' );
      var rxp = /<:(.*)?:([\d]*)>/;
      var thisPoll = await message.channel.send( '**POLL:** ' + arrArgs[ 0 ] );
      var r = 1;
      do {
        var reaction = arrArgs[ r ].trim();
        if ( rxp.test( reaction ) ) {
          reaction = reaction.match( rxp )[ 2 ];
        }
        else {
          reaction = encodeURI( reaction );
        }
        await thisPoll.react( reaction ).then( () => { r++; } ).catch( error => { console.error( error ); } );      
      } while ( r < arrArgs.length );
      message.delete().catch( error => { console.error( error ); } );
    }
  }
}

module.exports = Poll;