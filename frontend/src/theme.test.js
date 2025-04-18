import theme from './theme';

describe('Theme', () => {
  test('should have primary color defined', () => {
    expect(theme.palette.primary).toBeDefined();
    expect(theme.palette.primary.main).toBe('#2563EB');
  });

  test('should have secondary color defined', () => {
    expect(theme.palette.secondary).toBeDefined();
    expect(theme.palette.secondary.main).toBe('#7C3AED');
  });

  test('should have typography settings', () => {
    expect(theme.typography).toBeDefined();
    expect(theme.typography.fontFamily).toContain('Inter');
  });

  test('should have shape settings', () => {
    expect(theme.shape).toBeDefined();
    expect(theme.shape.borderRadius).toBe(8);
  });
});
