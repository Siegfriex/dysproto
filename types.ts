
export interface Metric {
  name: string;
  score: number;
  fullMark: number;
}

export interface Color {
  hex: string;
  rgb: string;
}

export interface DetectedObject {
  name: string;
  confidence: number;
}

export interface MetricDetail {
  score: number;
  reason: string;
  benchmark: string;
  keyElements: string[];
}

export interface AnalysisResult {
  fileName: string;
  timestamp: string;
  summary: string;
  metrics: {
    layout: MetricDetail;
    typography: MetricDetail;
    color: MetricDetail;
    components: MetricDetail;
    formLanguage: MetricDetail;
    overall: number;
    [key: string]: MetricDetail | number; // Index signature for dynamic access
  };
  colors: Color[];
  keywords: string[];
  detectedObjects: DetectedObject[];
  suggestions: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SearchResult {
  id: string;
  imageUrl: string;
  similarity: number;
  title: string;
  category: string;
  reason: string; // Why this result matches (e.g. "Similar Color Harmony")
  awards?: string[]; // e.g. "Red Dot", "iF Design"
  isSaved?: boolean;
}
