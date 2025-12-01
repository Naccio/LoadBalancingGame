class Defaults {
    public static readonly accentColor = '#ff0000';
    public static readonly accentColorMuted = '#fa8072';
    public static readonly attackerBorderColor = '#000000';
    public static readonly attackerColor = '#333333';
    public static readonly attackerConnectionColor = '#696969';
    public static readonly attackerTextColor = '#ffffff';
    public static readonly backgroundBorderColor = '#02467f';
    public static readonly backgroundColor = '#0360ae';
    public static readonly clientBorderColor = '#696969';
    public static readonly clientColor = '#808080'
    public static readonly clientConnectionColor = '#a9a9a9';
    public static readonly clientSize = 30;	//pixels (diameter)
    public static readonly clientSpeed = 2;	//messages per second
    public static readonly clientTextColor = '#ffffff';
    public static readonly dangerColor = '#ff0000';
    public static readonly dangerColorDark = '#b22222';
    public static readonly dangerColorMuted = '#ff6347';
    public static readonly dangerColorMutedDark = '#cd5c5c';
    public static readonly defaultColor = '#000000';
    public static readonly gameLength = 5; //minutes
    public static readonly highlightColor = '#add8e6';
    public static readonly highlightWidth = 3; // pixels
    public static readonly maxClientWaitTime = 9; //seconds
    public static readonly messageAckBorderColor = '#32cd32';
    public static readonly messageAckColor = '#00ff00';
    public static readonly messageNackBorderColor = Defaults.dangerColorMutedDark;
    public static readonly messageNackColor = Defaults.dangerColorMuted;
    public static readonly messageReqBorderColor = '#87ceeb';
    public static readonly messageReqColor = '#add8e6';
    public static readonly messageSize = 6;	//pixels (diameter)
    public static readonly messageVelocity = 200; //pixels per second
    public static readonly primaryColor = '#ffffff';
    public static readonly primaryColorMuted = '#dddddd';
    public static readonly primaryColorMutedTransparent = 'rgba(200,200,200,.5)';
    public static readonly primaryColorTransparent = 'rgba(255,255,255,.6)';
    public static readonly secondaryColor = '#333333';
    public static readonly secondaryColorTransparent = 'rgba(0,0,0,.1)';
    public static readonly secondaryColorMuted = '#a9a9a9';
    public static readonly serverCapacity = 80; //messages
    public static readonly serverBorderColor = '#004500';
    public static readonly serverColor = '#008000';
    public static readonly serverSize = 40;	//pixels (side)
    public static readonly serverSpeed = 3.5; //messages per second
    public static readonly successColor = '#00ff00';

    public static readonly gameModes = { MENU: 0, GAME: 1, GAME_OVER: 2, CREDITS: 3, PAUSE: 4, UPGRADE: 5, TUTORIAL: 6 };
    public static readonly serverDefaults = {
        size: Defaults.serverSize,
        color: Defaults.serverColor,
        borderColor: Defaults.serverBorderColor,
        queueColor: Defaults.serverColor,
        queueBorderColor: Defaults.serverBorderColor,
        speedColor: Defaults.successColor,
        speedBorderColor: Defaults.serverBorderColor,
    };
    public static readonly serverDisabledDefaults = {
        size: Defaults.serverSize,
        color: '#DDDDDD',
        borderColor: '#999999',
        queueColor: '#BBBBBB',
        queueBorderColor: '#999999',
        speedColor: '#BBBBBB',
        speedBorderColor: '#999999',
    }
}