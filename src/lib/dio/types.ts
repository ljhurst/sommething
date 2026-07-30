export interface DioImageInput {
  data: string;
  media_type: string;
}

export interface DioLabel {
  producer: string | null;
  wine_name: string | null;
  vintage: number | null;
  country_iso_alpha_3: string | null;
  region: string | null;
  appellation: string | null;
  grape_varieties: string[];
  abv_percent: number | null;
  volume_ml: number | null;
  wine_type: string | null;
  classification: string | null;
  closure: string | null;
  certifications: string[];
  barcode: string | null;
}

export interface DioEnrichment {
  matched: boolean;
  wine_searcher_url: string | null;
  price: number | null;
  critic_score: number | null;
}

export interface DioMeta {
  model: string;
  extracted_at: string;
  warnings: string[];
}

export interface DioExtractResponse {
  schema_version: number;
  label: DioLabel;
  enrichment: DioEnrichment;
  meta: DioMeta;
}
