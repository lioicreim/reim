
/**
 * 베이스 아이템 규칙 생성 (빠른 설정에서)
 */
function generateBaseItemsRules(lines, baseItemsSettings, lang = "ko") {
  if (!baseItemsSettings || !baseItemsSettings.enabled) return;

  const rules = baseItemsSettings.rules || [];

  rules.forEach((rule) => {
    if (!rule.enabled) return;

    // 섹션 주석
    lines.push(`# [SECTION: base_items]`);
    
    // RID 주석
    const tierName = rule.id.replace("base_items_", "");
    lines.push(`# [RID: ${rule.id}]`);
    
    // Show/Hide
    lines.push(rule.type === "hide" ? "Hide" : "Show");

    // Rarity 조건
    if (rule.conditions?.rarity?.value) {
      const rarityValue = rule.conditions.rarity.value;
      // Normal, Magic, Rare를 >= 연산자로 변환
      lines.push(`  Rarity >= ${rarityValue}`);
    }

    // ItemLevel 조건
    if (rule.conditions?.levelType?.value) {
      const levelType = rule.conditions.levelType.value;
      // MIN_ILVL 또는 CAP_ILVL에 따라 조건 생성
      // 실제 레벨 값은 베이스 아이템 데이터에서 가져와야 하지만,
      // 현재는 플레이스홀더로 주석만 추가
      if (levelType === "MIN_ILVL") {
        lines.push(`  # ItemLevel >= MIN_ILVL (베이스별 최소 레벨)`);
      } else if (levelType === "CAP_ILVL") {
        lines.push(`  # ItemLevel >= CAP_ILVL (베이스별 최대 레벨)`);
      }
    }

    // Quality 조건
    if (rule.conditions?.quality?.value !== null && rule.conditions?.quality?.value !== undefined) {
      const qualityValue = rule.conditions.quality.value;
      const qualityOperator = rule.conditions.quality.operator || '>=';
      lines.push(`  Quality ${qualityOperator} ${qualityValue}`);
    }

    // 스타일 적용
    if (rule.type === "show" && rule.styles) {
      const styles = rule.styles;

      if (styles.fontSize) {
        lines.push(`  SetFontSize ${styles.fontSize}`);
      }

      if (styles.textColor) {
        const { r, g, b, a } = styles.textColor;
        lines.push(`  SetTextColor ${r} ${g} ${b} ${a}`);
      }

      if (styles.borderColor) {
        const { r, g, b, a } = styles.borderColor;
        lines.push(`  SetBorderColor ${r} ${g} ${b} ${a}`);
      }

      if (styles.backgroundColor) {
        const { r, g, b, a } = styles.backgroundColor;
        lines.push(`  SetBackgroundColor ${r} ${g} ${b} ${a}`);
      }

      if (styles.playEffect) {
        lines.push(`  PlayEffect ${styles.playEffect}`);
      }

      if (styles.minimapIcon) {
        const { size, color, shape } = styles.minimapIcon;
        if (size !== null || color !== null || shape !== null) {
          lines.push(`  MinimapIcon ${size || 0} ${color || "White"} ${shape || "Circle"}`);
        }
      }

      if (styles.customSound) {
        lines.push(`  CustomAlertSound "${styles.customSound}" 300`);
      }
    }

    lines.push("");
  });
}
