'use strict';

var buttons;
var buttonGroup;
var counter;

GRANT.LevelManager = function (game) {

	this.music = null;

};

GRANT.LevelManager.prototype = {

	create: function () {

		var lastLevel = parseInt(window.localStorage.getItem('level'));

		counter = 0;
		buttons = [];
		buttonGroup = this.game.add.group();

		var cx = this.game.camera.screenView.centerX;
		var cy = this.game.camera.screenView.centerY;

		for (var i = -1; i <= 1; i++) {
			for (var j = -1; j <= 1; j++) {

				counter++;
				var btn = this.game.add.sprite(cx + j*60, cy + i*60, 'sq_button', text_style);
				btn.anchor.setTo(0.5, 0.5);
				btn.name = counter;
				btn.level = counter;
				if (counter <= lastLevel) {
					btn.inputEnabled = true;
					btn.events.onInputDown.add(this.startGame, this);
				}
				else {
					btn.alpha = 0.5;
				}
				var txt = this.game.add.text(cx + j*60, cy + i*60, counter, text_style);
				txt.anchor.setTo(0.5, 0.5);

				buttons.push(btn);
				buttonGroup.add(btn);
				buttonGroup.add(txt);
			}
		}
	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (target) {
		currentLevel = target.level;

		this.state.start('Game');

	}

};
