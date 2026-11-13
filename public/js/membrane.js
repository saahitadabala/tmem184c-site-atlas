/**
 * The bilayer.
 *
 * Drawn from the measured hydrophobic half-thickness in geometry.json, not from a
 * guess: the same +/-15 A planes used to count transmembrane passes. The two
 * headgroup slabs mark the water interfaces, and an optional ring of lipid
 * spheres reads as a membrane rather than a pair of plates.
 */

import { MEMBRANE } from './config.js';

export function drawMembrane(viewer, geometry, opts) {
  const { halfThickness, headgroup, halfWidth } = geometry.membrane;
  const w = halfWidth + MEMBRANE.padding;
  const shapes = [];

  // hydrophobic core
  shapes.push(viewer.addBox({
    center: { x: 0, y: 0, z: 0 },
    dimensions: { w: w * 2, h: halfThickness * 2, d: w * 2 },
    color: MEMBRANE.coreColor,
    opacity: MEMBRANE.coreOpacity,
  }));

  // the two headgroup planes
  [1, -1].forEach((sign) => {
    shapes.push(viewer.addBox({
      center: { x: 0, y: sign * (halfThickness + headgroup / 2), z: 0 },
      dimensions: { w: w * 2, h: headgroup, d: w * 2 },
      color: MEMBRANE.headColor,
      opacity: MEMBRANE.headOpacity,
    }));
  });

  if (opts && opts.lipids && MEMBRANE.showLipids) {
    const n = MEMBRANE.lipidRows;
    const stepSize = (w * 2) / n;
    for (let i = 0; i <= n; i += 1) {
      for (let j = 0; j <= n; j += 1) {
        const x = -w + i * stepSize;
        const z = -w + j * stepSize;
        // leave the protein footprint clear so lipids never sit inside the bundle
        if (Math.hypot(x, z) < 26) continue;
        [1, -1].forEach((sign) => {
          shapes.push(viewer.addSphere({
            center: { x, y: sign * (halfThickness + headgroup / 2), z },
            radius: MEMBRANE.lipidRadius,
            color: MEMBRANE.lipidColor,
            opacity: MEMBRANE.lipidOpacity,
          }));
        });
      }
    }
  }

  return shapes;
}

/** Side labels, so the orientation is never ambiguous. */
export function drawSideLabels(viewer, geometry) {
  const { halfThickness, halfWidth } = geometry.membrane;
  // hard against the far edge of the sheet, so the text never lands on the bundle
  const x = -(halfWidth + MEMBRANE.padding) * 0.98;
  const out = [];
  const common = {
    fontSize: 15,
    fontColor: '#9fb0cc',
    backgroundColor: '#0e1320',
    backgroundOpacity: 0.55,
    inFront: true,
    alignment: 'center',
  };
  out.push(viewer.addLabel('LUMEN', {
    ...common, position: { x, y: halfThickness + 9, z: 0 },
  }));
  out.push(viewer.addLabel('CYTOSOL', {
    ...common, position: { x, y: -halfThickness - 9, z: 0 },
  }));
  return out;
}
