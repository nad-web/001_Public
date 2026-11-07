(() => {
  const {
    put,
    knob: k,
    plot,
    columns,
    numberline,
    tiles,
    blocks,
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
    min,
    max,
  } = MathMotion;
  const real = (en, de, min, max, initial, step = 0.1) =>
    k(en, de, min, max, step, initial);
  const int = (en, de, min, max, initial) => real(en, de, min, max, initial, 1);
  const angle = int("Angle in degrees", "Winkel in Grad", 0, 360, 30);
  const slope = real("Slope", "Steigung", -3, 3, 2, 0.25),
    intercept = int("Intercept", "Achsenabschnitt", -5, 5, 3);
  put("line-functions", [slope, intercept], (s, [m, b], f) => {
    const p = plot(s, [-5, 5], [-10, 10]);
    p.curve((x) => m * x + b);
    p.points([
      [0, b],
      [1, m + b],
    ]);
    return `y = ${f(m)}x + (${b})`;
  });
  put(
    "linear-systems",
    [int("Second intercept", "Zweiter Achsenabschnitt", -5, 7, 3)],
    (s, [b], f) => {
      const p = plot(s, [-5, 5], [-7, 9]),
        x = (b - 1) / 2;
      p.curve((x) => x + 1);
      p.curve((x) => b - x, "blue");
      p.points([[x, x + 1]]);
      return `x = ${f(x)}, y = ${f(x + 1)}`;
    },
  );
  put(
    "quadratic",
    [
      real("Stretch", "Streckung", -2, 2, 1, 0.25),
      real("Vertex x", "Scheitel x", -3, 3, 2, 0.25),
      int("Vertex y", "Scheitel y", -4, 4, 1),
    ],
    (s, [a, h, b], f, t) => {
      const p = plot(s, [-6, 6], [-9, 9]);
      p.curve((x) => a * (x - h) ** 2 + b);
      p.points([[h, b]]);
      return a === 0
        ? t(`Constant y = ${b}`, `Konstant y = ${b}`)
        : t(`Vertex (${f(h)}, ${b})`, `Scheitel (${f(h)}, ${b})`);
    },
  );
  put(
    "quadratic-roots",
    [real("Constant term", "Konstanter Term", -4, 9, 6, 0.25)],
    (s, [c], f, t) => {
      const p = plot(s, [-2, 7], [-8, 10]);
      p.curve((x) => x * x - 5 * x + c);
      const d = 25 - 4 * c,
        xs = d >= 0 ? [(5 - sqrt(d)) / 2, (5 + sqrt(d)) / 2] : [];
      p.points(xs.map((x) => [x, 0]));
      return `Δ = ${f(d)} · ${xs.length ? xs.map((fx) => f(fx)).join(" / ") : t("no real roots", "keine reellen Nullstellen")}`;
    },
  );
  put(
    "inequality",
    [
      int("Right side", "Rechte Seite", -14, 14, 6),
      int("Coefficient a", "Koeffizient a", -2, 2, -2),
    ],
    (s, [c, sign], f, t) => {
      const a = sign;
      if (a === 0) {
        s.label(
          360,
          150,
          c > 0
            ? t("All real numbers", "Alle reellen Zahlen")
            : t("No solution", "Keine Lösung"),
          "mint",
          24,
        );
        return `0x < ${c}`;
      }
      const b = c / a;
      numberline(s, -10, 10, 0, b, f);
      const x = 55 + (610 * (b + 10)) / 20;
      s.dot(x, 155, 8, "grid", "mint");
      s.arrow(x + (a < 0 ? 9 : -9), 155, a < 0 ? 672 : 48, 155, "mint");
      return `${a}x < ${c} ⇔ x ${a < 0 ? ">" : "<"} ${f(b)}`;
    },
  );
  put(
    "powers",
    [
      int("First exponent", "Erster Exponent", 0, 6, 2),
      int("Second exponent", "Zweiter Exponent", 0, 6, 3),
    ],
    (s, [a, b]) => {
      const n = a + b;
      if (n > 0)
        tiles(s, n, 1, (i) => [i < a ? "violet" : "blue", "2"], {
          type: "rect",
        });
      else s.label(360, 150, "1", "mint", 32);
      return `2^${a} × 2^${b} = 2^${n} = ${2 ** n}`;
    },
  );
  put(
    "logarithms",
    [int("Base", "Basis", 2, 5, 2), int("Exponent", "Exponent", -2, 4, 3)],
    (s, [b, y], f) => {
      const x = b ** y,
        p = plot(s, [0, max(x * 1.28, 3)], [-3, 5]);
      p.curve((x) => Math.log(x) / Math.log(b));
      p.line(0, y, x, y, "blue", true);
      p.line(x, 0, x, y, "blue", true);
      p.points([[x, y]]);
      return `log_${b}(${f(x)}) = ${y}`;
    },
  );
  put(
    "exponential",
    [
      real("Growth factor", "Wachstumsfaktor", 0.3, 3, 3),
      int("Step", "Schritt", 0, 5, 2),
    ],
    (s, [b, n], f) => {
      const fn = (x) => 2 * b ** x,
        p = plot(s, [0, 5], [0, max(3, fn(5) * 1.1)]);
      p.curve(fn);
      p.points([[n, fn(n)]]);
      return `y(${n}) = ${f(fn(n))}`;
    },
  );
  put(
    "function-composition",
    [
      int("Input x", "Eingabe x", -4, 6, 1),
      int("Addition", "Addition", 0, 7, 3),
    ],
    (s, [x, c]) => {
      flow(s, [x, x + c, 2 * (x + c)], [`+ ${c}`, "× 2"]);
      return `2(${x} + ${c}) = ${2 * (x + c)} · 2 × ${x} + ${c} = ${2 * x + c}`;
    },
  );
  put(
    "arithmetic-series",
    [
      int("Terms", "Glieder", 2, 14, 10),
      int("Common difference", "Differenz", 1, 4, 1),
    ],
    (s, [n, d], f) => {
      const values = series(n, (i) => 1 + i * d);
      columns(
        s,
        values,
        values.map((v, i) => String(i + 1)),
        { colors: ["violet", "blue"], ceiling: 55 },
      );
      return `S = ${n} × (1 + ${values[values.length - 1]})/2 = ${sum(values)}`;
    },
  );
  put(
    "geometric-series",
    [
      real("Ratio", "Quotient", 0.1, 1.3, 0.5, 0.05),
      int("Terms", "Glieder", 1, 12, 4),
    ],
    (s, [r, n], f) => {
      const v = series(n, (i) => r ** i);
      columns(
        s,
        v,
        v.map((_, i) => i + 1),
        { colors: ["violet", "mint"] },
      );
      return `S = ${f(sum(v), 5)}`;
    },
  );
  function circleMode(id, triangle) {
    put(
      id,
      [triangle ? int("Angle in degrees", "Winkel in Grad", 5, 85, 30) : angle],
      (s, [degrees], f) => {
        const t = (degrees * PI) / 180,
          x = cos(t),
          y = sin(t),
          X = 360 + 96 * x,
          Y = 136 - 96 * y;
        s.line(240, 136, 480, 136, "muted", 1);
        s.line(360, 20, 360, 252, "muted", 1);
        if (!triangle) s.dot(360, 136, 96, "grid", "violet");
        s.poly(
          [
            [360, 136],
            [X, 136],
            [X, Y],
            [360, 136],
          ],
          "blue",
          3,
          "violet",
          0.34,
        );
        s.arrow(360, 136, X, Y, "mint");
        s.dot(X, Y, 5, "mint");
        s.label(360, 255, `${degrees}°`, "muted");
        return `cos = ${f(x)} · sin = ${f(y)}`;
      },
    );
  }
  circleMode("trig-ratios", true);
  circleMode("unit-circle", false);
  put(
    "sinusoid",
    [
      real("Amplitude", "Amplitude", 0.5, 3, 1, 0.25),
      real("Frequency", "Frequenz", 0.5, 3, 1, 0.25),
    ],
    (s, [a, w], f) => {
      const p = plot(s, [-6.28, 6.28], [-3.4, 3.4]);
      p.curve((x) => a * sin(w * x));
      return `A = ${f(a)} · T ≈ ${f(TAU / w)}`;
    },
  );
  put(
    "coordinate-distance",
    [
      int("Horizontal change", "Horizontale Differenz", -4, 6, 3),
      int("Vertical change", "Vertikale Differenz", -4, 6, 4),
    ],
    (s, [a, b], f) => {
      const p = plot(s, [-5, 8], [-5, 8], "x", "y", true);
      p.path(
        [
          [1, 1],
          [1 + a, 1],
          [1 + a, 1 + b],
          [1, 1],
        ],
        "violet",
      );
      p.points([
        [1, 1],
        [1 + a, 1 + b],
      ]);
      return `d = √(${a * a} + ${b * b}) ≈ ${f(Math.hypot(a, b))}`;
    },
  );
  put(
    "combinations",
    [
      int("Objects n", "Objekte n", 2, 8, 5),
      int("Selection k", "Auswahl k", 0, 8, 2),
    ],
    (s, [n, x], f) => {
      const c = x;
      for (let i = 0; i <= n; i++)
        for (let j = 0; j <= i; j++) {
          const cx = 360 + (j - i / 2) * 53,
            y = 25 + i * 27,
            active = i === n && j === c;
          if (active) s.dot(cx, y - 5, 16, "violet");
          s.label(
            cx,
            y,
            Math.round(choose(i, j)),
            active ? "ink" : "muted",
            15,
          );
        }
      return `C(${n}, ${c}) = ${Math.round(choose(n, c))}`;
    },
  );
  put(
    "binomial",
    [
      int("Trials", "Versuche", 1, 12, 3),
      real("Success probability", "Erfolgswahrscheinlichkeit", 0, 1, 0.5, 0.05),
    ],
    (s, [n, p], f) => {
      const v = series(
        n + 1,
        (i) => choose(n, i) * p ** i * (1 - p) ** (n - i),
      );
      columns(
        s,
        v,
        v.map((_, i) => i),
        { ceiling: 1 },
      );
      return `E[X] = ${f(n * p)} · Var(X) = ${f(n * p * (1 - p))}`;
    },
  );
  put(
    "variance",
    [int("Third observation", "Dritte Beobachtung", 3, 15, 5)],
    (s, [x], f) => {
      const a = [1, 3, x],
        m = sum(a) / 3,
        v = a.map((y) => (y - m) ** 2);
      columns(s, v, ["(x₁−μ)²", "(x₂−μ)²", "(x₃−μ)²"]);
      return `μ = ${f(m)} · σ² = ${f(sum(v) / 3)} · σ = ${f(sqrt(sum(v) / 3))}`;
    },
  );
  put(
    "derivative",
    [
      real("Point x", "Stelle x", 0.5, 3, 2, 0.05),
      real("Step h", "Schritt h", 0.05, 1.5, 0.8, 0.05),
    ],
    (s, [a, h], f) => {
      const p = plot(s, [-1, 5], [0, 22]);
      p.curve((x) => x * x);
      p.curve((x) => a * a + (2 * a + h) * (x - a), "blue");
      p.curve((x) => a * a + 2 * a * (x - a), "mint");
      p.points([
        [a, a * a],
        [a + h, (a + h) ** 2],
      ]);
      return `Δy/Δx = ${f(2 * a + h)} · f′(x) = ${f(2 * a)}`;
    },
  );
  put("riemann", [int("Rectangles", "Rechtecke", 1, 30, 6)], (s, [n], f) => {
    const p = plot(s, [0, 2], [0, 2.4]),
      h = 2 / n;
    p.curve((x) => x, "mint");
    let a = 0;
    for (let i = 1; i <= n; i++) {
      const x = i * h;
      p.area([
        [x - h, 0],
        [x, 0],
        [x, x],
        [x - h, x],
        [x - h, 0],
      ]);
      a += h * x;
    }
    return `Σ = ${f(a)} · ∫ = 2`;
  });
})();
