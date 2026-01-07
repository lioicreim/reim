import classes from "@/data/classes.json";
import bases from "@/data/bases.json";
import Link from "next/link";

function tierLabel(t) {
  if (t === 1) return "ELITE";
  if (t === 2) return "EXPERT";
  if (t === 3) return "ADVANCED";
  return "BASIC";
}

function tierBgVar(t) {
  if (t === 1) return "var(--t1)";
  if (t === 2) return "var(--t2)";
  if (t === 3) return "var(--t3)";
  return "var(--t4)";
}

export default function GearClassPage({ params, searchParams }) {
  const slug = decodeURIComponent(params.slug);

  if (!classes[slug]) {
    return (
      <main className="container">
        <div className="card">
          <div className="cardBody">
            <h1>존재하지 않는 클래스</h1>
            <p style={{ color: "rgba(255,255,255,.62)" }}>요청한 값: {slug}</p>
            <p style={{ color: "rgba(255,255,255,.62)" }}>
              classes.json에 없는 키야.
            </p>
            <Link href="/gear">← /gear로 돌아가기</Link>
          </div>
        </div>
      </main>
    );
  }

  // 표시 언어 (지금은 데이터가 영문만 있다고 가정)
  // 나중에 translations.json 붙이면 여기서 바꾸면 됨.
  const lang = searchParams?.lang === "ko" ? "ko" : "en";

  const list = Object.keys(bases)
    .map((name) => ({ name, ...bases[name] }))
    .filter((x) => x.class === slug);

  // tier 1~4로 나누기
  const byTier = { 1: [], 2: [], 3: [], 4: [] };
  for (const item of list) {
    const t = Number(item.tier) || 4;
    if (!byTier[t]) byTier[t] = [];
    byTier[t].push(item);
  }

  // 보기 좋게 이름 정렬
  for (const t of [1, 2, 3, 4])
    byTier[t].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader">
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{slug}</div>
            <div style={{ color: "rgba(255,255,255,.62)" }}>
              min {classes[slug].minIlvl ?? "-"} / cap{" "}
              {classes[slug].capIlvl ?? "-"} / items {list.length}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href={`/gear/${encodeURIComponent(slug)}?lang=en`}>EN</Link>
            <Link href={`/gear/${encodeURIComponent(slug)}?lang=ko`}>KO</Link>
            <Link href="/gear">Back</Link>
          </div>
        </div>

        <div className="cardBody">
          <div className="grid4">
            {[1, 2, 3, 4].map((t) => (
              <section key={t}>
                <div className="colTitle">{tierLabel(t)}</div>

                {byTier[t].map((b) => (
                  <div
                    key={b.name}
                    className="tile"
                    style={{ background: tierBgVar(t) }}
                    title={b.name}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {lang === "ko" ? b.name : b.name}
                    </div>
                    <small>
                      Tier {t}
                      {b.armourType ? ` • ${b.armourType}` : ""}
                    </small>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
