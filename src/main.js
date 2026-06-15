import Phaser from 'phaser';
import LobbyScene from './scenes/LobbyScene';
import GameScene from './scenes/GameScene';
import ResultsScene from './scenes/ResultsScene';

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 700,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [LobbyScene, GameScene, ResultsScene]
};

new Phaser.Game(config);