/**
 * Contratos canônicos de tipos para seções, componentes e widgets
 * Padrão AstroWind adaptado para o ecossistema Supletivo.net.br
 */

export interface Widget {
  id?: string;
  isDark?: boolean;
  bg?: string;
  classes?: Record<string, string | Record<string, string> | undefined>;
}

export interface Headline {
  title?: string;
  subtitle?: string;
  tagline?: string;
  isDark?: boolean;
  classes?: Record<string, string | undefined>;
}

export interface CallToAction {
  text?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link';
  target?: string;
  icon?: string;
  class?: string;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: unknown;
}

export interface Item {
  title?: string;
  description?: string;
  icon?: string;
  callToAction?: CallToAction;
  href?: string;
  classes?: Record<string, string>;
}

export interface Stat {
  amount?: number | string;
  title?: string;
  icon?: string;
}

export interface MetaData {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  schema?: Record<string, unknown>;
}
