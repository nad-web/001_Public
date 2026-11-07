/* Token-preserving JSON grammar, including duplicate member names. */
export function formatJSON(source, space = 2) {
  if (typeof source !== "string" || source.length > 500000)
    throw new Error("Input is limited to 500,000 characters.");
  let i = 0;
  const indent = (depth) => " ".repeat(space * depth),
    ws = () => {
      while (/[\t\r\n ]/.test(source[i] || "~")) i++;
    },
    fail = () => {
      throw new Error("Unexpected token at character " + (i + 1));
    };
  function atom() {
    ws();
    const tail = source.slice(i);
    const match =
      /^(?:"(?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(
        tail,
      );
    if (!match) fail();
    i += match[0].length;
    return match[0];
  }
  function value(depth) {
    if (depth > 150) throw new Error("Nesting is limited to 150 levels.");
    ws();
    const open = source[i];
    if (open !== "{" && open !== "[") return atom();
    i++;
    const close = open === "{" ? "}" : "]",
      parts = [];
    ws();
    if (source[i] === close) {
      i++;
      return open + close;
    }
    while (i < source.length) {
      let item = "";
      if (open === "{") {
        ws();
        if (source[i] !== '"') fail();
        item = atom();
        ws();
        if (source[i++] !== ":") fail();
        item += ":" + (space ? " " : "");
      }
      item += value(depth + 1);
      parts.push(item);
      ws();
      if (source[i] === close) {
        i++;
        return space
          ? open +
              "\n" +
              parts.map((x) => indent(depth + 1) + x).join(",\n") +
              "\n" +
              indent(depth) +
              close
          : open + parts.join(",") + close;
      }
      if (source[i++] !== ",") fail();
    }
    fail();
  }
  const result = value(0);
  ws();
  if (i !== source.length) fail();
  return result;
}
