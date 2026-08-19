/**
 * 《今天也不想上班》- Web Audio API 音频合成系统 (V1.3 升级版)
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmNode = null;
    this.bgmPlaying = false;
    this.lastHeartbeatTime = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.muted;
  }

  // 1. 机械键盘键帽声
  playKeyboardShot(isEvo = false) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isEvo ? "sawtooth" : "square";
      const baseFreq = isEvo ? 880 : (600 + Math.random() * 200);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // 2. 马克杯碰撞/水花声
  playMugHit() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // 3. 辞职信爆炸声
  playExplosion(isLarge = false) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * (isLarge ? 0.35 : 0.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(isLarge ? 350 : 500, now);
      filter.frequency.linearRampToValueAtTime(50, now + (isLarge ? 0.35 : 0.2));

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isLarge ? 0.5 : 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (isLarge ? 0.35 : 0.2));

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  // 4. 耳机声波脉冲音效 (新武器)
  playSonicWave(isEvo = false) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(isEvo ? 140 : 260, now);
      osc.frequency.exponentialRampToValueAtTime(isEvo ? 40 : 60, now + 0.25);

      gain.gain.setValueAtTime(isEvo ? 0.45 : 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // 5. 水杯碎裂与水泼地音效 (新武器)
  playCupShatter(isEvo = false) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 玻璃碎裂高频 + 水花
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(1800 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // 6. 充电线电击挥舞音效 (新武器)
  playElectricWhip(isEvo = false) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(isEvo ? 900 : 650, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(isEvo ? 0.35 : 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // 7. 受伤音效
  playHurt() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.15);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // 8. 闪避风声
  playDodge() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  // 9. 完美闪避音效
  playPerfectDodge() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [880, 1174, 1760].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.3, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
    } catch (e) {}
  }

  // 10. 经验拾取音
  playXp() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(950 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // 11. 升级音效
  playLevelUp() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.35, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  // 12. 崩溃报警音
  playCollapseAlarm() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.15);
      osc.frequency.linearRampToValueAtTime(800, now + 0.3);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // 13. 高压力心跳
  playHeartbeat() {
    if (this.muted || !this.ctx) return;
    const now = Date.now();
    if (now - this.lastHeartbeatTime < 700) return;
    this.lastHeartbeatTime = now;
    try {
      const t = this.ctx.currentTime;
      [0, 0.18].forEach(delay => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(80, t + delay);
        osc.frequency.exponentialRampToValueAtTime(35, t + delay + 0.12);

        gain.gain.setValueAtTime(0.5, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + delay);
        osc.stop(t + delay + 0.12);
      });
    } catch (e) {}
  }

  // 14. Boss警告汽笛
  playBossWarning() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.6);
      osc.frequency.linearRampToValueAtTime(220, now + 1.2);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.4);
    } catch (e) {}
  }

  // 15. 胜利通关欢呼
  playVictory() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.4, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.5);
      });
    } catch (e) {}
  }

  // 16. UI点击
  playClick() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 17. 简单BGM节奏循环生成器
  startBgm() {
    if (this.muted || !this.ctx || this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.scheduleBgmLoop();
  }

  scheduleBgmLoop() {
    if (!this.bgmPlaying || this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const tempo = 120;
    const beatLen = 60 / tempo;
    const bassline = [110, 110, 130.81, 146.83, 110, 110, 98, 123.47];

    bassline.forEach((freq, idx) => {
      const t = now + idx * beatLen;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + beatLen * 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + beatLen);
    });

    const loopDuration = bassline.length * beatLen;
    this.bgmTimer = setTimeout(() => {
      this.scheduleBgmLoop();
    }, loopDuration * 1000 - 50);
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sound = new SoundSystem();
