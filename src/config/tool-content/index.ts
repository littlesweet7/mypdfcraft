/**
 * Tool content exports for Portuguese
 * Requirements: Single language support (pt)
 */

import { toolContentPt } from './pt';
import { ToolContent } from '@/types/tool';
import type { Locale } from '@/lib/i18n/config';

export type { Locale } from '@/lib/i18n/config';

/**
 * Get tool content for a specific locale
 */
export function getToolContent(locale: Locale, toolId: string): ToolContent | undefined {
  const contentMap: Record<string, Record<string, ToolContent>> = {
    pt: toolContentPt,
  };

  // Se o idioma solicitado não existir no mapa, força o 'pt' ou retorna undefined
  const localeContent = contentMap[locale] || contentMap['pt'];
  
  if (localeContent && localeContent[toolId]) {
    return localeContent[toolId];
  }

  // Fallback direto para o português caso o ID específico não seja encontrado
  return toolContentPt[toolId];
}