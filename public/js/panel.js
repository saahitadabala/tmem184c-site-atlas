/**
 * The information panel.
 *
 * Every site renders the same four evidence sections in the same order, and a
 * section with nothing in it says NA rather than disappearing — so a reader can
 * tell "we looked and there is none" from "nobody filled this in".
 *
 * Rationale, hypothesis and extra evidence are editable in place when the viewer
 * can write to the artifact database; otherwise the same content renders without
 * the controls.
 */

import { GROUPS } from './config.js';
import { EVIDENCE_SECTIONS } from './data/sites.js';
import { SOURCES, datasetsFor } from './data/sources.js';
import { BACKGROUND, CONSERVATION, conservationLine, reliabilityCaveat }
  from './data/conservation.js';
import { Store } from './store.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function link(href, text, cls) {
  const a = document.createElement('a');
  a.className = cls || 'ext';
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = text;
  return a;
}

/** A source card: label, kind, one-line detail, and a link when there is one. */
function sourceCard(key) {
  const s = SOURCES[key];
  if (!s) return null;
  const wrap = el('div', 'src');
  const head = el('div', 'src-head');
  if (s.url) {
    head.appendChild(link(s.url, s.label, 'src-label ext'));
  } else {
    head.appendChild(el('span', 'src-label', s.label));
  }
  head.appendChild(el('span', 'src-kind', s.kind));
  if (s.url && s.exact === false) {
    const q = el('span', 'src-approx', 'search');
    q.title = 'No exact identifier recorded — this is a PubMed search built from the citation.';
    head.appendChild(q);
  }
  wrap.appendChild(head);
  wrap.appendChild(el('div', 'src-detail', s.detail));
  return wrap;
}

function evidenceItem(e) {
  const item = el('div', 'ev');
  item.appendChild(el('div', 'ev-text', e.text));
  if (e.link) {
    const p = el('div', 'ev-link');
    p.appendChild(link(e.link, e.link.replace(/^https?:\/\//, '').slice(0, 58)));
    item.appendChild(p);
  }
  const card = e.source ? sourceCard(e.source) : null;
  if (card) item.appendChild(card);
  return item;
}

function naRow() {
  return el('div', 'na', 'NA');
}

export class EvidencePanel {
  constructor(root) {
    this.root = root;
    this.site = null;
    this.geometry = null;
    this.editing = null;      // {field} while a textarea is open
    this.adding = null;       // section key while the add form is open
  }

  empty(count) {
    this.root.replaceChildren();
    const box = el('div', 'empty');
    box.appendChild(el('h2', null, 'Pick a site'));
    box.appendChild(el('p', null,
      'Click any marker on the structure to see its datasets, conservation, '
      + 'correlations and anything else recorded for it.'));
    box.appendChild(el('p', 'dim', count + ' sites in the registry.'));
    this.root.appendChild(box);
  }

  render(site, geometry) {
    if (site) this.site = site;
    if (geometry) this.geometry = geometry;
    if (!this.site) return;
    const s = this.site;
    const group = GROUPS[s.group] || { label: s.group, color: '#999' };

    this.root.replaceChildren();

    // ---------------------------------------------------------------- header
    const head = el('header', 'site-head');
    const title = el('div', 'site-title');
    const chip = el('span', 'res-chip', s.aa + s.residue);
    chip.style.background = group.color;
    title.appendChild(chip);
    const names = el('div', 'site-names');
    names.appendChild(el('div', 'group-name', group.label));
    names.appendChild(el('div', 'headline', s.headline));
    title.appendChild(names);
    head.appendChild(title);

    // No tag row. The construct name, coordinate provenance and document origin are
    // still carried on every record and still drive the 3D rendering; they are just
    // not surfaced here, so the headline is the only thing above the evidence.
    this.root.appendChild(head);

    // ------------------------------------------------------------ census row
    if (s.ptm) {
      const sec = el('section', 'block');
      sec.appendChild(el('h3', null, 'PTM census'));
      const grid = el('div', 'kv');
      [['Type', s.ptm.type], ['Region', s.ptm.region],
        ['Datasets', String(s.ptm.datasets)], ['Rows', String(s.ptm.rows)],
        ['Localisation', s.ptm.loc]].forEach(([k, v]) => {
        grid.appendChild(el('div', 'k', k));
        grid.appendChild(el('div', 'v', v));
      });
      sec.appendChild(grid);
      this.root.appendChild(sec);
    }

    // ------------------------------------------------------ evidence sections
    EVIDENCE_SECTIONS.forEach((def) => {
      this.root.appendChild(this.renderSection(s, def));
    });

    // ------------------------------------------------- rationale / hypothesis
    this.root.appendChild(this.renderEditable(s, 'rationale', 'Rationale'));
    this.root.appendChild(this.renderEditable(s, 'hypothesis', 'Working hypothesis'));

    // ------------------------------------------------------------- provenance
    const note = Store.noteFor(s.residue);
    if (note && note.updatedAt) {
      const f = el('div', 'edited-note');
      f.textContent = 'Last edited ' + new Date(note.updatedAt).toLocaleString();
      this.root.appendChild(f);
    }

    this.root.scrollTop = 0;
  }

  renderSection(site, def) {
    const sec = el('section', 'block');
    const h = el('div', 'block-head');
    h.appendChild(el('h3', null, def.label));
    if (Store.canWrite) {
      const add = el('button', 'mini-btn', '+ Add');
      add.type = 'button';
      add.addEventListener('click', () => {
        this.adding = this.adding === def.key ? null : def.key;
        this.render();
      });
      h.appendChild(add);
    }
    sec.appendChild(h);

    const items = [];

    if (def.key === 'correlations') {
      const c = site.evidence.correlations;
      if (c) {
        const meta = el('div', 'corr-meta',
          (c.partners ? c.partners.toLocaleString() + ' partners tested' : ''));
        if (c.partners) sec.appendChild(meta);
        sec.appendChild(this.corrTable('Positive', c.positive, 'pos'));
        sec.appendChild(this.corrTable('Negative', c.negative, 'neg'));
        if (c.note) sec.appendChild(el('p', 'corr-note', c.note));
        const card = c.source ? sourceCard(c.source) : null;
        if (card) sec.appendChild(card);
        items.push(true);
      }
    } else if (def.key === 'datasets') {
      (site.evidence.datasets || []).forEach((e) => {
        sec.appendChild(evidenceItem(e));
        items.push(true);
      });
      // the census datasets table, generated from the shared registry
      const ds = datasetsFor(site.aa + site.residue);
      if (ds.length) {
        sec.appendChild(el('h4', null, 'Reporting datasets'));
        const list = el('ul', 'ds-list');
        ds.forEach((d) => {
          const li = el('li');
          li.appendChild(el('span', 'ds-study', d.study));
          if (d.url) li.appendChild(link(d.url, d.acc, 'ds-acc ext'));
          else if (d.acc && d.acc !== '-') li.appendChild(el('span', 'ds-acc', d.acc));
          list.appendChild(li);
        });
        sec.appendChild(list);
        items.push(true);
      }
    } else {
      // Conservation always leads with the generated 1,018-species number, so every
      // site is measured the same way and nothing depends on a hand-typed percentage.
      if (def.key === 'conservation' && CONSERVATION[site.residue]) {
        const c = CONSERVATION[site.residue];
        const item = el('div', 'ev');
        item.appendChild(el('div', 'ev-text', conservationLine(site.residue)));

        const inTail = site.residue > 319;
        const cmp = el('div', 'cons-bg');
        cmp.textContent = 'Matched background, ' + (inTail ? 'tail' : 'membrane core')
          + ': ' + ((inTail ? BACKGROUND.tail : BACKGROUND.core) * 100).toFixed(1)
          + '% mean identity.';
        item.appendChild(cmp);

        const warn = reliabilityCaveat(site.residue);
        if (warn) {
          const w = el('div', 'cons-warn');
          w.textContent = warn;
          item.appendChild(w);
        }
        const card = sourceCard('conserv1018');
        if (card) item.appendChild(card);
        sec.appendChild(item);
        items.push(true);
      }
      (site.evidence[def.key] || []).forEach((e) => {
        sec.appendChild(evidenceItem(e));
        items.push(true);
      });
    }

    // anything the lab added through the page
    Store.extraFor(site.residue, def.key).forEach((e) => {
      const item = evidenceItem(e);
      item.classList.add('ev-added');
      const badge = el('div', 'ev-added-badge', 'added in page');
      item.insertBefore(badge, item.firstChild);
      if (Store.canWrite) {
        const rm = el('button', 'mini-btn mini-danger', 'Remove');
        rm.type = 'button';
        rm.addEventListener('click', async () => {
          await Store.removeEvidence(site.residue, e.at);
          this.render();
        });
        item.appendChild(rm);
      }
      sec.appendChild(item);
      items.push(true);
    });

    if (!items.length) sec.appendChild(naRow());

    if (this.adding === def.key) sec.appendChild(this.addForm(site, def));

    return sec;
  }

  corrTable(label, rows, kind) {
    const wrap = el('div', 'corr');
    wrap.appendChild(el('div', 'corr-label ' + kind, label));
    if (!rows || !rows.length) {
      wrap.appendChild(naRow());
      return wrap;
    }
    const grid = el('div', 'corr-grid');
    rows.forEach((r) => {
      grid.appendChild(el('span', 'corr-gene', r.gene));
      grid.appendChild(el('span', 'corr-r ' + kind,
        (r.r > 0 ? '+' : '') + r.r.toFixed(3)));
    });
    wrap.appendChild(grid);
    return wrap;
  }

  addForm(site, def) {
    const form = el('div', 'add-form');
    form.appendChild(el('div', 'add-title', 'New ' + def.label.toLowerCase() + ' entry'));

    const ta = document.createElement('textarea');
    ta.id = 'add-text-' + site.residue + '-' + def.key;
    ta.rows = 3;
    ta.placeholder = 'What was observed, and in what. Keep it specific.';
    form.appendChild(ta);

    const url = document.createElement('input');
    url.type = 'url';
    url.id = 'add-link-' + site.residue + '-' + def.key;
    url.placeholder = 'Link (PubMed, PRIDE, PDB) — optional';
    form.appendChild(url);

    const row = el('div', 'add-actions');
    const save = el('button', 'xp-btn', 'Save');
    save.type = 'button';
    const msg = el('span', 'add-msg');
    save.addEventListener('click', async () => {
      save.disabled = true;
      msg.textContent = 'Saving…';
      const res = await Store.addEvidence(site.residue, def.key, ta.value, url.value);
      if (res.ok) {
        this.adding = null;
        this.render();
      } else {
        save.disabled = false;
        msg.textContent = res.reason === 'empty' ? 'Write something first.'
          : 'Could not save (' + res.reason + ').';
      }
    });
    const cancel = el('button', 'xp-btn', 'Cancel');
    cancel.type = 'button';
    cancel.addEventListener('click', () => { this.adding = null; this.render(); });
    row.appendChild(save);
    row.appendChild(cancel);
    row.appendChild(msg);
    form.appendChild(row);
    return form;
  }

  renderEditable(site, field, label) {
    const sec = el('section', 'block block-' + field);
    const h = el('div', 'block-head');
    h.appendChild(el('h3', null, label));
    if (Store.isEdited(site, field)) h.appendChild(el('span', 'edited-flag', 'edited'));

    if (Store.canWrite && this.editing !== field) {
      const b = el('button', 'mini-btn', 'Edit');
      b.type = 'button';
      b.addEventListener('click', () => { this.editing = field; this.render(); });
      h.appendChild(b);
    }
    sec.appendChild(h);

    if (this.editing === field) {
      const ta = document.createElement('textarea');
      ta.id = 'edit-' + field + '-' + site.residue;
      ta.rows = 6;
      ta.value = Store.resolve(site, field);
      sec.appendChild(ta);

      const row = el('div', 'add-actions');
      const save = el('button', 'xp-btn', 'Save');
      save.type = 'button';
      const msg = el('span', 'add-msg');
      save.addEventListener('click', async () => {
        save.disabled = true;
        msg.textContent = 'Saving…';
        const res = await Store.saveField(site.residue, field, ta.value);
        if (res.ok) { this.editing = null; this.render(); } else {
          save.disabled = false;
          msg.textContent = 'Could not save (' + res.reason + ').';
        }
      });
      const cancel = el('button', 'xp-btn', 'Cancel');
      cancel.type = 'button';
      cancel.addEventListener('click', () => { this.editing = null; this.render(); });
      const revert = el('button', 'xp-btn', 'Revert to original');
      revert.type = 'button';
      revert.addEventListener('click', async () => {
        await Store.saveField(site.residue, field, '');
        this.editing = null;
        this.render();
      });
      row.appendChild(save);
      row.appendChild(cancel);
      if (Store.isEdited(site, field)) row.appendChild(revert);
      row.appendChild(msg);
      sec.appendChild(row);
    } else {
      sec.appendChild(el('p', null, Store.resolve(site, field)));
    }
    return sec;
  }
}
