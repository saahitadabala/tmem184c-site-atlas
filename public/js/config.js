/**
 * Every tunable number lives here. Nothing else in the app hard-codes geometry,
 * colour or sizing, so the look can be retuned without touching render logic.
 *
 * Coordinate frame (set by build/make_geometry.py):
 *   +Y = lumen,  -Y = cytosol,  membrane centred on the origin, units are angstroms.
 */

export const DATA = {
  pdb: 'data/tm184c_core.pdb',
  geometry: 'data/geometry.json',
};

/** Site-group colours. Each group is one functional story. */
export const GROUPS = {
  acylation: { label: 'N-terminal acylation', color: '#f2b544' },
  belt: { label: 'Cysteine belt', color: '#e4603e' },
  atg8: { label: 'ATG8 element', color: '#4ec9a7' },
  sorting: { label: 'Sorting motif', color: '#5a9ff2' },
  phospho: { label: 'Phosphosite', color: '#c285e8' },
  ubiquityl: { label: 'Ubiquityl / acetyl', color: '#7fd4e8' },
};

/** How confident we are that the site is real, and how it is drawn. */
export const STATUS = {
  observed: { label: 'Observed', ring: null },
  predicted: { label: 'Predicted, never observed', ring: 'dashed' },
  contested: { label: 'Contested', ring: 'dashed' },
};

export const STRUCTURE = {
  cartoon: { style: 'oval', thickness: 0.5, arrows: true },
  colorMeasured: '#8d9bb0',
  colorHelix: '#aab6c7',
  sidechainSites: true,
  sidechainRadius: 0.14,
};

export const MEMBRANE = {
  /** drawn slightly wider than the protein so it reads as a continuous sheet */
  padding: 10,
  coreColor: '#2a3550',
  coreOpacity: 0.3,
  headColor: '#48587e',
  headOpacity: 0.55,
  showLipids: true,
  lipidRows: 13,
  lipidRadius: 1.5,
  lipidColor: '#3d4d73',
  lipidOpacity: 0.75,
};

/**
 * The schematic tails. AlphaFold's coordinates below the pLDDT cutoff are not
 * meaningful, so instead of showing a fictional rod we lay the residues along a
 * designed descending helix. It spreads the sites so each one can be clicked,
 * and it is visibly a diagram, which is the honest way to draw an unknown.
 *
 * spacing is angstroms per residue along the path; 3.5 is a realistic extended
 * backbone, higher values exaggerate the tail.
 */
export const TAILS = {
  'C-tail': {
    radius: 40,
    turns: 1.15,
    dropTotal: 34,
    dropLeadIn: 20,
    startAngle: -0.35,
    direction: 1,
    tube: 1.0,
    color: '#6b7794',
  },
  'N-tail': {
    radius: 17,
    turns: 0.55,
    dropTotal: 14,
    dropLeadIn: 9,
    startAngle: 2.6,
    direction: -1,
    tube: 1.0,
    color: '#6b7794',
  },
  /** Draw every Nth sample of the tail polyline. The path is sampled finely for
   *  accurate arc-length placement, but drawing all of it would put ~600 cylinders
   *  in the scene, which makes the per-frame glow animation stutter. */
  tubeStep: 3,
};

/**
 * The pulsing glow on the selected residue.
 *
 * Translucent halo shells alone are nearly invisible against the dark viewport,
 * so the SOLID marker does the work: it grows and brightens toward white on each
 * beat, and the shells only add the bloom around it.
 *
 * core.grow      how much the solid sphere grows, as a fraction of its radius
 * core.brightMin/Max  how far its colour is lifted toward white, 0 = group
 *                     colour, 1 = white
 * shells         bloom around the core, innermost first. scale and pulse are
 *                multiples of the marker radius; bright lifts toward white.
 */
export const PULSE = {
  enabled: true,
  periodSec: 1.3,
  fps: 30,
  core: { grow: 0.42, brightMin: 0.12, brightMax: 0.82 },
  shells: [
    { scale: 1.55, pulse: 0.5, opacity: 0.5, bright: 0.75 },
    { scale: 2.35, pulse: 0.95, opacity: 0.26, bright: 0.55 },
  ],
};

export const MARKERS = {
  radius: 1.95,
  radiusConstruct: 2.5,
  haloScale: 1.5,
  haloOpacity: 0.22,
  selectedScale: 1.35,
  labelFont: 13,
  labelBackOpacity: 0.72,
};

export const VIEW = {
  background: '#0e1320',
  /**
   * Keep this at 1. backgroundAlpha 0 does make the canvas transparent, but in
   * 3Dmol 2.4.0 it also stops the scene drawing at all - the model and every
   * shape stay in the scene and render() succeeds, yet nothing appears. So the
   * portrait is composited OVER the canvas with mix-blend-mode: screen instead
   * of sitting behind it. See .stage::before in app.css.
   */
  backgroundAlpha: 1,
  /** >1 zooms in. zoomTo() frames the whole membrane sheet, which is much wider
   *  than the protein, so the opening view needs pulling back in. */
  initialZoom: 1.4,
  spinSpeed: 0.4,
};
