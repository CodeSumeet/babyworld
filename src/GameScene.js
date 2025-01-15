export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.isAnimating = false;
    this.clickCount = 0;
    this.balloon = null;
    this.floatingBalloons = [];
  }

  preload() {
    this.load.image("background", "assets/Symbol 3 copy.png");
    this.load.image("pump-top", "assets/Symbol 320001.png");
    this.load.image("pump-body", "assets/Symbol 320003.png");
    this.load.image("pump-left", "assets/Symbol 320002.png");

    for (let i = 1; i <= 26; i++) {
      this.load.image(
        `balloon-${i}`,
        `assets/Symbol 1000${i < 10 ? "0" + i : i}.png`
      );
      this.load.image(
        `alphabet-${String.fromCharCode(96 + i)}`,
        `assets/Symbol 100${i < 10 ? "0" + i : i}.png`
      );
    }
  }

  createBalloonWithAlphabet(x, y, scale) {
    const container = this.add.container(x, y);
    const balloonNumber = Phaser.Math.Between(1, 10);
    const balloon = this.add.image(0, 0, `balloon-${balloonNumber}`);

    const randomChar = String.fromCharCode(97 + Phaser.Math.Between(0, 25));
    const alphabet = this.add
      .image(0, 0, `alphabet-${randomChar}`)
      .setScale(0.5);

    container.add([balloon, alphabet]).setScale(scale);
    return container;
  }

  create() {
    this.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setDepth(-10)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.balloon = this.createBalloonWithAlphabet(
      this.scale.width - 257,
      this.scale.height - 318,
      0.1
    );

    this.pumpTop = this.add
      .image(this.scale.width - 100, this.scale.height - 170, "pump-top")
      .setOrigin(0.5, 1)
      .setDisplaySize(this.scale.width / 8, this.scale.height / 3)
      .setInteractive()
      .on("pointerdown", () => {
        if (!this.isAnimating) {
          this.squeezePump();
          this.inflateBalloon();
        }
      });

    this.pumpBody = this.add
      .image(this.scale.width - 100, this.scale.height - 50, "pump-body")
      .setOrigin(0.5, 1)
      .setDisplaySize(this.scale.width / 8, this.scale.height / 3);

    this.pumpLeft = this.add
      .image(this.scale.width - 212, this.scale.height - 100, "pump-left")
      .setOrigin(0.5, 1)
      .setDisplaySize(this.scale.width / 8, this.scale.height / 3);
  }

  squeezePump() {
    this.isAnimating = true;
    this.pumpTop.disableInteractive();

    this.tweens.add({
      targets: this.pumpTop,
      y: "+=30",
      scaleX: 0.4,
      scaleY: 0.4,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.pumpTop.setY(this.scale.height - 170).setInteractive();
        this.isAnimating = false;
      },
    });

    this.tweens.add({
      targets: this.pumpBody,
      scaleX: 0.4,
      duration: 200,
      yoyo: true,
    });

    this.tweens.add({
      targets: this.pumpLeft,
      y: "+=2",
      x: "-=3",
      duration: 200,
      yoyo: true,
    });
  }

  inflateBalloon() {
    if (this.clickCount < 4) {
      this.clickCount++;
      this.tweens.add({
        targets: this.balloon,
        x: "-=1",
        y: "-=8",
        scaleX: "+=0.03",
        scaleY: "+=0.03",
        duration: 200,
      });
    }

    if (this.clickCount === 4) {
      this.releaseBalloon();
    }
  }

  burstBalloon(container) {
    container.disableInteractive();

    this.tweens.add({
      targets: container,
      scaleX: "+=0.2",
      scaleY: "+=0.2",
      duration: 100,
      onComplete: () => {
        this.tweens.add({
          targets: container,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: 100,
          ease: "Power2",
          onComplete: () => {
            this.floatingBalloons = this.floatingBalloons.filter(
              (b) => b !== container
            );
            container.destroy();
          },
        });
      },
    });
  }

  releaseBalloon() {
    this.clickCount = 0;
    const releasedBalloon = this.balloon;
    this.floatingBalloons.push(releasedBalloon);

    releasedBalloon.setSize(500, 500).setInteractive();
    releasedBalloon.on("pointerdown", function () {
      this.scene.burstBalloon(this);
    });

    this.tweens.add({
      targets: releasedBalloon,
      x: `+=${Phaser.Math.Between(-50, 50)}`,
      y: `-=${Phaser.Math.Between(100, 200)}`,
      scaleX: "+=0.1",
      scaleY: "+=0.1",
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        this.startBalloonMovement(releasedBalloon);
        this.balloon = this.createBalloonWithAlphabet(
          this.pumpLeft.x - 45,
          this.pumpLeft.y - 218,
          0.1
        ).setDepth(-1);
      },
    });
  }

  startBalloonMovement(container) {
    const radians = Phaser.Math.DegToRad(Phaser.Math.Between(0, 360));
    container.velocityX = Math.cos(radians) * Phaser.Math.FloatBetween(1, 2);
    container.velocityY = Math.sin(radians) * Phaser.Math.FloatBetween(1, 2);

    this.time.addEvent({
      delay: 16,
      callback: () => {
        if (!container.active) return;

        container.x += container.velocityX;
        container.y += container.velocityY;

        container.velocityX = Phaser.Math.Clamp(
          container.velocityX + Phaser.Math.FloatBetween(-0.1, 0.1),
          -2,
          2
        );
        container.velocityY = Phaser.Math.Clamp(
          container.velocityY + Phaser.Math.FloatBetween(-0.1, 0.1),
          -2,
          2
        );

        const padding = 50;
        if (
          container.x <= padding ||
          container.x >= this.scale.width - padding
        ) {
          container.velocityX *= -1;
        }

        if (
          container.y <= padding ||
          container.y >= this.scale.height - padding
        ) {
          container.velocityY *= -1;
        }
      },
      loop: true,
    });
  }

  update() {}
}
