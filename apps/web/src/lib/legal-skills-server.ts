/**
 * Server-only loaders for claude-for-legal skill prompts.
 * Import ONLY from API routes and Server Components — never from client components.
 */

import fs from 'fs'
import path from 'path'
import { LEGAL_SKILLS } from './legal-skills'

const BASE_PATH = path.join(process.cwd(), '..', '..', 'packages', 'claude-for-legal')

const SKILLS_BY_ID = new Map(LEGAL_SKILLS.map(s => [s.id, s]))

export function loadSkillPrompt(skillId: string): string | null {
  const skill = SKILLS_BY_ID.get(skillId)
  if (!skill) return null
  try {
    return fs.readFileSync(
      path.join(BASE_PATH, skill.plugin, 'skills', skill.skill, 'skill.md'),
      'utf-8',
    )
  } catch {
    return null
  }
}

export function loadPluginProfile(plugin: string): string | null {
  try {
    return fs.readFileSync(path.join(BASE_PATH, plugin, 'CLAUDE.md'), 'utf-8')
  } catch {
    return null
  }
}
