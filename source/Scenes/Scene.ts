interface Scene {
    id: number;
    getButtons(): Button[];
    update(): void;
}