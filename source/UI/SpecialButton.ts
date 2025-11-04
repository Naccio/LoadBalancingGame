/// <reference path='../Utilities.ts' />
/// <reference path='SimpleButton.ts' />

class SpecialButton implements Button {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public onClick: () => void,
        public draw: (h: boolean, c: CanvasRenderingContext2D) => void) { }
}