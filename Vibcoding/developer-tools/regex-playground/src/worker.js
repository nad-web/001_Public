self.onmessage = (event) => {
  try {
    const { pattern, flags, text } = event.data;
    if (
      typeof pattern !== 'string' ||
      pattern.length > 500 ||
      typeof text !== 'string' ||
      text.length > 20000 ||
      typeof flags !== 'string' ||
      flags.length > 10
    )
      throw new Error('Input limit exceeded.');
    const regex = new RegExp(pattern, flags),
      results = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        index: match.index,
        text: match[0],
        groups: match.slice(1).map((value) => value ?? null),
      });
      if (results.length >= 1000) break;
      if (!regex.global && !regex.sticky) break;
      if (match[0] === '') {
        const code = text.codePointAt(regex.lastIndex);
        regex.lastIndex +=
          (regex.unicode || regex.unicodeSets) && code > 0xffff ? 2 : 1;
      }
    }
    self.postMessage({ ok: true, results, truncated: results.length >= 1000 });
  } catch (error) {
    self.postMessage({ ok: false, error: error.message });
  }
};
