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
    pathway?: string;
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
      {
        name: 'Computer Studies',
        code: '7010',
        papersDescription: 'Paper 1 (Theory) | Paper 2 (Practical Spreadsheets, Databases & Programming)',
        topics: [
          'Computer Hardware, Peripherals & Storage Media',
          'Binary Logic, Data Representation & Number Systems',
          'System Software, Operating Systems & Utilities',
          'Spreadsheets, Relational Databases & Formulas',
          'Algorithms, Flowcharts & Introductory Programming',
          'Data Security, Cyber Ethics & Networking',
        ],
      },
      {
        name: 'Geography',
        code: '2218',
        papersDescription: 'Paper 1 (Map Reading & Physical Geography) | Paper 2 (Human & Economic Geography of Zambia & Sub-region)',
        topics: [
          'Map Work: Grid References, Scale, Bearings & Contours',
          'Plate Tectonics, Earthquakes & Vulcanicity',
          'Weathering, River Processes & Landforms',
          'Weather, Climate & Natural Vegetation of Zambia',
          'Mining (Copperbelt), Agriculture & HEP in Zambia',
          'Population Dynamics, Urbanization & Transport',
        ],
      },
      {
        name: 'History',
        code: '2167',
        papersDescription: 'Paper 1 (Central & Southern African History) | Paper 2 (World History since 1900)',
        topics: [
          'Pre-Colonial Kingdoms of Central Africa (Luba-Lunda, Maravi, Lozi)',
          'Missionary Influence & Colonization of Northern Rhodesia',
          'Federation of Rhodesia and Nyasaland & Nationalist Struggle',
          'Zambian Independence (1964) & Post-Independence Development',
          'World War I, League of Nations & Treaty of Versailles',
          'World War II, Cold War & Decolonization in Africa',
        ],
      },
    ],
    disclaimer:
      'ScholarSpark AI is an independent study aid and is NOT affiliated with, sponsored by, or endorsed by the Examinations Council of Zambia (ECZ).',
  },
  ZambiaCBC: {
    id: 'ZambiaCBC',
    title: 'Zambia CBC (Forms 1–6)',
    fullName: 'Zambia Competence-Based Curriculum (2023 ZECF)',
    region: 'Zambia · Forms 1–4 (O-Level) & Forms 5–6 (A-Level)',
    officialBoard: 'Ministry of Education / CDC / ECZ (Zambia)',
    grades: [
      'Form 1 (O-Level)',
      'Form 2 (O-Level)',
      'Form 3 (O-Level)',
      'Form 4 (O-Level)',
      'Form 5 (A-Level)',
      'Form 6 (A-Level)',
    ],
    subjects: [
      {
        name: 'Mathematics',
        code: 'O-Level & A-Level STEM',
        pathway: 'Core & STEM Pathway',
        papersDescription:
          'Forms 1–2: Foundation Numeracy & Term 1/2 Competence Assessments | Forms 3–4 O-Level: Applied Problem Solving | Forms 5–6 A-Level: Pure Maths, Mechanics & Statistics',
        topics: [
          'Number Systems, Integers, Fractions & Ratios (Form 1–2)',
          'Linear Equations, Basic Geometry & Mensuration (Form 1–2)',
          'Algebraic Modelling, Quadratics & Polynomials (Form 3–4)',
          'Coordinate Geometry, Vectors & Transformations (Form 3–4)',
          'Trigonometry, Mensuration & Financial Arithmetic (Form 3–4)',
          'Matrices, Linear Programming & Earth Geometry (Form 4)',
          'Probability & Data Interpretation Projects (Form 3–4)',
          'A-Level Pure Maths: Calculus (Differential & Integral) (Form 5–6)',
          'A-Level Pure Maths: Complex Numbers, Series & Proofs (Form 5–6)',
          'A-Level Mechanics: Kinematics, Forces & Newton’s Laws (Form 5–6)',
          'A-Level Statistics: Distributions & Hypothesis Testing (Form 5–6)',
        ],
      },
      {
        name: 'Physics',
        code: 'Natural Science & STEM',
        pathway: 'Natural Science / Technology / STEM',
        papersDescription:
          'Separate Science: Forms 1–2 Term 1/2 Practical Foundations | Forms 3–4 O-Level & SBA | Forms 5–6 A-Level Physics',
        topics: [
          'Measurements, SI Units, Density & Forces Basics (Form 1–2)',
          'Simple Machines, Heat Transfer & Basic Light Rays (Form 1–2)',
          'Mechanics, Equilibrium, Moments & Energy Systems (Form 3–4)',
          'Thermal Physics, Gas Laws & Energy Efficiency (Form 3–4)',
          'Waves, Optics & Acoustic Applications (Form 3–4)',
          'Current Electricity, Circuits & Domestic Wiring Safety (Form 3–4)',
          'Electromagnetism, Motors & Renewable Power Generation (Form 4)',
          'A-Level Fields: Gravitational, Electric & Magnetic Fields (Form 5–6)',
          'A-Level Quantum Physics, Nuclear Binding & Particle Models (Form 5–6)',
          'A-Level Oscillations, Medical Imaging & Electronics (Form 5–6)',
        ],
      },
      {
        name: 'Chemistry',
        code: 'Natural Science & STEM',
        pathway: 'Natural Science / Agriculture / STEM',
        papersDescription:
          'Separate Science: Applied Chemical Principles, Titration/Qualitative Practicals & Environmental Chemistry',
        topics: [
          'Matter, Separation Techniques & Water Purification (Form 1–2)',
          'Elements, Compounds, Mixtures & Laboratory Safety (Form 1–2)',
          'Atomic Structure, Chemical Bonding & Periodic Trends (Form 3–4)',
          'Stoichiometry, Mole Concept & Volumetric Analysis (Form 3–4)',
          'Acids, Bases, Salts & Industrial Chemical Processes (Form 3–4)',
          'Electrochemistry, Extraction of Copper & Corrosion Control (Form 4)',
          'Organic Chemistry: Hydrocarbons, Alcohols & Polymers (Form 4)',
          'A-Level Chemical Energetics, Kinetics & Equilibrium (Kc/Kp) (Form 5–6)',
          'A-Level Transition Elements & Coordination Chemistry (Form 5–6)',
          'A-Level Organic Synthesis, Spectroscopy & Green Chemistry (Form 5–6)',
        ],
      },
      {
        name: 'Biology',
        code: 'Natural Science & STEM',
        pathway: 'Natural Science / Home Economics / Sports',
        papersDescription:
          'Separate Science: Competence Practicals, Ecological Fieldwork & A-Level Molecular Biology',
        topics: [
          'Classification, Microscopes & Plant/Animal Cells (Form 1–2)',
          'Nutrition, Hygiene & Flowering Plant Reproduction (Form 1–2)',
          'Cell Biology, Enzymes & Membrane Transport (Form 3–4)',
          'Plant Nutrition, Transport & Food Security Crops (Form 3–4)',
          'Human Physiology: Circulation, Respiration & Excretion (Form 3–4)',
          'Genetics, Inheritance & Public Health Biotechnology (Form 4)',
          'Ecology, Zambian Biodiversity & Climate Conservation (Form 4)',
          'A-Level Biochemistry, DNA Replication & Protein Synthesis (Form 5–6)',
          'A-Level Cellular Respiration, Photosynthesis & Homeostasis (Form 5–6)',
          'A-Level Immunology, Gene Technology & Evolutionary Genomics (Form 5–6)',
        ],
      },
      {
        name: 'Computer Science & ICT',
        code: 'Technology & STEM',
        pathway: 'Technology / Digital Literacy / STEM',
        papersDescription:
          'Applied Programming, Digital Systems, Databases, Cybersecurity & Practical Software Projects',
        topics: [
          'Computer Basics, Productivity Tools & Online Safety (Form 1–2)',
          'Digital Literacy, Cloud Collaboration & Cyber Ethics (Form 1–4)',
          'Binary Logic, Data Representation & Hardware Systems (Form 3–4)',
          'Algorithms, Flowcharts & Structured Programming (Python) (Form 3–4)',
          'Relational Databases, SQL & Spreadsheet Modelling (Form 4)',
          'A-Level Data Structures, Recursion & Algorithm Complexity (Form 5–6)',
          'A-Level Computer Architecture, Networking & Operating Systems (Form 5–6)',
          'A-Level Software Engineering Project & Applied AI Ethics (Form 5–6)',
        ],
      },
      {
        name: 'Agricultural Science',
        code: 'Agriculture Pathway',
        pathway: 'Agricultural Science / STEM',
        papersDescription:
          'Theory + Competence Farm Practice, Agribusiness Entrepreneurship & Sustainable Soil/Livestock Management',
        topics: [
          'Soil Science, Fertility Conservation & Climate-Smart Farming (Form 3–4)',
          'Crop Production, Pest Management & Irrigation Systems (Form 3–4)',
          'Livestock Husbandry, Nutrition & Disease Prevention (Form 4)',
          'Agribusiness, Value Addition & Farm Entrepreneurship (Form 4)',
          'A-Level Crop Genetics, Plant Biotechnology & Precision Agriculture (Form 5–6)',
          'A-Level Agricultural Economics, Supply Chains & Food Systems (Form 5–6)',
        ],
      },
      {
        name: 'English & Literature',
        code: 'Core & Languages',
        pathway: 'Core Compulsory / Social Sciences & Languages',
        papersDescription:
          'Functional Communication, Critical Reading, Directed Writing & A-Level Literary Analysis',
        topics: [
          'Functional & Directed Writing (Reports, Proposals, Formal Letters) (Form 3–4)',
          'Critical Comprehension, Summary & Inference Skills (Form 3–4)',
          'Grammar Transformations, Rhetoric & Oral Communication (Form 3–4)',
          'Zambian & African Literature: Prose, Drama & Poetry (Form 3–6)',
          'A-Level Stylistics, Discourse Analysis & Comparative Literature (Form 5–6)',
        ],
      },
      {
        name: 'Civic Education',
        code: 'Core Compulsory',
        pathway: 'Core Compulsory / Social Sciences',
        papersDescription:
          'Constitutional Democracy, Human Rights, Entrepreneurship Ethics & National Development Competencies',
        topics: [
          'Constitution of Zambia, Rule of Law & Democratic Governance (Form 3–4)',
          'Human Rights, Gender Equity & Child Protection Frameworks (Form 3–4)',
          'Anti-Corruption, Financial Integrity & Public Accountability (Form 4)',
          'Sustainable Development, Climate Justice & Global Citizenship (Form 4)',
          'A-Level Constitutional Law, Public Policy & Regional Integration (Form 5–6)',
        ],
      },
      {
        name: 'Business, Accounts & Commerce',
        code: 'Business & Finance',
        pathway: 'Business and Finance / Business Studies',
        papersDescription:
          'Principles of Accounts, Commerce, Entrepreneurship & A-Level Financial/Management Accounting',
        topics: [
          'Entrepreneurship, SME Business Plans & Financial Literacy (Form 3–4)',
          'Double-Entry Bookkeeping, Trial Balance & Financial Statements (Form 3–4)',
          'Banking, Digital Mobile Money, Insurance & Home/Foreign Trade (Form 3–4)',
          'Partnership Accounts, Control Accounts & Ratios (Form 4)',
          'A-Level Cost & Management Accounting, Budgeting & Variance Analysis (Form 5–6)',
          'A-Level Business Strategy, Marketing & Corporate Governance (Form 5–6)',
        ],
      },
      {
        name: 'Geography',
        code: 'Social Sciences',
        pathway: 'Social Sciences & Languages',
        papersDescription:
          'GIS/Map Interpretation, Physical Geomorphology, Zambian Economic Resources & A-Level Environmental Research',
        topics: [
          'Map Work, Contours, Bearings & Introductory GIS Skills (Form 3–4)',
          'Plate Tectonics, River Systems & Climate Dynamics (Form 3–4)',
          'Zambian Copperbelt Mining, Hydroelectric Power & Tourism (Form 4)',
          'Urbanization, Population Dynamics & Sustainable Land Use (Form 4)',
          'A-Level Hydrology, Atmospheric Systems & Regional Development Research (Form 5–6)',
        ],
      },
      {
        name: 'History',
        code: 'Social Sciences',
        pathway: 'Social Sciences & Languages',
        papersDescription:
          'Source Evaluation, Central African Heritage, Zambian Independence & A-Level Modern Global History',
        topics: [
          'Pre-Colonial Zambian & Central African Kingdoms (Form 3–4)',
          'Colonialism, Federation & Zambia’s Independence Struggle (1964) (Form 3–4)',
          'Post-Independence Nation Building & Southern African Liberation (Form 4)',
          'World Wars, Cold War & Contemporary Global Diplomacy (Form 4)',
          'A-Level Historiography, Primary Document Analysis & Research Essays (Form 5–6)',
        ],
      },
      {
        name: 'Design & Technology',
        code: 'Technology & Technical',
        pathway: 'Technology / Technical & Vocational',
        papersDescription:
          'CAD/Technical Drawing, Engineering Materials, Product Prototyping & SBA Design Portfolio',
        topics: [
          'Orthographic & Isometric Technical Drawing / CAD Basics (Form 3–4)',
          'Materials Science: Timber, Metals, Polymers & Composites (Form 3–4)',
          'Structures, Mechanisms, Pneumatics & Basic Electronics (Form 4)',
          'Design Process Portfolio & Community Problem Prototyping (Form 3–6)',
          'A-Level Engineering Design, Sustainable Manufacturing & Systems Control (Form 5–6)',
        ],
      },
      {
        name: 'Food, Nutrition & Hospitality',
        code: 'Home Economics & Hospitality',
        pathway: 'Home Economics & Hospitality / Technical',
        papersDescription:
          'Practical Culinary Competence, Nutrition Science, Food Safety & Hospitality Entrepreneurship',
        topics: [
          'Macronutrients, Micronutrients & Zambian Meal Planning (Form 3–4)',
          'Food Preservation, Hygiene Standards & Kitchen Management (Form 3–4)',
          'Hospitality Operations, Customer Service & Tourism Studies (Form 4)',
          'A-Level Human Nutrition Biochemistry, Dietetics & Food Technology (Form 5–6)',
        ],
      },
      {
        name: 'Creative Arts & Physical Education',
        code: 'Arts & Sports Pathways',
        pathway: 'Performing & Creative Arts / Physical Education & Sports',
        papersDescription:
          'Practical Performance, Visual Art & Design Portfolios, Sports Science Anatomy & Coaching',
        topics: [
          'Visual Art, Graphic Design & Cultural Heritage Crafts (Form 3–4)',
          'Music Theory, Composition & Performing Arts Production (Form 3–4)',
          'Exercise Physiology, Sports Nutrition & Injury Prevention (Form 3–4)',
          'A-Level Sports Biomechanics, Coaching & Creative Industries Enterprise (Form 5–6)',
        ],
      },
    ],
    disclaimer:
      'ScholarSpark AI is an independent study aid aligned with public Zambia Education Curriculum Framework (2023) competence-based concepts and is NOT affiliated with or endorsed by the Ministry of Education, CDC, or ECZ.',
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
      {
        name: 'ICT',
        code: '0417',
        papersDescription: 'Paper 1 (Theory) | Paper 2 (Document Production, Data Manipulation & Presentations) | Paper 3 (Data Analysis & Website Authoring)',
        topics: [
          'Types & Components of Computer Systems',
          'Input, Output Devices & Storage Media',
          'Networks, Cloud Computing & Cyber Security',
          'The Effects of Using IT & E-Safety',
          'ICT Applications (Expert Systems, Banking, Booking)',
          'Systems Life Cycle (Analysis, Design, Testing, Implementation)',
        ],
      },
      {
        name: 'First Language English',
        code: '0500',
        papersDescription: 'Paper 1 (Reading: Comprehension, Summary & Writer’s Effect) | Paper 2 (Directed Writing & Composition)',
        topics: [
          'Reading Comprehension & Implicit Meaning',
          'Summary Writing & Concise Synthesis',
          'Analysing Writer’s Effect & Literary Imagery',
          'Directed Writing (Letters, Reports, Articles, Speeches)',
          'Descriptive & Narrative Composition',
        ],
      },
      {
        name: 'Geography',
        code: '0460',
        papersDescription: 'Paper 1 (Geographical Themes) | Paper 2 (Geographical Skills) | Paper 4 (Alternative to Coursework)',
        topics: [
          'Population Dynamics & Migration',
          'Settlements, Urbanization & Urban Sprawl',
          'Earthquakes, Volcanoes & Plate Boundaries',
          'Rivers, Coasts & Weathering Processes',
          'Weather, Climate & Tropical Rainforest/Desert Ecosystems',
          'Development, Food Production, Industry & Tourism',
        ],
      },
      {
        name: 'History',
        code: '0470',
        papersDescription: 'Paper 1 (Structured Questions) | Paper 2 (Document-Based Source Evaluation) | Paper 4 (Depth Study)',
        topics: [
          'The Peace Treaties of 1919–23 (Versailles)',
          'The League of Nations & International Peace in the 1920s–30s',
          'Collapse of International Peace by 1939',
          'Origins & Development of the Cold War (1945–1975)',
          'Depth Study: Germany (1918–1945) / USA (1919–1941)',
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
  // Zambia CBC Form 3-4 O-Level Competence-Based Sample
  {
    id: 'zcbc-math-f4-01',
    curriculum: 'ZambiaCBC',
    grade: 'Form 4 (O-Level)',
    subject: 'Mathematics',
    topic: 'Matrices, Linear Programming & Earth Geometry (Form 4)',
    questionType: 'structured',
    totalMarks: 4,
    questionText:
      'A school cooperative produces two types of solar study lamps: Type A (requires 2 hours assembly, profit K45) and Type B (requires 3 hours assembly, profit K60). At most 24 assembly hours are available daily, and at least 2 Type A and 2 Type B lamps must be made.\nWrite down the system of linear inequalities for x (Type A) and y (Type B), and state the profit objective function P.',
    modelAnswer:
      'Constraints:\n1) 2x + 3y <= 24 (assembly time constraint)\n2) x >= 2\n3) y >= 2\nObjective profit function:\nP = 45x + 60y',
    markingScheme: [
      { markType: 'B1', criterion: 'Correct assembly constraint inequality: 2x + 3y <= 24' },
      { markType: 'B1', criterion: 'Minimum production bounds: x >= 2 and y >= 2' },
      { markType: 'M1', criterion: 'Identifying profit coefficients K45 and K60 correctly' },
      { markType: 'A1', criterion: 'Correct objective function P = 45x + 60y' },
    ],
    explanation:
      'In the Zambia CBC O-Level pathway, linear programming links algebra to real entrepreneurship decisions: translate resource caps into "<=" inequalities, minimum quotas into ">=" inequalities, and unit profits into P.',
    hint: 'Multiply hours per lamp by x and y for the 24-hour cap, then express total profit P in Kwacha.',
    isVerifiedPastPaper: false,
    provenanceLabel: 'Zambia CBC (Form 3–4 O-Level) Competence-Based Practice',
  },
  // Zambia CBC Form 5-6 A-Level STEM Sample
  {
    id: 'zcbc-math-f5-01',
    curriculum: 'ZambiaCBC',
    grade: 'Form 5 (A-Level)',
    subject: 'Mathematics',
    topic: 'A-Level Pure Maths: Calculus (Differential & Integral) (Form 5–6)',
    questionType: 'structured',
    totalMarks: 4,
    questionText:
      'A curve has equation y = x³ - 6x² + 9x + 2.\nFind dy/dx and determine the x-coordinates of both stationary points on the curve.',
    modelAnswer:
      'dy/dx = 3x² - 12x + 9\nAt stationary points, dy/dx = 0:\n3x² - 12x + 9 = 0\nx² - 4x + 3 = 0\n(x - 1)(x - 3) = 0\nStationary points occur at x = 1 and x = 3.',
    markingScheme: [
      { markType: 'M1', criterion: 'Differentiating term-by-term to obtain 3x² - 12x + 9' },
      { markType: 'M1', criterion: 'Setting dy/dx = 0 and simplifying quadratic' },
      { markType: 'M1', criterion: 'Factorising (x - 1)(x - 3) = 0 or valid quadratic formula' },
      { markType: 'A1', criterion: 'Both exact roots x = 1 and x = 3' },
    ],
    explanation:
      'At any turning/stationary point on a smooth curve, the gradient dy/dx equals zero. Differentiate first, equate to zero, and solve the resulting quadratic.',
    hint: 'Use the power rule d/dx(xⁿ) = n·xⁿ⁻¹ and divide the equation by 3 before factoring.',
    isVerifiedPastPaper: false,
    provenanceLabel: 'Zambia CBC (Form 5–6 A-Level STEM) Practice Standard',
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
  {
    id: 'deck-zcbc-stem-1',
    title: 'Zambia CBC Form 1–6 STEM & Competence Core',
    curriculum: 'ZambiaCBC',
    subject: 'Physics',
    topic: 'Mechanics, Electricity & A-Level Fields',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 'c7',
        front: 'In Form 1–4 Competence Physics, how is electrical power related to current, voltage, and resistance?',
        back: 'P = VI = I²R = V²/R (measured in Watts, W).',
        tip: 'Use P = I²R when analysing power loss in Zambian high-voltage transmission lines.',
        difficulty: 'easy',
        status: 'unreviewed',
      },
      {
        id: 'c8',
        front: 'How are Forms 1–3 assessed compared to Form 4 and Forms 5–6 in the 2023 Zambia CBC?',
        back: 'Forms 1–3 build foundational pathway skills measured through Term 1 and Term 2 School-Based Assessments, Form 4 completes O-Level certification, and Forms 5–6 specialize in up to 4 A-Level subjects.',
        tip: 'Keep Term 1 & Term 2 practical project logs organized from Form 1.',
        difficulty: 'medium',
        status: 'unreviewed',
      },
      {
        id: 'c9',
        front: 'In Form 5–6 A-Level Mechanics, state Newton’s Second Law in terms of momentum.',
        back: 'The resultant force acting on a body is directly proportional to the rate of change of linear momentum (F = Δp / Δt), and acts in the direction of the force.',
        tip: 'F = ma only holds when mass is constant; F = Δp / Δt is universally valid.',
        difficulty: 'hard',
        status: 'unreviewed',
      },
    ],
  },
];

// Real private schools operating in Zambia (ISAZ / MOE registered)
export const ZAMBIAN_PRIVATE_SCHOOLS: string[] = [
  'Rhodes Park School (Lusaka)',
  'Baobab College (Lusaka)',
  'Lusaka International Community School (LICS) (Lusaka)',
  'Lechwe School (Kitwe)',
  'Mpelembe Secondary School (Kitwe)',
  'Ndola Trust School (Ndola)',
  'Chengelo School (Mkushi)',
  'Trident College (Solwezi)',
  'Chalo Trust School (Lusaka)',
  'Crested Crane Academy (Lusaka)',
];

// Sample target exam & Form 1-3 term assessment dates
export const DEFAULT_EXAM_DATES: ExamCountdownItem[] = [
  {
    id: 'exam-1',
    curriculum: 'ECZ',
    subject: 'Mathematics',
    paperCode: 'Paper 1 (Non-Calculator) 4024/1',
    examDate: '2026-11-16T08:30:00',
    targetGrade: 'Distinction (1)',
    notes: 'Revise matrices, earth geometry, and transformations. No calculators permitted.',
    assessmentKind: 'final_exam',
  },
  {
    id: 'exam-2',
    curriculum: 'ECZ',
    subject: 'Science',
    paperCode: 'Physics Theory 5124/1',
    examDate: '2026-11-20T08:30:00',
    targetGrade: 'Distinction (1)',
    notes: 'Focus on moments, electricity circuits, transformers, and radioactivity formulas.',
    assessmentKind: 'final_exam',
  },
  {
    id: 'exam-3',
    curriculum: 'Cambridge',
    subject: 'Mathematics',
    paperCode: 'Extended Paper 22 (0580/22)',
    examDate: '2026-10-30T09:00:00',
    targetGrade: 'A*',
    notes: 'Non-calculator paper, speed is vital. Focus on algebra, vectors, and trigonometry.',
    assessmentKind: 'final_exam',
  },
  {
    id: 'exam-4',
    curriculum: 'Cambridge',
    subject: 'Physics',
    paperCode: 'Theory Extended Paper 42 (0625/42)',
    examDate: '2026-11-05T13:30:00',
    targetGrade: 'A*',
    notes: 'Include units in all final numbers. Focus on thermal physics and electromagnetism.',
    assessmentKind: 'final_exam',
  },
  {
    id: 'exam-5',
    curriculum: 'ZambiaCBC',
    subject: 'Mathematics',
    paperCode: 'Form 4 O-Level Competence Examination',
    examDate: '2026-11-12T08:30:00',
    targetGrade: 'Distinction',
    notes: 'Focus on applied linear programming, vectors, and SBA project portfolio readiness.',
    assessmentKind: 'final_exam',
  },
  {
    id: 'exam-6',
    curriculum: 'ZambiaCBC',
    subject: 'Physics',
    paperCode: 'Form 6 A-Level STEM Specialist Paper',
    examDate: '2026-11-18T08:30:00',
    targetGrade: 'A',
    notes: 'Review fields, quantum physics, and experimental uncertainty calculations.',
    assessmentKind: 'final_exam',
  },
  {
    id: 'exam-zcbc-t1',
    curriculum: 'ZambiaCBC',
    subject: 'Forms 1–3 Core Subjects',
    paperCode: 'Term 1 Assessment Test',
    examDate: '2027-03-19T08:30:00',
    targetGrade: 'Term 1 Mastery',
    notes: 'First-term competence assessment test across core and pathway subjects (Forms 1–3).',
    assessmentKind: 'term_assessment',
    term: 'Term 1',
  },
  {
    id: 'exam-zcbc-t2',
    curriculum: 'ZambiaCBC',
    subject: 'Forms 1–3 Core Subjects',
    paperCode: 'Term 2 Assessment Test',
    examDate: '2027-07-23T08:30:00',
    targetGrade: 'Term 2 Mastery',
    notes: 'Second-term school-based competence assessment test (Forms 1–3).',
    assessmentKind: 'term_assessment',
    term: 'Term 2',
  },
];

