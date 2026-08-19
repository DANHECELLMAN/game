/**
 * 《今天也不想上班》- 核心常量与配置表 (V1.4 全周关卡与Boss大更版)
 * 包含：4大角色、6大武器（平衡初始范围与2s残留）、一周6大关卡与6大专属Boss设计
 */

export const M_TO_PX = 32;

// 经验需求表 (平滑且适中的成长梯度)
export const XP_TABLE = [
  0,   // Lv1
  14,  // 1->2
  20,  // 2->3
  28,  // 3->4
  38,  // 4->5
  50,  // 5->6
  64,  // 6->7
  80,  // 7->8
  98,  // 8->9
  118, // 9->10
  140, // 10->11
  164, // 11->12
  190, // 12->13
  218, // 13->14
  248, // 14->15
  280, // 15->16
  314, // 16->17
  350, // 17->18
  388, // 18->19
  428  // 19->20
];

export function getXpRequiredForLevel(level) {
  if (level < XP_TABLE.length) {
    return XP_TABLE[level];
  }
  return 428 + (level - 20) * 42;
}

// 4大可选角色定义
export const CHARACTERS = {
  xiaochen: {
    id: "xiaochen",
    name: "小陈",
    title: "全能运营",
    avatar: "👨‍💼",
    desc: "综合能力全面均衡，升级后摸鱼极速奔跑，适合新手稳健通关。",
    initialWeapon: "keyboard",
    baseStats: {
      maxHp: 110,
      moveSpeed: 4.2 * M_TO_PX,
      damageMult: 1.05,
      critRate: 0.05,
      critDmg: 1.6,
      xpMult: 1.0,
      pickupRadius: 2.3 * M_TO_PX
    },
    passive: {
      name: "熟练摸鱼",
      desc: "每次升级后3秒内移动速度 +20%，拾取范围 +40%。"
    },
    active: {
      name: "疯狂输出",
      icon: "🔥",
      desc: "3.5秒内攻击速度 +70%，武器伤害 +25%！",
      cd: 16.0,
      duration: 3.5
    }
  },
  awei: {
    id: "awei",
    name: "阿伟",
    title: "资深开发",
    avatar: "👨‍💻",
    desc: "代码战神，擅长范围电击与群体控场，击杀时引发内存泄露爆炸。",
    initialWeapon: "charging_cable",
    baseStats: {
      maxHp: 100,
      moveSpeed: 4.0 * M_TO_PX,
      damageMult: 1.15,
      critRate: 0.07,
      critDmg: 1.65,
      xpMult: 1.05,
      pickupRadius: 2.2 * M_TO_PX
    },
    passive: {
      name: "线上热更",
      desc: "击杀敌人有 16% 概率引发代码内存泄漏爆炸（小范围AOE伤害）。"
    },
    active: {
      name: "系统崩溃",
      icon: "⚡",
      desc: "全屏冻结所有杂兵 3.0 秒，并造成 130 点电击伤害！",
      cd: 18.0,
      duration: 3.0
    }
  },
  lili: {
    id: "lili",
    name: "莉莉",
    title: "视觉设计",
    avatar: "👩‍🎨",
    desc: "像素主宰，天生高暴击与高机动，挥洒水彩风暴绞杀四周。",
    initialWeapon: "water_cup",
    baseStats: {
      maxHp: 90,
      moveSpeed: 4.4 * M_TO_PX,
      damageMult: 1.10,
      critRate: 0.16,
      critDmg: 1.9,
      xpMult: 1.0,
      pickupRadius: 2.2 * M_TO_PX
    },
    passive: {
      name: "像素精度",
      desc: "暴击率额外 +12%，暴击伤害额外 +30%。"
    },
    active: {
      name: "改稿风暴",
      icon: "🎨",
      desc: "召唤旋转调色盘风暴环绕 4.5 秒，绞杀沿途敌人与弹道！",
      cd: 17.0,
      duration: 4.5
    }
  },
  xiaozhang: {
    id: "xiaozhang",
    name: "小张",
    title: "无畏实习",
    avatar: "🧑‍🎓",
    desc: "奇迹成长流，吃经验飞快，三选一极易刷出稀有高阶技能词条。",
    initialWeapon: "resignation",
    baseStats: {
      maxHp: 95,
      moveSpeed: 4.3 * M_TO_PX,
      damageMult: 1.00,
      critRate: 0.06,
      critDmg: 1.6,
      xpMult: 1.30,
      pickupRadius: 2.5 * M_TO_PX
    },
    passive: {
      name: "潜力爆发",
      desc: "经验获取 +30%，升级池刷出稀有/史诗词条几率大幅提升！"
    },
    active: {
      name: "假装很忙",
      icon: "🏃",
      desc: "进入无敌隐身状态 3.0 秒，移速 +40% 并沿路洒下伤害咖啡豆！",
      cd: 20.0,
      duration: 3.0
    }
  }
};

export const PLAYER_BASE = {
  dodgeDistance: 2.8 * M_TO_PX,
  dodgeDuration: 0.24,
  dodgeCooldown: 3.2,
  dodgeInvulnTime: 0.15,
  perfectDodgeWindow: 0.18,
  hurtInvulnTime: 0.45,
  contactDmgCd: 0.65
};

// 压力系统分段
export const PRESSURE_STAGES = {
  NORMAL: { min: 0, max: 29, name: "正常", color: "#6b7280", atkSpd: 0, dmg: 0, crit: 0 },
  ANNOYED: { min: 30, max: 59, name: "烦躁", color: "#eab308", atkSpd: 0.10, dmg: 0.05, crit: 0 },
  IRRITABLE: { min: 60, max: 79, name: "暴躁", color: "#f97316", atkSpd: 0.16, dmg: 0.18, crit: 0.05 },
  RESIGN_MOOD: { min: 80, max: 99, name: "我要辞职", color: "#ef4444", atkSpd: 0.25, dmg: 0.38, crit: 0.15 },
  COLLAPSE: { min: 100, max: 100, name: "崩溃", color: "#dc2626", duration: 4.0, hpDrainPerSec: 0.04, resetPressure: 55 }
};

// 6大武器配置 (削弱初始范围、缩短残留时间为2秒)
export const WEAPONS = {
  keyboard: {
    id: "keyboard",
    name: "机械键盘",
    type: "projectile",
    icon: "⌨️",
    desc: "高射速远程键帽，成长后具备多弹道与穿透。",
    tag: "射速 / 穿透",
    levels: [
      { level: 1, desc: "基础伤害 14，攻击间隔 0.52s，发射单发键帽", damage: 14, interval: 0.52, range: 8.0 * M_TO_PX, count: 1, pierce: 0 },
      { level: 2, desc: "伤害 +20%", damageMult: 1.20 },
      { level: 3, desc: "攻击间隔 -15%", intervalMult: 0.85 },
      { level: 4, desc: "发射键帽数 +1 (双发散射)", extraCount: 1 },
      { level: 5, desc: "伤害 +25%，键帽穿透 +1 目标", damageMult: 1.25, pierce: 1 }
    ],
    evolution: {
      id: "keyboard_evo",
      name: "祖安机械键盘",
      icon: "⚡⌨️",
      desc: "极速双发狂暴键帽！命中有 25% 概率触发“？？？”连锁爆炸（造成80%伤害）！",
      req: { keyboard: 5, coffee: 3, dual_screen: 3 }
    }
  },
  mug: {
    id: "mug",
    name: "马克杯",
    type: "orbit",
    icon: "☕",
    desc: "白瓷杯环绕自身，对靠近的敌人造成高频近身绞杀。",
    tag: "防守 / 贴脸环绕",
    levels: [
      { level: 1, desc: "1个杯子环绕，每次造成 18 伤害", damage: 18, count: 1, speed: 2.4, radius: 2.2 * M_TO_PX, hitCd: 0.45 },
      { level: 2, desc: "旋转速度 +25%", speedMult: 1.25 },
      { level: 3, desc: "杯子数量 +1 (共2个)", count: 2 },
      { level: 4, desc: "伤害 +25%，旋转半径 +10%", damageMult: 1.25, radiusMult: 1.10 },
      { level: 5, desc: "杯子数量 +1 (共3个)，附带击退", count: 3, knockback: true }
    ],
    evolution: {
      id: "mug_evo",
      name: "无限续杯",
      icon: "🌊☕",
      desc: "4个马克杯高速环绕！每 7 秒释放一次 3.5 米咖啡冲击波击飞杂兵！",
      req: { mug: 5, shield: 3, coffee: 2 }
    }
  },
  resignation: {
    id: "resignation",
    name: "辞职信",
    type: "mortar",
    icon: "📄",
    desc: "抛射公文袋轰炸敌群，爆炸后留下腐蚀水洼。",
    tag: "范围 / 轰炸",
    levels: [
      { level: 1, desc: "每 2.0s 投掷辞职信，爆炸半径 1.8m，伤害 45", damage: 45, interval: 2.0, radius: 1.8 * M_TO_PX },
      { level: 2, desc: "爆炸半径 +20%", radiusMult: 1.20 },
      { level: 3, desc: "伤害 +25%", damageMult: 1.25 },
      { level: 4, desc: "爆炸后留下持续 2.0 秒的“离职情绪”水洼", poolDuration: 2.0, poolDmgMult: 0.25 },
      { level: 5, desc: "投掷间隔 -20%，爆炸伤害 +25%", intervalMult: 0.80, damageMult: 1.25 }
    ],
    evolution: {
      id: "resignation_evo",
      name: "辞职报告",
      icon: "📑💥",
      desc: "每 2.2 秒召唤巨型辞职报告砸向敌群中心（半径 3.4m，190% 伤害；压力≥80时范围 +25%）！",
      req: { resignation: 5, quit: 3, kpi: 2 }
    }
  },
  headphones: {
    id: "headphones",
    name: "降噪耳机",
    type: "sonic",
    icon: "🎧",
    desc: "发射 360° 声波震荡，穿透击退附近敌群。",
    tag: "范围 / 声波穿透",
    levels: [
      { level: 1, desc: "每 2.0s 释放 2.2m 环形声波，造成 24 伤害并穿透全怪", damage: 24, interval: 2.0, radius: 2.2 * M_TO_PX },
      { level: 2, desc: "声波半径 +20%，伤害 +18%", radiusMult: 1.20, damageMult: 1.18 },
      { level: 3, desc: "释放间隔 -15%，击退距离提升", intervalMult: 0.85 },
      { level: 4, desc: "每次攻击释放 2 道回响声波 (双重打击)", echoWaves: 2 },
      { level: 5, desc: "声波伤害 +25%，声波半径 +20%", damageMult: 1.25, radiusMult: 1.20 }
    ],
    evolution: {
      id: "headphones_evo",
      name: "降噪核爆耳机",
      icon: "☢️🎧",
      desc: "每 1.4 秒释放半径 4.2 米的核爆声浪（造成 150% 伤害），同时震碎范围内的敌方子弹！",
      req: { headphones: 5, loudspeaker_meeting: 3, on_time_off: 2 }
    }
  },
  water_cup: {
    id: "water_cup",
    name: "养生水杯",
    type: "puddle_throw",
    icon: "🫗",
    desc: "投掷水杯碎裂在地，留下持续 2 秒的水洼造成持续伤害。",
    tag: "地面 / 持续伤害",
    levels: [
      { level: 1, desc: "每 2.2s 投掷1个水杯，落地生成 1.8m 水洼持续 2.0 秒（每0.5s造成15伤害）", damage: 15, interval: 2.2, radius: 1.8 * M_TO_PX, count: 1, duration: 2.0 },
      { level: 2, desc: "水洼半径 +20%，投掷间隔 -15%", radiusMult: 1.20, intervalMult: 0.85 },
      { level: 3, desc: "投掷数量 +1 (同时扔出2个水杯)", count: 2 },
      { level: 4, desc: "地面伤害 +30%，持续时间延长至 2.5 秒", damageMult: 1.30, duration: 2.5 },
      { level: 5, desc: "投掷数量 +1 (共3个水杯)，水洼敌人减速 30%", count: 3, slowPct: 0.30 }
    ],
    evolution: {
      id: "water_cup_evo",
      name: "高压八杯水领域",
      icon: "🌊🫗",
      desc: "同时投掷 3 个巨型加湿水桶，形成持续 3.5 秒的暴风雨领域并为自己回血！",
      req: { water_cup: 5, paid_slacking: 3, lunch_break: 2 }
    }
  },
  charging_cable: {
    id: "charging_cable",
    name: "快充充电线",
    type: "lightning_whip",
    icon: "🔌",
    desc: "近战电击横扫，1秒攻击一次，挥舞电弧横扫前方。",
    tag: "近战 / 扇形电弧",
    levels: [
      { level: 1, desc: "每 1.0s 挥舞电鞭横扫前方 120° 扇形 (半径 2.2m)，造成 34 电击伤害", damage: 34, interval: 1.0, range: 2.2 * M_TO_PX, count: 1 },
      { level: 2, desc: "攻击范围 +20%，电击伤害 +20%", rangeMult: 1.20, damageMult: 1.20 },
      { level: 3, desc: "挥舞数量 +1 (同时前后双向横扫)", count: 2 },
      { level: 4, desc: "挥舞间隔 -18% (0.82s一次)，引发连锁闪电", intervalMult: 0.82 },
      { level: 5, desc: "化为 360° 全身圆周电磁横扫，伤害额外 +30%", fullCircle: true, damageMult: 1.30 }
    ],
    evolution: {
      id: "charging_cable_evo",
      name: "超导快充高压鞭",
      icon: "⚡🔌",
      desc: "每 0.7 秒引爆全屏超导雷击，电击全屏敌人并产生护盾！",
      req: { charging_cable: 5, elevator_dash: 3, last_minute_rush: 2 }
    }
  }
};

// 15个平衡后的升级技能
export const SKILLS = {
  coffee: {
    id: "coffee",
    name: "加班咖啡",
    icon: "☕",
    tags: ["输出", "射速"],
    maxLevel: 5,
    rarity: "common",
    descs: [
      "攻击速度 +12%",
      "攻击速度 +24%",
      "攻击速度 +36% (可进化键盘/杯子)",
      "攻击速度 +48%",
      "攻击速度 +60%"
    ],
    values: [0.12, 0.24, 0.36, 0.48, 0.60]
  },
  dual_screen: {
    id: "dual_screen",
    name: "双屏办公",
    icon: "🖥️",
    tags: ["输出", "弹道"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "弹道/投掷数量 +1",
      "弹道数量 +1，总伤害 +15%",
      "弹道数量 +2，总伤害 +20% (可进化键盘)"
    ],
    projectiles: [1, 1, 2],
    dmgBonus: [0, 0.15, 0.20]
  },
  keyboard_warrior: {
    id: "keyboard_warrior",
    name: "键盘侠",
    icon: "⌨️🔥",
    tags: ["输出", "暴击"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "暴击率 +8%",
      "暴击率 +16%",
      "暴击率 +24%",
      "暴击率 +32%，暴击伤害额外 +35%"
    ],
    critRate: [0.08, 0.16, 0.24, 0.32],
    critDmg: [0, 0, 0, 0.35]
  },
  kpi: {
    id: "kpi",
    name: "KPI",
    icon: "📈",
    tags: ["风险", "高伤"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "总伤害 +20%，压力获取 +10%",
      "总伤害 +40%，压力获取 +18% (可进化辞职信)",
      "总伤害 +65%，压力获取 +25%"
    ],
    dmgBonus: [0.20, 0.40, 0.65],
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
      "压力≥60时，总伤害额外 +15%",
      "压力≥60时，总伤害额外 +30%",
      "压力≥60时，总伤害额外 +50%"
    ],
    highPressureDmg: [0.15, 0.30, 0.50]
  },
  quit: {
    id: "quit",
    name: "我不干了",
    icon: "🚪",
    tags: ["压力", "爆表"],
    maxLevel: 3,
    rarity: "epic",
    descs: [
      "崩溃后获得4秒辞职状态：总伤害+60%，压力回40",
      "崩溃后获得5秒辞职状态：总伤害+100%，压力回40",
      "崩溃后获得6秒辞职状态：总伤害+150%，压力回40 (可进化辞职信)"
    ],
    quitDur: [4.0, 5.0, 6.0],
    quitDmg: [0.60, 1.00, 1.50]
  },
  shield: {
    id: "shield",
    name: "工位护盾",
    icon: "🛡️",
    tags: ["生存"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "每 13 秒获得1层护盾抵挡伤害",
      "每 10 秒获得1层护盾抵挡伤害",
      "每 7 秒获得1层护盾 (可进化杯子)"
    ],
    interval: [13.0, 10.0, 7.0]
  },
  paid_slacking: {
    id: "paid_slacking",
    name: "带薪摸鱼",
    icon: "🐟",
    tags: ["回复"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "每 28 秒恢复 8% 最大生命",
      "每 22 秒恢复 8% 最大生命 (可进化水杯)",
      "每 16 秒恢复 10% 最大生命"
    ],
    interval: [28.0, 22.0, 16.0],
    healPct: 0.08
  },
  lunch_break: {
    id: "lunch_break",
    name: "午休",
    icon: "🍱",
    tags: ["回复", "站桩"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "静止 1.8 秒后，每秒恢复 2.0% 最大生命",
      "静止 1.8 秒后，每秒恢复 3.0% 最大生命 (可进化水杯)",
      "静止 1.8 秒后，每秒恢复 4.5% 最大生命"
    ],
    standTime: 1.8,
    healPerSec: [0.02, 0.03, 0.045]
  },
  on_time_off: {
    id: "on_time_off",
    name: "准点下班",
    icon: "👟",
    tags: ["移动"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "移动速度 +8%",
      "移动速度 +16% (可进化耳机)",
      "移动速度 +24%",
      "移动速度 +35%"
    ],
    spdBonus: [0.08, 0.16, 0.24, 0.35]
  },
  elevator_dash: {
    id: "elevator_dash",
    name: "电梯冲刺",
    icon: "🛗",
    tags: ["闪避"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "闪避距离 +15%，闪避CD -0.3s",
      "闪避距离 +30%，闪避CD -0.5s",
      "闪避距离 +45%，闪避CD -0.8s (可进化充电线)"
    ],
    distBonus: [0.15, 0.30, 0.45],
    cdReduction: [0.3, 0.5, 0.8]
  },
  toilet_excuse: {
    id: "toilet_excuse",
    name: "假装去厕所",
    icon: "🚽",
    tags: ["闪避", "减压"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "闪避后 0.6 秒内受击压力减半；完美闪避额外 -4 压力",
      "闪避后 1.0 秒内受击压力减半；完美闪避额外 -6 压力",
      "闪避后 1.4 秒内受击压力减半；完美闪避额外 -9 压力"
    ],
    safeDur: [0.6, 1.0, 1.4],
    extraDodgePressure: 4
  },
  loudspeaker_meeting: {
    id: "loudspeaker_meeting",
    name: "扩音会议",
    icon: "📢",
    tags: ["范围"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "所有武器与AOE范围 +15%",
      "所有武器与AOE范围 +30%",
      "所有武器与AOE范围 +45% (可进化耳机)",
      "所有武器与AOE范围 +65%"
    ],
    areaBonus: [0.15, 0.30, 0.45, 0.65]
  },
  slacker_science: {
    id: "slacker_science",
    name: "摸鱼学",
    icon: "🎓",
    tags: ["经验", "成长"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "经验获取 +20%",
      "经验获取 +40%",
      "经验获取 +65%，拾取范围 +50%"
    ],
    xpBonus: [0.20, 0.40, 0.65],
    dmgPenalty: [0.0, 0.0, 0.0]
  },
  last_minute_rush: {
    id: "last_minute_rush",
    name: "临时抱佛脚",
    icon: "⚡🙏",
    tags: ["低血爆发"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "生命≤40%时，攻速 +20%，暴击率 +8%",
      "生命≤40%时，攻速 +40%，暴击率 +15% (可进化充电线)",
      "生命≤40%时，攻速 +65%，暴击率 +25%"
    ],
    hpThreshold: 0.40,
    atkSpdBonus: [0.20, 0.40, 0.65],
    critBonus: [0.08, 0.15, 0.25]
  }
};

// 8个神器
export const ARTIFACTS = {
  paid_poop: {
    id: "paid_poop",
    name: "带薪拉屎",
    icon: "🧻",
    desc: "每28秒自动进入2.0秒无敌。"
  },
  company_wifi: {
    id: "company_wifi",
    name: "公司Wi-Fi",
    icon: "📶",
    desc: "主动技能CD -30%；每45秒有2秒微断网。"
  },
  boss_pie: {
    id: "boss_pie",
    name: "老板画的饼",
    icon: "🫓",
    desc: "最大生命 +50%，拾取时恢复 20 生命。"
  },
  year_end_bonus: {
    id: "year_end_bonus",
    name: "年终奖",
    icon: "💰",
    desc: "本局工资掉落 +100%。"
  },
  resignation_cert: {
    id: "resignation_cert",
    name: "离职证明",
    icon: "📜",
    desc: "首次死亡复活至 45% 生命，压力升至 80！"
  },
  noise_cancelling_headphones: {
    id: "noise_cancelling_headphones",
    name: "降噪耳机",
    icon: "🎧",
    desc: "完全免疫会议怪减速；弹道预警更明显。"
  },
  work_badge: {
    id: "work_badge",
    name: "工牌",
    icon: "🪪",
    desc: "受到精英怪与Boss伤害 -20%。"
  },
  boss_keyboard: {
    id: "boss_keyboard",
    name: "老板的键盘",
    icon: "👑⌨️",
    desc: "全武器伤害 +40%，主动技能CD +15%。"
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
    color: "#9ca3af"
  },
  file_monster: {
    id: "file_monster",
    name: "文件怪",
    icon: "📁",
    hp: 36,
    damage: 8,
    speed: 1.35 * M_TO_PX,
    threatCost: 1.4,
    xpDrop: 2,
    size: 16,
    color: "#f59e0b",
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
    hp: 60,
    damage: 9,
    speed: 0,
    threatCost: 2.8,
    xpDrop: 4,
    size: 20,
    color: "#64748b",
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
    hp: 40,
    damage: 9,
    speed: 2.1 * M_TO_PX,
    threatCost: 2.1,
    xpDrop: 3,
    size: 15,
    color: "#ec4899",
    attackType: "ring_shock",
    triggerDistance: 2.2 * M_TO_PX,
    chargeTime: 0.6,
    radius: 2.2 * M_TO_PX
  },
  meeting_monster: {
    id: "meeting_monster",
    name: "会议怪",
    icon: "👥",
    hp: 68,
    damage: 5,
    speed: 0.9 * M_TO_PX,
    threatCost: 3.2,
    xpDrop: 4,
    size: 22,
    color: "#a855f7",
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
    attackType: "rush",
    rushDuration: 2.8,
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
    groupCount: 3
  }
};

// 2种通用精英
export const ELITES = {
  hr: {
    id: "hr",
    name: "HR",
    icon: "👩‍💼",
    hp: 500,
    damage: 14,
    dmgReduction: 0.10,
    speed: 1.3 * M_TO_PX,
    size: 26,
    color: "#f43f5e",
    spawnTime: 160,
    xpDrop: 60,
    artifactChance: 0.30,
    healChance: 0.25,
    skillCd: 6.0,
    telegraphTime: 1.2,
    debuffDuration: 5.0,
    debuffDmgReduc: 0.20
  },
  pm: {
    id: "pm",
    name: "项目经理",
    icon: "👨‍💼",
    hp: 680,
    damage: 15,
    dmgReduction: 0.12,
    speed: 1.25 * M_TO_PX,
    size: 28,
    color: "#0284c7",
    spawnTime: 290,
    xpDrop: 85,
    artifactChance: 0.40,
    summonDemandCd: 7.0,
    meetingZoneCd: 12.0,
    meetingZoneRadius: 3.5 * M_TO_PX,
    meetingZoneDuration: 4.0
  }
};

// 局外天赋 (5项)
export const TALENTS = {
  health_check: { id: "health_check", name: "体检报告", icon: "📋", desc: "最大生命 +3% / 级", maxLevel: 5, valPerLvl: 0.03, prices: [90, 160, 280, 440, 650] },
  skilled_worker: { id: "skilled_worker", name: "熟练工", icon: "🔧", desc: "全武器伤害 +4% / 级", maxLevel: 5, valPerLvl: 0.04, prices: [110, 200, 320, 500, 750] },
  fast_runner: { id: "fast_runner", name: "跑得快", icon: "🏃", desc: "移动速度 +2.5% / 级", maxLevel: 5, valPerLvl: 0.025, prices: [80, 140, 240, 380, 550] },
  slacker_xp: { id: "slacker_xp", name: "摸鱼经验", icon: "💡", desc: "经验获取 +4% / 级", maxLevel: 5, valPerLvl: 0.04, prices: [90, 160, 280, 440, 650] },
  mental_construction: { id: "mental_construction", name: "心理建设", icon: "🧘", desc: "崩溃每秒扣血 -0.25% 最大生命 / 级", maxLevel: 5, valPerLvl: 0.0025, prices: [120, 220, 360, 560, 800] }
};

// 一周 6 大完整关卡与 6 大专属 Boss 体系 (周一至周五 + 周末特别篇)
export const STAGES_CONFIG = {
  stage_1: {
    id: "stage_1",
    name: "星期一 · 开放办公室",
    subtitle: "工位、茶水间与打印机的无限加班地狱",
    bgFloor: "#1e293b",
    gridColor: "#334155",
    mapWidth: 48 * M_TO_PX,
    mapHeight: 36 * M_TO_PX,
    duration: 480,
    boss: {
      id: "supervisor",
      name: "部门主管",
      title: "终极加班推手",
      icon: "👹",
      hp: 3600,
      damage: 18,
      dmgReduction: 0.15,
      speed: 1.4 * M_TO_PX,
      size: 36,
      color: "#b91c1c"
    },
    timeline: [
      { start: 0, end: 45, budget: 11, hpMult: 1.00, dmgMult: 1.00, enemies: ["zombie_colleague", "file_monster"], desc: "同事僵尸 + 文件怪；学会移动与基础攻击" },
      { start: 45, end: 90, budget: 14, hpMult: 1.05, dmgMult: 1.00, enemies: ["zombie_colleague", "file_monster", "mail_monster"], desc: "加入邮件怪，考验远程躲避" },
      { start: 90, end: 140, budget: 18, hpMult: 1.15, dmgMult: 1.03, enemies: ["zombie_colleague", "file_monster", "mail_monster", "printer"], desc: "打印机炮台与HR精英" },
      { start: 140, end: 240, budget: 24, hpMult: 1.25, dmgMult: 1.08, enemies: ["zombie_colleague", "mail_monster", "phone_monster", "meeting_monster"], desc: "会议怪 + 电话怪软封锁" },
      { start: 240, end: 340, budget: 30, hpMult: 1.38, dmgMult: 1.12, enemies: ["zombie_colleague", "file_monster", "demand_ball", "red_dot"], desc: "项目经理与需求大潮" },
      { start: 340, end: 420, budget: 38, hpMult: 1.50, dmgMult: 1.18, enemies: ["zombie_colleague", "file_monster", "demand_ball", "red_dot", "meeting_monster"], desc: "临时需求事件", specialEvent: "temp_demand" },
      { start: 420, end: 480, budget: 48, hpMult: 1.70, dmgMult: 1.25, enemies: ["zombie_colleague", "demand_ball", "red_dot", "mail_monster", "phone_monster"], desc: "马上下班高潮冲刺" }
    ]
  },
  stage_2: {
    id: "stage_2",
    name: "星期二 · 会议室迷宫",
    subtitle: "连环对齐会与抓不住重点的PPT风暴",
    bgFloor: "#1a2238",
    gridColor: "#2a3b5c",
    mapWidth: 50 * M_TO_PX,
    mapHeight: 38 * M_TO_PX,
    duration: 480,
    boss: {
      id: "project_director",
      name: "项目总监",
      title: "PPT连环对齐狂人",
      icon: "🧛‍♂️",
      hp: 4000,
      damage: 19,
      dmgReduction: 0.16,
      speed: 1.45 * M_TO_PX,
      size: 36,
      color: "#6366f1"
    },
    timeline: [
      { start: 0, end: 60, budget: 13, hpMult: 1.05, dmgMult: 1.02, enemies: ["meeting_monster", "zombie_colleague"], desc: "会议怪双倍包围" },
      { start: 60, end: 150, budget: 19, hpMult: 1.18, dmgMult: 1.06, enemies: ["meeting_monster", "mail_monster", "phone_monster"], desc: "夺命连环call轰炸" },
      { start: 150, end: 280, budget: 28, hpMult: 1.32, dmgMult: 1.12, enemies: ["meeting_monster", "printer", "file_monster", "demand_ball"], desc: "打印机密布与议程封锁" },
      { start: 280, end: 480, budget: 42, hpMult: 1.60, dmgMult: 1.22, enemies: ["meeting_monster", "demand_ball", "red_dot", "phone_monster"], desc: "全屏会议与需求狂潮" }
    ]
  },
  stage_3: {
    id: "stage_3",
    name: "星期三 · 客户现场现场",
    subtitle: "甲方爸爸的“五彩斑斓的黑”与反复改稿",
    bgFloor: "#241c2c",
    gridColor: "#3d2a4a",
    mapWidth: 50 * M_TO_PX,
    mapHeight: 38 * M_TO_PX,
    duration: 480,
    boss: {
      id: "client_boss",
      name: "甲方爸爸",
      title: "五彩斑斓黑的需求暴君",
      icon: "👑",
      hp: 4500,
      damage: 20,
      dmgReduction: 0.18,
      speed: 1.5 * M_TO_PX,
      size: 38,
      color: "#ec4899"
    },
    timeline: [
      { start: 0, end: 60, budget: 14, hpMult: 1.08, dmgMult: 1.05, enemies: ["demand_ball", "red_dot"], desc: "高速需求球连发" },
      { start: 60, end: 180, budget: 22, hpMult: 1.22, dmgMult: 1.10, enemies: ["demand_ball", "mail_monster", "file_monster"], desc: "邮件与需求混编" },
      { start: 180, end: 320, budget: 32, hpMult: 1.40, dmgMult: 1.16, enemies: ["demand_ball", "meeting_monster", "phone_monster"], desc: "甲方紧急会议连环拉通" },
      { start: 320, end: 480, budget: 46, hpMult: 1.70, dmgMult: 1.26, enemies: ["demand_ball", "red_dot", "meeting_monster", "file_monster"], desc: "极限改稿大狂潮" }
    ]
  },
  stage_4: {
    id: "stage_4",
    name: "星期四 · 云端数据中心",
    subtitle: "404崩溃红屏与全天候内存泄露死锁",
    bgFloor: "#091e28",
    gridColor: "#11384c",
    mapWidth: 52 * M_TO_PX,
    mapHeight: 40 * M_TO_PX,
    duration: 480,
    boss: {
      id: "devops_overlord",
      name: "运维魔王",
      title: "404全屏崩溃之神",
      icon: "👾",
      hp: 5200,
      damage: 22,
      dmgReduction: 0.20,
      speed: 1.55 * M_TO_PX,
      size: 38,
      color: "#06b6d4"
    },
    timeline: [
      { start: 0, end: 80, budget: 16, hpMult: 1.12, dmgMult: 1.08, enemies: ["zombie_colleague", "phone_monster", "red_dot"], desc: "高频报警与红点轰炸" },
      { start: 80, end: 200, budget: 26, hpMult: 1.30, dmgMult: 1.15, enemies: ["printer", "mail_monster", "demand_ball"], desc: "数据洪流与打印机炮火" },
      { start: 200, end: 480, budget: 48, hpMult: 1.78, dmgMult: 1.30, enemies: ["demand_ball", "meeting_monster", "red_dot", "phone_monster"], desc: "内存溢出全屏死锁" }
    ]
  },
  stage_5: {
    id: "stage_5",
    name: "星期五 · 总裁董事办公室",
    subtitle: "终极画饼风暴与周五晚8点紧急复盘",
    bgFloor: "#2a1b18",
    gridColor: "#472b26",
    mapWidth: 54 * M_TO_PX,
    mapHeight: 42 * M_TO_PX,
    duration: 480,
    boss: {
      id: "ceo_bigboss",
      name: "大老板·CEO",
      title: "终极大饼画师",
      icon: "🎩",
      hp: 6000,
      damage: 24,
      dmgReduction: 0.22,
      speed: 1.6 * M_TO_PX,
      size: 40,
      color: "#eab308"
    },
    timeline: [
      { start: 0, end: 90, budget: 18, hpMult: 1.18, dmgMult: 1.10, enemies: ["file_monster", "mail_monster", "zombie_colleague"], desc: "期权公文堆叠" },
      { start: 90, end: 220, budget: 30, hpMult: 1.40, dmgMult: 1.20, enemies: ["printer", "meeting_monster", "demand_ball"], desc: "裁员优化风暴" },
      { start: 220, end: 480, budget: 52, hpMult: 1.88, dmgMult: 1.35, enemies: ["demand_ball", "red_dot", "phone_monster", "meeting_monster"], desc: "上市敲钟极限压榨" }
    ]
  },
  stage_6: {
    id: "stage_6",
    name: "周末特别篇 · 强制公司团建",
    subtitle: "极限拓展训练、破冰游戏与感恩洗脑导师",
    bgFloor: "#1c2a1a",
    gridColor: "#2b4028",
    mapWidth: 56 * M_TO_PX,
    mapHeight: 44 * M_TO_PX,
    duration: 480,
    boss: {
      id: "teambuilding_coach",
      name: "团建魔鬼教练",
      title: "极限拓展与感恩导师",
      icon: "📣",
      hp: 7200,
      damage: 26,
      dmgReduction: 0.25,
      speed: 1.65 * M_TO_PX,
      size: 42,
      color: "#16a34a"
    },
    timeline: [
      { start: 0, end: 90, budget: 20, hpMult: 1.22, dmgMult: 1.12, enemies: ["zombie_colleague", "phone_monster", "red_dot"], desc: "破冰游戏全员冲刺" },
      { start: 90, end: 240, budget: 34, hpMult: 1.50, dmgMult: 1.25, enemies: ["meeting_monster", "demand_ball", "printer"], desc: "拓展器械与高空摔跤" },
      { start: 240, end: 480, budget: 58, hpMult: 2.00, dmgMult: 1.45, enemies: ["demand_ball", "red_dot", "meeting_monster", "phone_monster"], desc: "真情流露绝地求生" }
    ]
  }
};

// 兼容旧接口 BOSS_CONFIG
export const BOSS_CONFIG = STAGES_CONFIG.stage_1.boss;
