"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class DatabaseManager {
    constructor() {
        this.db = null;
        const dataDir = path_1.default.join(__dirname, '../../data');
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        this.dbPath = path_1.default.join(dataDir, 'smoocho.db');
    }
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3_1.default.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                    return;
                }
                console.log('Connected to SQLite database');
                this.db.run('PRAGMA foreign_keys = ON', (err) => {
                    if (err) {
                        console.error('Error enabling foreign keys:', err);
                        reject(err);
                        return;
                    }
                    this.createTables()
                        .then(() => resolve(this.db))
                        .catch(reject);
                });
            });
        });
    }
    async createTables() {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
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
    async initializeData() {
        const schemaPath = path_1.default.join(__dirname, 'schema.sql');
        const schemaData = fs_1.default.readFileSync(schemaPath, 'utf8');
        return new Promise((resolve, reject) => {
            this.db.exec(schemaData, (err) => {
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
    getDatabase() {
        if (!this.db) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    }
    async close() {
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
            }
            else {
                resolve();
            }
        });
    }
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    }
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
    async transaction(callback) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                callback()
                    .then((result) => {
                    this.db.run('COMMIT', (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(result);
                    });
                })
                    .catch((error) => {
                    this.db.run('ROLLBACK', (rollbackErr) => {
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
const databaseManager = new DatabaseManager();
exports.default = databaseManager;
//# sourceMappingURL=index.js.map