'use strict';

GRANT.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

};

GRANT.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar

		var txt = this.add.text(this.game.world.centerX, this.game.world.centerY - 50, "Loading...")
		txt.anchor.setTo(0.5, 0.5);
		this.preloadBar = this.add.sprite(this.game.world.centerX - 150, this.game.world.centerY - 15, 'preloaderBar');
		this.preloadBar.anchor.setTo(0, 0.5);

		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		
		this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, the lines below won't work as the files themselves will 404, they are just an example of use.

		this.load.spritesheet('player', 'images/dude.png', 32, 48);
		this.load.spritesheet('door', 'images/door.png', 96, 128);
		this.load.spritesheet('playButton', 'images/play_button_sprite.png', 160, 50);
		this.load.spritesheet('resumeButton', 'images/resume_button_sprite.png', 160, 50);
		this.load.spritesheet('selectLevelButton', 'images/selectLevel_button_sprite.png', 160, 50);
		this.load.spritesheet('helpButton', 'images/help_button_sprite.png', 160, 50);
		this.load.image('ground', 'images/ground.png');
		this.load.image('key', 'images/key.png');
		this.load.image('spike', 'images/spike.png');
		this.load.image('grass', 'images/grass.png');
		this.load.image('obstacle1', 'images/obstacle1.png');
		this.load.image('obstacle2', 'images/obstacle2.png');
		this.load.image('sq_button', 'images/sq_button.png');
		this.load.image('menuBoard', 'images/menuBoard.png');
		this.load.image('help', 'images/help.png');
		this.load.tilemap('level1', 'level/level1.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level2', 'level/level2.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level3', 'level/level3.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level4', 'level/level4.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level5', 'level/level5.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level6', 'level/level6.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level7', 'level/level7.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level8', 'level/level8.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level9', 'level/level9.json', null, Phaser.Tilemap.TILED_JSON);

	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

		this.state.start('MainMenu');
	}

};
