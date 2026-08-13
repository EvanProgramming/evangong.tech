export const awardsPage = {
  isDemo: false,
  intro:
    'A selected record of competition results, program milestones, and the teams and systems behind them.',
}

export const awards = [
  {
    id: 'innox-lightlink-2026',
    title: 'LightLink at Shenzhen InnoX Academy',
    result: 'Silver Award · Most Popular Award',
    organizer: 'Shenzhen InnoX Academy',
    date: '2026-08',
    level: 'Academy',
    field: 'Wearable Technology',
    location: 'Shenzhen, China',
    teamName: 'LightLink',
    myRole: 'Embedded systems and wearable hardware integration',
    shortSummary:
      'Developed a networked wearable display system that turns light, motion, sound, and proximity into shared visual communication.',
    relatedProject: {
      label: 'LightLink on GitHub',
      href: 'https://github.com/EvanProgramming/lightlink',
    },
    featured: true,
    caseStudy: {
      challenge:
        'Create a wearable system that could synchronize expressive visuals across multiple garments while remaining responsive, portable, and practical to demonstrate.',
      contribution:
        'Integrated the ESP32-S3 electronics, addressable LED displays, BLE control, NFC pairing, microphone input, and the firmware workflow used by the physical prototypes.',
      outcome:
        'LightLink received both the Silver Award and the Most Popular Award at Shenzhen InnoX Academy in August 2026.',
    },
    media: [
      {
        id: 'display-prototype',
        label: 'Illuminated prototype',
        alt: 'Two LightLink wearable display prototypes showing illuminated LED patterns',
        src: '/awards/lightlink-display-prototype.jpg',
        sourceLabel: 'PROTOTYPE DOCUMENTATION',
      },
      {
        id: 'wearable-prototypes',
        label: 'Wearable builds',
        alt: 'Black and white LightLink garments with integrated LED matrix panels',
        src: '/awards/lightlink-wearable-prototypes.jpg',
        sourceLabel: 'PROTOTYPE DOCUMENTATION',
      },
      {
        id: 'manufacturing-lab',
        label: 'Manufacturing environment',
        alt: 'Industrial robotic arm inside a guarded manufacturing cell at Shenzhen InnoX Academy',
        src: '/awards/innox-manufacturing-lab.jpg',
        sourceLabel: 'INNOX DOCUMENTATION',
      },
    ],
  },
  {
    id: 'veritas-ai-scholars-2026',
    title: 'AI Scholars (Bootcamp) Program',
    result: 'Certificate of Achievement',
    organizer: 'Veritas AI',
    date: '2026-06',
    level: 'Program',
    field: 'Artificial Intelligence',
    myRole: 'Participant · model training and evaluation',
    shortSummary:
      'Completed the 2026 Summer Cohort, building a practical foundation in machine learning and applying it through a guided model-training project.',
    proofUrl: '/awards/veritas-ai-scholars-certificate.pdf',
    proofLabel: 'View certificate',
    relatedProject: {
      label: 'Veritas AI Scholars',
      href: 'https://www.veritasai.com/',
    },
    featured: true,
    caseStudy: {
      challenge:
        'Move from core AI concepts to a working image-classification pipeline with measurable training and validation performance.',
      contribution:
        'Trained and evaluated a VGG16-based transfer-learning model, monitoring accuracy and loss across a 40-epoch run.',
      outcome:
        'Completed the AI Scholars (Bootcamp) Program on June 26, 2026; the recorded final epoch reached 83.45% training accuracy and 81.09% validation accuracy.',
    },
    media: [
      {
        id: 'training-result',
        label: 'Model training result',
        alt: 'VGG16 model summary and final training metrics from the AI Scholars project',
        src: '/awards/veritas-vgg16-training.jpg',
        sourceLabel: 'PROJECT OUTPUT',
      },
      {
        id: 'certificate',
        label: 'Program certificate',
        alt: 'Veritas AI Certificate of Achievement for Gong Yifan',
        src: '/awards/veritas-ai-certificate.jpg',
        sourceLabel: 'OFFICIAL CERTIFICATE',
      },
      {
        id: 'program',
        label: 'AI Scholars program',
        alt: 'Official Veritas AI programs page showing the AI Scholars program',
        src: '/awards/veritas-ai-scholars.jpg',
        sourceLabel: 'OFFICIAL PROGRAM PAGE',
      },
    ],
  },
  {
    id: 'basis-china-hackathon-2026',
    title: 'BASIS China Hackathon — Mood Study',
    result: '4th Place · Senior Track',
    organizer: 'BASIS China',
    date: '2026-01',
    level: 'National',
    field: 'Product & AI',
    teamName: 'Team b1t',
    myRole: 'Team captain and product development',
    shortSummary:
      'Led the team behind Mood Study, a web application that connects mood, sleep, habits, and academic goals to produce more sustainable study plans.',
    relatedProject: {
      label: 'Mood Study on GitHub',
      href: 'https://github.com/EvanProgramming/MoodStudy',
    },
    featured: true,
    caseStudy: {
      challenge:
        'Students often plan around deadlines while overlooking how mood, sleep, and daily habits affect focus, consistency, and burnout.',
      contribution:
        'As team captain, shaped the product direction and helped build the mood logging, academic planning, focus, analytics, and AI-assisted insight experience.',
      outcome:
        'Team b1t placed fourth in the Senior Track at the January 2026 BASIS China Hackathon.',
    },
    media: [
      {
        id: 'landing-page',
        label: 'Mood Study experience',
        alt: 'Mood Study landing page with its interactive system interface',
        src: '/awards/mood-study-home.jpg',
        sourceLabel: 'PROJECT SCREENSHOT',
      },
      {
        id: 'dashboard',
        label: 'Academic rhythm dashboard',
        alt: 'Mood Study dashboard showing mood, focus, GPA, and planning modules',
        src: '/awards/mood-study-dashboard.jpg',
        sourceLabel: 'PROJECT SCREENSHOT',
      },
    ],
  },
  {
    id: 'igem-basis-china-2025',
    title: '2025 iGEM Competition — BASIS-China',
    result: 'Silver Medal',
    organizer: 'iGEM Foundation',
    date: '2025-10',
    level: 'International',
    field: 'Synthetic Biology & Hardware',
    location: 'Paris, France',
    teamName: 'BASIS-China',
    myRole: 'Hardware team member',
    shortSummary:
      'Built hardware for SnaPFAS, an integrated system designed to detect, biodegrade, and safely process PFOA-contaminated water.',
    proofUrl: '/awards/igem-2025-member-certificate.pdf',
    proofLabel: 'View certificate',
    relatedProject: {
      label: 'BASIS-China team wiki',
      href: 'https://2025.igem.wiki/basis-china/',
    },
    featured: true,
    caseStudy: {
      challenge:
        'Translate the team’s synthetic-biology work into a physical, closed-loop platform for PFOA detection, degradation, monitoring, and safe end-stage sterilization.',
      contribution:
        'Worked on hardware fabrication and integration, including the glove-box build, electronics, pumps, sensing, and the multi-tank treatment prototype.',
      outcome:
        'BASIS-China earned a Silver Medal in the High School Section at the 2025 iGEM Competition, held in Paris from October 28 to 31.',
    },
    media: [
      {
        id: 'hardware-build',
        label: 'Hardware fabrication',
        alt: 'Gong Yifan soldering electronics for the BASIS-China iGEM hardware system',
        src: '/awards/igem-hardware-build.jpg',
        sourceLabel: 'TEAM DOCUMENTATION',
      },
      {
        id: 'hardware-assembly',
        label: 'Glove-box assembly',
        alt: 'BASIS-China team members assembling the project glove box',
        src: '/awards/igem-hardware-assembly.jpg',
        sourceLabel: 'TEAM DOCUMENTATION',
      },
      {
        id: 'certificate',
        label: 'Silver Medal certificate',
        alt: 'Official iGEM certificate naming Gong Yifan as a BASIS-China student member and Silver Medal recipient',
        src: '/awards/igem-silver-medal-certificate.jpg',
        sourceLabel: 'OFFICIAL CERTIFICATE',
      },
    ],
  },
  {
    id: 'selected-early-distinctions',
    title: 'Selected Early Distinctions',
    result: 'Programming · Robotics · Music',
    organizer: 'Multiple organizers',
    date: '2024-04',
    level: 'Selected',
    field: 'Foundations',
    shortSummary:
      'Earlier recognition includes Lan Qiao Cup programming, C++ and Python proficiency examinations, robotics competitions, electronic-organ performance, and a Bronze Award for the Intelligent Bicycle Shed Management System in the 2nd Shenzhen-Hong Kong-Macao Youth Creative Design Competition. The published Bronze Award package was valued at approximately RMB 3,000 and included a trophy and certificate.',
    proofUrl: 'https://www.shm.design/hk/news/393.html',
    proofLabel: 'View official results',
    featured: false,
    media: [],
  },
]
