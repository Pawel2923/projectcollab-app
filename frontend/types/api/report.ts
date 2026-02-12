export interface Report {
  "@id": string;
  "@type": "Report";
  "@context"?: "/contexts/Report";
  id: number;
  name: string;
  type: string;
  format: string;
  createdAt: string;
  project: string;
  fileUrl: string;
}
