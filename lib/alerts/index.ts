import { Alert, Source } from './types'
import { toAlerts as from511 } from './adapters/ontario511'
import { toAlerts as fromAqhi } from './adapters/mscAqhi'

const adapters: Record<Source, (raw: any) => Alert[]> = {
  '511on': from511,
  'msc-aqhi': fromAqhi,
  'msc-cap': () => [],
  'tfs': () => [],
  'tps': () => [],
  'ttc': () => [],
}

export const adapt = (source: Source, raw: unknown): Alert[] =>
  adapters[source](raw)

export const adaptAll = (payloads: { source: Source, raw: unknown }[]): Alert[] =>
  payloads.flatMap(p => adapt(p.source, p.raw))

export * from './types'
