export const recentProjects = [
  { id: '1', name: 'Q1 Platform BRD', createdAt: 'March 20, 2026', status: 'Completed' },
  { id: '2', name: 'API Integration Spec', createdAt: 'March 18, 2026', status: 'Draft' },
  { id: '3', name: 'User Onboarding Flow', createdAt: 'March 15, 2026', status: 'Completed' },
];

export const BRD_SECTION_IDS = [
  'executiveSummary',
  'businessObjectives',
  'stakeholders',
  'functionalRequirements',
  'assumptions',
  'timeline',
];

export const BRD_SECTION_LABELS = {
  executiveSummary: 'Executive Summary',
  businessObjectives: 'Business Objectives',
  stakeholders: 'Stakeholders',
  functionalRequirements: 'Functional Requirements',
  assumptions: 'Assumptions',
  timeline: 'Timeline',
};

export const initialBrdSections = {
  executiveSummary: 'This document outlines the business requirements for the BRD Agent platform. The system will enable teams to generate structured Business Requirements Documents from communication data such as emails and meeting transcripts, reducing manual effort and ensuring consistency.',
  businessObjectives: 'Primary objectives include:\n\n- **Automate** extraction of requirements from existing communications.\n- Provide a **single source of truth** for project requirements.\n- Support collaboration and versioning.\n- Enable export in standard formats for stakeholder review.',
  stakeholders: 'Key stakeholders: Product Managers (owners), Engineering Leads (implementation), Design (UX alignment), and External Clients (review and sign-off). Each has defined roles in the review and approval workflow.',
  functionalRequirements: 'Core features: Upload and parse CSV data (emails, transcripts). Generate structured BRD with configurable sections. In-app editing with change description. Export BRD as text or markdown. Dashboard for recent projects and quick access to create new BRDs.',
  assumptions: 'We assume: Source data is in the specified CSV format. Users have edit access to refine generated content. No real-time collaboration is required for MVP. Export is file-based only. Authentication and multi-tenancy are out of scope for the initial release.',
  timeline: 'Phase 1 (MVP): Dashboard, Upload, and Report screens with mock data – 2 weeks. Phase 2: Backend integration and real BRD generation – 3 weeks. Phase 3: Export formats and optional AI-assisted edits – 2 weeks.',
};
