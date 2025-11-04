interface Scene {
    id: number;
    getButtons(): SimpleButton[];
    update(): void;
}