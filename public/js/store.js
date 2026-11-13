/**
 * The shared, editable layer.
 *
 * The registry in js/data/sites.js is the starting point. Anything the lab
 * changes in the page — a reworked rationale, a revised hypothesis, a new piece
 * of evidence — is stored in the artifact database instead, keyed by residue, and
 * is visible live to everyone who opens the page.
 *
 * Shape of one document in `siteNotes`, id = the residue number as a string:
 *   {
 *     rationale:  string | null,            null means "use the registry text"
 *     hypothesis: string | null,
 *     extra: [ { section, text, link, by, at } ],
 *     updatedAt: ISO string,
 *     updatedBy: opaque viewer id
 *   }
 *
 * Nothing here throws at the caller. If the capability is unavailable — a
 * signed-out viewer, an older runtime, a view that was not granted it — the page
 * runs read-only against the registry, which is the whole reason the registry
 * ships in the code rather than being seeded into the database.
 */

const COLLECTION = 'siteNotes';
const LOAD_TIMEOUT_MS = 10000;

export const Store = {
  db: null,
  user: null,
  viewerId: null,
  canWrite: false,
  ready: false,
  /** residue (string) -> document body */
  notes: {},
  /** set when the store answered, or when we gave up waiting */
  statusText: 'connecting',
  _onChange: null,
  _unsub: null,
  _timer: null,

  async init(onChange) {
    this._onChange = onChange || (() => {});

    this.db = await window.claude?.use?.('db').catch(() => null) ?? null;
    this.user = await window.claude?.use?.('user').catch(() => null) ?? null;

    if (!this.db) {
      this.statusText = 'read-only (no shared store in this view)';
      this.ready = true;
      this._onChange();
      return this;
    }

    // Gate the editing controls up front on what the platform says, not on a
    // rejection after the fact. A null answer means we were told nothing: keep
    // the controls and let a refused write turn them off.
    try {
      const can = this.user ? await this.user.can('data.write') : null;
      this.canWrite = can === null ? true : can;
      this.viewerId = this.user ? await this.user.id() : null;
    } catch {
      this.canWrite = true;
    }

    this._timer = setTimeout(() => {
      if (!this.ready) {
        this.statusText = 'shared notes not reachable yet';
        this._onChange();
      }
    }, LOAD_TIMEOUT_MS);

    this._unsub = this.db.collection(COLLECTION).onSnapshot(
      (snap) => {
        const next = {};
        snap.docs.forEach((d) => { next[d.id] = d.data() || {}; });
        this.notes = next;
        if (!snap.metadata.fromCache) {
          clearTimeout(this._timer);
          this.ready = true;
          this.statusText = this.canWrite ? 'editable' : 'read-only';
        }
        this._onChange();
      },
      (err) => {
        clearTimeout(this._timer);
        this.ready = true;
        this.canWrite = false;
        this.statusText = 'read-only (' + err.code + ')';
        this._onChange();
      },
    );

    return this;
  },

  noteFor(residue) {
    return this.notes[String(residue)] || null;
  },

  /** Registry value unless the store holds an override. */
  resolve(site, field) {
    const note = this.noteFor(site.residue);
    const v = note ? note[field] : null;
    return (v === null || v === undefined || v === '') ? site[field] : v;
  },

  isEdited(site, field) {
    const note = this.noteFor(site.residue);
    const v = note ? note[field] : null;
    return !!(v !== null && v !== undefined && v !== '' && v !== site[field]);
  },

  extraFor(residue, section) {
    const note = this.noteFor(residue);
    if (!note || !Array.isArray(note.extra)) return [];
    return note.extra.filter((e) => e.section === section);
  },

  /**
   * Write one document. `set` replaces the whole body, so the current body is
   * merged in here; writes are last-writer-wins, which is the right trade for a
   * handful of people editing different sites.
   */
  async _write(residue, patch) {
    if (!this.db || !this.canWrite) return { ok: false, reason: 'read-only' };
    const id = String(residue);
    const body = {
      rationale: null,
      hypothesis: null,
      extra: [],
      ...(this.notes[id] || {}),
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedBy: this.viewerId || 'unknown',
    };
    try {
      await this.db.collection(COLLECTION).doc(id).set(body);
      return { ok: true };
    } catch (err) {
      if (err && err.code === 'invalid_argument') {
        // a well-formed write refused: this viewer cannot write after all
        this.canWrite = false;
        this.statusText = 'read-only';
        this._onChange();
      }
      return { ok: false, reason: (err && err.code) || 'failed' };
    }
  },

  /** Save an edited rationale or hypothesis. Empty string reverts to the registry. */
  saveField(residue, field, value) {
    const v = (value || '').trim();
    return this._write(residue, { [field]: v === '' ? null : v });
  },

  addEvidence(residue, section, text, link) {
    const id = String(residue);
    const existing = (this.notes[id] && this.notes[id].extra) || [];
    const entry = {
      section,
      text: (text || '').trim(),
      link: (link || '').trim() || null,
      by: this.viewerId || 'unknown',
      at: new Date().toISOString(),
    };
    if (!entry.text) return Promise.resolve({ ok: false, reason: 'empty' });
    return this._write(residue, { extra: existing.concat([entry]) });
  },

  removeEvidence(residue, at) {
    const id = String(residue);
    const existing = (this.notes[id] && this.notes[id].extra) || [];
    return this._write(residue, { extra: existing.filter((e) => e.at !== at) });
  },
};
