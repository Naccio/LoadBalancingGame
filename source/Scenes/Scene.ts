/// <reference path='../UI/Button.ts' />

interface Scene {
    id: number;
    getButtons(): Button[];
    draw(): void;
    update(): void;
}