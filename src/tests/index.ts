import { holland } from './holland'
import { itRole } from './itRole'
import { bigFive } from './bigFive'
import { disc } from './disc'
import { burnout } from './burnout'
import { impostor } from './impostor'
import type { CareerTest, TestCategory } from './types'

export const tests: CareerTest[] = [holland, itRole, bigFive, disc, burnout, impostor]

export const categoryTitles: Record<TestCategory, string> = {
  career: 'Профориентация',
  personality: 'Личность в работе',
  state: 'Состояние',
}

export function findTest(slug: string | undefined): CareerTest | undefined {
  return tests.find((test) => test.slug === slug)
}
