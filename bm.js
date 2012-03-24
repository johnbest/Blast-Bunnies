
/*

* = solid
1,2,3 = smashable block (in various states?)
o = smashable block
 = space
a= spawn points

these get created randomly during the game
x = bonus explosion distance
b = bonus bomb
 */


//defaultcreatfunction 
function createMap()
{
    
    var newMap=
[
'*******',
'*a    *',
'* o o *', 
'*     *',
'* o o *',
'*    a*',
'*******'];
    
    var newMap2=
    [
'***********',
'*a   ooo  *',
'* ooooooo *',
'* o     o *', 
'* o     o *', 
'* ooooooo *',
'*  ooo   a*',
'***********'
];
    
    //4 way
    var newMap3=
    [
'*************',
'*a   oo  o a*',
'* oooo  ooo *',
'*oo    o  o *',
'* oo  oooooo*',
'*oooooo  ooo*',
'*oo   o   oo*', 
'* ooo  oooo *',
'*a ooo     a*',
'*************'
];
    
    
    //6 player
    var newMap4=
    [
'***************',
'*a   o  o  o a*',
'* oo  oo  ooo *',
'*oo      o  o *',
'* oo aoo  oooo*',
'*oooo  oo  ooo*',
'*oo   o     oo*', 
'* oo  oo  oooo*',
'*ooooa oo  ooo*',
'*oo   o     oo*', 
'* ooo  oo  oo *',
'*a o  oo     a*',
'***************'
];
    
    
    
     
     //console.log(newMap);
     
     return newMap4;
    

    

};


//list of strings
function bmGame()
{
    
    this.updateMap = function(x,y,newChar){
        var mapLayer=this.map[y];
            
        mapLayer = mapLayer.substr(0, x) + newChar + mapLayer.substr(x + 1)
        this.map[y]=mapLayer;
            
    };
    
    this.createPlayerID = function()
    {
        this.lastID++;
        
        return this.lastID;
    };
    
    this.addPlayer=function()
    {
        newPlayer = new player('whoop');
        
        newPlayer.id=this.createPlayerID();
        
        this.players.push(newPlayer);
        
        return newPlayer;
    };
    
    this.restart=function()
    {
        this.message='';
        this.state=this.stateEnum.lobby;
        //this.players=new Array();
        //this.timeInterval=1000/60;
        this.frame=0;
        this.bombs=[];
        //this.map=createMap(); //MAP IS Y,X
        this.explosions=[];
        //this.lastID=0;
        
        //HACK:will possibly need to reinit other player data
        //notably amount of bombs and bomb size (when pickups are done)
        for(i=0;i<this.players.length;i++)
        {
            this.players[i].alive=true;
            this.players[i].maxBombs=3;
            this.players[i].explosionSize=3;
            this.players[i].lastFrame=0;
        }
    };
    
    this.start=function(){
        
        ///setup map here!
        this.map=createMap(); //MAP IS Y,X
    
        
    
        for(i=0;i<this.players.length;i++)
        {
            loc=this.getSpawn(i);
            
            this.players[i].x=loc[0];
            this.players[i].y= loc[1];
            this.players[i].alive=true;
        }
        
        this.state=this.stateEnum.game;
        
        
    }
    
    this.testForGameOver = function()
    {
        var alive=[];
        for(i=0; i<this.players.length; i++)
        {
            if(this.players[i].alive)
            {
             alive.push(this.players[i]);   
            }
        }
        
        if(alive.length>1)
        {
            
        }
        else if(alive.length==0)
        {
            //no one one - send messages to clients
            this.state=this.stateEnum.gameover;
            this.message="game over - mutual death - everyone died - newbs";
        }
        else
        {
            //someone one - send messages to clients
            this.state=this.stateEnum.gameover;
            this.message=this.generateWinMessage(alive[0]);
        }
    }
    
    this.generateWinMessage = function(winner)
    {
        return winner.name + ' laid the smackdown.'
        
    }
    
    this.tryToExpandExplosion = function(startX,startY,expandX,expandY,distance)
    {
        //TRY TO KILL
        for(playerIndex=0;playerIndex < this.players.length;playerIndex++)
        {
            
            
            //HACK:if want these anywhere else.. move this code
            playerSquareX=Math.floor(this.players[playerIndex].x + (increment/2));
            playerSquareY=Math.floor(this.players[playerIndex].y + (increment /2));
            
            /*
            console.log('trying to kill ' + playerIndex + '::' + 
                        playerSquareX + ',' + playerSquareY
                         + '-' + startX  + ',' + startY
                        );*/
            
            if(playerSquareX==startX &&
            playerSquareY==startY )
            {
                if(this.players[playerIndex].alive)
                {
                    //kill player - currently just setting alive to false.. should send message or something
                    //
                    this.players[playerIndex].alive=false;
                    console.log('KILL!!!');
                    
                }
                else{
                    console.log('already dead');
                }
            }
        }
        
        this.testForGameOver();
        
        //expand the explosion
        siteContent = this.map[startY][startX];
        
        if(siteContent=='*')
        {
            //do nothing - solid
        }
        else if(siteContent=='o')
        {
            //console.log('DESTROY!!!');
            //smashable - destroy smashable, add explosion and stop expanding.
            //console.log(this.map[startY]);
            
            newExplosion = new explosion(startX,startY);
            
            this.explosions.push(newExplosion);
            
            
            
            var replacement= ' ';
            
            //Randomly decide if it should drop a gift
            var dropRateExplosions = 0.2;
            var dropRateBombs=0.2;
            
            
            if(Math.random() < dropRateExplosions)
            {
                replacement='x';
            }
            else if(Math.random() < dropRateBombs)
            {
                replacement='b';
            }
            
            //replacement='b';
            
            //console.log(this.map[startY]);
            //console.log('DONE DESTROY!!!');
            this.updateMap(startX,startY,replacement);
            
            
            
            
        }
        else // if(siteContent==' ') - this handles empties and spawn points
        {
            //empty, add explosion and expand through
            
            newExplosion = new explosion(startX,startY);
            
            this.explosions.push(newExplosion);
            
            if(distance > 0)
            {
                this.tryToExpandExplosion(startX+expandX,startY+expandY,expandX,expandY,distance-1);
            }
        }
    
    }
    
    this.explodeBomb = function(bomb)
    {
        var bombSize=bomb.explosionSize;
        
        this.tryToExpandExplosion(bomb.x,bomb.y,1,0,bombSize);
        this.tryToExpandExplosion(bomb.x,bomb.y,-1,0,bombSize);
        this.tryToExpandExplosion(bomb.x,bomb.y,0,1,bombSize);
        this.tryToExpandExplosion(bomb.x,bomb.y,0,-1,bombSize);
        
    }
    
    this.getPlayerByID = function(id){
        //console.log(id);
        
        for(playerIndex=0;playerIndex<this.players.length;playerIndex++)
        {
           // console.log('player - ' + this.players[playerIndex]);
            if(this.players[playerIndex].id==id)
            {
                return this.players[playerIndex];
            }
        }
        
        //very weird
        //hack:handle better
        console.log('could not locate player by id ' + id);
        return null;
    }
    
    this.updatePlayerInput=function (id,upKey,downKey,leftKey,rightKey,dropBombKey)
    {
        var player=this.getPlayerByID(id);
        
        player.upKey=upKey;
        player.downKey=downKey;
        player.leftKey=leftKey;
        player.rightKey=rightKey;
        player.dropBombKey=dropBombKey;
        
        player.lastFrame=this.frame;
    };
    
    this.getPlayerBombs=function(index)
    {
        //console.log('finding bombs ' + this.bombs.length);
        playerBombs=[];
        
        for(i=0;i< this.bombs.length;i++)
        {
            //console.log(' checking index ' + this.bombs[i].playerIndex + ' ' + index);
            
            if(this.bombs[i].playerIndex==index){
              //  console.log('found');
                playerBombs.push(this.bombs[i]);
               // console.log('added');
            }
            
        }
        //console.log('player bombs ' + playerBombs.length);
        
        return playerBombs;
        
    }
    
    this.cheskSquareIsFree = function(x,y)
    {
        siteContent = this.map[y][x];
        //console.log(siteContent);
        
        if(siteContent=='*'|| siteContent=='o')
        {
            //blocked
            return false;
        }
        
        
        for(i =0;i< this.bombs.length;i++)
        {
            console.log(this.bombs[i].x + ' ' + this.bombs[i].y);
            if(this.bombs[i].x==x && this.bombs[i].y==y)
            {
                return false;
            }
            
        }
        return true;
        
        
        
    }
    
    this.processUpdate=function()
    {
        if(this.state== this.stateEnum.game)
        {
            //UPDATE BOMBS
            for(bombIndex=this.bombs.length-1;bombIndex >=0 ;bombIndex--)
            {
                this.bombs[bombIndex].timeToLive-=1;
                
                if(this.bombs[bombIndex].timeToLive<0)
                {
                    this.explodeBomb(this.bombs[bombIndex]);
                    this.bombs.splice(bombIndex,1);
                    
                }
            }   
                
            //UPDATE EXPLOSIONS
            for(expIndex=this.explosions.length-1;expIndex >=0 ;expIndex--)
            {
                this.explosions[expIndex].timeToLive-=1;
                
                if(this.explosions[expIndex].timeToLive<0)
                {
                    this.explosions.splice(expIndex,1);
                    
                }
            }   
            
            //UPDATE PLAYERS
            this.frame=this.frame+1;
            for(playerIndex=0;playerIndex<this.players.length;playerIndex++)
            {
                
                p = this.players[playerIndex];
                
                if(p.alive)
                {
                    increment=0.1;
                    
                    posX = p.x % 1;
                    posY = p.y % 1;
                    
                    minThreshold=0.05;
                    maxThreshold = 1-minThreshold;
                    
                    var moving=false;
                    
                    if((posX >= minThreshold  && posX <= maxThreshold) ||
                       (posY >= minThreshold && posY <= maxThreshold))
                    {
                        moving=true;
                    }
                    
                       
                        
                    
                    //if (playerIndex==0) console.log(moving + ' ' + posX + ',' + posY + ':');
                    
                    //dirty hack to snap the player into position when they change axis
                    if(p.facing==0 || p.facing==180)
                    {
                     //snap to
                        
                        if(posX < 0.5)
                        {
                            p.x = p.x-posX;
                        }
                        else{
                             p.x = p.x-posX + 1;
                        }
                            
                    }
                    else{
                        
                        if(posY < 0.5)
                        {
                            p.y =p.y-posY;
                        }
                        else{
                             p.y = p.y-posY + 1;
                        }
                        
                    }
                    
                    
                    if(moving)
                    {
                        if(p.facing==0)
                        {
                            if(posY >= minThreshold)
                            {
                                p.y-=increment;
                            }
                            else{
                                //console.log('no 1');
                            }
                        }
                        else if(p.facing==90)
                        {
                            if(posX >= minThreshold)
                            {
                                p.x+=increment;
                            }
                            else{
                                //console.log('no 2');
                            }
                        }
                        else if(p.facing==180)
                        {
                            if(posY >= minThreshold)
                            {
                                p.y+=increment;
                            }
                            else{
                                //console.log('no 3');
                            }
                        }
                        else if(p.facing==270)
                        {
                            if(posX >= minThreshold)
                            {
                                p.x-=increment;
                            }
                            else{
                                //console.log('no 4');
                            }
                        }
                       
                    }
                    
                    
                    //instead of testing for !moving, could rerun the test to see if they are now in a complete square
                    //if they are then we can allow a new move command
                    
                    //hack:work out where they are. (increment to make sure we arent just slightly out of the square)
                    
                    //HACK:if want these anywhere else.. move this code
                    playerSquareX=Math.floor(p.x + (increment/2));
                    playerSquareY=Math.floor(p.y + (increment /2));
                    
                    
                    //check for gifts
                    squareContent = this.map[playerSquareY][playerSquareX];
                    if(squareContent=='x')
                    {
                        //console.log('EXPLOSION - increase')
                        p.explosionSize = p.explosionSize+1;
                        //console.log('EXPLOSION - increase' + p.explosionSize)
                        
                        //change the square to a ' '
                        this.updateMap(playerSquareX,playerSquareY,' ');
                        
                    }
                    else if (squareContent=='b')
                    {
                        console.log('max bombs - increase')
                        
                        p.maxBombs++;
                        this.updateMap(playerSquareX,playerSquareY,' ');
                    }
        
                    
                    if(!moving)
                    {
                        if(p.rightKey)
                        {
                            if(this.cheskSquareIsFree(playerSquareX+1,playerSquareY))
                            {
                                p.x+=increment;
                                p.facing=90;
                            }
                        }
                        else if(p.leftKey)
                        {
                             if(this.cheskSquareIsFree(playerSquareX-1,playerSquareY))
                            {
                                p.x-=increment;
                                p.facing=270;
                            }
                        }
                        
                        if(p.upKey)
                        {
                            if(this.cheskSquareIsFree(playerSquareX,playerSquareY-1))
                            {
                                p.y-=increment;
                                p.facing=0;
                            }
                        }
                        else if(p.downKey)
                        {
                            if(this.cheskSquareIsFree(playerSquareX,playerSquareY+1))
                            {
                                p.y+=increment;
                                p.facing=180;
                            }
                        }
                    }
                    
                    
                    if(p.dropBombKey)
                    {
                        
                        if(this.cheskSquareIsFree(playerSquareX,playerSquareY))
                        {
                            //console.log('tryingtodrop for ' + i );
                            //HACK:if player can drop bomb
                            
                            //HACK!!!! -weird.. i is getting reassigned inside getPlayerbombs (i think)
                            
                            playerBombs=this.getPlayerBombs(playerIndex);
                            
                            console.log('player bombs length - '  + playerBombs.length);
                            
                            if(playerBombs.length < p.maxBombs)
                            {
                                b = new bomb(playerIndex, p.explosionSize, playerSquareX, playerSquareY)
                                this.bombs.push(b)
                                
                                console.log('bomb added!!!!' + b.playerIndex + ' ' + playerIndex);
                            }
                        }
                    }
                }
            }
            //console.log(this.players[0].x + ',' + this.players[0].y);
        };
    };
    
    this.getSpawn=function(index)
    {
        //console.log('1');
        /*
        if(index==1){
            return [1,1];
        }
        else
        {
            return [9,6];
            
        }
        */
        spawns=[];
        
        //hack:pretty inefficient - do it for each one - doesnt matter, only happens 4 times per game
        for(y=0;y<this.map.length;y++)
        {
            for(x=0;x<this.map[y].length;x++)
            {
                if(this.map[y][x]=='a')
                {
                    spawns.push([x,y]);
                    console.log('found a spawn');
                }
            }
        }
        console.log('123');
        console.log(spawns[index]);
        return spawns[index];
    
        
        
    }
    
    
    this.stateEnum=
    {
        lobby:0,
        game:1,
        gameover:2
    }
    
    this.message='';
    this.state=this.stateEnum.lobby;
    this.players=new Array();
    this.timeInterval=1000/60;
    this.frame=0;
    this.bombs=[];
    
    ///moving to start
    //this.map=createMap(); //MAP IS Y,X
    this.explosions=[];
    this.lastID=0;
    
    console.log(this.map);

    //map = this.map;
  
    console.log('done map');
    
    //HACK:bit weird, start the loop, in processUpdate we check that the game is actually running
    instance=this;
    setInterval(function(){instance.processUpdate()},this.timeInterval);
        
    
    //MOVE THIS !!!!
    /*
    for(i=0;i<playerNames.length;i++)
    {
        newPlayer = new player(playerNames[i]);
        loc=this.getSpawn(i);
        
        
        newPlayer.x=loc[0];
        newPlayer.y= loc[1];
        
        this.players[i]=newPlayer;
    }
    */

}

function player(name)
{
    this.id=0;
    this.name=name;
    this.x=0;
    this.y=0;
    this.upKey=false;
    this.downKey=false;
    this.leftKey=false;
    this.rightKey=false;
    this.facing='0';// in deg
    this.maxBombs=3;
    this.explosionSize=3;
    this.alive=false;
    this.lastFrame=0;
    
    
    console.log("creating player");
}

//HACK:player index probably isnt working
function bomb(playerIndex,explosionSize,x,y)
{
    //console.log('exp size - ' + explosionSize);
    //HACK:should this be the size that the player is at when dropping, or when exploding
    this.explosionSize = explosionSize;
    this.playerIndex=playerIndex;
    this.x=x;
    this.y=y;
    this.timeToLive=3 * 60;
    
    
    console.log("creating bomb " + this.playerIndex);
}

function explosion(x,y)
{
    this.x=x;
    this.y=y;
    this.timeToLive=2 * 60;
    
}

