import { Request, Response } from 'express';
export declare const syncZomatoOrders: (req: Request, res: Response) => Promise<void>;
export declare const updateZomatoOrderStatus: (req: Request, res: Response) => Promise<void>;
export declare const syncSwiggyOrders: (req: Request, res: Response) => Promise<void>;
export declare const updateSwiggyOrderStatus: (req: Request, res: Response) => Promise<void>;
export declare const processPaytmPayment: (req: Request, res: Response) => Promise<void>;
export declare const paytmCallback: (req: Request, res: Response) => Promise<void>;
export declare const zomatoWebhook: (req: Request, res: Response) => Promise<void>;
export declare const swiggyWebhook: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=integrationsController.d.ts.map