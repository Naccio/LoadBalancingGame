/// <reference path='../UI/Button.ts' />

interface Scene {
    id: number;
    getButtons(): Button[];
    update(): void;
}