import Link from "next/link";
import classes from "@/data/classes.json";

export default function GearHome() {
  const classNames = Object.keys(classes).sort();

  return (
    <main className="container">
      <div className="card">
        <div className="cardHeader">
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Gear Bases</div>
            <div style={{ color: "rgba(255,255,255,.62)" }}>
              Classes: {classNames.length}
            </div>
          </div>
        </div>

        <div className="cardBody">
          <ul style={{ lineHeight: 1.9 }}>
            {classNames.map((c) => (
              <li key={c}>
                <Link
                  href={`/gear/${encodeURIComponent(c)}`}
                  style={{ color: "rgba(255,255,255,.92)" }}
                >
                  <b>{c}</b>
                </Link>{" "}
                <span style={{ color: "rgba(255,255,255,.62)" }}>
                  (min {classes[c].minIlvl ?? "-"}, cap{" "}
                  {classes[c].capIlvl ?? "-"})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
