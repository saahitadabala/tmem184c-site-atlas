/**
 * Site markers and picking.
 *
 * One sphere per site, coloured by functional group, sized by whether a construct
 * is proposed, and wrapped in a translucent halo so a small marker is still an
 * easy click target. Sites whose modification is predicted but never observed get
 * a hollow look, so the drawing never implies more evidence than exists.
 */

import { GROUPS, MARKERS, PULSE } from './config.js';

/** '#rrggbb' lifted toward white — the neon core of the glow. */
function neon(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return '#' + [mix((n >> 16) & 255), mix((n >> 8) & 255), mix(n & 255)]
    .map((v) => v.toString(16).padStart(2, '0')).join('');
}

export class MarkerLayer {
  constructor(viewer) {
    this.viewer = viewer;
    this.shapes = [];
    this.labels = [];
    this.glow = [];
    this.onPick = null;
    this.positions = {};
    this._raf = null;
    this._lastFrame = 0;
  }

  clear() {
    this.shapes.forEach((s) => this.viewer.removeShape(s));
    this.labels.forEach((l) => this.viewer.removeLabel(l));
    this.shapes = [];
    this.labels = [];
  }

  /**
   * Pulse the selected marker.
   *
   * The SOLID marker is animated, not just a halo around it: it grows and its
   * colour is lifted toward white on each beat. Translucent shells on their own
   * read as almost nothing against the dark viewport, so they are here only for
   * the bloom.
   *
   * draw() deliberately does not render the selected site's own spheres — this
   * loop owns them — otherwise a static sphere would sit inside the animated one
   * and flatten the effect.
   *
   * 3Dmol has no shape animation, so each frame removes the shapes and adds them
   * back. That is affordable only because the rest of the scene is kept small
   * (see TAILS.tubeStep) and the loop is capped at PULSE.fps.
   */
  startPulse(site, position) {
    this.stopPulse();
    if (!PULSE.enabled || !site || !position) return;
    const base = site.construct ? MARKERS.radiusConstruct : MARKERS.radius;
    const colour = (GROUPS[site.group] || {}).color || '#ffffff';
    const t0 = performance.now();
    const minGap = 1000 / PULSE.fps;
    const pick = () => { if (this.onPick) this.onPick(site.residue); };

    const frame = (now) => {
      this._raf = requestAnimationFrame(frame);
      if (now - this._lastFrame < minGap) return;
      this._lastFrame = now;

      const phase = (Math.sin(((now - t0) / 1000) * Math.PI * 2 / PULSE.periodSec) + 1) / 2;
      this.glow.forEach((s) => this.viewer.removeShape(s));
      this.glow = [];

      // bloom, outermost first so the core draws over it
      for (let i = PULSE.shells.length - 1; i >= 0; i -= 1) {
        const shell = PULSE.shells[i];
        this.glow.push(this.viewer.addSphere({
          center: position,
          radius: base * (shell.scale + phase * shell.pulse),
          color: neon(colour, shell.bright),
          opacity: shell.opacity * (0.3 + 0.7 * phase),
        }));
      }

      // the solid marker: grows, and brightens toward white
      const c = PULSE.core;
      this.glow.push(this.viewer.addSphere({
        center: position,
        radius: base * (1 + c.grow * phase),
        color: neon(colour, c.brightMin + (c.brightMax - c.brightMin) * phase),
        opacity: 1,
        clickable: true,
        callback: pick,
      }));

      this.viewer.render();
    };
    this._raf = requestAnimationFrame(frame);
  }

  stopPulse() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    this.glow.forEach((s) => this.viewer.removeShape(s));
    this.glow = [];
  }

  /**
   * @param sites     site records to draw
   * @param positions residue -> {x,y,z} for every residue (measured + schematic)
   * @param selected  residue number currently selected, or null
   * @param showLabels draw a text label on every marker
   */
  draw(sites, positions, selected, showLabels) {
    this.clear();
    this.stopPulse();
    this.positions = positions;

    sites.forEach((site) => {
      const p = positions[site.residue];
      if (!p) return;

      const group = GROUPS[site.group] || { color: '#999' };
      const isSel = site.residue === selected;
      const base = site.construct ? MARKERS.radiusConstruct : MARKERS.radius;
      const r = base * (isSel ? MARKERS.selectedScale : 1);
      const hollow = site.status !== 'observed';

      // The selected marker is rendered by the pulse loop instead, so that a
      // static sphere does not sit inside the animated one and flatten it.
      if (!(isSel && PULSE.enabled)) {
        // halo: the real click target
        this.shapes.push(this.viewer.addSphere({
          center: p,
          radius: r * MARKERS.haloScale,
          color: group.color,
          opacity: MARKERS.haloOpacity,
          clickable: true,
          callback: () => { if (this.onPick) this.onPick(site.residue); },
        }));

        this.shapes.push(this.viewer.addSphere({
          center: p,
          radius: r,
          color: group.color,
          opacity: hollow ? 0.55 : 1,
          clickable: true,
          callback: () => { if (this.onPick) this.onPick(site.residue); },
        }));
      }

      if (showLabels || isSel) {
        this.labels.push(this.viewer.addLabel(site.aa + site.residue, {
          position: p,
          fontSize: isSel ? MARKERS.labelFont + 3 : MARKERS.labelFont,
          fontColor: isSel ? '#ffffff' : '#d8e0ee',
          backgroundColor: '#0e1320',
          backgroundOpacity: isSel ? 0.9 : MARKERS.labelBackOpacity,
          borderThickness: isSel ? 1 : 0,
          borderColor: group.color,
          inFront: true,
          alignment: 'bottomCenter',
        }));
      }
    });

    const sel = sites.find((s) => s.residue === selected);
    if (sel && positions[sel.residue]) this.startPulse(sel, positions[sel.residue]);
  }
}
