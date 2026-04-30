// lib/types.ts
// Shared TypeScript interfaces for SkillForge

export type FeatureStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type ContributionStatus = 'pending' | 'approved' | 'rejected'
export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface User {
  id: string
  full_name: string
  avatar_url: string | null
  email: string
  company_domain: string
  role: string
  points: number
}

export interface Feature {
  id: string
  project_id: string
  title: string
  description: string | null
  status: FeatureStatus
  assigned_to: string | null
  created_at: string
  // Joined fields
  assigned_user?: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

export interface Contribution {
  id: string
  project_id: string
  user_id: string
  feature_id: string | null
  status: ContributionStatus
  created_at: string
  // Joined fields
  user?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  feature?: {
    id: string
    title: string
  }
}

export interface ProjectListItem {
  id: string
  name: string
  pitch: string
  tech_stack: string[]
  status: string
  created_at: string
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  feature_total: number
  feature_done: number
  contributors: {
    id: string
    full_name: string
    avatar_url: string | null
  }[]
}

export interface ProjectDetail {
  id: string
  name: string
  pitch: string
  tech_stack: string[]
  status: string
  created_at: string
  created_by: string
  creator: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  features: Feature[]
  team: {
    id: string
    full_name: string
    avatar_url: string | null
    is_lead: boolean
  }[]
}
