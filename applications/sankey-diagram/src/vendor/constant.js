// d3-sankey 0.12.3 · Copyright 2015 Mike Bostock · BSD-3-Clause. See LICENSE.
// Modified only to use the local numeric array adapter.
export default function constant(x) {
  return function() {
    return x;
  };
}
