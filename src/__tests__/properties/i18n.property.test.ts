import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_CONFIG,
  localeConfig,
  locales,
  getLocalizedPath,
  isValidLocale,
} from '@/lib/i18n';

describe('i18n Property Tests (Portuguese Only)', () => {
  /**
   * Property: All supported locales have valid configuration
   */
  it('all supported locales have valid configuration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          const config = LOCALE_CONFIG[locale];
          expect(config).toBeDefined();
          expect(config.name).toBeTruthy();
          expect(config.nativeName).toBeTruthy();
          expect(['ltr', 'rtl']).toContain(config.direction);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('registers Portuguese metadata and replaces locale prefixes safely', () => {
    expect(localeConfig.pt).toEqual({
      name: 'Portuguese',
      nativeName: 'Português',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
    });
    expect(getLocalizedPath('/pt/tools/merge-pdf', 'pt')).toBe('/pt/tools/merge-pdf');
    expect(getLocalizedPath('/pt', 'pt')).toBe('/pt/');
    expect(getLocalizedPath('/plasma', 'pt')).toBe('/pt/plasma');
    expect(getLocalizedPath('tools/merge-pdf', 'pt')).toBe('/pt/tools/merge-pdf');
  });

  /**
   * Property: Default locale is always in supported locales
   */
  it('default locale is in supported locales', () => {
    expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  });

  /**
   * Property: All locales have correct text direction
   */
  it('all locales have correct text direction', () => {
    const RTL_LOCALES: string[] = ['ar'];
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          const config = LOCALE_CONFIG[locale];
          if (RTL_LOCALES.includes(locale)) {
            return config.direction === 'rtl';
          }
          return config.direction === 'ltr';
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: URL Locale Prefix
   */
  it('Property 5: generated URLs contain locale prefix', () => {
    const pathSegmentArb = fc.stringMatching(/^[a-z0-9][a-z0-9-]*[a-z0-9]$\vert{}^[a-z0-9]$/)
      .filter(s => s.length > 0 && s.length <= 30);

    const pathArb = fc.array(pathSegmentArb, { minLength: 0, maxLength: 3 })
      .map(segments => segments.length > 0 ? '/' + segments.join('/') : '/');

    fc.assert(
      fc.property(
        fc.constantFrom(...locales),
        pathArb,
        (locale, path) => {
          const localizedPath = getLocalizedPath(path, locale);

          expect(localizedPath).toMatch(new RegExp(`^/${locale}(/|$)`));

          const extractedLocale = localizedPath.split('/')[1];
          expect(isValidLocale(extractedLocale)).toBe(true);
          expect(extractedLocale).toBe(locale);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All locales produce valid prefixed URLs for root
   */
  it('Property 5: all locales produce valid prefixed URLs for root', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...SUPPORTED_LOCALES),
        (locale) => {
          const localizedPath = getLocalizedPath('/', locale);

          expect(localizedPath).toBe(`/${locale}/`);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});