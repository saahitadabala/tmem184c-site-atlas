/**
 * Citation registry. Sites reference these by key, so a reference is written once
 * and corrected once. Keep `id` stable: site records point at it.
 *
 * LINKS. Where a PMID or accession is recorded, `url` is the exact record. Where
 * only a citation string is known, `url` is a PubMed SEARCH built from that
 * citation — it always resolves and can never point at the wrong paper, which a
 * guessed identifier can. Entries of the second kind are marked `exact: false`
 * so a later pass can upgrade them without re-checking the rest.
 */

const pm = (pmid) => 'https://pubmed.ncbi.nlm.nih.gov/' + pmid + '/';
const search = (q) => 'https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(q);

export const SOURCES = {
  // ---------------------------------------------------------------- our own data
  ipms5160: {
    label: 'Our IP-MS, report 5160',
    detail: 'Cleveland Clinic Proteomics Core, report 5160, 11 April 2024. '
      + '1,307 proteins in the TMEM184C sample, 348 in empty vector.',
    kind: 'internal',
    url: null,
  },
  masterPTM: {
    label: 'MASTER_TMEM184C_PTM.tsv',
    detail: '8,927 rows across 24 public datasets. Site labels are verbatim from '
      + 'each source and deliberately unreconciled.',
    kind: 'internal',
    url: null,
  },

  // ---------------------------------------------------------------- databases
  crapome: {
    label: 'CRAPome v1.0',
    detail: 'Human matrix, 8,861 genes across 343 single-step negative controls. '
      + 'Mellacheruvu et al., Nat Methods 2013;10:730.',
    kind: 'database',
    url: 'https://www.crapome.org/',
    exact: true,
  },
  cptac: {
    label: 'CPTAC-4 melanoma (SKCM)',
    detail: 'PDC000733 phosphoproteome, PDC000735 proteome, PDC000737 ubiquitylome. '
      + '163 tumours with all three layers aligned.',
    kind: 'database',
    url: 'https://pdc.cancer.gov/pdc/study/PDC000733',
    exact: true,
  },
  pfam: {
    label: 'Pfam PF03619',
    detail: 'Full alignment, 12,832 sequences; 33 reviewed entries. Family-wide, so '
      + 'it mixes the A/B lineage in with C.',
    kind: 'database',
    url: 'https://www.ebi.ac.uk/interpro/entry/pfam/PF03619/',
    exact: true,
  },
  conserv1018: {
    label: '1,018-species C-lineage alignment',
    detail: 'One TMEM184C ortholog per species: 673 vertebrate, 335 invertebrate. '
      + 'Column reliability is the agreement of two independent realignments.',
    kind: 'internal',
    url: null,
  },
  swisspalm: {
    label: 'SwissPalm (Q9NVA4)',
    detail: 'TMEM184C appears in 13 of 42 human palmitoyl-proteomes, 10 of 26 '
      + 'articles, 2012-2023, 8 cell types, ~6 independent chemistries. '
      + 'Zero targeted validation experiments.',
    kind: 'database',
    url: 'https://swisspalm.org/proteins/Q9NVA4',
    exact: true,
  },
  uniprot: {
    label: 'UniProt Q9NVA4',
    detail: 'TMEM184C, 438 aa. The reference sequence every residue number here '
      + 'is counted against.',
    kind: 'database',
    url: 'https://www.uniprot.org/uniprotkb/Q9NVA4/entry',
    exact: true,
  },
  alphafold: {
    label: 'AlphaFold AF-Q9NVA4',
    detail: 'The model used for the measured coordinates (residues 22-353).',
    kind: 'database',
    url: 'https://alphafold.ebi.ac.uk/entry/Q9NVA4',
    exact: true,
  },
  phosphositeplus: {
    label: 'PhosphoSitePlus',
    detail: 'Curated PTM database. Lists some sites that appear in none of the '
      + '24 primary datasets in our census.',
    kind: 'database',
    url: 'https://www.phosphosite.org/proteinAction.action?id=12097',
    exact: false,
  },

  // ---------------------------------------------------------------- literature
  bonifacino2003: {
    label: 'Bonifacino & Traub 2003',
    detail: 'Annu Rev Biochem 2003;72:395-447. The two canonical classes of '
      + 'adaptor-binding sorting signal in membrane proteins.',
    kind: 'paper',
    url: search('Bonifacino Traub signals sorting Annu Rev Biochem 2003 72 395'),
    exact: false,
  },
  jcb2003: {
    label: 'J Cell Biol 2003;163:1281',
    detail: 'AP-3 delta-sigma3 hemicomplex recognition of the acidic '
      + '[DE]xxxL[LI] class.',
    kind: 'paper',
    url: search('AP-3 delta sigma3 dileucine J Cell Biol 2003 163 1281'),
    exact: false,
  },
  liu2018: {
    label: 'Liu, Yamasaki et al. 2018',
    detail: 'eLife 2018;7:e41237, PMID 30451685. PDB 6AAF and 6AAG. '
      + 'Lipidation-independent vacuolar functions of Atg8 via Hfl1. Also the '
      + 'source of the Zn/Co/Mn hypersensitivity of Sphfl1-delta.',
    kind: 'paper',
    url: pm('30451685'),
    exact: true,
  },
  park2023: {
    label: 'Park et al. 2023',
    detail: 'Autophagy 2023, PMID 36250672. PDB 7YO8, plus the GABARAPL2 '
      + 'selectivity data (Kd 0.24 uM vs 1.8 and 2.9 uM).',
    kind: 'paper',
    url: pm('36250672'),
    exact: true,
  },
  thinon2018: {
    label: 'Thinon et al. 2018',
    detail: 'PMID 29575903. Alk16 metabolic labelling, LC-MS, hydroxylamine '
      + 'control. Source of the C3 and C5 site assignments at localisation '
      + 'probability 1.0.',
    kind: 'paper',
    url: pm('29575903'),
    exact: true,
  },
  ji2023: {
    label: 'Ji et al. 2023',
    detail: 'PMID 37611173. nGF-SPE. Independent detection of C5.',
    kind: 'paper',
    url: pm('37611173'),
    exact: true,
  },
  nature2026: {
    label: 'Lee, Taylor, Arcuri et al. 2026',
    detail: 'Nature 2026;657:833-843, PMID 42717083. The lab paper.',
    kind: 'paper',
    url: pm('42717083'),
    exact: true,
  },
  malinovsky2010: {
    label: 'Malinovsky et al. 2010',
    detail: 'PMID 20830211. The only wet-lab topology experiment on human '
      + 'TMEM184C: yeast SUC2/HIS4C fusions of five truncations plus EndoH. '
      + 'Six TM helices, both termini cytosolic.',
    kind: 'paper',
    url: pm('20830211'),
    exact: true,
  },
  acsChemBio2026: {
    label: 'ACS Chem Biol 2026',
    detail: 'PMID 42397757, dataset PXD066568. Reports C326 S-acylation with a '
      + 'C18:1 chain. Not yet reflected in SwissPalm.',
    kind: 'paper',
    url: pm('42397757'),
    exact: true,
  },
  pdb7yo8: {
    label: 'PDB 7YO8',
    detail: 'SpHfl1 helical AIM bound to human GABARAPL2 via a symmetry mate.',
    kind: 'structure',
    url: 'https://www.rcsb.org/structure/7YO8',
    exact: true,
  },
  pdb6aaf: {
    label: 'PDB 6AAF / 6AAG',
    detail: 'The Hfl1-Atg8 structures from Liu, Yamasaki et al. 2018.',
    kind: 'structure',
    url: 'https://www.rcsb.org/structure/6AAF',
    exact: true,
  },
  pdb9unv: {
    label: 'PDB 9UNV',
    detail: 'OSTalpha/OSTbeta with taurolithocholate bound and 14 palmitates '
      + 'modelled on the cysteine belt. Supplies the bilayer frame used here.',
    kind: 'structure',
    url: 'https://www.rcsb.org/structure/9UNV',
    exact: true,
  },

  // ---------------------------------------------------------------- predictors
  cssPalm: {
    label: 'CSS-Palm 4.0',
    detail: 'Palmitoylation site predictor. Scores C3, C5, C157, C158 and C159 High.',
    kind: 'prediction',
    url: 'http://csspalm.biocuckoo.org/',
    exact: false,
  },
  palmPred: {
    label: 'PalmPred',
    detail: 'Second palmitoylation predictor, used to check CSS-Palm.',
    kind: 'prediction',
    url: search('PalmPred palmitoylation prediction'),
    exact: false,
  },
  boltz2: {
    label: 'Boltz-2 co-folding',
    detail: 'Templates disabled. 19 queries against GABARAPL2 and LC3B, 38 cells.',
    kind: 'prediction',
    url: 'https://github.com/jwohlwend/boltz',
    exact: true,
  },
};

/** Build a link for a PRIDE or PDC accession string, or null if unrecognised. */
export function accessionUrl(acc) {
  if (!acc || acc === '-') return null;
  const pride = acc.match(/PXD\d+/);
  if (pride) return 'https://www.ebi.ac.uk/pride/archive/projects/' + pride[0];
  const pdc = acc.match(/PDC\d+/);
  if (pdc) return 'https://pdc.cancer.gov/pdc/study/' + pdc[0];
  return null;
}

/** Datasets from Supplementary Table 1, keyed by the sites each one reported. */
export const DATASETS = {
  cptac_phospho: { study: 'CPTAC pan-cancer phosphoproteome', acc: 'PDC000733', sites: ['T353', 'S417', 'S422'] },
  steger2021: { study: 'Steger et al. 2021, Nat Commun (USP7i DIA ubiquitinome)', acc: '-', sites: ['K147', 'K428', 'K429'] },
  cptac_skcm_ubi: { study: 'CPTAC4 SKCM Discovery Ubiquitylome', acc: 'PDC000737', sites: ['K428', 'K434'] },
  hansen2021: { study: 'Hansen et al. 2021, Nat Commun (DIA diGly, circadian)', acc: '-', sites: ['K428', 'K429'] },
  trulsson2022: { study: 'Trulsson et al. 2022, Nat Commun (UbiSite)', acc: '-', sites: ['K428', 'K429'] },
  pxd068989_meta: { study: 'Harmonized reanalysis of public ubiquitylomes', acc: 'PXD068989', sites: ['K428', 'K429'] },
  prus2024: { study: 'Prus G et al. 2024 Cell (Ub-site occupancy, half-life)', acc: '-', sites: ['K428'] },
  udeshi2020: { study: 'Udeshi ND et al. 2020 Nat Commun (UbiFast)', acc: '-', sites: ['K434'] },
  franciosa2021: { study: 'Franciosa 2021 Nat Commun', acc: 'PXD018744', sites: ['S432', 'S438'] },
  drake2016: { study: 'Drake 2016, Cell (CRPC rapid-autopsy phosphoproteome)', acc: 'PXD002286', sites: ['S344', 'S417'] },
  panizza2017: { study: 'Panizza 2017, Sci Rep', acc: 'PXD005410', sites: ['S344', 'T424'] },
  xiao2022: { study: 'Xiao 2022 Cell Death Dis', acc: '-', sites: ['S432', 'S438'] },
  hein2023: { study: 'Hein 2023 Mol Syst Biol', acc: '-', sites: ['S344', 'S422', 'T424'] },
  akimov2018_ubisite: { study: 'Akimov 2018 UbiSite, Nat Struct Mol Biol', acc: '-', sites: ['K428', 'K429'] },
  zhou2023: { study: 'Zhou 2023 Nat Commun', acc: '-', sites: ['S344'] },
  kitata2021: { study: 'Kitata 2021 Nat Commun', acc: '-', sites: ['S417', 'S422', 'T424'] },
  roolf2017: { study: 'Roolf 2017 Mol Cell Proteomics', acc: 'PXD004442', sites: ['S422'] },
  hansen2019_acetyl: { study: 'Hansen BK et al. 2019 Nat Commun (acetylation stoichiometry)', acc: '-', sites: ['K428'] },
  borisova2018: { study: 'Borisova 2018 Nat Commun', acc: 'PXD004255', sites: ['S417', 'S422'] },
  rolfs2021: { study: 'Rolfs 2021 Mol Cell Proteomics', acc: 'PXD023665', sites: ['T46'] },
  kumar2026: { study: 'Kumar 2026 Astral PTM atlas, Mol Cell Proteomics', acc: 'PXD065579', sites: [] },
  vandeusen2020_pST: { study: 'VanDeusen 2020, Mol Cancer Res (pSer/pThr arm)', acc: 'PXD012970', sites: ['S422'] },
  munoz2018: { study: 'Munoz 2018 EMBO J', acc: 'PXD009374', sites: ['S417'] },
  greenwood2016: { study: 'Greenwood 2016 eLife', acc: 'PXD004187', sites: [] },
};

/** Which datasets reported a given site label. */
export function datasetsFor(siteId) {
  return Object.entries(DATASETS)
    .filter(([, d]) => d.sites.includes(siteId))
    .map(([id, d]) => ({ id, ...d, url: accessionUrl(d.acc) }));
}
