export interface ScanResult{
    fileName: string;
    sensitiveFields: {
        type: string;
        category: string;
        count: number;
      }[];
      timestamp: string; 
}