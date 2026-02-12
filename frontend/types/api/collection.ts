export interface Collection<T> {
  "@context": string;
  "@id": string;
  "@type": "Collection";
  totalItems: number;
  member: T[];
}
