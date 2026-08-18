/**
 * 《今天也不想上班》- 实体系统 (Player, Enemies, Boss, Weapons, Projectiles, Drops, VFX)
 */

import { M_TO_PX, PLAYER_BASE, PRESSURE_STAGES, WEAPONS, SKILLS, ARTIFACTS, NORMAL_ENEMIES, ELITES, BOSS_CONFIG } from './constants.js';
import { sound } from './audio.js';

// 伤害飘字
export class DamageNumber {
  constructor(x, y, damage, isCrit = false, isHeal = false, text = null) {
    this.x = x + (Math.random() * 16 - 8);
    this.y = y + (Math.random() * 10 - 5);
    this.damage = Math.round(damage);
    this.isCrit = isCrit;
    this.isHeal = isHeal;
    this.text = text || (isHeal ? `+${this.damage}` : `${this.damage}`);
    this.life = 0.8;
    this.maxLife = 0.8;
    this.vy = isCrit ? -45 : -30;
    this.vx = (Math.random() - 0.5) * 20;
    this.scale = isCrit ? 1.4 : 1.0;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 40 * dt; // 重力微调
  }

  draw(ctx) {
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.font = this.isCrit ? "bold 18px 'Segoe UI', Arial" : "13px 'Segoe UI', Arial";
    ctx.textAlign = "center";

    if (this.isHeal) {
      ctx.fillStyle = "#10b981";
      ctx.strokeStyle = "#064e3b";
    } else if (this.isCrit) {
      ctx.fillStyle = "#fbbf24";
      ctx.strokeStyle = "#b45309";
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#1f2937";
    }

    ctx.lineWidth = 2;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// 提示飘字（如“摸鱼成功”、“辞职状态”、“崩！”）
export class FloatingText {
  constructor(x, y, text, color = "#fbbf24", size = 16) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 1.0;
    this.maxLife = 1.0;
    this.vy = -35;
  }

  update(dt) {
    this.life -= dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.font = `bold ${this.size}px 'Segoe UI', Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// 粒子特效
export class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.95;
    this.vy *= 0.95;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * (this.life / this.maxLife), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 掉落物
export class DropItem {
  constructor(x, y, type, value = 1) {
    this.x = x;
    this.y = y;
    this.type = type; // 'xp', 'big_xp', 'coffee', 'artifact', 'punch_card'
    this.value = value;
    this.radius = type === 'punch_card' ? 16 : (type === 'artifact' ? 14 : (type === 'big_xp' ? 10 : 7));
    this.alive = true;
    this.animTime = Math.random() * Math.PI * 2;
  }

  update(dt, player) {
    this.animTime += dt * 3;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    // 拾取半径判定
    if (dist < player.pickupRadius || this.type === 'punch_card') {
      const speed = player.pickupSpeed * (this.type === 'punch_card' ? 1.5 : 1.0);
      this.x += (dx / dist) * speed * dt;
      this.y += (dy / dist) * speed * dt;

      if (dist < player.radius + this.radius) {
        this.alive = false;
        player.collectDrop(this);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    const bob = Math.sin(this.animTime) * 3;
    const drawY = this.y + bob;

    if (this.type === 'xp') {
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, drawY, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'big_xp') {
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "#d97706";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, drawY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EXP", this.x, drawY);
    } else if (this.type === 'coffee') {
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☕", this.x, drawY);
    } else if (this.type === 'artifact') {
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 12;
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🎁", this.x, drawY);
    } else if (this.type === 'punch_card') {
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(this.x - 14, drawY - 9, 28, 18);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("下班卡", this.x, drawY);
    }

    ctx.restore();
  }
}

// 弹道类（键帽、辞职信、敌人子弹等）
export class Projectile {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.damage = options.damage || 10;
    this.radius = options.radius || 6;
    this.life = options.life || 3.0;
    this.pierce = options.pierce || 0;
    this.hitEnemies = new Set();
    this.isEvo = options.isEvo || false;
    this.isEnemy = options.isEnemy || false;
    this.type = options.type || "keycap"; // "keycap", "resignation_bomb", "enemy_bullet", "boss_bullet"
    this.color = options.color || "#38bdf8";
    this.targetX = options.targetX;
    this.targetY = options.targetY;
    this.onExplode = options.onExplode || null;
    this.alive = true;
    this.knockback = options.knockback || false;
  }

  update(dt, game) {
    this.life -= dt;
    if (this.life <= 0) {
      this.alive = false;
      if (this.type === "resignation_bomb" && this.onExplode) {
        this.onExplode(this.x, this.y);
      }
      return;
    }

    if (this.type === "resignation_bomb") {
      // 飞向目标点
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      const speed = 400;
      if (dist < speed * dt) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.alive = false;
        if (this.onExplode) this.onExplode(this.x, this.y);
        return;
      } else {
        this.x += (dx / dist) * speed * dt;
        this.y += (dy / dist) * speed * dt;
      }
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.type === "keycap") {
      ctx.fillStyle = this.isEvo ? "#ef4444" : "#f3f4f6";
      ctx.strokeStyle = this.isEvo ? "#b91c1c" : "#9ca3af";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(this.x - 6, this.y - 6, 12, 12, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.isEvo ? "#ffffff" : "#111827";
      ctx.font = "bold 8px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.isEvo ? "?" : "K", this.x, this.y);
    } else if (this.type === "resignation_bomb") {
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📄", this.x, this.y);
    } else if (this.isEnemy) {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// AOE区域（离职情绪水洼、会议减速圈、Boss文件雨预警红圈）
export class AOEZone {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius || 50;
    this.duration = options.duration || 2.0;
    this.maxDuration = this.duration;
    this.type = options.type; // "resignation_pool", "meeting_slow", "boss_warning_circle", "boss_falling_file", "hr_line_warning"
    this.damage = options.damage || 0;
    this.tickInterval = options.tickInterval || 0.5;
    this.tickTimer = 0;
    this.slowPct = options.slowPct || 0.35;
    this.alive = true;
    this.color = options.color || "rgba(239, 68, 68, 0.3)";
    this.onComplete = options.onComplete || null;
    this.lineStartX = options.lineStartX;
    this.lineStartY = options.lineStartY;
    this.lineEndX = options.lineEndX;
    this.lineEndY = options.lineEndY;
  }

  update(dt, game) {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.alive = false;
      if (this.onComplete) this.onComplete();
      return;
    }

    if (this.type === "resignation_pool") {
      this.tickTimer += dt;
      if (this.tickTimer >= this.tickInterval) {
        this.tickTimer = 0;
        // 对范围内敌人造成伤害
        game.enemies.forEach(enemy => {
          if (enemy.alive && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.radius + enemy.radius) {
            enemy.takeDamage(this.damage, false, game);
          }
        });
      }
    }
  }

  draw(ctx) {
    ctx.save();
    const progress = 1 - (this.duration / this.maxDuration);

    if (this.type === "resignation_pool") {
      ctx.fillStyle = "rgba(244, 63, 94, 0.25)";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fda4af";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText("离职情绪", this.x, this.y);
    } else if (this.type === "meeting_slow") {
      ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e9d5ff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("会议区 (减速)", this.x, this.y);
    } else if (this.type === "boss_warning_circle") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 充能进度圈
      ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * progress, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "hr_line_warning") {
      ctx.strokeStyle = `rgba(244, 63, 94, ${0.4 + 0.6 * progress})`;
      ctx.lineWidth = 14;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(this.lineStartX, this.lineStartY);
      ctx.lineTo(this.lineEndX, this.lineEndY);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// 玩家类 (小陈)
export class Player {
  constructor(x, y, metaTalents = {}) {
    this.x = x;
    this.y = y;
    this.radius = 16;
    this.alive = true;

    // 天赋加成
    const hpBonus = 1 + (metaTalents.health_check || 0) * 0.02;
    const dmgBonus = 1 + (metaTalents.skilled_worker || 0) * 0.02;
    const spdBonus = 1 + (metaTalents.fast_runner || 0) * 0.015;
    const xpBonus = 1 + (metaTalents.slacker_xp || 0) * 0.02;
    const bleedResist = (metaTalents.mental_construction || 0) * 0.002;

    this.maxHp = PLAYER_BASE.maxHp * hpBonus;
    this.hp = this.maxHp;
    this.baseMoveSpeed = PLAYER_BASE.moveSpeed * spdBonus;
    this.moveSpeed = this.baseMoveSpeed;
    this.damageMult = PLAYER_BASE.damageMult * dmgBonus;
    this.critRate = PLAYER_BASE.critRate;
    this.critDmg = PLAYER_BASE.critDmg;
    this.xpMult = PLAYER_BASE.xpMult * xpBonus;
    this.pickupRadius = PLAYER_BASE.pickupRadius;
    this.pickupSpeed = PLAYER_BASE.pickupSpeed;
    this.bleedResist = bleedResist;

    // 状态与资源
    this.pressure = 0; // 0-100
    this.maxPressure = 100;
    this.highestPressure = 0;
    this.collapseTimer = 0;
    this.isCollapsed = false;
    this.lastHurtTime = 0;

    // 武器 & 技能库
    this.weapons = { keyboard: 1 }; // 初始机械键盘 Lv1
    this.skills = {};
    this.artifacts = {};
    this.evolvedWeapons = {};

    // 闪避
    this.isDodging = false;
    this.dodgeTimer = 0;
    this.dodgeDuration = PLAYER_BASE.dodgeDuration;
    this.dodgeCooldown = PLAYER_BASE.dodgeCooldown;
    this.dodgeCooldownTimer = 0;
    this.dodgeVx = 0;
    this.dodgeVy = 0;
    this.perfectDodgeWindowTimer = 0;
    this.nextHitGuaranteedCrit = false;
    this.perfectDodgeCount = 0;

    // 无敌帧
    this.invulnerableTimer = 0;

    // 主动技能：疯狂输出
    this.activeSkillCdTimer = 0;
    this.activeSkillDurationTimer = 0;

    // 武器发射计时器
    this.keyboardTimer = 0;
    this.keyboardShotCount = 0;
    this.resignationTimer = 0;
    this.mugAngle = 0;
    this.mugShockwaveTimer = 0;

    // 被动与辅助技能计时器
    this.levelUpSpeedTimer = 0; // 熟练摸鱼
    this.shieldReady = false;
    this.shieldTimer = 0;
    this.paidSlackingTimer = 0;
    this.standTimer = 0;
    this.toiletExcuseTimer = 0;
    this.quitModeTimer = 0;

    // 神器计时器
    this.paidPoopTimer = 0;
    this.paidPoopInvulnTimer = 0;
    this.wifiCutTimer = 0;
    this.wifiDisabledTimer = 0;
    this.revivedOnce = false;

    // 移动与朝向
    this.faceX = 1;
    this.faceY = 0;
    this.lastMoveX = 0;
    this.lastMoveY = 0;

    // 等级与经验
    this.level = 1;
    this.xp = 0;
    this.kills = 0;
    this.gold = 0;

    // Debuff
    this.debuffDmgReductionTimer = 0;
    this.slowEffectMult = 1.0;
  }

  update(dt, inputDir, game) {
    if (!this.alive) return;

    // 1. 计时器更新
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.dodgeCooldownTimer > 0) this.dodgeCooldownTimer -= dt;
    if (this.activeSkillCdTimer > 0) this.activeSkillCdTimer -= dt;
    if (this.activeSkillDurationTimer > 0) this.activeSkillDurationTimer -= dt;
    if (this.levelUpSpeedTimer > 0) this.levelUpSpeedTimer -= dt;
    if (this.toiletExcuseTimer > 0) this.toiletExcuseTimer -= dt;
    if (this.quitModeTimer > 0) this.quitModeTimer -= dt;
    if (this.debuffDmgReductionTimer > 0) this.debuffDmgReductionTimer -= dt;
    if (this.paidPoopInvulnTimer > 0) this.paidPoopInvulnTimer -= dt;
    if (this.wifiDisabledTimer > 0) this.wifiDisabledTimer -= dt;

    // 2. 压力系统与崩溃逻辑
    this.updatePressure(dt, game);

    // 3. 移动计算
    this.updateMovement(dt, inputDir, game);

    // 4. 技能与神器被动逻辑
    this.updatePassives(dt, game);

    // 5. 自动攻击武器逻辑
    this.updateWeapons(dt, game);
  }

  updatePressure(dt, game) {
    if (this.pressure > this.highestPressure) {
      this.highestPressure = this.pressure;
    }

    if (this.isCollapsed) {
      this.collapseTimer -= dt;
      // 崩溃每秒流血 (基础4% - 心理建设抗性)
      const drainRate = Math.max(0.01, 0.04 - this.bleedResist);
      const drainHp = this.maxHp * drainRate * dt;
      this.hp -= drainHp;
      if (this.hp <= 0) {
        this.die(game);
        return;
      }

      if (this.collapseTimer <= 0) {
        this.isCollapsed = false;
        // 恢复后重置压力
        const resetVal = (this.skills.quit && this.skills.quit > 0) ? 40 : 55;
        this.pressure = resetVal;
        game.addFloatingText(this.x, this.y - 20, "压力释放", "#38bdf8");
      }
    } else {
      // 20秒未受击，缓慢自然降压 -1/s，最低至30
      const timeSinceHurt = (Date.now() - this.lastHurtTime) / 1000;
      if (timeSinceHurt >= 20.0 && this.pressure > 30) {
        this.pressure = Math.max(30, this.pressure - 1.0 * dt);
      }

      // 压力到达100触发崩溃
      if (this.pressure >= 100) {
        this.triggerCollapse(game);
      }
    }

    // 压力心跳音效
    if (this.pressure >= 80 && !this.isCollapsed) {
      sound.playHeartbeat();
    }
  }

  triggerCollapse(game) {
    this.isCollapsed = true;
    this.collapseTimer = PRESSURE_STAGES.COLLAPSE.duration;
    this.pressure = 100;
    sound.playCollapseAlarm();
    game.addFloatingText(this.x, this.y - 30, "💥 崩溃！", "#dc2626", 22);

    // 我不干了 技能加成
    if (this.skills.quit && this.skills.quit > 0) {
      const lvl = this.skills.quit;
      const dur = SKILLS.quit.quitDur[lvl - 1];
      this.quitModeTimer = dur;
      game.addFloatingText(this.x, this.y - 45, "辞职状态！极速爆发", "#f59e0b", 16);
    }
  }

  addPressure(amount, game) {
    if (this.isCollapsed) return;

    let mult = 1.0;
    // KPI 技能增加压力获取
    if (this.skills.kpi && this.skills.kpi > 0) {
      mult += SKILLS.kpi.pressureGain[this.skills.kpi - 1];
    }
    // 假装去厕所 技能减免
    if (this.toiletExcuseTimer > 0) {
      mult *= 0.5;
    }

    const finalAmount = amount * mult;
    this.pressure = Math.min(100, Math.max(0, this.pressure + finalAmount));

    if (this.pressure >= 100) {
      this.triggerCollapse(game);
    }
  }

  reducePressure(amount, game) {
    if (this.isCollapsed) return;
    this.pressure = Math.max(0, this.pressure - amount);
    game.addFloatingText(this.x, this.y - 15, `压力 -${Math.round(amount)}`, "#10b981", 13);
  }

  updateMovement(dt, inputDir, game) {
    // 闪避状态
    if (this.isDodging) {
      this.dodgeTimer -= dt;
      this.x += this.dodgeVx * dt;
      this.y += this.dodgeVy * dt;

      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        // 假装去厕所 保护时间
        if (this.skills.toilet_excuse && this.skills.toilet_excuse > 0) {
          this.toiletExcuseTimer = SKILLS.toilet_excuse.safeDur[this.skills.toilet_excuse - 1];
        }
      }
      this.clampPosition(game);
      return;
    }

    // 计算移动速度
    let speed = this.baseMoveSpeed;
    if (this.skills.on_time_off) {
      speed *= (1 + SKILLS.on_time_off.spdBonus[this.skills.on_time_off - 1]);
    }
    if (this.levelUpSpeedTimer > 0) {
      speed *= 1.12; // 熟练摸鱼被动
    }
    // 会议减速
    let slow = this.slowEffectMult;
    if (this.artifacts.noise_cancelling_headphones && slow < 1.0) {
      // 降噪耳机降低70%减速效果
      slow = 1.0 - (1.0 - slow) * 0.3;
    }
    speed *= slow;

    const len = Math.hypot(inputDir.x, inputDir.y);
    if (len > 0.05) {
      const nx = inputDir.x / len;
      const ny = inputDir.y / len;
      this.x += nx * speed * dt;
      this.y += ny * speed * dt;
      this.faceX = nx;
      this.faceY = ny;
      this.lastMoveX = nx;
      this.lastMoveY = ny;
      this.standTimer = 0;
    } else {
      // 静止检测 (午休技能)
      this.standTimer += dt;
    }

    this.clampPosition(game);
  }

  clampPosition(game) {
    const mapW = game.mapWidth;
    const mapH = game.mapHeight;
    this.x = Math.max(this.radius, Math.min(mapW - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(mapH - this.radius, this.y));
  }

  performDodge(game) {
    if (this.dodgeCooldownTimer > 0 || this.isDodging) return;

    let dirX = this.lastMoveX;
    let dirY = this.lastMoveY;
    if (Math.hypot(dirX, dirY) < 0.1) {
      dirX = this.faceX;
      dirY = this.faceY;
    }
    const len = Math.hypot(dirX, dirY) || 1;
    const nx = dirX / len;
    const ny = dirY / len;

    let dodgeDist = PLAYER_BASE.dodgeDistance;
    let dodgeCd = PLAYER_BASE.dodgeCooldown;

    if (this.skills.elevator_dash) {
      dodgeDist *= (1 + SKILLS.elevator_dash.distBonus[this.skills.elevator_dash - 1]);
      dodgeCd -= SKILLS.elevator_dash.cdReduction[this.skills.elevator_dash - 1];
    }

    this.isDodging = true;
    this.dodgeTimer = this.dodgeDuration;
    this.dodgeCooldownTimer = Math.max(1.0, dodgeCd);
    this.invulnerableTimer = PLAYER_BASE.dodgeInvulnTime;

    const speed = dodgeDist / this.dodgeDuration;
    this.dodgeVx = nx * speed;
    this.dodgeVy = ny * speed;

    sound.playDodge();

    // 完美闪避判定：检测附近0.18s内即将命中的敌方弹道或敌人近战
    this.checkPerfectDodge(game);
  }

  checkPerfectDodge(game) {
    let triggered = false;
    // 检查弹道
    game.projectiles.forEach(p => {
      if (p.alive && p.isEnemy) {
        const dist = Math.hypot(p.x - this.x, p.y - this.y);
        if (dist < 70) {
          triggered = true;
        }
      }
    });

    // 检查近战敌人
    if (!triggered) {
      game.enemies.forEach(e => {
        if (e.alive) {
          const dist = Math.hypot(e.x - this.x, e.y - this.y);
          if (dist < e.radius + this.radius + 35) {
            triggered = true;
          }
        }
      });
    }

    if (triggered) {
      this.perfectDodgeCount++;
      let pressureReduction = 5;
      if (this.skills.toilet_excuse) {
        pressureReduction += SKILLS.toilet_excuse.extraDodgePressure;
      }
      this.reducePressure(pressureReduction, game);
      this.nextHitGuaranteedCrit = true;
      game.triggerSlowMotion(0.25, 0.55);
      sound.playPerfectDodge();
      game.addFloatingText(this.x, this.y - 25, "✨ 摸鱼成功 (必暴击)", "#fbbf24", 16);
    }
  }

  performActiveSkill(game) {
    if (this.activeSkillCdTimer > 0 || this.wifiDisabledTimer > 0) return;

    let cd = PLAYER_BASE.activeSkillCd;
    if (this.artifacts.company_wifi) cd *= 0.75;
    if (this.artifacts.boss_keyboard) cd *= 1.20;

    this.activeSkillCdTimer = cd;
    this.activeSkillDurationTimer = PLAYER_BASE.activeSkillDuration;

    sound.playLevelUp();
    game.addFloatingText(this.x, this.y - 25, "🔥 疯狂输出！", "#ef4444", 18);
  }

  updatePassives(dt, game) {
    // 1. 工位护盾
    if (this.skills.shield && !this.shieldReady) {
      this.shieldTimer += dt;
      const needed = SKILLS.shield.interval[this.skills.shield - 1];
      if (this.shieldTimer >= needed) {
        this.shieldReady = true;
        this.shieldTimer = 0;
        game.addFloatingText(this.x, this.y - 20, "🛡️ 护盾就绪", "#38bdf8");
      }
    }

    // 2. 带薪摸鱼 (定时回血)
    if (this.skills.paid_slacking) {
      this.paidSlackingTimer += dt;
      const interval = SKILLS.paid_slacking.interval[this.skills.paid_slacking - 1];
      if (this.paidSlackingTimer >= interval) {
        this.paidSlackingTimer = 0;
        const heal = this.maxHp * SKILLS.paid_slacking.healPct;
        this.heal(heal, game);
      }
    }

    // 3. 午休 (站桩回血)
    if (this.skills.lunch_break && this.standTimer >= SKILLS.lunch_break.standTime) {
      const healRate = SKILLS.lunch_break.healPerSec[this.skills.lunch_break - 1];
      const heal = this.maxHp * healRate * dt;
      this.heal(heal, game, true);
    }

    // 4. 神器：带薪拉屎 (每30s无敌2s)
    if (this.artifacts.paid_poop) {
      this.paidPoopTimer += dt;
      if (this.paidPoopTimer >= 30.0) {
        this.paidPoopTimer = 0;
        this.paidPoopInvulnTimer = 2.0;
        game.addFloatingText(this.x, this.y - 20, "🧻 带薪拉屎 (无敌2s)", "#a855f7");
      }
    }

    // 5. 神器：公司Wi-Fi (每45s断网2s)
    if (this.artifacts.company_wifi) {
      this.wifiCutTimer += dt;
      if (this.wifiCutTimer >= 45.0) {
        this.wifiCutTimer = 0;
        this.wifiDisabledTimer = 2.0;
        game.addFloatingText(this.x, this.y - 20, "📶 公司断网 (技能失效2s)", "#9ca3af");
      }
    }
  }

  updateWeapons(dt, game) {
    // 带薪拉屎期间无法攻击
    if (this.paidPoopInvulnTimer > 0) return;

    // 1. 机械键盘
    if (this.weapons.keyboard) {
      this.updateKeyboard(dt, game);
    }

    // 2. 马克杯
    if (this.weapons.mug) {
      this.updateMug(dt, game);
    }

    // 3. 辞职信
    if (this.weapons.resignation) {
      this.updateResignation(dt, game);
    }
  }

  getAttackSpeedMult() {
    let mult = 1.0;
    if (this.skills.coffee) {
      mult += SKILLS.coffee.values[this.skills.coffee - 1];
    }
    // 压力攻速加成
    if (this.pressure >= 80) mult += PRESSURE_STAGES.RESIGN_MOOD.atkSpd;
    else if (this.pressure >= 60) mult += PRESSURE_STAGES.IRRITABLE.atkSpd;
    else if (this.pressure >= 30) mult += PRESSURE_STAGES.ANNOYED.atkSpd;

    // 主动技能加成
    if (this.activeSkillDurationTimer > 0) {
      mult += PLAYER_BASE.activeSkillAtkSpdBonus;
    }

    // 临时抱佛脚
    if (this.skills.last_minute_rush && (this.hp / this.maxHp) <= 0.35) {
      mult += SKILLS.last_minute_rush.atkSpdBonus[this.skills.last_minute_rush - 1];
    }

    return mult;
  }

  getDamageMultiplier() {
    let mult = this.damageMult;
    if (this.skills.kpi) {
      mult += SKILLS.kpi.dmgBonus[this.skills.kpi - 1];
    }
    if (this.skills.slacker_science) {
      mult -= SKILLS.slacker_science.dmgPenalty[this.skills.slacker_science - 1];
    }
    if (this.skills.dual_screen && this.skills.dual_screen >= 2) {
      mult += SKILLS.dual_screen.dmgBonus[this.skills.dual_screen - 1];
    }
    if (this.skills.boss_is_coming && this.pressure >= 60) {
      mult += SKILLS.boss_is_coming.highPressureDmg[this.skills.boss_is_coming - 1];
    }
    if (this.quitModeTimer > 0 && this.skills.quit) {
      mult += SKILLS.quit.quitDmg[this.skills.quit - 1];
    }
    if (this.pressure >= 80) mult += PRESSURE_STAGES.RESIGN_MOOD.dmg;
    else if (this.pressure >= 60) mult += PRESSURE_STAGES.IRRITABLE.dmg;

    if (this.activeSkillDurationTimer > 0) {
      mult += PLAYER_BASE.activeSkillDmgBonus;
    }
    if (this.artifacts.boss_keyboard) {
      mult += 0.35;
    }
    // HR Debuff
    if (this.debuffDmgReductionTimer > 0) {
      mult *= 0.80;
    }
    return Math.max(0.2, mult);
  }

  getCritRate() {
    let rate = this.critRate;
    if (this.skills.keyboard_warrior) {
      rate += SKILLS.keyboard_warrior.critRate[this.skills.keyboard_warrior - 1];
    }
    if (this.pressure >= 80) {
      rate += PRESSURE_STAGES.RESIGN_MOOD.crit;
    }
    if (this.skills.last_minute_rush && (this.hp / this.maxHp) <= 0.35) {
      rate += SKILLS.last_minute_rush.critBonus[this.skills.last_minute_rush - 1];
    }
    return Math.min(0.70, rate);
  }

  getCritDamage() {
    let mult = this.critDmg;
    if (this.skills.keyboard_warrior && this.skills.keyboard_warrior >= 4) {
      mult += SKILLS.keyboard_warrior.critDmg[this.skills.keyboard_warrior - 1];
    }
    return mult;
  }

  updateKeyboard(dt, game) {
    const isEvo = !!this.evolvedWeapons.keyboard;
    const lvl = this.weapons.keyboard;
    let baseInterval = 0.55;
    if (lvl >= 3) baseInterval *= 0.88;
    if (isEvo) baseInterval *= 0.72;

    const interval = baseInterval / this.getAttackSpeedMult();
    this.keyboardTimer += dt;

    if (this.keyboardTimer >= interval) {
      this.keyboardTimer = 0;
      this.keyboardShotCount++;

      // 寻找最近敌人
      const target = game.getNearestEnemy(this.x, this.y, 8 * M_TO_PX);
      if (target) {
        let baseDmg = 11;
        if (lvl >= 2) baseDmg *= 1.18;
        if (lvl >= 5) baseDmg *= 1.22;
        const finalDmg = baseDmg * this.getDamageMultiplier();

        let count = 1;
        if (this.skills.dual_screen) {
          count += SKILLS.dual_screen.projectiles[this.skills.dual_screen - 1];
        }
        if (isEvo) count += 1;
        if (lvl >= 4 && (this.keyboardShotCount % 4 === 0)) count += 1;

        const pierce = (lvl >= 5 || isEvo) ? 1 : 0;

        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.15;
          const angle = Math.atan2(target.y - this.y, target.x - this.x) + spread;
          const speed = 450;
          game.projectiles.push(new Projectile({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: finalDmg,
            radius: 6,
            life: 1.5,
            pierce: pierce,
            isEvo: isEvo,
            type: "keycap"
          }));
        }
        sound.playKeyboardShot(isEvo);
      }
    }
  }

  updateMug(dt, game) {
    const isEvo = !!this.evolvedWeapons.mug;
    const lvl = this.weapons.mug;
    let count = 1;
    if (lvl >= 3) count = 2;
    if (lvl >= 5) count = 3;
    if (isEvo) count = 4;

    let rotSpeed = 2.2;
    if (lvl >= 2) rotSpeed *= 1.20;
    this.mugAngle += rotSpeed * dt;

    let radius = 2.2 * M_TO_PX;
    if (lvl >= 4) radius *= 1.10;
    if (this.skills.loudspeaker_meeting) {
      radius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);
    }

    let baseDmg = 16;
    if (lvl >= 4) baseDmg *= 1.25;
    const finalDmg = baseDmg * this.getDamageMultiplier();

    // 碰撞检测
    for (let i = 0; i < count; i++) {
      const angle = this.mugAngle + (i * (Math.PI * 2 / count));
      const mugX = this.x + Math.cos(angle) * radius;
      const mugY = this.y + Math.sin(angle) * radius;

      game.enemies.forEach(enemy => {
        if (enemy.alive && Math.hypot(enemy.x - mugX, enemy.y - mugY) <= enemy.radius + 12) {
          if (!enemy.lastMugHitTime || (Date.now() - enemy.lastMugHitTime > 450)) {
            enemy.lastMugHitTime = Date.now();
            enemy.takeDamage(finalDmg, false, game, lvl >= 5 ? { x: mugX, y: mugY, force: 150 } : null);
            sound.playMugHit();
          }
        }
      });
    }

    // 进化：无限续杯 (每8秒咖啡冲击波)
    if (isEvo) {
      this.mugShockwaveTimer += dt;
      if (this.mugShockwaveTimer >= 8.0) {
        this.mugShockwaveTimer = 0;
        let shockRadius = 3.2 * M_TO_PX;
        if (this.skills.loudspeaker_meeting) {
          shockRadius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);
        }
        game.enemies.forEach(enemy => {
          if (enemy.alive && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= shockRadius + enemy.radius) {
            enemy.takeDamage(finalDmg, false, game, { x: this.x, y: this.y, force: 280 });
          }
        });
        sound.playExplosion(false);
        game.addFloatingText(this.x, this.y - 30, "☕ 咖啡海啸！", "#38bdf8", 16);
      }
    }
  }

  updateResignation(dt, game) {
    const isEvo = !!this.evolvedWeapons.resignation;
    const lvl = this.weapons.resignation;
    let baseInterval = isEvo ? 2.2 : 2.0;
    if (lvl >= 5 && !isEvo) baseInterval *= 0.82;
    const interval = baseInterval / this.getAttackSpeedMult();

    this.resignationTimer += dt;
    if (this.resignationTimer >= interval) {
      this.resignationTimer = 0;
      const target = game.getDenseEnemyClusterTarget(this.x, this.y, 10 * M_TO_PX) || game.getNearestEnemy(this.x, this.y, 10 * M_TO_PX);
      if (target) {
        let baseDmg = 38;
        if (lvl >= 3) baseDmg *= 1.25;
        if (lvl >= 5) baseDmg *= 1.20;
        if (isEvo) baseDmg *= 1.80;
        const finalDmg = baseDmg * this.getDamageMultiplier();

        let baseRadius = isEvo ? (3.2 * M_TO_PX) : (1.8 * M_TO_PX);
        if (lvl >= 2 && !isEvo) baseRadius *= 1.18;
        if (isEvo && this.pressure >= 80) baseRadius *= 1.25;
        if (this.skills.loudspeaker_meeting) {
          baseRadius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);
        }

        const tx = target.x;
        const ty = target.y;

        game.projectiles.push(new Projectile({
          x: this.x,
          y: this.y,
          targetX: tx,
          targetY: ty,
          damage: finalDmg,
          type: "resignation_bomb",
          onExplode: (ex, ey) => {
            sound.playExplosion(isEvo);
            // 范围伤害
            game.enemies.forEach(enemy => {
              if (enemy.alive && Math.hypot(enemy.x - ex, enemy.y - ey) <= baseRadius + enemy.radius) {
                enemy.takeDamage(finalDmg, false, game, { x: ex, y: ey, force: 200 });
              }
            });
            // 产生离职情绪池 (Lv4+)
            if (lvl >= 4 || isEvo) {
              game.aoeZones.push(new AOEZone({
                x: ex,
                y: ey,
                radius: baseRadius * 0.8,
                duration: 2.0,
                damage: finalDmg * 0.2,
                type: "resignation_pool"
              }));
            }
          }
        }));
      }
    }
  }

  takeDamage(amount, sourceEnemy, game, isBossSkill = false) {
    if (!this.alive || this.invulnerableTimer > 0 || this.paidPoopInvulnTimer > 0) return;

    // 护盾抵挡
    if (this.shieldReady) {
      this.shieldReady = false;
      this.shieldTimer = 0;
      this.invulnerableTimer = 0.3;
      game.addFloatingText(this.x, this.y - 25, "🛡️ 护盾抵挡！", "#38bdf8", 14);
      return;
    }

    let actualDamage = amount;
    if (this.artifacts.work_badge) {
      if (sourceEnemy && (sourceEnemy.isElite || sourceEnemy.isBoss)) {
        actualDamage *= 0.85;
      } else {
        actualDamage *= 1.05;
      }
    }

    this.hp -= actualDamage;
    this.invulnerableTimer = PLAYER_BASE.hurtInvulnTime;
    this.lastHurtTime = Date.now();
    sound.playHurt();
    game.addDamageNumber(this.x, this.y, actualDamage, false, false);

    // 压力增加
    let pressureGain = 6;
    if (sourceEnemy && sourceEnemy.isElite) pressureGain = 9;
    if (isBossSkill || (sourceEnemy && sourceEnemy.isBoss)) pressureGain = 12;
    this.addPressure(pressureGain, game);

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  heal(amount, game, silent = false) {
    if (!this.alive || this.hp >= this.maxHp) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (!silent) {
      game.addDamageNumber(this.x, this.y, amount, false, true);
    }
  }

  collectDrop(drop) {
    if (drop.type === 'xp') {
      this.gainXp(drop.value);
      sound.playXp();
    } else if (drop.type === 'big_xp') {
      this.gainXp(drop.value);
      sound.playLevelUp();
    } else if (drop.type === 'coffee') {
      this.heal(this.maxHp * 0.12, null);
      sound.playMugHit();
    } else if (drop.type === 'artifact') {
      // 触发神器选择弹窗
      window.gameInstance.triggerArtifactSelection();
    } else if (drop.type === 'punch_card') {
      window.gameInstance.triggerVictory();
    }
  }

  gainXp(amount) {
    let actual = amount * this.xpMult;
    this.xp += actual;
    while (this.xp >= window.gameInstance.getXpNeeded(this.level)) {
      this.xp -= window.gameInstance.getXpNeeded(this.level);
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.levelUpSpeedTimer = 3.0; // 熟练摸鱼被动
    sound.playLevelUp();
    window.gameInstance.triggerLevelUp();
  }

  die(game) {
    // 离职证明 神器复活
    if (this.artifacts.resignation_cert && !this.revivedOnce) {
      this.revivedOnce = true;
      this.hp = this.maxHp * 0.35;
      this.pressure = 80;
      this.invulnerableTimer = 2.0;
      game.addFloatingText(this.x, this.y - 30, "📜 离职证明生效！复活！", "#ef4444", 18);
      sound.playLevelUp();
      return;
    }

    this.alive = false;
    game.triggerGameOver();
  }

  draw(ctx) {
    ctx.save();
    // 无敌闪烁
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 疯狂输出残影
    if (this.activeSkillDurationTimer > 0) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      ctx.beginPath();
      ctx.arc(this.x - this.faceX * 10, this.y - this.faceY * 10, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 护盾光环
    if (this.shieldReady) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 身体
    ctx.fillStyle = this.isCollapsed ? "#dc2626" : "#3b82f6";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 角色头部/眼睛朝向
    ctx.fillStyle = "#ffffff";
    const eyeOffsetX = this.faceX * 6;
    const eyeOffsetY = this.faceY * 6;
    ctx.beginPath();
    ctx.arc(this.x + eyeOffsetX - this.faceY * 4, this.y + eyeOffsetY + this.faceX * 4, 3, 0, Math.PI * 2);
    ctx.arc(this.x + eyeOffsetX + this.faceY * 4, this.y + eyeOffsetY - this.faceX * 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // 角色图标/身份文字
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("陈", this.x, this.y + 1);

    // 崩溃裂纹标示
    if (this.isCollapsed) {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 14px Arial";
      ctx.fillText("崩", this.x, this.y - 24);
    }

    // 绘制环绕马克杯
    if (this.weapons.mug) {
      const isEvo = !!this.evolvedWeapons.mug;
      const lvl = this.weapons.mug;
      let count = 1;
      if (lvl >= 3) count = 2;
      if (lvl >= 5) count = 3;
      if (isEvo) count = 4;

      let radius = 2.2 * M_TO_PX;
      if (lvl >= 4) radius *= 1.10;
      if (this.skills.loudspeaker_meeting) {
        radius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);
      }

      for (let i = 0; i < count; i++) {
        const angle = this.mugAngle + (i * (Math.PI * 2 / count));
        const mx = this.x + Math.cos(angle) * radius;
        const my = this.y + Math.sin(angle) * radius;
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(isEvo ? "🍵" : "☕", mx, my);
      }
    }

    ctx.restore();
  }
}

// 普通敌人
export class Enemy {
  constructor(typeId, x, y, hpMult = 1.0, dmgMult = 1.0) {
    const conf = NORMAL_ENEMIES[typeId];
    this.typeId = typeId;
    this.name = conf.name;
    this.x = x;
    this.y = y;
    this.maxHp = conf.hp * hpMult;
    this.hp = this.maxHp;
    this.damage = conf.damage * dmgMult;
    this.baseSpeed = conf.speed;
    this.speed = this.baseSpeed;
    this.threatCost = conf.threatCost;
    this.xpDrop = conf.xpDrop;
    this.size = conf.size;
    this.radius = conf.size;
    this.color = conf.color;
    this.icon = conf.icon;
    this.alive = true;
    this.attackType = conf.attackType || "melee";
    this.attackTimer = 0;
    this.stateTimer = 0;
    this.isCharging = false;
    this.rushDir = { x: 0, y: 0 };
    this.lastContactDmgTime = 0;
    this.conf = conf;
  }

  update(dt, player, game) {
    if (!this.alive) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    // 1. 同事僵尸 & 散落纸片：直接追踪
    if (this.attackType === "melee") {
      this.x += nx * this.speed * dt;
      this.y += ny * this.speed * dt;
    }
    // 2. 邮件怪：保持距离并射击
    else if (this.attackType === "ranged") {
      const keep = this.conf.keepDistance;
      if (dist < keep - 30) {
        this.x -= nx * this.speed * dt;
        this.y -= ny * this.speed * dt;
      } else if (dist > keep + 30) {
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
      }
      this.attackTimer += dt;
      if (this.attackTimer >= this.conf.attackInterval) {
        this.attackTimer = 0;
        // 发射直线邮件弹
        game.projectiles.push(new Projectile({
          x: this.x,
          y: this.y,
          vx: nx * this.conf.bulletSpeed,
          vy: ny * this.conf.bulletSpeed,
          damage: this.damage,
          radius: 5,
          life: 3.0,
          isEnemy: true,
          type: "enemy_bullet",
          color: "#38bdf8"
        }));
      }
    }
    // 3. 打印机：固定炮台，发射扇形纸张
    else if (this.attackType === "turret") {
      this.attackTimer += dt;
      if (this.attackTimer >= this.conf.attackInterval) {
        this.attackTimer = 0;
        const baseAngle = Math.atan2(dy, dx);
        [-0.25, 0, 0.25].forEach(offset => {
          const angle = baseAngle + offset;
          game.projectiles.push(new Projectile({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * this.conf.bulletSpeed,
            vy: Math.sin(angle) * this.conf.bulletSpeed,
            damage: this.damage,
            radius: 6,
            life: 3.5,
            isEnemy: true,
            type: "enemy_bullet",
            color: "#94a3b8"
          }));
        });
      }
    }
    // 4. 电话怪：靠近后蓄力震动爆炸
    else if (this.attackType === "ring_shock") {
      if (!this.isCharging) {
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
        if (dist <= this.conf.triggerDistance) {
          this.isCharging = true;
          this.stateTimer = 0;
        }
      } else {
        this.stateTimer += dt;
        if (this.stateTimer >= this.conf.chargeTime) {
          this.stateTimer = 0;
          this.isCharging = false;
          // 圆形震动攻击
          if (dist <= this.conf.radius + player.radius) {
            player.takeDamage(this.damage, this, game);
          }
          sound.playExplosion(false);
          game.addFloatingText(this.x, this.y - 15, "🔔 夺命连环call", "#ec4899", 12);
        }
      }
    }
    // 5. 需求球：停顿后高速冲刺3秒
    else if (this.attackType === "rush") {
      this.stateTimer += dt;
      if (!this.isCharging) {
        // 慢速逼近
        this.x += nx * this.speed * dt;
        this.y += ny * this.speed * dt;
        if (this.stateTimer >= this.conf.pauseDuration) {
          this.isCharging = true;
          this.stateTimer = 0;
          this.rushDir = { x: nx, y: ny };
        }
      } else {
        // 高速冲刺
        this.x += this.rushDir.x * this.conf.rushSpeed * dt;
        this.y += this.rushDir.y * this.conf.rushSpeed * dt;
        if (this.stateTimer >= this.conf.rushDuration) {
          this.isCharging = false;
          this.stateTimer = 0;
        }
      }
    }

    // 6. 会议怪减速光环检测
    if (this.typeId === "meeting_monster") {
      if (dist <= this.conf.auraRadius + player.radius) {
        player.slowEffectMult = Math.min(player.slowEffectMult, 1.0 - this.conf.slowPct);
      }
    }

    // 接触伤害判定 (0.65s冷却)
    if (dist <= this.radius + player.radius) {
      const now = Date.now();
      if (now - this.lastContactDmgTime >= PLAYER_BASE.contactDmgCd * 1000) {
        this.lastContactDmgTime = now;
        player.takeDamage(this.damage, this, game);
      }
    }
  }

  takeDamage(amount, isCrit, game, knockback = null) {
    if (!this.alive) return;
    this.hp -= amount;
    game.addDamageNumber(this.x, this.y, amount, isCrit);

    if (knockback) {
      const kx = this.x - knockback.x;
      const ky = this.y - knockback.y;
      const kdist = Math.hypot(kx, ky) || 1;
      this.x += (kx / kdist) * knockback.force * 0.04;
      this.y += (ky / kdist) * knockback.force * 0.04;
    }

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.alive = false;
    game.player.kills++;

    // 分裂怪逻辑 (文件怪 -> 2散落纸片)
    if (this.conf.splitOnDeath) {
      for (let i = 0; i < this.conf.splitOnDeath.count; i++) {
        const offsetAngle = Math.random() * Math.PI * 2;
        const sx = this.x + Math.cos(offsetAngle) * 15;
        const sy = this.y + Math.sin(offsetAngle) * 15;
        const scrap = new Enemy("zombie_colleague", sx, sy);
        scrap.name = this.conf.splitOnDeath.name;
        scrap.maxHp = this.conf.splitOnDeath.hp;
        scrap.hp = scrap.maxHp;
        scrap.damage = this.conf.splitOnDeath.damage;
        scrap.speed = this.conf.splitOnDeath.speed;
        scrap.size = this.conf.splitOnDeath.size;
        scrap.radius = scrap.size;
        scrap.color = this.conf.splitOnDeath.color;
        scrap.icon = "📄";
        scrap.xpDrop = 1;
        game.enemies.push(scrap);
      }
    }

    // 掉落经验
    game.drops.push(new DropItem(this.x, this.y, 'xp', this.xpDrop));

    // 咖啡回血概率 (0.6% - 1.2%)
    const coffeeChance = (game.player.hp / game.player.maxHp <= 0.3) ? 0.012 : 0.006;
    if (Math.random() < coffeeChance) {
      game.drops.push(new DropItem(this.x, this.y, 'coffee'));
    }

    // 死亡粒子
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 60;
      game.particles.push(new Particle(this.x, this.y, Math.cos(angle) * spd, Math.sin(angle) * spd, this.color, 4, 0.4));
    }
  }

  draw(ctx) {
    ctx.save();
    // 会议怪光环
    if (this.typeId === "meeting_monster") {
      ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.conf.auraRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 蓄力红圈提示
    if (this.isCharging && this.attackType === "ring_shock") {
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.conf.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${this.size * 1.2}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.icon, this.x, this.y);

    // 血条
    if (this.hp < this.maxHp) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(this.x - 12, this.y - this.size - 6, 24, 3);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(this.x - 12, this.y - this.size - 6, 24 * (this.hp / this.maxHp), 3);
    }

    ctx.restore();
  }
}

// 精英怪 (HR / 项目经理)
export class Elite {
  constructor(typeId, x, y) {
    const conf = ELITES[typeId];
    this.typeId = typeId;
    this.name = conf.name;
    this.x = x;
    this.y = y;
    this.maxHp = conf.hp;
    this.hp = this.maxHp;
    this.damage = conf.damage;
    this.dmgReduction = conf.dmgReduction;
    this.speed = conf.speed;
    this.size = conf.size;
    this.radius = conf.size;
    this.color = conf.color;
    this.icon = conf.icon;
    this.isElite = true;
    this.alive = true;
    this.conf = conf;
    this.skillTimer = 0;
    this.summonedHalf = false;
    this.lastContactDmgTime = 0;
  }

  update(dt, player, game) {
    if (!this.alive) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    this.x += nx * this.speed * dt;
    this.y += ny * this.speed * dt;

    this.skillTimer += dt;

    // HR 技能：绩效警告
    if (this.typeId === "hr") {
      if (this.skillTimer >= this.conf.skillCd) {
        this.skillTimer = 0;
        // 直线预警线
        const targetX = player.x;
        const targetY = player.y;
        game.aoeZones.push(new AOEZone({
          lineStartX: this.x,
          lineStartY: this.y,
          lineEndX: targetX,
          lineEndY: targetY,
          duration: this.conf.telegraphTime,
          type: "hr_line_warning",
          onComplete: () => {
            // 判定是否命中玩家
            const pDist = Math.hypot(player.x - targetX, player.y - targetY);
            if (pDist < 40) {
              player.debuffDmgReductionTimer = this.conf.debuffDuration;
              game.addFloatingText(player.x, player.y - 25, "⚠️ 绩效警告 (输出-20%)", "#f43f5e", 15);
            }
          }
        }));
      }

      // <50% HP 召唤2只邮件怪
      if (!this.summonedHalf && (this.hp / this.maxHp) <= 0.5) {
        this.summonedHalf = true;
        for (let i = 0; i < 2; i++) {
          game.enemies.push(new Enemy("mail_monster", this.x + (i * 40 - 20), this.y));
        }
        game.addFloatingText(this.x, this.y - 30, "召集邮件轰炸！", "#f43f5e", 14);
      }
    }
    // 项目经理 技能
    else if (this.typeId === "pm") {
      // 每7秒召唤3个需求球
      if (this.skillTimer >= this.conf.summonDemandCd) {
        this.skillTimer = 0;
        for (let i = 0; i < 3; i++) {
          const offsetAngle = (i * Math.PI * 2) / 3;
          game.enemies.push(new Enemy("demand_ball", this.x + Math.cos(offsetAngle) * 30, this.y + Math.sin(offsetAngle) * 30));
        }
        game.addFloatingText(this.x, this.y - 30, "需求排期又加了！", "#0284c7", 14);
      }
    }

    // 接触伤害 (40%受击退)
    if (dist <= this.radius + player.radius) {
      const now = Date.now();
      if (now - this.lastContactDmgTime >= PLAYER_BASE.contactDmgCd * 1000) {
        this.lastContactDmgTime = now;
        player.takeDamage(this.damage, this, game);
      }
    }
  }

  takeDamage(amount, isCrit, game, knockback = null) {
    if (!this.alive) return;
    const reduced = amount * (1 - this.dmgReduction);
    this.hp -= reduced;
    game.addDamageNumber(this.x, this.y, reduced, isCrit);

    if (knockback) {
      const kx = this.x - knockback.x;
      const ky = this.y - knockback.y;
      const kdist = Math.hypot(kx, ky) || 1;
      this.x += (kx / kdist) * knockback.force * 0.016; // 40%击退抵抗
      this.y += (ky / kdist) * knockback.force * 0.016;
    }

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.alive = false;
    game.player.kills++;
    game.player.reducePressure(8, game); // 击杀精英 -8 压力

    // 经验掉落
    game.drops.push(new DropItem(this.x, this.y, 'big_xp', this.conf.xpDrop));

    // 神器 / 治疗掉落
    if (Math.random() < this.conf.artifactChance) {
      game.drops.push(new DropItem(this.x + 15, this.y, 'artifact'));
    } else {
      game.drops.push(new DropItem(this.x + 15, this.y, 'coffee'));
    }

    sound.playExplosion(true);
    game.addFloatingText(this.x, this.y - 30, `击败精英 ${this.name}！`, "#f59e0b", 18);
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${this.size * 1.3}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.icon, this.x, this.y);

    // 精英血条与名字
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(this.x - 24, this.y - this.size - 12, 48, 5);
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(this.x - 24, this.y - this.size - 12, 48 * (this.hp / this.maxHp), 5);

    ctx.font = "bold 11px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`[精英] ${this.name}`, this.x, this.y - this.size - 18);

    ctx.restore();
  }
}

// Boss：主管
export class SupervisorBoss {
  constructor(x, y) {
    this.conf = BOSS_CONFIG;
    this.name = this.conf.name;
    this.x = x;
    this.y = y;
    this.maxHp = this.conf.hp;
    this.hp = this.maxHp;
    this.damage = this.conf.damage;
    this.dmgReduction = this.conf.dmgReduction;
    this.speed = this.conf.speed;
    this.size = this.conf.size;
    this.radius = this.conf.size;
    this.isBoss = true;
    this.alive = true;
    this.currentPhase = 1; // 1, 2, 3
    this.phaseEntered = { p2: false, p3: false };
    this.skillState = "idle";
    this.skillTimer = 0;
    this.actionQueueTimer = 0;
    this.overtimeTonightActive = false;
    this.overtimeTimer = 0;
    this.redDotSpawnTimer = 0;
    this.lastContactDmgTime = 0;
  }

  update(dt, player, game) {
    if (!this.alive) return;

    // 阶段检测
    const hpPct = this.hp / this.maxHp;
    if (hpPct <= 0.35 && !this.phaseEntered.p3) {
      this.currentPhase = 3;
      this.phaseEntered.p3 = true;
      this.startPhase3(game);
    } else if (hpPct <= 0.70 && !this.phaseEntered.p2) {
      this.currentPhase = 2;
      this.phaseEntered.p2 = true;
      this.startPhase2(game);
    }

    // 移动与技能循环
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    this.x += nx * this.speed * (this.overtimeTonightActive ? 1.2 : 1.0) * dt;
    this.y += ny * this.speed * (this.overtimeTonightActive ? 1.2 : 1.0) * dt;

    this.actionQueueTimer += dt;
    const interval = this.currentPhase === 3 ? 3.5 : (this.currentPhase === 2 ? 4.5 : 5.5);

    if (this.actionQueueTimer >= interval) {
      this.actionQueueTimer = 0;
      this.castNextSkill(player, game);
    }

    // P3 加班状态逻辑
    if (this.overtimeTonightActive) {
      this.overtimeTimer -= dt;
      this.redDotSpawnTimer += dt;
      if (this.redDotSpawnTimer >= this.conf.skills.overtime_tonight.redDotInterval) {
        this.redDotSpawnTimer = 0;
        for (let i = 0; i < 2; i++) {
          game.enemies.push(new Enemy("red_dot", this.x + (i * 30 - 15), this.y));
        }
      }
      if (this.overtimeTimer <= 0) {
        this.overtimeTonightActive = false;
      }
    }

    // 接触伤害
    if (dist <= this.radius + player.radius) {
      const now = Date.now();
      if (now - this.lastContactDmgTime >= PLAYER_BASE.contactDmgCd * 1000) {
        this.lastContactDmgTime = now;
        player.takeDamage(this.damage, this, game);
      }
    }
  }

  castNextSkill(player, game) {
    const r = Math.random();
    if (this.currentPhase === 1) {
      if (r < 0.5) this.castFileRain(player, game);
      else this.castProgressReport(player, game);
    } else if (this.currentPhase === 2) {
      if (r < 0.35) this.castFileRain(player, game);
      else if (r < 0.7) this.castDemand(player, game);
      else this.castProgressReport(player, game);
    } else {
      if (r < 0.35) this.castDemand(player, game);
      else if (r < 0.7) this.castFileRain(player, game);
      else this.castProgressReport(player, game);
    }
  }

  startPhase2(game) {
    game.addFloatingText(this.x, this.y - 40, "P2：来开个会！", "#a855f7", 20);
    sound.playBossWarning();
    // 召唤3个会议区
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const dist = 120 + Math.random() * 80;
      game.aoeZones.push(new AOEZone({
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        radius: this.conf.skills.meeting.radius,
        duration: this.conf.skills.meeting.duration,
        slowPct: this.conf.skills.meeting.slowPct,
        type: "meeting_slow"
      }));
    }
  }

  startPhase3(game) {
    this.overtimeTonightActive = true;
    this.overtimeTimer = this.conf.skills.overtime_tonight.duration;
    game.addFloatingText(this.x, this.y - 40, "P3：今晚加个班！", "#dc2626", 22);
    sound.playBossWarning();
  }

  castFileRain(player, game) {
    game.addFloatingText(this.x, this.y - 30, "这个今天能做完吧？", "#ef4444", 16);
    const count = this.conf.skills.file_rain.count;
    const interval = this.conf.skills.file_rain.interval;
    const radius = this.conf.skills.file_rain.radius;
    const dmg = this.conf.skills.file_rain.damage;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!this.alive || !player.alive) return;
        const targetX = player.x;
        const targetY = player.y;
        game.aoeZones.push(new AOEZone({
          x: targetX,
          y: targetY,
          radius: radius,
          duration: 0.75,
          type: "boss_warning_circle",
          onComplete: () => {
            sound.playExplosion(false);
            if (Math.hypot(player.x - targetX, player.y - targetY) <= radius + player.radius) {
              player.takeDamage(dmg, this, game, true);
            }
          }
        }));
      }, i * interval * 1000);
    }
  }

  castProgressReport(player, game) {
    game.addFloatingText(this.x, this.y - 30, "汇报一下进度！", "#ef4444", 16);
    const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
    for (let wave = 0; wave < 3; wave++) {
      setTimeout(() => {
        if (!this.alive) return;
        [-0.35, 0, 0.35].forEach(offset => {
          const angle = baseAngle + offset;
          game.projectiles.push(new Projectile({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * this.conf.skills.progress_report.bulletSpeed,
            vy: Math.sin(angle) * this.conf.skills.progress_report.bulletSpeed,
            damage: this.conf.skills.progress_report.damage,
            radius: 7,
            life: 3.5,
            isEnemy: true,
            type: "boss_bullet",
            color: "#dc2626"
          }));
        });
      }, wave * 180);
    }
  }

  castDemand(player, game) {
    const count = this.currentPhase === 3 ? 6 : 4;
    game.addFloatingText(this.x, this.y - 30, `临时需求 ×${count}！`, "#f59e0b", 16);
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      game.enemies.push(new Enemy("demand_ball", this.x + Math.cos(angle) * 45, this.y + Math.sin(angle) * 45));
    }
  }

  takeDamage(amount, isCrit, game) {
    if (!this.alive) return;
    const reduced = amount * (1 - this.dmgReduction);
    this.hp -= reduced;
    game.addDamageNumber(this.x, this.y, reduced, isCrit);

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.alive = false;
    game.triggerSlowMotion(0.35, 0.2); // 0.35秒慢动作
    // 清除全场敌方子弹
    game.projectiles = game.projectiles.filter(p => !p.isEnemy);
    // 掉落发光下班卡
    game.drops.push(new DropItem(this.x, this.y, 'punch_card'));
    sound.playVictory();
    game.addFloatingText(this.x, this.y - 40, "🎉 主管已被击败！快拿【下班卡】！", "#fbbf24", 22);
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = "#dc2626";
    ctx.shadowBlur = 25;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${this.size * 1.3}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.conf.icon, this.x, this.y);

    // Boss 顶部巨大血条
    const mapW = ctx.canvas.width;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(mapW / 2 - 160, 48, 320, 14);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(mapW / 2 - 160, 48, 320 * (this.hp / this.maxHp), 14);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mapW / 2 - 160, 48, 320, 14);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.textAlign = "center";
    ctx.fillText(`【${this.conf.title}】${this.name} (${Math.round(this.hp)} / ${this.maxHp}) - P${this.currentPhase}`, mapW / 2, 42);

    ctx.restore();
  }
}
