'use strict';

var activateResume = false;

GRANT.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;
	this.resumeButton = null;
	this.selectLevelButton = null;
	this.helpButton = null;
};

GRANT.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		var y = this.game.camera.screenView.centerY - 100;
		this.playButton = this.add.button(this.game.camera.screenView.centerX, y, 'playButton', this.startGame, this, 1, 0, 0);
		this.playButton.anchor.set(0.5);
		if (activateResume) {
			y += ( 25 + 30 );
			this.resumeButton = this.add.button(this.game.camera.screenView.centerX, y , 'resumeButton', this.resumeLevel, this, 1, 0, 0);
			this.resumeButton.anchor.set(0.5);
		}
		y += ( 25 + 30 );
		this.selectLevelButton = this.add.button(this.game.camera.screenView.centerX, y , 'selectLevelButton', this.selectLevel, this, 1, 0, 0);
		this.selectLevelButton.anchor.set(0.5);

		y += (25 + 30);
		this.helpButton = this.add.button(this.game.camera.screenView.centerX, y , 'helpButton', this.showHelp, this, 1, 0, 0);
		this.helpButton.anchor.set(0.5);
		// this.state.start('Game');

	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {
		activateResume = true;

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)

		//	And start the actual game
		currentLevel = 1;
		this.state.start('Game');        //<------ for demo purpose it is in create callback

	},

	resumeLevel : function(pointer) {
		// resume from last level completed
		this.state.start('Game');
	},

	selectLevel : function(pointer) {

		activateResume = true;
		this.state.start('LevelManager');
	},

	showHelp : function(pointer) {

		var x = this.game.camera.screenView.centerX;
		var y = this.game.camera.screenView.centerY;

		var help = this.add.sprite(x, y, 'help');
		help.anchor.set(0.5);
		help.inputEnabled = true;

		this.input.onDown.add(function(){
            help.destroy();
        }, this);
	}

};
