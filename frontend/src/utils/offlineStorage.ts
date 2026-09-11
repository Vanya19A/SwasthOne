export interface OfflineRecord {
  id: string
  type: 'patient' | 'screening' | 'referral'
  data: unknown
  createdAt: string
  synced: boolean
}

const STORAGE_KEY = 'swasthone_offline_records'

function getRecords(): OfflineRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecords(records: OfflineRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function saveOfflineRecord(
  type: OfflineRecord['type'],
  data: unknown,
) {
  const records = getRecords()

  const record: OfflineRecord = {
    id: crypto.randomUUID(),
    type,
    data,
    createdAt: new Date().toISOString(),
    synced: false,
  }

  records.push(record)
  saveRecords(records)

  return record
}

export function getOfflineRecords() {
  return getRecords()
}

export function getPendingRecords() {
  return getRecords().filter((record) => !record.synced)
}

export function markRecordSynced(id: string) {
  const records = getRecords().map((record) =>
    record.id === id
      ? { ...record, synced: true }
      : record,
  )

  saveRecords(records)
}

export function clearSyncedRecords() {
  const records = getRecords().filter((record) => !record.synced)
  saveRecords(records)
}