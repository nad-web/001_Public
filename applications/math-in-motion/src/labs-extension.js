(() => {
  const {
    put,
    knob: k,
    plot,
    columns,
    tiles,
    flow,
    series,
    sum,
    choose,
    PI,
    TAU,
    sin,
    cos,
    sqrt,
    abs,
    exp,
    min,
    max,
    hypot,
  } = MathMotion;
  const real = (en, de, min, max, initial, step = 0.1) =>
    k(en, de, min, max, step, initial);
  const int = (en, de, min, max, initial) => real(en, de, min, max, initial, 1);
  const at = real("Input x", "Eingabe x", -3, 3, 1);
  const angle = int("Angle in degrees", "Winkel in Grad", 0, 360, 75);
  const ring = (s, n, r = 90) =>
    series(n, (i) => [
      360 + r * sin((i * TAU) / n),
      135 - r * cos((i * TAU) / n),
    ]);
  put("polygons", [int("Sides", "Seiten", 3, 12, 5)], (s, [n], f, t) => {
    const v = ring(s, n);
    s.poly([...v, v[0]], "violet", 3, "violet", 0.22);
    v.forEach((p) => s.dot(...p, 6, "mint"));
    return t(`${n} sides · ${n} vertices`, `${n} Seiten · ${n} Ecken`);
  });
  put(
    "money",
    [
      int("Euros", "Euro", 0, 9, 2),
      int("Extra cents", "Zusätzliche Cent", 0, 99, 50),
    ],
    (s, [a, b], f) => {
      columns(s, [100 * a, b], [`${a} €`, `${b} ct`], {
        colors: ["violet", "mint"],
        ceiling: max(100, 100 * a),
      });
      return `${a} € + ${b} ct = ${a * 100 + b} ct = ${f(a + b / 100, 2)} €`;
    },
  );
  put(
    "prime-factorization",
    [int("Integer", "Ganze Zahl", 2, 100, 60)],
    (s, [n]) => {
      const v = [];
      let a = n;
      for (let d = 2; d <= a; d++)
        while (a % d === 0) {
          a /= d;
          v.push(d);
        }
      flow(s, [n, v.join(" × ")]);
      return `${n} = ${v.join(" × ")}`;
    },
  );
  put(
    "coordinate-grid",
    [
      int("Horizontal x", "Waagerechtes x", -5, 5, -2),
      int("Vertical y", "Senkrechtes y", -5, 5, 3),
    ],
    (s, [x, y]) => {
      const p = plot(s, [-6, 6], [-6, 6], "x", "y", true);
      p.arrow(0, 0, x, 0, "blue");
      p.arrow(x, 0, x, y, "violet");
      p.points([[x, y]]);
      return `P = (${x}, ${y})`;
    },
  );
  put("inverse-functions", [at], (s, [x], f) => {
    const p = plot(s, [-7, 7], [-7, 7], "x", "y", true);
    p.curve((z) => z, "blue");
    p.curve((z) => 2 * z + 1);
    p.curve((z) => (z - 1) / 2, "mint");
    p.points([
      [x, 2 * x + 1],
      [2 * x + 1, x],
    ]);
    return `f(${f(x)}) = ${f(2 * x + 1)} · f⁻¹(${f(2 * x + 1)}) = ${f(x)}`;
  });
  put(
    "law-cosines",
    [int("Included angle γ", "Eingeschlossener Winkel γ", 15, 170, 90)],
    (s, [a], f) => {
      const t = (a * PI) / 180,
        p = plot(s, [-5, 5], [-0.75, 4.75], "x", "y", true);
      p.area(
        [
          [0, 0],
          [3, 0],
          [4 * cos(t), 4 * sin(t)],
          [0, 0],
        ],
        "violet",
      );
      p.line(3, 0, 4 * cos(t), 4 * sin(t), "mint");
      return `γ = ${a}° · c ≈ ${f(sqrt(25 - 24 * cos(t)))}`;
    },
  );
  put(
    "permutations",
    [int("Distinct objects", "Verschiedene Objekte", 1, 8, 3)],
    (s, [n]) => {
      const values = series(n, (i) => n - i);
      columns(
        s,
        values,
        values.map((v, i) => i + 1),
        { ceiling: 8, colors: ["violet", "blue"] },
      );
      return `${n}! = ${values.join(" × ")} = ${values.reduce((a, b) => a * b, 1)}`;
    },
  );
  put(
    "z-score",
    [int("Observation", "Beobachtung", 20, 80, 70)],
    (s, [x], f) => {
      const p = plot(s, [-3.5, 3.5], [0, 0.43], "z", "f"),
        z = (x - 50) / 10;
      const density = (z) => exp((-z * z) / 2) / sqrt(2 * PI);
      p.curve(density);
      p.line(z, 0, z, density(z), "mint", true);
      p.points([[z, density(z)]]);
      return `x = ${x} · μ = 50 · σ = 10 · z = ${f(z)}`;
    },
  );
  put("product-rule", [real("Input x", "Eingabe x", -2, 2, 1)], (s, [x], f) => {
    const p = plot(s, [-2, 2], [-0.5, 15]);
    p.curve((z) => z * exp(z));
    p.curve((z) => x * exp(x) + (x + 1) * exp(x) * (z - x), "mint");
    p.points([[x, x * exp(x)]]);
    return `u′v = ${f(exp(x))} · uv′ = ${f(x * exp(x))} · (uv)′ = ${f((1 + x) * exp(x))}`;
  });
  put(
    "substitution",
    [real("Upper bound", "Obere Grenze", 0, 2, 1)],
    (s, [b], f) => {
      const p = plot(s, [0, 2], [-4, 2]);
      p.curve((x) => 2 * x * cos(x * x));
      p.points([[b, 2 * b * cos(b * b)]]);
      p.line(b, 0, b, 2 * b * cos(b * b), "mint", true);
      return `u = b² = ${f(b * b)} · ∫₀ᵇ 2x cos(x²) dx = ${f(sin(b * b))}`;
    },
  );
  function field(id, curl) {
    put(
      id,
      [real("Field strength a", "Feldstärke a", -2, 2, 1, 0.25)],
      (s, [a], f) => {
        const p = plot(s, [-4, 4], [-4, 4], "x", "y", true);
        for (let x = -2; x <= 2; x++)
          for (let y = -2; y <= 2; y++) {
            if (x === 0 && y === 0) continue;
            p.arrow(
              x,
              y,
              x + 0.29 * a * (curl ? -y : x),
              y + 0.29 * a * (curl ? x : y),
              "violet",
            );
          }
        p.points([[0, 0]]);
        return `${curl ? "curl F" : "∇ · F"} = ${f(2 * a)}`;
      },
    );
  }
  field("divergence", false);
  field("curl", true);
  put(
    "svd",
    [
      real(
        "Horizontal singular value",
        "Waagerechter Singulärwert",
        0,
        3.5,
        3,
        0.25,
      ),
      real(
        "Vertical singular value",
        "Senkrechter Singulärwert",
        0,
        3.5,
        1,
        0.25,
      ),
    ],
    (s, [a, b], f) => {
      const p = plot(s, [-4, 4], [-4, 4], "x", "y", true);
      p.path(
        series(81, (i) => [cos((TAU * i) / 80), sin((TAU * i) / 80)]),
        "blue",
      );
      p.path(
        series(81, (i) => [a * cos((TAU * i) / 80), b * sin((TAU * i) / 80)]),
        "mint",
      );
      p.points([
        [a, 0],
        [0, b],
      ]);
      return `σ₁ = ${f(max(a, b))} · σ₂ = ${f(min(a, b))}`;
    },
  );
  put("orthogonal-projection", [angle], (s, [a], f) => {
    const p = plot(s, [-5, 5], [-5, 5], "x", "y", true),
      x = cos((a * PI) / 180),
      y = sin((a * PI) / 180),
      q = 2 * x + 3 * y;
    p.line(-4 * x, -4 * y, 4 * x, 4 * y, "blue");
    p.arrow(0, 0, 2, 3, "violet");
    p.arrow(0, 0, q * x, q * y, "mint");
    p.line(q * x, q * y, 2, 3, "mint", true);
    return `Pv = (${f(q * x)}, ${f(q * y)})`;
  });
  put(
    "confidence-interval",
    [int("Sample size", "Stichprobengröße", 4, 144, 100)],
    (s, [n], f) => {
      const m = (1.959964 * 2) / sqrt(n),
        p = plot(s, [7.8, 12.2], [0, 1], "μ", "");
      p.line(10 - m, 0.5, 10 + m, 0.5, "violet");
      p.points([
        [10 - m, 0.5],
        [10, 0.5],
        [10 + m, 0.5],
      ]);
      return `[${f(10 - m)} ; ${f(10 + m)}] · 95 %`;
    },
  );
  put(
    "hypothesis-test",
    [real("Observed z", "Beobachtetes z", 0, 3.6, 1.96, 0.02)],
    (s, [z], f) => {
      const p = plot(s, [-4, 4], [0, 0.43], "z", "f"),
        density = (x) => exp((-x * x) / 2) / sqrt(2 * PI);
      const a = series(70, (i) => z + ((4 - z) * i) / 69);
      p.curve(density);
      p.area(
        [[z, 0], ...a.map((x) => [x, density(x)]), [4, 0], [z, 0]],
        "mint",
      );
      p.area(
        [[-z, 0], ...a.map((x) => [-x, density(x)]), [-4, 0], [-z, 0]],
        "mint",
      );
      let area = 0;
      for (let i = 1; i < a.length; i++)
        area += (density(a[i - 1]) + density(a[i])) * (a[i] - a[i - 1]);
      return `p ≈ ${f(area + 0.00006334, 4)}`;
    },
  );
  put(
    "jensen",
    [real("Right input", "Rechte Eingabe", 1, 4, 3, 0.1)],
    (s, [b], f) => {
      const p = plot(s, [0, 4], [0, 16.5]),
        m = (1 + b) / 2,
        q = (1 + b * b) / 2;
      p.curve((x) => x * x);
      p.line(1, 1, b, b * b, "blue");
      p.points([
        [m, m * m],
        [m, q],
      ]);
      p.line(m, m * m, m, q, "mint", true);
      return `f(E[X]) = ${f(m * m)} ≤ ${f(q)} = E[f(X)]`;
    },
  );
  put(
    "rings",
    [
      int("First factor", "Erster Faktor", 1, 5, 2),
      int("Second factor", "Zweiter Faktor", 1, 5, 3),
    ],
    (s, [a, b]) => {
      tiles(
        s,
        5,
        5,
        (i, j) => [
          i + 1 === b && j + 1 === a ? "mint" : "grid",
          ((i + 1) * (j + 1)) % 6,
        ],
        { type: "rect" },
      );
      return `${a} × ${b} ≡ ${(a * b) % 6} (mod 6)`;
    },
  );
  put(
    "graph-shortest-path",
    [int("Direct cost", "Direkte Kosten", 1, 12, 7)],
    (s, [c]) => {
      const A = [160, 194],
        B = [360, 60],
        C = [560, 194],
        through = c >= 5;
      s.arrow(...A, ...B, through ? "mint" : "violet");
      s.arrow(...B, ...C, through ? "mint" : "violet");
      s.arrow(...A, ...C, c <= 5 ? "mint" : "violet");
      for (const [pt, v] of [
        [A, "A"],
        [B, "B"],
        [C, "C"],
      ]) {
        s.dot(...pt, 17, "grid");
        s.label(pt[0], pt[1] + 6, v);
      }
      s.label(235, 107, 2);
      s.label(478, 107, 3);
      s.label(360, 226, c);
      return `d(A,C) = min(${c}, 2 + 3) = ${min(c, 5)}`;
    },
  );
  put(
    "time-series",
    [real("Coefficient φ", "Koeffizient φ", -0.95, 0.95, 0.5, 0.05)],
    (s, [a], f) => {
      const p = plot(s, [0, 12], [-1.05, 1.05], "t", "response"),
        pts = series(13, (i) => [i, a ** i]);
      p.path(pts);
      p.points(pts);
      return `ψ₁ = ${f(a)} · ψ₂ = ${f(a * a)} · ψ₅ = ${f(a ** 5)}`;
    },
  );
  put(
    "brownian-motion",
    [real("Elapsed time", "Vergangene Zeit", 0.5, 8, 4, 0.25)],
    (s, [t], f) => {
      const p = plot(s, [-9, 9], [0, 0.6], "ΔW", "f"),
        d = sqrt(t);
      p.curve((x) => exp((-x * x) / (2 * t)) / (d * sqrt(2 * PI)));
      p.line(d, 0, d, exp(-0.5) / (d * sqrt(2 * PI)), "mint", true);
      return `Var(ΔW) = ${f(t)} · σ = ${f(d)}`;
    },
  );
  put(
    "monte-carlo",
    [int("Sample count", "Anzahl Stichproben", 4, 90, 35)],
    (s, [n], f) => {
      const p = plot(s, [0, 1], [0, 1.05]),
        values = [];
      let r = 9148;
      for (let i = 0; i < n; i++) {
        r = (Math.imul(r, 1664525) + 1013904223) >>> 0;
        values.push(r / 2 ** 32);
      }
      p.curve((x) => x * x);
      p.points(
        values.map((x) => [x, x * x]),
        "mint",
      );
      return `Iₙ ≈ ${f(sum(values.map((x) => x * x)) / n)} · I = 1/3`;
    },
  );
  put("backpropagation", [at], (s, [w], f) => {
    flow(
      s,
      [`w = ${f(w)}`, `z = ${f(2 * w)}`, `L = ${f(4 * w * w)}`],
      ["×2", "z²"],
    );
    return `∂L/∂z = ${f(4 * w)} · ∂z/∂w = 2 · ∂L/∂w = ${f(8 * w)}`;
  });
})();
