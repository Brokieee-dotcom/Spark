import { CurriculumType, FlashcardDeck, PracticeQuestion, ExamCountdownItem } from '../types';

export interface CurriculumMeta {
  id: CurriculumType;
  title: string;
  fullName: string;
  region: string;
  officialBoard: string;
  grades: string[];
  subjects: {
    name: string;
    code?: string;
    topics: string[];
    papersDescription: string;
  }[];
  disclaimer: string;
}

export const CURRICULA_DATA: Record<CurriculumType, CurriculumMeta> = {
  ECZ: {
    id: 'ECZ',
    title: 'ECZ Curriculum',
    fullName: 'Examinations Council of Zambia',
    region: 'Zambia & Southern Africa',
    officialBoard: 'Examinations Council of Zambia (ECZ)',
    grades: ['Grade 7', 'Grade 9', 'Grade 12', 'GCE'],
    subjects: [
      {
        name: 'Mathematics',
        code: '4024 / 5004',
        papersDescription: 'Paper 1 (Non-Calculator, 80 Marks, 2 Hours) | Paper 2 (Calculator & Multi-step, 100 Marks, 2.5 Hours)',
        topics: [
          'Matrices & Determinants',
          'Earth Geometry (Longitudes & Latitudes)',
          'Linear Programming & Inequalities',
          'Vectors in Two Dimensions',
          'Mensuration (Cylinders, Cones, Spheres)',
          'Calculus (Differentiation & Integration basics)',
          'Transformation Geometry (Matrices & Shear)',
          'Graphs of Polynomials & Tangents',
          'Statistics & Cumulative Frequency (Ogive)',
          'Sequences & Series (AP & GP)',
        ],
      },
      {
        name: 'Science (Physics & Chemistry)',
        code: '5124',
        papersDescription: 'Paper 1 (Physics 5124/1) | Paper 2 (Chemistry 5124/2) | Paper 3 (Practical / Alternative to Practical)',
        topics: [
          'Physics: Mechanics, Moments & Simple Machines',
          'Physics: Work, Energy & Power',
          'Physics: Thermal Expansion & Gas Laws',
          'Physics: Sound, Light & Refractive Index',
          'Physics: Current Electricity & Ohm’s Law',
          'Physics: Electromagnetic Induction & Transformers',
          'Physics: Radioactivity & Half-Life',
          'Chemistry: Particulate Nature & Mole Concept',
          'Chemistry: Acids, Bases, Salts & Qualitative Analysis',
          'Chemistry: Metals, Reactivity Series & Extraction',
          'Chemistry: Organic Chemistry (Alkanes, Alkenes, Alcohols)',
          'Chemistry: Electrolysis & Faraday’s Laws',
        ],
      },
      {
        name: 'Biology',
        code: '5090',
        papersDescription: 'Paper 1 (Multiple Choice, 40 Marks) | Paper 2 (Theory & Structured, 80 Marks) | Paper 3 (Practical / ATP)',
        topics: [
          'Cell Structure & Specialization',
          'Enzyme Action & Denaturation',
          'Plant Nutrition & Photosynthesis',
          'Human Nutrition & Balanced Diet',
          'Transport in Plants (Xylem & Phloem)',
          'Human Circulatory System & Heart Structure',
          'Respiration & Gaseous Exchange in Humans',
          'Excretion & Kidney Function (Nephron)',
          'Reproduction in Flowering Plants & Humans',
          'Genetics, Monohybrid Crosses & Variation',
        ],
      },
      {
        name: 'English Language',
        code: '1121',
        papersDescription: 'Paper 1 (Continuous Writing: Composition & Directed Writing) | Paper 2 (Comprehension, Summary & Structure)',
        topics: [
          'Summary Writing (Word Limit & Content Points)',
          'Comprehension & Inference Skills',
          'Rewrites & Grammatical Transformations',
          'Report Writing & Formal Letters',
          'Speech Writing & Articles',
          'Vocabulary & Idiomatic Expressions',
        ],
      },
      {
        name: 'Civic Education',
        code: '2030',
        papersDescription: 'Paper 1 & Paper 2 (Constitutional Governance & Citizen Rights)',
        topics: [
          'The Constitution of Zambia & Governance',
          'Human Rights & Bill of Rights',
          'Corruption & Integrity Systems in Zambia',
          'Family Law, Child Protection & Gender Equity',
          'Environmental Protection & Sustainable Development',
          'Civil Society & Citizen Participation',
        ],
      },
      {
        name: 'Commerce',
        code: '7100',
        papersDescription: 'Paper 1 (Multiple Choice) | Paper 2 (Structured Trade & Banking Questions)',
        topics: [
          'Scope of Commerce & Production',
          'Home Trade (Wholesale & Retail)',
          'International Trade (Import, Export & Tariffs)',
          'Banking Services & Payment Methods',
          'Insurance & Risk Pooling',
          'Transport & Warehousing',
        ],
      },
    ],
    disclaimer:
      'ScholarSpark AI is an independent study aid and is NOT affiliated with, sponsored by, or endorsed by the Examinations Council of Zambia (ECZ).',
  },
  Cambridge: {
    id: 'Cambridge',
    title: 'Cambridge IGCSE',
    fullName: 'Cambridge Assessment International Education',
    region: 'International & Global Cambridge Schools',
    officialBoard: 'Cambridge Assessment International Education',
    grades: ['IGCSE Core', 'IGCSE Extended', 'Cambridge O-Level', 'Cambridge AS/A-Level'],
    subjects: [
      {
        name: 'Mathematics',
        code: '0580',
        papersDescription: 'Paper 2 & 4 (Extended: Grades A* to E) | Paper 1 & 3 (Core: Grades C to G)',
        topics: [
          'Number, Percentages & Compound Interest',
          'Algebra: Quadratics, Indices & Simultaneous Equations',
          'Coordinate Geometry & Gradients',
          'Geometry: Circle Theorems & Similar Figures',
          'Mensuration: Surface Areas & Volumes',
          'Trigonometry: Sine & Cosine Rules, 3D Bearings',
          'Vectors & Matrices in 2D Space',
          'Transformations: Enlargements with Negative Scale Factors',
          'Probability: Tree Diagrams & Conditional Scenarios',
          'Statistics: Histograms & Cumulative Frequency',
          'Introductory Differentiation & Turning Points',
        ],
      },
      {
        name: 'Physics',
        code: '0625',
        papersDescription: 'Paper 2 (Multiple Choice) | Paper 4 (Theory Extended) | Paper 6 (Alternative to Practical)',
        topics: [
          'Motion, Forces, Pressure & Hooke’s Law',
          'Thermal Physics: Conduction, Convection & Specific Heat',
          'Waves & Light: Reflection, Refraction & Critical Angle',
          'Electromagnetism, Logic Gates & Induction',
          'Electricity: Potential Dividers, Thermistors & LDRs',
          'Nuclear Physics: Alpha, Beta, Gamma & Decay Equations',
          'Space Physics: The Solar System, Stars & Redshift',
        ],
      },
      {
        name: 'Chemistry',
        code: '0620',
        papersDescription: 'Paper 2 (MCQ) | Paper 4 (Theory Extended) | Paper 6 (Alternative to Practical)',
        topics: [
          'States of Matter, Kinetic Theory & Diffusion',
          'Atomic Structure, Isotopes & Periodic Trends',
          'Chemical Bonding: Ionic, Covalent & Metallic Lattices',
          'Stoichiometry & Mole Calculations (Gases, Solutions, Masses)',
          'Electrochemistry: Electrolysis of Molten & Aqueous Salts',
          'Chemical Energetics: Exothermic, Endothermic & Bond Energy',
          'Reversible Reactions, Equilibrium & Haber Process',
          'Acids, Bases, Titration & Salt Preparation',
          'Organic Chemistry: Homologous Series, Polymers & Esters',
        ],
      },
      {
        name: 'Biology',
        code: '0610',
        papersDescription: 'Paper 2 (MCQ) | Paper 4 (Theory Extended) | Paper 6 (Alternative to Practical)',
        topics: [
          'Characteristics & Classification of Living Organisms',
          'Movement In and Out of Cells: Osmosis & Active Transport',
          'Biological Molecules & Food Tests (Benedict, Biuret, Iodine)',
          'Plant Nutrition, Stomata & Leaf Anatomy',
          'Human Nutrition, Digestive Enzymes & Alimentary Canal',
          'Transport in Animals: Double Circulation & Coronary Disease',
          'Gas Exchange, Smoking Effects & Respiration',
          'Coordination: Hormones, Reflex Arc & Homeostasis',
          'Inheritance: Punnett Squares, Codominance & Sickle-Cell',
          'Biotechnology & Genetic Engineering',
        ],
      },
      {
        name: 'Computer Science',
        code: '0478',
        papersDescription: 'Paper 1 (Computer Systems) | Paper 2 (Algorithms, Programming & Logic)',
        topics: [
          'Data Representation: Binary, Hexadecimal, Sound & Images',
          'Data Transmission: Packets, Error Checking (Parity & Checksum)',
          'Hardware: CPU Architecture, Fetch-Decode-Execute, RAM & ROM',
          'Software: Operating Systems & Translators (Compilers vs Interpreters)',
          'Automated & Emerging Technologies (Sensors & Robotics)',
          'Algorithm Design: Flowcharts & Pseudocode',
          'Boolean Logic: Logic Gates & Truth Tables',
        ],
      },
    ],
    disclaimer:
      'ScholarSpark AI is an independent study aid and is NOT affiliated with, sponsored by, or endorsed by Cambridge Assessment International Education.',
  },
};

// Verified syllabus sample questions with clear provenance labels
export const SAMPLE_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // ECZ Math Paper 1 sample
  {
    id: 'ecz-m-01',
    curriculum: 'ECZ',
    grade: 'Grade 12',
    subject: 'Mathematics',
    topic: 'Matrices & Determinants',
    questionType: 'structured',
    totalMarks: 3,
    questionText:
      'Given that matrix A = [ [3, -2], [x, 4] ] and the determinant of matrix A is 22, calculate the value of x.\nShow all necessary working clearly.',
    modelAnswer:
      'det(A) = (3)(4) - (-2)(x) = 22\n12 + 2x = 22\n2x = 22 - 12\n2x = 10\nx = 5',
    markingScheme: [
      { markType: 'M1', criterion: 'Correct formula for 2x2 determinant: (3)(4) - (-2)(x) = 22' },
      { markType: 'M1', criterion: 'Simplifying equation: 12 + 2x = 22 or 2x = 10' },
      { markType: 'A1', criterion: 'Accurate final answer: x = 5' },
    ],
    explanation:
      'The determinant of a 2x2 matrix [[a, b], [c, d]] is given by ad - bc. Equate this to 22 and solve the linear equation for x.',
    hint: 'Recall that det([[a, b], [c, d]]) = ad - bc. Watch the double negative when subtracting (-2)(x).',
    isVerifiedPastPaper: true,
    provenanceLabel: 'ECZ Grade 12 Math Paper 1 Syllabus Exam Format',
  },
  // ECZ Science (Physics) sample
  {
    id: 'ecz-phy-01',
    curriculum: 'ECZ',
    grade: 'Grade 12',
    subject: 'Science (Physics & Chemistry)',
    topic: 'Physics: Current Electricity & Ohm’s Law',
    questionType: 'multiple_choice',
    totalMarks: 1,
    questionText:
      'A current of 2.5 A flows through a resistor connected to a 12 V car battery. What is the electrical resistance of the resistor?',
    options: ['0.21 Ω', '4.8 Ω', '14.5 Ω', '30.0 Ω'],
    correctOptionIndex: 1,
    modelAnswer: 'R = V / I = 12 V / 2.5 A = 4.8 Ω',
    markingScheme: [
      { markType: 'B1', criterion: 'Selection of 4.8 Ω with Ohm’s law R = V / I' },
    ],
    explanation: 'Using Ohm’s law V = IR, rearrange for resistance R = V / I = 12 / 2.5 = 4.8 Ω.',
    hint: 'Use the Ohm’s law triangle: V on top, I and R on the bottom.',
    isVerifiedPastPaper: true,
    provenanceLabel: 'ECZ Science 5124/1 Practice Standard',
  },
  // Cambridge Math 0580 sample
  {
    id: 'cam-m-01',
    curriculum: 'Cambridge',
    grade: 'IGCSE Extended',
    subject: 'Mathematics',
    topic: 'Algebra: Quadratics, Indices & Simultaneous Equations',
    questionType: 'structured',
    totalMarks: 4,
    questionText:
      'Solve the simultaneous equations:\n3x + 2y = 19\n5x - y = 23\nShow all your working.',
    modelAnswer:
      'Multiply equation (2) by 2:\n10x - 2y = 46\nAdd equation (1): (3x + 2y) + (10x - 2y) = 19 + 46\n13x = 65\nx = 5\nSubstitute x = 5 into (2): 5(5) - y = 23\n25 - y = 23 => y = 2\nAnswer: x = 5, y = 2',
    markingScheme: [
      { markType: 'M1', criterion: 'Multiplying to align coefficients of y (or rearranging for substitution)' },
      { markType: 'M1', criterion: 'Eliminating one variable to reach 13x = 65 or equivalent' },
      { markType: 'A1', criterion: 'Correct value for x = 5' },
      { markType: 'A1', criterion: 'Correct value for y = 2' },
    ],
    explanation:
      'Elimination method is most direct: multiply equation 2 by 2 so that the coefficients of y are +2 and -2, then add the equations to eliminate y.',
    hint: 'Notice that equation 2 has -y and equation 1 has +2y. Doubling equation 2 makes elimination swift.',
    isVerifiedPastPaper: true,
    provenanceLabel: 'Cambridge IGCSE 0580 Extended Paper 2 Standard',
  },
  // Cambridge Physics 0625 sample
  {
    id: 'cam-phy-01',
    curriculum: 'Cambridge',
    grade: 'IGCSE Extended',
    subject: 'Physics',
    topic: 'Nuclear Physics: Alpha, Beta, Gamma & Decay Equations',
    questionType: 'multiple_choice',
    totalMarks: 1,
    questionText:
      'A nucleus of Uranium-238 emits an alpha particle (α) to form a daughter nucleus of Thorium. What is the nucleon number (mass number) of the Thorium nucleus?',
    options: ['234', '236', '238', '242'],
    correctOptionIndex: 0,
    modelAnswer: '238 - 4 = 234',
    markingScheme: [
      { markType: 'B1', criterion: 'Correct mass number: 234' },
    ],
    explanation:
      'An alpha particle consists of 2 protons and 2 neutrons (mass number 4, atomic number 2). During alpha decay, the nucleon number decreases by 4: 238 - 4 = 234.',
    hint: 'An alpha particle is a Helium-4 nucleus (^4_2He). Subtract 4 from the top number.',
    isVerifiedPastPaper: true,
    provenanceLabel: 'Cambridge IGCSE 0625 Paper 2 MCQ Syllabus Format',
  },
];

// Curated starter flashcard decks
export const STARTER_FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-ecz-math-1',
    title: 'ECZ Math Paper 1 Must-Know Formulas',
    curriculum: 'ECZ',
    subject: 'Mathematics',
    topic: 'Earth Geometry & Matrices',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c1',
        front: 'What is the formula for the distance between two points on the same longitude (along a great circle)?',
        back: 'D = (θ / 360°) × 2πR, or D = 60 × θ nautical miles (nm), where θ is the latitude difference.',
        tip: 'In ECZ exams, radius R is typically given as 6370 km or nautical miles using 1° = 60 nm.',
        difficulty: 'medium',
        status: 'unreviewed',
      },
      {
        id: 'c2',
        front: 'What is the formula for finding the inverse of a 2x2 matrix A = [[a, b], [c, d]]?',
        back: 'A⁻¹ = (1 / det A) × [[d, -b], [-c, a]], provided det A ≠ 0.',
        tip: 'Swap the leading diagonal (a and d), and change the signs of the off-diagonal (b and c).',
        difficulty: 'easy',
        status: 'unreviewed',
      },
      {
        id: 'c3',
        front: 'State the formula for finding the volume of a sphere and surface area of a sphere.',
        back: 'Volume = (4/3)πr³\nSurface Area = 4πr²',
        tip: 'Do not confuse r³ in volume with r² in surface area! ECZ Paper 2 often tests hemispheres (half).',
        difficulty: 'medium',
        status: 'unreviewed',
      },
    ],
  },
  {
    id: 'deck-cam-sci-1',
    title: 'Cambridge IGCSE Chemistry Key Definitions',
    curriculum: 'Cambridge',
    subject: 'Chemistry',
    topic: 'Atomic Structure & Bonding',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c4',
        front: 'Define isotopes in terms of subatomic particles.',
        back: 'Atoms of the same element having the SAME number of protons, but a DIFFERENT number of neutrons.',
        tip: 'Always say "atoms of the same element", not just "substances" or "molecules", to get full marks in Cambridge Paper 4.',
        difficulty: 'easy',
        status: 'unreviewed',
      },
      {
        id: 'c5',
        front: 'Why do ionic compounds conduct electricity when molten or aqueous, but not when solid?',
        back: 'When molten or dissolved in water, the ions are free to move and carry charge. In a solid lattice, ions are locked in fixed positions by strong electrostatic forces.',
        tip: 'Never say "free electrons" for ionic conduction — it is free mobile IONS!',
        difficulty: 'medium',
        status: 'unreviewed',
      },
      {
        id: 'c6',
        front: 'What is meant by an exothermic reaction in terms of bond breaking and bond making?',
        back: 'More energy is RELEASED when new bonds are formed in the products than is ABSORBED when breaking bonds in the reactants (ΔH is negative).',
        tip: 'Remember "MEXO": Making bonds is EXOthermic.',
        difficulty: 'hard',
        status: 'unreviewed',
      },
    ],
  },
];

// Sample target exam dates
export const DEFAULT_EXAM_DATES: ExamCountdownItem[] = [
  {
    id: 'exam-1',
    curriculum: 'ECZ',
    subject: 'Mathematics',
    paperCode: 'Paper 1 (Non-Calculator) 4024/1',
    examDate: '2026-11-16T08:30:00',
    targetGrade: 'Distinction (1)',
    notes: 'Revise matrices, earth geometry, and transformations. No calculators permitted.',
  },
  {
    id: 'exam-2',
    curriculum: 'ECZ',
    subject: 'Science',
    paperCode: 'Physics Theory 5124/1',
    examDate: '2026-11-20T08:30:00',
    targetGrade: 'Distinction (1)',
    notes: 'Focus on moments, electricity circuits, transformers, and radioactivity formulas.',
  },
  {
    id: 'exam-3',
    curriculum: 'Cambridge',
    subject: 'Mathematics',
    paperCode: 'Extended Paper 22 (0580/22)',
    examDate: '2026-10-30T09:00:00',
    targetGrade: 'A*',
    notes: 'Non-calculator paper, speed is vital. Focus on algebra, vectors, and trigonometry.',
  },
  {
    id: 'exam-4',
    curriculum: 'Cambridge',
    subject: 'Physics',
    paperCode: 'Theory Extended Paper 42 (0625/42)',
    examDate: '2026-11-05T13:30:00',
    targetGrade: 'A*',
    notes: 'Include units in all final numbers. Focus on thermal physics and electromagnetism.',
  },
];
