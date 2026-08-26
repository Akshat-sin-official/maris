export const colors = {
  primary: '#0284c7',
  secondary: '#0284c7',
  accent: '#0369a1',
  background: '#f8fafc',
  surface: '#ffffff',
  card: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0284c7',
};

export const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
};

export const lightTheme = theme;

export type Theme = typeof theme;
