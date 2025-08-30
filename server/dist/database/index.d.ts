import { Database } from 'sqlite3';
declare class DatabaseManager {
    private db;
    private dbPath;
    constructor();
    initialize(): Promise<Database>;
    private createTables;
    initializeData(): Promise<void>;
    getDatabase(): Database;
    close(): Promise<void>;
    run(sql: string, params?: any[]): Promise<{
        lastID: number;
        changes: number;
    }>;
    get(sql: string, params?: any[]): Promise<any>;
    all(sql: string, params?: any[]): Promise<any[]>;
    transaction<T>(callback: () => Promise<T>): Promise<T>;
}
declare const databaseManager: DatabaseManager;
export default databaseManager;
//# sourceMappingURL=index.d.ts.map