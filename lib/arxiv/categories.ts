export type CategoryGroup = {
  id: string;
  label: string;
  categories: { id: string; label: string }[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "cs",
    label: "Computer Science",
    categories: [
      { id: "cs.AI", label: "Artificial Intelligence" },
      { id: "cs.LG", label: "Machine Learning" },
      { id: "cs.CL", label: "Computation and Language" },
      { id: "cs.CV", label: "Computer Vision" },
      { id: "cs.NE", label: "Neural and Evolutionary Computing" },
      { id: "cs.RO", label: "Robotics" },
      { id: "cs.IR", label: "Information Retrieval" },
      { id: "cs.HC", label: "Human-Computer Interaction" },
      { id: "cs.CR", label: "Cryptography and Security" },
      { id: "cs.DS", label: "Data Structures and Algorithms" },
      { id: "cs.SE", label: "Software Engineering" },
      { id: "cs.DC", label: "Distributed Computing" },
      { id: "cs.PL", label: "Programming Languages" },
      { id: "cs.SY", label: "Systems and Control" },
    ],
  },
  {
    id: "stat",
    label: "Statistics",
    categories: [
      { id: "stat.ML", label: "Machine Learning" },
      { id: "stat.ME", label: "Methodology" },
      { id: "stat.TH", label: "Theory" },
      { id: "stat.AP", label: "Applications" },
    ],
  },
  {
    id: "math",
    label: "Mathematics",
    categories: [
      { id: "math.OC", label: "Optimization and Control" },
      { id: "math.PR", label: "Probability" },
      { id: "math.ST", label: "Statistics Theory" },
      { id: "math.NA", label: "Numerical Analysis" },
      { id: "math.CO", label: "Combinatorics" },
    ],
  },
  {
    id: "eess",
    label: "Electrical Engineering",
    categories: [
      { id: "eess.AS", label: "Audio and Speech" },
      { id: "eess.IV", label: "Image and Video" },
      { id: "eess.SP", label: "Signal Processing" },
      { id: "eess.SY", label: "Systems and Control" },
    ],
  },
  {
    id: "physics",
    label: "Physics",
    categories: [
      { id: "quant-ph", label: "Quantum Physics" },
      { id: "cond-mat.stat-mech", label: "Statistical Mechanics" },
      { id: "physics.comp-ph", label: "Computational Physics" },
      { id: "hep-th", label: "High Energy Physics — Theory" },
    ],
  },
  {
    id: "q-bio",
    label: "Quantitative Biology",
    categories: [
      { id: "q-bio.NC", label: "Neurons and Cognition" },
      { id: "q-bio.QM", label: "Quantitative Methods" },
      { id: "q-bio.GN", label: "Genomics" },
    ],
  },
  {
    id: "econ",
    label: "Economics",
    categories: [
      { id: "econ.EM", label: "Econometrics" },
      { id: "econ.TH", label: "Theoretical Economics" },
    ],
  },
];

export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((group) => group.categories);

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  ALL_CATEGORIES.map((category) => [category.id, category.label]),
);

export const DEFAULT_INTERESTS = ["cs.AI", "cs.LG", "cs.CL", "cs.CV"];

export function categoryLabel(id: string) {
  return CATEGORY_LABEL[id] ?? id;
}
