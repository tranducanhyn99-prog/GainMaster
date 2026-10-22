import { themeTokens } from '../tokens';

describe('Clean Daylight (Style B) Impeccable Design Tokens', () => {
  it('pins the exact Style B palette and tabular numeral rules from the spec', () => {
    expect(themeTokens.colors.background).toBe('#F6F5F2');
    expect(themeTokens.colors.surface).toBe('#FFFFFF');
    expect(themeTokens.colors.border).toBe('#E2E8F0');
    expect(themeTokens.colors.primary).toBe('#10B981');
    expect(themeTokens.colors.sky).toBe('#0EA5E9');
    expect(themeTokens.colors.coral).toBe('#F97316');
    expect(themeTokens.colors.textPrimary).toBe('#0F172A');
    expect(themeTokens.typography.tabularNums.fontVariant).toContain('tabular-nums');
  });
});
