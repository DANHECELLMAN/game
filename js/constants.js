/**
 * 《今天也不想上班》- 动作肉鸽原型核心常量与配置表
 * 基于 Combat GDD V1.0
 */

// 空间缩放：1米 = 32像素
export const M_TO_PX = 32;

// 经验需求表 (Lv1 -> Lv20)
export const XP_TABLE = [
  0,   // Lv1
  16,  // 1->2
  22,  // 2->3
  30,  // 3->4
  40,  // 4->5
  52,  // 5->6
  66,  // 6->7
  82,  // 7->8
  100, // 8->9
  120, // 9->10
  142, // 10->11
  166, // 11->12
  192, // 12->13
  220, // 13->14
  250, // 14->15
  282, // 15->16
  316, // 16->17
  352, // 17->18
  390, // 18->19
  430  // 19->20
];

export function getXpRequiredForLevel(level) {
  if (level < XP_TABLE.length) {
    return XP_TABLE[level];
  }
  return 430 + (level - 20) * 45;
}

// 玩家基础属性
export const PLAYER_BASE = {
  name: "小陈",
  title: "普通运营",
  maxHp: 100,
  moveSpeed: 4.2 * M_TO_PX, // 134.4 px/s
  damageMult: 1.0,
  critRate: 0.05,
  critDmg: 1.6,
  armor: 0,
  xpMult: 1.0,
  pickupRadius: 2.2 * M_TO_PX, // 70.4 px
  pickupSpeed: 8.0 * M_TO_PX,  // 256 px/s
  
  // 闪避
  dodgeDistance: 2.8 * M_TO_PX, // 89.6 px
  dodgeDuration: 0.24, // 秒
  dodgeCooldown: 3.2,  // 秒
  dodgeInvulnTime: 0.14, // 秒
  perfectDodgeWindow: 0.18, // 秒
  
  // 主动技能：疯狂输出
  activeSkillCd: 18.0,
  activeSkillDuration: 3.0,
  activeSkillAtkSpdBonus: 0.70,
  activeSkillDmgBonus: 0.20,
  
  // 受伤保护
  hurtInvulnTime: 0.45,
  contactDmgCd: 0.65
};

// 压力等级定义 (0-100)
export const PRESSURE_STAGES = {
  NORMAL: { min: 0, max: 29, name: "正常", color: "#6b7280", atkSpd: 0, dmg: 0, crit: 0 },
  ANNOYED: { min: 30, max: 59, name: "烦躁", color: "#eab308", atkSpd: 0.08, dmg: 0, crit: 0 },
  IRRITABLE: { min: 60, max: 79, name: "暴躁", color: "#f97316", atkSpd: 0.12, dmg: 0.15, crit: 0 },
  RESIGN_MOOD: { min: 80, max: 99, name: "我要辞职", color: "#ef4444", atkSpd: 0.18, dmg: 0.30, crit: 0.12 },
  COLLAPSE: { min: 100, max: 100, name: "崩溃", color: "#dc2626", duration: 4.0, hpDrainPerSec: 0.04, resetPressure: 55 }
};

// 武器配置
export const WEAPONS = {
  keyboard: {
    id: "keyboard",
    name: "机械键盘",
    type: "projectile",
    icon: "⌨️",
    desc: "最容易上手的远程武器，发射清脆的键帽击溃工作。",
    tag: "键盘流 / 射速连锁",
    levels: [
      { level: 1, desc: "基础伤害11，攻击间隔0.55s，单发键帽", damage: 11, interval: 0.55, range: 8 * M_TO_PX, count: 1, pierce: 0 },
      { level: 2, desc: "伤害 +18%", damageMult: 1.18 },
      { level: 3, desc: "攻击间隔 -12%", intervalMult: 0.88 },
      { level: 4, desc: "每第4次攻击额外发射1枚键帽（锁定不同目标）", bonusEvery4: true },
      { level: 5, desc: "伤害 +22%，键帽小幅穿透1个目标", damageMult: 1.22, pierce: 1 }
    ],
    evolution: {
      id: "keyboard_evo",
      name: "祖安机械键盘",
      icon: "⚡⌨️",
      desc: "攻击间隔×0.72，每次双发键帽，命中有18%概率触发“？？？”范围爆炸（60%伤害）！",
      req: { keyboard: 5, coffee: 3, dual_screen: 3 }
    }
  },
  mug: {
    id: "mug",
    name: "马克杯",
    type: "orbit",
    icon: "☕",
    desc: "带薪泡茶神器，杯子环绕自身，对靠近的同事造成伤害。",
    tag: "杯子流 / 防守贴脸",
    levels: [
      { level: 1, desc: "1个杯子环绕，每次造成16伤害", damage: 16, count: 1, speed: 2.2, radius: 2.2 * M_TO_PX, hitCd: 0.45 },
      { level: 2, desc: "旋转速度 +20%", speedMult: 1.20 },
      { level: 3, desc: "杯子数量 +1 (共2个)", count: 2 },
      { level: 4, desc: "伤害 +25%，旋转半径 +10%", damageMult: 1.25, radiusMult: 1.10 },
      { level: 5, desc: "杯子数量 +1 (共3个)，附带击退效果", count: 3, knockback: true }
    ],
    evolution: {
      id: "mug_evo",
      name: "无限续杯",
      icon: "🌊☕",
      desc: "4个马克杯环绕；每8秒产生一次咖啡冲击波（半径3.2m），击退并重创普通怪！",
      req: { mug: 5, shield: 3, coffee: 2 }
    }
  },
  resignation: {
    id: "resignation",
    name: "辞职信",
    type: "mortar",
    icon: "📄",
    desc: "将积攒的离职决心砸向敌群，造成大范围破坏。",
    tag: "辞职流 / 慢速爆炸",
    levels: [
      { level: 1, desc: "每2.0s投出辞职信，爆炸半径1.8m，伤害38", damage: 38, interval: 2.0, radius: 1.8 * M_TO_PX },
      { level: 2, desc: "爆炸半径 +18%", radiusMult: 1.18 },
      { level: 3, desc: "伤害 +25%", damageMult: 1.25 },
      { level: 4, desc: "爆炸后留下“离职情绪”区域2秒（每0.5s造成20%伤害）", poolDuration: 2.0, poolDmgMult: 0.2 },
      { level: 5, desc: "攻击间隔 -18%，爆炸伤害 +20%", intervalMult: 0.82, damageMult: 1.20 }
    ],
    evolution: {
      id: "resignation_evo",
      name: "辞职报告",
      icon: "📑💥",
      desc: "每2.2秒呼叫一份大型辞职报告砸向敌群中心（半径3.2m，180%伤害；压力≥80时范围额外+25%）！",
      req: { resignation: 5, quit: 3, kpi: 2 }
    }
  }
};

// 15个升级技能
export const SKILLS = {
  coffee: {
    id: "coffee",
    name: "加班咖啡",
    icon: "☕",
    tags: ["输出", "射速"],
    maxLevel: 5,
    rarity: "common",
    descs: [
      "攻击速度 +8%",
      "攻击速度 +16%",
      "攻击速度 +24% (可进化键盘/杯子)",
      "攻击速度 +32%",
      "攻击速度 +40%"
    ],
    values: [0.08, 0.16, 0.24, 0.32, 0.40]
  },
  dual_screen: {
    id: "dual_screen",
    name: "双屏办公",
    icon: "🖥️",
    tags: ["输出", "弹道"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "弹道数量 +1",
      "弹道数量 +1，伤害额外 +10%",
      "弹道数量 +2，伤害额外 +10% (可进化键盘)"
    ],
    projectiles: [1, 1, 2],
    dmgBonus: [0, 0.10, 0.10]
  },
  keyboard_warrior: {
    id: "keyboard_warrior",
    name: "键盘侠",
    icon: "⌨️🔥",
    tags: ["输出", "暴击"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "暴击率 +6%",
      "暴击率 +12%",
      "暴击率 +18%",
      "暴击率 +24%，暴击伤害额外 +20%"
    ],
    critRate: [0.06, 0.12, 0.18, 0.24],
    critDmg: [0, 0, 0, 0.20]
  },
  kpi: {
    id: "kpi",
    name: "KPI",
    icon: "📈",
    tags: ["风险", "伤害"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "总伤害 +15%，但压力获取 +10%",
      "总伤害 +30%，但压力获取 +18% (可进化辞职信)",
      "总伤害 +45%，但压力获取 +25%"
    ],
    dmgBonus: [0.15, 0.30, 0.45],
    pressureGain: [0.10, 0.18, 0.25]
  },
  boss_is_coming: {
    id: "boss_is_coming",
    name: "老板又来了",
    icon: "👀",
    tags: ["压力", "爆发"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "压力≥60时，伤害额外 +8%",
      "压力≥60时，伤害额外 +16%",
      "压力≥60时，伤害额外 +25%"
    ],
    highPressureDmg: [0.08, 0.16, 0.25]
  },
  quit: {
    id: "quit",
    name: "我不干了",
    icon: "🚪",
    tags: ["压力", "爆表"],
    maxLevel: 3,
    rarity: "epic",
    descs: [
      "崩溃后获得3秒辞职状态：总伤害+50%，崩溃后压力回40",
      "崩溃后获得4秒辞职状态：总伤害+75%，崩溃后压力回40",
      "崩溃后获得5秒辞职状态：总伤害+100%，崩溃后压力回40 (可进化辞职信)"
    ],
    quitDur: [3.0, 4.0, 5.0],
    quitDmg: [0.50, 0.75, 1.00]
  },
  shield: {
    id: "shield",
    name: "工位护盾",
    icon: "🛡️",
    tags: ["生存"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "每14秒获得1层护盾，抵挡1次伤害（最多1层）",
      "每11秒获得1层护盾，抵挡1次伤害（最多1层）",
      "每8秒获得1层护盾，抵挡1次伤害（可进化杯子）"
    ],
    interval: [14.0, 11.0, 8.0]
  },
  paid_slacking: {
    id: "paid_slacking",
    name: "带薪摸鱼",
    icon: "🐟",
    tags: ["回复"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "每35秒恢复 6% 最大生命",
      "每28秒恢复 6% 最大生命",
      "每22秒恢复 6% 最大生命"
    ],
    interval: [35.0, 28.0, 22.0],
    healPct: 0.06
  },
  lunch_break: {
    id: "lunch_break",
    name: "午休",
    icon: "🍱",
    tags: ["回复", "站桩"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "静止2秒后，每秒恢复 1.0% 最大生命（移动中断）",
      "静止2秒后，每秒恢复 1.5% 最大生命（移动中断）",
      "静止2秒后，每秒恢复 2.0% 最大生命（移动中断）"
    ],
    standTime: 2.0,
    healPerSec: [0.01, 0.015, 0.02]
  },
  on_time_off: {
    id: "on_time_off",
    name: "准点下班",
    icon: "👟",
    tags: ["移动"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "移动速度 +6%",
      "移动速度 +12%",
      "移动速度 +18%",
      "移动速度 +24%"
    ],
    spdBonus: [0.06, 0.12, 0.18, 0.24]
  },
  elevator_dash: {
    id: "elevator_dash",
    name: "电梯冲刺",
    icon: "🛗",
    tags: ["闪避"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "闪避距离 +15%",
      "闪避距离 +30%",
      "闪避距离 +45%，闪避CD额外 -0.3秒"
    ],
    distBonus: [0.15, 0.30, 0.45],
    cdReduction: [0, 0, 0.3]
  },
  toilet_excuse: {
    id: "toilet_excuse",
    name: "假装去厕所",
    icon: "🚽",
    tags: ["闪避", "减压"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "闪避后0.5秒内受击压力获取减半；完美闪避额外 -3 压力",
      "闪避后0.8秒内受击压力获取减半；完美闪避额外 -3 压力",
      "闪避后1.1秒内受击压力获取减半；完美闪避额外 -3 压力"
    ],
    safeDur: [0.5, 0.8, 1.1],
    extraDodgePressure: 3
  },
  loudspeaker_meeting: {
    id: "loudspeaker_meeting",
    name: "扩音会议",
    icon: "📢",
    tags: ["范围"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "范围效果半径 +8%",
      "范围效果半径 +16%",
      "范围效果半径 +24%",
      "范围效果半径 +32%"
    ],
    areaBonus: [0.08, 0.16, 0.24, 0.32]
  },
  slacker_science: {
    id: "slacker_science",
    name: "摸鱼学",
    icon: "🎓",
    tags: ["经验", "成长"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "经验获取 +10%，基础伤害 -0%",
      "经验获取 +20%，基础伤害 -5%",
      "经验获取 +30%，基础伤害 -8%"
    ],
    xpBonus: [0.10, 0.20, 0.30],
    dmgPenalty: [0.0, 0.05, 0.08]
  },
  last_minute_rush: {
    id: "last_minute_rush",
    name: "临时抱佛脚",
    icon: "⚡🙏",
    tags: ["低血爆发"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "生命≤35%时，攻速 +12%",
      "生命≤35%时，攻速 +24%，暴击率 +5%",
      "生命≤35%时，攻速 +36%，暴击率 +10%"
    ],
    hpThreshold: 0.35,
    atkSpdBonus: [0.12, 0.24, 0.36],
    critBonus: [0, 0.05, 0.10]
  }
};

// 8个神器
export const ARTIFACTS = {
  paid_poop: {
    id: "paid_poop",
    name: "带薪拉屎",
    icon: "🧻",
    desc: "每30秒自动进入2秒无敌；期间无法攻击（保命神技）。"
  },
  company_wifi: {
    id: "company_wifi",
    name: "公司Wi-Fi",
    icon: "📶",
    desc: "主动技能CD -25%；但每45秒有一次2秒“断网”使主动技能不可用。"
  },
  boss_pie: {
    id: "boss_pie",
    name: "老板画的饼",
    icon: "🫓",
    desc: "最大生命 +40%，拾取时仅恢复10生命。"
  },
  year_end_bonus: {
    id: "year_end_bonus",
    name: "年终奖",
    icon: "💰",
    desc: "本局工资掉落 +80%（战斗属性不变）。"
  },
  resignation_cert: {
    id: "resignation_cert",
    name: "离职证明",
    icon: "📜",
    desc: "首次死亡时复活至35%生命；复活后压力直接升至80！"
  },
  noise_cancelling_headphones: {
    id: "noise_cancelling_headphones",
    name: "降噪耳机",
    icon: "🎧",
    desc: "会议怪减速效果降低70%；远程弹道预警更明显。"
  },
  work_badge: {
    id: "work_badge",
    name: "工牌",
    icon: "🪪",
    desc: "受到精英怪伤害 -15%，但受到普通怪伤害 +5%。"
  },
  boss_keyboard: {
    id: "boss_keyboard",
    name: "老板的键盘",
    icon: "👑⌨️",
    desc: "武器伤害 +35%，主动技能CD +20%。"
  }
};

// 8种普通敌人配置
export const NORMAL_ENEMIES = {
  zombie_colleague: {
    id: "zombie_colleague",
    name: "同事僵尸",
    icon: "🧟",
    hp: 26,
    damage: 6,
    speed: 1.7 * M_TO_PX,
    threatCost: 1.0,
    xpDrop: 1,
    size: 14,
    color: "#9ca3af",
    firstAppearTime: 0
  },
  file_monster: {
    id: "file_monster",
    name: "文件怪",
    icon: "📁",
    hp: 38,
    damage: 8,
    speed: 1.35 * M_TO_PX,
    threatCost: 1.4,
    xpDrop: 2,
    size: 16,
    color: "#f59e0b",
    firstAppearTime: 0,
    splitOnDeath: {
      count: 2,
      id: "paper_scrap",
      name: "散落纸片",
      hp: 8,
      damage: 3,
      speed: 1.6 * M_TO_PX,
      size: 9,
      color: "#fef3c7"
    }
  },
  mail_monster: {
    id: "mail_monster",
    name: "邮件怪",
    icon: "✉️",
    hp: 24,
    damage: 7,
    speed: 1.1 * M_TO_PX,
    threatCost: 1.8,
    xpDrop: 2,
    size: 13,
    color: "#38bdf8",
    firstAppearTime: 45,
    attackType: "ranged",
    keepDistance: 5.5 * M_TO_PX,
    attackInterval: 2.2,
    bulletSpeed: 4.5 * M_TO_PX,
    bulletDamage: 7,
    telegraphTime: 0.35
  },
  printer: {
    id: "printer",
    name: "打印机",
    icon: "🖨️",
    hp: 65,
    damage: 9,
    speed: 0,
    threatCost: 3.0,
    xpDrop: 4,
    size: 20,
    color: "#64748b",
    firstAppearTime: 120,
    attackType: "turret",
    attackInterval: 3.0,
    bulletSpeed: 3.8 * M_TO_PX,
    bulletCount: 3,
    spreadAngle: 0.5,
    telegraphTime: 0.4
  },
  phone_monster: {
    id: "phone_monster",
    name: "电话怪",
    icon: "☎️",
    hp: 42,
    damage: 10,
    speed: 2.1 * M_TO_PX,
    threatCost: 2.2,
    xpDrop: 3,
    size: 15,
    color: "#ec4899",
    firstAppearTime: 180,
    attackType: "ring_shock",
    triggerDistance: 2.2 * M_TO_PX,
    chargeTime: 0.6,
    radius: 2.2 * M_TO_PX
  },
  meeting_monster: {
    id: "meeting_monster",
    name: "会议怪",
    icon: "👥",
    hp: 70,
    damage: 5,
    speed: 0.9 * M_TO_PX,
    threatCost: 3.4,
    xpDrop: 4,
    size: 22,
    color: "#a855f7",
    firstAppearTime: 195,
    auraRadius: 2.8 * M_TO_PX,
    slowPct: 0.35
  },
  demand_ball: {
    id: "demand_ball",
    name: "需求球",
    icon: "🔴",
    hp: 20,
    damage: 6,
    speed: 2.5 * M_TO_PX,
    threatCost: 2.0,
    xpDrop: 2,
    size: 12,
    color: "#ef4444",
    firstAppearTime: 300,
    attackType: "rush",
    rushDuration: 3.0,
    pauseDuration: 1.0,
    rushSpeed: 3.8 * M_TO_PX
  },
  red_dot: {
    id: "red_dot",
    name: "红点消息",
    icon: "💬",
    hp: 14,
    damage: 4,
    speed: 3.0 * M_TO_PX,
    threatCost: 0.7,
    xpDrop: 1,
    size: 10,
    color: "#dc2626",
    firstAppearTime: 360,
    groupCount: 3
  }
};

// 2种精英怪
export const ELITES = {
  hr: {
    id: "hr",
    name: "HR",
    icon: "👩‍💼",
    hp: 520,
    damage: 14,
    dmgReduction: 0.10,
    speed: 1.3 * M_TO_PX,
    size: 26,
    color: "#f43f5e",
    spawnTime: 160, // 2:40
    xpDrop: 60,
    artifactChance: 0.25,
    healChance: 0.20,
    skillCd: 6.0,
    telegraphTime: 1.2,
    debuffDuration: 5.0,
    debuffDmgReduc: 0.20
  },
  pm: {
    id: "pm",
    name: "项目经理",
    icon: "👨‍💼",
    hp: 720,
    damage: 16,
    dmgReduction: 0.12,
    speed: 1.25 * M_TO_PX,
    size: 28,
    color: "#0284c7",
    spawnTime: 290, // 4:50
    xpDrop: 85,
    artifactChance: 0.35,
    summonDemandCd: 7.0,
    meetingZoneCd: 12.0,
    meetingZoneRadius: 3.5 * M_TO_PX,
    meetingZoneDuration: 4.0
  }
};

// Boss：主管
export const BOSS_CONFIG = {
  id: "supervisor",
  name: "主管",
  title: "终极加班推手",
  icon: "👹",
  hp: 3600,
  damage: 18,
  dmgReduction: 0.15,
  speed: 1.4 * M_TO_PX,
  size: 36,
  color: "#b91c1c",
  spawnTime: 480, // 8:00
  phases: [
    { name: "P1", hpPct: 0.70 },
    { name: "P2", hpPct: 0.35 },
    { name: "P3", hpPct: 0.00 }
  ],
  skills: {
    file_rain: {
      name: "这个今天能做完吧？",
      telegraph: 0.75,
      count: 5,
      interval: 0.25,
      radius: 1.2 * M_TO_PX,
      damage: 16
    },
    meeting: {
      name: "来开个会",
      telegraph: 1.0,
      count: 3,
      radius: 2.8 * M_TO_PX,
      duration: 5.0,
      slowPct: 0.40
    },
    demand: {
      name: "临时需求",
      telegraph: 0.65,
      countP2: 4,
      countP3: 6
    },
    progress_report: {
      name: "汇报一下进度",
      telegraph: 0.9,
      waves: 3,
      angle: 55 * (Math.PI / 180),
      bulletSpeed: 5.0 * M_TO_PX,
      damage: 12
    },
    overtime_tonight: {
      name: "今晚加个班",
      telegraph: 1.2,
      duration: 10.0,
      atkSpdBuff: 0.20,
      redDotInterval: 2.0
    }
  }
};

// 局外天赋 (5项，每项最多5级)
export const TALENTS = {
  health_check: {
    id: "health_check",
    name: "体检报告",
    icon: "📋",
    desc: "最大生命 +2% / 级",
    maxLevel: 5,
    valPerLvl: 0.02,
    prices: [100, 180, 300, 480, 700]
  },
  skilled_worker: {
    id: "skilled_worker",
    name: "熟练工",
    icon: "🔧",
    desc: "基础伤害 +2% / 级",
    maxLevel: 5,
    valPerLvl: 0.02,
    prices: [120, 220, 360, 560, 820]
  },
  fast_runner: {
    id: "fast_runner",
    name: "跑得快",
    icon: "🏃",
    desc: "移速 +1.5% / 级",
    maxLevel: 5,
    valPerLvl: 0.015,
    prices: [90, 160, 260, 420, 620]
  },
  slacker_xp: {
    id: "slacker_xp",
    name: "摸鱼经验",
    icon: "💡",
    desc: "经验获取 +2% / 级",
    maxLevel: 5,
    valPerLvl: 0.02,
    prices: [100, 180, 300, 480, 700]
  },
  mental_construction: {
    id: "mental_construction",
    name: "心理建设",
    icon: "🧘",
    desc: "崩溃流血每秒 -0.2% 最大生命 / 级",
    maxLevel: 5,
    valPerLvl: 0.002,
    prices: [140, 240, 390, 600, 900]
  }
};

// 刷怪波次时间表 (8分钟)
export const WAVE_TIMELINE = [
  { start: 0, end: 45, budget: 11, hpMult: 1.00, dmgMult: 1.00, enemies: ["zombie_colleague", "file_monster"], desc: "同事僵尸 + 文件怪；学会移动与基础攻击" },
  { start: 45, end: 90, budget: 14, hpMult: 1.05, dmgMult: 1.00, enemies: ["zombie_colleague", "file_monster", "mail_monster"], desc: "加入邮件怪，考验远程躲避" },
  { start: 90, end: 120, budget: 16, hpMult: 1.12, dmgMult: 1.00, enemies: ["zombie_colleague", "file_monster", "mail_monster"], desc: "小爆发波，2:00给出降压休息" },
  { start: 120, end: 180, budget: 18, hpMult: 1.18, dmgMult: 1.03, enemies: ["zombie_colleague", "file_monster", "mail_monster", "printer"], desc: "加入打印机炮台；2:40首只精英HR登场" },
  { start: 180, end: 270, budget: 24, hpMult: 1.28, dmgMult: 1.08, enemies: ["zombie_colleague", "mail_monster", "phone_monster", "meeting_monster"], desc: "会议怪 + 电话怪，地图软封锁" },
  { start: 270, end: 330, budget: 28, hpMult: 1.38, dmgMult: 1.11, enemies: ["zombie_colleague", "file_monster", "phone_monster", "meeting_monster"], desc: "4:50项目经理精英登场" },
  { start: 330, end: 400, budget: 33, hpMult: 1.48, dmgMult: 1.15, enemies: ["zombie_colleague", "demand_ball", "red_dot", "mail_monster"], desc: "需求球 + 远近混编，进入爽感高峰" },
  { start: 400, end: 440, budget: 44, hpMult: 1.68, dmgMult: 1.22, enemies: ["zombie_colleague", "file_monster", "demand_ball", "red_dot", "meeting_monster"], desc: "“临时需求”事件！刷新率+35%，压力快速上涨", specialEvent: "temp_demand" },
  { start: 440, end: 480, budget: 55, hpMult: 1.85, dmgMult: 1.28, enemies: ["zombie_colleague", "demand_ball", "red_dot", "mail_monster", "phone_monster"], desc: "“马上下班”冲刺高潮，营造Boss前压迫感" }
];
