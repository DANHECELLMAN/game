/**
 * 《今天也不想上班》- 程序启动与UI事件绑定
 */

import { GameEngine } from './game.js';
import { sound } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const game = new GameEngine(canvas);

  // 开始游戏按钮
  document.getElementById('btn-start-game').onclick = () => {
    game.startNewGame();
  };

  // 局外天赋按钮
  document.getElementById('btn-open-talents').onclick = () => {
    sound.init();
    sound.playClick();
    game.renderTalentsModal();
  };
  document.getElementById('btn-close-talents').onclick = () => {
    sound.playClick();
    document.getElementById('talent-modal').style.display = 'none';
  };

  // 玩法指南按钮
  document.getElementById('btn-open-guide').onclick = () => {
    sound.init();
    sound.playClick();
    document.getElementById('guide-modal').style.display = 'flex';
  };
  document.getElementById('btn-close-guide').onclick = () => {
    sound.playClick();
    document.getElementById('guide-modal').style.display = 'none';
  };

  // 刷新升级选项
  document.getElementById('levelup-reroll-btn').onclick = () => {
    game.rerollLevelUpChoices();
  };

  // 暂停与继续
  document.getElementById('btn-resume-game').onclick = () => {
    sound.playClick();
    game.resumeGame();
  };
  document.getElementById('btn-quit-game').onclick = () => {
    sound.playClick();
    game.hideAllModals();
    game.state = 'MENU';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('mobile-controls').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
    sound.stopBgm();
  };

  // 结算重试与返回
  document.getElementById('btn-restart-gameover').onclick = () => {
    game.startNewGame();
  };
  document.getElementById('btn-menu-gameover').onclick = () => {
    document.getElementById('btn-quit-game').click();
  };
  document.getElementById('btn-restart-victory').onclick = () => {
    game.startNewGame();
  };
  document.getElementById('btn-menu-victory').onclick = () => {
    document.getElementById('btn-quit-game').click();
  };

  // 手机端技能与闪避按钮
  const dodgeBtn = document.getElementById('btn-dodge');
  if (dodgeBtn) {
    dodgeBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) game.player.performDodge(game);
    });
    dodgeBtn.onclick = () => {
      if (game.player) game.player.performDodge(game);
    };
  }

  const skillBtn = document.getElementById('btn-skill');
  if (skillBtn) {
    skillBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) game.player.performActiveSkill(game);
    });
    skillBtn.onclick = () => {
      if (game.player) game.player.performActiveSkill(game);
    };
  }

  // 快捷功能按键 (静音、倍速、直接召唤Boss测试)
  const soundBtn = document.getElementById('btn-toggle-sound');
  if (soundBtn) {
    soundBtn.onclick = () => {
      sound.init();
      const muted = sound.toggleMute();
      soundBtn.innerText = muted ? '🔇 静音' : '🔊 音效';
    };
  }

  const speedBtn = document.getElementById('btn-toggle-speed');
  if (speedBtn) {
    speedBtn.onclick = () => {
      sound.init();
      if (game.timeScale === 1.0) {
        game.timeScale = 3.0;
        speedBtn.innerText = '⚡ 3x 加速';
      } else {
        game.timeScale = 1.0;
        speedBtn.innerText = '⏱️ 1x 正常';
      }
    };
  }

  const bossTestBtn = document.getElementById('btn-test-boss');
  if (bossTestBtn) {
    bossTestBtn.onclick = () => {
      if (game.state === 'PLAYING') {
        game.director.gameTime = 480;
        game.director.spawnBoss();
      }
    };
  }

  // 启动主渲染与逻辑循环
  requestAnimationFrame((t) => game.loop(t));
});
