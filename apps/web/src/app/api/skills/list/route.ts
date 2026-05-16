/**
 * GET /api/skills/list
 * Returns all available legal skills, optionally filtered by category.
 * Query: ?category=contratos | laboral | privacidad | corporativo | litigios | ip | regulatorio
 * Query: ?featured=true — returns only featured skills
 */

import { NextRequest, NextResponse } from 'next/server'
import { LEGAL_SKILLS, SKILL_CATEGORIES, getFeaturedSkills, getSkillsByCategory } from '@/lib/legal-skills'
import type { SkillCategory } from '@/lib/legal-skills'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') as SkillCategory | null
  const featuredOnly = searchParams.get('featured') === 'true'

  let skills = LEGAL_SKILLS
  if (featuredOnly) skills = getFeaturedSkills()
  else if (category) skills = getSkillsByCategory(category)

  return NextResponse.json({
    skills,
    categories: SKILL_CATEGORIES,
    total: skills.length,
  })
}
