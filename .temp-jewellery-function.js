/**
 * 감정된 장신구 규칙 생성
 */
function generateIdentifiedJewelleryRules(lines, settings, soundContext, lang = "ko") {
  const { isSndEnabled } = soundContext;
  if (settings.enabled === false) {
    return;
  }

  // 벨트 모드 리스트
  const beltPrefixes = ["Abating", "Athlete's", "Chalybeous", "Fecund", "Gentian", "Inspiring", "Regenerating", "Unmoving"];
  const beltSuffixes = ["of Bameth", "of Ephij", "of Haast", "of Magma", "of Tzteosh", "of the Gods", "of the Ice", "of the Lightning", "of the Titan"];
  const beltCombined = [...beltPrefixes, ...beltSuffixes, "Enveloped", "Exciting", "Galvanizing", "Opalescent", "Refreshing", "Rejuvenating", "Virile", "of Exile", "of Expulsion", "of the Leviathan", "of the Maelstrom", "of the Polar Bear", "of the Volcano"];
  const beltBadMods = ["Affecting", "Azure", "Barbed", "Beryl", "Cobalt", "Edged", "Hale", "Healthy", "Jagged", "Lacquered", "Pointed", "Restoring", "Ribbed", "Sanguine", "Spiked", "Spiny", "Studded", "Thorny", "of Convalescence", "of the Bear", "of the Brute", "of the Cloud", "of the Drake", "of the Flatworm", "of the Hydra", "of the Lizard", "of the Lost", "of the Narwhal", "of the Newt", "of the Penguin", "of the Salamander", "of the Seal", "of the Squall", "of the Starfish", "of the Storm", "of the Troll", "of the Whelpling", "of the Wrestler"];

  // 반지 (공격) 모드 리스트
  const ringAttackPrefixes = ["Adroit", "Blasting", "Cremating", "Crystalline", "Discharging", "Dragon's", "Electrocuting", "Elusory", "Entombing", "Flaring", "Magmatic", "Polar", "Ranger's", "Rotund", "Smiting", "Tempered", "Vile", "Virile"];
  const ringAttackSuffixes = ["of Bameth", "of Ephij", "of Haast", "of Magma", "of Tzteosh", "of Windfall", "of the Arid", "of the Comet", "of the Ice", "of the Jaguar", "of the Leviathan", "of the Lightning", "of the Phantom", "of the Rainbow", "of the Remora", "of the Savant", "of the Titan", "of the Virtuoso"];
  const ringAttackCombined = [...ringAttackPrefixes, ...ringAttackSuffixes, "Cauterising", "Consistent", "Coursing", "Darkened", "Glaciated", "Hailing", "Incinerating", "Malignant", "Pirate's", "Razor-sharp", "Robust", "Shocking", "Snowy", "Steady", "Striking", "Vaporous", "Volcanic", "of Excavation", "of Exile", "of Expulsion", "of Variegation", "of the Goliath", "of the Leopard", "of the Locust", "of the Maelstrom", "of the Meteor", "of the Parched", "of the Polar Bear", "of the Sage", "of the Volcano"];
  const ringAttackBadMods = ["Acrobat's", "Agile", "Bitter", "Burnished", "Buzzing", "Charged", "Chilled", "Dancer's", "Frosted", "Glinting", "Hale", "Healthy", "Heated", "Humming", "Icy", "Impure", "Polished", "Precise", "Sanguine", "Searing", "Smoking", "Smouldering", "Snapping", "of Absorption", "of Conquest", "of Consumption", "of Enveloping", "of Expertise", "of Infusion", "of Nimbleness", "of Osmosis", "of Success", "of Talent", "of Triumph", "of Vanquishing", "of Victory", "of the Bear", "of the Brute", "of the Cloud", "of the Drake", "of the Flatworm", "of the Fox", "of the Hydra", "of the Lizard", "of the Lost", "of the Lynx", "of the Mongoose", "of the Narwhal", "of the Newt", "of the Penguin", "of the Prodigy", "of the Pupil", "of the Salamander", "of the Seal", "of the Squall", "of the Starfish", "of the Storm", "of the Student", "of the Troll", "of the Whelpling", "of the Wrestler"];

  // 반지 (시전) 모드 리스트
  const ringCastingPrefixes = ["Blue", "Dragon's", "Rotund", "Virile", "Zaffre"];
  const ringCastingSuffixes = ["of Bameth", "of Ephij", "of Haast", "of Magma", "of Nirvana", "of Sortilege", "of Tzteosh", "of Windfall", "of the Comet", "of the Hearth", "of the Ice", "of the Jaguar", "of the Leviathan", "of the Lightning", "of the Phantom", "of the Rainbow", "of the Savant", "of the Titan", "of the Virtuoso"];
  const ringCastingCombined = [...ringCastingPrefixes, ...ringCastingSuffixes, "Chalybeous", "Mazarine", "Pirate's", "Robust", "of Bliss", "of Euphoria", "of Excavation", "of Exile", "of Expertise", "of Expulsion", "of Kindling", "of Variegation", "of the Goliath", "of the Leopard", "of the Maelstrom", "of the Meteor", "of the Polar Bear", "of the Sage", "of the Volcano"];
  const ringCastingBadMods = ["Azure", "Beryl", "Cobalt", "Hale", "Healthy", "Sanguine", "Teal", "of Absorption", "of Conquest", "of Consumption", "of Enveloping", "of Excitement", "of Infusion", "of Osmosis", "of Success", "of Triumph", "of Vanquishing", "of Victory", "of the Bear", "of the Brute", "of the Cloud", "of the Drake", "of the Flatworm", "of the Fox", "of the Hydra", "of the Lizard", "of the Lost", "of the Lynx", "of the Mongoose", "of the Narwhal", "of the Newt", "of the Penguin", "of the Prodigy", "of the Pupil", "of the Salamander", "of the Seal", "of the Squall", "of the Starfish", "of the Storm", "of the Student", "of the Troll", "of the Whelpling", "of the Wrestler"];

  // 목걸이 (공격) 모드 리스트
  const amuletAttackPrefixes = ["Athlete's", "Confident", "Countess'", "Dragon's", "Impregnable", "Incandescent", "Mirage's", "Ranger's", "Scintillating", "Unassailable", "Virile"];
  const amuletAttackSuffixes = ["of Bameth", "of Battle", "of Destruction", "of Ephij", "of Fleshbinding", "of Haast", "of Magma", "of Tzteosh", "of Unmaking", "of Windfall", "of Zen", "of the Ice", "of the Infinite", "of the Jaguar", "of the Leviathan", "of the Lightning", "of the Multiverse", "of the Overseer", "of the Phantom", "of the Savant", "of the Span", "of the Titan", "of the Virtuoso"];
  const amuletAttackCombined = [...amuletAttackPrefixes, ...amuletAttackSuffixes, "Consistent", "Dauntless", "Dazzling", "Girded", "Indomitable", "Marchioness'", "Nightmare's", "Optimistic", "Phantasm's", "Pirate's", "Rotund", "Steady", "Thickened", "of Calamity", "of Dueling", "of Excavation", "of Exile", "of Expulsion", "of Ferocity", "of Fury", "of Ruin", "of Serenity", "of Suturing", "of Variegation", "of the Despot", "of the Goliath", "of the Leopard", "of the Maelstrom", "of the Polar Bear", "of the Rainbow", "of the Sage", "of the Universe", "of the Volcano"];
  const amuletAttackBadMods = ["Adept's", "Apprentice's", "Glimmering", "Glittering", "Hale", "Healthy", "Occultist's", "Precise", "Professor's", "Protective", "Reinforced", "Sanguine", "Scholar's", "Shade's", "Shining", "of Convalescence", "of Expertise", "of Ire", "of Menace", "of Nimbleness", "of Recuperation", "of Sortilege", "of Talent", "of the Bear", "of the Brute", "of the Cloud", "of the Clouds", "of the Crystal", "of the Drake", "of the Enchanter", "of the Flatworm", "of the Fox", "of the Hydra", "of the Lizard", "of the Lost", "of the Lynx", "of the Mage", "of the Meteor", "of the Mongoose", "of the Narwhal", "of the Newt", "of the Penguin", "of the Prodigy", "of the Pupil", "of the Salamander", "of the Seal", "of the Sky", "of the Sorcerer", "of the Squall", "of the Starfish", "of the Storm", "of the Student", "of the Troll", "of the Whelpling", "of the Wrestler"];

  // 목걸이 (시전) 모드 리스트
  const amuletCastingPrefixes = ["Athlete's", "Confident", "Countess'", "Dragon's", "Incandescent", "Incanter's", "Mnemonic", "Scintillating", "Ultramarine", "Unassailable", "Virile", "Zaffre"];
  const amuletCastingSuffixes = ["of Bameth", "of Destruction", "of Ephij", "of Fleshbinding", "of Haast", "of Legerdemain", "of Magma", "of Nirvana", "of Tzteosh", "of Unmaking", "of Windfall", "of Zen", "of the Ice", "of the Infinite", "of the Jaguar", "of the Leviathan", "of the Lightning", "of the Multiverse", "of the Overseer", "of the Phantom", "of the Savant", "of the Sharpshooter", "of the Sorcerer", "of the Span", "of the Titan", "of the Virtuoso"];
  const amuletCastingCombined = [...amuletCastingPrefixes, ...amuletCastingSuffixes, "Blue", "Dauntless", "Dazzling", "Indomitable", "Marchioness'", "Mazarine", "Occultist's", "Optimistic", "Perceptive", "Pirate's", "Professor's", "Rotund", "of Bliss", "of Calamity", "of Euphoria", "of Excavation", "of Exile", "of Expulsion", "of Ferocity", "of Fury", "of Ruin", "of Serenity", "of Sortilege", "of Suturing", "of Variegation", "of the Despot", "of the Enchanter", "of the Fletcher", "of the Goliath", "of the Leopard", "of the Maelstrom", "of the Polar Bear", "of the Rainbow", "of the Sage", "of the Universe", "of the Volcano"];
  const amuletCastingBadMods = ["Apprentice's", "Azure", "Beryl", "Cobalt", "Consistent", "Deliberate", "Focused", "Glimmering", "Glittering", "Hale", "Healthy", "Precise", "Protective", "Reliable", "Sanguine", "Shining", "Steady", "Teal", "of Battle", "of Combat", "of Convalescence", "of Dueling", "of Excitement", "of Ire", "of Menace", "of Recuperation", "of the Bear", "of the Brute", "of the Cloud", "of the Clouds", "of the Crystal", "of the Drake", "of the Flatworm", "of the Fox", "of the Hydra", "of the Lizard", "of the Lost", "of the Lynx", "of the Meteor", "of the Mongoose", "of the Narwhal", "of the Newt", "of the Penguin", "of the Prodigy", "of the Pupil", "of the Salamander", "of the Seal", "of the Sky", "of the Squall", "of the Starfish", "of the Storm", "of the Student", "of the Troll", "of the Whelpling", "of the Wrestler"];

  settings.rules.forEach((rule) => {
    if (!rule.enabled) return;

    lines.push(`# ${lang === "ko" ? rule.nameKo : rule.name}`);
    lines.push(`# [RID: ${rule.id}]`);
    lines.push("Show");
    lines.push("    Identified True");

    let currentPrefixes, currentSuffixes, currentCombined, currentBadMods, currentClass;

    if (rule.id.includes("belts")) {
      currentClass = "Belts";
      currentPrefixes = beltPrefixes;
      currentSuffixes = beltSuffixes;
      currentCombined = beltCombined;
      currentBadMods = beltBadMods;
    } else if (rule.id.includes("rings_casting")) {
      currentClass = "Rings";
      currentPrefixes = ringCastingPrefixes;
      currentSuffixes = ringCastingSuffixes;
      currentCombined = ringCastingCombined;
      currentBadMods = ringCastingBadMods;
    } else if (rule.id.includes("rings")) {
      currentClass = "Rings";
      currentPrefixes = ringAttackPrefixes;
      currentSuffixes = ringAttackSuffixes;
      currentCombined = ringAttackCombined;
      currentBadMods = ringAttackBadMods;
    } else if (rule.id.includes("amulets_casting")) {
      currentClass = "Amulets";
      currentPrefixes = amuletCastingPrefixes;
      currentSuffixes = amuletCastingSuffixes;
      currentCombined = amuletCastingCombined;
      currentBadMods = amuletCastingBadMods;
    } else if (rule.id.includes("amulets")) {
      currentClass = "Amulets";
      currentPrefixes = amuletAttackPrefixes;
      currentSuffixes = amuletAttackSuffixes;
      currentCombined = amuletAttackCombined;
      currentBadMods = amuletAttackBadMods;
    }

    lines.push(`    Class == "${currentClass}"`);
    lines.push(`    HasExplicitMod >= 1 ${currentPrefixes.map(m => `"${m}"`).join(" ")}`);
    lines.push(`    HasExplicitMod >= 1 ${currentSuffixes.map(m => `"${m}"`).join(" ")}`);
    
    const count = rule.id.endsWith("_a") ? 4 : 3;
    lines.push(`    HasExplicitMod >= ${count} ${currentCombined.map(m => `"${m}"`).join(" ")}`);
    
    if (rule.id.endsWith("_a")) {
        lines.push(`    HasExplicitMod = 0 ${currentBadMods.map(m => `"${m}"`).join(" ")}`);
    } else {
        lines.push(`    HasExplicitMod <= 1 ${currentBadMods.map(m => `"${m}"`).join(" ")}`);
    }

    // 스타일 적용
    const styles = rule.styles || {};
    if (styles.fontSize) lines.push(`    SetFontSize ${styles.fontSize}`);
    if (styles.textColor) lines.push(`    SetTextColor ${styles.textColor.r} ${styles.textColor.g} ${styles.textColor.b} ${styles.textColor.a}`);
    if (styles.borderColor) lines.push(`    SetBorderColor ${styles.borderColor.r} ${styles.borderColor.g} ${styles.borderColor.b} ${styles.borderColor.a}`);
    if (styles.backgroundColor) lines.push(`    SetBackgroundColor ${styles.backgroundColor.r} ${styles.backgroundColor.g} ${styles.backgroundColor.b} ${styles.backgroundColor.a}`);
    if (styles.playEffect) lines.push(`    PlayEffect ${styles.playEffect}`);
    if (styles.minimapIcon) lines.push(`    MinimapIcon ${styles.minimapIcon.size} ${styles.minimapIcon.color} ${styles.minimapIcon.shape}`);
    if (styles.playAlertSound && isSndEnabled(styles)) lines.push(`    PlayAlertSound ${styles.playAlertSound.id} ${styles.playAlertSound.volume}`);
    if (styles.customSound && isSndEnabled(styles)) {
      const cs = styles.customSound.startsWith("custom_sound/") ? styles.customSound : `custom_sound/${styles.customSound}`;
      lines.push(`    CustomAlertSound "${cs}"`);
      if (styles.soundVolume) {
        lines.push(`    CustomAlertSoundOptional ${styles.soundVolume}`);
      }
    }

    lines.push("");
  });
}
