class UpgradesTracker {
    private readonly upgrades = [100, 200, 300, 500, 700, 1000, 1300, 1700, 2100, 2600, 3100, 3700, 4300, 5000];

    private nextUpgradeIndex = 0;

    public upgradesAvailable = 0;
    public selectedUpgrade?: string;

    public get nextUpgrade() {
        if (this.nextUpgradeIndex >= this.upgrades.length) {
            return Infinity
        }
        return this.upgrades[this.nextUpgradeIndex];
    };

    public increaseUpgrades() {
        this.upgradesAvailable += 1;
        this.nextUpgradeIndex += 1;
    }
}