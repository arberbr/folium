export type Category = {
  id: string;
  label: string;
};

export type CategoryGroup = {
  id: string;
  label: string;
  categories: Category[];
};

function cats(...entries: [id: string, label: string][]): Category[] {
  return entries.map(([id, label]) => ({ id, label }));
}

export const FEATURED_IDS = [
  "cs.AI",
  "cs.LG",
  "cs.CL",
  "cs.CV",
  "cs.NE",
  "cs.RO",
  "cs.IR",
  "cs.HC",
  "cs.CR",
  "cs.DS",
  "cs.SE",
  "cs.DC",
  "cs.PL",
  "cs.SY",
] as const;

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "cs",
    label: "Computer Science",
    categories: cats(
      ["cs.AI", "Artificial Intelligence"],
      ["cs.AR", "Hardware Architecture"],
      ["cs.CC", "Computational Complexity"],
      ["cs.CE", "Computational Engineering, Finance, and Science"],
      ["cs.CG", "Computational Geometry"],
      ["cs.CL", "Computation and Language"],
      ["cs.CR", "Cryptography and Security"],
      ["cs.CV", "Computer Vision and Pattern Recognition"],
      ["cs.CY", "Computers and Society"],
      ["cs.DB", "Databases"],
      ["cs.DC", "Distributed, Parallel, and Cluster Computing"],
      ["cs.DL", "Digital Libraries"],
      ["cs.DM", "Discrete Mathematics"],
      ["cs.DS", "Data Structures and Algorithms"],
      ["cs.ET", "Emerging Technologies"],
      ["cs.FL", "Formal Languages and Automata Theory"],
      ["cs.GL", "General Literature"],
      ["cs.GR", "Graphics"],
      ["cs.GT", "Computer Science and Game Theory"],
      ["cs.HC", "Human-Computer Interaction"],
      ["cs.IR", "Information Retrieval"],
      ["cs.IT", "Information Theory"],
      ["cs.LG", "Machine Learning"],
      ["cs.LO", "Logic in Computer Science"],
      ["cs.MA", "Multiagent Systems"],
      ["cs.MM", "Multimedia"],
      ["cs.MS", "Mathematical Software"],
      ["cs.NA", "Numerical Analysis"],
      ["cs.NE", "Neural and Evolutionary Computing"],
      ["cs.NI", "Networking and Internet Architecture"],
      ["cs.OH", "Other Computer Science"],
      ["cs.OS", "Operating Systems"],
      ["cs.PF", "Performance"],
      ["cs.PL", "Programming Languages"],
      ["cs.RO", "Robotics"],
      ["cs.SC", "Symbolic Computation"],
      ["cs.SD", "Sound"],
      ["cs.SE", "Software Engineering"],
      ["cs.SI", "Social and Information Networks"],
      ["cs.SY", "Systems and Control"],
    ),
  },
  {
    id: "econ",
    label: "Economics",
    categories: cats(
      ["econ.EM", "Econometrics"],
      ["econ.GN", "General Economics"],
      ["econ.TH", "Theoretical Economics"],
    ),
  },
  {
    id: "eess",
    label: "Electrical Engineering and Systems Science",
    categories: cats(
      ["eess.AS", "Audio and Speech Processing"],
      ["eess.IV", "Image and Video Processing"],
      ["eess.SP", "Signal Processing"],
      ["eess.SY", "Systems and Control"],
    ),
  },
  {
    id: "math",
    label: "Mathematics",
    categories: cats(
      ["math.AC", "Commutative Algebra"],
      ["math.AG", "Algebraic Geometry"],
      ["math.AP", "Analysis of PDEs"],
      ["math.AT", "Algebraic Topology"],
      ["math.CA", "Classical Analysis and ODEs"],
      ["math.CO", "Combinatorics"],
      ["math.CT", "Category Theory"],
      ["math.CV", "Complex Variables"],
      ["math.DG", "Differential Geometry"],
      ["math.DS", "Dynamical Systems"],
      ["math.FA", "Functional Analysis"],
      ["math.GM", "General Mathematics"],
      ["math.GN", "General Topology"],
      ["math.GR", "Group Theory"],
      ["math.GT", "Geometric Topology"],
      ["math.HO", "History and Overview"],
      ["math.IT", "Information Theory"],
      ["math.KT", "K-Theory and Homology"],
      ["math.LO", "Logic"],
      ["math.MG", "Metric Geometry"],
      ["math.MP", "Mathematical Physics"],
      ["math.NA", "Numerical Analysis"],
      ["math.NT", "Number Theory"],
      ["math.OA", "Operator Algebras"],
      ["math.OC", "Optimization and Control"],
      ["math.PR", "Probability"],
      ["math.QA", "Quantum Algebra"],
      ["math.RA", "Rings and Algebras"],
      ["math.RT", "Representation Theory"],
      ["math.SG", "Symplectic Geometry"],
      ["math.SP", "Spectral Theory"],
      ["math.ST", "Statistics Theory"],
    ),
  },
  {
    id: "astro-ph",
    label: "Astrophysics",
    categories: cats(
      ["astro-ph.CO", "Cosmology and Nongalactic Astrophysics"],
      ["astro-ph.EP", "Earth and Planetary Astrophysics"],
      ["astro-ph.GA", "Astrophysics of Galaxies"],
      ["astro-ph.HE", "High Energy Astrophysical Phenomena"],
      ["astro-ph.IM", "Instrumentation and Methods for Astrophysics"],
      ["astro-ph.SR", "Solar and Stellar Astrophysics"],
    ),
  },
  {
    id: "cond-mat",
    label: "Condensed Matter",
    categories: cats(
      ["cond-mat.dis-nn", "Disordered Systems and Neural Networks"],
      ["cond-mat.mes-hall", "Mesoscale and Nanoscale Physics"],
      ["cond-mat.mtrl-sci", "Materials Science"],
      ["cond-mat.other", "Other Condensed Matter"],
      ["cond-mat.quant-gas", "Quantum Gases"],
      ["cond-mat.soft", "Soft Condensed Matter"],
      ["cond-mat.stat-mech", "Statistical Mechanics"],
      ["cond-mat.str-el", "Strongly Correlated Electrons"],
      ["cond-mat.supr-con", "Superconductivity"],
    ),
  },
  {
    id: "gr-qc",
    label: "General Relativity and Quantum Cosmology",
    categories: cats(["gr-qc", "General Relativity and Quantum Cosmology"]),
  },
  {
    id: "hep",
    label: "High Energy Physics",
    categories: cats(
      ["hep-ex", "Experiment"],
      ["hep-lat", "Lattice"],
      ["hep-ph", "Phenomenology"],
      ["hep-th", "Theory"],
    ),
  },
  {
    id: "math-ph",
    label: "Mathematical Physics",
    categories: cats(["math-ph", "Mathematical Physics"]),
  },
  {
    id: "nlin",
    label: "Nonlinear Sciences",
    categories: cats(
      ["nlin.AO", "Adaptation and Self-Organizing Systems"],
      ["nlin.CD", "Chaotic Dynamics"],
      ["nlin.CG", "Cellular Automata and Lattice Gases"],
      ["nlin.PS", "Pattern Formation and Solitons"],
      ["nlin.SI", "Exactly Solvable and Integrable Systems"],
    ),
  },
  {
    id: "nucl",
    label: "Nuclear Physics",
    categories: cats(["nucl-ex", "Nuclear Experiment"], ["nucl-th", "Nuclear Theory"]),
  },
  {
    id: "physics",
    label: "Physics",
    categories: cats(
      ["physics.acc-ph", "Accelerator Physics"],
      ["physics.ao-ph", "Atmospheric and Oceanic Physics"],
      ["physics.app-ph", "Applied Physics"],
      ["physics.atm-clus", "Atomic and Molecular Clusters"],
      ["physics.atom-ph", "Atomic Physics"],
      ["physics.bio-ph", "Biological Physics"],
      ["physics.chem-ph", "Chemical Physics"],
      ["physics.class-ph", "Classical Physics"],
      ["physics.comp-ph", "Computational Physics"],
      ["physics.data-an", "Data Analysis, Statistics and Probability"],
      ["physics.ed-ph", "Physics Education"],
      ["physics.flu-dyn", "Fluid Dynamics"],
      ["physics.gen-ph", "General Physics"],
      ["physics.geo-ph", "Geophysics"],
      ["physics.hist-ph", "History and Philosophy of Physics"],
      ["physics.ins-det", "Instrumentation and Detectors"],
      ["physics.med-ph", "Medical Physics"],
      ["physics.optics", "Optics"],
      ["physics.plasm-ph", "Plasma Physics"],
      ["physics.pop-ph", "Popular Physics"],
      ["physics.soc-ph", "Physics and Society"],
      ["physics.space-ph", "Space Physics"],
    ),
  },
  {
    id: "quant-ph",
    label: "Quantum Physics",
    categories: cats(["quant-ph", "Quantum Physics"]),
  },
  {
    id: "q-bio",
    label: "Quantitative Biology",
    categories: cats(
      ["q-bio.BM", "Biomolecules"],
      ["q-bio.CB", "Cell Behavior"],
      ["q-bio.GN", "Genomics"],
      ["q-bio.MN", "Molecular Networks"],
      ["q-bio.NC", "Neurons and Cognition"],
      ["q-bio.OT", "Other Quantitative Biology"],
      ["q-bio.PE", "Populations and Evolution"],
      ["q-bio.QM", "Quantitative Methods"],
      ["q-bio.SC", "Subcellular Processes"],
      ["q-bio.TO", "Tissues and Organs"],
    ),
  },
  {
    id: "q-fin",
    label: "Quantitative Finance",
    categories: cats(
      ["q-fin.CP", "Computational Finance"],
      ["q-fin.EC", "Economics"],
      ["q-fin.GN", "General Finance"],
      ["q-fin.MF", "Mathematical Finance"],
      ["q-fin.PM", "Portfolio Management"],
      ["q-fin.PR", "Pricing of Securities"],
      ["q-fin.RM", "Risk Management"],
      ["q-fin.ST", "Statistical Finance"],
      ["q-fin.TR", "Trading and Market Microstructure"],
    ),
  },
  {
    id: "stat",
    label: "Statistics",
    categories: cats(
      ["stat.AP", "Applications"],
      ["stat.CO", "Computation"],
      ["stat.ME", "Methodology"],
      ["stat.ML", "Machine Learning"],
      ["stat.OT", "Other Statistics"],
      ["stat.TH", "Statistics Theory"],
    ),
  },
];

export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((group) => group.categories);

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  ALL_CATEGORIES.map((category) => [category.id, category.label]),
);

export const DEFAULT_INTERESTS = ["cs.AI", "cs.LG", "cs.CL", "cs.CV"];

export const FEATURED_CATEGORIES: Category[] = FEATURED_IDS.map((id) => ({
  id,
  label: CATEGORY_LABEL[id] ?? id,
}));

export function categoryLabel(id: string) {
  return CATEGORY_LABEL[id] ?? id;
}
