//To run this call 
//node server.js
//this runs the server on port 3000
var express = require('express');

var app = express.createServer();
var io = require('socket.io').listen(app);

var fs = require('fs');

//var game=require('bm');

//eval(fs.readFileSync('bm.js')+'');

var game = require('./bb.js');

var currentGame=new game.bbGame();//['john','bob','pete','mouse']);
 

app.set('view options', {layout: false})

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.get('/bm.js', function(req, res) {
    
  fs.readFile('./bm.js', function(error, content) {
        if (error) {
            res.writeHead(500);
            res.end();
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            
            res.end(content, 'utf-8');
        }
    });
});

app.get('/jquery-1.4.4.js', function(req, res) {
    
  fs.readFile('./jquery-1.4.4.js', function(error, content) {
        if (error) {
            res.writeHead(500);
            res.end();
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/javascript' });
            
            res.end(content, 'utf-8');
        }
    });
});

app.listen(3000);


//WHERE WE USED TO START THE GAME
//currentGame.start();






//HACK:Does nothing
/*
setInterval(function(){
            console.log('yo');
            console.log(currentGame.frame);
            
            var string = JSON.stringify(currentGame);
            console.log(string);
            
            },5000
            );
*/
            

io.configure(function() {
  io.set('transports', ['websocket']);
});

io.configure('production', function() {
  //HAC:Doesnt do anything
  io.set('log level', 1);
  console.log('REDUCING LOGGING');
});

io.set('log level', 1);

io.sockets.on('connection', function(socket) {
  socket.on('join', function(channel, ack) {
    socket.get('channel', function(err, oldChannel) {
      if (oldChannel) {
        socket.leave(oldChannel);
      }
      socket.set('channel', channel, function() {
        socket.join(channel);
        ack();
      });
    });
  });
  
  socket.on('message', function(msg, ack) {
    socket.get('channel', function(err, channel) {
      if (err) {
        socket.emit('error', err);
      } else if (channel) {
        
        /* OLD
        if(msg=='getState'){
         
          console.log('hahahaha');
          
          var string = JSON.stringify(currentGame);
          console.log(string);
          //socket.emit('state',currentGame.frame);
          socket.emit('state',string);
          ack();
        }  
        */
        
        //HACK:review this msg==start.. I think start is a seperate type of message.
        if(msg=='start') //can this happen
        {
          console.log('start!');
          currentGame.start();
        }
        else{
          //console.log(msg);
          //switch off broadcase
          //socket.broadcast.to(channel).emit('broadcast', msg);
          
          message=JSON.parse(msg);
          
          //console.log(message.index);
          //HACK:crap - code should not be in here
          if(message.playerID==0)
          {
            console.log('assign ID');
            newPlayer = currentGame.addPlayer();
            
            socket.emit('setPlayerIndex',newPlayer.id);
            
          }
          else{
            currentGame.updatePlayerInput(message['playerID'],message['upKey'],message['downKey'],message['leftKey'],message['rightKey'],message['dropBombKey']);
          }
          
          
          var string = JSON.stringify(currentGame);
          //socket.emit('state',currentGame.frame);
          
          //console.log(string);
          socket.emit('state',string);
          
          
          //HACK:do we need to do an ack here
          ack();
        }
      } else {
        socket.emit('error', 'no channel');
      }
    });
  });
  
  
  
   socket.on('start', function(msg, ack) {
    socket.get('channel', function(err, channel) {
      if (err) {
        socket.emit('error', err);
      } else if (channel) {
        
          console.log('start!');
          currentGame.start();
       
        
      } else {
        socket.emit('error', 'no channel');
      }
    });
  });
   
    socket.on('restart', function(msg, ack) {
    socket.get('channel', function(err, channel) {
      if (err) {
        socket.emit('error', err);
      } else if (channel) {
        
          console.log('restart!');
          currentGame.restart();
       
        
      } else {
        socket.emit('error', 'no channel');
      }
    });
  });
   
   socket.on('changeName', function(msg, ack) {
    socket.get('channel', function(err, channel) {
      if (err) {
        socket.emit('error', err);
      } else if (channel) {
        
          console.log('CHANGE NAME!');
          console.log(msg);
       
        message=JSON.parse(msg);
        
        //message.newName;
        
        var player=currentGame.getPlayerByID(message.playerID);
        player.name=message.newName.substr(0,10);
        
        
        if(player.name.indexOf('<',0) >=0)
        {
          player.name='dirty hacker - i see you!'
        }
        
      } else {
        socket.emit('error', 'no channel');
      }
    });
  });
   
   
});


