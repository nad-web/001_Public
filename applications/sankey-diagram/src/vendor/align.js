// d3-sankey 0.12.3 · Copyright 2015 Mike Bostock · BSD-3-Clause. See LICENSE.
// Modified only to use the local numeric array adapter.
import {min} from "./array.js";

function targetDepth(d) {
  return d.target.depth;
}

export function left(node) {
  return node.depth;
}

export function right(node, n) {
  return n - 1 - node.height;
}

export function justify(node, n) {
  return node.sourceLinks.length ? node.depth : n - 1;
}

export function center(node) {
  return node.targetLinks.length ? node.depth
      : node.sourceLinks.length ? min(node.sourceLinks, targetDepth) - 1
      : 0;
}
