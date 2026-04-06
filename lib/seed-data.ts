import type { Company, AnalysisResult, UserActivity } from './types';

export const DEMO_USERS = [
  { id: 'admin-1', username: 'admin', password: 'admin123', role: 'admin' as const },
  { id: 'user-1', username: 'user', password: 'user123', role: 'user' as const },
];

export const SEED_COMPANIES: Company[] = [
  {
    id: 'company-1',
    name: 'EcoTech Industries',
    industry: 'Technology Manufacturing',
    sustainabilityCertifications: ['ISO 14001', 'B Corp'],
    createdAt: '2020-01-15',
    updatedAt: '2024-03-01',
    historicalClaims: [
      {
        id: 'claim-1-1',
        text: 'Our manufacturing process has reduced carbon emissions by 45% since 2019 through renewable energy adoption and process optimization.',
        category: 'emissions',
        date: '2024-01-15',
        verified: true,
        certifications: ['ISO 14001'],
      },
      {
        id: 'claim-1-2',
        text: 'We use 100% recycled aluminum in our premium product line, verified by third-party auditors.',
        category: 'materials',
        date: '2023-06-20',
        verified: true,
      },
      {
        id: 'claim-1-3',
        text: 'Our packaging is completely eco-friendly and biodegradable.',
        category: 'packaging',
        date: '2022-11-10',
        verified: false,
      },
      {
        id: 'claim-1-4',
        text: 'EcoTech aims to be carbon neutral by 2030 through offset programs.',
        category: 'emissions',
        date: '2021-03-22',
        verified: false,
      },
    ],
  },
  {
    id: 'company-2',
    name: 'GreenLeaf Packaging',
    industry: 'Packaging & Containers',
    sustainabilityCertifications: ['FSC Certified', 'Cradle to Cradle'],
    createdAt: '2019-05-10',
    updatedAt: '2024-02-15',
    historicalClaims: [
      {
        id: 'claim-2-1',
        text: 'All our cardboard products contain minimum 80% post-consumer recycled content, verified quarterly.',
        category: 'materials',
        date: '2024-02-01',
        verified: true,
        certifications: ['FSC Certified'],
      },
      {
        id: 'claim-2-2',
        text: 'Our new plant-based packaging line is 100% compostable within 90 days in industrial composting facilities.',
        category: 'packaging',
        date: '2023-09-15',
        verified: true,
        certifications: ['Cradle to Cradle'],
      },
      {
        id: 'claim-2-3',
        text: 'GreenLeaf products are completely plastic-free and environmentally safe.',
        category: 'general',
        date: '2022-04-22',
        verified: false,
      },
    ],
  },
  {
    id: 'company-3',
    name: 'CleanEnergy Corp',
    industry: 'Energy & Utilities',
    sustainabilityCertifications: ['RE100', 'Science Based Targets'],
    createdAt: '2018-08-20',
    updatedAt: '2024-01-30',
    historicalClaims: [
      {
        id: 'claim-3-1',
        text: 'We generate 2.5 GW of clean energy annually from our wind and solar installations across 12 states.',
        category: 'energy',
        date: '2024-01-10',
        verified: true,
        certifications: ['RE100'],
      },
      {
        id: 'claim-3-2',
        text: 'CleanEnergy has prevented 1.2 million tons of CO2 emissions in 2023 through renewable energy generation.',
        category: 'emissions',
        date: '2023-12-05',
        verified: true,
        certifications: ['Science Based Targets'],
      },
      {
        id: 'claim-3-3',
        text: 'Our natural gas plants are the cleanest in the industry.',
        category: 'emissions',
        date: '2022-07-18',
        verified: false,
      },
      {
        id: 'claim-3-4',
        text: 'We will achieve net-zero emissions by 2025.',
        category: 'emissions',
        date: '2021-01-05',
        verified: false,
      },
    ],
  },
  {
    id: 'company-4',
    name: 'PureWater Solutions',
    industry: 'Water & Utilities',
    sustainabilityCertifications: ['WaterSense Partner', 'Alliance for Water Stewardship'],
    createdAt: '2017-03-12',
    updatedAt: '2024-02-28',
    historicalClaims: [
      {
        id: 'claim-4-1',
        text: 'Our filtration systems reduce water waste by 60% compared to traditional methods, saving 2 billion gallons annually.',
        category: 'general',
        date: '2024-02-20',
        verified: true,
        certifications: ['WaterSense Partner'],
      },
      {
        id: 'claim-4-2',
        text: 'PureWater treatment facilities use 100% renewable energy for all operations.',
        category: 'energy',
        date: '2023-08-12',
        verified: true,
      },
      {
        id: 'claim-4-3',
        text: 'Our bottled water is the most sustainable choice for consumers.',
        category: 'packaging',
        date: '2022-05-30',
        verified: false,
      },
    ],
  },
  {
    id: 'company-5',
    name: 'NatureFoods Inc',
    industry: 'Food & Beverage',
    sustainabilityCertifications: ['USDA Organic', 'Rainforest Alliance', 'Fair Trade'],
    createdAt: '2016-11-05',
    updatedAt: '2024-03-10',
    historicalClaims: [
      {
        id: 'claim-5-1',
        text: '95% of our ingredients are sourced from certified organic farms within 500 miles of our facilities.',
        category: 'materials',
        date: '2024-03-01',
        verified: true,
        certifications: ['USDA Organic'],
      },
      {
        id: 'claim-5-2',
        text: 'Our supply chain supports 5,000+ smallholder farmers with fair trade premiums totaling $2.3M in 2023.',
        category: 'general',
        date: '2023-11-20',
        verified: true,
        certifications: ['Fair Trade'],
      },
      {
        id: 'claim-5-3',
        text: 'NatureFoods packaging is 100% recyclable and made from plant-based materials.',
        category: 'packaging',
        date: '2023-04-15',
        verified: true,
        certifications: ['Rainforest Alliance'],
      },
      {
        id: 'claim-5-4',
        text: 'All our products are completely natural with zero environmental impact.',
        category: 'general',
        date: '2021-09-08',
        verified: false,
      },
    ],
  },
];

export const SEED_ANALYSES: AnalysisResult[] = [
  {
    id: 'analysis-1',
    companyId: 'company-1',
    companyName: 'EcoTech Industries',
    inputType: 'text',
    originalInput: 'Our products are 100% eco-friendly and completely sustainable.',
    classification: {
      label: 'misleading',
      confidence: 0.87,
      reasons: [
        'Uses vague terms without specific metrics',
        'Absolute claims without verification',
        'No third-party certification mentioned',
      ],
    },
    riskScores: {
      greenwashingRisk: 72,
      companyCredibility: 65,
      riskLevel: 'high',
    },
    suspiciousPhrases: [
      {
        text: '100% eco-friendly',
        reason: 'Absolute environmental claim without supporting evidence',
        severity: 'high',
        startIndex: 16,
        endIndex: 32,
      },
      {
        text: 'completely sustainable',
        reason: 'Vague sustainability claim lacking specific metrics',
        severity: 'medium',
        startIndex: 37,
        endIndex: 59,
      },
    ],
    historicalComparison: {
      consistencyScore: 45,
      similarities: [],
      contradictions: [
        {
          claimId: 'claim-1-3',
          claimText: 'Our packaging is completely eco-friendly and biodegradable.',
          similarity: 0.78,
          isContradiction: true,
          contradictionReason: 'Previous unverified claim uses similar vague language',
        },
      ],
    },
    sustainabilityCheck: {
      sdgAlignment: ['SDG 12: Responsible Consumption'],
      griCompliance: 'non-compliant',
      esgNotes: 'Claim lacks specific environmental metrics required for GRI compliance.',
    },
    createdAt: '2024-03-15T10:30:00Z',
    processingTime: 2340,
  },
];

export const SEED_ACTIVITIES: UserActivity[] = [
  {
    id: 'activity-1',
    userId: 'user-1',
    action: 'analysis',
    details: 'Analyzed claim for EcoTech Industries',
    timestamp: '2024-03-15T10:30:00Z',
  },
  {
    id: 'activity-2',
    userId: 'user-1',
    action: 'view_result',
    details: 'Viewed analysis result for EcoTech Industries',
    timestamp: '2024-03-15T10:35:00Z',
  },
  {
    id: 'activity-3',
    userId: 'admin-1',
    action: 'login',
    details: 'Admin logged in',
    timestamp: '2024-03-14T09:00:00Z',
  },
];
