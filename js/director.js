/**
 * 《今天也不想上班》- 刷怪导演与8分钟时间轴系统
 * 基于威胁预算 (Threat Budget) 与 动态难度调节
 */

import { WAVE_TIMELINE, NORMAL_ENEMIES, ELITES, BOSS_CONFIG } from './constants.js';
import { Enemy, Elite, SupervisorBoss } from './entities.js';
import { sound } from './audio.js';

export class WaveDirector {
  constructor(game) {
    this.game = game;
    this.gameTime = 0; // 秒
    this.spawnTimer = 0;
    this.accumulatedBudget = 0;
    this.hrSpawned = false;
    this.pmSpawned = false;
    this.bossSpawned = false;
    this.tempDemandTimer = 0;
    this.recentKills = 0;
    this.killRateTimer = 0;
    this.dynamicMult = 1.0;
  }

  reset() {
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.accumulatedBudget = 0;
    this.hrSpawned = false;
    this.pmSpawned = false;
    this.bossSpawned = false;
    this.tempDemandTimer = 0;
    this.recentKills = 0;
    this.killRateTimer = 0;
    this.dynamicMult = 1.0;
  }

  update(dt) {
    if (this.game.isPaused || this.game.isGameOver || this.game.isVictory) return;

    this.gameTime += dt;

    // 1. 动态难度自适应计算 (每20秒评估)
    this.killRateTimer += dt;
    if (this.killRateTimer >= 20.0) {
      this.killRateTimer = 0;
      if (this.recentKills > 25) {
        this.dynamicMult = 1.10; // 清怪过快，预算+10%
      } else if (this.game.player.hp / this.game.player.maxHp <= 0.3) {
        this.dynamicMult = 0.88; // 濒死，预算-12%
      } else {
        this.dynamicMult = 1.0;
      }
      this.recentKills = 0;
    }

    // 2. 精英与Boss固定出场时间节点
    if (!this.hrSpawned && this.gameTime >= ELITES.hr.spawnTime && !this.bossSpawned) {
      this.hrSpawned = true;
      this.spawnElite("hr");
    }

    if (!this.pmSpawned && this.gameTime >= ELITES.pm.spawnTime && !this.bossSpawned) {
      this.pmSpawned = true;
      this.spawnElite("pm");
    }

    if (!this.bossSpawned && this.gameTime >= BOSS_CONFIG.spawnTime) {
      this.bossSpawned = true;
      this.spawnBoss();
      return;
    }

    // Boss战期间不走普通时间表刷怪，由Boss技能召唤
    if (this.bossSpawned) return;

    // 3. 时间表波次匹配
    const currentWave = WAVE_TIMELINE.find(w => this.gameTime >= w.start && this.gameTime < w.end) || WAVE_TIMELINE[WAVE_TIMELINE.length - 1];

    // 特殊事件：6:40-7:20 临时需求
    if (currentWave.specialEvent === "temp_demand") {
      this.tempDemandTimer += dt;
      if (this.tempDemandTimer >= 5.0) {
        this.tempDemandTimer = 0;
        this.game.player.addPressure(2, this.game);
        this.game.addFloatingText(this.game.player.x, this.game.player.y - 35, "⚠️ 临时需求：压力+2", "#f59e0b", 14);
      }
    }

    // 4. 威胁预算补充与怪物生成
    const baseBudgetPerSec = (currentWave.budget / 10.0) * this.dynamicMult * (currentWave.specialEvent === "temp_demand" ? 1.35 : 1.0);
    this.accumulatedBudget += baseBudgetPerSec * dt;

    this.spawnTimer += dt;
    if (this.spawnTimer >= 0.8) {
      this.spawnTimer = 0;
      this.spawnWaveEnemies(currentWave);
    }

    // 5. 怪物群清理/重定位 (离开视野过远则瞬移至玩家附近)
    this.recycleDistantEnemies();
  }

  spawnWaveEnemies(wave) {
    if (this.game.enemies.length >= 90) return; // 90同屏软上限

    while (this.accumulatedBudget >= 1.0 && this.game.enemies.length < 90) {
      // 随机挑选当前波次允许的敌人
      const availableEnemies = wave.enemies;
      const typeId = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
      const conf = NORMAL_ENEMIES[typeId];

      if (this.accumulatedBudget >= conf.threatCost) {
        this.accumulatedBudget -= conf.threatCost;

        if (conf.groupCount && conf.groupCount > 1) {
          for (let i = 0; i < conf.groupCount; i++) {
            this.spawnEnemyAtEdge(typeId, wave.hpMult, wave.dmgMult);
          }
        } else {
          this.spawnEnemyAtEdge(typeId, wave.hpMult, wave.dmgMult);
        }
      } else {
        break;
      }
    }
  }

  spawnEnemyAtEdge(typeId, hpMult, dmgMult) {
    const p = this.game.player;
    const angle = Math.random() * Math.PI * 2;
    const distance = 420 + Math.random() * 80; // 屏幕外围生成
    const sx = Math.max(20, Math.min(this.game.mapWidth - 20, p.x + Math.cos(angle) * distance));
    const sy = Math.max(20, Math.min(this.game.mapHeight - 20, p.y + Math.sin(angle) * distance));

    const enemy = new Enemy(typeId, sx, sy, hpMult, dmgMult);
    this.game.enemies.push(enemy);
  }

  spawnElite(typeId) {
    const p = this.game.player;
    const angle = Math.random() * Math.PI * 2;
    const distance = 450;
    const sx = Math.max(40, Math.min(this.game.mapWidth - 40, p.x + Math.cos(angle) * distance));
    const sy = Math.max(40, Math.min(this.game.mapHeight - 40, p.y + Math.sin(angle) * distance));

    const elite = new Elite(typeId, sx, sy);
    this.game.enemies.push(elite);
    sound.playBossWarning();
    this.game.addFloatingText(p.x, p.y - 45, `🚨 精英【${elite.name}】进入办公室！`, "#f43f5e", 20);
  }

  spawnBoss() {
    // 清除普通杂兵
    this.game.enemies = this.game.enemies.filter(e => e.isElite);

    const p = this.game.player;
    const boss = new SupervisorBoss(p.x, p.y - 250);
    this.game.enemies.push(boss);
    this.game.bossInstance = boss;

    sound.playBossWarning();
    this.game.player.addPressure(10, this.game); // 登场玩家压力 +10
    this.game.addFloatingText(p.x, p.y - 50, "👹【终极主管】已就位！今日拒绝加班！", "#dc2626", 24);
  }

  recycleDistantEnemies() {
    const p = this.game.player;
    this.game.enemies.forEach(e => {
      if (!e.isElite && !e.isBoss) {
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist > 650) {
          // 重投放到玩家外围
          const angle = Math.random() * Math.PI * 2;
          e.x = p.x + Math.cos(angle) * 380;
          e.y = p.y + Math.sin(angle) * 380;
        }
      }
    });
  }
}
