const commando = require( 'discord.js-commando' );

class DiceRollCommand extends commando.Command {
  constructor( client ) {
    super( client, {
      name: 'roll',
      group: 'random',
      memberName: 'roll',
      description: 'An advanced command to roll dice.',
      format: '{Sets}#{Number}d{Sides}[+|-][Modifier]',
      aliases: [ 'd', 'dice', 'r', 'random' ],
      details: '\n:game_die: `{Sets}` is the number of times to roll `{Number}d{Sides}[+|-][Modifier]`\n:game_die: `{Number}` is the number of dice to roll & defaults to 1 if omitted.\n:game_die: `{Sides}` is the number of sides per dice & defaults to 6 if omitted. - If {Number} * {Sides} > 9999999999 !roll will "overflow" (you will roll a 0).\n:game_die: `[+|-][Modifier]` is the number to be added or subtracted to the outcome of the roll total. Ommitted if not a number.'
    } );
  }
  
  async run( message, args ) {
    var roll = { sets: 1, dice: 1, sides: 6, modifier: 0 };
    var dieRolls = {};
    var diceRoll = 0;
    var parseArgs = args.match( /(([\d]*)[#])?(([\d]*)[dD])?([\d]*)?([\+\-][\d]*)?/ );
    
    if ( parseArgs[ 2 ] != undefined && parseArgs[ 2 ] != '' ) {
      roll.sets = parseInt( parseArgs[ 2 ] );
    }
    
    if ( parseArgs[ 4 ] != undefined && parseArgs[ 4 ] != '' ) {
      roll.dice = parseInt( parseArgs[ 4 ] );
    }
    
    if ( parseArgs[ 5 ] != undefined && parseArgs[ 5 ] != '' ) {
      roll.sides = parseInt( parseArgs[ 5 ] );
    }
    
    if ( parseArgs[ 6 ] != undefined && parseArgs[ 6 ] != '' ) {
      roll.modifier = parseInt( parseArgs[ 6 ] );
    }
    
    var rollMessage = ':game_die: Rolling: ';
    for ( var set = roll.sets; set > 0; set-- ) {
      rollMessage += '(**' + roll.dice + 'd' + roll.sides;
      if ( roll.modifier > 0 ){
        rollMessage += '+' + roll.modifier;
      } else if ( roll.modifier < 0 ) {
        rollMessage += '-' + roll.modifier;        
      }
      
      rollMessage += '**)';
      
      if ( set > 1 ) {
        rollMessage += ' + ';
      } else {
        rollMessage += ':';
      }
    }
    
    message.channel.send( rollMessage );
    var rollSubtotal = '(';
    
    for ( var set = roll.sets; set > 0; set-- ) {
      var intRollSubtotal = 0;
      for ( var die = roll.dice; die > 0; die-- ) {
        dieRolls.die = Math.floor( Math.random() * roll.sides ) + 1;
        diceRoll += dieRolls.die;
        intRollSubtotal += dieRolls.die;
      }
    
      if ( roll.modifier !== 0 ) {
        diceRoll += roll.modifier;
        intRollSubtotal += roll.modifier;
      }
      
      rollSubtotal += intRollSubtotal + ')';
      
      if ( set > 1 ) {
        rollSubtotal += ' + (';
      } else {
        rollSubtotal += ':';
      }
    }
    
    message.channel.send( rollSubtotal );
    
    if ( diceRoll > 9999999999 ) {
      diceRoll = 0;
    }
    
    message.channel.send( '**Sum**: ' + diceRoll );
  }  
}

module.exports = DiceRollCommand;
