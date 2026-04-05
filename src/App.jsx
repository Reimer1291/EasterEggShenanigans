import { useState } from "react";

const DUCK_COLORS = ["Purple", "Blue", "Yellow"];
const EGG_COLORS = ["Green", "Orange", "Yellow", "Blue", "Purple", "Pink"];
const EGG_COUNTS = { Green: 8, Orange: 9, Yellow: 4, Blue: 5, Purple: 6, Pink: 14 };
const TOTAL_EGGS = 46;
const MAX_EGG_COUNT = Math.max(...Object.values(EGG_COUNTS));
const EGG_POINTS = Object.fromEntries(
  Object.entries(EGG_COUNTS).map(([color, count]) => [
    color,
    Math.round((4 + (MAX_EGG_COUNT / count - 1) * 0.6) * 10) / 10,
  ])
);
const BASE_PTS = 4;

const COLOR_MAP = {
  Purple: { bg: "#9b59b6", text: "#fff" },
  Blue: { bg: "#3498db", text: "#fff" },
  Yellow: { bg: "#f1c40f", text: "#5a4e00" },
  Green: { bg: "#27ae60", text: "#fff" },
  Orange: { bg: "#e67e22", text: "#fff" },
  Pink: { bg: "#e84393", text: "#fff" },
};

const PHASES = { SETUP: 0, BET: 1, REVIEW: 2, RESULTS: 3 };

function EggIcon({ size = 24, color = "#e84393", style = {} }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" style={style}>
      <ellipse cx="20" cy="28" rx="16" ry="20" fill={color} />
      <ellipse cx="20" cy="24" rx="12" ry="14" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="15" cy="20" rx="4" ry="6" fill="rgba(255,255,255,0.12)" />
    </svg>
  );
}

function DuckIcon({ size = 28, color = "#f1c40f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <ellipse cx="24" cy="30" rx="16" ry="12" fill={color} />
      <circle cx="18" cy="20" r="10" fill={color} />
      <ellipse cx="11" cy="21" rx="5" ry="3" fill="#e67e22" />
      <circle cx="20" cy="18" r="2" fill="#2d3436" />
      <path d="M30 36 Q38 30 36 26" stroke={color} strokeWidth="3" fill="none" />
      <path d="M36 26 Q40 24 38 22" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function ChipButton({ selected, onClick, children, colorInfo, style: extraStyle = {} }) {
  const base = {
    padding: "8px 18px",
    borderRadius: "999px",
    border: selected
      ? `2px solid ${colorInfo?.bg || "#6c5ce7"}`
      : "2px solid rgba(0,0,0,0.08)",
    background: selected ? colorInfo?.bg || "#6c5ce7" : "rgba(255,255,255,0.7)",
    color: selected ? colorInfo?.text || "#fff" : "#555",
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(4px)",
    ...extraStyle,
  };
  return (
    <button style={base} onClick={onClick}>
      {children}
    </button>
  );
}

export default function EasterBettingPool() {
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [hunters, setHunters] = useState(["", ""]);
  const [buyIn, setBuyIn] = useState("");
  const [bettors, setBettors] = useState([]);
  const [currentBet, setCurrentBet] = useState({
    name: "",
    firstDuck: "",
    firstEgg: "",
    winner: "",
    winningCount: "",
    losingCount: "",
  });
  const [results, setResults] = useState({
    firstDuck: "",
    firstEgg: "",
    winner: "",
    winningCount: "",
    losingCount: "",
  });
  const [showScores, setShowScores] = useState(false);

  const addHunter = () => {
    if (hunters.length < 5) setHunters([...hunters, ""]);
  };
  const removeHunter = (i) => {
    if (hunters.length > 2) setHunters(hunters.filter((_, idx) => idx !== i));
  };
  const updateHunter = (i, v) => {
    const h = [...hunters];
    h[i] = v;
    setHunters(h);
  };

  const validHunters = hunters.filter((h) => h.trim());
  const canStartBetting = validHunters.length >= 2 && Number(buyIn) > 0;

  const submitBet = () => {
    if (
      !currentBet.name.trim() ||
      !currentBet.firstDuck ||
      !currentBet.firstEgg ||
      !currentBet.winner ||
      !currentBet.winningCount ||
      !currentBet.losingCount
    )
      return;
    setBettors([...bettors, { ...currentBet }]);
    setCurrentBet({
      name: "",
      firstDuck: "",
      firstEgg: "",
      winner: "",
      winningCount: "",
      losingCount: "",
    });
  };

  const resetApp = () => {
    setPhase(PHASES.SETUP);
    setHunters(["", ""]);
    setBuyIn("");
    setBettors([]);
    setCurrentBet({ name: "", firstDuck: "", firstEgg: "", winner: "", winningCount: "", losingCount: "" });
    setResults({ firstDuck: "", firstEgg: "", winner: "", winningCount: "", losingCount: "" });
    setShowScores(false);
  };

  const scoreResults = () => {
    return bettors.map((b) => {
      let score = 0;
      let details = [];
      if (b.firstDuck === results.firstDuck) {
        score += BASE_PTS;
        details.push("First Duck");
      }
      if (b.firstEgg === results.firstEgg) {
        const pts = EGG_POINTS[b.firstEgg] || BASE_PTS;
        score += pts;
        details.push(`First Egg (${pts}pts)`);
      }
      if (b.winner === results.winner) {
        score += BASE_PTS;
        details.push("Winner");
      }
      if (b.winningCount === results.winningCount) {
        score += BASE_PTS;
        details.push("Exact Win #");
      } else if (Math.abs(Number(b.winningCount) - Number(results.winningCount)) <= 2) {
        score += 1;
        details.push("Win # (close)");
      }
      if (b.losingCount === results.losingCount) {
        score += BASE_PTS;
        details.push("Exact Lose #");
      } else if (Math.abs(Number(b.losingCount) - Number(results.losingCount)) <= 2) {
        score += 1;
        details.push("Lose # (close)");
      }
      return { name: b.name, score: Math.round(score * 10) / 10, details };
    });
  };

  const allResultsFilled =
    results.firstDuck &&
    results.firstEgg &&
    results.winner &&
    results.winningCount &&
    results.losingCount;

  const fontLink = (
    <link
      href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Baloo+2:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  );

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(175deg, #ffecd2 0%, #fcb69f 30%, #a8e6cf 70%, #dcedc1 100%)",
    fontFamily: "'Fredoka', sans-serif",
    padding: "0",
    position: "relative",
    overflow: "hidden",
  };

  const headerStyle = {
    textAlign: "center",
    padding: "32px 20px 12px",
    position: "relative",
  };

  const titleStyle = {
    fontFamily: "'Baloo 2', cursive",
    fontSize: "clamp(2rem, 6vw, 3.2rem)",
    fontWeight: 700,
    color: "#2d3436",
    margin: 0,
    lineHeight: 1.1,
    textShadow: "2px 2px 0 rgba(255,255,255,0.4)",
  };

  const subtitleStyle = {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "1rem",
    color: "#636e72",
    marginTop: 6,
    fontWeight: 500,
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.55)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    padding: "24px",
    margin: "12px 16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid rgba(255,255,255,0.6)",
  };

  const labelStyle = {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "#2d3436",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "2px solid rgba(0,0,0,0.08)",
    fontFamily: "'Fredoka', sans-serif",
    fontSize: "1rem",
    background: "rgba(255,255,255,0.7)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const primaryBtn = {
    padding: "12px 32px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    color: "#fff",
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: 700,
    fontSize: "1.05rem",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(108,92,231,0.3)",
    transition: "transform 0.15s, box-shadow 0.15s",
  };

  const secondaryBtn = {
    ...primaryBtn,
    background: "linear-gradient(135deg, #00b894, #55efc4)",
    boxShadow: "0 4px 16px rgba(0,184,148,0.3)",
  };

  const dangerBtn = {
    ...primaryBtn,
    background: "linear-gradient(135deg, #d63031, #ff7675)",
    boxShadow: "0 4px 16px rgba(214,48,49,0.2)",
    padding: "6px 14px",
    fontSize: "0.8rem",
  };

  const chipRow = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  };

  const numberInput = {
    ...inputStyle,
    width: 100,
    textAlign: "center",
    fontSize: "1.2rem",
    fontWeight: 700,
  };

  const decorativeEggs = (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
      <EggIcon size={18} color="rgba(155,89,182,0.15)" style={{ position: "absolute", top: "8%", left: "5%", transform: "rotate(-20deg)" }} />
      <EggIcon size={22} color="rgba(46,204,113,0.12)" style={{ position: "absolute", top: "15%", right: "8%", transform: "rotate(15deg)" }} />
      <EggIcon size={16} color="rgba(232,67,147,0.12)" style={{ position: "absolute", top: "45%", left: "3%", transform: "rotate(25deg)" }} />
      <EggIcon size={20} color="rgba(241,196,15,0.15)" style={{ position: "absolute", top: "70%", right: "5%", transform: "rotate(-10deg)" }} />
      <EggIcon size={14} color="rgba(52,152,219,0.12)" style={{ position: "absolute", top: "85%", left: "10%", transform: "rotate(30deg)" }} />
    </div>
  );

  const infoBar = (
    <div style={{ ...cardStyle, padding: "14px 20px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <DuckIcon size={20} />
        <span style={{ fontSize: "0.8rem", color: "#636e72" }}>3 Ducks</span>
      </div>
      <span style={{ color: "#ddd" }}>|</span>
      {Object.entries(EGG_COUNTS).map(([color, count]) => (
        <div key={color} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <EggIcon size={12} color={COLOR_MAP[color].bg} />
          <span style={{ fontSize: "0.78rem", color: "#636e72", fontWeight: 500 }}>{count}</span>
        </div>
      ))}
      <span style={{ fontSize: "0.8rem", color: "#2d3436", fontWeight: 700 }}>= {TOTAL_EGGS}</span>
    </div>
  );

  // ─── SETUP ───
  if (phase === PHASES.SETUP) {
    return (
      <div style={containerStyle}>
        {fontLink}
        {decorativeEggs}
        <div style={headerStyle}>
          <p style={titleStyle}>
            <span role="img">🐣</span> Easter Egg Hunt
          </p>
          <p style={{ ...titleStyle, fontSize: "clamp(1.4rem, 4vw, 2.2rem)", color: "#6c5ce7" }}>Betting Pool</p>
          <p style={subtitleStyle}>Set up your hunters to get started</p>
        </div>
        {infoBar}
        <div style={cardStyle}>
          <p style={{ ...labelStyle, fontSize: "1.05rem", marginBottom: 14 }}>
            <span role="img">🏃</span> Egg Hunters ({hunters.length}/5)
          </p>
          {hunters.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#b2bec3", width: 22, textAlign: "right", fontSize: "0.85rem" }}>
                {i + 1}.
              </span>
              <input
                style={inputStyle}
                placeholder={`Hunter ${i + 1} name`}
                value={h}
                onChange={(e) => updateHunter(i, e.target.value)}
              />
              {hunters.length > 3 && (
                <button
                  onClick={() => removeHunter(i)}
                  style={{ background: "none", border: "none", color: "#d63031", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700, padding: "4px 8px" }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            {hunters.length < 5 && (
              <button onClick={addHunter} style={{ ...primaryBtn, background: "rgba(108,92,231,0.12)", color: "#6c5ce7", boxShadow: "none", fontSize: "0.9rem", padding: "8px 20px" }}>
                + Add Hunter
              </button>
            )}
          </div>
          <div style={{ marginTop: 20, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 18 }}>
            <p style={{ ...labelStyle, fontSize: "1.05rem", marginBottom: 10 }}>
              <span role="img">💰</span> Buy-In Amount
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: "1.3rem", color: "#2d3436" }}>$</span>
              <input
                type="number"
                min="1"
                style={{ ...inputStyle, width: 120, textAlign: "center", fontSize: "1.2rem", fontWeight: 700 }}
                placeholder="0"
                value={buyIn}
                onChange={(e) => setBuyIn(e.target.value)}
              />
              <span style={{ fontSize: "0.85rem", color: "#636e72" }}>per person</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <button
              onClick={() => canStartBetting && setPhase(PHASES.BET)}
              style={{ ...primaryBtn, opacity: canStartBetting ? 1 : 0.4, cursor: canStartBetting ? "pointer" : "not-allowed" }}
            >
              Start Betting →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── BETTING ───
  if (phase === PHASES.BET) {
    const allFilled = currentBet.name && currentBet.firstDuck && currentBet.firstEgg && currentBet.winner && currentBet.winningCount && currentBet.losingCount;
    return (
      <div style={containerStyle}>
        {fontLink}
        {decorativeEggs}
        <div style={headerStyle}>
          <button onClick={resetApp} style={{ ...dangerBtn, position: "absolute", top: 16, right: 16 }}>↺ Reset</button>
          <p style={titleStyle}>
            <span role="img">🎰</span> Place Your Bets!
          </p>
          <p style={subtitleStyle}>{bettors.length} bet{bettors.length !== 1 ? "s" : ""} placed · Pot: ${bettors.length * Number(buyIn)} (${buyIn} buy-in)</p>
        </div>
        {infoBar}
        <div style={cardStyle}>
          <div style={{ marginBottom: 18 }}>
            <p style={labelStyle}>Your Name</p>
            <input
              style={inputStyle}
              placeholder="Who's placing this bet?"
              value={currentBet.name}
              onChange={(e) => setCurrentBet({ ...currentBet, name: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={labelStyle}><DuckIcon size={18} /> First Duck Color Found</p>
            <div style={chipRow}>
              {DUCK_COLORS.map((c) => (
                <ChipButton
                  key={c}
                  selected={currentBet.firstDuck === c}
                  onClick={() => setCurrentBet({ ...currentBet, firstDuck: c })}
                  colorInfo={COLOR_MAP[c]}
                >
                  {c}
                </ChipButton>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={labelStyle}><EggIcon size={14} color="#e84393" /> First Egg Color Found</p>
            <div style={chipRow}>
              {EGG_COLORS.map((c) => (
                <ChipButton
                  key={c}
                  selected={currentBet.firstEgg === c}
                  onClick={() => setCurrentBet({ ...currentBet, firstEgg: c })}
                  colorInfo={COLOR_MAP[c]}
                >
                  {c} ({EGG_COUNTS[c]}) · {EGG_POINTS[c]}pt{EGG_POINTS[c] !== 1 ? 's' : ''}
                </ChipButton>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <p style={labelStyle}><span role="img">🏆</span> Hunter with Most Eggs</p>
            <div style={chipRow}>
              {validHunters.map((h) => (
                <ChipButton
                  key={h}
                  selected={currentBet.winner === h}
                  onClick={() => setCurrentBet({ ...currentBet, winner: h })}
                >
                  {h}
                </ChipButton>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <p style={labelStyle}><span role="img">📈</span> Winning # of Eggs</p>
              <input
                type="number"
                min="1"
                max={TOTAL_EGGS}
                style={numberInput}
                value={currentBet.winningCount}
                onChange={(e) => setCurrentBet({ ...currentBet, winningCount: e.target.value })}
                placeholder="?"
              />
            </div>
            <div>
              <p style={labelStyle}><span role="img">📉</span> Losing # of Eggs</p>
              <input
                type="number"
                min="0"
                max={TOTAL_EGGS}
                style={numberInput}
                value={currentBet.losingCount}
                onChange={(e) => setCurrentBet({ ...currentBet, losingCount: e.target.value })}
                placeholder="?"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={submitBet}
              style={{ ...secondaryBtn, opacity: allFilled ? 1 : 0.4, cursor: allFilled ? "pointer" : "not-allowed" }}
            >
              <span role="img">🥚</span> Lock In Bet
            </button>
            {bettors.length > 0 && (
              <button onClick={() => setPhase(PHASES.REVIEW)} style={primaryBtn}>
                Done Betting → Review
              </button>
            )}
          </div>
        </div>

        {bettors.length > 0 && (
          <div style={cardStyle}>
            <p style={{ ...labelStyle, fontSize: "1rem" }}>Bets Locked In</p>
            {bettors.map((b, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.4)" : "transparent",
                  borderRadius: 10,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 600 }}>{b.name}</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "0.75rem", background: COLOR_MAP[b.firstDuck].bg, color: COLOR_MAP[b.firstDuck].text, padding: "2px 8px", borderRadius: 99 }}>{b.firstDuck}</span>
                  <span style={{ fontSize: "0.75rem", background: COLOR_MAP[b.firstEgg].bg, color: COLOR_MAP[b.firstEgg].text, padding: "2px 8px", borderRadius: 99 }}>{b.firstEgg}</span>
                  <span style={{ fontSize: "0.75rem", background: "#dfe6e9", padding: "2px 8px", borderRadius: 99 }}>{b.winner}</span>
                  <span style={{ fontSize: "0.75rem", background: "#dfe6e9", padding: "2px 8px", borderRadius: 99 }}>W:{b.winningCount} L:{b.losingCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── REVIEW ───
  if (phase === PHASES.REVIEW) {
    return (
      <div style={containerStyle}>
        {fontLink}
        {decorativeEggs}
        <div style={headerStyle}>
          <button onClick={resetApp} style={{ ...dangerBtn, position: "absolute", top: 16, right: 16 }}>↺ Reset</button>
          <p style={titleStyle}><span role="img">📋</span> All Bets</p>
          <p style={subtitleStyle}>{bettors.length} total bets · Pot: ${bettors.length * Number(buyIn)}</p>
        </div>
        <div style={cardStyle}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", fontFamily: "'Fredoka', sans-serif", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ color: "#636e72", fontWeight: 600, textAlign: "left" }}>
                  <th style={{ padding: "6px 10px" }}>Bettor</th>
                  <th style={{ padding: "6px 10px" }}>1st Duck</th>
                  <th style={{ padding: "6px 10px" }}>1st Egg</th>
                  <th style={{ padding: "6px 10px" }}>Winner</th>
                  <th style={{ padding: "6px 10px" }}>Win #</th>
                  <th style={{ padding: "6px 10px" }}>Lose #</th>
                </tr>
              </thead>
              <tbody>
                {bettors.map((b, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", borderRadius: 10 }}>
                    <td style={{ padding: "8px 10px", fontWeight: 600, borderRadius: "10px 0 0 10px" }}>{b.name}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ background: COLOR_MAP[b.firstDuck].bg, color: COLOR_MAP[b.firstDuck].text, padding: "2px 10px", borderRadius: 99, fontSize: "0.8rem" }}>{b.firstDuck}</span>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ background: COLOR_MAP[b.firstEgg].bg, color: COLOR_MAP[b.firstEgg].text, padding: "2px 10px", borderRadius: 99, fontSize: "0.8rem" }}>{b.firstEgg}</span>
                    </td>
                    <td style={{ padding: "8px 10px" }}>{b.winner}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 700 }}>{b.winningCount}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 700, borderRadius: "0 10px 10px 0" }}>{b.losingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => setPhase(PHASES.BET)} style={{ ...primaryBtn, background: "rgba(108,92,231,0.12)", color: "#6c5ce7", boxShadow: "none" }}>
              ← Add More Bets
            </button>
            <button onClick={() => setPhase(PHASES.RESULTS)} style={secondaryBtn}>
              Enter Results →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS ───
  if (phase === PHASES.RESULTS) {
    const scores = showScores ? scoreResults().sort((a, b) => b.score - a.score) : [];
    const maxScore = scores.length ? scores[0].score : 0;
    return (
      <div style={containerStyle}>
        {fontLink}
        {decorativeEggs}
        <div style={headerStyle}>
          <button onClick={resetApp} style={{ ...dangerBtn, position: "absolute", top: 16, right: 16 }}>↺ Reset</button>
          <p style={titleStyle}><span role="img">🏁</span> Results</p>
          <p style={subtitleStyle}>Enter what actually happened!</p>
        </div>
        <div style={cardStyle}>
          <div style={{ marginBottom: 18 }}>
            <p style={labelStyle}><DuckIcon size={18} /> First Duck Found</p>
            <div style={chipRow}>
              {DUCK_COLORS.map((c) => (
                <ChipButton key={c} selected={results.firstDuck === c} onClick={() => setResults({ ...results, firstDuck: c })} colorInfo={COLOR_MAP[c]}>{c}</ChipButton>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <p style={labelStyle}><EggIcon size={14} color="#e84393" /> First Egg Color Found</p>
            <div style={chipRow}>
              {EGG_COLORS.map((c) => (
                <ChipButton key={c} selected={results.firstEgg === c} onClick={() => setResults({ ...results, firstEgg: c })} colorInfo={COLOR_MAP[c]}>{c} · {EGG_POINTS[c]}pts</ChipButton>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <p style={labelStyle}><span role="img">🏆</span> Who Got the Most Eggs?</p>
            <div style={chipRow}>
              {validHunters.map((h) => (
                <ChipButton key={h} selected={results.winner === h} onClick={() => setResults({ ...results, winner: h })}>{h}</ChipButton>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <p style={labelStyle}><span role="img">📈</span> Winning # of Eggs</p>
              <input type="number" min="1" max={TOTAL_EGGS} style={numberInput} value={results.winningCount} onChange={(e) => setResults({ ...results, winningCount: e.target.value })} />
            </div>
            <div>
              <p style={labelStyle}><span role="img">📉</span> Losing # of Eggs</p>
              <input type="number" min="0" max={TOTAL_EGGS} style={numberInput} value={results.losingCount} onChange={(e) => setResults({ ...results, losingCount: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPhase(PHASES.REVIEW)} style={{ ...primaryBtn, background: "rgba(108,92,231,0.12)", color: "#6c5ce7", boxShadow: "none" }}>
              ← Back to Bets
            </button>
            <button
              onClick={() => allResultsFilled && setShowScores(true)}
              style={{ ...secondaryBtn, opacity: allResultsFilled ? 1 : 0.4, cursor: allResultsFilled ? "pointer" : "not-allowed" }}
            >
              <span role="img">🎉</span> Score It!
            </button>
          </div>
        </div>

        {showScores && (
          <div style={cardStyle}>
            <p style={{ ...titleStyle, fontSize: "1.6rem", textAlign: "center", marginBottom: 4 }}>
              <span role="img">🏆</span> Leaderboard
            </p>
            {(() => {
              const pot = bettors.length * Number(buyIn);
              const thirdPayout = Number(buyIn);
              const remaining = pot - thirdPayout;
              const firstPayout = Math.floor(remaining * 0.65);
              const secondPayout = remaining - firstPayout;
              const payoutLabels = [`$${firstPayout}`, `$${secondPayout}`, `$${thirdPayout}`];
              const payoutDescs = ["Winner", "Runner-up", "Money back"];
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center", background: "linear-gradient(135deg, rgba(241,196,15,0.2), rgba(253,203,110,0.15))", padding: "8px 18px", borderRadius: 14, border: "1px solid rgba(241,196,15,0.3)" }}>
                      <div style={{ fontSize: "0.7rem", color: "#f39c12", fontWeight: 600 }}>TOTAL POT</div>
                      <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: "1.4rem", fontWeight: 700, color: "#2d3436" }}>${pot}</div>
                    </div>
                    {[0,1,2].map(p => (
                      <div key={p} style={{ textAlign: "center", background: "rgba(255,255,255,0.4)", padding: "8px 14px", borderRadius: 14 }}>
                        <div style={{ fontSize: "0.65rem", color: "#636e72", fontWeight: 600 }}>{p === 0 ? "🥇 1ST" : p === 1 ? "🥈 2ND" : "🥉 3RD"}</div>
                        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: "1.1rem", fontWeight: 700, color: p === 0 ? "#f39c12" : p === 1 ? "#636e72" : "#e17055" }}>{payoutLabels[p]}</div>
                        <div style={{ fontSize: "0.6rem", color: "#b2bec3" }}>{payoutDescs[p]}</div>
                      </div>
                    ))}
                  </div>
                  {scores.map((s, i) => {
                    const payout = i === 0 ? payoutLabels[0] : i === 1 ? payoutLabels[1] : i === 2 ? payoutLabels[2] : null;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          marginBottom: 8,
                          borderRadius: 14,
                          background: i === 0 && s.score > 0 ? "linear-gradient(135deg, rgba(241,196,15,0.25), rgba(253,203,110,0.2))" : "rgba(255,255,255,0.4)",
                          border: i === 0 && s.score > 0 ? "2px solid rgba(241,196,15,0.5)" : "1px solid rgba(0,0,0,0.04)",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem", fontWeight: 700, color: i === 0 ? "#f39c12" : i === 1 ? "#95a5a6" : i === 2 ? "#e17055" : "#b2bec3", minWidth: 32, textAlign: "center" }}>
                          {i === 0 && s.score > 0 ? "👑" : `#${i + 1}`}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{s.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "#636e72", marginTop: 2 }}>
                            {s.details.length > 0 ? s.details.join(" · ") : "No matches"}
                          </div>
                        </div>
                        {payout && (
                          <div style={{
                            background: i === 0 ? "linear-gradient(135deg, #f39c12, #e67e22)" : i === 1 ? "linear-gradient(135deg, #95a5a6, #b2bec3)" : "linear-gradient(135deg, #e17055, #fab1a0)",
                            color: "#fff",
                            padding: "4px 12px",
                            borderRadius: 99,
                            fontFamily: "'Baloo 2', cursive",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                          }}>
                            {payout}
                          </div>
                        )}
                        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: "1.6rem", fontWeight: 700, color: s.score === maxScore && s.score > 0 ? "#f39c12" : "#2d3436" }}>
                          {s.score}
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}
            <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#b2bec3", marginTop: 12 }}>
              Scoring: 4pts per correct pick · 4–5.5pts first egg (by rarity) · 1pt for numbers within ±2
            </p>
            <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#b2bec3", marginTop: 2 }}>
              Balanced so 3 correct categories always beats 2
            </p>
            <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#b2bec3", marginTop: 2 }}>
              Payouts: 1st gets 65% of remaining pot · 2nd gets 35% · 3rd gets buy-in back
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
