/**
 * GENERATED FILE - do not hand-edit.
 * Source: build via atg8_helical/gen_conservation.py from the 1,018-species
 * C-lineage alignment in tm184c_conserv2/out/full_aln.fa.
 *
 * Replaces the Pfam PF03619 numbers the registry used to quote. Those came from a
 * 12,832-sequence family-wide alignment that mixes in the A/B lineage, which
 * dilutes C-lineage conservation - the reason C158 previously looked like 59%.
 *
 * Fields per position:
 *   ident   fraction of the 1018 species carrying the human residue
 *   arom    fraction carrying any aromatic (F/W/Y)
 *   greasy  fraction carrying any hydrophobic (F/W/Y/L/I/V/M/A)
 *   rel     column reliability: agreement of two independent pairwise
 *           realignments. Below 0.90 the column itself is not trustworthy and
 *           the panel says so rather than hiding it.
 *   age     oldest clade the residue reconstructs to
 *   top     the three commonest residues in the column, with counts
 */

export const SPECIES_N = 1018;

/** mean identity of the matched background, for "is this better than average" */
export const BACKGROUND = { tail: 0.574, core: 0.766 };

export const CONSERVATION = {
  3: { aa: 'C', n: 558, ident: 0.978, arom: 0.004, greasy: 0.004, rel: 0.52,
       age: 'Vertebrata', top: [["C", 546], ["R", 2], ["F", 2]] },
  5: { aa: 'C', n: 839, ident: 0.803, arom: 0.068, greasy: 0.18, rel: 0.63,
       age: 'Vertebrata', top: [["C", 674], ["L", 62], ["F", 52]] },
  46: { aa: 'T', n: 980, ident: 0.537, arom: 0.01, greasy: 0.104, rel: 0.92,
       age: 'Olfactores', top: [["T", 526], ["D", 158], ["N", 138]] },
  147: { aa: 'K', n: 1013, ident: 0.741, arom: 0.0, greasy: 0.009, rel: 0.95,
       age: 'Holozoa', top: [["K", 751], ["Q", 155], ["S", 49]] },
  157: { aa: 'C', n: 1007, ident: 0.985, arom: 0.007, greasy: 0.007, rel: 0.99,
       age: 'Holozoa', top: [["C", 992], ["W", 4], ["N", 3]] },
  158: { aa: 'C', n: 1007, ident: 0.919, arom: 0.053, greasy: 0.074, rel: 0.99,
       age: 'Holozoa', top: [["C", 925], ["F", 38], ["L", 14]] },
  159: { aa: 'C', n: 1007, ident: 0.674, arom: 0.027, greasy: 0.322, rel: 0.98,
       age: 'Vertebrata', top: [["C", 679], ["L", 238], ["M", 41]] },
  236: { aa: 'K', n: 1004, ident: 0.305, arom: 0.005, greasy: 0.076, rel: 1.0,
       age: 'Holozoa', top: [["R", 597], ["K", 306], ["A", 32]] },
  326: { aa: 'C', n: 1011, ident: 0.836, arom: 0.142, greasy: 0.156, rel: 0.96,
       age: 'Holozoa', top: [["C", 845], ["W", 128], ["F", 13]] },
  327: { aa: 'F', n: 1009, ident: 0.675, arom: 0.758, greasy: 0.812, rel: 0.96,
       age: 'Vertebrata', top: [["F", 681], ["C", 169], ["W", 58]] },
  330: { aa: 'F', n: 1004, ident: 0.937, arom: 0.957, greasy: 0.995, rel: 0.97,
       age: 'Metazoa', top: [["F", 941], ["L", 24], ["W", 20]] },
  331: { aa: 'L', n: 1004, ident: 0.75, arom: 0.032, greasy: 0.908, rel: 0.97,
       age: 'Vertebrata', top: [["L", 753], ["M", 104], ["R", 72]] },
  334: { aa: 'W', n: 1006, ident: 0.887, arom: 0.894, greasy: 0.991, rel: 0.99,
       age: 'Cnidaria+Bilateria', top: [["W", 892], ["L", 49], ["M", 35]] },
  339: { aa: 'I', n: 1013, ident: 0.384, arom: 0.0, greasy: 0.987, rel: 0.99,
       age: 'Gnathostomata', top: [["I", 389], ["V", 350], ["L", 210]] },
  344: { aa: 'S', n: 1012, ident: 0.722, arom: 0.011, greasy: 0.084, rel: 0.98,
       age: 'Gnathostomata', top: [["S", 731], ["K", 76], ["T", 63]] },
  353: { aa: 'T', n: 999, ident: 0.723, arom: 0.004, greasy: 0.016, rel: 0.68,
       age: 'Cnidaria+Bilateria', top: [["T", 722], ["S", 202], ["G", 24]] },
  371: { aa: 'E', n: 990, ident: 0.971, arom: 0.0, greasy: 0.002, rel: 0.8,
       age: 'Holozoa', top: [["E", 961], ["D", 10], ["Q", 5]] },
  375: { aa: 'L', n: 992, ident: 0.984, arom: 0.002, greasy: 0.998, rel: 0.8,
       age: 'Holozoa', top: [["L", 976], ["I", 7], ["V", 4]] },
  376: { aa: 'L', n: 992, ident: 0.821, arom: 0.002, greasy: 0.991, rel: 0.83,
       age: 'Holozoa', top: [["L", 814], ["I", 74], ["V", 73]] },
  398: { aa: 'Y', n: 976, ident: 0.934, arom: 0.954, greasy: 0.965, rel: 0.59,
       age: 'Holozoa', top: [["Y", 912], ["F", 18], ["H", 10]] },
  417: { aa: 'S', n: 718, ident: 0.234, arom: 0.011, greasy: 0.499, rel: 0.45,
       age: 'Amniota', top: [["V", 294], ["S", 168], ["P", 96]] },
  422: { aa: 'S', n: 605, ident: 0.102, arom: 0.002, greasy: 0.036, rel: 0.29,
       age: '-', top: [["N", 431], ["S", 62], ["G", 38]] },
  424: { aa: 'T', n: 565, ident: 0.191, arom: 0.002, greasy: 0.188, rel: 0.36,
       age: 'Tetrapoda', top: [["S", 281], ["T", 108], ["A", 61]] },
  428: { aa: 'K', n: 669, ident: 0.149, arom: 0.003, greasy: 0.052, rel: 0.38,
       age: 'Mammalia', top: [["D", 310], ["K", 100], ["E", 86]] },
  429: { aa: 'K', n: 696, ident: 0.116, arom: 0.009, greasy: 0.468, rel: 0.38,
       age: 'Mammalia', top: [["A", 279], ["K", 81], ["D", 67]] },
  432: { aa: 'S', n: 762, ident: 0.425, arom: 0.003, greasy: 0.27, rel: 0.34,
       age: 'Amniota', top: [["S", 324], ["A", 138], ["T", 91]] },
  434: { aa: 'K', n: 754, ident: 0.613, arom: 0.001, greasy: 0.041, rel: 0.38,
       age: 'Amniota', top: [["K", 462], ["E", 75], ["S", 42]] },
  435: { aa: 'S', n: 642, ident: 0.179, arom: 0.005, greasy: 0.531, rel: 0.38,
       age: 'Mammalia', top: [["A", 322], ["P", 135], ["S", 115]] },
  438: { aa: 'S', n: 889, ident: 0.17, arom: 0.042, greasy: 0.237, rel: 0.15,
       age: 'Mammalia', top: [["K", 318], ["S", 151], ["A", 83]] },
};

/** One plain-language line per position, built from the numbers above. */
export function conservationLine(pos) {
  const c = CONSERVATION[pos];
  if (!c) return null;
  const pct = (x) => (x * 100).toFixed(1) + '%';
  const top = c.top.map((t) => t[0] + ':' + t[1]).join('  ');
  let s = pct(c.ident) + ' of ' + c.n + ' C-lineage species carry the human residue ('
    + c.aa + ').';
  if (c.arom >= 0.5) s += ' ' + pct(c.arom) + ' carry an aromatic.';
  if (c.greasy >= 0.8 && c.arom < 0.5) s += ' ' + pct(c.greasy) + ' carry a hydrophobic.';
  // some tail positions have no reconstructed age at all; say so rather than "-"
  s += c.age && c.age !== '-' ? ' Dates to ' + c.age + '.' : ' No ancestral age reconstructs.';
  s += ' Commonest: ' + top + '.';
  return s;
}

/** Null when the column is reliable; otherwise the caveat to print beside it. */
export function reliabilityCaveat(pos) {
  const c = CONSERVATION[pos];
  if (!c || c.rel >= 0.90) return null;
  return 'Column reliability ' + c.rel.toFixed(2) + ' - two independent realignments '
    + 'disagree about which column this residue belongs to, so treat the numbers above '
    + 'as indicative only.';
}
