'use strict';

var map = null;
var tileLayer = null;

var worldEntities = null;

var player = null;

var key = null;
var door = null;
var gravitySmasher = null;
var box = null;

var menuBoard = null;
var menu = null;

var levelUpdated = null;

var currentLevel = 1;
var maxLevel = 9
var gravityMag = 2000;

// direction are with respect to world walls,  LEFT means gravity is in west direction 
var GRAVITY = [
    new Phaser.Point(0, 0),     // no gravity
    new Phaser.Point(-gravityMag, 0),       // LEFT
    new Phaser.Point(gravityMag, 0),        // RIGHT
    new Phaser.Point(0, -gravityMag),       // UP
    new Phaser.Point(0, gravityMag)     // DOWN
];
// Global Constant
var MAXSPEED = 200; // pixel/second
var ACCELERATION = 1000;
var DRAG = {x : 1000, y: 1000};
var JUMP = 600;
var ANGLE = [0, 90, 270, 180, 0];

var style = { font: "bold 32px Arial", fill: "#000", align: "center" };
var text_style = { font: "bold 20px Arial", fill: "#000", align: "center" };

// direction convention
var UP = Phaser.UP;
var DOWN = Phaser.DOWN;
var LEFT = Phaser.LEFT;
var RIGHT = Phaser.RIGHT;

var jumpRatio = 4; //  it is ratio of maxspeed of jump / run

GRANT.Game = function (game) {

	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

};

GRANT.Game.prototype = {

	create: function () {

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        this.world.setBounds(0, 0, 1200, 500);
        worldEntities = this.add.group();

        gravitySmasher = this.add.group();
        var lastLevel = parseInt(window.localStorage.getItem('level'));

        if (currentLevel > lastLevel || currentLevel > maxLevel) {
            currentLevel = lastLevel;
        }

        // for avoiding multiple calls from collision from gate
        levelUpdated = false;

        map = this.add.tilemap('level' + currentLevel);

        map.addTilesetImage('ground');
        map.addTilesetImage('grass');
        map.addTilesetImage('key');
        map.addTilesetImage('spike');
        map.addTilesetImage('door');
        map.addTilesetImage('obstacle1');
        if (currentLevel > 4)
            map.addTilesetImage('obstacle2');

        tileLayer = map.createLayer("Tile Layer");
        tileLayer.resizeWorld();

        map.createFromObjects('Object Layer', 16, 'key', 0, true, false, worldEntities);
        map.createFromObjects('Object Layer', 17, 'door', 0, true, false, worldEntities);
        map.createFromObjects('Object Layer', 23, 'player', 0, true, false, worldEntities);
        if (currentLevel > 4)
            map.createFromObjects('Object Layer', 28, 'obstacle2', 0, true, false, gravitySmasher);

        map.setCollisionBetween(1, 14, true, tileLayer);
        map.setCollisionBetween(28, 29, true, tileLayer);
        map.setCollisionBetween(30, 39, true, tileLayer);
        map.setTileIndexCallback(2, this.spikeHandler, this, tileLayer);

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.time.advancedTiming = true;
        
        // activating Gravity
        this.physics.arcade.gravity.setTo(GRAVITY[Phaser.DOWN].x, GRAVITY[Phaser.DOWN].y);

        this.loadObjectsFromMap();

        // ==================================================================================
	},

	update: function () {

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        this.physics.arcade.collide(player, tileLayer);
        this.physics.arcade.collide(key, player, this.keyHandler);
        if (gravitySmasher!=null && gravitySmasher.children.length) {
            this.physics.arcade.collide(gravitySmasher, tileLayer);
            this.physics.arcade.collide(gravitySmasher, player, this.playerDied, null, this);
        }

        var playerBody = player.body;
        var touching = player.body.touching;
        var blocked = player.body.blocked;
        var playerVelocity = playerBody.velocity;

        var direction = player.direction;
        this.game.physics.arcade.gravity.copyFrom(GRAVITY[direction]);
        player.angle = ANGLE[direction];

        // player direction handling =================================================================
        if (this.isPlayerOnFeet()) {
            if (this.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.setplayerDirection(LEFT);
                this.switchGravitySmasher(LEFT);
            }
            else if (this.input.keyboard.isDown(Phaser.Keyboard.W)) {
                this.setplayerDirection(UP);
                this.switchGravitySmasher(UP);
            }
            else if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.setplayerDirection(RIGHT);
                this.switchGravitySmasher(RIGHT);
            }
            else if(this.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.setplayerDirection(DOWN);
                this.switchGravitySmasher(DOWN);
            }
        } 
        // ===========================================================================================

        // Physical Control ==========================================================================
        if (player.direction == DOWN || player.direction == UP) {
            //  if Player is not on floor he is allowed to jump on X axis
            if ((!touching.left || !blocked.left) && this.moveLeft()) {
                playerBody.acceleration.x = -ACCELERATION;
                if (player.direction == DOWN && playerVelocity.x < -10 && player.facing != 'left') {
                    player.animations.play('left');
                    player.facing = 'left';
                }
                else if (player.direction == UP && playerVelocity.x < -10 && player.facing != 'right') {
                    player.animations.play('right');
                    player.facing = 'right';
                }
            }
            else if ((!touching.right || !blocked.right) && this.moveRight()) {
                playerBody.acceleration.x = ACCELERATION;
                if (player.direction == DOWN && playerVelocity.x > 10 && player.facing != 'right') {
                    player.animations.play('right');
                    player.facing = 'right';
                }
                else if (player.direction == UP && playerVelocity.x > 10 && player.facing != 'left') {
                    player.animations.play('left');
                    player.facing = 'left';
                }
            }
            else {
                playerBody.acceleration.x = 0;
                if (playerVelocity.x < Math.abs(10)) {
                    player.animations.stop();
                    if (player.facing == 'left') player.animations.frame = 0;
                    else if (player.facing == 'right') player.animations.frame = 5;
                    player.facing = 'idle';
                }
            }
        }

        if (player.direction == LEFT || player.direction == RIGHT) {
            //  if Player is not on wall he is allowed to jump on Y axis
            if ((!touching.up || !blocked.up) && this.moveUp()) {
                playerBody.acceleration.y = -ACCELERATION;
                if (player.direction == LEFT && playerVelocity.y < -10 && player.facing != 'left') {
                    player.animations.play('left');
                    player.facing = 'left';
                }
                else if (player.direction == RIGHT && playerVelocity.y < -10 && player.facing != 'right') {
                    player.animations.play('right');
                    player.facing = 'right';
                }
            }
            else if ((!touching.down || !blocked.down) && this.moveDown()) {
                playerBody.acceleration.y = ACCELERATION;
                if (player.direction == LEFT && playerVelocity.y > 10 && player.facing != 'right') {
                    player.animations.play('right');
                    player.facing = 'right';
                }
                else if (player.direction == RIGHT && playerVelocity.y > 10 && player.facing != 'left') {
                    player.animations.play('left');
                    player.facing = 'left';
                }
            }
            else {
                playerBody.acceleration.y = 0;
                if (playerVelocity.y < Math.abs(3)) {
                    player.animations.stop();
                    if (player.facing == 'left') player.animations.frame = 0;
                    else if (player.facing == 'right') player.animations.frame = 5;
                    player.facing = 'idle';
                }
            }
        }

        if ( !blocked.down && !blocked.up && !blocked.left && !blocked.right) {
            player.animations.stop();
            player.facing = 'idle';
        }

        if (this.paused()) {
            this.managePause();
        }

        if (this.enterDown() && this.canPlayerEnterDoor(door, player)) {
            if (player.hasKey){
                player.kill();
                door.animations.play('open');
                this.levelComplete();
            }
            else {
                console.log("You need a key");
            }
        }

        // Gravity Smasher control
        if (gravitySmasher != null && gravitySmasher.children.length) {

            gravitySmasher.forEach(function(smasher) {

                if (smasher.path == 'horizontal') {
                    smasher.body.acceleration.y = 0;
                    smasher.body.velocity.y = 0;
                }
                else if (smasher.path == 'vertical') {
                    smasher.body.acceleration.x = 0;
                    smasher.body.velocity.x = 0;
                }
            })
        }
	},
    // ==========================================================================================

	quitGame: function (pointer) {

		map = null;
        tileLayer = null;

        worldEntities = null;

        player = null;

        key = null;
        door = null;
        gravitySmasher = null;
        box = null;

		this.state.start('MainMenu');
	},

    // ========================  Controls =================================================

    moveLeft : function() {
        return this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
    },

    moveRight : function() {
        return this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
    },

    moveUp : function() {
        return this.input.keyboard.isDown(Phaser.Keyboard.UP);
    },

    moveDown : function() {
        return this.input.keyboard.isDown(Phaser.Keyboard.DOWN);
    },

    enterDown : function(duration) {
        return this.input.keyboard.downDuration(Phaser.Keyboard.ENTER, duration);
    },

    jump : function(duration) {
        return this.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, duration);
    },

    paused : function(duration) {
        return this.input.keyboard.downDuration(Phaser.Keyboard.P, duration);
    },

    switchGravitySmasher : function(direction) {

        if (gravitySmasher!=null && gravitySmasher.children.length) {
            gravitySmasher.forEach(function(smasher) {
                
                if (smasher.path == 'horizontal') {
                    if (smasher.inverted && ((direction == LEFT && smasher.direction == 'LEFT') || (direction == RIGHT && smasher.direction == 'RIGHT'))) {
                        smasher.body.gravity.x *= -1;
                        smasher.direction = smasher.direction == "LEFT" ? "RIGHT" : "LEFT";
                    }
                    else if (!smasher.inverted && ((direction == LEFT && smasher.direction == 'RIGHT') || (direction == RIGHT && smasher.direction == 'LEFT'))) {
                        smasher.body.gravity.x *= -1;
                        smasher.direction = smasher.direction == "LEFT" ? "RIGHT" : "LEFT";
                    }
                }
                else if (smasher.path == "vertical") {
                    if (smasher.inverted && ((direction == UP && smasher.direction == 'UP') || (direction == DOWN && smasher.direction == 'DOWN'))) {
                        smasher.body.gravity.y *= -1;
                        smasher.direction = smasher.direction == "UP" ? "DOWN" : "UP";
                    }
                    else if (!smasher.inverted && ((direction == UP && smasher.direction == 'DOWN') || (direction == DOWN && smasher.direction == 'UP'))) {
                        smasher.body.gravity.y *= -1;
                        smasher.direction = smasher.direction == "UP" ? "DOWN" : "UP";
                    }
                }

            })
        }
    },

    setplayerDirection : function(direction) {
        var push = Math.abs(player.height - player.width)/2 ;
        var lastFrame = player.animations.frame;

        player.body.acceleration.x = 0;
        player.body.acceleration.y = 0;

        switch (direction) {
            case UP :
                player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED*jumpRatio);
                // if player at top-left or top-right has feet on y-axis and change direction to up is called
                // give player a push so that after rotation its leg are above ground
                if (player.direction == LEFT || player.direction == RIGHT) {
                    player.y += push;
                }
                
                if (player.direction == DOWN) {
                    if (lastFrame == 0) player.animations.frame = 5;
                    else if (lastFrame == 5) player.animations.frame = 0;
                }
                
                player.direction = direction;
                player.body.setSize(player.body.sprite.width, player.body.sprite.height, 0, 0);

                break;
            case DOWN :
                player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED*jumpRatio);
                // if player at down-left or down-right has feet on y-axis and change direction to down is called
                // give player a push so that after rotation its leg are above ground
                if (player.direction == LEFT || player.direction == RIGHT) {
                    player.y -= push;
                }

                if (player.direction == UP) {
                    if (lastFrame == 0) player.animations.frame = 5;
                    else if (lastFrame == 5) player.animations.frame = 0;
                }

                player.direction = direction;
                player.body.setSize(player.body.sprite.width, player.body.sprite.height, 0, 0);

                break;
            case LEFT :
                player.body.maxVelocity.setTo(MAXSPEED*jumpRatio, MAXSPEED);
                // if player at down-left or top-left has feet on x-axis and change direction to left is called
                // give player a push so that after rotation its leg are above ground
                if (player.direction == UP || player.direction == DOWN) {
                    player.x += push;
                }

                if (player.direction == RIGHT) {
                    if (lastFrame == 0) player.animations.frame = 5;
                    else if (lastFrame == 5) player.animations.frame = 0;
                }

                player.direction = direction;
                player.body.setSize(player.body.sprite.height, player.body.sprite.width, 0, 0);
                break;
            case RIGHT :
                player.body.maxVelocity.setTo(MAXSPEED*jumpRatio, MAXSPEED);
                // if player at down-right or top-right has feet on x-axis and change direction to right is called
                // give player a push so that after rotation its leg are above ground
                if (player.direction == UP || player.direction == DOWN) {
                    player.x -= push;
                }

                if (player.direction == LEFT) {
                    if (lastFrame == 0) player.animations.frame = 5;
                    else if (lastFrame == 5) player.animations.frame = 0;
                }

                player.direction = direction;
                player.body.setSize(player.body.sprite.height, player.body.sprite.width, 0, 0);
                break;
            default :
                console.log("This should not Happen there must be four direction only");
                player.direction = 0;
                player.body.maxVelocity.setTo(0, 0);
                player.body.setSize(0, 0, 0, 0);
                break;
        }
    },

    // we may not need this function
    getplayerDirection : function() {
        return player.direction;
    },

    isPlayerOnFeet : function() {
        var direction = player.direction;
        var blocked = player.body.blocked;
        var touching = player.body.touching;
        if (direction == UP && (blocked.up || touching.up)) return true;
        if (direction == DOWN && (blocked.down || touching.down)) return true;
        if (direction == LEFT && (blocked.left || touching.left)) return true;
        if (direction == RIGHT && (blocked.right || touching.right)) return true;
    },

    loadObjectsFromMap : function() {
        var _this = this;

        worldEntities.forEach(function(entity) {

            if (entity.name == "player") {
                player = entity;

                // player = _this.add.sprite(entity.x, entity.y, 'player');

                _this.camera.follow(player);

                player.animations.add('left', [0, 1, 2, 3], 10, true);

                player.animations.add('turn', [4], 10, true);

                player.animations.add('right', [5, 6, 7, 8], 10, true);

                _this.physics.enable(player, Phaser.Physics.ARCADE);  // Starts physics on player body
                player.anchor.setTo(0.5, 0.5);
                player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED*jumpRatio);
                player.body.drag.setTo(DRAG.x, DRAG.y);
                player.body.friction.setTo(1, 1);
                player.mass = 100;
                player.facing = 'turn';
                player.animations.frame = 4;
                player.hasKey = false;

                player.direction = Phaser.DOWN;

                player.body.collideWorldBounds = true;
            }
            else if (entity.name == "key") {
                key = entity;
                // key = _this.add.sprite(entity.x, entity.y, 'key');
                _this.physics.enable(key, Phaser.Physics.ARCADE);
                key.body.allowGravity = false;
                key.body.immovable = true;
            }
            else if (entity.name == "door") {
                door = entity;
                // door = _this.add.sprite(entity.x, entity.y, 'door');

                door.animations.add('close', [0], 0, true);
                door.animations.add('open', [1], 0, true);

                _this.physics.enable(door, Phaser.Physics.ARCADE);
                door.body.allowGravity = false;
                door.body.immovable = true;
            }
        });

        if (gravitySmasher!=null &&  gravitySmasher.children.length) {

            gravitySmasher.forEach(function(smasher) {
                _this.physics.enable(smasher, Phaser.Physics.ARCADE);

                smasher.body.maxVelocity.setTo(MAXSPEED*4, MAXSPEED*4);
                smasher.body.friction.setTo(0, 0);
                smasher.mass = 100;

                if (smasher.path == "vertical") {
                    smasher.body.drag.x = 10*DRAG.x;
                }
                else if (smasher.path == "horizontal") {
                    smasher.body.drag.y = 10*DRAG.y;
                }

                smasher.body.allowGravity = true;
                smasher.body.immovable = true;

                smasher.body.gravity.x = smasher.gravityX;
                smasher.body.gravity.y = smasher.gravityY;
            })
        }
    },

    playerDied : function() {
        var menu = this.add.group();
        var _this = this;

        player.kill();
        // player.body.moves = false;
        // player.animations.stop();

        var menuHandler = function(target) {
            if (target.text == "Retry") {
                _this.reload();
            }

            if (target.text == "Menu") {
                _this.game.state.start("MainMenu");
            }
        }

        var menuBoard = this.add.sprite(this.camera.screenView.centerX , this.camera.screenView.centerY, "menuBoard");
        menuBoard.anchor.setTo(0.5, 0.5);
        menuBoard.fixedToCamera = true;

        menu.add(menuBoard);
        
        var txt = this.add.text(this.camera.screenView.centerX , this.camera.screenView.centerY - 100, "Game Over", style);
        txt.anchor.setTo(0.5, 0.5);
        txt.fixedToCamera = true;

        menu.add(txt);

        var txt = this.game.add.text(this.camera.screenView.centerX - 100, this.camera.screenView.centerY + 50, "Retry", text_style);
        txt.fixedToCamera = true; 
        txt.anchor.setTo(0.5, 0.5);
        txt.inputEnabled = true;
        txt.events.onInputDown.add(menuHandler, this);

        menu.add(txt);

        txt = this.game.add.text(this.camera.screenView.centerX + 100, this.camera.screenView.centerY + 50, "Menu", text_style);
        txt.fixedToCamera = true; 
        txt.anchor.setTo(0.5, 0.5);
        txt.inputEnabled = true;
        txt.events.onInputDown.add(menuHandler, this);

        menu.add(txt);

        return true;
    },

    levelComplete : function() {
        var menu = this.add.group();
        var _this = this;

        player.body.moves = false;
        player.animations.stop();

        _this.nextLevel();

        var menuHandler = function(target) {
            if (target.text == "Proceed") {
                this.state.restart();
            }

            if (target.text == "Menu") {
                _this.game.state.start("MainMenu");
            }
        }

        var menuBoard = this.add.sprite(this.camera.screenView.centerX , this.camera.screenView.centerY, "menuBoard");
        menuBoard.anchor.setTo(0.5, 0.5);
        menuBoard.fixedToCamera = true;

        menu.add(menuBoard);

        var txt = this.game.add.text(this.camera.screenView.centerX , this.camera.screenView.centerY - 100, "Level Completed", style);
        txt.anchor.setTo(0.5, 0.5);
        txt.fixedToCamera = true;

        menu.add(txt);

        var txt = this.game.add.text(this.camera.screenView.centerX - 100, this.camera.screenView.centerY + 50, "Proceed", text_style);
        txt.fixedToCamera = true; 
        txt.anchor.setTo(0.5, 0.5);
        txt.inputEnabled = true;
        txt.events.onInputDown.add(menuHandler, this);

        menu.add(txt);

        txt = this.game.add.text(this.camera.screenView.centerX + 100, this.camera.screenView.centerY + 50, "Menu", text_style);
        txt.fixedToCamera = true; 
        txt.anchor.setTo(0.5, 0.5);
        txt.inputEnabled = true;
        txt.events.onInputDown.add(menuHandler, this);

        menu.add(txt);
    },

    nextLevel : function() {

        if (!levelUpdated) {
            var lastLevel = parseInt(window.localStorage.getItem('level'));

            if (currentLevel == lastLevel) {
                window.localStorage.setItem('level' , currentLevel+1);
                currentLevel++;
            }
            else
                currentLevel++;

            if (currentLevel > maxLevel) {
                currentLevel = maxLevel;
            }

            levelUpdated = true;
        }
    },

    managePause : function() {
        this.game.paused = true;
        var menu = this.add.group();

        var menuBoard = this.add.sprite(this.camera.screenView.centerX , this.camera.screenView.centerY, "menuBoard");
        menuBoard.anchor.setTo(0.5, 0.5);
        menuBoard.fixedToCamera = true;

        menu.add(menuBoard);

        var txt = this.add.text(this.camera.screenView.centerX , this.camera.screenView.centerY - 100, "Paused", style);
        txt.anchor.setTo(0.5, 0.5);
        txt.fixedToCamera = true;

        menu.add(txt);

        var txt = this.add.text(this.camera.screenView.centerX , this.camera.screenView.centerY + 50, "Tap anywhere to \nContinue", text_style);
        txt.anchor.setTo(0.5, 0.5);
        txt.fixedToCamera = true;

        menu.add(txt);
        
        this.input.onDown.add(function(){
            menu.destroy();
            this.game.paused = false;
        }, this);
        
    },

    keyHandler : function( key , player) {
        key.kill();
        tileLayer.dirty = true;
        player.hasKey = true;
    },

    spikeHandler : function ( collider , spike) {
        if (collider.name == "player") {
            tileLayer.dirty = true;
            player.body.moves = false;
            this.playerDied();
            return true;
        }
        else if (collider.name == "box") {
            tileLayer.dirty = true;
            collider.body.immovable = true;
            collider.body.allowGravity = false;
            collider.body.velocity.set(0, 0);
            return true;            
        }

        if (collider.type == "gravitySmasher") {
            tileLayer.dirty = true;
            collider.body.immovable = true;
            collider.body.allowGravity = false;
            collider.body.velocity.set(0, 0);
            return true;
        }
    },

    enableGravityOnBox : function( player, box) {
        if (!box.body.allowGravity) {
            box.body.allowGravity = true;
        }
        return true;
    },

    reload : function () {
        map = null;
        tileLayer = null;

        worldEntities = null;

        player = null;

        key = null;
        door = null;

        this.state.restart();
    },

    canPlayerEnterDoor : function (door, player) {
        var d = door.getBounds();
        var p = player.getBounds();

        if ((p.x >= d.x) && (p.x + p.width) <= (d.x + d.width) && (p.y >= d.y) && (p.y + p.height) <= (d.y + d.height)) return true;
        else return false;
    },

    render : function() {
        // this.game.debug.body(player);
        // this.game.debug.text(this.time.fps, 50, 50);
    }

    // =======================================================================================
};