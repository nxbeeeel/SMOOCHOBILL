import { Request, Response } from 'express';
export declare const sendEmailAlert: (req: Request, res: Response) => Promise<void>;
export declare const sendWhatsAppAlert: (req: Request, res: Response) => Promise<void>;
export declare const sendLowStockAlert: (req: Request, res: Response) => Promise<void>;
export declare const sendExpiryAlert: (req: Request, res: Response) => Promise<void>;
export declare const getAlertLogs: (req: Request, res: Response) => Promise<void>;
export declare const testAlertConfiguration: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=alertController.d.ts.map