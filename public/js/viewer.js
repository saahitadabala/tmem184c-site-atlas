/**
 * The 3Dmol scene.
 *
 * Owns the viewer instance and assembles the scene in layers: membrane, measured
 * cartoon, schematic tail tubes, site markers. Everything except the molecular
 * model is a shape, so a rebuild only tears down shapes and labels and leaves the
 * camera and the model untouched — which is what keeps clicking a site from
 * resetting the orientation the user has set up.
 */

import { STRUCTURE, TAILS, VIEW } from './config.js';
import { drawMembrane, drawSideLabels } from './membrane.js';
import { buildTails } from './tail.js';
import { MarkerLayer } from './markers.js';

export class StructureViewer {
  constructor(element, geometry) {
    this.geometry = geometry;
    this.viewer = window.$3Dmol.createViewer(element, {
      backgroundColor: VIEW.background,
      backgroundAlpha: VIEW.backgroundAlpha,
      antialias: true,
    });
    this.model = null;
    this.sceneShapes = [];
    this.sceneLabels = [];
    this.markers = new MarkerLayer(this.viewer);
    this.tailPositions = {};
    this.state = {
      exaggeration: 1.0,
      lipids: true,
      showLabels: false,
      selected: null,
      sites: [],
      colorBy: 'structure',
    };
  }

  /** One-time: load the model and set its representation. */
  init() {
    this.model = this.viewer.addModel(this.geometry.pdb, 'pdb');
    this.applyCartoon();
    return this;
  }

  applyCartoon() {
    this.viewer.setStyle({}, {});
    if (this.state.colorBy === 'plddt') {
      this.viewer.setStyle({}, {
        cartoon: {
          ...STRUCTURE.cartoon,
          colorscheme: { prop: 'b', gradient: 'linear', min: 50, max: 95,
            colors: ['#e4603e', '#f2b544', '#4ec9a7'] },
        },
      });
    } else {
      this.viewer.setStyle({}, {
        cartoon: { ...STRUCTURE.cartoon, color: STRUCTURE.colorMeasured },
      });
    }

    if (STRUCTURE.sidechainSites) {
      const resi = this.state.sites
        .filter((s) => this.geometry.isMeasured(s.residue))
        .map((s) => s.residue);
      if (resi.length) {
        this.viewer.addStyle({ resi }, {
          stick: { radius: STRUCTURE.sidechainRadius, color: '#cfd8e6' },
        });
      }
    }
  }

  /** Positions for every residue: measured from the model, schematic from tail.js */
  allPositions() {
    const out = {};
    const first = this.geometry.measured.first;
    const last = this.geometry.measured.last;
    for (let r = first; r <= last; r += 1) {
      const p = this.geometry.caAt(r);
      if (p) out[r] = p;
    }
    Object.assign(out, this.tailPositions);
    return out;
  }

  /** Rebuild everything that depends on state. Camera is never touched here. */
  rebuild() {
    this.sceneShapes.forEach((s) => this.viewer.removeShape(s));
    this.sceneLabels.forEach((l) => this.viewer.removeLabel(l));
    this.sceneShapes = [];
    this.sceneLabels = [];

    this.sceneShapes.push(...drawMembrane(this.viewer, this.geometry, {
      lipids: this.state.lipids,
    }));
    this.sceneLabels.push(...drawSideLabels(this.viewer, this.geometry));

    const tails = buildTails(this.geometry, this.state.exaggeration);
    this.tailPositions = tails.positions;
    // decimated: drawing every sample would put ~600 cylinders in the scene and
    // make the selected-residue pulse stutter
    const step = Math.max(1, TAILS.tubeStep || 1);
    tails.paths.forEach((path) => {
      for (let i = step; i < path.points.length; i += step) {
        this.sceneShapes.push(this.viewer.addCylinder({
          start: path.points[i - step],
          end: path.points[i],
          radius: path.tube,
          color: path.color,
          fromCap: 1,
          toCap: 1,
        }));
      }
    });

    this.markers.draw(this.state.sites, this.allPositions(),
      this.state.selected, this.state.showLabels);

    this.viewer.render();
  }

  set(partial) {
    const needsCartoon = ('colorBy' in partial) || ('sites' in partial);
    Object.assign(this.state, partial);
    if (needsCartoon) this.applyCartoon();
    this.rebuild();
  }

  /** Frame the whole assembly, including the schematic tails. */
  frameAll() {
    this.viewer.zoomTo();
    this.viewer.zoom(VIEW.initialZoom);
    this.viewer.render();
  }

  /**
   * Recentre on a residue. 3Dmol's center() takes an atom SELECTION, not a point,
   * so this only moves for residues that exist in the model; schematic tail
   * residues have no atoms and are left to the marker highlight alone.
   */
  focusResidue(n) {
    if (!this.geometry.isMeasured(n)) return;
    this.viewer.center({ resi: n }, 350);
    this.viewer.render();
  }

  resetView() {
    this.viewer.setView(this.homeView);
    this.viewer.render();
  }

  rememberHome() {
    this.homeView = this.viewer.getView();
  }

  resize() {
    this.viewer.resize();
    this.viewer.render();
  }
}
