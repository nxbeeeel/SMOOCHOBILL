import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { Database } from 'sqlite3';

class DatabaseManager {
  private db: Database | null = null;
  private dbPath: string;

  constructor() {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = path.join(dataDir, 'smoocho.db');
  }

  async initialize(): Promise<Database> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
          return;
        }

        console.log('Connected to SQLite database');
        
        // Enable foreign keys
        this.db!.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('Error enabling foreign keys:', err);
            reject(err);
            return;
          }

          this.createTables()
            .then(() => resolve(this.db!))
            .catch(reject);
        });
      });
    });
  }

  private async createTables(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    return new Promise((resolve, reject) => {
      this.db!.exec(schema, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
          return;
        }

        console.log('Database tables created successfully');
        resolve();
      });
    });
  }

  async initializeData(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaData = fs.readFileSync(schemaPath, 'utf8');

    return new Promise((resolve, reject) => {
      this.db!.exec(schemaData, (err) => {
        if (err) {
          console.error('Error initializing database schema:', err);
          reject(err);
          return;
        }

        console.log('Database initialized with schema and sample data');
        resolve();
      });
    });
  }

  getDatabase(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
            return;
          }
          console.log('Database connection closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Helper method for running queries with better error handling
  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  // Transaction support
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db!.serialize(() => {
        this.db!.run('BEGIN TRANSACTION');
        
        callback()
          .then((result) => {
            this.db!.run('COMMIT', (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(result);
            });
          })
          .catch((error) => {
            this.db!.run('ROLLBACK', (rollbackErr) => {
              if (rollbackErr) {
                console.error('Error rolling back transaction:', rollbackErr);
              }
              reject(error);
            });
          });
      });
    });
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

export default databaseManager;

