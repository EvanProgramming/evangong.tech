export const awardsPage = {
  isDemo: true,
  intro:
    'A record of experiments, competitions, and collaborative work across technology, design, photography, and sport.',
}

export const awards = [
  {
    id: 'future-systems-innovation-challenge',
    title: 'Future Systems Innovation Challenge',
    result: 'Grand Prize',
    organizer: 'Future Makers Foundation',
    date: '2026-05',
    level: 'International',
    field: 'Robotics',
    location: 'Singapore',
    teamName: 'Team Parallax',
    myRole: 'Hardware integration and autonomous control',
    shortSummary:
      'Developed an autonomous environmental monitoring robot combining embedded sensing, navigation, and real-time data visualization.',
    relatedProject: { label: 'Hardware Agent Runtime', href: '/projects' },
    featured: true,
    caseStudy: {
      challenge:
        'Build a reliable prototype capable of navigating an unfamiliar environment and collecting useful sensor data.',
      contribution:
        'Designed the control architecture, integrated the sensor stack, and developed the autonomous navigation workflow.',
      outcome:
        'The team received the Grand Prize for technical execution, system reliability, and clarity of presentation.',
    },
    media: [
      { id: 'prototype', label: 'Prototype testing', alt: 'Mock media panel for robot prototype testing' },
      { id: 'presentation', label: 'Final presentation', alt: 'Mock media panel for the team presentation' },
      { id: 'certificate', label: 'Award certificate', alt: 'Mock media panel for the award certificate' },
    ],
  },
  {
    id: 'youth-ai-product-challenge',
    title: 'Youth AI Product Challenge',
    result: 'Gold Award',
    organizer: 'Global Youth Computing Alliance',
    date: '2026-02',
    level: 'International',
    field: 'Artificial Intelligence',
    teamName: 'Team Kyrozen',
    myRole: 'Product architecture and agent development',
    shortSummary:
      'Created an AI-assisted product development platform that turns early ideas into testable software and hardware prototypes.',
    relatedProject: { label: 'Kyrozen', href: '/projects' },
    featured: true,
    caseStudy: {
      challenge:
        'Design an AI system that could move beyond conversation and support a complete product-development workflow.',
      contribution:
        'Led the product architecture, implemented the autonomous agent workflow, and coordinated prototype verification.',
      outcome:
        'Awarded Gold for originality, practical value, and the quality of the working demonstration.',
    },
    media: [
      { id: 'dashboard', label: 'Product dashboard', alt: 'Mock media panel for the product dashboard' },
      { id: 'architecture', label: 'System architecture', alt: 'Mock media panel for the architecture presentation' },
      { id: 'ceremony', label: 'Gold Award', alt: 'Mock media panel for the award presentation' },
    ],
  },
  {
    id: 'urban-light-photography-awards',
    title: 'Urban Light Photography Awards',
    result: 'Jury Selection',
    organizer: 'City Frame Collective',
    date: '2025-11',
    level: 'International',
    field: 'Photography',
    shortSummary:
      'A street-photography series exploring geometry, reflections, and quiet human moments in dense urban spaces.',
    relatedProject: { label: 'Photography Gallery', href: '/gallery' },
    featured: true,
    caseStudy: {
      challenge:
        'Produce a visually consistent series from photographs captured across different cities, lighting conditions, and seasons.',
      contribution: 'Shot, selected, color-graded, and sequenced the complete series.',
      outcome:
        'Selected by the jury for exhibition as part of the annual emerging-photographer showcase.',
    },
    media: [
      { id: 'selected-frame', label: 'Selected photograph', alt: 'Mock media panel for the selected urban photograph' },
      { id: 'exhibition', label: 'Exhibition display', alt: 'Mock media panel for the exhibition display' },
      { id: 'series', label: 'Series detail', alt: 'Mock media panel for another photograph in the series' },
      { id: 'jury-certificate', label: 'Jury certificate', alt: 'Mock media panel for the jury selection certificate' },
    ],
  },
  {
    id: 'national-robotics-design-league',
    title: 'National Robotics Design League',
    result: 'First Place',
    organizer: 'Young Engineers Network',
    date: '2025-07',
    level: 'National',
    field: 'Robotics',
    teamName: 'Team Vector',
    myRole: 'Embedded software and system testing',
    shortSummary:
      'Built and validated a task-oriented mobile robot under strict size, time, and reliability constraints.',
    featured: false,
    media: [],
  },
  {
    id: 'creative-coding-sprint',
    title: 'Creative Coding Sprint',
    result: 'Best Interaction',
    organizer: 'Digital Arts Lab',
    date: '2025-04',
    level: 'Regional',
    field: 'Creative Coding',
    shortSummary:
      'Designed an interactive visual installation driven by movement and real-time generative graphics.',
    featured: false,
    media: [],
  },
  {
    id: 'regional-table-tennis-open',
    title: 'Regional Table Tennis Open',
    result: 'Bronze Medal',
    organizer: 'Regional Youth Sports Association',
    date: '2024-12',
    level: 'Regional',
    field: 'Table Tennis',
    shortSummary:
      'Placed third in the youth singles division after progressing through the group and elimination stages.',
    featured: false,
    media: [],
  },
  {
    id: 'young-makers-showcase',
    title: 'Young Makers Showcase',
    result: 'Audience Choice Award',
    organizer: 'Open Workshop Community',
    date: '2024-08',
    level: 'Regional',
    field: 'Hardware',
    teamName: 'Team Lumen',
    myRole: 'Electronics, firmware, and live demonstration',
    shortSummary:
      'Presented a responsive lighting prototype combining custom electronics, embedded firmware, and physical interaction.',
    featured: false,
    media: [],
  },
  {
    id: 'school-science-engineering-fair',
    title: 'School Science and Engineering Fair',
    result: 'Excellence Award',
    organizer: 'Horizon Academy',
    date: '2024-03',
    level: 'School',
    field: 'Engineering',
    shortSummary:
      'Demonstrated a sensor-based safety system designed to detect and report environmental risks.',
    featured: false,
    media: [],
  },
  {
    id: 'mathematical-modeling-challenge',
    title: 'Mathematical Modeling Challenge',
    result: 'Merit Award',
    organizer: 'Applied Mathematics Society',
    date: '2023-10',
    level: 'National',
    field: 'Mathematics',
    teamName: 'Team Euler',
    myRole: 'Simulation design and result visualization',
    shortSummary:
      'Developed a computational model and visual analysis for a resource-allocation problem.',
    featured: false,
    media: [],
  },
  {
    id: 'stem-communication-prize',
    title: 'STEM Communication Prize',
    result: 'Finalist',
    organizer: 'Youth Research Forum',
    date: '2023-05',
    level: 'Regional',
    field: 'Science Communication',
    shortSummary:
      'Presented a technical project to a general audience through a concise talk, demonstration, and visual explanation.',
    featured: false,
    media: [],
  },
]
