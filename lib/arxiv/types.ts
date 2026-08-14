export type ArxivAuthor = {
  name: string;
  affiliation?: string;
};

export type ArxivPaper = {
  id: string;
  version: string | null;
  title: string;
  summary: string;
  authors: ArxivAuthor[];
  categories: string[];
  primaryCategory: string;
  published: string;
  updated: string;
  comment?: string;
  journalRef?: string;
  doi?: string;
  pdfUrl: string;
  absUrl: string;
  htmlUrl: string;
};

export type ArxivSearchParams = {
  query?: string;
  category?: string;
  categories?: string[];
  author?: string;
  start?: number;
  maxResults?: number;
  sortBy?: "submittedDate" | "lastUpdatedDate" | "relevance";
  sortOrder?: "ascending" | "descending";
};

export type ArxivSearchResult = {
  papers: ArxivPaper[];
  total: number;
  start: number;
  maxResults: number;
};
