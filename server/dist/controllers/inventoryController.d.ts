import { Request, Response } from 'express';
export declare const getAllInventoryItems: (req: Request, res: Response) => Promise<void>;
export declare const getInventoryItemById: (req: Request, res: Response) => Promise<void>;
export declare const createInventoryItem: (req: Request, res: Response) => Promise<void>;
export declare const updateInventoryItem: (req: Request, res: Response) => Promise<void>;
export declare const addStock: (req: Request, res: Response) => Promise<void>;
export declare const deductStock: (req: Request, res: Response) => Promise<void>;
export declare const getStockTransactions: (req: Request, res: Response) => Promise<void>;
export declare const getLowStockAlerts: (req: Request, res: Response) => Promise<void>;
export declare const getExpiryAlerts: (req: Request, res: Response) => Promise<void>;
export declare const getInventoryReport: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=inventoryController.d.ts.map