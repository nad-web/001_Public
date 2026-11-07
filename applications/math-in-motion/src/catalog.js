/* Math in Motion · copyright 2026 Noorullah Adel · MIT */
(() => {
  const lessons = [];
  const groups = {
    primary: ["01", "Primary school", "Grundschule"],
    middle: ["02", "Middle school", "Mittelstufe"],
    high: ["03", "High school", "Oberstufe"],
    university: ["04", "University", "Universität"],
    advanced: ["05", "Advanced & applied", "Vertiefung & Anwendung"],
  };
  const strands = {
    number: ["Numbers & arithmetic", "Zahlen & Rechnen"],
    algebra: ["Algebra & functions", "Algebra & Funktionen"],
    geometry: ["Geometry & measurement", "Geometrie & Messen"],
    calculus: ["Calculus & analysis", "Analysis"],
    probability: ["Probability & statistics", "Wahrscheinlichkeit & Statistik"],
    discrete: ["Discrete math & logic", "Diskrete Mathematik & Logik"],
    linear: ["Linear algebra", "Lineare Algebra"],
    finance: ["Financial mathematics", "Finanzmathematik"],
    computation: ["Numerics & optimization", "Numerik & Optimierung"],
    ml: ["Machine learning", "Maschinelles Lernen"],
    pure: ["Advanced pure math", "Höhere reine Mathematik"],
    modeling: [
      "Differential equations & modeling",
      "Differentialgleichungen & Modellierung",
    ],
  };
  const germanFormulas = {
    counting: "n = Anzahl der Gegenstände",
    "time-elapsed": "Δt = Ende − Beginn",
    polygons: "n Seiten ⇔ n Ecken",
    money: "Cent gesamt = 100e + c",
    "absolute-value": "abs(x) = Abstand von 0",
    similarity: "Länge × k · Fläche × k²",
    "simple-probability": "P(E) = günstige / mögliche",
    "trig-ratios":
      "sin θ = Gegenkathete/Hypotenuse · cos θ = Ankathete/Hypotenuse",
    "rank-nullity": "dim(Definitionsraum) = Rang(T) + dim ker(T)",
    graphs: "Σᵥ Grad(v) = 2 · Kantenzahl",
    curl: "rot F = ∂F₂/∂x − ∂F₁/∂y",
    "linear-programming": "max cᵀx unter Ax ≤ b",
    modular: "a ≡ b (mod m) ⇔ m teilt a−b",
    fields: "𝔽ₚ = ℤ/pℤ, p prim",
    rings: "ab = 0 mit a ≠ 0 und b ≠ 0",
  };
  function add(level, lines) {
    for (const line of lines.trim().split("\n")) {
      if (!line.trim()) continue;
      const [
        id,
        strand,
        en,
        de,
        formula,
        explanation,
        erklaerung,
        example,
        beispiel,
      ] = line.split("|");
      lessons.push({
        id,
        level,
        strand,
        formula,
        en: { title: en, formula, explanation, example },
        de: {
          title: de,
          formula: germanFormulas[id] ?? formula,
          explanation: erklaerung,
          example: beispiel,
        },
      });
    }
  }
  function mediaGroup(level, lang) {
    return level === "university" || level === "advanced"
      ? `${level}-${lang}`
      : level;
  }
  globalThis.MathMotion = { lessons, groups, strands, add, mediaGroup };
})();
