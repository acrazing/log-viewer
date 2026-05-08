/*
 * @since 2026-05-07 00:00:00
 * @author junbao <junbao@moego.pet>
 */

import { HistoryListItem, HistoryRecord, HistoryRecordInput } from '../../shared/types';

const DB_NAME = 'log-viewer-history';
const DB_VERSION = 4;
const RECORD_STORE = 'records';
const ITEM_STORE = 'items';
const TIME_INDEX = 'time';
const CONTENT_KEY_INDEX = 'contentKey';
const FNV_64_OFFSET = 0xcbf29ce484222325n;
const FNV_64_PRIME = 0x100000001b3n;
const FNV_64_MASK = 0xffffffffffffffffn;

interface StoredHistoryRecord extends HistoryRecord {
  contentKey: string;
}

function getContentKey(content: string) {
  let hash = FNV_64_OFFSET;
  for (let i = 0; i < content.length; i++) {
    hash ^= BigInt(content.charCodeAt(i));
    hash = (hash * FNV_64_PRIME) & FNV_64_MASK;
  }
  return `${content.length}:${hash.toString(16).padStart(16, '0')}`;
}

function toHistoryRecord(record: StoredHistoryRecord): HistoryRecord {
  const { contentKey, ...historyRecord } = record;
  return historyRecord;
}

function toListItem(record: StoredHistoryRecord | HistoryRecord): HistoryListItem {
  const { content, ...recordWithoutContent } = record;
  const { contentKey, ...item } = recordWithoutContent as Omit<StoredHistoryRecord, 'content'>;
  return item;
}

function openHistoryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const tx = request.transaction;
      let recordStore: IDBObjectStore;

      if (!db.objectStoreNames.contains(RECORD_STORE)) {
        recordStore = db.createObjectStore(RECORD_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      } else {
        recordStore = tx!.objectStore(RECORD_STORE);
      }

      if (!recordStore.indexNames.contains(CONTENT_KEY_INDEX)) {
        recordStore.createIndex(CONTENT_KEY_INDEX, CONTENT_KEY_INDEX);
      }

      let shouldBackfillItems = false;
      let itemStore: IDBObjectStore;
      if (!db.objectStoreNames.contains(ITEM_STORE)) {
        itemStore = db.createObjectStore(ITEM_STORE, {
          keyPath: 'id',
        });
        itemStore.createIndex(TIME_INDEX, TIME_INDEX);
        shouldBackfillItems = event.oldVersion > 0;
      } else {
        itemStore = tx!.objectStore(ITEM_STORE);
        shouldBackfillItems = event.oldVersion < 3;
      }

      if (shouldBackfillItems || event.oldVersion < 4) {
        const cursorRequest = recordStore.openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor) {
            return;
          }

          const storedRecord = cursor.value as StoredHistoryRecord;
          if (!storedRecord.contentKey || event.oldVersion < 4) {
            storedRecord.contentKey = getContentKey(storedRecord.content || '');
            cursor.update(storedRecord);
          }
          if (shouldBackfillItems) {
            itemStore.put(toListItem(storedRecord));
          }
          cursor.continue();
        };
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function dbError(error: DOMException | null) {
  return error || new Error('IndexedDB operation failed');
}

export function addHistoryRecord(record: HistoryRecordInput): Promise<HistoryRecord> {
  const contentKey = getContentKey(record.content);

  return openHistoryDb().then(
    (db) =>
      new Promise<HistoryRecord>((resolve, reject) => {
        const tx = db.transaction([RECORD_STORE, ITEM_STORE], 'readwrite');
        const recordStore = tx.objectStore(RECORD_STORE);
        const itemStore = tx.objectStore(ITEM_STORE);
        let saved: StoredHistoryRecord | undefined;
        let matched = false;

        tx.oncomplete = () => {
          db.close();
          resolve(toHistoryRecord(saved!));
        };
        tx.onabort = () => {
          db.close();
          reject(dbError(tx.error));
        };
        tx.onerror = () => {
          db.close();
          reject(dbError(tx.error));
        };

        const index = recordStore.index(CONTENT_KEY_INDEX);
        const request = index.openCursor(IDBKeyRange.only(contentKey));
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            if (!matched) {
              const addRequest = recordStore.add({
                ...record,
                contentKey,
              });
              addRequest.onsuccess = () => {
                saved = {
                  ...record,
                  contentKey,
                  id: Number(addRequest.result),
                };
                itemStore.put(toListItem(saved));
              };
            }
            return;
          }

          const existing = cursor.value as StoredHistoryRecord;
          if (existing.content !== record.content) {
            cursor.continue();
            return;
          }

          if (matched) {
            recordStore.delete(existing.id);
            itemStore.delete(existing.id);
            cursor.continue();
            return;
          }

          matched = true;
          saved = {
            ...existing,
            ...record,
            id: existing.id,
            contentKey,
          };
          const putRequest = cursor.update(saved);
          putRequest.onsuccess = () => {
            itemStore.put(toListItem(saved!));
            cursor.continue();
          };
        };
      })
  );
}

export function listHistoryRecords(): Promise<HistoryListItem[]> {
  return openHistoryDb().then(
    (db) =>
      new Promise<HistoryListItem[]>((resolve, reject) => {
        const tx = db.transaction(ITEM_STORE, 'readonly');
        const items: HistoryListItem[] = [];
        const request = tx.objectStore(ITEM_STORE).index(TIME_INDEX).openCursor(null, 'prev');

        tx.oncomplete = () => {
          db.close();
          resolve(items);
        };
        tx.onabort = () => {
          db.close();
          reject(dbError(tx.error));
        };
        tx.onerror = () => {
          db.close();
          reject(dbError(tx.error));
        };

        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            return;
          }

          items.push(cursor.value as HistoryListItem);
          cursor.continue();
        };
      })
  );
}

export function getHistoryRecord(id: number): Promise<HistoryRecord | undefined> {
  return openHistoryDb().then(
    (db) =>
      new Promise<HistoryRecord | undefined>((resolve, reject) => {
        const tx = db.transaction(RECORD_STORE, 'readonly');
        let record: HistoryRecord | undefined;
        const request = tx.objectStore(RECORD_STORE).get(id);

        tx.oncomplete = () => {
          db.close();
          resolve(record);
        };
        tx.onabort = () => {
          db.close();
          reject(dbError(tx.error));
        };
        tx.onerror = () => {
          db.close();
          reject(dbError(tx.error));
        };

        request.onsuccess = () => {
          if (request.result) {
            record = toHistoryRecord(request.result as StoredHistoryRecord);
          }
        };
      })
  );
}

export function deleteHistoryRecord(id: number): Promise<void> {
  return openHistoryDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction([RECORD_STORE, ITEM_STORE], 'readwrite');

        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onabort = () => {
          db.close();
          reject(dbError(tx.error));
        };
        tx.onerror = () => {
          db.close();
          reject(dbError(tx.error));
        };

        tx.objectStore(RECORD_STORE).delete(id);
        tx.objectStore(ITEM_STORE).delete(id);
      })
  );
}
