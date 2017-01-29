'use strict';

var GRANT = {

    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
    music: null,

    /* Your game can check GRANT.orientated in internal loops to know if it should pause or not */
    orientated: false
};

GRANT.Boot = function (game) {
    
    window.localStorage.clear();

    window.localStorage.setItem('level', 1);
};

GRANT.Boot.prototype = {

    init: function () {

        this.input.maxPointers = 2;
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
            this.scale.setMinMax(480, 260, 1024, 600);
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
            this.scale.setMinMax(480, 260, 800, 500);
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
            this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }

    },

    preload: function () {

        //  Here we load the assets required for our preloader (in this case a background and a loading bar)

        this.load.image('preloaderBar', 'images/preloader_bar.png');

    },

    create: function () {

        this.game.stage.backgroundColor = 0xa4a4a4;

        this.state.start('Preloader');

    },

    gameResized: function (width, height) {

        //  This could be handy if you need to do any extra processing if the game resizes.
        //  A resize could happen if for example swapping orientation on a device or resizing the browser window.
        //  Note that this callback is only really useful if you use a ScaleMode of RESIZE and place it inside your main game state.      
    },

    enterIncorrectOrientation: function () {

        GRANT.orientated = false;

        document.getElementById('orientation').style.display = 'block';

    },

    leaveIncorrectOrientation: function () {

        GRANT.orientated = true;

        document.getElementById('orientation').style.display = 'none';

    }

};