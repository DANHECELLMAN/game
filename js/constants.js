/**
 * 《今天也不想上班》- 核心常量与配置表 (V1.3 升级版)
 * 包含：4大角色属性、6大武器与超级进化、15项强化技能、多关卡配置表
 */

export const M_TO_PX = 32;

// 经验需求表 (大幅平滑前期升级，让玩家前2分钟快速成型)
export const XP_TABLE = [
  0,   // Lv1
  10,  // 1->2 (原16，大幅提速)
  16,  // 2->3
  24,  // 3->4
  34,  // 4->5
  46,  // 5->6
  60,  // 6->7
  76,  // 7->8
  94,  // 8->9
  114, // 9->10
  136, // 10->11
  160, // 11->12
  186, // 12->13
  214, // 13->14
  244, // 14->15
  276, // 15->16
  310, // 16->17
  346, // 17->18
  384, // 18->19
  424  // 19->20
];

export function getXpRequiredForLevel(level) {
  if (level < XP_TABLE.length) {
    return XP_TABLE[level];
  }
  return 424 + (level - 20) * 40;
}

// 4大可选角色定义
export const CHARACTERS = {
  xiaochen: {
    id: "xiaochen",
    name: "小陈",
    title: "全能运营",
    avatar: "👨‍💼",
    desc: "职场平衡型战士，综合能力均衡，升级后摸鱼跑得快。",
    initialWeapon: "keyboard",
    baseStats: {
      maxHp: 120,
      moveSpeed: 4.3 * M_TO_PX,
      damageMult: 1.15,
      critRate: 0.06,
      critDmg: 1.6,
      xpMult: 1.0,
      pickupRadius: 2.4 * M_TO_PX
    },
    passive: {
      name: "熟练摸鱼",
      desc: "每次升级后3秒内移动速度 +25%，拾取范围 +50%。"
    },
    active: {
      name: "疯狂输出",
      icon: "🔥",
      desc: "4秒内攻击速度 +80%，武器总伤害 +30%！",
      cd: 16.0,
      duration: 4.0
    }
  },
  awei: {
    id: "awei",
    name: "阿伟",
    title: "资深开发",
    avatar: "👨‍💻",
    desc: "代码战神，擅长范围电击与群体控制，击杀引发内存爆炸。",
    initialWeapon: "charging_cable",
    baseStats: {
      maxHp: 110,
      moveSpeed: 4.1 * M_TO_PX,
      damageMult: 1.25,
      critRate: 0.08,
      critDmg: 1.7,
      xpMult: 1.05,
      pickupRadius: 2.2 * M_TO_PX
    },
    passive: {
      name: "线上热更",
      desc: "击杀敌人有 18% 概率引发代码内存泄漏爆炸（大范围AOE伤害）。"
    },
    active: {
      name: "系统崩溃",
      icon: "⚡",
      desc: "全屏冻结所有杂兵 3.5 秒，并降下雷电造成 160 点高额电击！",
      cd: 18.0,
      duration: 3.5
    }
  },
  lili: {
    id: "lili",
    name: "莉莉",
    title: "视觉设计",
    avatar: "👩‍🎨",
    desc: "像素主宰，天生拥有极高暴击率与暴击伤害，泼洒水彩风暴。",
    initialWeapon: "water_cup",
    baseStats: {
      maxHp: 95,
      moveSpeed: 4.5 * M_TO_PX,
      damageMult: 1.20,
      critRate: 0.20,
      critDmg: 2.1,
      xpMult: 1.0,
      pickupRadius: 2.2 * M_TO_PX
    },
    passive: {
      name: "像素精度",
      desc: "暴击率额外 +15%，暴击伤害额外 +40%，攻击范围 +20%。"
    },
    active: {
      name: "改稿风暴",
      icon: "🎨",
      desc: "召唤高速旋转的调色盘风暴环绕自身 5 秒，粉碎碰到的所有敌人！",
      cd: 17.0,
      duration: 5.0
    }
  },
  xiaozhang: {
    id: "xiaozhang",
    name: "小张",
    title: "无畏实习",
    avatar: "🧑‍🎓",
    desc: "奇迹成长流，吃经验飞快，三选一极易刷出高稀有度神级词条。",
    initialWeapon: "resignation",
    baseStats: {
      maxHp: 105,
      moveSpeed: 4.4 * M_TO_PX,
      damageMult: 1.10,
      critRate: 0.08,
      critDmg: 1.6,
      xpMult: 1.40,
      pickupRadius: 2.6 * M_TO_PX
    },
    passive: {
      name: "潜力爆发",
      desc: "经验获取 +40%，升级三选一出现稀有/史诗概率翻倍！"
    },
    active: {
      name: "假装很忙",
      icon: "🏃",
      desc: "进入无敌隐身状态 3.5 秒，移速 +50% 并在身后洒下大片毁灭咖啡豆！",
      cd: 20.0,
      duration: 3.5
    }
  }
};

export const PLAYER_BASE = {
  dodgeDistance: 2.8 * M_TO_PX,
  dodgeDuration: 0.24,
  dodgeCooldown: 3.0,
  dodgeInvulnTime: 0.16,
  perfectDodgeWindow: 0.20,
  hurtInvulnTime: 0.50,
  contactDmgCd: 0.60
};

// 压力系统分段 (大幅强化高压带来的伤害爽感)
export const PRESSURE_STAGES = {
  NORMAL: { min: 0, max: 29, name: "正常", color: "#6b7280", atkSpd: 0, dmg: 0, crit: 0 },
  ANNOYED: { min: 30, max: 59, name: "烦躁", color: "#eab308", atkSpd: 0.12, dmg: 0.08, crit: 0 },
  IRRITABLE: { min: 60, max: 79, name: "暴躁", color: "#f97316", atkSpd: 0.20, dmg: 0.25, crit: 0.05 },
  RESIGN_MOOD: { min: 80, max: 99, name: "我要辞职", color: "#ef4444", atkSpd: 0.32, dmg: 0.50, crit: 0.20 },
  COLLAPSE: { min: 100, max: 100, name: "崩溃", color: "#dc2626", duration: 4.0, hpDrainPerSec: 0.035, resetPressure: 55 }
};

// 6大武器配置 (含升级数值与超级进化)
export const WEAPONS = {
  keyboard: {
    id: "keyboard",
    name: "机械键盘",
    type: "projectile",
    icon: "⌨️",
    desc: "高射速远程键帽，成长后具备多弹道与连锁穿透。",
    tag: "射速 / 连锁穿透",
    levels: [
      { level: 1, desc: "基础伤害 16，攻击间隔 0.48s，发射单发键帽", damage: 16, interval: 0.48, range: 8.5 * M_TO_PX, count: 1, pierce: 0 },
      { level: 2, desc: "伤害 +25%，弹道速度 +20%", damageMult: 1.25 },
      { level: 3, desc: "攻击间隔 -18%", intervalMult: 0.82 },
      { level: 4, desc: "发射键帽数 +1 (双发散射)", extraCount: 1 },
      { level: 5, desc: "伤害 +30%，键帽穿透 +1 个目标", damageMult: 1.30, pierce: 1 }
    ],
    evolution: {
      id: "keyboard_evo",
      name: "祖安机械键盘",
      icon: "⚡⌨️",
      desc: "极速双发狂暴键帽！命中有 35% 概率触发“？？？”大范围连锁爆炸（造成100%武器伤害）！",
      req: { keyboard: 5, coffee: 3, dual_screen: 3 }
    }
  },
  mug: {
    id: "mug",
    name: "马克杯",
    type: "orbit",
    icon: "☕",
    desc: "白瓷杯环绕自身，对靠近的敌人造成高频近身绞杀。",
    tag: "防守 / 环绕贴脸",
    levels: [
      { level: 1, desc: "1个杯子环绕，每次造成 22 伤害", damage: 22, count: 1, speed: 2.5, radius: 2.3 * M_TO_PX, hitCd: 0.4 },
      { level: 2, desc: "旋转速度 +30%，伤害 +15%", speedMult: 1.30, damageMult: 1.15 },
      { level: 3, desc: "杯子数量 +1 (共2个)", count: 2 },
      { level: 4, desc: "伤害 +30%，旋转半径 +15%", damageMult: 1.30, radiusMult: 1.15 },
      { level: 5, desc: "杯子数量 +1 (共3个)，附带强力击退", count: 3, knockback: true }
    ],
    evolution: {
      id: "mug_evo",
      name: "无限续杯",
      icon: "🌊☕",
      desc: "4个马克杯高速环绕！每 6 秒释放一次 4 米巨型咖啡冲击波，重创并击飞周围全部杂兵！",
      req: { mug: 5, shield: 3, coffee: 2 }
    }
  },
  resignation: {
    id: "resignation",
    name: "辞职信",
    type: "mortar",
    icon: "📄",
    desc: "抛射公文袋砸向密集敌群，造成大范围重炮轰炸。",
    tag: "范围 / 巨力爆炸",
    levels: [
      { level: 1, desc: "每 1.8s 投掷辞职信，爆炸半径 2.2m，伤害 55", damage: 55, interval: 1.8, radius: 2.2 * M_TO_PX },
      { level: 2, desc: "爆炸半径 +25%，伤害 +20%", radiusMult: 1.25, damageMult: 1.20 },
      { level: 3, desc: "伤害 +35%", damageMult: 1.35 },
      { level: 4, desc: "爆炸后留下持续 3 秒的“离职情绪”腐蚀水洼", poolDuration: 3.0, poolDmgMult: 0.3 },
      { level: 5, desc: "投掷间隔 -25%，爆炸伤害 +30%", intervalMult: 0.75, damageMult: 1.30 }
    ],
    evolution: {
      id: "resignation_evo",
      name: "辞职报告",
      icon: "📑💥",
      desc: "每 2.0 秒召唤巨型辞职报告砸向全屏最密集处（半径 4.0m，220% 毁灭伤害；压力≥80时范围额外 +35%）！",
      req: { resignation: 5, quit: 3, kpi: 2 }
    }
  },
  headphones: {
    id: "headphones",
    name: "降噪耳机",
    type: "sonic",
    icon: "🎧",
    desc: "发射穿透性 360° 声波震荡，大范围击退并粉碎蜂拥敌群。",
    tag: "大范围 / 声波穿透",
    levels: [
      { level: 1, desc: "每 1.8s 释放 3.5m 环形声波，造成 32 伤害并穿透全怪", damage: 32, interval: 1.8, radius: 3.5 * M_TO_PX },
      { level: 2, desc: "声波半径 +25%，伤害 +20%", radiusMult: 1.25, damageMult: 1.20 },
      { level: 3, desc: "释放间隔 -20%，击退距离翻倍", intervalMult: 0.80 },
      { level: 4, desc: "每次攻击连续释放 2 道回响声波 (双重打击)", echoWaves: 2 },
      { level: 5, desc: "声波伤害 +35%，释放 3 重同心声浪", damageMult: 1.35, echoWaves: 3 }
    ],
    evolution: {
      id: "headphones_evo",
      name: "降噪核爆耳机",
      icon: "☢️🎧",
      desc: "每 1.2 秒释放半径 5.5 米的高频核爆声浪（造成 180% 伤害），同时震碎范围内所有敌方子弹！",
      req: { headphones: 5, loudspeaker_meeting: 3, on_time_off: 2 }
    }
  },
  water_cup: {
    id: "water_cup",
    name: "养生水杯",
    type: "puddle_throw",
    icon: "🫗",
    desc: "投掷水杯碎裂在地，留下持续 5 秒的烫水/咖啡区域造成持续灼烧。",
    tag: "持续地面 / 区域封锁",
    levels: [
      { level: 1, desc: "每 2.0s 投掷1个水杯，落地生成 2.4m 水洼持续 5 秒（每0.5s造成18伤害）", damage: 18, interval: 2.0, radius: 2.4 * M_TO_PX, count: 1, duration: 5.0 },
      { level: 2, desc: "水洼半径 +25%，投掷间隔 -15%", radiusMult: 1.25, intervalMult: 0.85 },
      { level: 3, desc: "投掷数量 +1 (同时扔出2个水杯)", count: 2 },
      { level: 4, desc: "地面伤害 +35%，持续时间延长至 6.5 秒", damageMult: 1.35, duration: 6.5 },
      { level: 5, desc: "投掷数量 +1 (共3个水杯)，进入水洼的敌人减速 40%", count: 3, slowPct: 0.40 }
    ],
    evolution: {
      id: "water_cup_evo",
      name: "高压八杯水领域",
      icon: "🌊🫗",
      desc: "同时投掷 4 个巨型加湿水桶，化为全场联动的暴风雨领域，对敌造成巨额持续伤害并为自己每秒回血 1.5%！",
      req: { water_cup: 5, paid_slacking: 3, lunch_break: 2 }
    }
  },
  charging_cable: {
    id: "charging_cable",
    name: "快充充电线",
    type: "lightning_whip",
    icon: "🔌",
    desc: "近战电击横扫，1秒攻击一次，挥舞高压电弧横扫前方敌群。",
    tag: "近战扇形 / 高压电弧",
    levels: [
      { level: 1, desc: "每 1.0s 挥舞电鞭横扫前方 120° 扇形 (半径 2.8m)，造成 40 电击伤害", damage: 40, interval: 1.0, range: 2.8 * M_TO_PX, count: 1 },
      { level: 2, desc: "攻击范围 +25%，电击伤害 +25%", rangeMult: 1.25, damageMult: 1.25 },
      { level: 3, desc: "挥舞数量 +1 (同时前后双向横扫)", count: 2 },
      { level: 4, desc: "挥舞间隔 -20% (0.8s一次)，命中引发 3 道连锁闪电", intervalMult: 0.80, chainLightning: 3 },
      { level: 5, desc: "化为 360° 全身圆周电磁横扫，伤害额外 +40%", fullCircle: true, damageMult: 1.40 }
    ],
    evolution: {
      id: "charging_cable_evo",
      name: "超导快充高压鞭",
      icon: "⚡🔌",
      desc: "每 0.6 秒引爆全屏超导雷击，电击全场敌人并生成静电护盾抵挡弹幕！",
      req: { charging_cable: 5, elevator_dash: 3, last_minute_rush: 2 }
    }
  }
};

// 15个大幅强化效果的升级技能
export const SKILLS = {
  coffee: {
    id: "coffee",
    name: "加班咖啡",
    icon: "☕",
    tags: ["输出", "射速"],
    maxLevel: 5,
    rarity: "common",
    descs: [
      "攻击速度 +15%",
      "攻击速度 +30%",
      "攻击速度 +45% (可进化键盘/杯子)",
      "攻击速度 +60%",
      "攻击速度 +80% (全武器狂暴)"
    ],
    values: [0.15, 0.30, 0.45, 0.60, 0.80]
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
      "弹道数量 +1，武器总伤害 +20%",
      "弹道数量 +2，总伤害 +30% (可进化键盘)"
    ],
    projectiles: [1, 1, 2],
    dmgBonus: [0, 0.20, 0.30]
  },
  keyboard_warrior: {
    id: "keyboard_warrior",
    name: "键盘侠",
    icon: "⌨️🔥",
    tags: ["输出", "暴击"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "暴击率 +10%",
      "暴击率 +20%",
      "暴击率 +30%",
      "暴击率 +40%，暴击伤害额外 +50%"
    ],
    critRate: [0.10, 0.20, 0.30, 0.40],
    critDmg: [0, 0, 0, 0.50]
  },
  kpi: {
    id: "kpi",
    name: "KPI",
    icon: "📈",
    tags: ["风险", "高伤"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "总伤害 +25%，压力获取 +10%",
      "总伤害 +50%，压力获取 +18% (可进化辞职信)",
      "总伤害 +80%，压力获取 +25%"
    ],
    dmgBonus: [0.25, 0.50, 0.80],
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
      "压力≥60时，总伤害额外 +20%",
      "压力≥60时，总伤害额外 +40%",
      "压力≥60时，总伤害额外 +65%"
    ],
    highPressureDmg: [0.20, 0.40, 0.65]
  },
  quit: {
    id: "quit",
    name: "我不干了",
    icon: "🚪",
    tags: ["压力", "爆表"],
    maxLevel: 3,
    rarity: "epic",
    descs: [
      "崩溃后获得4秒辞职状态：总伤害+80%，崩溃后压力回40",
      "崩溃后获得5秒辞职状态：总伤害+140%，崩溃后压力回40",
      "崩溃后获得6秒辞职状态：总伤害+200%，崩溃后压力回40 (可进化辞职信)"
    ],
    quitDur: [4.0, 5.0, 6.0],
    quitDmg: [0.80, 1.40, 2.00]
  },
  shield: {
    id: "shield",
    name: "工位护盾",
    icon: "🛡️",
    tags: ["生存"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "每 12 秒获得1层护盾抵挡伤害",
      "每 9 秒获得1层护盾抵挡伤害",
      "每 6 秒获得1层护盾 (可进化杯子)"
    ],
    interval: [12.0, 9.0, 6.0]
  },
  paid_slacking: {
    id: "paid_slacking",
    name: "带薪摸鱼",
    icon: "🐟",
    tags: ["回复"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "每 25 秒恢复 10% 最大生命",
      "每 18 秒恢复 10% 最大生命 (可进化水杯)",
      "每 12 秒恢复 12% 最大生命"
    ],
    interval: [25.0, 18.0, 12.0],
    healPct: 0.10
  },
  lunch_break: {
    id: "lunch_break",
    name: "午休",
    icon: "🍱",
    tags: ["回复", "站桩"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "静止 1.5 秒后，每秒恢复 2.5% 最大生命",
      "静止 1.5 秒后，每秒恢复 4.0% 最大生命 (可进化水杯)",
      "静止 1.5 秒后，每秒恢复 6.0% 最大生命"
    ],
    standTime: 1.5,
    healPerSec: [0.025, 0.04, 0.06]
  },
  on_time_off: {
    id: "on_time_off",
    name: "准点下班",
    icon: "👟",
    tags: ["移动"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "移动速度 +10%",
      "移动速度 +20% (可进化耳机)",
      "移动速度 +30%",
      "移动速度 +45%"
    ],
    spdBonus: [0.10, 0.20, 0.30, 0.45]
  },
  elevator_dash: {
    id: "elevator_dash",
    name: "电梯冲刺",
    icon: "🛗",
    tags: ["闪避"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "闪避距离 +20%，闪避CD -0.3s",
      "闪避距离 +40%，闪避CD -0.6s",
      "闪避距离 +60%，闪避CD -1.0s (可进化充电线)"
    ],
    distBonus: [0.20, 0.40, 0.60],
    cdReduction: [0.3, 0.6, 1.0]
  },
  toilet_excuse: {
    id: "toilet_excuse",
    name: "假装去厕所",
    icon: "🚽",
    tags: ["闪避", "减压"],
    maxLevel: 3,
    rarity: "rare",
    descs: [
      "闪避后 0.8 秒内受击压力减半；完美闪避额外 -5 压力",
      "闪避后 1.2 秒内受击压力减半；完美闪避额外 -8 压力",
      "闪避后 1.6 秒内受击压力减半；完美闪避额外 -12 压力"
    ],
    safeDur: [0.8, 1.2, 1.6],
    extraDodgePressure: 5
  },
  loudspeaker_meeting: {
    id: "loudspeaker_meeting",
    name: "扩音会议",
    icon: "📢",
    tags: ["范围"],
    maxLevel: 4,
    rarity: "common",
    descs: [
      "所有武器与AOE范围 +20%",
      "所有武器与AOE范围 +40%",
      "所有武器与AOE范围 +60% (可进化耳机)",
      "所有武器与AOE范围 +85% (全屏覆盖)"
    ],
    areaBonus: [0.20, 0.40, 0.60, 0.85]
  },
  slacker_science: {
    id: "slacker_science",
    name: "摸鱼学",
    icon: "🎓",
    tags: ["经验", "成长"],
    maxLevel: 3,
    rarity: "common",
    descs: [
      "经验获取 +25%，无伤害惩罚",
      "经验获取 +50%，无伤害惩罚",
      "经验获取 +80%，拾取范围翻倍"
    ],
    xpBonus: [0.25, 0.50, 0.80],
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
      "生命≤45%时，攻速 +25%，暴击率 +10%",
      "生命≤45%时，攻速 +50%，暴击率 +20% (可进化充电线)",
      "生命≤45%时，攻速 +80%，暴击率 +35%"
    ],
    hpThreshold: 0.45,
    atkSpdBonus: [0.25, 0.50, 0.80],
    critBonus: [0.10, 0.20, 0.35]
  }
};

// 8个神器
export const ARTIFACTS = {
  paid_poop: {
    id: "paid_poop",
    name: "带薪拉屎",
    icon: "🧻",
    desc: "每25秒自动进入2.5秒无敌（保命神技）。"
  },
  company_wifi: {
    id: "company_wifi",
    name: "公司Wi-Fi",
    icon: "📶",
    desc: "主动技能CD -35%；每50秒有2秒微断网。"
  },
  boss_pie: {
    id: "boss_pie",
    name: "老板画的饼",
    icon: "🫓",
    desc: "最大生命 +60%，拾取时恢复 25 生命。"
  },
  year_end_bonus: {
    id: "year_end_bonus",
    name: "年终奖",
    icon: "💰",
    desc: "本局工资掉落 +100%（局外成长翻倍）。"
  },
  resignation_cert: {
    id: "resignation_cert",
    name: "离职证明",
    icon: "📜",
    desc: "首次死亡时复活至 50% 生命，压力升至 80 触发狂暴！"
  },
  noise_cancelling_headphones: {
    id: "noise_cancelling_headphones",
    name: "降噪耳机",
    icon: "🎧",
    desc: "完全免疫会议怪减速；弹道预警时间延长50%。"
  },
  work_badge: {
    id: "work_badge",
    name: "工牌",
    icon: "🪪",
    desc: "受到精英怪与Boss伤害 -25%。"
  },
  boss_keyboard: {
    id: "boss_keyboard",
    name: "老板的键盘",
    icon: "👑⌨️",
    desc: "全武器伤害 +50%，主动技能CD +15%。"
  }
};

// 8种普通敌人配置
export const NORMAL_ENEMIES = {
  zombie_colleague: {
    id: "zombie_colleague",
    name: "同事僵尸",
    icon: "🧟",
    hp: 24,
    damage: 5,
    speed: 1.6 * M_TO_PX,
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
    hp: 32,
    damage: 7,
    speed: 1.3 * M_TO_PX,
    threatCost: 1.4,
    xpDrop: 2,
    size: 16,
    color: "#f59e0b",
    firstAppearTime: 0,
    splitOnDeath: {
      count: 2,
      id: "paper_scrap",
      name: "散落纸片",
      hp: 7,
      damage: 3,
      speed: 1.5 * M_TO_PX,
      size: 9,
      color: "#fef3c7"
    }
  },
  mail_monster: {
    id: "mail_monster",
    name: "邮件怪",
    icon: "✉️",
    hp: 22,
    damage: 6,
    speed: 1.1 * M_TO_PX,
    threatCost: 1.8,
    xpDrop: 2,
    size: 13,
    color: "#38bdf8",
    firstAppearTime: 40,
    attackType: "ranged",
    keepDistance: 5.5 * M_TO_PX,
    attackInterval: 2.4,
    bulletSpeed: 4.2 * M_TO_PX,
    bulletDamage: 6,
    telegraphTime: 0.35
  },
  printer: {
    id: "printer",
    name: "打印机",
    icon: "🖨️",
    hp: 55,
    damage: 8,
    speed: 0,
    threatCost: 2.8,
    xpDrop: 4,
    size: 20,
    color: "#64748b",
    firstAppearTime: 110,
    attackType: "turret",
    attackInterval: 3.2,
    bulletSpeed: 3.6 * M_TO_PX,
    bulletCount: 3,
    spreadAngle: 0.5,
    telegraphTime: 0.4
  },
  phone_monster: {
    id: "phone_monster",
    name: "电话怪",
    icon: "☎️",
    hp: 36,
    damage: 8,
    speed: 2.0 * M_TO_PX,
    threatCost: 2.0,
    xpDrop: 3,
    size: 15,
    color: "#ec4899",
    firstAppearTime: 170,
    attackType: "ring_shock",
    triggerDistance: 2.2 * M_TO_PX,
    chargeTime: 0.6,
    radius: 2.2 * M_TO_PX
  },
  meeting_monster: {
    id: "meeting_monster",
    name: "会议怪",
    icon: "👥",
    hp: 60,
    damage: 5,
    speed: 0.9 * M_TO_PX,
    threatCost: 3.0,
    xpDrop: 4,
    size: 22,
    color: "#a855f7",
    firstAppearTime: 180,
    auraRadius: 2.8 * M_TO_PX,
    slowPct: 0.30
  },
  demand_ball: {
    id: "demand_ball",
    name: "需求球",
    icon: "🔴",
    hp: 18,
    damage: 5,
    speed: 2.4 * M_TO_PX,
    threatCost: 1.8,
    xpDrop: 2,
    size: 12,
    color: "#ef4444",
    firstAppearTime: 280,
    attackType: "rush",
    rushDuration: 2.8,
    pauseDuration: 1.2,
    rushSpeed: 3.6 * M_TO_PX
  },
  red_dot: {
    id: "red_dot",
    name: "红点消息",
    icon: "💬",
    hp: 12,
    damage: 4,
    speed: 2.8 * M_TO_PX,
    threatCost: 0.6,
    xpDrop: 1,
    size: 10,
    color: "#dc2626",
    firstAppearTime: 340,
    groupCount: 3
  }
};

// 2种精英怪
export const ELITES = {
  hr: {
    id: "hr",
    name: "HR",
    icon: "👩‍💼",
    hp: 460,
    damage: 12,
    dmgReduction: 0.10,
    speed: 1.3 * M_TO_PX,
    size: 26,
    color: "#f43f5e",
    spawnTime: 150,
    xpDrop: 60,
    artifactChance: 0.35,
    healChance: 0.30,
    skillCd: 6.0,
    telegraphTime: 1.2,
    debuffDuration: 5.0,
    debuffDmgReduc: 0.20
  },
  pm: {
    id: "pm",
    name: "项目经理",
    icon: "👨‍💼",
    hp: 620,
    damage: 14,
    dmgReduction: 0.12,
    speed: 1.25 * M_TO_PX,
    size: 28,
    color: "#0284c7",
    spawnTime: 280,
    xpDrop: 85,
    artifactChance: 0.45,
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
  hp: 3000,
  damage: 16,
  dmgReduction: 0.12,
  speed: 1.4 * M_TO_PX,
  size: 36,
  color: "#b91c1c",
  spawnTime: 480,
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
      damage: 14
    },
    meeting: {
      name: "来开个会",
      telegraph: 1.0,
      count: 3,
      radius: 2.8 * M_TO_PX,
      duration: 5.0,
      slowPct: 0.35
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
      bulletSpeed: 4.8 * M_TO_PX,
      damage: 10
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
    desc: "最大生命 +4% / 级",
    maxLevel: 5,
    valPerLvl: 0.04,
    prices: [80, 150, 260, 420, 600]
  },
  skilled_worker: {
    id: "skilled_worker",
    name: "熟练工",
    icon: "🔧",
    desc: "全武器伤害 +5% / 级",
    maxLevel: 5,
    valPerLvl: 0.05,
    prices: [100, 180, 300, 480, 700]
  },
  fast_runner: {
    id: "fast_runner",
    name: "跑得快",
    icon: "🏃",
    desc: "移动速度 +3% / 级",
    maxLevel: 5,
    valPerLvl: 0.03,
    prices: [70, 130, 220, 350, 500]
  },
  slacker_xp: {
    id: "slacker_xp",
    name: "摸鱼经验",
    icon: "💡",
    desc: "经验获取 +5% / 级",
    maxLevel: 5,
    valPerLvl: 0.05,
    prices: [80, 150, 260, 420, 600]
  },
  mental_construction: {
    id: "mental_construction",
    name: "心理建设",
    icon: "🧘",
    desc: "崩溃每秒扣血 -0.3% 最大生命 / 级",
    maxLevel: 5,
    valPerLvl: 0.003,
    prices: [110, 200, 340, 520, 750]
  }
};

// 多关卡模块化配置 (可无限扩展星期二、星期三等后续章节)
export const STAGES_CONFIG = {
  stage_1: {
    id: "stage_1",
    name: "星期一 · 开放办公室",
    subtitle: "工位、茶水间与打印机的无限加班地狱",
    theme: "office",
    bgFloor: "#1e293b",
    gridColor: "#334155",
    mapWidth: 48 * M_TO_PX,
    mapHeight: 36 * M_TO_PX,
    duration: 480, // 8分钟
    bossId: "supervisor",
    timeline: [
      { start: 0, end: 40, budget: 12, hpMult: 0.90, dmgMult: 0.90, enemies: ["zombie_colleague", "file_monster"], desc: "同事僵尸 + 文件怪；快速建立基础" },
      { start: 40, end: 80, budget: 15, hpMult: 0.95, dmgMult: 0.95, enemies: ["zombie_colleague", "file_monster", "mail_monster"], desc: "加入邮件怪，考验远程走位" },
      { start: 80, end: 110, budget: 18, hpMult: 1.00, dmgMult: 1.00, enemies: ["zombie_colleague", "file_monster", "mail_monster"], desc: "小爆发波，给升级空间" },
      { start: 110, end: 160, budget: 20, hpMult: 1.05, dmgMult: 1.00, enemies: ["zombie_colleague", "file_monster", "mail_monster", "printer"], desc: "加入打印机炮台；2:30首只精英HR登场" },
      { start: 160, end: 240, budget: 25, hpMult: 1.12, dmgMult: 1.05, enemies: ["zombie_colleague", "mail_monster", "phone_monster", "meeting_monster"], desc: "会议怪 + 电话怪，地图软封锁" },
      { start: 240, end: 300, budget: 28, hpMult: 1.18, dmgMult: 1.08, enemies: ["zombie_colleague", "file_monster", "phone_monster", "meeting_monster"], desc: "4:40项目经理精英登场" },
      { start: 300, end: 380, budget: 32, hpMult: 1.25, dmgMult: 1.10, enemies: ["zombie_colleague", "demand_ball", "red_dot", "mail_monster"], desc: "需求球 + 远近混编，进入爽感高峰" },
      { start: 380, end: 430, budget: 40, hpMult: 1.35, dmgMult: 1.15, enemies: ["zombie_colleague", "file_monster", "demand_ball", "red_dot", "meeting_monster"], desc: "“临时需求”事件！刷新率+35%，压力快速上涨", specialEvent: "temp_demand" },
      { start: 430, end: 480, budget: 48, hpMult: 1.45, dmgMult: 1.20, enemies: ["zombie_colleague", "demand_ball", "red_dot", "mail_monster", "phone_monster"], desc: "“马上下班”冲刺高潮，营造Boss前压迫感" }
    ]
  },
  stage_2: {
    id: "stage_2",
    name: "星期二 · 会议室迷宫",
    subtitle: "连环对齐会与抓不住重点的PPT风暴",
    theme: "meeting_maze",
    bgFloor: "#1a2238",
    gridColor: "#2a3b5c",
    mapWidth: 52 * M_TO_PX,
    mapHeight: 40 * M_TO_PX,
    duration: 480,
    bossId: "supervisor",
    timeline: [
      { start: 0, end: 50, budget: 14, hpMult: 1.00, dmgMult: 1.00, enemies: ["meeting_monster", "zombie_colleague"], desc: "双倍会议区覆盖" },
      { start: 50, end: 120, budget: 18, hpMult: 1.10, dmgMult: 1.05, enemies: ["meeting_monster", "mail_monster", "phone_monster"], desc: "夺命连环call轰炸" },
      { start: 120, end: 240, budget: 26, hpMult: 1.20, dmgMult: 1.10, enemies: ["meeting_monster", "printer", "file_monster"], desc: "打印机密布" },
      { start: 240, end: 480, budget: 38, hpMult: 1.35, dmgMult: 1.15, enemies: ["meeting_monster", "demand_ball", "red_dot"], desc: "全屏会议与需求狂潮" }
    ]
  },
  stage_3: {
    id: "stage_3",
    name: "星期三 · 客户现场现场",
    subtitle: "甲方爸爸的临时改需求风暴",
    theme: "client_site",
    bgFloor: "#241c2c",
    gridColor: "#3d2a4a",
    mapWidth: 50 * M_TO_PX,
    mapHeight: 38 * M_TO_PX,
    duration: 480,
    bossId: "supervisor",
    timeline: [
      { start: 0, end: 60, budget: 16, hpMult: 1.05, dmgMult: 1.05, enemies: ["demand_ball", "red_dot"], desc: "高速需求球连发" },
      { start: 60, end: 180, budget: 24, hpMult: 1.15, dmgMult: 1.10, enemies: ["demand_ball", "mail_monster", "file_monster"], desc: "邮件与需求混编" },
      { start: 180, end: 480, budget: 42, hpMult: 1.35, dmgMult: 1.20, enemies: ["demand_ball", "red_dot", "meeting_monster", "phone_monster"], desc: "极限压力与改稿大潮" }
    ]
  }
};
