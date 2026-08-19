/**
 * 《今天也不想上班》- 核心游戏引擎与状态机 (V1.3 升级版)
 * 包含：4大角色选择、6大武器超级进化、多关卡支持、移动端防重叠HUD
 */

import { M_TO_PX, PLAYER_BASE, PRESSURE_STAGES, WEAPONS, SKILLS, ARTIFACTS, TALENTS, CHARACTERS, STAGES_CONFIG, getXpRequiredForLevel } from './constants.js';
import { Player, DamageNumber, FloatingText, Particle, DropItem, AOEZone } from './entities.js';
import { WaveDirector } from './director.js';
import { sound } from './audio.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.selectedCharacterId = "xiaochen";
    this.selectedStageId = "stage_1";

    this.mapWidth = 48 * M_TO_PX;
    this.mapHeight = 36 * M_TO_PX;

    this.state = "MENU";
    this.timeScale = 1.0;
    this.slowMotionTimer = 0;
    this.slowMotionScale = 1.0;

    this.saveData = this.loadSaveData();

    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.aoeZones = [];
    this.drops = [];
    this.particles = [];
    this.damageNumbers = [];
    this.floatingTexts = [];
    this.director = new WaveDirector(this);

    this.keys = {};
    this.touchJoy = { 
      active: false, 
      touchId: null,
      centerX: 0, 
      centerY: 0, 
      currX: 0, 
      currY: 0, 
      dirX: 0, 
      dirY: 0,
      customPositioned: false
    };
    this.showMobileControls = true;
    this.camera = { x: 0, y: 0 };

    this.rerollsLeft = 1;
    this.levelChoices = [];
    this.artifactChoices = [];

    window.gameInstance = this;

    this.initCanvasSize();
    this.initEventListeners();
  }

  loadSaveData() {
    try {
      const data = localStorage.getItem("office_slacker_rogue_save_v13");
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      gold: 300,
      talents: {
        health_check: 0,
        skilled_worker: 0,
        fast_runner: 0,
        slacker_xp: 0,
        mental_construction: 0
      },
      stats: { runs: 0, wins: 0, totalKills: 0 },
      unlockedCharacters: ["xiaochen", "awei", "lili", "xiaozhang"],
      unlockedStages: ["stage_1", "stage_2", "stage_3"]
    };
  }

  saveGameData() {
    try {
      localStorage.setItem("office_slacker_rogue_save_v13", JSON.stringify(this.saveData));
    } catch (e) {}
  }

  initCanvasSize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initEventListeners() {
    window.addEventListener('resize', () => this.initCanvasSize());

    document.addEventListener('touchmove', (e) => {
      if (this.state === "PLAYING") {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      sound.init();
      this.keys[e.code] = true;

      if (e.code === "Space") {
        if (this.state === "PLAYING" && this.player) {
          this.player.performDodge(this);
        }
      }
      if (e.code === "KeyE" || e.code === "ShiftLeft") {
        if (this.state === "PLAYING" && this.player) {
          this.player.performActiveSkill(this);
        }
      }
      if (e.code === "KeyP" || e.code === "Escape") {
        if (this.state === "PLAYING") this.pauseGame();
        else if (this.state === "PAUSED") this.resumeGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // 虚拟摇杆
    const joyZone = document.getElementById("joystick-zone");
    const joyBase = document.getElementById("joystick-base");
    const joyNub = document.getElementById("joystick-nub");

    if (joyZone && joyBase && joyNub) {
      joyZone.addEventListener("touchstart", (e) => {
        sound.init();
        if (this.state !== "PLAYING") return;
        e.preventDefault();

        const touch = e.changedTouches[0];
        this.touchJoy.touchId = touch.identifier;
        this.touchJoy.active = true;

        const baseRect = joyBase.getBoundingClientRect();
        const baseCenterX = baseRect.left + baseRect.width / 2;
        const baseCenterY = baseRect.top + baseRect.height / 2;
        const distToBase = Math.hypot(touch.clientX - baseCenterX, touch.clientY - baseCenterY);

        if (distToBase > 90) {
          joyBase.style.left = `${touch.clientX - 65}px`;
          joyBase.style.top = `${touch.clientY - 65}px`;
          joyBase.style.bottom = "auto";
          this.touchJoy.centerX = touch.clientX;
          this.touchJoy.centerY = touch.clientY;
          this.touchJoy.customPositioned = true;
        } else {
          this.touchJoy.centerX = baseCenterX;
          this.touchJoy.centerY = baseCenterY;
        }

        this.touchJoy.currX = touch.clientX;
        this.touchJoy.currY = touch.clientY;
        this.updateJoystickDrag(touch.clientX, touch.clientY, joyNub);
      }, { passive: false });

      joyZone.addEventListener("touchmove", (e) => {
        if (!this.touchJoy.active) return;
        e.preventDefault();

        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.touchJoy.touchId) {
            this.touchJoy.currX = touch.clientX;
            this.touchJoy.currY = touch.clientY;
            this.updateJoystickDrag(touch.clientX, touch.clientY, joyNub);
            break;
          }
        }
      }, { passive: false });

      const resetJoystick = (e) => {
        if (!this.touchJoy.active) return;
        if (e && e.changedTouches) {
          let found = false;
          for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.touchJoy.touchId) {
              found = true;
              break;
            }
          }
          if (!found) return;
        }

        this.touchJoy.active = false;
        this.touchJoy.touchId = null;
        this.touchJoy.dirX = 0;
        this.touchJoy.dirY = 0;
        joyNub.style.transform = "translate(0px, 0px)";

        if (this.touchJoy.customPositioned) {
          joyBase.style.left = "40px";
          joyBase.style.bottom = "40px";
          joyBase.style.top = "auto";
          this.touchJoy.customPositioned = false;
        }
      };

      joyZone.addEventListener("touchend", resetJoystick);
      joyZone.addEventListener("touchcancel", resetJoystick);

      let isMouseDown = false;
      joyZone.addEventListener("mousedown", (e) => {
        if (this.state !== "PLAYING") return;
        isMouseDown = true;
        this.touchJoy.active = true;
        const baseRect = joyBase.getBoundingClientRect();
        this.touchJoy.centerX = baseRect.left + baseRect.width / 2;
        this.touchJoy.centerY = baseRect.top + baseRect.height / 2;
        this.updateJoystickDrag(e.clientX, e.clientY, joyNub);
      });

      window.addEventListener("mousemove", (e) => {
        if (!isMouseDown) return;
        this.updateJoystickDrag(e.clientX, e.clientY, joyNub);
      });

      window.addEventListener("mouseup", () => {
        if (isMouseDown) {
          isMouseDown = false;
          resetJoystick();
        }
      });
    }
  }

  updateJoystickDrag(clientX, clientY, nubElement) {
    const dx = clientX - this.touchJoy.centerX;
    const dy = clientY - this.touchJoy.centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 45;

    if (dist > 8) {
      this.touchJoy.dirX = dx / Math.max(dist, 1);
      this.touchJoy.dirY = dy / Math.max(dist, 1);
    } else {
      this.touchJoy.dirX = 0;
      this.touchJoy.dirY = 0;
    }

    const visualDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(dy, dx);
    const visualX = Math.cos(angle) * visualDist;
    const visualY = Math.sin(angle) * visualDist;
    nubElement.style.transform = `translate(${visualX}px, ${visualY}px)`;
  }

  startNewGame() {
    sound.init();
    sound.startBgm();

    const stageConf = STAGES_CONFIG[this.selectedStageId] || STAGES_CONFIG.stage_1;
    this.mapWidth = stageConf.mapWidth;
    this.mapHeight = stageConf.mapHeight;

    this.player = new Player(this.mapWidth / 2, this.mapHeight / 2, this.selectedCharacterId, this.saveData.talents);
    this.enemies = [];
    this.projectiles = [];
    this.aoeZones = [];
    this.drops = [];
    this.particles = [];
    this.damageNumbers = [];
    this.floatingTexts = [];
    this.rerollsLeft = 1;

    this.director.setStage(this.selectedStageId);

    this.state = "PLAYING";
    this.hideAllModals();

    document.getElementById("hud").style.display = "block";
    if (this.showMobileControls) {
      document.getElementById("mobile-controls").style.display = "block";
    }
    document.getElementById("main-menu").style.display = "none";

    this.saveData.stats.runs++;
    this.saveGameData();
  }

  pauseGame() {
    if (this.state !== "PLAYING") return;
    this.state = "PAUSED";
    document.getElementById("pause-modal").style.display = "flex";
    this.updatePauseStats();
  }

  resumeGame() {
    if (this.state !== "PAUSED") return;
    this.state = "PLAYING";
    document.getElementById("pause-modal").style.display = "none";
  }

  triggerSlowMotion(duration, scale = 0.55) {
    this.slowMotionTimer = duration;
    this.slowMotionScale = scale;
  }

  getXpNeeded(level) {
    return getXpRequiredForLevel(level);
  }

  addDamageNumber(x, y, dmg, isCrit, isHeal = false) {
    this.damageNumbers.push(new DamageNumber(x, y, dmg, isCrit, isHeal));
  }

  addFloatingText(x, y, text, color, size) {
    this.floatingTexts.push(new FloatingText(x, y, text, color, size));
  }

  getNearestEnemy(x, y, maxDist = 9999) {
    let nearest = null;
    let minDist = maxDist;
    this.enemies.forEach(e => {
      if (e.alive) {
        const dist = Math.hypot(e.x - x, e.y - y);
        if (dist < minDist) {
          minDist = dist;
          nearest = e;
        }
      }
    });
    return nearest;
  }

  getDenseEnemyClusterTarget(x, y, maxDist = 9999) {
    if (this.enemies.length === 0) return null;
    let bestEnemy = null;
    let maxNeighbors = -1;

    this.enemies.forEach(e1 => {
      if (!e1.alive) return;
      const dToPlayer = Math.hypot(e1.x - x, e1.y - y);
      if (dToPlayer > maxDist) return;

      let neighbors = 0;
      this.enemies.forEach(e2 => {
        if (e2.alive && Math.hypot(e1.x - e2.x, e1.y - e2.y) < 90) {
          neighbors++;
        }
      });

      if (neighbors > maxNeighbors) {
        maxNeighbors = neighbors;
        bestEnemy = e1;
      }
    });

    return bestEnemy;
  }

  // 三选一升级池生成与进化判定 (支持6大武器与全部超级进化)
  generateUpgradeChoices() {
    const choices = [];
    const p = this.player;

    // 1. 检查6大武器超级进化
    // 祖安机械键盘 (键盘Lv5 + 加班咖啡Lv3 + 双屏办公Lv3)
    if (p.weapons.keyboard === 5 && (p.skills.coffee || 0) >= 3 && (p.skills.dual_screen || 0) >= 3 && !p.evolvedWeapons.keyboard) {
      choices.push({
        type: "weapon_evo", id: "keyboard", name: WEAPONS.keyboard.evolution.name, icon: WEAPONS.keyboard.evolution.icon,
        tag: "超级进化", desc: WEAPONS.keyboard.evolution.desc, isEvo: true
      });
    }
    // 无限续杯 (马克杯Lv5 + 工位护盾Lv3 + 加班咖啡Lv2)
    if (p.weapons.mug === 5 && (p.skills.shield || 0) >= 3 && (p.skills.coffee || 0) >= 2 && !p.evolvedWeapons.mug) {
      choices.push({
        type: "weapon_evo", id: "mug", name: WEAPONS.mug.evolution.name, icon: WEAPONS.mug.evolution.icon,
        tag: "超级进化", desc: WEAPONS.mug.evolution.desc, isEvo: true
      });
    }
    // 辞职报告 (辞职信Lv5 + 我不干了Lv3 + KPILv2)
    if (p.weapons.resignation === 5 && (p.skills.quit || 0) >= 3 && (p.skills.kpi || 0) >= 2 && !p.evolvedWeapons.resignation) {
      choices.push({
        type: "weapon_evo", id: "resignation", name: WEAPONS.resignation.evolution.name, icon: WEAPONS.resignation.evolution.icon,
        tag: "超级进化", desc: WEAPONS.resignation.evolution.desc, isEvo: true
      });
    }
    // 降噪核爆耳机 (耳机Lv5 + 扩音会议Lv3 + 准点下班Lv2)
    if (p.weapons.headphones === 5 && (p.skills.loudspeaker_meeting || 0) >= 3 && (p.skills.on_time_off || 0) >= 2 && !p.evolvedWeapons.headphones) {
      choices.push({
        type: "weapon_evo", id: "headphones", name: WEAPONS.headphones.evolution.name, icon: WEAPONS.headphones.evolution.icon,
        tag: "超级进化", desc: WEAPONS.headphones.evolution.desc, isEvo: true
      });
    }
    // 高压八杯水领域 (水杯Lv5 + 带薪摸鱼Lv3 + 午休Lv2)
    if (p.weapons.water_cup === 5 && (p.skills.paid_slacking || 0) >= 3 && (p.skills.lunch_break || 0) >= 2 && !p.evolvedWeapons.water_cup) {
      choices.push({
        type: "weapon_evo", id: "water_cup", name: WEAPONS.water_cup.evolution.name, icon: WEAPONS.water_cup.evolution.icon,
        tag: "超级进化", desc: WEAPONS.water_cup.evolution.desc, isEvo: true
      });
    }
    // 超导快充高压鞭 (充电线Lv5 + 电梯冲刺Lv3 + 临时抱佛脚Lv2)
    if (p.weapons.charging_cable === 5 && (p.skills.elevator_dash || 0) >= 3 && (p.skills.last_minute_rush || 0) >= 2 && !p.evolvedWeapons.charging_cable) {
      choices.push({
        type: "weapon_evo", id: "charging_cable", name: WEAPONS.charging_cable.evolution.name, icon: WEAPONS.charging_cable.evolution.icon,
        tag: "超级进化", desc: WEAPONS.charging_cable.evolution.desc, isEvo: true
      });
    }

    // 2. 6大武器升级或解锁候选
    Object.keys(WEAPONS).forEach(wKey => {
      const wConf = WEAPONS[wKey];
      const curLvl = p.weapons[wKey] || 0;
      if (curLvl === 0) {
        choices.push({
          type: "weapon_new", id: wKey, name: `解锁：${wConf.name}`, icon: wConf.icon,
          tag: wConf.tag, desc: wConf.levels[0].desc, level: 1
        });
      } else if (curLvl < 5 && !p.evolvedWeapons[wKey]) {
        choices.push({
          type: "weapon_upgrade", id: wKey, name: `${wConf.name} (Lv${curLvl} ➔ Lv${curLvl + 1})`, icon: wConf.icon,
          tag: wConf.tag, desc: wConf.levels[curLvl].desc, level: curLvl + 1
        });
      }
    });

    // 3. 15个技能候选
    Object.keys(SKILLS).forEach(sKey => {
      const sConf = SKILLS[sKey];
      const curLvl = p.skills[sKey] || 0;
      if (curLvl < sConf.maxLevel) {
        choices.push({
          type: "skill", id: sKey, name: `${sConf.name} (${curLvl === 0 ? '新获得' : 'Lv' + curLvl + ' ➔ Lv' + (curLvl + 1)})`,
          icon: sConf.icon, tag: sConf.tags.join(" / "), desc: sConf.descs[curLvl], rarity: sConf.rarity, level: curLvl + 1
        });
      }
    });

    // 小张 (实习生) 稀有度权重加倍
    if (p.characterId === "xiaozhang") {
      choices.sort((a, b) => {
        const score = (item) => (item.isEvo ? 4 : (item.rarity === 'epic' ? 3 : (item.rarity === 'rare' ? 2 : 1)));
        return score(b) - score(a) + (Math.random() - 0.5);
      });
    } else {
      for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
      }
    }

    return choices.slice(0, 3);
  }

  triggerLevelUp() {
    this.state = "LEVEL_UP";
    this.levelChoices = this.generateUpgradeChoices();
    this.renderLevelUpModal();
  }

  rerollLevelUpChoices() {
    if (this.rerollsLeft <= 0) return;
    this.rerollsLeft--;
    sound.playClick();
    this.levelChoices = this.generateUpgradeChoices();
    this.renderLevelUpModal();
  }

  applyUpgradeChoice(choice) {
    sound.playClick();
    const p = this.player;

    if (choice.type === "weapon_evo") {
      p.evolvedWeapons[choice.id] = true;
      this.addFloatingText(p.x, p.y - 30, `⚡ 进化成功：${choice.name}！`, "#fbbf24", 20);
    } else if (choice.type === "weapon_new" || choice.type === "weapon_upgrade") {
      p.weapons[choice.id] = choice.level;
    } else if (choice.type === "skill") {
      p.skills[choice.id] = choice.level;
    }

    this.hideAllModals();
    this.state = "PLAYING";
  }

  triggerArtifactSelection() {
    this.state = "ARTIFACT";
    const available = Object.keys(ARTIFACTS).filter(k => !this.player.artifacts[k]);
    if (available.length === 0) {
      this.player.heal(40, this);
      this.state = "PLAYING";
      return;
    }

    const shuffled = available.sort(() => 0.5 - Math.random()).slice(0, 3);
    this.artifactChoices = shuffled.map(k => ARTIFACTS[k]);
    this.renderArtifactModal();
  }

  applyArtifactChoice(art) {
    sound.playClick();
    this.player.artifacts[art.id] = true;
    if (art.id === "boss_pie") {
      this.player.maxHp *= 1.60;
      this.player.heal(25, this);
    }
    this.hideAllModals();
    this.state = "PLAYING";
    this.addFloatingText(this.player.x, this.player.y - 30, `🎁 获得神器【${art.name}】！`, "#a855f7", 18);
  }

  triggerGameOver() {
    this.state = "GAMEOVER";
    sound.stopBgm();
    sound.playHurt();

    const survivalTime = Math.floor(this.director.gameTime);
    const kills = this.player.kills;
    let earnedGold = Math.floor(kills * 1.8 + survivalTime * 1.0);
    if (this.player.artifacts.year_end_bonus) earnedGold = Math.round(earnedGold * 2.0);

    this.saveData.gold += earnedGold;
    this.saveData.stats.totalKills += kills;
    this.saveGameData();

    document.getElementById("gameover-time").innerText = this.formatTime(survivalTime);
    document.getElementById("gameover-kills").innerText = kills;
    document.getElementById("gameover-pressure").innerText = `${Math.round(this.player.highestPressure)}%`;
    document.getElementById("gameover-dodges").innerText = this.player.perfectDodgeCount;
    document.getElementById("gameover-gold").innerText = `+${earnedGold} 工资`;
    document.getElementById("gameover-modal").style.display = "flex";
  }

  triggerVictory() {
    this.state = "VICTORY";
    sound.stopBgm();
    sound.playVictory();

    const survivalTime = Math.floor(this.director.gameTime);
    const kills = this.player.kills;
    let earnedGold = Math.floor(kills * 2.5 + 600);
    if (this.player.artifacts.year_end_bonus) earnedGold = Math.round(earnedGold * 2.0);

    this.saveData.gold += earnedGold;
    this.saveData.stats.wins++;
    this.saveData.stats.totalKills += kills;
    this.saveGameData();

    document.getElementById("victory-time").innerText = this.formatTime(survivalTime);
    document.getElementById("victory-kills").innerText = kills;
    document.getElementById("victory-pressure").innerText = `${Math.round(this.player.highestPressure)}%`;
    document.getElementById("victory-dodges").innerText = this.player.perfectDodgeCount;
    document.getElementById("victory-gold").innerText = `+${earnedGold} 工资`;

    const buildList = [];
    Object.keys(this.player.weapons).forEach(w => {
      const isEvo = this.player.evolvedWeapons[w];
      buildList.push(isEvo ? WEAPONS[w].evolution.name : `${WEAPONS[w].name} Lv${this.player.weapons[w]}`);
    });
    Object.keys(this.player.skills).forEach(s => {
      buildList.push(`${SKILLS[s].name} Lv${this.player.skills[s]}`);
    });
    document.getElementById("victory-build").innerText = buildList.join(" | ") || "基础摸鱼套";

    document.getElementById("victory-modal").style.display = "flex";
  }

  hideAllModals() {
    ["levelup-modal", "artifact-modal", "pause-modal", "gameover-modal", "victory-modal", "talent-modal", "guide-modal", "character-modal", "stage-modal", "settings-menu-modal"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }

  renderLevelUpModal() {
    const modal = document.getElementById("levelup-modal");
    const container = document.getElementById("levelup-cards");
    const rerollBtn = document.getElementById("levelup-reroll-btn");

    rerollBtn.innerText = `刷新选项 (${this.rerollsLeft}次免费)`;
    rerollBtn.disabled = this.rerollsLeft <= 0;

    container.innerHTML = "";
    this.levelChoices.forEach(choice => {
      const card = document.createElement("div");
      card.className = `upgrade-card ${choice.isEvo ? 'evo' : (choice.rarity || 'common')}`;
      card.innerHTML = `
        <div class="card-icon">${choice.icon}</div>
        <div class="card-title">${choice.name}</div>
        <div class="card-tag">${choice.tag}</div>
        <div class="card-desc">${choice.desc}</div>
      `;
      card.onclick = () => this.applyUpgradeChoice(choice);
      container.appendChild(card);
    });

    modal.style.display = "flex";
  }

  renderArtifactModal() {
    const modal = document.getElementById("artifact-modal");
    const container = document.getElementById("artifact-cards");
    container.innerHTML = "";

    this.artifactChoices.forEach(art => {
      const card = document.createElement("div");
      card.className = "upgrade-card epic";
      card.innerHTML = `
        <div class="card-icon">${art.icon}</div>
        <div class="card-title">${art.name}</div>
        <div class="card-tag">职场神器</div>
        <div class="card-desc">${art.desc}</div>
      `;
      card.onclick = () => this.applyArtifactChoice(art);
      container.appendChild(card);
    });

    modal.style.display = "flex";
  }

  renderCharacterSelectModal() {
    const modal = document.getElementById("character-modal");
    const container = document.getElementById("character-cards-container");
    container.innerHTML = "";

    Object.keys(CHARACTERS).forEach(cKey => {
      const char = CHARACTERS[cKey];
      const isSelected = this.selectedCharacterId === cKey;
      const card = document.createElement("div");
      card.className = `char-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="char-avatar">${char.avatar}</div>
        <div class="char-name">${char.name} <span class="char-title">${char.title}</span></div>
        <div class="char-weapon">初始武器：<b>${WEAPONS[char.initialWeapon].name} ${WEAPONS[char.initialWeapon].icon}</b></div>
        <div class="char-desc">${char.desc}</div>
        <div class="char-skill-box">
          <div class="skill-label">【被动】${char.passive.name}</div>
          <div class="skill-text">${char.passive.desc}</div>
          <div class="skill-label" style="margin-top:4px;">【主动】${char.active.icon} ${char.active.name} (CD ${char.active.cd}s)</div>
          <div class="skill-text">${char.active.desc}</div>
        </div>
        <button class="btn btn-char-select">${isSelected ? '当前出战' : '选择出战'}</button>
      `;

      card.querySelector(".btn-char-select").onclick = () => {
        sound.playClick();
        this.selectedCharacterId = cKey;
        this.renderCharacterSelectModal();
      };

      container.appendChild(card);
    });

    modal.style.display = "flex";
  }

  renderStageSelectModal() {
    const modal = document.getElementById("stage-modal");
    const container = document.getElementById("stage-cards-container");
    container.innerHTML = "";

    Object.keys(STAGES_CONFIG).forEach(sKey => {
      const stage = STAGES_CONFIG[sKey];
      const isSelected = this.selectedStageId === sKey;
      const card = document.createElement("div");
      card.className = `stage-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="stage-name">${stage.name}</div>
        <div class="stage-sub">${stage.subtitle}</div>
        <div class="stage-info">时长：8分钟 · 关底Boss：${stage.boss.icon} ${stage.boss.name}</div>
        <button class="btn btn-stage-select">${isSelected ? '当前关卡' : '选择进入'}</button>
      `;

      card.querySelector(".btn-stage-select").onclick = () => {
        sound.playClick();
        this.selectedStageId = sKey;
        this.renderStageSelectModal();
      };

      container.appendChild(card);
    });

    modal.style.display = "flex";
  }

  updatePauseStats() {
    const p = this.player;
    if (!p) return;
    const content = document.getElementById("pause-stats-content");
    content.innerHTML = `
      <p><b>当前出战：</b> ${p.charConf.avatar} ${p.charConf.name} (${p.charConf.title})</p>
      <p><b>当前关卡：</b> ${this.director.stageConfig.name}</p>
      <p><b>当前等级：</b> Lv.${p.level}</p>
      <p><b>击杀数：</b> ${p.kills} | <b>已存活：</b> ${this.formatTime(this.director.gameTime)}</p>
      <p><b>攻击力加成：</b> +${Math.round((p.getDamageMultiplier() - 1) * 100)}%</p>
      <p><b>攻击速度加成：</b> +${Math.round((p.getAttackSpeedMult() - 1) * 100)}%</p>
      <p><b>暴击率：</b> ${Math.round(p.getCritRate() * 100)}% | <b>暴击伤害：</b> ${Math.round(p.getCritDamage() * 100)}%</p>
      <p><b>完美闪避次数：</b> ${p.perfectDodgeCount}</p>
    `;
  }

  renderTalentsModal() {
    const modal = document.getElementById("talent-modal");
    const container = document.getElementById("talent-list");
    document.getElementById("talent-gold").innerText = `当前存款工资：¥ ${this.saveData.gold}`;
    container.innerHTML = "";

    Object.keys(TALENTS).forEach(tKey => {
      const tConf = TALENTS[tKey];
      const curLvl = this.saveData.talents[tKey] || 0;
      const isMax = curLvl >= tConf.maxLevel;
      const price = isMax ? "已满级" : `¥ ${tConf.prices[curLvl]}`;

      const item = document.createElement("div");
      item.className = "talent-item";
      item.innerHTML = `
        <div class="talent-info">
          <div class="talent-name">${tConf.icon} ${tConf.name} (Lv.${curLvl}/${tConf.maxLevel})</div>
          <div class="talent-desc">${tConf.desc}</div>
        </div>
        <button class="btn btn-buy" ${isMax || this.saveData.gold < tConf.prices[curLvl] ? 'disabled' : ''}>
          ${isMax ? '已满级' : '升级 ' + price}
        </button>
      `;

      const buyBtn = item.querySelector(".btn-buy");
      buyBtn.onclick = () => {
        if (!isMax && this.saveData.gold >= tConf.prices[curLvl]) {
          this.saveData.gold -= tConf.prices[curLvl];
          this.saveData.talents[tKey] = curLvl + 1;
          this.saveGameData();
          sound.playLevelUp();
          this.renderTalentsModal();
        }
      };

      container.appendChild(item);
    });

    modal.style.display = "flex";
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  loop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    let dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    if (dt > 0.1) dt = 0.1;

    if (this.slowMotionTimer > 0) {
      this.slowMotionTimer -= dt;
      dt *= this.slowMotionScale;
    }

    dt *= this.timeScale;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.state !== "PLAYING") return;

    const inputDir = { x: 0, y: 0 };
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) inputDir.y -= 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) inputDir.y += 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) inputDir.x -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) inputDir.x += 1;

    if (this.touchJoy.active) {
      inputDir.x += this.touchJoy.dirX;
      inputDir.y += this.touchJoy.dirY;
    }

    if (this.player) {
      this.player.slowEffectMult = 1.0;
    }

    this.aoeZones.forEach(z => {
      z.update(dt, this);
      if (z.type === "meeting_slow" && this.player) {
        if (Math.hypot(this.player.x - z.x, this.player.y - z.y) <= z.radius + this.player.radius) {
          this.player.slowEffectMult = Math.min(this.player.slowEffectMult, 1.0 - z.slowPct);
        }
      }
    });
    this.aoeZones = this.aoeZones.filter(z => z.alive);

    if (this.player) {
      this.player.update(dt, inputDir, this);
    }

    this.director.update(dt);

    this.enemies.forEach(e => e.update(dt, this.player, this));
    this.enemies = this.enemies.filter(e => e.alive);

    this.updateProjectiles(dt);

    this.drops.forEach(d => d.update(dt, this.player, this));
    this.drops = this.drops.filter(d => d.alive);

    this.particles.forEach(p => p.update(dt));
    this.particles = this.particles.filter(p => p.life > 0);

    this.damageNumbers.forEach(n => n.update(dt));
    this.damageNumbers = this.damageNumbers.filter(n => n.life > 0);

    this.floatingTexts.forEach(t => t.update(dt));
    this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);

    if (this.player) {
      const targetCamX = this.player.x - this.canvas.width / 2;
      const targetCamY = this.player.y - this.canvas.height / 2;
      this.camera.x += (targetCamX - this.camera.x) * 0.12;
      this.camera.y += (targetCamY - this.camera.y) * 0.12;
    }

    this.updateHUD();
  }

  updateProjectiles(dt) {
    this.projectiles.forEach(p => {
      p.update(dt, this);
      if (!p.alive) return;

      if (!p.isEnemy) {
        this.enemies.forEach(e => {
          if (e.alive && !p.hitEnemies.has(e)) {
            const dist = Math.hypot(e.x - p.x, e.y - p.y);
            if (dist <= e.radius + p.radius) {
              p.hitEnemies.add(e);

              let isCrit = Math.random() < this.player.getCritRate();
              if (this.player.nextHitGuaranteedCrit) {
                isCrit = true;
                this.player.nextHitGuaranteedCrit = false;
              }
              const finalDmg = p.damage * (isCrit ? this.player.getCritDamage() : 1.0);
              e.takeDamage(finalDmg, isCrit, this);

              // 祖安键盘爆炸逻辑
              if (p.isEvo && Math.random() < 0.35) {
                sound.playExplosion(false);
                this.addFloatingText(e.x, e.y - 15, "？？？", "#ef4444", 16);
                this.enemies.forEach(subE => {
                  if (subE.alive && Math.hypot(subE.x - e.x, subE.y - e.y) <= 70) {
                    subE.takeDamage(finalDmg * 1.0, true, this);
                  }
                });
              }

              if (p.pierce <= 0) {
                p.alive = false;
              } else {
                p.pierce--;
              }
            }
          }
        });
      } else {
        if (this.player && this.player.alive) {
          const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
          if (dist <= this.player.radius + p.radius) {
            p.alive = false;
            this.player.takeDamage(p.damage, null, this, p.type === "boss_bullet");
          }
        }
      }
    });

    this.projectiles = this.projectiles.filter(p => p.alive);
  }

  // 手机端防重叠 HUD 更新
  updateHUD() {
    if (!this.player) return;
    const p = this.player;

    // 1. 头像与生命
    const avatarEl = document.getElementById("hud-avatar");
    if (avatarEl) avatarEl.innerText = p.charConf.avatar;

    const hpPct = Math.max(0, Math.min(1, p.hp / p.maxHp));
    const hpBar = document.getElementById("hud-hp-fill");
    const hpText = document.getElementById("hud-hp-text");
    if (hpBar) hpBar.style.width = `${hpPct * 100}%`;
    if (hpText) hpText.innerText = `${Math.ceil(p.hp)} / ${Math.ceil(p.maxHp)}`;

    // 2. 时间与关卡名
    const timeVal = this.director.gameTime;
    const timeEl = document.getElementById("hud-time");
    if (timeEl) {
      if (timeVal >= 430) {
        const left = Math.max(0, 480 - timeVal);
        timeEl.innerText = `下班倒计时 00:${Math.floor(left).toString().padStart(2, '0')}`;
        timeEl.style.color = "#ef4444";
      } else {
        timeEl.innerText = `${this.formatTime(timeVal)} / 08:00`;
        timeEl.style.color = "#ffffff";
      }
    }

    // 3. 经验与等级
    const curXpNeeded = this.getXpNeeded(p.level);
    const xpPct = Math.max(0, Math.min(1, p.xp / curXpNeeded));
    const xpFill = document.getElementById("hud-xp-fill");
    const lvlText = document.getElementById("hud-level");
    if (xpFill) xpFill.style.width = `${xpPct * 100}%`;
    if (lvlText) lvlText.innerText = `Lv.${p.level}`;

    // 4. 压力条
    const pressurePct = Math.max(0, Math.min(100, p.pressure));
    const pressFill = document.getElementById("hud-pressure-fill");
    const pressText = document.getElementById("hud-pressure-text");
    if (pressFill) {
      pressFill.style.width = `${pressurePct}%`;
      if (p.isCollapsed) {
        pressFill.style.background = "#dc2626";
        pressFill.className = "pressure-fill pulse-fast";
      } else if (pressurePct >= 80) {
        pressFill.style.background = "#ef4444";
        pressFill.className = "pressure-fill pulse-slow";
      } else if (pressurePct >= 60) {
        pressFill.style.background = "#f97316";
        pressFill.className = "pressure-fill";
      } else if (pressurePct >= 30) {
        pressFill.style.background = "#eab308";
        pressFill.className = "pressure-fill";
      } else {
        pressFill.style.background = "#6b7280";
        pressFill.className = "pressure-fill";
      }
    }

    if (pressText) {
      let stateName = "正常 (0-29)";
      if (p.isCollapsed) stateName = "💥 崩溃中！每秒扣血";
      else if (pressurePct >= 80) stateName = "我要辞职！攻速+32% 伤害+50% 暴击+20%";
      else if (pressurePct >= 60) stateName = "暴躁：攻速+20% 伤害+25%";
      else if (pressurePct >= 30) stateName = "烦躁：攻速+12%";
      pressText.innerText = `压力: ${Math.round(p.pressure)}/100 【${stateName}】`;
    }

    // 5. 技能按键冷却
    const dodgeBtn = document.getElementById("btn-dodge");
    const skillBtn = document.getElementById("btn-skill");
    if (dodgeBtn) {
      if (p.dodgeCooldownTimer > 0) {
        dodgeBtn.classList.add("cooldown");
        dodgeBtn.setAttribute("data-cd", p.dodgeCooldownTimer.toFixed(1));
      } else {
        dodgeBtn.classList.remove("cooldown");
      }
    }
    if (skillBtn) {
      if (p.activeSkillCdTimer > 0 || p.wifiDisabledTimer > 0) {
        skillBtn.classList.add("cooldown");
        skillBtn.setAttribute("data-cd", (p.activeSkillCdTimer || p.wifiDisabledTimer).toFixed(1));
      } else {
        skillBtn.classList.remove("cooldown");
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(-this.camera.x, -this.camera.y);

    this.drawOfficeMap(ctx);
    this.aoeZones.forEach(z => z.draw(ctx));
    this.drops.forEach(d => d.draw(ctx));
    this.enemies.forEach(e => e.draw(ctx));

    if (this.player && this.player.alive) {
      this.player.draw(ctx);
    }

    this.projectiles.forEach(p => p.draw(ctx));
    this.particles.forEach(p => p.draw(ctx));
    this.damageNumbers.forEach(n => n.draw(ctx));
    this.floatingTexts.forEach(t => t.draw(ctx));

    ctx.restore();

    if (this.player && this.player.isCollapsed) {
      ctx.fillStyle = "rgba(220, 38, 38, 0.15)";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawOfficeMap(ctx) {
    const stageConf = this.director.stageConfig;
    const w = this.mapWidth;
    const h = this.mapHeight;

    ctx.fillStyle = stageConf.bgFloor;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = stageConf.gridColor;
    ctx.lineWidth = 1;
    const tileSize = 48;
    for (let x = 0; x <= w; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // 区域装饰
    ctx.fillStyle = "rgba(51, 65, 85, 0.35)";
    ctx.fillRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5);
    ctx.strokeStyle = "#475569";
    ctx.strokeRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5);

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const deskX = w * 0.28 + c * 140;
        const deskY = h * 0.30 + r * 120;
        ctx.fillStyle = "#475569";
        ctx.fillRect(deskX, deskY, 80, 40);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(deskX + 25, deskY + 5, 30, 6);
      }
    }

    ctx.fillStyle = "rgba(100, 116, 139, 0.3)";
    ctx.fillRect(60, 60, 260, 220);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px Arial";
    ctx.fillText("🖨️ 打印区", 80, 90);

    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.fillRect(w - 320, 60, 260, 200);
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 14px Arial";
    ctx.fillText("☕ 茶水间 (摸鱼区)", w - 300, 90);

    ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
    ctx.fillRect(60, h - 280, 320, 220);
    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 14px Arial";
    ctx.fillText("👥 大会议室", 80, h - 250);

    ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
    ctx.fillRect(w - 280, h - 260, 220, 200);
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 14px Arial";
    ctx.fillText("🛗 电梯口 (下班通道)", w - 260, h - 230);

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, w, h);
  }
}
