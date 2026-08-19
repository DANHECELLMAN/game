/**
 * 《今天也不想上班》- 程序启动与UI事件绑定 (V1.3 升级版)
 */

import { GameEngine } from './game.js';
import { sound } from './audio.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const game = new GameEngine(canvas);

  // 开始游戏
  document.getElementById('btn-start-game').onclick = () => {
    game.startNewGame();
  };

  // 角色选择弹窗
  document.getElementById('btn-open-characters').onclick = () => {
    sound.init();
    sound.playClick();
    game.renderCharacterSelectModal();
  };
  document.getElementById('btn-close-characters').onclick = () => {
    sound.playClick();
    document.getElementById('character-modal').style.display = 'none';
  };

  // 关卡选择弹窗
  document.getElementById('btn-open-stages').onclick = () => {
    sound.init();
    sound.playClick();
    game.renderStageSelectModal();
  };
  document.getElementById('btn-close-stages').onclick = () => {
    sound.playClick();
    document.getElementById('stage-modal').style.display = 'none';
  };

  // 局外天赋弹窗
  document.getElementById('btn-open-talents').onclick = () => {
    sound.init();
    sound.playClick();
    game.renderTalentsModal();
  };
  document.getElementById('btn-close-talents').onclick = () => {
    sound.playClick();
    document.getElementById('talent-modal').style.display = 'none';
  };

  // 玩法指南弹窗
  document.getElementById('btn-open-guide').onclick = () => {
    sound.init();
    sound.playClick();
    document.getElementById('guide-modal').style.display = 'flex';
  };
  document.getElementById('btn-close-guide').onclick = () => {
    sound.playClick();
    document.getElementById('guide-modal').style.display = 'none';
  };

  // 设置菜单弹窗 (齿轮按钮)
  document.getElementById('btn-open-settings').onclick = () => {
    sound.init();
    sound.playClick();
    document.getElementById('settings-menu-modal').style.display = 'flex';
  };
  document.getElementById('btn-close-settings').onclick = () => {
    sound.playClick();
    document.getElementById('settings-menu-modal').style.display = 'none';
  };
  document.getElementById('btn-pause-from-settings').onclick = () => {
    document.getElementById('settings-menu-modal').style.display = 'none';
    game.pauseGame();
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

  // 手机端动作按键
  const dodgeBtn = document.getElementById('btn-dodge');
  if (dodgeBtn) {
    dodgeBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (game.player && game.state === "PLAYING") game.player.performDodge(game);
    }, { passive: false });

    dodgeBtn.onclick = (e) => {
      e.preventDefault();
      if (game.player && game.state === "PLAYING") game.player.performDodge(game);
    };
  }

  const skillBtn = document.getElementById('btn-skill');
  if (skillBtn) {
    skillBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (game.player && game.state === "PLAYING") game.player.performActiveSkill(game);
    }, { passive: false });

    skillBtn.onclick = (e) => {
      e.preventDefault();
      if (game.player && game.state === "PLAYING") game.player.performActiveSkill(game);
    };
  }

  // 设置弹窗内功能按钮
  const controlsBtn = document.getElementById('btn-toggle-controls');
  if (controlsBtn) {
    controlsBtn.onclick = () => {
      sound.init();
      sound.playClick();
      game.showMobileControls = !game.showMobileControls;
      document.getElementById('mobile-controls').style.display = (game.showMobileControls && game.state === 'PLAYING') ? 'block' : 'none';
      controlsBtn.innerText = game.showMobileControls ? '🎮 虚拟摇杆: 开' : '🎮 虚拟摇杆: 关';
    };
  }

  const soundBtn = document.getElementById('btn-toggle-sound');
  if (soundBtn) {
    soundBtn.onclick = () => {
      sound.init();
      const muted = sound.toggleMute();
      soundBtn.innerText = muted ? '🔇 音效: 关' : '🔊 音效: 开';
    };
  }

  const speedBtn = document.getElementById('btn-toggle-speed');
  if (speedBtn) {
    speedBtn.onclick = () => {
      sound.init();
      if (game.timeScale === 1.0) {
        game.timeScale = 3.0;
        speedBtn.innerText = '⚡ 游戏速度: 3x';
      } else {
        game.timeScale = 1.0;
        speedBtn.innerText = '⏱️ 游戏速度: 1x';
      }
    };
  }

  const bossTestBtn = document.getElementById('btn-test-boss');
  if (bossTestBtn) {
    bossTestBtn.onclick = () => {
      if (game.state === 'PLAYING') {
        document.getElementById('settings-menu-modal').style.display = 'none';
        game.director.gameTime = 480;
        game.director.spawnBoss();
      }
    };
  }

  // 启动主循环
  requestAnimationFrame((t) => game.loop(t));
});
