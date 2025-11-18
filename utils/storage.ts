
// This utility manages a client-side SQLite database that persists to IndexedDB.
// It satisfies the requirement for "SQLite storage" while running on static hosting like Vercel.

let db: any = null;
let SQL: any = null;

const DB_NAME = 'ArchivingSystemSQLite';
const STORE_NAME = 'sqlite_store';
const KEY_NAME = 'sqlite_db_file';

let saveTimeout: any = null;
let isSaving = false;

// Load the SQLite binary from IndexedDB
const loadDBFromIndexedDB = async (): Promise<Uint8Array | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(KEY_NAME);

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      getRequest.onerror = () => {
        console.error("Error reading from IndexedDB");
        resolve(null);
      };
    };

    request.onerror = () => {
      console.error("Error opening IndexedDB");
      resolve(null);
    };
  });
};

// Save the SQLite binary to IndexedDB with Debounce
const scheduleSaveDBToIndexedDB = async (onStatusChange?: (status: 'saving' | 'saved' | 'error') => void) => {
  if (!db) return;
  
  // Clear existing timeout to prevent spamming writes
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  if (onStatusChange) onStatusChange('saving');

  saveTimeout = setTimeout(async () => {
    try {
        isSaving = true;
        const binaryArray = db.export();
        await new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onsuccess = (event: any) => {
            const dbInstance = event.target.result;
            const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const putRequest = store.put(binaryArray, KEY_NAME);

            putRequest.onsuccess = () => resolve();
            putRequest.onerror = (err: any) => reject(err);
            };
        });
        isSaving = false;
        if (onStatusChange) onStatusChange('saved');
        console.log("Data persisted to disk successfully.");
    } catch (e) {
        console.error("Failed to persist data to disk", e);
        isSaving = false;
        if (onStatusChange) onStatusChange('error');
    }
  }, 1000); // Wait 1 second after last change before writing to disk
};

export const initDB = async (): Promise<any> => {
  if (db) return db;

  // @ts-ignore
  if (!window.initSqlJs) {
    throw new Error("SQL.js library not loaded");
  }

  // @ts-ignore
  SQL = await window.initSqlJs({
    // Point to the WASM file on CDN
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  const savedData = await loadDBFromIndexedDB();

  if (savedData) {
    db = new SQL.Database(savedData);
  } else {
    db = new SQL.Database();
    // Initialize Schema
    db.run(`
      CREATE TABLE IF NOT EXISTS contracts (id INTEGER PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY, data TEXT);
      CREATE TABLE IF NOT EXISTS contract_types (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);
    `);
    // Initial save to create the file structure
    await scheduleSaveDBToIndexedDB(); 
  }
  
  return db;
};

export const saveData = async (storeName: string, data: any, onStatusChange?: (status: 'saving' | 'saved' | 'error') => void) => {
  try {
      await initDB();
      
      // 1. Update In-Memory SQLite immediately for fast UI response
      db.run("BEGIN TRANSACTION");
      db.run(`DELETE FROM ${storeName}`);
      
      const stmt = db.prepare(`INSERT INTO ${storeName} (id, data) VALUES (?, ?)`);
      if (Array.isArray(data)) {
          data.forEach(item => {
              const id = item.id || Date.now() + Math.random(); 
              stmt.run([id, JSON.stringify(item)]);
          });
      }
      stmt.free();
      db.run("COMMIT");
      
      // 2. Schedule Disk Persistence (Debounced)
      scheduleSaveDBToIndexedDB(onStatusChange);

  } catch (e) {
      console.error("Save Data Error", e);
      if(db) {
          try { db.run("ROLLBACK"); } catch(err) {}
      }
      if (onStatusChange) onStatusChange('error');
  }
};

export const loadData = async <T>(storeName: string, defaultValue: T): Promise<T> => {
  try {
      await initDB();
      
      try {
          db.exec(`SELECT 1 FROM ${storeName} LIMIT 1`);
      } catch (e) {
           db.run(`CREATE TABLE IF NOT EXISTS ${storeName} (id INTEGER PRIMARY KEY, data TEXT)`);
           return defaultValue;
      }

      const result = db.exec(`SELECT data FROM ${storeName}`);
      
      if (result.length > 0 && result[0].values) {
          const rows = result[0].values;
          const parsedData = rows.map((row: any[]) => JSON.parse(row[0]));
          return parsedData as unknown as T;
      }
      
      return defaultValue;
  } catch (e) {
      console.error("Load Data Error", e);
      return defaultValue;
  }
};

export const createBackup = async (): Promise<string> => {
    await initDB();
    const backup: Record<string, any> = {};
    const tables = ['contracts', 'users', 'audit_log', 'contract_types'];
    
    for (const table of tables) {
        backup[table] = await loadData(table, []);
    }
    return JSON.stringify(backup);
};

export const restoreBackup = async (jsonString: string): Promise<boolean> => {
    try {
        const data = JSON.parse(jsonString);
        const tables = ['contracts', 'users', 'audit_log', 'contract_types'];
        
        for (const table of tables) {
            if (data[table]) {
                // Force save immediately, no debounce for restore
                await initDB();
                db.run("BEGIN TRANSACTION");
                db.run(`DELETE FROM ${table}`);
                const stmt = db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`);
                data[table].forEach((item: any) => {
                    const id = item.id || Date.now() + Math.random(); 
                    stmt.run([id, JSON.stringify(item)]);
                });
                stmt.free();
                db.run("COMMIT");
            }
        }
        // Force write to disk
        const binaryArray = db.export();
        await new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onsuccess = (event: any) => {
                const dbInstance = event.target.result;
                const transaction = dbInstance.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.put(binaryArray, KEY_NAME);
                transaction.oncomplete = () => resolve();
            };
        });
        
        return true;
    } catch (e) {
        console.error("Restore Error", e);
        return false;
    }
};
