import GameScene from "./GameScene";

const config = {
  type: Phaser.AUTO,
  width: "100%",
  parent: "gameCanvas",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 300 } },
  },
  scene: [GameScene],
};

new Phaser.Game(config);
