export type Constraint = {
  "@id": string;
  "@type": string;
  "@context": string;
  status: number;
  type: string;
  title: string;
  description: string;
  detail: string;
  violations: Array<{
    propertyPath: string;
    message: string;
    code: string;
  }>;
};
