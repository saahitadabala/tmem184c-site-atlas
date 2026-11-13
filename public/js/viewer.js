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
   * Recentre on any residue, measured or schematic.
   *
   * 3Dmol's center() takes an atom SELECTION, so it cannot reach the schematic
   * tail residues, which have no atoms. The view vector handles both: elements
   * 0-2 are the model group's position, i.e. the negated centre of rotation, so
   * writing the residue's coordinates there centres on an arbitrary point.
   */
  focusResidue(n) {
    const p = this.allPositions()[n];
    if (!p) return;
    const view = this.viewer.getView().slice();
    view[0] = -p.x;
    view[1] = -p.y;
    view[2] = -p.z;
    this.viewer.setView(view);
    this.viewer.render();
  }

  /**
   * Turn the camera so a residue is not hidden behind the rest of the model.
   * Buried sites - the C157-C159 belt especially - sit directly behind the core
   * from the opening angle and are invisible until the view is rotated, which is
   * not discoverable. Spin about y until the residue is the nearest thing along
   * the view axis, then centre on it.
   */
  revealResidue(n) {
    const p = this.allPositions()[n];
    if (!p) return;
    // the model-space direction the camera looks along, from the view quaternion
    const v = this.viewer.getView();
    const [q0, q1, q2, q3] = [v[4], v[5], v[6], v[7]];
    // rotate (0,0,1) by the inverse quaternion to get the view axis in model space
    const ax = 2 * (q0 * q2 - q3 * q1);
    const az = 1 - 2 * (q0 * q0 + q1 * q1);
    // angle between the residue's x/z bearing and the current view bearing
    const want = Math.atan2(p.x, p.z);
    const have = Math.atan2(ax, az);
    let turn = ((want - have) * 180) / Math.PI;
    while (turn > 180) turn -= 360;
    while (turn < -180) turn += 360;
    this.focusResidue(n);
    if (Math.abs(turn) > 12) this.viewer.rotate(turn, 'y', 600);
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
