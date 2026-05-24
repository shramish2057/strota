/**
 * @strota/corpus - regulatory corpus loader.
 *
 * Phase 1 ships only the directory layout and version metadata. Loaders for
 * verfahrensart, requirement_matrix, B-Plan resolvers etc. arrive in Phase 4.
 */

export const CORPUS_VERSION = '0.1.0-phase1-skeleton' as const;

export interface CorpusMetadata {
  bundesland: string;
  version: string;
  effective_from: string;
  source_url: string;
  retrieved_at: string;
  kuratiert_durch: string;
  lizenz_status: 'public_domain' | 'gemeinde_freigabe' | 'verweis_nur' | 'unklar';
}

/**
 * Placeholder until Phase 4 implements per-Bundesland loaders.
 */
export function getCorpusVersion(): string {
  return CORPUS_VERSION;
}
