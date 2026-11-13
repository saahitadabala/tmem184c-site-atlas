/**
 * The schematic tails.
 *
 * Below the pLDDT cutoff AlphaFold's coordinates carry no information — it draws
 * the distal tail as a 108 A rod, which a 85-residue disordered segment certainly
 * is not. Rather than show that rod, or hide the residues that most of the mutant
 * panel sits on, this module lays them along a designed descending helix.
 *
 * Two properties make the design useful rather than merely decorative:
 *   - residues are placed at even arc length, so spacing is uniform and sites do
 *     not pile up on one another;
 *   - it is obviously a diagram, so nobody mistakes it for measured structure.
 *
 * `exaggeration` scales the path length. 1.0 gives roughly an extended backbone;
 * higher values spread the tail further for legibility.
 */

import { TAILS } from './config.js';

const SAMPLES = 300;

function ease(t) {
  return t * t * (3 - 2 * t);
}

function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
}

/**
 * Dense polyline for one tail: a straight lead-in away from the anchor, then an
 * outward, descending spiral. The spiral starts at the anchor's own radius and
 * angle so the join is smooth rather than kinked.
 */
function polyline(anchor, spec, exaggeration) {
  const ax = anchor[0];
  const ay = anchor[1];
  const az = anchor[2];
  const anchorR = Math.hypot(ax, az) || 1;
  const baseAngle = Math.atan2(az, ax) + spec.startAngle;

  const leadIn = spec.dropLeadIn * exaggeration;
  const drop = spec.dropTotal * exaggeration;
  const radius = spec.radius * exaggeration;

  const pts = [{ x: ax, y: ay, z: az }];
  const headY = ay - leadIn;
  pts.push({ x: ax, y: headY, z: az });

  for (let i = 1; i <= SAMPLES; i += 1) {
    const t = i / SAMPLES;
    const ang = baseAngle + spec.direction * t * spec.turns * Math.PI * 2;
    const r = anchorR + (radius - anchorR) * ease(t);
    pts.push({
      x: Math.cos(ang) * r,
      y: headY - drop * t,
      z: Math.sin(ang) * r,
    });
  }
  return pts;
}

/** cumulative arc length, so residues can be placed at even spacing */
function arcLengths(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i += 1) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
  return cum;
}

function pointAt(pts, cum, target) {
  if (target <= 0) return pts[0];
  const total = cum[cum.length - 1];
  if (target >= total) return pts[pts.length - 1];
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid + 1; else hi = mid;
  }
  const i = Math.max(1, lo);
  const span = cum[i] - cum[i - 1] || 1;
  const f = (target - cum[i - 1]) / span;
  const a = pts[i - 1];
  const b = pts[i];
  return {
    x: a.x + (b.x - a.x) * f,
    y: a.y + (b.y - a.y) * f,
    z: a.z + (b.z - a.z) * f,
  };
}

/**
 * Build both tails.
 * @returns {{positions: Object, paths: Array}} positions maps residue -> {x,y,z};
 *          paths is one entry per tail for drawing the tube.
 */
export function buildTails(geometry, exaggeration) {
  const positions = {};
  const paths = [];

  geometry.schematic.forEach((seg) => {
    const spec = TAILS[seg.name];
    if (!spec) return;

    const residues = [];
    const step = seg.to >= seg.from ? 1 : -1;
    for (let r = seg.from; step > 0 ? r <= seg.to : r >= seg.to; r += step) residues.push(r);
    if (!residues.length) return;

    const pts = polyline(seg.anchor, spec, exaggeration);
    const cum = arcLengths(pts);
    const total = cum[cum.length - 1];

    residues.forEach((r, i) => {
      const f = residues.length === 1 ? 0 : i / (residues.length - 1);
      positions[r] = pointAt(pts, cum, f * total);
    });

    paths.push({
      name: seg.name,
      points: pts,
      color: spec.color,
      tube: spec.tube,
      residues,
      spacing: total / Math.max(1, residues.length - 1),
    });
  });

  return { positions, paths };
}
