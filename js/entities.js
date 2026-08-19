/**
 * 《今天也不想上班》- 实体系统 (Player, Enemies, Boss, Weapons, Projectiles, Drops, VFX)
 * V1.4 升级版 - 削弱范围武器初始范围、缩短残留为2秒、支持一周6大独立Boss状态机
 */

import { M_TO_PX, PLAYER_BASE, PRESSURE_STAGES, WEAPONS, SKILLS, ARTIFACTS, NORMAL_ENEMIES, ELITES, CHARACTERS, STAGES_CONFIG } from './constants.js';
import { sound } from './audio.js';

// 伤害与回复飘字
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
    this.vy = isCrit ? -45 : (isHeal ? -40 : -30);
    this.vx = (Math.random() - 0.5) * 20;
    this.scale = isCrit ? 1.4 : (isHeal ? 1.2 : 1.0);
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 35 * dt;
  }

  draw(ctx) {
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    ctx.font = this.isCrit ? "bold 18px 'Segoe UI', Arial" : (this.isHeal ? "bold 15px 'Segoe UI', Arial" : "13px 'Segoe UI', Arial");
    ctx.textAlign = "center";

    if (this.isHeal) {
      ctx.fillStyle = "#34d399";
      ctx.strokeStyle = "#064e3b";
    } else if (this.isCrit) {
      ctx.fillStyle = "#fbbf24";
      ctx.strokeStyle = "#b45309";
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#1f2937";
    }

    ctx.lineWidth = 2.5;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// 提示飘字
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
  constructor(x, y, vx, vy, color, size, life, shape = "circle") {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.shape = shape;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.94;
    this.vy *= 0.94;
  }

  draw(ctx) {
    ctx.save();
    const ratio = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = ratio;
    ctx.fillStyle = this.color;

    if (this.shape === "spark") {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    } else if (this.shape === "square") {
      const s = this.size * ratio;
      ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * ratio, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// 掉落物类 (立体发光菱形经验晶石、热气咖啡杯)
export class DropItem {
  constructor(x, y, type, value = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = value;
    this.radius = type === 'punch_card' ? 18 : (type === 'artifact' ? 16 : (type === 'coffee' ? 14 : (type === 'big_xp' ? 12 : 9)));
    this.alive = true;
    this.animTime = Math.random() * Math.PI * 2;
  }

  update(dt, player, game = null) {
    this.animTime += dt * 3;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < player.pickupRadius || this.type === 'punch_card') {
      const speed = player.pickupSpeed * (this.type === 'punch_card' ? 1.5 : 1.2);
      this.x += (dx / dist) * speed * dt;
      this.y += (dy / dist) * speed * dt;

      if (Math.random() < 0.35 && game) {
        const trailColor = this.type === 'xp' ? '#38bdf8' : (this.type === 'big_xp' ? '#fbbf24' : '#34d399');
        game.particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, trailColor, 3, 0.25));
      }

      if (dist < player.radius + this.radius) {
        this.alive = false;
        player.collectDrop(this, game);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    const bob = Math.sin(this.animTime) * 4;
    const drawY = this.y + bob;
    const rot = this.animTime * 0.8;

    if (this.type === 'xp') {
      ctx.translate(this.x, drawY);
      ctx.rotate(rot);
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.moveTo(0, -9); ctx.lineTo(7, 0); ctx.lineTo(0, 9); ctx.lineTo(-7, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#7dd3fc";
      ctx.beginPath();
      ctx.moveTo(0, -9); ctx.lineTo(4, 0); ctx.lineTo(0, 4); ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'big_xp') {
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(this.x, drawY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "bold 10px 'Segoe UI', Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EXP+", this.x, drawY);
    } else if (this.type === 'coffee') {
      ctx.shadowColor = "#34d399";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.x, drawY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☕", this.x, drawY);

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 10px Arial";
      ctx.fillText("+HP", this.x, drawY - 14);
    } else if (this.type === 'artifact') {
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
      ctx.beginPath();
      ctx.arc(this.x, drawY, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "22px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🎁", this.x, drawY);
    } else if (this.type === 'punch_card') {
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(this.x - 16, drawY - 10, 32, 20);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 16, drawY - 10, 32, 20);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("下班卡", this.x, drawY);
    }

    ctx.restore();
  }
}

// 弹道类
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
    this.type = options.type || "keycap";
    this.color = options.color || "#38bdf8";
    this.targetX = options.targetX;
    this.targetY = options.targetY;
    this.onExplode = options.onExplode || null;
    this.alive = true;
    this.knockback = options.knockback || false;
    this.rotation = Math.random() * Math.PI * 2;
  }

  update(dt, game) {
    this.life -= dt;
    this.rotation += dt * 8;

    if (this.life <= 0) {
      this.alive = false;
      if ((this.type === "resignation_bomb" || this.type === "water_cup_lob") && this.onExplode) {
        this.onExplode(this.x, this.y);
      }
      return;
    }

    if (this.type === "resignation_bomb" || this.type === "water_cup_lob") {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      const speed = 420;
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
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.atan2(this.vy, this.vx));

      ctx.fillStyle = this.isEvo ? "#dc2626" : "#f1f5f9";
      ctx.strokeStyle = this.isEvo ? "#991b1b" : "#64748b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-7, -7, 14, 14, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.isEvo ? "#fef08a" : "#0f172a";
      ctx.font = "bold 9px 'Segoe UI', Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.isEvo ? "!" : "K", 0, 0);
    } else if (this.type === "resignation_bomb") {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📄", 0, 0);
    } else if (this.type === "water_cup_lob") {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.isEvo ? "🪣" : "🫗", 0, 0);
    } else if (this.type === "mail_bullet" || (this.isEnemy && this.type === "enemy_bullet")) {
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.atan2(this.vy, this.vx));

      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 8;
      ctx.fillRect(-7, -4, 14, 8);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(-7, -4, 14, 8);

      ctx.beginPath();
      ctx.moveTo(-7, -4); ctx.lineTo(0, 1); ctx.lineTo(7, -4);
      ctx.stroke();
    } else if (this.type === "paper_fan") {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.fillRect(-6, -8, 12, 16);
      ctx.strokeRect(-6, -8, 12, 16);
    } else if (this.type === "boss_bullet") {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = "#dc2626";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("KPI", 0, 0);
    }

    ctx.restore();
  }
}

// AOE区域类 (削弱初始范围，缩短残留为2秒)
export class AOEZone {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius || 50;
    this.duration = options.duration || 2.0; // 默认缩短为 2 秒
    this.maxDuration = this.duration;
    this.type = options.type;
    this.damage = options.damage || 0;
    this.tickInterval = options.tickInterval || 0.5;
    this.tickTimer = 0;
    this.slowPct = options.slowPct || 0;
    this.alive = true;
    this.color = options.color || "rgba(239, 68, 68, 0.3)";
    this.onComplete = options.onComplete || null;
    this.isEvo = options.isEvo || false;
    this.angle = options.angle || 0;
    this.arc = options.arc || Math.PI * 2;
    this.hitEnemies = new Set();
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

    if (this.type === "sonic_wave") {
      const progress = 1 - (this.duration / this.maxDuration);
      const curRadius = this.radius * progress;
      game.enemies.forEach(enemy => {
        if (enemy.alive && !this.hitEnemies.has(enemy)) {
          const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (dist <= curRadius + enemy.radius) {
            this.hitEnemies.add(enemy);
            enemy.takeDamage(this.damage, false, game, { x: this.x, y: this.y, force: this.isEvo ? 350 : 200 });
          }
        }
      });
      if (this.isEvo) {
        game.projectiles.forEach(p => {
          if (p.isEnemy && Math.hypot(p.x - this.x, p.y - this.y) <= curRadius + p.radius) {
            p.alive = false;
          }
        });
      }
    } else if (this.type === "water_puddle") {
      this.tickTimer += dt;
      if (this.tickTimer >= this.tickInterval) {
        this.tickTimer = 0;
        game.enemies.forEach(enemy => {
          if (enemy.alive && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.radius + enemy.radius) {
            enemy.takeDamage(this.damage, false, game);
            if (this.slowPct > 0) {
              enemy.speed = enemy.baseSpeed * (1 - this.slowPct);
            }
          }
        });
        if (this.isEvo && game.player && Math.hypot(game.player.x - this.x, game.player.y - this.y) <= this.radius + game.player.radius) {
          game.player.heal(game.player.maxHp * 0.015, game, true);
        }
      }
    } else if (this.type === "resignation_pool") {
      this.tickTimer += dt;
      if (this.tickTimer >= this.tickInterval) {
        this.tickTimer = 0;
        game.enemies.forEach(enemy => {
          if (enemy.alive && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= this.radius + enemy.radius) {
            enemy.takeDamage(this.damage, false, game);
          }
        });
      }
    } else if (this.type === "electric_whip") {
      game.enemies.forEach(enemy => {
        if (enemy.alive && !this.hitEnemies.has(enemy)) {
          const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (dist <= this.radius + enemy.radius) {
            const eAngle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
            let diff = Math.abs(eAngle - this.angle);
            while (diff > Math.PI) diff -= Math.PI * 2;
            diff = Math.abs(diff);

            if (this.arc >= Math.PI * 1.9 || diff <= this.arc / 2) {
              this.hitEnemies.add(enemy);
              enemy.takeDamage(this.damage, false, game, { x: this.x, y: this.y, force: 160 });
              for (let k = 0; k < 3; k++) {
                game.particles.push(new Particle(enemy.x, enemy.y, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70, "#38bdf8", 3, 0.2, "spark"));
              }
            }
          }
        }
      });
    }
  }

  draw(ctx) {
    ctx.save();
    const progress = 1 - (this.duration / this.maxDuration);

    if (this.type === "sonic_wave") {
      const curR = this.radius * progress;
      ctx.strokeStyle = this.isEvo ? `rgba(239, 68, 68, ${1 - progress})` : `rgba(56, 189, 248, ${1 - progress})`;
      ctx.lineWidth = this.isEvo ? 5 : 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, curR, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === "water_puddle") {
      ctx.fillStyle = this.isEvo ? "rgba(6, 182, 212, 0.3)" : "rgba(56, 189, 248, 0.2)";
      ctx.strokeStyle = this.isEvo ? "#06b6d4" : "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#e0f2fe";
      ctx.font = "bold 9px Arial";
      ctx.textAlign = "center";
      ctx.fillText(this.isEvo ? "🌊 八杯水" : "💧 水洼 (2s)", this.x, this.y);
    } else if (this.type === "resignation_pool") {
      ctx.fillStyle = "rgba(244, 63, 94, 0.2)";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#fda4af";
      ctx.font = "9px Arial";
      ctx.textAlign = "center";
      ctx.fillText("离职情绪 (2s)", this.x, this.y);
    } else if (this.type === "electric_whip") {
      ctx.strokeStyle = this.isEvo ? "#f59e0b" : "#38bdf8";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = this.isEvo ? "#fbbf24" : "#0284c7";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, this.angle - this.arc / 2, this.angle + this.arc / 2);
      ctx.stroke();
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

// 玩家类 (4大职业)
export class Player {
  constructor(x, y, characterId = "xiaochen", metaTalents = {}) {
    this.x = x;
    this.y = y;
    this.radius = 16;
    this.alive = true;
    this.characterId = characterId;
    this.charConf = CHARACTERS[characterId] || CHARACTERS.xiaochen;

    const hpBonus = 1 + (metaTalents.health_check || 0) * 0.03;
    const dmgBonus = 1 + (metaTalents.skilled_worker || 0) * 0.04;
    const spdBonus = 1 + (metaTalents.fast_runner || 0) * 0.025;
    const xpBonus = 1 + (metaTalents.slacker_xp || 0) * 0.04;
    const bleedResist = (metaTalents.mental_construction || 0) * 0.0025;

    this.maxHp = this.charConf.baseStats.maxHp * hpBonus;
    this.hp = this.maxHp;
    this.baseMoveSpeed = this.charConf.baseStats.moveSpeed * spdBonus;
    this.moveSpeed = this.baseMoveSpeed;
    this.damageMult = this.charConf.baseStats.damageMult * dmgBonus;
    this.critRate = this.charConf.baseStats.critRate;
    this.critDmg = this.charConf.baseStats.critDmg;
    this.xpMult = this.charConf.baseStats.xpMult * xpBonus;
    this.pickupRadius = this.charConf.baseStats.pickupRadius;
    this.pickupSpeed = 8.0 * M_TO_PX;
    this.bleedResist = bleedResist;

    this.weapons = {};
    this.weapons[this.charConf.initialWeapon] = 1;
    this.skills = {};
    this.artifacts = {};
    this.evolvedWeapons = {};

    this.pressure = 0;
    this.maxPressure = 100;
    this.highestPressure = 0;
    this.collapseTimer = 0;
    this.isCollapsed = false;
    this.lastHurtTime = 0;

    this.isDodging = false;
    this.dodgeTimer = 0;
    this.dodgeDuration = PLAYER_BASE.dodgeDuration;
    this.dodgeCooldown = PLAYER_BASE.dodgeCooldown;
    this.dodgeCooldownTimer = 0;
    this.dodgeVx = 0;
    this.dodgeVy = 0;
    this.nextHitGuaranteedCrit = false;
    this.perfectDodgeCount = 0;
    this.invulnerableTimer = 0;

    this.activeSkillCdTimer = 0;
    this.activeSkillDurationTimer = 0;

    this.keyboardTimer = 0;
    this.keyboardShotCount = 0;
    this.mugAngle = 0;
    this.mugShockwaveTimer = 0;
    this.resignationTimer = 0;
    this.headphonesTimer = 0;
    this.waterCupTimer = 0;
    this.chargingCableTimer = 0;

    this.levelUpSpeedTimer = 0;
    this.shieldReady = false;
    this.shieldTimer = 0;
    this.paidSlackingTimer = 0;
    this.standTimer = 0;
    this.toiletExcuseTimer = 0;
    this.quitModeTimer = 0;

    this.paletteStormAngle = 0;
    this.stealthTimer = 0;

    this.paidPoopTimer = 0;
    this.paidPoopInvulnTimer = 0;
    this.wifiCutTimer = 0;
    this.wifiDisabledTimer = 0;
    this.revivedOnce = false;

    this.faceX = 1;
    this.faceY = 0;
    this.lastMoveX = 0;
    this.lastMoveY = 0;
    this.level = 1;
    this.xp = 0;
    this.kills = 0;
    this.gold = 0;
    this.debuffDmgReductionTimer = 0;
    this.slowEffectMult = 1.0;
  }

  update(dt, inputDir, game) {
    if (!this.alive) return;

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
    if (this.stealthTimer > 0) this.stealthTimer -= dt;

    this.updatePressure(dt, game);
    this.updateMovement(dt, inputDir, game);
    this.updatePassives(dt, game);
    this.updateAllWeapons(dt, game);
  }

  updatePressure(dt, game) {
    if (this.pressure > this.highestPressure) {
      this.highestPressure = this.pressure;
    }

    if (this.isCollapsed) {
      this.collapseTimer -= dt;
      const drainRate = Math.max(0.01, 0.04 - this.bleedResist);
      const drainHp = this.maxHp * drainRate * dt;
      this.hp -= drainHp;
      if (this.hp <= 0) {
        this.die(game);
        return;
      }

      if (this.collapseTimer <= 0) {
        this.isCollapsed = false;
        const resetVal = (this.skills.quit && this.skills.quit > 0) ? 40 : 55;
        this.pressure = resetVal;
        game.addFloatingText(this.x, this.y - 20, "压力释放", "#38bdf8");
      }
    } else {
      const timeSinceHurt = (Date.now() - this.lastHurtTime) / 1000;
      if (timeSinceHurt >= 20.0 && this.pressure > 30) {
        this.pressure = Math.max(30, this.pressure - 1.0 * dt);
      }

      if (this.pressure >= 100) {
        this.triggerCollapse(game);
      }
    }

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
    if (this.skills.kpi && this.skills.kpi > 0) {
      mult += SKILLS.kpi.pressureGain[this.skills.kpi - 1];
    }
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
    if (this.isDodging) {
      this.dodgeTimer -= dt;
      this.x += this.dodgeVx * dt;
      this.y += this.dodgeVy * dt;

      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        if (this.skills.toilet_excuse && this.skills.toilet_excuse > 0) {
          this.toiletExcuseTimer = SKILLS.toilet_excuse.safeDur[this.skills.toilet_excuse - 1];
        }
      }
      this.clampPosition(game);
      return;
    }

    let speed = this.baseMoveSpeed;
    if (this.skills.on_time_off) {
      speed *= (1 + SKILLS.on_time_off.spdBonus[this.skills.on_time_off - 1]);
    }
    if (this.levelUpSpeedTimer > 0) {
      speed *= 1.20;
    }
    if (this.stealthTimer > 0) {
      speed *= 1.40;
    }

    let slow = this.slowEffectMult;
    if (this.artifacts.noise_cancelling_headphones) {
      slow = 1.0;
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
    this.checkPerfectDodge(game);
  }

  checkPerfectDodge(game) {
    let triggered = false;
    game.projectiles.forEach(p => {
      if (p.alive && p.isEnemy) {
        const dist = Math.hypot(p.x - this.x, p.y - this.y);
        if (dist < 75) triggered = true;
      }
    });

    if (!triggered) {
      game.enemies.forEach(e => {
        if (e.alive) {
          const dist = Math.hypot(e.x - this.x, e.y - this.y);
          if (dist < e.radius + this.radius + 35) triggered = true;
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

    let cd = this.charConf.active.cd;
    if (this.artifacts.company_wifi) cd *= 0.70;
    if (this.artifacts.boss_keyboard) cd *= 1.15;

    this.activeSkillCdTimer = cd;
    this.activeSkillDurationTimer = this.charConf.active.duration;

    if (this.characterId === "xiaochen") {
      sound.playLevelUp();
      game.addFloatingText(this.x, this.y - 25, "🔥 疯狂输出！", "#ef4444", 18);
    } else if (this.characterId === "awei") {
      sound.playExplosion(true);
      game.addFloatingText(this.x, this.y - 30, "⚡ 系统崩溃！全屏冻结！", "#38bdf8", 20);
      game.enemies.forEach(e => {
        if (e.alive) {
          e.takeDamage(130 * this.getDamageMultiplier(), true, game);
          e.speed = 0;
          setTimeout(() => { if (e.alive) e.speed = e.baseSpeed; }, 3000);
        }
      });
    } else if (this.characterId === "lili") {
      sound.playSonicWave(true);
      game.addFloatingText(this.x, this.y - 25, "🎨 改稿风暴！", "#ec4899", 18);
    } else if (this.characterId === "xiaozhang") {
      sound.playPerfectDodge();
      this.stealthTimer = 3.0;
      this.invulnerableTimer = 3.0;
      game.addFloatingText(this.x, this.y - 25, "🏃 假装很忙！隐身洒豆", "#fbbf24", 18);
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          if (this.alive) {
            game.aoeZones.push(new AOEZone({
              x: this.x, y: this.y, radius: 2.0 * M_TO_PX, duration: 2.0, damage: 30 * this.getDamageMultiplier(), type: "water_puddle"
            }));
          }
        }, i * 800);
      }
    }
  }

  updatePassives(dt, game) {
    if (this.skills.shield && !this.shieldReady) {
      this.shieldTimer += dt;
      const needed = SKILLS.shield.interval[this.skills.shield - 1];
      if (this.shieldTimer >= needed) {
        this.shieldReady = true;
        this.shieldTimer = 0;
        game.addFloatingText(this.x, this.y - 20, "🛡️ 护盾就绪", "#38bdf8");
      }
    }

    if (this.skills.paid_slacking) {
      this.paidSlackingTimer += dt;
      const interval = SKILLS.paid_slacking.interval[this.skills.paid_slacking - 1];
      if (this.paidSlackingTimer >= interval) {
        this.paidSlackingTimer = 0;
        this.heal(this.maxHp * SKILLS.paid_slacking.healPct, game);
      }
    }

    if (this.skills.lunch_break && this.standTimer >= SKILLS.lunch_break.standTime) {
      const healRate = SKILLS.lunch_break.healPerSec[this.skills.lunch_break - 1];
      this.heal(this.maxHp * healRate * dt, game, true);
    }

    if (this.artifacts.paid_poop) {
      this.paidPoopTimer += dt;
      if (this.paidPoopTimer >= 28.0) {
        this.paidPoopTimer = 0;
        this.paidPoopInvulnTimer = 2.0;
        game.addFloatingText(this.x, this.y - 20, "🧻 带薪拉屎 (无敌2s)", "#a855f7");
      }
    }

    if (this.artifacts.company_wifi) {
      this.wifiCutTimer += dt;
      if (this.wifiCutTimer >= 45.0) {
        this.wifiCutTimer = 0;
        this.wifiDisabledTimer = 2.0;
        game.addFloatingText(this.x, this.y - 20, "📶 公司微断网", "#9ca3af");
      }
    }

    if (this.characterId === "lili" && this.activeSkillDurationTimer > 0) {
      this.paletteStormAngle += dt * 8;
      const stormRadius = 2.8 * M_TO_PX;
      game.enemies.forEach(e => {
        if (e.alive && Math.hypot(e.x - this.x, e.y - this.y) <= stormRadius + e.radius) {
          e.takeDamage(24 * this.getDamageMultiplier() * dt * 10, false, game);
        }
      });
      game.projectiles.forEach(p => {
        if (p.isEnemy && Math.hypot(p.x - this.x, p.y - this.y) <= stormRadius) {
          p.alive = false;
        }
      });
    }
  }

  updateAllWeapons(dt, game) {
    if (this.paidPoopInvulnTimer > 0) return;

    if (this.weapons.keyboard) this.updateKeyboard(dt, game);
    if (this.weapons.mug) this.updateMug(dt, game);
    if (this.weapons.resignation) this.updateResignation(dt, game);
    if (this.weapons.headphones) this.updateHeadphones(dt, game);
    if (this.weapons.water_cup) this.updateWaterCup(dt, game);
    if (this.weapons.charging_cable) this.updateChargingCable(dt, game);
  }

  getAttackSpeedMult() {
    let mult = 1.0;
    if (this.skills.coffee) mult += SKILLS.coffee.values[this.skills.coffee - 1];
    if (this.pressure >= 80) mult += PRESSURE_STAGES.RESIGN_MOOD.atkSpd;
    else if (this.pressure >= 60) mult += PRESSURE_STAGES.IRRITABLE.atkSpd;
    else if (this.pressure >= 30) mult += PRESSURE_STAGES.ANNOYED.atkSpd;

    if (this.characterId === "xiaochen" && this.activeSkillDurationTimer > 0) mult += 0.70;
    if (this.skills.last_minute_rush && (this.hp / this.maxHp) <= 0.40) {
      mult += SKILLS.last_minute_rush.atkSpdBonus[this.skills.last_minute_rush - 1];
    }
    return mult;
  }

  getDamageMultiplier() {
    let mult = this.damageMult;
    if (this.skills.kpi) mult += SKILLS.kpi.dmgBonus[this.skills.kpi - 1];
    if (this.skills.dual_screen && this.skills.dual_screen >= 2) mult += SKILLS.dual_screen.dmgBonus[this.skills.dual_screen - 1];
    if (this.skills.boss_is_coming && this.pressure >= 60) mult += SKILLS.boss_is_coming.highPressureDmg[this.skills.boss_is_coming - 1];
    if (this.quitModeTimer > 0 && this.skills.quit) mult += SKILLS.quit.quitDmg[this.skills.quit - 1];
    if (this.pressure >= 80) mult += PRESSURE_STAGES.RESIGN_MOOD.dmg;
    else if (this.pressure >= 60) mult += PRESSURE_STAGES.IRRITABLE.dmg;

    if (this.characterId === "xiaochen" && this.activeSkillDurationTimer > 0) mult += 0.25;
    if (this.artifacts.boss_keyboard) mult += 0.40;
    if (this.debuffDmgReductionTimer > 0) mult *= 0.80;
    return Math.max(0.25, mult);
  }

  getCritRate() {
    let rate = this.critRate;
    if (this.skills.keyboard_warrior) rate += SKILLS.keyboard_warrior.critRate[this.skills.keyboard_warrior - 1];
    if (this.pressure >= 80) rate += PRESSURE_STAGES.RESIGN_MOOD.crit;
    if (this.skills.last_minute_rush && (this.hp / this.maxHp) <= 0.40) rate += SKILLS.last_minute_rush.critBonus[this.skills.last_minute_rush - 1];
    return Math.min(0.75, rate);
  }

  getCritDamage() {
    let mult = this.critDmg;
    if (this.skills.keyboard_warrior && this.skills.keyboard_warrior >= 4) {
      mult += SKILLS.keyboard_warrior.critDmg[this.skills.keyboard_warrior - 1];
    }
    return mult;
  }

  // 1. 机械键盘
  updateKeyboard(dt, game) {
    const isEvo = !!this.evolvedWeapons.keyboard;
    const lvl = this.weapons.keyboard;
    let baseInterval = 0.52;
    if (lvl >= 3) baseInterval *= 0.85;
    if (isEvo) baseInterval *= 0.72;

    const interval = baseInterval / this.getAttackSpeedMult();
    this.keyboardTimer += dt;

    if (this.keyboardTimer >= interval) {
      this.keyboardTimer = 0;
      this.keyboardShotCount++;

      const target = game.getNearestEnemy(this.x, this.y, 8.0 * M_TO_PX);
      if (target) {
        let baseDmg = 14;
        if (lvl >= 2) baseDmg *= 1.20;
        if (lvl >= 5) baseDmg *= 1.25;
        const finalDmg = baseDmg * this.getDamageMultiplier();

        let count = 1;
        if (this.skills.dual_screen) count += SKILLS.dual_screen.projectiles[this.skills.dual_screen - 1];
        if (lvl >= 4) count += 1;
        if (isEvo) count += 1;

        const pierce = (lvl >= 5 || isEvo) ? 1 : 0;

        for (let i = 0; i < count; i++) {
          const spread = (i - (count - 1) / 2) * 0.15;
          const angle = Math.atan2(target.y - this.y, target.x - this.x) + spread;
          const speed = 460;
          game.projectiles.push(new Projectile({
            x: this.x, y: this.y,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            damage: finalDmg, radius: 7, life: 1.5, pierce: pierce, isEvo: isEvo, type: "keycap"
          }));
        }
        sound.playKeyboardShot(isEvo);
      }
    }
  }

  // 2. 马克杯
  updateMug(dt, game) {
    const isEvo = !!this.evolvedWeapons.mug;
    const lvl = this.weapons.mug;
    let count = 1;
    if (lvl >= 3) count = 2;
    if (lvl >= 5) count = 3;
    if (isEvo) count = 4;

    let rotSpeed = 2.4;
    if (lvl >= 2) rotSpeed *= 1.25;
    this.mugAngle += rotSpeed * dt;

    let radius = 2.2 * M_TO_PX;
    if (lvl >= 4) radius *= 1.10;
    if (this.skills.loudspeaker_meeting) radius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);

    let baseDmg = 18;
    if (lvl >= 4) baseDmg *= 1.25;
    const finalDmg = baseDmg * this.getDamageMultiplier();

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

    if (isEvo) {
      this.mugShockwaveTimer += dt;
      if (this.mugShockwaveTimer >= 7.0) {
        this.mugShockwaveTimer = 0;
        let shockRadius = 3.5 * M_TO_PX;
        if (this.skills.loudspeaker_meeting) shockRadius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);
        game.enemies.forEach(enemy => {
          if (enemy.alive && Math.hypot(enemy.x - this.x, enemy.y - this.y) <= shockRadius + enemy.radius) {
            enemy.takeDamage(finalDmg * 1.3, true, game, { x: this.x, y: this.y, force: 280 });
          }
        });
        sound.playExplosion(false);
        game.addFloatingText(this.x, this.y - 30, "☕ 咖啡海啸！", "#38bdf8", 16);
      }
    }
  }

  // 3. 辞职信 (缩短地面腐蚀池为2.0s)
  updateResignation(dt, game) {
    const isEvo = !!this.evolvedWeapons.resignation;
    const lvl = this.weapons.resignation;
    let baseInterval = isEvo ? 2.2 : 2.0;
    if (lvl >= 5 && !isEvo) baseInterval *= 0.80;
    const interval = baseInterval / this.getAttackSpeedMult();

    this.resignationTimer += dt;
    if (this.resignationTimer >= interval) {
      this.resignationTimer = 0;
      const target = game.getDenseEnemyClusterTarget(this.x, this.y, 10 * M_TO_PX) || game.getNearestEnemy(this.x, this.y, 10 * M_TO_PX);
      if (target) {
        let baseDmg = 45;
        if (lvl >= 3) baseDmg *= 1.25;
        if (lvl >= 5) baseDmg *= 1.25;
        if (isEvo) baseDmg *= 1.90;
        const finalDmg = baseDmg * this.getDamageMultiplier();

        let baseRadius = isEvo ? (3.4 * M_TO_PX) : (1.8 * M_TO_PX);
        if (lvl >= 2 && !isEvo) baseRadius *= 1.20;
        if (isEvo && this.pressure >= 80) baseRadius *= 1.25;
        if (this.skills.loudspeaker_meeting) baseRadius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);

        const tx = target.x;
        const ty = target.y;

        game.projectiles.push(new Projectile({
          x: this.x, y: this.y, targetX: tx, targetY: ty, damage: finalDmg, type: "resignation_bomb",
          onExplode: (ex, ey) => {
            sound.playExplosion(isEvo);
            game.enemies.forEach(enemy => {
              if (enemy.alive && Math.hypot(enemy.x - ex, enemy.y - ey) <= baseRadius + enemy.radius) {
                enemy.takeDamage(finalDmg, false, game, { x: ex, y: ey, force: 200 });
              }
            });
            if (lvl >= 4 || isEvo) {
              game.aoeZones.push(new AOEZone({
                x: ex, y: ey, radius: baseRadius * 0.8, duration: 2.0, damage: finalDmg * 0.25, type: "resignation_pool"
              }));
            }
          }
        }));
      }
    }
  }

  // 4. 降噪耳机 (削弱初始半径为2.2m)
  updateHeadphones(dt, game) {
    const isEvo = !!this.evolvedWeapons.headphones;
    const lvl = this.weapons.headphones;
    let baseInterval = isEvo ? 1.4 : 2.0;
    if (lvl >= 3 && !isEvo) baseInterval *= 0.85;
    const interval = baseInterval / this.getAttackSpeedMult();

    this.headphonesTimer += dt;
    if (this.headphonesTimer >= interval) {
      this.headphonesTimer = 0;
      let baseDmg = 24;
      if (lvl >= 2) baseDmg *= 1.18;
      if (lvl >= 5) baseDmg *= 1.25;
      if (isEvo) baseDmg *= 1.50;
      const finalDmg = baseDmg * this.getDamageMultiplier();

      let radius = isEvo ? (4.2 * M_TO_PX) : (2.2 * M_TO_PX);
      if (lvl >= 2 && !isEvo) radius *= 1.20;
      if (lvl >= 5 && !isEvo) radius *= 1.20;
      if (this.skills.loudspeaker_meeting) radius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);

      sound.playSonicWave(isEvo);
      game.aoeZones.push(new AOEZone({
        x: this.x, y: this.y, radius: radius, duration: 0.35, damage: finalDmg, type: "sonic_wave", isEvo: isEvo
      }));

      if (lvl >= 4 || isEvo) {
        setTimeout(() => {
          if (this.alive) {
            game.aoeZones.push(new AOEZone({
              x: this.x, y: this.y, radius: radius * 0.85, duration: 0.30, damage: finalDmg * 0.65, type: "sonic_wave", isEvo: isEvo
            }));
          }
        }, 160);
      }
    }
  }

  // 5. 养生水杯 (削弱初始半径为1.8m，残留时间调整为2.0s)
  updateWaterCup(dt, game) {
    const isEvo = !!this.evolvedWeapons.water_cup;
    const lvl = this.weapons.water_cup;
    let baseInterval = 2.2;
    if (lvl >= 2) baseInterval *= 0.85;
    const interval = baseInterval / this.getAttackSpeedMult();

    this.waterCupTimer += dt;
    if (this.waterCupTimer >= interval) {
      this.waterCupTimer = 0;
      let count = 1;
      if (lvl >= 3) count = 2;
      if (lvl >= 5) count = 3;
      if (isEvo) count = 3;

      let baseDmg = 15;
      if (lvl >= 4) baseDmg *= 1.30;
      if (isEvo) baseDmg *= 1.60;
      const finalDmg = baseDmg * this.getDamageMultiplier();

      let radius = 1.8 * M_TO_PX;
      if (lvl >= 2) radius *= 1.20;
      if (isEvo) radius *= 1.30;
      if (this.skills.loudspeaker_meeting) radius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);

      const poolDuration = isEvo ? 3.5 : (lvl >= 4 ? 2.5 : 2.0); // 严格缩短为 2.0s
      const slowPct = (lvl >= 5 || isEvo) ? 0.30 : 0;

      for (let i = 0; i < count; i++) {
        const offsetAngle = (i * Math.PI * 2) / count;
        const throwDist = 110 + Math.random() * 70;
        const tx = Math.max(30, Math.min(game.mapWidth - 30, this.x + Math.cos(offsetAngle) * throwDist));
        const ty = Math.max(30, Math.min(game.mapHeight - 30, this.y + Math.sin(offsetAngle) * throwDist));

        game.projectiles.push(new Projectile({
          x: this.x, y: this.y, targetX: tx, targetY: ty, damage: finalDmg, type: "water_cup_lob", isEvo: isEvo,
          onExplode: (ex, ey) => {
            sound.playCupShatter(isEvo);
            game.aoeZones.push(new AOEZone({
              x: ex, y: ey, radius: radius, duration: poolDuration, damage: finalDmg, type: "water_puddle", slowPct: slowPct, isEvo: isEvo
            }));
          }
        }));
      }
    }
  }

  // 6. 快充充电线 (初始半径收窄为2.2m)
  updateChargingCable(dt, game) {
    const isEvo = !!this.evolvedWeapons.charging_cable;
    const lvl = this.weapons.charging_cable;
    let baseInterval = isEvo ? 0.7 : 1.0;
    if (lvl >= 4 && !isEvo) baseInterval *= 0.82;
    const interval = baseInterval / this.getAttackSpeedMult();

    this.chargingCableTimer += dt;
    if (this.chargingCableTimer >= interval) {
      this.chargingCableTimer = 0;
      let baseDmg = 34;
      if (lvl >= 2) baseDmg *= 1.20;
      if (lvl >= 5) baseDmg *= 1.30;
      if (isEvo) baseDmg *= 1.60;
      const finalDmg = baseDmg * this.getDamageMultiplier();

      let range = 2.2 * M_TO_PX;
      if (lvl >= 2) range *= 1.20;
      if (isEvo) range *= 1.40;
      if (this.skills.loudspeaker_meeting) range *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);

      const baseAngle = Math.atan2(this.faceY, this.faceX);
      const isFull = (lvl >= 5 || isEvo);

      sound.playElectricWhip(isEvo);
      game.aoeZones.push(new AOEZone({
        x: this.x, y: this.y, radius: range, duration: 0.15, damage: finalDmg, type: "electric_whip",
        angle: baseAngle, arc: isFull ? (Math.PI * 2) : (120 * Math.PI / 180), isEvo: isEvo
      }));

      if (lvl >= 3 && !isFull) {
        game.aoeZones.push(new AOEZone({
          x: this.x, y: this.y, radius: range, duration: 0.15, damage: finalDmg, type: "electric_whip",
          angle: baseAngle + Math.PI, arc: 120 * Math.PI / 180, isEvo: isEvo
        }));
      }
    }
  }

  takeDamage(amount, sourceEnemy, game, isBossSkill = false) {
    if (!this.alive || this.invulnerableTimer > 0 || this.paidPoopInvulnTimer > 0) return;

    if (this.shieldReady) {
      this.shieldReady = false;
      this.shieldTimer = 0;
      this.invulnerableTimer = 0.3;
      game.addFloatingText(this.x, this.y - 25, "🛡️ 护盾抵挡！", "#38bdf8", 14);
      return;
    }

    let actualDamage = amount;
    if (this.artifacts.work_badge) {
      if (sourceEnemy && (sourceEnemy.isElite || sourceEnemy.isBoss)) actualDamage *= 0.80;
    }

    this.hp -= actualDamage;
    this.invulnerableTimer = PLAYER_BASE.hurtInvulnTime;
    this.lastHurtTime = Date.now();
    sound.playHurt();
    game.addDamageNumber(this.x, this.y, actualDamage, false, false);

    let pressureGain = 6;
    if (sourceEnemy && sourceEnemy.isElite) pressureGain = 9;
    if (isBossSkill || (sourceEnemy && sourceEnemy.isBoss)) pressureGain = 12;
    this.addPressure(pressureGain, game);

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  heal(amount, game = null, silent = false) {
    if (!this.alive || this.hp >= this.maxHp) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    const targetGame = game || window.gameInstance;
    if (!silent && targetGame && typeof targetGame.addDamageNumber === 'function') {
      targetGame.addDamageNumber(this.x, this.y, amount, false, true);
    }
  }

  collectDrop(drop, game = null) {
    const targetGame = game || window.gameInstance;
    if (drop.type === 'xp') {
      this.gainXp(drop.value);
      sound.playXp();
    } else if (drop.type === 'big_xp') {
      this.gainXp(drop.value);
      sound.playLevelUp();
    } else if (drop.type === 'coffee') {
      const healAmount = this.maxHp * 0.15;
      this.heal(healAmount, targetGame, false);
      if (targetGame && targetGame.addFloatingText) {
        targetGame.addFloatingText(this.x, this.y - 25, "☕ 咖啡回血 +15%", "#34d399", 14);
      }
      sound.playMugHit();
    } else if (drop.type === 'artifact') {
      if (targetGame && targetGame.triggerArtifactSelection) {
        targetGame.triggerArtifactSelection();
      }
    } else if (drop.type === 'punch_card') {
      if (targetGame && targetGame.triggerVictory) {
        targetGame.triggerVictory();
      }
    }
  }

  gainXp(amount) {
    let actual = amount * this.xpMult;
    this.xp += actual;
    const targetGame = window.gameInstance;
    if (targetGame) {
      while (this.xp >= targetGame.getXpNeeded(this.level)) {
        this.xp -= targetGame.getXpNeeded(this.level);
        this.levelUp();
      }
    }
  }

  levelUp() {
    this.level++;
    this.levelUpSpeedTimer = 3.0;
    sound.playLevelUp();
    if (window.gameInstance) {
      window.gameInstance.triggerLevelUp();
    }
  }

  die(game) {
    if (this.artifacts.resignation_cert && !this.revivedOnce) {
      this.revivedOnce = true;
      this.hp = this.maxHp * 0.45;
      this.pressure = 80;
      this.invulnerableTimer = 2.5;
      game.addFloatingText(this.x, this.y - 30, "📜 离职证明生效！复活！", "#ef4444", 18);
      sound.playLevelUp();
      return;
    }

    this.alive = false;
    game.triggerGameOver();
  }

  draw(ctx) {
    ctx.save();
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    if (this.activeSkillDurationTimer > 0) {
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      ctx.beginPath();
      ctx.arc(this.x - this.faceX * 10, this.y - this.faceY * 10, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.shieldReady) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = this.isCollapsed ? "#dc2626" : (this.characterId === "awei" ? "#0284c7" : (this.characterId === "lili" ? "#ec4899" : (this.characterId === "xiaozhang" ? "#eab308" : "#3b82f6")));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.charConf.avatar, this.x, this.y);

    if (this.isCollapsed) {
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 14px Arial";
      ctx.fillText("崩", this.x, this.y - 24);
    }

    if (this.weapons.mug) {
      const isEvo = !!this.evolvedWeapons.mug;
      const lvl = this.weapons.mug;
      let count = 1;
      if (lvl >= 3) count = 2;
      if (lvl >= 5) count = 3;
      if (isEvo) count = 4;

      let radius = 2.2 * M_TO_PX;
      if (lvl >= 4) radius *= 1.10;
      if (this.skills.loudspeaker_meeting) radius *= (1 + SKILLS.loudspeaker_meeting.areaBonus[this.skills.loudspeaker_meeting - 1]);

      for (let i = 0; i < count; i++) {
        const angle = this.mugAngle + (i * (Math.PI * 2 / count));
        const mx = this.x + Math.cos(angle) * radius;
        const my = this.y + Math.sin(angle) * radius;
        ctx.font = "15px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(isEvo ? "🍵" : "☕", mx, my);
      }
    }

    if (this.characterId === "lili" && this.activeSkillDurationTimer > 0) {
      for (let i = 0; i < 3; i++) {
        const pAngle = this.paletteStormAngle + (i * Math.PI * 2 / 3);
        const px = this.x + Math.cos(pAngle) * 2.8 * M_TO_PX;
        const py = this.y + Math.sin(pAngle) * 2.8 * M_TO_PX;
        ctx.font = "20px Arial";
        ctx.fillText("🎨", px, py);
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

    this.flankAngleOffset = (Math.random() - 0.5) * 1.2;
    this.orbitClockwise = Math.random() > 0.5 ? 1 : -1;
    this.wanderPhase = Math.random() * Math.PI * 2;
  }

  update(dt, player, game) {
    if (!this.alive) return;

    this.wanderPhase += dt * 2.5;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    let sepX = 0;
    let sepY = 0;
    const sepRadius = this.radius * 2.2;
    let neighborCount = 0;

    game.enemies.forEach(other => {
      if (other !== this && other.alive) {
        const ox = this.x - other.x;
        const oy = this.y - other.y;
        const oDist = Math.hypot(ox, oy);
        if (oDist > 0 && oDist < sepRadius) {
          const force = (sepRadius - oDist) / sepRadius;
          sepX += (ox / oDist) * force;
          sepY += (oy / oDist) * force;
          neighborCount++;
        }
      }
    });

    if (neighborCount > 0) {
      sepX /= neighborCount;
      sepY /= neighborCount;
    }

    if (this.attackType === "melee") {
      const tangentX = -ny * this.orbitClockwise;
      const tangentY = nx * this.orbitClockwise;
      let flankWeight = (dist > 80 && dist < 280) ? 0.45 : 0.15;
      let directWeight = 1.0 - flankWeight;

      let moveX = nx * directWeight + tangentX * flankWeight + sepX * 0.8;
      let moveY = ny * directWeight + tangentY * flankWeight + sepY * 0.8;
      const moveLen = Math.hypot(moveX, moveY) || 1;

      this.x += (moveX / moveLen) * this.speed * dt;
      this.y += (moveY / moveLen) * this.speed * dt;
    } else if (this.attackType === "ranged") {
      const keep = this.conf.keepDistance;
      const tangentX = -ny * this.orbitClockwise;
      const tangentY = nx * this.orbitClockwise;

      let radialMove = 0;
      if (dist < keep - 40) radialMove = -1.0;
      else if (dist > keep + 40) radialMove = 0.8;

      let moveX = nx * radialMove + tangentX * 0.6 + sepX * 0.9;
      let moveY = ny * radialMove + tangentY * 0.6 + sepY * 0.9;
      const moveLen = Math.hypot(moveX, moveY) || 1;

      this.x += (moveX / moveLen) * this.speed * dt;
      this.y += (moveY / moveLen) * this.speed * dt;

      this.attackTimer += dt;
      if (this.attackTimer >= this.conf.attackInterval) {
        this.attackTimer = 0;
        game.projectiles.push(new Projectile({
          x: this.x, y: this.y,
          vx: nx * this.conf.bulletSpeed, vy: ny * this.conf.bulletSpeed,
          damage: this.damage, radius: 6, life: 3.0, isEnemy: true, type: "mail_bullet", color: "#38bdf8"
        }));
      }
    } else if (this.attackType === "turret") {
      this.attackTimer += dt;
      if (this.attackTimer >= this.conf.attackInterval) {
        this.attackTimer = 0;
        const baseAngle = Math.atan2(dy, dx);
        [-0.28, 0, 0.28].forEach(offset => {
          const angle = baseAngle + offset;
          game.projectiles.push(new Projectile({
            x: this.x, y: this.y,
            vx: Math.cos(angle) * this.conf.bulletSpeed, vy: Math.sin(angle) * this.conf.bulletSpeed,
            damage: this.damage, radius: 6, life: 3.5, isEnemy: true, type: "paper_fan", color: "#f8fafc"
          }));
        });
      }
    } else if (this.attackType === "ring_shock") {
      if (!this.isCharging) {
        let moveX = nx + sepX * 0.7;
        let moveY = ny + sepY * 0.7;
        const moveLen = Math.hypot(moveX, moveY) || 1;
        this.x += (moveX / moveLen) * this.speed * dt;
        this.y += (moveY / moveLen) * this.speed * dt;

        if (dist <= this.conf.triggerDistance) {
          this.isCharging = true;
          this.stateTimer = 0;
        }
      } else {
        this.stateTimer += dt;
        if (this.stateTimer >= this.conf.chargeTime) {
          this.stateTimer = 0;
          this.isCharging = false;
          if (dist <= this.conf.radius + player.radius) {
            player.takeDamage(this.damage, this, game);
          }
          sound.playExplosion(false);
          game.addFloatingText(this.x, this.y - 15, "🔔 夺命连环call", "#ec4899", 12);
        }
      }
    } else if (this.attackType === "rush") {
      this.stateTimer += dt;
      if (!this.isCharging) {
        let moveX = nx + sepX * 0.6;
        let moveY = ny + sepY * 0.6;
        const moveLen = Math.hypot(moveX, moveY) || 1;
        this.x += (moveX / moveLen) * this.speed * dt;
        this.y += (moveY / moveLen) * this.speed * dt;

        if (this.stateTimer >= this.conf.pauseDuration) {
          this.isCharging = true;
          this.stateTimer = 0;
          this.rushDir = { x: nx, y: ny };
        }
      } else {
        this.x += this.rushDir.x * this.conf.rushSpeed * dt;
        this.y += this.rushDir.y * this.conf.rushSpeed * dt;
        if (this.stateTimer >= this.conf.rushDuration) {
          this.isCharging = false;
          this.stateTimer = 0;
        }
      }
    } else if (this.typeId === "red_dot") {
      const wobble = Math.sin(this.wanderPhase) * 0.6;
      const tangentX = -ny;
      const tangentY = nx;
      let moveX = nx + tangentX * wobble + sepX * 0.8;
      let moveY = ny + tangentY * wobble + sepY * 0.8;
      const moveLen = Math.hypot(moveX, moveY) || 1;

      this.x += (moveX / moveLen) * this.speed * dt;
      this.y += (moveY / moveLen) * this.speed * dt;
    }

    if (this.typeId === "meeting_monster") {
      if (dist <= this.conf.auraRadius + player.radius) {
        player.slowEffectMult = Math.min(player.slowEffectMult, 1.0 - this.conf.slowPct);
      }
    }

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

    if (game.player.characterId === "awei" && Math.random() < 0.16) {
      sound.playExplosion(false);
      game.addFloatingText(this.x, this.y - 20, "💾 线上热更爆炸！", "#38bdf8", 14);
      game.enemies.forEach(subE => {
        if (subE.alive && Math.hypot(subE.x - this.x, subE.y - this.y) <= 2.2 * M_TO_PX) {
          subE.takeDamage(35 * game.player.getDamageMultiplier(), false, game);
        }
      });
    }

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

    game.drops.push(new DropItem(this.x, this.y, 'xp', this.xpDrop));

    const coffeeChance = (game.player.hp / game.player.maxHp <= 0.3) ? 0.015 : 0.008;
    if (Math.random() < coffeeChance) {
      game.drops.push(new DropItem(this.x, this.y, 'coffee'));
    }

    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 60;
      game.particles.push(new Particle(this.x, this.y, Math.cos(angle) * spd, Math.sin(angle) * spd, this.color, 4, 0.4, "square"));
    }
  }

  draw(ctx) {
    ctx.save();
    if (this.typeId === "meeting_monster") {
      ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.conf.auraRadius, 0, Math.PI * 2);
      ctx.fill();
    }

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

    if (this.typeId === "hr") {
      if (this.skillTimer >= this.conf.skillCd) {
        this.skillTimer = 0;
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
            const pDist = Math.hypot(player.x - targetX, player.y - targetY);
            if (pDist < 40) {
              player.debuffDmgReductionTimer = this.conf.debuffDuration;
              game.addFloatingText(player.x, player.y - 25, "⚠️ 绩效警告 (输出-20%)", "#f43f5e", 15);
            }
          }
        }));
      }

      if (!this.summonedHalf && (this.hp / this.maxHp) <= 0.5) {
        this.summonedHalf = true;
        for (let i = 0; i < 2; i++) {
          game.enemies.push(new Enemy("mail_monster", this.x + (i * 40 - 20), this.y));
        }
        game.addFloatingText(this.x, this.y - 30, "召集邮件轰炸！", "#f43f5e", 14);
      }
    } else if (this.typeId === "pm") {
      if (this.skillTimer >= this.conf.summonDemandCd) {
        this.skillTimer = 0;
        for (let i = 0; i < 3; i++) {
          const offsetAngle = (i * Math.PI * 2) / 3;
          game.enemies.push(new Enemy("demand_ball", this.x + Math.cos(offsetAngle) * 30, this.y + Math.sin(offsetAngle) * 30));
        }
        game.addFloatingText(this.x, this.y - 30, "需求排期又加了！", "#0284c7", 14);
      }
    }

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
      this.x += (kx / kdist) * knockback.force * 0.016;
      this.y += (ky / kdist) * knockback.force * 0.016;
    }

    if (this.hp <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.alive = false;
    game.player.kills++;
    game.player.reducePressure(8, game);

    game.drops.push(new DropItem(this.x, this.y, 'big_xp', this.conf.xpDrop));

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

// 终极 Boss 类 (支持一周 6 大独立专属 Boss 技能与台词)
export class SupervisorBoss {
  constructor(x, y, customConf = null) {
    this.conf = customConf || STAGES_CONFIG.stage_1.boss;
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
    this.color = this.conf.color;
    this.isBoss = true;
    this.alive = true;
    this.currentPhase = 1;
    this.phaseEntered = { p2: false, p3: false };
    this.actionQueueTimer = 0;
    this.overtimeTonightActive = false;
    this.overtimeTimer = 0;
    this.redDotSpawnTimer = 0;
    this.lastContactDmgTime = 0;
  }

  update(dt, player, game) {
    if (!this.alive) return;

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

    if (this.overtimeTonightActive) {
      this.overtimeTimer -= dt;
      this.redDotSpawnTimer += dt;
      if (this.redDotSpawnTimer >= 2.0) {
        this.redDotSpawnTimer = 0;
        for (let i = 0; i < 2; i++) {
          game.enemies.push(new Enemy("red_dot", this.x + (i * 30 - 15), this.y));
        }
      }
      if (this.overtimeTimer <= 0) {
        this.overtimeTonightActive = false;
      }
    }

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
    const quote = this.conf.id === "client_boss" ? "五彩斑斓的黑改起来！" : (this.conf.id === "devops_overlord" ? "内存溢出！全员报警！" : (this.conf.id === "ceo_bigboss" ? "画大饼！期权激励！" : "P2：来开个会！"));
    game.addFloatingText(this.x, this.y - 40, quote, "#a855f7", 20);
    sound.playBossWarning();
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const dist = 120 + Math.random() * 80;
      game.aoeZones.push(new AOEZone({
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist,
        radius: 2.8 * M_TO_PX,
        duration: 5.0,
        slowPct: 0.35,
        type: "meeting_slow"
      }));
    }
  }

  startPhase3(game) {
    this.overtimeTonightActive = true;
    this.overtimeTimer = 10.0;
    const quote = this.conf.id === "client_boss" ? "必须改回第一版！" : (this.conf.id === "ceo_bigboss" ? "周末全员来复盘！" : "P3：今晚加个班！");
    game.addFloatingText(this.x, this.y - 40, quote, "#dc2626", 22);
    sound.playBossWarning();
  }

  castFileRain(player, game) {
    const quote = this.conf.id === "client_boss" ? "明天上线！" : (this.conf.id === "devops_overlord" ? "404 宕机！" : "这个今天能做完吧？");
    game.addFloatingText(this.x, this.y - 30, quote, "#ef4444", 16);
    const count = 5;
    const interval = 0.25;
    const radius = 1.2 * M_TO_PX;
    const dmg = this.damage * 0.9;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!this.alive || !player.alive) return;
        const targetX = player.x;
        const targetY = player.y;
        game.aoeZones.push(new AOEZone({
          x: targetX, y: targetY, radius: radius, duration: 0.75, type: "boss_warning_circle",
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
    game.addFloatingText(this.x, this.y - 30, "汇报进度！", "#ef4444", 16);
    const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
    for (let wave = 0; wave < 3; wave++) {
      setTimeout(() => {
        if (!this.alive) return;
        [-0.35, 0, 0.35].forEach(offset => {
          const angle = baseAngle + offset;
          game.projectiles.push(new Projectile({
            x: this.x, y: this.y,
            vx: Math.cos(angle) * 4.8 * M_TO_PX, vy: Math.sin(angle) * 4.8 * M_TO_PX,
            damage: this.damage * 0.7, radius: 8, life: 3.5, isEnemy: true, type: "boss_bullet", color: "#dc2626"
          }));
        });
      }, wave * 180);
    }
  }

  castDemand(player, game) {
    const count = this.currentPhase === 3 ? 6 : 4;
    game.addFloatingText(this.x, this.y - 30, `加急需求 ×${count}！`, "#f59e0b", 16);
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
    game.triggerSlowMotion(0.35, 0.2);
    game.projectiles = game.projectiles.filter(p => !p.isEnemy);
    game.drops.push(new DropItem(this.x, this.y, 'punch_card'));
    sound.playVictory();
    game.addFloatingText(this.x, this.y - 40, `🎉 ${this.name} 被击败！快拿【下班卡】！`, "#fbbf24", 22);
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 25;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${this.size * 1.3}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.conf.icon, this.x, this.y);

    const mapW = ctx.canvas.width;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(mapW / 2 - 160, 48, 320, 14);
    ctx.fillStyle = this.color;
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
