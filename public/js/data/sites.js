/**
 * THE SITE REGISTRY.
 *
 * This is the file that grows. Everything else in the app is plumbing; this is
 * the content. Add a site by appending one record — the 3D markers, the legend,
 * the filters and the information panel are all generated from this array.
 *
 * EVERY site uses the same four evidence sections, so a new site is filled in by
 * answering the same four questions. A section with nothing in it is left empty
 * and the panel shows NA — an empty section is a real statement, not a gap to
 * paper over.
 *
 *   datasets      proteomics / database observations of the site itself
 *   conservation  what the alignments say
 *   correlations  co-expression or co-modification partners, positive and negative
 *   other         anything site-specific: structure, geometry, co-folding,
 *                 chemistry, topology, motif literature, contradicting reports
 *
 * Record schema
 *   residue    number          position in Q9NVA4 (438 aa)
 *   aa         string          one-letter code, checked against the sequence at load
 *   group      key of GROUPS   which functional story it belongs to
 *   status     key of STATUS   observed | predicted | contested
 *   construct  string | null   the mutant we would make, null if none proposed yet
 *   headline   string          one line
 *   ptm        object | null   the census row, verbatim
 *   evidence   object          the four sections above
 *   rationale  string          why this site is worth mutating
 *   hypothesis string          what we expect the mutant to do
 *
 * `fromDoc: true` marks records transcribed from TM184C_tail_mutants.docx.
 * Records without it came from other analysis and have not been through that
 * document's review.
 *
 * Rationale, hypothesis and extra evidence are editable in the published page and
 * stored in the artifact database; what is written here is the starting point, not
 * the live value. See js/store.js.
 */

export const SITES = [
  // ======================================================= N-terminal acylation
  {
    residue: 3, aa: 'C', group: 'acylation', status: 'observed', construct: 'C3S',
    headline: 'S-acylated, localisation probability 1.0',
    ptm: null,
    evidence: {
      datasets: [
        { text: 'Curated in SwissPalm as S-acylated at localisation probability 1.0.', source: 'thinon2018' },
        { text: 'Protein level: TMEM184C is detected in 13 of 42 human palmitoyl-proteomes across 2012-2023, 8 cell types and ~6 independent chemistries. Zero targeted validation experiments exist.', source: 'swisspalm' },
      ],
      conservation: [
        { text: 'A cysteine in the first 10 residues occurs in 65% of invertebrate TMEM184C versus 9% of A/B/OSTalpha and 11% background. Human MPCTCTWR and Aplysia MECGCILRRWRK share the C-x-C spacing.', source: 'pfam' },
        { text: 'TMEM184A and TMEM184B both lack the motif — the two paralogues that go to the plasma membrane instead of vesicles and that fail to rescue the yeast hfl1 deletion.', source: 'pfam' },
      ],
      correlations: null,
      other: [
        { text: 'Scored High by CSS-Palm and High by PalmPred.', source: 'cssPalm' },
        { text: 'Cytosolic, at y = -29.7 A in the membrane frame. DHHC palmitoyltransferases present their catalytic face to the cytosol, so the site is reachable.', source: 'malinovsky2010' },
        { text: 'C-x-C is classic dual-acylation spacing, the same arrangement as PSD-95 C3/C5.' },
        { text: 'Every detection is proteome-scale, and MPCTCTWR carries two cysteines two residues apart — a hard localisation problem for mass spectrometry even at a reported probability of 1.0.', source: 'swisspalm' },
      ],
    },
    rationale: 'The one acylation site with observed, replicated, site-level support, and it is specific to the C lineage.',
    hypothesis: 'C3S/C5S pushes TMEM184C toward a plasma-membrane, 184A/B-like distribution, losing the vesicular localisation the Nature paper reports.',
  },
  {
    residue: 5, aa: 'C', group: 'acylation', status: 'observed', construct: 'C5S',
    headline: 'S-acylated, two independent chemistries',
    ptm: null,
    evidence: {
      datasets: [
        { text: 'Localisation probability 1.0.', source: 'thinon2018' },
        { text: 'Detected again by a different chemistry (nGF-SPE).', source: 'ji2023' },
      ],
      conservation: [
        { text: 'Second cysteine of the ancient C-x-C pair; see C3. Position-mobile across invertebrates but the spacing is retained.', source: 'pfam' },
      ],
      correlations: null,
      other: [
        { text: 'CSS-Palm High, PalmPred Low.', source: 'cssPalm' },
        { text: 'Sits on the chymotryptic peptide MPCTCTW (1-7), so the site is tractable for targeted MS.' },
      ],
    },
    rationale: 'The only acylation site with two independent detections by different chemistries. Together with C3 it forms the C-x-C pair.',
    hypothesis: 'Tested as the C3S/C5S double, since dual-acylation motifs usually need both cysteines removed to lose the anchor.',
  },

  // ============================================================= cysteine belt
  {
    residue: 157, aa: 'C', group: 'belt', status: 'predicted', construct: 'C157S',
    headline: 'The most conserved cysteine in the protein; in 0 of 42 proteomes',
    ptm: null,
    evidence: {
      datasets: [
        { text: 'Detected in zero of 42 human palmitoyl-proteomes.', source: 'swisspalm' },
        { text: 'Sits on the chymotryptic peptide CCCPPW (157-162). The site is detectable, so the absence is a real negative and not a coverage gap.', source: 'swisspalm' },
      ],
      conservation: [
        { text: 'Part of the belt cysteine run. Ancestrally the cluster is a CC pair; C157 is the first of it.', source: 'pfam' },
      ],
      correlations: null,
      other: [
        { text: 'CSS-Palm High.', source: 'cssPalm' },
        { text: 'y = -10.9 A — inside the bilayer at the cytosolic interface, the position equivalent to OSTalpha’s palmitoylated belt (C160-C167, 14 palmitates modelled).', source: 'pdb9unv' },
        { text: 'A palmitoylation predictor and a metal-site predictor key on the same feature: a solvent-accessible, low-pKa thiolate. A High score does not distinguish them.' },
        { text: 'Already in the freezer as a mutant.', source: 'ipms5160' },
      ],
    },
    rationale: 'The most conserved cysteine in the protein, structurally on the OSTalpha acyl groove, chemically accessible, predicted high-confidence — and never once observed. Either the prediction layer is wrong or something else occupies the thiol.',
    hypothesis: 'If the belt is an acylation site, C157S/C158S changes groove architecture. If it is instead a metal site, the mutant should lose the Zn/Co/Mn rescue of yeast hfl1-delta while leaving localisation intact. The metal reading is ours and untested.',
  },
  {
    residue: 158, aa: 'C', group: 'belt', status: 'predicted', construct: 'C158S',
    headline: 'Second most conserved cysteine; never made',
    ptm: null,
    evidence: {
      datasets: [
        { text: 'Zero of 42 human palmitoyl-proteomes.', source: 'swisspalm' },
      ],
      conservation: [
        { text: 'The belt is ancient: all three cysteines date to Holozoa or Vertebrata, and C157/C158 are among the most conserved residues in the whole protein.' },
      ],
      correlations: null,
      other: [
        { text: 'CSS-Palm High, PalmPred Low.', source: 'cssPalm' },
        { text: 'Adjacent cysteines followed by two prolines (CCCPPW). Cys-Cys pairs with nearby proline are the spacing used by metallothionein and copper-chaperone metal sites; the prolines fix the backbone geometry.' },
        { text: 'The family precedent runs the other way: OSTalpha’s structurally equivalent run is experimentally palmitoylated.', source: 'pdb9unv' },
      ],
    },
    rationale: 'The second most conserved cysteine in the protein, on the substrate groove, and nobody has ever made the mutant.',
    hypothesis: 'C158S is a high-value cysteine construct on conservation grounds alone, independent of which chemistry turns out to be right. On the 1,018-species numbers C157 now outranks it.',
  },
  {
    residue: 159, aa: 'C', group: 'belt', status: 'predicted', construct: null,
    headline: 'Vertebrate innovation — keep out of the triple',
    ptm: null,
    evidence: {
      datasets: [
        { text: 'Zero of 42 human palmitoyl-proteomes.', source: 'swisspalm' },
      ],
      conservation: [
        { text: 'A vertebrate addition to an ancestral CC pair - the least conserved of the three.' },
      ],
      correlations: null,
      other: [
        { text: 'CSS-Palm High.', source: 'cssPalm' },
        { text: 'Do not make the C157/C158/C159 triple: C159 is not part of the ancestral motif, so the triple confounds a conserved element with a recent one.' },
      ],
    },
    rationale: 'Included for completeness because it is part of the CCC run, but it is the least conserved of the three.',
    hypothesis: 'No construct proposed. Mutating it alone would test a vertebrate-specific feature.',
  },

  // ============================================================= ATG8 element
  {
    residue: 326, aa: 'C', group: 'atg8', status: 'contested', construct: 'C326S',
    headline: 'Acylation claimed by one 2026 paper; absent from SwissPalm',
    ptm: null,
    evidence: {
      datasets: [
        { text: 'Reported S-acylated with a C18:1 chain, dataset PXD066568.', source: 'acsChemBio2026' },
        { text: 'Absent from SwissPalm entirely, and predicted by neither CSS-Palm nor PalmPred — both of which do predict C3, C5, C157, C158 and C159.', source: 'swisspalm' },
        { text: 'Thinon 2018 ran a chymotrypsin arm (286 hits) in which the right peptide VQEAEEGSCF (318-327) would have been tractable; TMEM184C appears only in the trypsin list.', source: 'thinon2018' },
      ],
      conservation: [
        { text: 'Ancestrally a C326-C327 cysteine pair; F327 is a vertebrate replacement. C-lineage-specific back to cnidaria, absent from all 38 A/B sequences examined.', source: 'pfam' },
      ],
      correlations: null,
      other: [
        { text: 'The reported mass tag is C[674.4731]. Oleoyl is +264.2453. The arithmetic has not been reconciled, so the C18:1 assignment rests on prose.', source: 'acsChemBio2026' },
        { text: 'C326 is 48 A from the C157/158/159 belt and 26-27 A from OSTalpha’s bound substrate, versus 14 A for C157. The acylated-groove argument therefore belongs to the belt, not to C326.', source: 'pdb9unv' },
        { text: 'The thiol sits in a conserved L68/L71 pocket on TM2/L2. The discriminating residue is V72, hydrophobic in the C lineage and arginine in A/B. The contact recurs in 8 of 8 C-lineage models, but also in Hfl1 with alanine, so the pocket predates the thiol.' },
        { text: 'Chymotrypsin gives a clean 10-mer, VQEAEEGSCF (318-327), so the site is tractable for targeted MS.' },
      ],
    },
    rationale: 'Position 1 of the predicted ATG8 element, and the only candidate acylation site in the tail. Worth a construct because it is the first residue of the element, not because the acylation claim is secure.',
    hypothesis: 'C326S tests whether the element needs an anchored first residue. V72R and V72R/C326S test the pocket independently.',
  },
  {
    residue: 327, aa: 'F', group: 'atg8', status: 'observed', construct: null,
    headline: 'Invariant; the only exposed pair that spans both ATG8 pockets',
    ptm: null, fromDoc: true,
    evidence: {
      datasets: [],
      conservation: [
        { text: 'Ancestrally a cysteine — the second residue of a C326-C327 pair.', source: 'pfam' },
      ],
      correlations: null,
      other: [
        { text: 'F327 and W334 lie 10.7 A apart and are the only exposed pair in the window that can span the two ATG8 pockets (12.14-13.20 A apart across all six human paralogues; spread 1.06 A, pocket backbone RMSD 0.32-0.80 A).', source: 'pdb7yo8' },
        { text: 'The geometric partner of W334, at 10.7 A spacing.' },
      ],
    },
    rationale: 'The second anchor of the pair that the geometry actually supports.',
    hypothesis: 'No construct yet. F327A would test the second anchor of the F327/W334 pair.',
  },
  {
    residue: 330, aa: 'F', group: 'atg8', status: 'observed', construct: 'F330A',
    headline: 'Invariant, but 5.8 A from W334 — too close to span both pockets',
    ptm: null, fromDoc: true,
    evidence: {
      datasets: [],
      conservation: [
        { text: 'The element is absent from TMEM184A and TMEM184B — the paralogues that fail to rescue yeast hfl1-delta — both of which substitute proline-rich sequence.', source: 'pfam' },
      ],
      correlations: null,
      other: [
        { text: 'F330 and W334 lie only 5.8 A apart on the modelled helix and cannot span the two pockets.', source: 'pdb7yo8' },
      ],
    },
    rationale: 'Invariant and in the element, yet the geometry rules out pairing with W334.',
    hypothesis: 'F330A is the informative mutant: if it behaves like W334A, the element is not working through the F327/W334 pair we now favour.',
  },
  {
    residue: 331, aa: 'L', group: 'atg8', status: 'observed', construct: 'L331A',
    headline: 'Placed in a pocket by 3 of 4 co-folding runs',
    ptm: null, fromDoc: true,
    evidence: {
      datasets: [],
      conservation: [
        { text: 'Vertebrate-only by identity, but the position is hydrophobic in the great majority of species.' },
      ],
      correlations: null,
      other: [
        { text: 'Boltz-2 with templates disabled, 19 queries against GABARAPL2 and LC3B, 38 cells. TMEM184C failed register in all four of its cells, but three of the four placed W334 and L331 into the two pockets.', source: 'boltz2' },
        { text: 'Register failed in 4 of 4 cells: the pocket occupancy is observed, the register is not.', source: 'boltz2' },
      ],
    },
    rationale: 'L331 is the residue the co-folding placed into a pocket, and it distinguishes the co-folding register from the sequence-based one.',
    hypothesis: 'L331A distinguishes the co-folding register from the sequence-based one. It is the discriminating mutant.',
  },
  {
    residue: 334, aa: 'W', group: 'atg8', status: 'observed', construct: 'W334A',
    headline: 'The L-site anchor — survives all three methods',
    ptm: null, fromDoc: true,
    evidence: {
      datasets: [],
      conservation: [
        { text: 'The element is absent from TMEM184A and TMEM184B, the paralogues that fail to rescue the yeast hfl1 deletion; both substitute proline-rich sequence.', source: 'pfam' },
      ],
      correlations: null,
      other: [
        { text: 'Pairs with F327 at 10.7 A, matching the 12.14-13.20 A pocket separation.', source: 'pdb7yo8' },
        { text: 'Placed into a pocket by three of four co-folding runs.', source: 'boltz2' },
        { text: 'PDB 7YO8 already shows the SpHfl1 helical AIM binding human GABARAPL2 via a symmetry mate. The pockets transfer to all six human ATG8 paralogues (RMSD < 0.8 A).', source: 'park2023' },
        { text: 'Park 2023 contains no TMEM184C. The SpHfl1 LIR is GABARAPL2-selective (Kd 0.24 uM versus 1.8 and 2.9 uM) and its W-site is dispensable, with F388 not inserted.', source: 'park2023' },
        { text: 'TMEM184C scores 2 of 4 on the mechanism test and never achieves the deep L-site insertion, the same as 184A and 184B.', source: 'boltz2' },
      ],
    },
    rationale: 'W334 is the single residue that consistently appears across conservation, geometry and co-folding. It is the one anchor that survives every method we applied.',
    hypothesis: 'W334 is the L-site anchor. W334A abolishes ATG8 binding.',
  },
  {
    residue: 339, aa: 'I', group: 'atg8', status: 'observed', construct: null,
    headline: 'Fourth invariant residue of the element',
    ptm: null, fromDoc: true,
    evidence: {
      datasets: [],
      conservation: [
        { text: 'Class-conserved rather than identity-conserved: the position is hydrophobic in nearly every species while the exact residue varies between I, V and L.' },
      ],
      correlations: null,
      other: [],
    },
    rationale: 'Completes the set of four invariant element residues.',
    hypothesis: 'None proposed yet.',
  },

  // ============================================================= sorting motifs
  {
    residue: 371, aa: 'E', group: 'sorting', status: 'observed', construct: 'E371A',
    headline: 'Acidic residue of the dileucine motif; specificity control',
    ptm: null, fromDoc: true,
    evidence: {
      datasets: [],
      conservation: [],
      correlations: null,
      other: [
        { text: 'The acidic position of E371-xxx-L375-L376, a canonical [DE]xxxL[LI] acidic dileucine sorting signal.', source: 'bonifacino2003' },
        { text: 'A weaker phenotype than the leucine mutant is expected and is not evidence against the motif, since the leucines contribute the bulk of the binding energy in characterised dileucine motifs.', source: 'bonifacino2003' },
      ],
    },
    rationale: 'A specificity control for the dileucine construct. E371A tests the same motif by a different chemical change, removing the charge rather than the hydrophobic side chains. If both constructs produce the same phenotype, it is improbable that both independently disrupted folding.',
    hypothesis: 'E371A phenocopies LL375/376AA, probably with a weaker effect. This tells us whether the LL375/376AA phenotype is motif-specific or a consequence of perturbing the tail.',
  },
  {
    residue: 375, aa: 'L', group: 'sorting', status: 'observed', construct: 'LL375/376AA',
    headline: 'AP-3 dileucine motif; AP3D1 at 63 spectral counts',
    ptm: null, fromDoc: true,
    evidence: {
      datasets: [
        { text: 'Our IP-MS, report 5160. The top 70 proteins by spectral count in the TMEM184C sample were gated against the CRAPome: 48 passed, 22 failed. AP3D1 was among the survivors.', source: 'ipms5160' },
        { text: 'AP3D1: 0 spectral counts in empty vector, 63 in TMEM184C, present in 26 of 343 controls (7.6%) with a maximum ever seen of 14. Passes at 4.5x over the control ceiling.', source: 'crapome' },
        { text: 'AP3B1, AP3M1 and AP3S1 were not detected. Only the delta subunit was recovered.', source: 'ipms5160' },
      ],
      conservation: [],
      correlations: null,
      other: [
        { text: 'Acidic dileucine motifs are one of the two canonical classes of adaptor-binding sorting signal in membrane proteins.', source: 'bonifacino2003' },
        { text: 'The AP-3 hemicomplex shown to recognise this specific class is delta-sigma3 — delta being the subunit we recovered.', source: 'jcb2003' },
        { text: 'AP-3 delivers transmembrane cargo to lysosomes and lysosome-related organelles; its loss causes Hermansky-Pudlak syndrome type 2.' },
        { text: 'Leucine-to-alanine removes the hydrophobic side chains that insert into the adaptor pocket while leaving the backbone unchanged.' },
        { text: 'In the copper ATPases a dileucine motif is the regulated element of metal-responsive trafficking (ATP7B L1454-L1455), not a metal-binding site itself.' },
      ],
    },
    rationale: 'A canonical motif, a recovered reader subunit that passes a 343-experiment contaminant gate, and a published hemicomplex assignment that matches the subunit we found.',
    hypothesis: 'LL375/376AA loses lysosomal localisation and redistributes, phenocopying delta-tail.',
  },
  {
    residue: 376, aa: 'L', group: 'sorting', status: 'observed', construct: 'LL375/376AA',
    headline: 'Second leucine of the dileucine motif',
    ptm: null, fromDoc: true,
    evidence: {
      datasets: [],
      conservation: [],
      correlations: null,
      other: [
        { text: 'The [LI] position of E371-xxx-L375-L376. Mutated together with L375 as a single construct, so it is not separable in the proposed panel.', source: 'bonifacino2003' },
      ],
    },
    rationale: 'Mutated as part of LL375/376AA. See L375.',
    hypothesis: 'As L375.',
  },

  // ============================================================= PTM sites
  {
    residue: 46, aa: 'T', group: 'phospho', status: 'observed', construct: null,
    headline: 'The only PTM found before TM1',
    ptm: { type: 'Phospho', region: 'N-terminal, before TM1', datasets: 1, rows: 15, loc: '1.00' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '1 dataset, 15 rows, localisation value 1.00. A single dataset and 15 rows is thin.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: null,
      other: [
        { text: 'The only modification site in the census that is not in the C-terminal tail or the mid-protein loop.' },
      ],
    },
    rationale: 'Included for completeness as the only pre-TM1 site.',
    hypothesis: 'None proposed.',
  },
  {
    residue: 147, aa: 'K', group: 'ubiquityl', status: 'observed', construct: null,
    headline: 'Mid-protein ubiquityl site, in bulk cytosol',
    ptm: { type: 'Ubiquityl', region: 'Mid-protein (peptide 137-147)', datasets: 1, rows: 57, loc: 'not reported' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '1 dataset, 57 rows. Localisation probability not reported by the source.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: null,
      other: [
        { text: 'y = -27.9 A — in bulk cytosol, well clear of the bilayer, which is where a ubiquitin ligase can reach it. Independent support that this face is cytosolic.', source: 'malinovsky2010' },
        { text: 'The only ubiquityl site outside the C-terminal tail, and a sequence-verified addition to the census.', source: 'masterPTM' },
      ],
    },
    rationale: 'The only ubiquityl site outside the tail.',
    hypothesis: 'None proposed yet.',
  },
  {
    residue: 236, aa: 'K', group: 'ubiquityl', status: 'contested', construct: null,
    headline: 'In PhosphoSitePlus, in zero of the 24 datasets',
    ptm: { type: 'Ubiquityl', region: 'Mid-protein', datasets: 0, rows: 0, loc: 'n/a' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: 'Appears in PhosphoSitePlus but in zero rows of the 24 primary datasets in our census.', source: 'phosphositeplus' },
      ],
      conservation: [],
      correlations: null,
      other: [],
    },
    rationale: 'Database-only. Appears in no primary dataset in the census.',
    hypothesis: 'None. Treat as unsupported until it appears in primary data.',
  },
  {
    residue: 344, aa: 'S', group: 'phospho', status: 'observed', construct: null,
    headline: 'Four datasets, localisation 1.00',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 4, rows: 104, loc: '1.00' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '4 datasets, 104 rows, localisation 1.00 throughout. Clean localisation but a modest row count next to S417 and S422.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: null,
      other: [],
    },
    rationale: 'One of the better-supported phosphosites by localisation confidence, though not by row count.',
    hypothesis: 'None proposed.',
  },
  {
    residue: 353, aa: 'T', group: 'phospho', status: 'observed', construct: 'T353A',
    headline: '2,249 census rows; strongest single correlate in the analysis',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 1, rows: 2249, loc: 'not reported' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '1 dataset but 2,249 rows of the master spreadsheet.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: {
        partners: 48,
        positive: [
          { gene: 'SPNS1', r: 0.672 }, { gene: 'NUMA1', r: 0.540 }, { gene: 'PEX16', r: 0.539 },
          { gene: 'PKM', r: 0.520 }, { gene: 'ADAM10', r: 0.515 }, { gene: 'TBK1', r: 0.510 },
          { gene: 'GAPDH', r: 0.493 }, { gene: 'WASHC2C', r: 0.483 },
        ],
        negative: [
          { gene: 'MAP4K3', r: -0.482 }, { gene: 'ZBTB14', r: -0.481 }, { gene: 'XPO4', r: -0.477 },
          { gene: 'WAC', r: -0.465 }, { gene: 'WDR13', r: -0.449 }, { gene: 'DIS3L2', r: -0.433 },
          { gene: 'TFAP4', r: -0.432 }, { gene: 'NELFA', r: -0.409 },
        ],
        note: 'SPNS1 +0.672 is the strongest single correlation of any site, and SPNS1 is independently a gated pulldown hit and the number 3 protein correlate. MAP4K3, an amino-acid-sensing mTORC1 activator, is the strongest negative. Only 48 partners were tested.',
        source: 'cptac',
      },
      other: [
        { text: 'SPNS1 localises to lysosomal and late endosomal membranes. Its loss causes lysosomal accumulation of lysophospholipids, enlarged and dysfunctional lysosomes, impaired autophagic flux and lysosome-autophagosome fusion, and altered lysosomal pH regulation.' },
        { text: 'SPNS1 is a gated pulldown hit in our own IP-MS.', source: 'ipms5160' },
      ],
    },
    rationale: 'T353 shows up in 2,249 rows and correlates strongly with SPNS1, which is independently a gated pulldown hit and the number 3 protein correlate. Given the overlap between SPNS1 and TMEM184C biology, T353 is an appropriate mutation.',
    hypothesis: 'Mutation of T353 alters both localisation and function of TMEM184C. Possible involvement in an SPNS1 interaction, or in mTORC1 signalling given the negative correlates.',
  },
  {
    residue: 398, aa: 'Y', group: 'phospho', status: 'contested', construct: null,
    headline: 'In PhosphoSitePlus, in zero of the 24 datasets',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 0, rows: 0, loc: 'n/a' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: 'Appears in PhosphoSitePlus but in zero rows of the 24 primary datasets.', source: 'phosphositeplus' },
      ],
      conservation: [
        { text: 'Not ancient — Y398 is not conserved beyond recent lineages.', source: 'pfam' },
      ],
      correlations: null,
      other: [],
    },
    rationale: 'Database-only. Appears in no primary dataset in the census.',
    hypothesis: 'None. Treat as unsupported.',
  },
  {
    residue: 417, aa: 'S', group: 'phospho', status: 'observed', construct: 'S417A',
    headline: '5 datasets, 2,017 rows; shares a tryptic peptide with S422',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 5, rows: 2017, loc: '0.33 - 1.00' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '5 datasets, 2,017 rows, localisation 0.33 to 1.00. The range reaches down to 0.33, so some assignments are weak.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: {
        partners: 11015,
        positive: [
          { gene: 'CHMP4A', r: 0.665 }, { gene: 'WIPF1', r: 0.655 }, { gene: 'CDV3', r: 0.653 },
          { gene: 'ABI3', r: 0.637 }, { gene: 'GBP4', r: 0.619 }, { gene: 'TANK', r: 0.613 },
          { gene: 'PPP6R1', r: 0.611 }, { gene: 'SYNRG', r: 0.605 },
        ],
        negative: [
          { gene: 'NUP85', r: -0.688 }, { gene: 'COL17A1', r: -0.667 }, { gene: 'CEP68', r: -0.645 },
          { gene: 'SNAI2', r: -0.641 }, { gene: 'NUP160', r: -0.625 }, { gene: 'CNNM1', r: -0.619 },
          { gene: 'MTURN', r: -0.617 }, { gene: 'LMNA', r: -0.616 },
        ],
        note: 'Much of the difference between the S417 and S422 correlate lists is attributable to tissue composition or noise rather than to the sites behaving differently.',
        source: 'cptac',
      },
      other: [
        { text: 'S417 and S422 sit on the same tryptic peptide, which is why both are mutated: isolating them determines which is the true phosphosite.' },
        { text: 'The S417-S422 anti-correlation may be a localisation artefact rather than biology.' },
      ],
    },
    rationale: 'Both S417 and S422 show up across multiple datasets with varying confidence. Since they sit on the same tryptic peptide, it is worth mutating both to understand their isolated functions.',
    hypothesis: 'Isolating the mutations determines the true phosphosite of the tryptic peptide. If the phospho and ubiquitin marks route the protein to different fates, S422A should produce a different localisation from the K-to-R constructs.',
  },
  {
    residue: 422, aa: 'S', group: 'phospho', status: 'observed', construct: 'S422A',
    headline: 'Best-supported phosphosite: 6 datasets, 2,745 rows',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 6, rows: 2745, loc: '0.97 - 1.00' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '6 datasets, 2,745 rows, localisation 0.97 to 1.00 — the highest row count and the tightest localisation range of any site in the census.', source: 'masterPTM' },
      ],
      conservation: [
        { text: 'A simian innovation. The ancestral residue at this position is asparagine.', source: 'pfam' },
      ],
      correlations: {
        partners: 12272,
        positive: [
          { gene: 'BTN2A2', r: 0.477 }, { gene: 'CABLES1', r: 0.455 }, { gene: 'ZNF747', r: 0.439 },
          { gene: 'ANGEL1', r: 0.422 }, { gene: 'RAI1', r: 0.420 }, { gene: 'SNCA', r: 0.412 },
          { gene: 'CXCR5', r: 0.411 }, { gene: 'NEK1', r: 0.407 },
        ],
        negative: [
          { gene: 'ZMYND15', r: -0.503 }, { gene: 'CEBPB', r: -0.499 }, { gene: 'PGD', r: -0.481 },
          { gene: 'DUSP1', r: -0.472 }, { gene: 'PLAU', r: -0.468 }, { gene: 'USF3', r: -0.466 },
          { gene: 'FBXL19', r: -0.463 }, { gene: 'HIF1A', r: -0.463 },
        ],
        note: 'The GATOR1 complex appears in the positive set — 3 of 3 subunits plus the KICSTOR tether SZT2, which is small, specific and lysosomal. Confidence is low: other machinery involving GATOR1 was not correlated.',
        source: 'cptac',
      },
      other: [
        { text: 'Shares a tryptic peptide with S417; see that record.' },
        { text: 'The phospho-S422 by sphingomyelin signal in CPTAC SKCM sits at the 2.2nd percentile but fails FDR.', source: 'cptac' },
      ],
    },
    rationale: 'The best-supported phosphosite in the census by both row count and localisation confidence, and the one with a correlate signal that resists the tissue-composition explanation.',
    hypothesis: 'Isolating S417A from S422A determines the true phosphosite on the shared tryptic peptide, and S422A should localise differently from the K-to-R constructs if phospho and ubiquitin marks route to different fates.',
  },
  {
    residue: 424, aa: 'T', group: 'phospho', status: 'observed', construct: null,
    headline: 'Up 4.39 log2 in mitosis',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 3, rows: 44, loc: '0.00 - 0.98' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '3 datasets, 44 rows, localisation 0.00 to 0.98. The range starts at 0.00, so individual assignments vary widely across datasets.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: null,
      other: [
        { text: 'Panizza 2017 reports T424 up 4.39 log2 in mitosis, BH-adjusted p = 8.8e-05.', source: 'masterPTM' },
        { text: 'The only site in the census with a measured, strongly significant regulation by cell state.' },
      ],
    },
    rationale: 'A 4.39 log2 mitotic increase is not noise. The strongest candidate for a cell-cycle-dependent modification on the tail.',
    hypothesis: 'None proposed yet.',
  },
  {
    residue: 428, aa: 'K', group: 'ubiquityl', status: 'observed', construct: 'K428R',
    headline: 'Most-replicated site in the census: 7 datasets',
    ptm: { type: 'Ubiquityl', region: 'C-terminal tail', datasets: 7, rows: 962, loc: '0.77 - 1.00' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: 'Ubiquityl in 7 datasets, 962 rows, localisation 0.77 to 1.00 — the most replicated site in the census.', source: 'masterPTM' },
        { text: 'Also acetyl: 1 dataset, 15 rows, localisation 1.00. Identification only, with no stoichiometry, so its occupancy is unknown.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: {
        partners: 12488,
        positive: [
          { gene: 'ZBTB26', r: 0.435 }, { gene: 'ETV2', r: 0.405 }, { gene: 'ZNF141', r: 0.398 },
          { gene: 'TCF7L1', r: 0.388 }, { gene: 'SCRIB', r: 0.386 }, { gene: 'APBB1', r: 0.375 },
          { gene: 'C12orf43', r: 0.371 }, { gene: 'MGA', r: 0.366 },
        ],
        negative: [
          { gene: 'IL4R', r: -0.497 }, { gene: 'RASA4', r: -0.472 }, { gene: 'COL13A1', r: -0.464 },
          { gene: 'MYH13', r: -0.425 }, { gene: 'PIGV', r: -0.419 }, { gene: 'IL37', r: -0.410 },
          { gene: 'MOSMO', r: -0.406 }, { gene: 'BMERB1', r: -0.405 },
        ],
        note: 'Positive axis is proliferation, negative axis is immune infiltration. AKT1S1 (PRAS40, an inhibitory mTORC1 subunit) sits in the top 15. The immune axis is tumour infiltration rather than TMEM184C biology.',
        source: 'cptac',
      },
      other: [
        { text: 'Ubiquitin on a membrane protein is a sorting signal as well as a degradation signal; the ESCRT machinery reads it and directs the tagged protein into the lysosomal lumen.', source: 'bonifacino2003' },
        { text: 'This mark and the dileucine motif are two distinct sorting systems operating on the same tail.' },
      ],
    },
    rationale: 'The best-replicated site available for testing one of the two sorting systems on the tail.',
    hypothesis: 'If the two-state hypothesis is correct, K428R/K429R localises differently from S417A/S422A.',
  },
  {
    residue: 429, aa: 'K', group: 'ubiquityl', status: 'observed', construct: 'K429R',
    headline: '5 datasets, but localisation only 0.50-0.61',
    ptm: { type: 'Ubiquityl', region: 'C-terminal tail', datasets: 5, rows: 204, loc: '0.50 - 0.61' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '5 datasets, 204 rows, localisation 0.50 to 0.61.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: null,
      other: [
        { text: 'Adjacent to K428 and mutated with it as the K428R/K429R construct.' },
        { text: 'Localisation values cluster around 0.5-0.6, which is what a search engine returns when it cannot decide between two adjacent lysines. The site may be an artefact of K428 ambiguity.', source: 'masterPTM' },
      ],
    },
    rationale: 'Adjacent to K428. Mutated together because adjacent lysines cannot be confidently distinguished at these localisation values.',
    hypothesis: 'As K428.',
  },
  {
    residue: 432, aa: 'S', group: 'phospho', status: 'observed', construct: null,
    headline: '2 datasets, localisation 0.93-1.00',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 2, rows: 26, loc: '0.93 - 1.00' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '2 datasets, 26 rows, localisation 0.93 to 1.00. Clean localisation, low row count.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: null,
      other: [],
    },
    rationale: 'Clean localisation, low row count.',
    hypothesis: 'None proposed.',
  },
  {
    residue: 434, aa: 'K', group: 'ubiquityl', status: 'observed', construct: 'K434R',
    headline: 'A second, separable ubiquityl site on the same tail',
    ptm: { type: 'Ubiquityl', region: 'C-terminal tail', datasets: 2, rows: 269, loc: 'not a probability' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: 'Ubiquityl in 2 datasets, 269 rows. The reported localisation value is not a probability, so confidence cannot be compared with the other sites.', source: 'masterPTM' },
        { text: 'Also acetyl: 1 dataset, 1 row.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: {
        partners: 12566,
        positive: [
          { gene: 'RBFOX2', r: 0.415 }, { gene: 'TCF7L1', r: 0.410 }, { gene: 'MAGEH1', r: 0.407 },
          { gene: 'BNC1', r: 0.373 }, { gene: 'ASB1', r: 0.373 }, { gene: 'CECR2', r: 0.372 },
          { gene: 'IL17D', r: 0.366 }, { gene: 'TTC28', r: 0.346 },
        ],
        negative: [
          { gene: 'IL4R', r: -0.543 }, { gene: 'RET', r: -0.455 }, { gene: 'PIGV', r: -0.454 },
          { gene: 'CLCNKB', r: -0.411 }, { gene: 'CCR5', r: -0.410 }, { gene: 'UGT1A5', r: -0.403 },
          { gene: 'CLEC10A', r: -0.398 }, { gene: 'SYNGR2', r: -0.397 },
        ],
        note: 'The same two axes as K428, stronger. The immune axis is almost certainly tumour infiltration, not TMEM184C biology.',
        source: 'cptac',
      },
      other: [
        { text: 'Far enough from K428/K429 to be mutated independently, so the two ubiquitin inputs on one tail can be separated.' },
      ],
    },
    rationale: 'A second, separable ubiquityl site on the same tail.',
    hypothesis: 'K434R tested alongside K428R/K429R separates two ubiquitin sorting inputs on one tail.',
  },
  {
    residue: 435, aa: 'S', group: 'phospho', status: 'contested', construct: null,
    headline: 'Only in our own report 5160',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 0, rows: 0, loc: 'n/a' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: 'Comes only from our own report 5160: peptide KEPSDKpSVDS, Xcorr 2.68. It does not exist at all in the 24 public datasets.', source: 'ipms5160' },
      ],
      conservation: [],
      correlations: null,
      other: [
        { text: 'A single peptide from a single internal run, with no public replication.' },
      ],
    },
    rationale: 'Unique to our own data, with no public replication.',
    hypothesis: 'None. Would need independent confirmation first.',
  },
  {
    residue: 438, aa: 'S', group: 'phospho', status: 'observed', construct: null,
    headline: 'The C-terminal residue; 2 datasets',
    ptm: { type: 'Phospho', region: 'C-terminal tail', datasets: 2, rows: 38, loc: '0.93 - 1.00' },
    fromDoc: true,
    evidence: {
      datasets: [
        { text: '2 datasets, 38 rows, localisation 0.93 to 1.00.', source: 'masterPTM' },
      ],
      conservation: [],
      correlations: null,
      other: [
        { text: 'The final residue of the protein.' },
      ],
    },
    rationale: 'The terminal residue carries a well-localised phosphosite.',
    hypothesis: 'None proposed.',
  },
];

/** The four evidence sections, in the order the panel renders them. */
export const EVIDENCE_SECTIONS = [
  { key: 'datasets', label: 'Datasets' },
  { key: 'conservation', label: 'Conservation' },
  { key: 'correlations', label: 'Correlations' },
  { key: 'other', label: 'Other' },
];

export function siteByResidue(n) {
  return SITES.find((s) => s.residue === n) || null;
}
