/**
 * ProCert Labs — Certified Courseware Marketplace Engine
 * Amazon/Udemy-style browsing experience for certified training content.
 * No external dependencies.
 */

(function () {
  'use strict';

  // ─── Program color map ───────────────────────────────────────────────
  const PROGRAM_COLORS = {
    mos:     { bg: '#dbeafe', text: '#1e40af', accent: '#3b82f6' },
    mta:     { bg: '#ede9fe', text: '#5b21b6', accent: '#7c3aed' },
    comptia: { bg: '#dcfce7', text: '#166534', accent: '#22c55e' },
    adobe:   { bg: '#fee2e2', text: '#991b1b', accent: '#ef4444' },
    ic3:     { bg: '#fef9c3', text: '#854d0e', accent: '#eab308' },
    cisco:   { bg: '#cffafe', text: '#155e75', accent: '#06b6d4' }
  };

  const PROGRAM_LABELS = {
    mos:     'Microsoft Office Specialist',
    mta:     'Microsoft Technical Associate',
    comptia: 'CompTIA CAQC',
    adobe:   'Adobe Certified Associate',
    ic3:     'Certiport IC3',
    cisco:   'Cisco Networking'
  };

  const FORMAT_ICONS = {
    text:       'fa-book',
    web:        'fa-globe',
    video:      'fa-video',
    computer:   'fa-desktop',
    instructor: 'fa-chalkboard-teacher',
    'self-study': 'fa-user-graduate'
  };

  // ─── Courseware Dataset (48 items) ───────────────────────────────────
  const coursewareData = [
    // ── Microsoft Office Specialist (12) ──
    { id: 1,  title: 'GMetrix Practice Tests for MO-200 Excel', publisher: 'GMetrix', program: 'mos', exam: 'MO-200', examName: 'Microsoft Excel', formats: ['computer', 'self-study'], rating: 4.8, reviewCount: 1247, coverageScore: 98, certifiedDate: '2025-11-15', featured: true, description: 'Simulation-based practice tests mirroring the live MO-200 exam environment.', tags: ['excel', 'practice test', 'simulation', 'spreadsheet', 'office 365'] },
    { id: 2,  title: 'Jasperactive Excel Associate Courseware', publisher: 'Jasperactive', program: 'mos', exam: 'MO-200', examName: 'Microsoft Excel', formats: ['web', 'computer'], rating: 4.7, reviewCount: 983, coverageScore: 96, certifiedDate: '2025-09-22', featured: true, description: 'Interactive project-based learning for Excel certification with live-app exercises.', tags: ['excel', 'interactive', 'project-based', 'hands-on'] },
    { id: 3,  title: 'LearnKey MO-100 Word Video Course', publisher: 'LearnKey', program: 'mos', exam: 'MO-100', examName: 'Microsoft Word', formats: ['video', 'self-study'], rating: 4.6, reviewCount: 812, coverageScore: 94, certifiedDate: '2025-08-10', featured: false, description: 'Expert-led video training covering all MO-100 Word Associate exam objectives.', tags: ['word', 'video', 'associate', 'document'] },
    { id: 4,  title: 'CertPREP Word Practice Labs', publisher: 'CertPREP', program: 'mos', exam: 'MO-100', examName: 'Microsoft Word', formats: ['computer', 'web'], rating: 4.5, reviewCount: 674, coverageScore: 92, certifiedDate: '2025-07-18', featured: false, description: 'Hands-on practice labs with auto-graded Word tasks aligned to exam objectives.', tags: ['word', 'lab', 'practice', 'hands-on', 'auto-graded'] },
    { id: 5,  title: 'CCI Learning MOS PowerPoint Study Guide', publisher: 'CCI Learning', program: 'mos', exam: 'MO-300', examName: 'Microsoft PowerPoint', formats: ['text', 'web'], rating: 4.4, reviewCount: 521, coverageScore: 91, certifiedDate: '2025-06-05', featured: false, description: 'Comprehensive text-based study guide with supplemental web exercises for PowerPoint.', tags: ['powerpoint', 'study guide', 'presentation', 'slides'] },
    { id: 6,  title: 'GMetrix PowerPoint Practice Exams', publisher: 'GMetrix', program: 'mos', exam: 'MO-300', examName: 'Microsoft PowerPoint', formats: ['computer'], rating: 4.7, reviewCount: 889, coverageScore: 97, certifiedDate: '2025-10-30', featured: true, description: 'Full-length simulated PowerPoint exams with detailed score reports and remediation.', tags: ['powerpoint', 'practice exam', 'simulation', 'score report'] },
    { id: 7,  title: 'Jasperactive Outlook Certification Path', publisher: 'Jasperactive', program: 'mos', exam: 'MO-400', examName: 'Microsoft Outlook', formats: ['web', 'computer', 'self-study'], rating: 4.3, reviewCount: 398, coverageScore: 90, certifiedDate: '2025-05-12', featured: false, description: 'Guided learning path for Outlook certification with email management projects.', tags: ['outlook', 'email', 'calendar', 'office'] },
    { id: 8,  title: 'Pearson MOS Excel Expert Prep', publisher: 'Pearson', program: 'mos', exam: 'MO-201', examName: 'Microsoft Excel Expert', formats: ['text', 'web', 'video'], rating: 4.6, reviewCount: 702, coverageScore: 95, certifiedDate: '2025-09-01', featured: false, description: 'Multi-format expert-level Excel courseware with advanced formula and macro coverage.', tags: ['excel', 'expert', 'macros', 'advanced', 'formulas'] },
    { id: 9,  title: 'uCertify MOS Word Expert Lab', publisher: 'uCertify', program: 'mos', exam: 'MO-101', examName: 'Microsoft Word Expert', formats: ['web', 'computer'], rating: 4.5, reviewCount: 456, coverageScore: 93, certifiedDate: '2025-04-20', featured: false, description: 'Cloud-based lab environment for Word Expert certification with real-time grading.', tags: ['word', 'expert', 'lab', 'cloud', 'styles', 'mail merge'] },
    { id: 10, title: 'Logical Operations Access Fundamentals', publisher: 'Logical Operations', program: 'mos', exam: 'MO-500', examName: 'Microsoft Access', formats: ['text', 'instructor'], rating: 4.2, reviewCount: 287, coverageScore: 89, certifiedDate: '2025-03-15', featured: false, description: 'Instructor-led courseware for Access database fundamentals and exam preparation.', tags: ['access', 'database', 'queries', 'tables', 'forms'] },
    { id: 11, title: 'GCFGlobal Excel Essentials for MOS', publisher: 'GCFGlobal', program: 'mos', exam: 'MO-200', examName: 'Microsoft Excel', formats: ['web', 'self-study'], rating: 4.3, reviewCount: 1534, coverageScore: 88, certifiedDate: '2025-02-28', featured: false, description: 'Free-access web courseware covering Excel essentials aligned to MOS objectives.', tags: ['excel', 'free', 'beginner', 'web-based', 'essentials'] },
    { id: 12, title: 'Strata Company Office Bundle Instructor Kit', publisher: 'Strata Company', program: 'mos', exam: 'MO-200', examName: 'Microsoft Excel', formats: ['text', 'instructor', 'computer'], rating: 4.4, reviewCount: 341, coverageScore: 91, certifiedDate: '2025-01-10', featured: false, description: 'Classroom instructor kit with lesson plans, labs, and assessment tools for Excel.', tags: ['excel', 'instructor', 'classroom', 'lesson plans', 'bundle'] },

    // ── Microsoft Technical Associate (8) ──
    { id: 13, title: 'Wiley MTA Software Development Fundamentals', publisher: 'Wiley', program: 'mta', exam: '98-361', examName: 'Software Development Fundamentals', formats: ['text', 'web'], rating: 4.5, reviewCount: 623, coverageScore: 93, certifiedDate: '2025-10-05', featured: true, description: 'Authoritative guide to software development fundamentals with C# and Python examples.', tags: ['software development', 'programming', 'c#', 'python', 'oop'] },
    { id: 14, title: 'uCertify MTA Database Administration Labs', publisher: 'uCertify', program: 'mta', exam: '98-364', examName: 'Database Administration Fundamentals', formats: ['web', 'computer'], rating: 4.4, reviewCount: 478, coverageScore: 91, certifiedDate: '2025-08-22', featured: false, description: 'Interactive SQL labs and practice tests for database administration fundamentals.', tags: ['database', 'sql', 'administration', 'queries', 'relational'] },
    { id: 15, title: 'LearnKey Networking Fundamentals Video Series', publisher: 'LearnKey', program: 'mta', exam: '98-366', examName: 'Networking Fundamentals', formats: ['video', 'self-study'], rating: 4.6, reviewCount: 567, coverageScore: 94, certifiedDate: '2025-07-14', featured: false, description: 'Complete video series covering OSI model, TCP/IP, and network infrastructure basics.', tags: ['networking', 'tcp/ip', 'osi model', 'infrastructure', 'protocols'] },
    { id: 16, title: 'Sybex MTA Security Fundamentals', publisher: 'Sybex', program: 'mta', exam: '98-367', examName: 'Security Fundamentals', formats: ['text', 'web'], rating: 4.5, reviewCount: 534, coverageScore: 92, certifiedDate: '2025-06-30', featured: true, description: 'In-depth coverage of security layers, authentication, and encryption fundamentals.', tags: ['security', 'encryption', 'authentication', 'firewall', 'threats'] },
    { id: 17, title: 'CertPREP Windows Server Admin Practice', publisher: 'CertPREP', program: 'mta', exam: '98-365', examName: 'Windows Server Administration', formats: ['computer', 'self-study'], rating: 4.3, reviewCount: 389, coverageScore: 90, certifiedDate: '2025-05-18', featured: false, description: 'Simulation labs for Windows Server installation, storage, and Active Directory.', tags: ['windows server', 'active directory', 'administration', 'storage'] },
    { id: 18, title: 'Pearson MTA HTML5 App Development', publisher: 'Pearson', program: 'mta', exam: '98-375', examName: 'HTML5 Application Development', formats: ['text', 'web', 'video'], rating: 4.4, reviewCount: 412, coverageScore: 93, certifiedDate: '2025-04-25', featured: false, description: 'Multi-format courseware for HTML5, CSS3, and JavaScript application development.', tags: ['html5', 'css3', 'javascript', 'web development', 'responsive'] },
    { id: 19, title: 'Logical Operations Python Fundamentals', publisher: 'Logical Operations', program: 'mta', exam: '98-381', examName: 'Introduction to Programming Using Python', formats: ['text', 'instructor', 'computer'], rating: 4.6, reviewCount: 645, coverageScore: 95, certifiedDate: '2025-09-12', featured: false, description: 'Classroom-ready Python courseware with hands-on coding exercises and assessments.', tags: ['python', 'programming', 'coding', 'data types', 'functions'] },
    { id: 20, title: 'CCI Learning Java Fundamentals Workbook', publisher: 'CCI Learning', program: 'mta', exam: '98-388', examName: 'Introduction to Programming Using Java', formats: ['text', 'self-study'], rating: 4.3, reviewCount: 298, coverageScore: 89, certifiedDate: '2025-03-08', featured: false, description: 'Self-study workbook covering Java programming fundamentals and OOP principles.', tags: ['java', 'programming', 'oop', 'classes', 'inheritance'] },

    // ── CompTIA (10) ──
    { id: 21, title: 'TestOut LabSim A+ Core 1 Labs', publisher: 'Labsim (TestOut)', program: 'comptia', exam: '220-1101', examName: 'CompTIA A+ Core 1', formats: ['computer', 'video', 'web'], rating: 4.9, reviewCount: 2134, coverageScore: 99, certifiedDate: '2025-11-20', featured: true, description: 'Industry-leading simulated lab environment for hardware, networking, and mobile devices.', tags: ['a+', 'hardware', 'networking', 'mobile', 'troubleshooting', 'labs'] },
    { id: 22, title: 'TestOut LabSim A+ Core 2 Labs', publisher: 'Labsim (TestOut)', program: 'comptia', exam: '220-1102', examName: 'CompTIA A+ Core 2', formats: ['computer', 'video', 'web'], rating: 4.9, reviewCount: 1987, coverageScore: 98, certifiedDate: '2025-11-20', featured: true, description: 'Operating systems, security, and operational procedures in a hands-on lab format.', tags: ['a+', 'operating systems', 'security', 'software', 'troubleshooting'] },
    { id: 23, title: 'Sybex CompTIA Network+ Study Guide N10-009', publisher: 'Sybex', program: 'comptia', exam: 'N10-009', examName: 'CompTIA Network+', formats: ['text', 'web'], rating: 4.7, reviewCount: 1456, coverageScore: 96, certifiedDate: '2025-10-15', featured: true, description: 'Definitive study guide for Network+ covering all exam objectives with practice questions.', tags: ['network+', 'networking', 'subnetting', 'routing', 'wireless', 'troubleshooting'] },
    { id: 24, title: 'Pearson CompTIA Security+ SY0-701 Guide', publisher: 'Pearson', program: 'comptia', exam: 'SY0-701', examName: 'CompTIA Security+', formats: ['text', 'web', 'video'], rating: 4.8, reviewCount: 1823, coverageScore: 97, certifiedDate: '2025-11-01', featured: true, description: 'Comprehensive Security+ preparation with threat analysis labs and practice exams.', tags: ['security+', 'cybersecurity', 'threats', 'cryptography', 'risk management'] },
    { id: 25, title: 'CertPREP A+ Core 1 Practice Tests', publisher: 'CertPREP', program: 'comptia', exam: '220-1101', examName: 'CompTIA A+ Core 1', formats: ['computer', 'self-study'], rating: 4.5, reviewCount: 876, coverageScore: 93, certifiedDate: '2025-08-05', featured: false, description: 'Adaptive practice tests with performance-based question simulations for A+ Core 1.', tags: ['a+', 'practice test', 'adaptive', 'performance-based'] },
    { id: 26, title: 'LearnKey Network+ N10-009 Video Training', publisher: 'LearnKey', program: 'comptia', exam: 'N10-009', examName: 'CompTIA Network+', formats: ['video', 'self-study'], rating: 4.6, reviewCount: 734, coverageScore: 94, certifiedDate: '2025-07-22', featured: false, description: 'Expert-narrated video training with network topology demos and Wireshark walkthroughs.', tags: ['network+', 'video', 'wireshark', 'topology', 'protocols'] },
    { id: 27, title: 'uCertify CompTIA Cloud+ Prep Course', publisher: 'uCertify', program: 'comptia', exam: 'CV0-004', examName: 'CompTIA Cloud+', formats: ['web', 'computer'], rating: 4.4, reviewCount: 423, coverageScore: 91, certifiedDate: '2025-06-10', featured: false, description: 'Cloud architecture, deployment, and security labs mapped to Cloud+ objectives.', tags: ['cloud+', 'cloud computing', 'aws', 'azure', 'virtualization', 'deployment'] },
    { id: 28, title: 'Wiley CompTIA Security+ All-in-One', publisher: 'Wiley', program: 'comptia', exam: 'SY0-701', examName: 'CompTIA Security+', formats: ['text', 'web'], rating: 4.6, reviewCount: 1102, coverageScore: 95, certifiedDate: '2025-09-18', featured: false, description: 'All-in-one Security+ resource with exam objectives map and hands-on exercises.', tags: ['security+', 'all-in-one', 'cybersecurity', 'pen testing', 'compliance'] },
    { id: 29, title: 'Logical Operations A+ Instructor-Led Kit', publisher: 'Logical Operations', program: 'comptia', exam: '220-1101', examName: 'CompTIA A+ Core 1', formats: ['text', 'instructor', 'computer'], rating: 4.5, reviewCount: 534, coverageScore: 94, certifiedDate: '2025-05-25', featured: false, description: 'Complete instructor delivery kit with slides, labs, quizzes, and assessment engine.', tags: ['a+', 'instructor', 'classroom', 'slides', 'assessment'] },
    { id: 30, title: 'Certiport Practice CompTIA A+ Core 2', publisher: 'Certiport Practice', program: 'comptia', exam: '220-1102', examName: 'CompTIA A+ Core 2', formats: ['computer'], rating: 4.4, reviewCount: 612, coverageScore: 92, certifiedDate: '2025-04-14', featured: false, description: 'Official-style practice exams with detailed answer explanations for A+ Core 2.', tags: ['a+', 'practice test', 'explanations', 'operating systems'] },

    // ── Adobe (8) ──
    { id: 31, title: 'Jasperactive Photoshop CC Certification', publisher: 'Jasperactive', program: 'adobe', exam: 'AD0-E402', examName: 'Adobe Photoshop', formats: ['web', 'computer'], rating: 4.7, reviewCount: 945, coverageScore: 96, certifiedDate: '2025-10-28', featured: true, description: 'Project-driven Photoshop courseware with live-app exercises and skill assessments.', tags: ['photoshop', 'image editing', 'layers', 'retouching', 'creative cloud'] },
    { id: 32, title: 'LearnKey Illustrator Video Masterclass', publisher: 'LearnKey', program: 'adobe', exam: 'AD0-E403', examName: 'Adobe Illustrator', formats: ['video', 'self-study'], rating: 4.6, reviewCount: 678, coverageScore: 94, certifiedDate: '2025-09-15', featured: false, description: 'Full video course covering vector graphics, pen tool mastery, and Illustrator workflows.', tags: ['illustrator', 'vector', 'pen tool', 'graphics', 'logo design'] },
    { id: 33, title: 'CCI Learning InDesign Layout & Publishing', publisher: 'CCI Learning', program: 'adobe', exam: 'AD0-E404', examName: 'Adobe InDesign', formats: ['text', 'web'], rating: 4.5, reviewCount: 423, coverageScore: 92, certifiedDate: '2025-08-02', featured: false, description: 'Desktop publishing courseware covering InDesign layouts, typography, and print production.', tags: ['indesign', 'layout', 'typography', 'publishing', 'print'] },
    { id: 34, title: 'GMetrix Adobe Photoshop Practice Exams', publisher: 'GMetrix', program: 'adobe', exam: 'AD0-E402', examName: 'Adobe Photoshop', formats: ['computer'], rating: 4.8, reviewCount: 1123, coverageScore: 97, certifiedDate: '2025-11-08', featured: true, description: 'Simulation-based Photoshop practice exams matching the live certification environment.', tags: ['photoshop', 'practice exam', 'simulation', 'certification'] },
    { id: 35, title: 'Pearson Premiere Pro Video Editing Course', publisher: 'Pearson', program: 'adobe', exam: 'AD0-E405', examName: 'Adobe Premiere Pro', formats: ['text', 'video', 'web'], rating: 4.5, reviewCount: 534, coverageScore: 93, certifiedDate: '2025-07-20', featured: false, description: 'Multi-format Premiere Pro courseware covering timelines, effects, and color grading.', tags: ['premiere pro', 'video editing', 'timeline', 'effects', 'color grading'] },
    { id: 36, title: 'uCertify Adobe Illustrator Lab Environment', publisher: 'uCertify', program: 'adobe', exam: 'AD0-E403', examName: 'Adobe Illustrator', formats: ['web', 'computer'], rating: 4.4, reviewCount: 367, coverageScore: 90, certifiedDate: '2025-06-12', featured: false, description: 'Cloud lab environment for practicing Illustrator skills with guided projects.', tags: ['illustrator', 'lab', 'cloud', 'guided projects', 'vector'] },
    { id: 37, title: 'Strata Company Adobe Classroom Bundle', publisher: 'Strata Company', program: 'adobe', exam: 'AD0-E402', examName: 'Adobe Photoshop', formats: ['text', 'instructor', 'computer'], rating: 4.3, reviewCount: 289, coverageScore: 91, certifiedDate: '2025-05-05', featured: false, description: 'Instructor-led classroom bundle for Photoshop with lesson plans and student labs.', tags: ['photoshop', 'instructor', 'classroom', 'lesson plans'] },
    { id: 38, title: 'Axelos InDesign Digital Publishing Prep', publisher: 'Axelos', program: 'adobe', exam: 'AD0-E404', examName: 'Adobe InDesign', formats: ['text', 'self-study'], rating: 4.2, reviewCount: 198, coverageScore: 88, certifiedDate: '2025-03-22', featured: false, description: 'Self-paced InDesign preparation covering digital publishing and interactive documents.', tags: ['indesign', 'digital publishing', 'interactive', 'ebook', 'layout'] },

    // ── Certiport IC3 (5) ──
    { id: 39, title: 'GCFGlobal IC3 Computing Fundamentals', publisher: 'GCFGlobal', program: 'ic3', exam: 'IC3-GS6-CF', examName: 'Computing Fundamentals', formats: ['web', 'self-study'], rating: 4.5, reviewCount: 2345, coverageScore: 94, certifiedDate: '2025-10-10', featured: true, description: 'Accessible web-based courseware covering hardware, software, and operating system basics.', tags: ['computing fundamentals', 'hardware', 'software', 'digital literacy', 'os'] },
    { id: 40, title: 'CCI Learning IC3 Key Applications Workbook', publisher: 'CCI Learning', program: 'ic3', exam: 'IC3-GS6-KA', examName: 'Key Applications', formats: ['text', 'web'], rating: 4.4, reviewCount: 756, coverageScore: 92, certifiedDate: '2025-08-18', featured: false, description: 'Workbook covering word processing, spreadsheets, and presentation software fundamentals.', tags: ['key applications', 'word processing', 'spreadsheets', 'presentations'] },
    { id: 41, title: 'Certiport Practice IC3 Living Online', publisher: 'Certiport Practice', program: 'ic3', exam: 'IC3-GS6-LO', examName: 'Living Online', formats: ['computer', 'web'], rating: 4.3, reviewCount: 534, coverageScore: 91, certifiedDate: '2025-07-05', featured: false, description: 'Practice tests for internet skills, email, social media, and online safety.', tags: ['living online', 'internet', 'email', 'social media', 'safety', 'digital citizenship'] },
    { id: 42, title: 'LearnKey IC3 Digital Literacy Video Bundle', publisher: 'LearnKey', program: 'ic3', exam: 'IC3-GS6-CF', examName: 'Computing Fundamentals', formats: ['video', 'self-study'], rating: 4.5, reviewCount: 867, coverageScore: 93, certifiedDate: '2025-09-28', featured: false, description: 'Complete IC3 video training bundle covering all three certification domains.', tags: ['digital literacy', 'video', 'complete bundle', 'fundamentals'] },
    { id: 43, title: 'Jasperactive IC3 Interactive Modules', publisher: 'Jasperactive', program: 'ic3', exam: 'IC3-GS6-KA', examName: 'Key Applications', formats: ['web', 'computer'], rating: 4.6, reviewCount: 623, coverageScore: 95, certifiedDate: '2025-06-22', featured: false, description: 'Interactive browser-based IC3 modules with real-time progress tracking.', tags: ['key applications', 'interactive', 'browser-based', 'progress tracking'] },

    // ── Cisco (5) ──
    { id: 44, title: 'Pearson CCNA 200-301 Official Cert Guide', publisher: 'Pearson', program: 'cisco', exam: '200-301', examName: 'Cisco CCNA', formats: ['text', 'web', 'video'], rating: 4.8, reviewCount: 1876, coverageScore: 98, certifiedDate: '2025-11-10', featured: true, description: 'The definitive CCNA study resource with Packet Tracer labs and practice exams.', tags: ['ccna', 'networking', 'routing', 'switching', 'packet tracer', 'cisco ios'] },
    { id: 45, title: 'Labsim CCNA Network Simulator', publisher: 'Labsim (TestOut)', program: 'cisco', exam: '200-301', examName: 'Cisco CCNA', formats: ['computer', 'video'], rating: 4.7, reviewCount: 1234, coverageScore: 96, certifiedDate: '2025-10-05', featured: true, description: 'Full network simulation environment for CCNA with guided and challenge labs.', tags: ['ccna', 'simulator', 'lab', 'routing', 'switching', 'network'] },
    { id: 46, title: 'Sybex CCNP Enterprise ENCOR 350-401', publisher: 'Sybex', program: 'cisco', exam: '350-401', examName: 'Cisco CCNP ENCOR', formats: ['text', 'web'], rating: 4.6, reviewCount: 567, coverageScore: 94, certifiedDate: '2025-08-28', featured: false, description: 'Advanced enterprise networking guide covering dual-stack architecture and automation.', tags: ['ccnp', 'enterprise', 'encor', 'automation', 'sd-wan', 'architecture'] },
    { id: 47, title: 'uCertify Cisco CCNA Lab Platform', publisher: 'uCertify', program: 'cisco', exam: '200-301', examName: 'Cisco CCNA', formats: ['web', 'computer'], rating: 4.5, reviewCount: 478, coverageScore: 92, certifiedDate: '2025-07-15', featured: false, description: 'Cloud-based CCNA lab platform with virtual routers, switches, and graded challenges.', tags: ['ccna', 'lab', 'cloud', 'virtual', 'routers', 'switches'] },
    { id: 48, title: 'Wiley CCNP Enterprise ENARSI 300-410', publisher: 'Wiley', program: 'cisco', exam: '300-410', examName: 'Cisco CCNP ENARSI', formats: ['text', 'self-study'], rating: 4.4, reviewCount: 312, coverageScore: 90, certifiedDate: '2025-05-20', featured: false, description: 'Advanced routing and services study guide for CCNP Enterprise concentration exam.', tags: ['ccnp', 'enarsi', 'routing', 'bgp', 'ospf', 'troubleshooting'] }
  ];

  // Expose coursewareData for cart.js integration
  window.coursewareData = coursewareData;

  // ─── State ───────────────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 12;
  let currentItems = [];
  let displayedCount = 0;
  let searchTimeout = null;

  // ─── DOM refs ────────────────────────────────────────────────────────
  let els = {};

  function cacheDom() {
    els.grid            = document.getElementById('coursewareGrid');
    els.search          = document.getElementById('coursewareSearch');
    els.suggestions     = document.getElementById('searchSuggestions');
    els.filterProgram   = document.getElementById('filterProgram');
    els.filterFormat    = document.getElementById('filterFormat');
    els.filterSort      = document.getElementById('filterSort');
    els.filterExam      = document.getElementById('filterExam');
    els.filterReset     = document.getElementById('filterReset');
    els.resultsCount    = document.getElementById('resultsCount');
    els.loadMore        = document.getElementById('loadMore');
    els.viewBtns        = document.querySelectorAll('.view-btn[data-view]');
  }

  // ─── Star rendering ─────────────────────────────────────────────────
  function renderStars(rating) {
    let html = '';
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.25 && rating - full < 0.75 ? 1 : 0;
    const fullExtra = rating - full >= 0.75 ? 1 : 0;
    const filled = full + fullExtra;
    const empty = 5 - filled - half;

    for (let i = 0; i < filled; i++) {
      html += '<i class="fas fa-star"></i>';
    }
    if (half) {
      html += '<i class="fas fa-star-half-stroke"></i>';
    }
    for (let i = 0; i < empty; i++) {
      html += '<i class="far fa-star"></i>';
    }
    return html;
  }

  // ─── Format pills ──────────────────────────────────────────────────
  function renderFormats(formats) {
    return formats.map(function (f) {
      var icon = FORMAT_ICONS[f] || 'fa-file';
      var label = f === 'self-study' ? 'Self-Study' : f.charAt(0).toUpperCase() + f.slice(1);
      return '<span class="format-pill"><i class="fas ' + icon + '"></i> ' + label + '</span>';
    }).join('');
  }

  // ─── Card HTML ──────────────────────────────────────────────────────
  function cardHTML(item) {
    var c = PROGRAM_COLORS[item.program];
    var programLabel = PROGRAM_LABELS[item.program];
    var certDate = new Date(item.certifiedDate);
    var dateStr = certDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

    var coverageClass = item.coverageScore >= 95 ? 'coverage-elite' : item.coverageScore >= 90 ? 'coverage-high' : '';
    var featuredBadge = item.featured ? '<span class="featured-badge"><i class="fas fa-bolt"></i> Featured</span>' : '';

    return (
      '<div class="courseware-card" data-program="' + item.program + '" data-id="' + item.id + '">' +
        '<div class="card-accent-bar" style="background:' + c.accent + '"></div>' +
        '<div class="card-shine"></div>' +
        '<div class="card-inner">' +
          '<div class="card-header">' +
            '<div class="card-badge" style="background:' + c.bg + ';color:' + c.text + '">' + item.exam + '</div>' +
            featuredBadge +
          '</div>' +
          '<h3 class="card-title">' + item.title + '</h3>' +
          '<div class="card-publisher"><i class="fas fa-building"></i> <span>' + item.publisher + '</span></div>' +
          '<div class="card-description">' + item.description + '</div>' +
          '<div class="card-formats">' + renderFormats(item.formats) + '</div>' +
          '<div class="card-metrics">' +
            '<div class="card-rating">' +
              '<span class="stars">' + renderStars(item.rating) + '</span>' +
              '<span class="rating-number">' + item.rating.toFixed(1) + '</span>' +
              '<span class="review-count">' + item.reviewCount.toLocaleString() + ' reviews</span>' +
            '</div>' +
            '<div class="card-coverage ' + coverageClass + '">' +
              '<div class="coverage-info">' +
                '<span class="coverage-label">Exam Coverage</span>' +
                '<span class="coverage-pct">' + item.coverageScore + '%</span>' +
              '</div>' +
              '<div class="coverage-bar" style="--coverage:' + item.coverageScore + '%">' +
                '<div class="coverage-fill"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="card-bottom">' +
            '<div class="card-seal">' +
              '<div class="procert-badge"><i class="fas fa-shield-check"></i> ProCert Approved</div>' +
              '<span class="card-date">Certified ' + dateStr + '</span>' +
            '</div>' +
            '<button class="card-cta" data-id="' + item.id + '">' +
              '<span>Get Courseware</span>' +
              '<i class="fas fa-arrow-right"></i>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ─── Render cards into grid ─────────────────────────────────────────
  function renderCards(items, append) {
    if (!append) {
      els.grid.innerHTML = '';
    }
    var fragment = document.createDocumentFragment();
    var wrapper = document.createElement('div');
    wrapper.innerHTML = items.map(cardHTML).join('');
    while (wrapper.firstChild) {
      fragment.appendChild(wrapper.firstChild);
    }
    els.grid.appendChild(fragment);

    // Animate new cards
    requestAnimationFrame(function () {
      var cards = els.grid.querySelectorAll('.courseware-card:not(.visible)');
      cards.forEach(function (card, i) {
        setTimeout(function () {
          card.classList.add('visible');
        }, i * 60);
      });
    });
  }

  // ─── Filtering / sorting ────────────────────────────────────────────
  function getFilteredItems() {
    var query   = (els.search.value || '').toLowerCase().trim();
    var program = els.filterProgram.value;
    var format  = els.filterFormat.value;
    var exam    = els.filterExam.value;
    var sort    = els.filterSort.value;

    var items = coursewareData.filter(function (item) {
      // Program filter
      if (program !== 'all' && item.program !== program) return false;
      // Format filter
      if (format !== 'all' && item.formats.indexOf(format) === -1) return false;
      // Exam filter
      if (exam !== 'all' && item.exam.toLowerCase() !== exam.toLowerCase()) return false;
      // Search query
      if (query) {
        var haystack = [
          item.title, item.publisher, item.exam, item.examName,
          item.description
        ].concat(item.tags).join(' ').toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }
      return true;
    });

    // Sort
    switch (sort) {
      case 'featured':
        items.sort(function (a, b) {
          if (a.featured !== b.featured) return b.featured ? 1 : -1;
          return b.reviewCount - a.reviewCount;
        });
        break;
      case 'newest':
        items.sort(function (a, b) {
          return new Date(b.certifiedDate) - new Date(a.certifiedDate);
        });
        break;
      case 'rating':
        items.sort(function (a, b) {
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        });
        break;
      case 'popular':
        items.sort(function (a, b) {
          return b.reviewCount - a.reviewCount;
        });
        break;
      case 'publisher':
        items.sort(function (a, b) {
          return a.publisher.localeCompare(b.publisher);
        });
        break;
    }

    return items;
  }

  function applyFilters() {
    currentItems = getFilteredItems();
    displayedCount = 0;
    showNextPage(false);
    updateResultsCount();
    updateLoadMoreVisibility();
  }

  function showNextPage(append) {
    var next = currentItems.slice(displayedCount, displayedCount + ITEMS_PER_PAGE);
    if (next.length === 0 && !append) {
      els.grid.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No certified courseware matches your filters.</p><button class="btn btn-secondary" id="noResultsReset">Clear Filters</button></div>';
      var resetBtn = document.getElementById('noResultsReset');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
      }
      return;
    }
    renderCards(next, append);
    displayedCount += next.length;
    updateLoadMoreVisibility();
  }

  function updateResultsCount() {
    var total = currentItems.length;
    var shown = Math.min(displayedCount, total);
    els.resultsCount.innerHTML = 'Showing <strong>' + shown + '</strong> of <strong>' + total + '</strong> certified titles';
  }

  function updateLoadMoreVisibility() {
    if (!els.loadMore) return;
    if (displayedCount >= currentItems.length) {
      els.loadMore.style.display = 'none';
    } else {
      els.loadMore.style.display = '';
    }
    updateResultsCount();
  }

  // ─── Search suggestions ─────────────────────────────────────────────
  function showSuggestions(query) {
    if (!query || query.length < 2) {
      els.suggestions.classList.remove('active');
      els.suggestions.innerHTML = '';
      return;
    }

    var q = query.toLowerCase();
    var matches = coursewareData.filter(function (item) {
      var haystack = [item.title, item.publisher, item.exam, item.examName]
        .concat(item.tags).join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, 5);

    if (matches.length === 0) {
      els.suggestions.classList.remove('active');
      els.suggestions.innerHTML = '';
      return;
    }

    els.suggestions.innerHTML = matches.map(function (item) {
      var c = PROGRAM_COLORS[item.program];
      return (
        '<div class="suggestion-item" data-id="' + item.id + '">' +
          '<span class="suggestion-badge" style="background:' + c.bg + ';color:' + c.text + '">' + item.exam + '</span>' +
          '<span class="suggestion-title">' + item.title + '</span>' +
          '<span class="suggestion-publisher">' + item.publisher + '</span>' +
        '</div>'
      );
    }).join('');
    els.suggestions.classList.add('active');
  }

  // ─── Reset filters ──────────────────────────────────────────────────
  function resetFilters() {
    els.search.value = '';
    els.filterProgram.value = 'all';
    els.filterFormat.value = 'all';
    els.filterSort.value = 'featured';
    els.filterExam.value = 'all';
    els.suggestions.classList.remove('active');
    els.suggestions.innerHTML = '';
    applyFilters();
  }

  // ─── View toggle ────────────────────────────────────────────────────
  function setView(view) {
    els.viewBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    els.grid.classList.toggle('list-view', view === 'list');
    els.grid.classList.toggle('grid-view', view === 'grid');
  }

  // ─── Detail modal ───────────────────────────────────────────────────
  function openDetail(id) {
    var item = coursewareData.find(function (d) { return d.id === id; });
    if (!item) return;

    // Remove existing modal
    var existing = document.getElementById('coursewareModal');
    if (existing) existing.remove();

    var c = PROGRAM_COLORS[item.program];
    var certDate = new Date(item.certifiedDate);
    var dateStr = certDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    var modal = document.createElement('div');
    modal.id = 'coursewareModal';
    modal.className = 'courseware-modal';
    modal.innerHTML =
      '<div class="modal-overlay"></div>' +
      '<div class="modal-content">' +
        '<button class="modal-close"><i class="fas fa-times"></i></button>' +
        '<div class="modal-accent" style="background:' + c.accent + '"></div>' +
        '<div class="modal-badge" style="background:' + c.bg + ';color:' + c.text + '">' + PROGRAM_LABELS[item.program] + '</div>' +
        '<h2>' + item.title + '</h2>' +
        '<div class="modal-meta-row">' +
          '<span><i class="fas fa-building"></i> ' + item.publisher + '</span>' +
          '<span><i class="fas fa-file-certificate"></i> ' + item.exam + ' &mdash; ' + item.examName + '</span>' +
        '</div>' +
        '<p class="modal-desc">' + item.description + '</p>' +
        '<div class="modal-section">' +
          '<h4>Delivery Formats</h4>' +
          '<div class="card-formats">' + renderFormats(item.formats) + '</div>' +
        '</div>' +
        '<div class="modal-section">' +
          '<h4>Quality Metrics</h4>' +
          '<div class="modal-metrics">' +
            '<div class="modal-metric">' +
              '<div class="card-rating">' +
                '<span class="stars">' + renderStars(item.rating) + '</span>' +
                '<span class="rating-number">' + item.rating.toFixed(1) + '</span>' +
                '<span class="review-count">(' + item.reviewCount.toLocaleString() + ' reviews)</span>' +
              '</div>' +
            '</div>' +
            '<div class="modal-metric">' +
              '<span class="coverage-label">Exam Objective Coverage</span>' +
              '<div class="coverage-bar" style="--coverage:' + item.coverageScore + '%">' +
                '<div class="coverage-fill"></div>' +
              '</div>' +
              '<span class="coverage-pct">' + item.coverageScore + '%</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-section">' +
          '<h4>Tags</h4>' +
          '<div class="modal-tags">' + item.tags.map(function (t) {
            return '<span class="tag-pill">' + t + '</span>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<div class="procert-badge"><i class="fas fa-shield-check"></i> ProCert Approved &mdash; Certified ' + dateStr + '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () {
      modal.classList.add('active');
    });

    // Close handlers
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(function () { modal.remove(); }, 300);
    }
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handler);
      }
    });
  }

  // ─── Scroll animation (IntersectionObserver) ────────────────────────
  function setupScrollAnimation() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all cards immediately
      els.grid.querySelectorAll('.courseware-card').forEach(function (c) {
        c.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // Observe any cards that might appear later
    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType === 1 && node.classList && node.classList.contains('courseware-card')) {
            observer.observe(node);
          }
        });
      });
    });
    mo.observe(els.grid, { childList: true });
  }

  // ─── Event binding ──────────────────────────────────────────────────
  function bindEvents() {
    // Search (debounced)
    els.search.addEventListener('input', function () {
      clearTimeout(searchTimeout);
      var val = els.search.value;
      searchTimeout = setTimeout(function () {
        showSuggestions(val);
        applyFilters();
      }, 300);
    });

    // Click suggestion
    els.suggestions.addEventListener('click', function (e) {
      var item = e.target.closest('.suggestion-item');
      if (!item) return;
      var id = parseInt(item.dataset.id, 10);
      var data = coursewareData.find(function (d) { return d.id === id; });
      if (data) {
        els.search.value = data.title;
        els.suggestions.classList.remove('active');
        applyFilters();
      }
    });

    // Close suggestions on outside click
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-bar')) {
        els.suggestions.classList.remove('active');
      }
    });

    // Filter dropdowns
    els.filterProgram.addEventListener('change', applyFilters);
    els.filterFormat.addEventListener('change', applyFilters);
    els.filterSort.addEventListener('change', applyFilters);
    els.filterExam.addEventListener('change', applyFilters);

    // Reset
    els.filterReset.addEventListener('click', resetFilters);

    // Load more
    if (els.loadMore) {
      els.loadMore.addEventListener('click', function () {
        showNextPage(true);
      });
    }

    // View toggle
    els.viewBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setView(btn.dataset.view);
      });
    });

    // Card click -> detail modal (but NOT on .card-cta, which cart.js handles)
    els.grid.addEventListener('click', function (e) {
      // .card-cta clicks are handled by cart.js via document-level delegation — let them propagate
      if (e.target.closest('.card-cta')) {
        return;
      }
      var action = e.target.closest('.card-action');
      if (action) {
        e.preventDefault();
        openDetail(parseInt(action.dataset.id, 10));
        return;
      }
      var card = e.target.closest('.courseware-card');
      if (card && !e.target.closest('a') && !e.target.closest('button')) {
        openDetail(parseInt(card.dataset.id, 10));
      }
    });

    // Program cards can link to marketplace filtered
    document.querySelectorAll('.program-card[data-program]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.program-link')) {
          e.preventDefault();
          var prog = card.dataset.program;
          els.filterProgram.value = prog;
          applyFilters();
          document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ─── Inject modal & card styles (scoped to marketplace.js) ─────────
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      /* Card entrance animation */
      '.courseware-card{opacity:0;transform:translateY(24px);transition:opacity .5s ease,transform .5s ease;}' +
      '.courseware-card.visible{opacity:1;transform:translateY(0);}' +

      /* Card hover lift */
      '.courseware-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.18);cursor:pointer;}' +
      '.courseware-card.visible:hover{transform:translateY(-4px);}' +

      /* Coverage bar animation */
      '.coverage-bar{position:relative;height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;flex:1;}' +
      '.coverage-fill{height:100%;width:var(--coverage,0%);background:linear-gradient(90deg,#6366f1,#06b6d4);border-radius:3px;transition:width 1s ease;}' +

      /* Suggestion dropdown */
      '.search-suggestions{position:absolute;top:100%;left:0;right:0;background:#1a1a2e;border:1px solid rgba(99,102,241,.2);border-radius:0 0 12px 12px;overflow:hidden;z-index:50;display:none;box-shadow:0 8px 32px rgba(0,0,0,.3);}' +
      '.search-suggestions.active{display:block;}' +
      '.suggestion-item{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background .15s;}' +
      '.suggestion-item:hover{background:rgba(99,102,241,.1);}' +
      '.suggestion-badge{font-size:11px;padding:2px 8px;border-radius:4px;font-weight:600;white-space:nowrap;}' +
      '.suggestion-title{flex:1;font-size:14px;color:rgba(255,255,255,.9);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '.suggestion-publisher{font-size:12px;color:rgba(255,255,255,.4);}' +

      /* Card exam tag */
      '.card-exam-tag{font-size:12px;color:rgba(255,255,255,.5);margin-bottom:6px;}' +
      '.card-exam-tag i{margin-right:4px;color:#6366f1;}' +

      /* Card description */
      '.card-description{font-size:13px;color:rgba(255,255,255,.5);line-height:1.4;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}' +

      /* No results state */
      '.no-results{grid-column:1/-1;text-align:center;padding:60px 20px;color:rgba(255,255,255,.4);}' +
      '.no-results i{font-size:48px;margin-bottom:16px;display:block;color:rgba(99,102,241,.3);}' +
      '.no-results p{margin-bottom:20px;font-size:16px;}' +

      /* Modal */
      '.courseware-modal{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s ease;}' +
      '.courseware-modal.active{opacity:1;pointer-events:all;}' +
      '.modal-overlay{position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);}' +
      '.modal-content{position:relative;background:#1a1a2e;border:1px solid rgba(99,102,241,.2);border-radius:16px;max-width:640px;width:90%;max-height:85vh;overflow-y:auto;padding:32px;transform:scale(.95) translateY(20px);transition:transform .3s ease;box-shadow:0 24px 64px rgba(0,0,0,.4);}' +
      '.courseware-modal.active .modal-content{transform:scale(1) translateY(0);}' +
      '.modal-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.5);width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;}' +
      '.modal-close:hover{background:rgba(255,255,255,.1);color:#fff;}' +
      '.modal-accent{height:4px;border-radius:2px;margin-bottom:16px;}' +
      '.modal-badge{display:inline-block;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;margin-bottom:12px;}' +
      '.modal-content h2{font-size:22px;margin-bottom:12px;color:#fff;line-height:1.3;}' +
      '.modal-meta-row{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:16px;font-size:14px;color:rgba(255,255,255,.5);}' +
      '.modal-meta-row i{margin-right:4px;color:#6366f1;}' +
      '.modal-desc{font-size:15px;color:rgba(255,255,255,.7);line-height:1.6;margin-bottom:20px;}' +
      '.modal-section{margin-bottom:20px;}' +
      '.modal-section h4{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.3);margin-bottom:10px;}' +
      '.modal-metrics{display:flex;flex-direction:column;gap:12px;}' +
      '.modal-tags{display:flex;flex-wrap:wrap;gap:6px;}' +
      '.tag-pill{padding:4px 10px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.15);border-radius:20px;font-size:12px;color:rgba(255,255,255,.6);}' +
      '.modal-footer{padding-top:16px;border-top:1px solid rgba(255,255,255,.06);}' +
      '.modal-footer .procert-badge{font-size:14px;}' +

      /* List view tweaks */
      '.courseware-grid.list-view{grid-template-columns:1fr !important;}' +
      '.courseware-grid.list-view .courseware-card{display:grid;grid-template-columns:4px 1fr auto;grid-template-rows:auto;}' +
      '.courseware-grid.list-view .card-accent-bar{width:4px;height:100%;position:relative;border-radius:4px 0 0 4px;}' +
      '.courseware-grid.list-view .card-body{padding:16px 20px;}' +
      '.courseware-grid.list-view .card-description{-webkit-line-clamp:1;}';

    document.head.appendChild(style);
  }

  // ─── Init ───────────────────────────────────────────────────────────
  function init() {
    cacheDom();
    if (!els.grid) return; // Not on marketplace page

    injectStyles();
    setupScrollAnimation();
    bindEvents();

    // Initial render
    currentItems = getFilteredItems();
    showNextPage(false);
    updateResultsCount();
    updateLoadMoreVisibility();

    // Default to grid view
    setView('grid');
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
