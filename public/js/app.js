/**
 * Bootstrap and wiring. Holds no scientific content and no geometry — it connects
 * the registry, the scene and the panel, and owns the UI state.
 */

import { GROUPS, VIEW } from './config.js';
import { SITES, siteByResidue } from './data/sites.js';
import { Geometry } from './geometry.js';
import { StructureViewer } from './viewer.js';
import { EvidencePanel } from './panel.js';
import { Store } from './store.js';

const ui = {
  activeGroups: new Set(Object.keys(GROUPS)),
  constructsOnly: false,
  selected: null,
};

let scene = null;
let panel = null;

function visibleSites() {
  return SITES.filter((s) => ui.activeGroups.has(s.group)
    && (!ui.constructsOnly || !!s.construct));
}

function syncScene() {
  scene.set({ sites: visibleSites(), selected: ui.selected });
}

function select(residue, pushHash) {
  ui.selected = residue;
  const site = siteByResidue(residue);
  if (site) panel.render(site, Geometry);
  syncScene();
  if (site && pushHash !== false) {
    const want = '#' + site.aa + site.residue;
    if (window.location.hash !== want) window.location.hash = want;
  }
}

/**
 * Sites are addressable by hash — `#W334` opens the page on that site, so a
 * residue can be linked to directly. Only a plain `#name` survives inside an
 * artifact, which is why this is a bare label and not a path or query.
 */
function selectFromHash() {
  const raw = (window.location.hash || '').replace('#', '').trim();
  if (!raw) return false;
  const m = raw.match(/^([A-Za-z])?(\d+)$/);
  if (!m) return false;
  const site = siteByResidue(Number(m[2]));
  if (!site) return false;
  if (!ui.activeGroups.has(site.group)) return false;
  select(site.residue, false);
  scene.focusResidue(site.residue);
  return true;
}

function buildLegend(host) {
  Object.entries(GROUPS).forEach(([key, g]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'legend-chip active';
    b.dataset.group = key;
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = g.color;
    b.appendChild(dot);
    b.appendChild(document.createTextNode(g.label));
    const n = SITES.filter((s) => s.group === key).length;
    const count = document.createElement('span');
    count.className = 'chip-count';
    count.textContent = String(n);
    b.appendChild(count);
    b.addEventListener('click', () => {
      if (ui.activeGroups.has(key)) ui.activeGroups.delete(key);
      else ui.activeGroups.add(key);
      b.classList.toggle('active', ui.activeGroups.has(key));
      syncScene();
    });
    host.appendChild(b);
  });
}


function wireControls() {
  const ex = document.getElementById('exaggeration');
  const exOut = document.getElementById('exaggeration-value');
  ex.addEventListener('input', () => {
    const v = Number(ex.value) / 100;
    exOut.textContent = v.toFixed(2) + '×';
    scene.set({ exaggeration: v, sites: visibleSites(), selected: ui.selected });
  });

  document.getElementById('toggle-labels').addEventListener('change', (e) => {
    scene.set({ showLabels: e.target.checked });
  });
  document.getElementById('toggle-lipids').addEventListener('change', (e) => {
    scene.set({ lipids: e.target.checked });
  });
  document.getElementById('toggle-constructs').addEventListener('change', (e) => {
    ui.constructsOnly = e.target.checked;
    syncScene();
  });
  document.getElementById('color-by').addEventListener('change', (e) => {
    scene.set({ colorBy: e.target.value });
  });
  document.getElementById('reset-view').addEventListener('click', () => {
    scene.resetView();
  });

  window.addEventListener('resize', () => scene.resize());
}

function showProblems(problems) {
  if (!problems.length) return;
  const bar = document.getElementById('problems');
  bar.hidden = false;
  bar.textContent = 'Registry check failed: ' + problems.join('; ');
}

function fail(message) {
  const bar = document.getElementById('problems');
  bar.hidden = false;
  bar.textContent = message;
  const l = document.getElementById('loading');
  if (l) l.hidden = true;
}

async function main() {
  if (!window.$3Dmol) {
    fail('3Dmol.js did not load, so the structure cannot be displayed.');
    return;
  }
  try {
    await Geometry.load();
  } catch (err) {
    fail('Could not load the structure data: ' + err.message);
    return;
  }

  showProblems(Geometry.problems);

  scene = new StructureViewer(document.getElementById('canvas'), Geometry).init();
  panel = new EvidencePanel(document.getElementById('panel'));

  scene.markers.onPick = (residue) => select(residue);
  scene.set({ sites: visibleSites(), selected: null });
  scene.frameAll();
  scene.rememberHome();

  buildLegend(document.getElementById('legend'));
  wireControls();
  panel.empty(SITES.length);

  document.getElementById('loading').hidden = true;

  window.addEventListener('hashchange', selectFromHash);
  selectFromHash();

  /**
   * Small public handle, so the page can be driven from the console or by
   * another tool: SiteAtlas.select(334), SiteAtlas.scene, SiteAtlas.sites.
   */
  window.SiteAtlas = {
    select,
    sites: SITES,
    get selected() { return ui.selected; },
    scene,
    store: Store,
    geometry: Geometry,
  };

  // The shared store arrives later than first paint, and may never arrive. The
  // page is fully usable against the registry either way; when it does connect,
  // re-render whatever is open so edits and added evidence appear.
  Store.init(() => {
    const badge = document.getElementById('store-state');
    if (badge) {
      badge.textContent = Store.statusText;
      badge.classList.toggle('editable', Store.canWrite);
    }
    if (ui.selected !== null) panel.render();
  });

  if (VIEW.spinSpeed) {
    // a single slow quarter turn on load, so the thing reads as 3D immediately
    scene.viewer.rotate(90, 'y', 1200);
  }
}

main();
