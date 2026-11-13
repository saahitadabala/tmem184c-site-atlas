/**
 * Loads the two build artefacts and validates them against each other.
 *
 * The validation matters: the site registry is written by hand with residue
 * numbers, and a one-off numbering error would otherwise put a marker on the
 * wrong residue silently. Every site's expected one-letter code is checked
 * against the sequence from the model, and mismatches are surfaced loudly
 * rather than drawn.
 */

import { DATA } from './config.js';
import { SITES } from './data/sites.js';

export const Geometry = {
  pdb: null,
  meta: null,
  membrane: null,
  measured: null,
  schematic: null,
  ca: null,
  plddt: null,
  sequence: null,
  problems: [],

  async load() {
    const [pdbText, geomJson] = await Promise.all([
      fetch(DATA.pdb).then((r) => {
        if (!r.ok) throw new Error('could not load ' + DATA.pdb);
        return r.text();
      }),
      fetch(DATA.geometry).then((r) => {
        if (!r.ok) throw new Error('could not load ' + DATA.geometry);
        return r.json();
      }),
    ]);

    this.pdb = pdbText;
    this.meta = geomJson.meta;
    this.membrane = geomJson.membrane;
    this.measured = geomJson.measured;
    this.schematic = geomJson.schematic;
    this.ca = geomJson.ca;
    this.plddt = geomJson.plddt;
    this.sequence = geomJson.sequence;
    this.problems = this.validate();
    return this;
  },

  /** residue number -> one-letter code, from the model's own sequence */
  aaAt(n) {
    return this.sequence ? this.sequence[n - 1] : null;
  },

  plddtAt(n) {
    const v = this.plddt[String(n)];
    return v === undefined ? null : v;
  },

  /** true when the residue has measured coordinates rather than a designed path */
  isMeasured(n) {
    return n >= this.measured.first && n <= this.measured.last;
  },

  caAt(n) {
    const v = this.ca[String(n)];
    return v ? { x: v[0], y: v[1], z: v[2] } : null;
  },

  validate() {
    const out = [];
    SITES.forEach((s) => {
      const actual = this.aaAt(s.residue);
      if (!actual) {
        out.push('residue ' + s.residue + ' is outside the model');
      } else if (actual !== s.aa) {
        out.push('site ' + s.aa + s.residue + ' does not match the sequence, which has '
          + actual + s.residue);
      }
    });
    const dupes = {};
    SITES.forEach((s) => { dupes[s.residue] = (dupes[s.residue] || 0) + 1; });
    Object.entries(dupes).filter(([, n]) => n > 1)
      .forEach(([r]) => out.push('residue ' + r + ' appears more than once in the registry'));
    return out;
  },
};
