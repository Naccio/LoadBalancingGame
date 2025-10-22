/// <reference path='Button.ts' />

class GameUI {
    public buttons: Button[] = [];

    click(x: number, y: number) {
        this.buttons.some((button) => {
            if (x > button.x - button.width / 2 && x < button.x + button.width / 2 &&
                y > button.y - button.height / 2 && y < button.y + button.height / 2) {
                button.onClick();
                return true;
            }
        });
    }
}