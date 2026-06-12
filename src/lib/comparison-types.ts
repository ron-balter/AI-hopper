export type ComparisonTable = {
  specs: string[];
  rows: Array<{
    candidateId: string;
    title: string;
    source: string;
    values: Record<string, string>;
  }>;
  summary?: string;
};

export function parseComparisonTable(json: string | null | undefined): ComparisonTable | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as ComparisonTable;
  } catch {
    return null;
  }
}
