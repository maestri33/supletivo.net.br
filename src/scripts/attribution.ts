/**
 * Captura e persistência de atribuição (ref de afiliado + UTMs + click ids).
 *
 * Regras:
 *  - first-touch para `ref`: o primeiro ref capturado vence e NÃO é sobrescrito
 *    por visitas sem ref; um novo ref explícito na URL sobrescreve.
 *  - persistência dupla: localStorage (`sb_attribution`, JSON com timestamp)
 *    + cookie first-party (`sb_ref`, 90 dias, SameSite=Lax) como redundância.
 *  - todos os links <a data-cta> são reescritos no client para repassar os
 *    parâmetros ao app. Sem JS os CTAs seguem funcionando (href limpo no HTML).
 */

export const ATTR_KEYS = [
  'ref',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const;

type AttrKey = (typeof ATTR_KEYS)[number];
export type Attribution = Partial<Record<AttrKey, string>> & { ts?: number };

const LS_KEY = 'sb_attribution';
const COOKIE_NAME = 'sb_ref';
const ATTR_COOKIE_NAME = 'supletivo.attr';
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60;
const LS_MAX_AGE_MS = COOKIE_MAX_AGE * 1000;

export function cookieDomain(): string {
  try {
    const host = window.location.hostname;
    if (host === 'supletivo.net.br' || host.endsWith('.supletivo.net.br')) {
      return ';domain=.supletivo.net.br';
    }
  } catch {}
  return '';
}

function readCookieAttr(): Attribution | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${ATTR_COOKIE_NAME.replace('.', '\\.')}=([^;]+)`));
    if (!m) return null;
    const data = JSON.parse(decodeURIComponent(m[1])) as Attribution;
    if (data.ts && Date.now() - data.ts > LS_MAX_AGE_MS) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function readStored(): Attribution | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Attribution;
      if (!data.ts || Date.now() - data.ts <= LS_MAX_AGE_MS) {
        return data;
      }
      localStorage.removeItem(LS_KEY);
    }
  } catch {
    /* armazenamento indisponível */
  }
  return readCookieAttr();
}

function readCookieRef(): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

const MAX_PARAM_LENGTH = 120;
const SAFE_PARAM_REGEX = /^[a-zA-Z0-9_\-\.\:\@\/\+]+$/;

function sanitizeParam(val: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_PARAM_LENGTH) return null;
  return SAFE_PARAM_REGEX.test(trimmed) ? trimmed : null;
}

function persist(data: Attribution): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    /* armazenamento indisponível (modo privado etc.) — cookie cobre o blob */
  }
  const domainAttr = cookieDomain();
  const isSecure = typeof location !== 'undefined' && location.protocol === 'https:';
  const secureFlag = isSecure ? ';Secure' : '';

  try {
    const jsonStr = encodeURIComponent(JSON.stringify(data));
    document.cookie = `${ATTR_COOKIE_NAME}=${jsonStr};max-age=${COOKIE_MAX_AGE};path=/${domainAttr};SameSite=Lax${secureFlag}`;
  } catch {}
  if (data.ref) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(data.ref)};max-age=${COOKIE_MAX_AGE};path=/${domainAttr};SameSite=Lax${secureFlag}`;
  }
}

function fromUrl(search: string): Attribution {
  const params = new URLSearchParams(search);
  const out: Attribution = {};
  for (const key of ATTR_KEYS) {
    const rawVal = params.get(key);
    const value = sanitizeParam(rawVal);
    if (value) out[key] = value;
  }
  return out;
}

/**
 * Resolve a atribuição vigente (URL atual vs. armazenada) e persiste.
 * `search` é injetável para testes; default = URL atual.
 */
export function initAttribution(search: string = location.search): Attribution | null {
  const current = fromUrl(search);
  let stored = readStored();

  // Redundância: localStorage perdido mas cookie sobreviveu
  if (!stored?.ref) {
    const cookieRef = readCookieRef();
    if (cookieRef) stored = { ...(stored ?? {}), ref: cookieRef };
  }

  let final: Attribution | null;
  if (current.ref) {
    // ref explícito na URL sempre sobrescreve
    final = { ...current, ts: Date.now() };
    persist(final);
  } else if (stored?.ref) {
    // first-touch: mantém o que já foi capturado
    final = stored;
  } else if (Object.keys(current).length > 0) {
    // sem ref, mas com UTMs/click ids novos — captura mesmo assim
    final = { ...(stored ?? {}), ...current, ts: Date.now() };
    persist(final);
  } else {
    final = stored;
  }

  return final && Object.keys(final).length > 0 ? final : null;
}

/** Reescreve todos os CTAs, links para o app e navegação interna anexando os parâmetros capturados. */
export function decorateCtas(attr: Attribution | null): void {
  if (!attr) return;

  // 1. Links para o App (com ou sem data-cta) e todos os botões CTA
  document.querySelectorAll<HTMLAnchorElement>('a[data-cta], a[href*="app.supletivo.net.br"]').forEach((a) => {
    try {
      const url = new URL(a.href, window.location.href);
      if (url.hostname.includes('app.supletivo.net.br') || a.hasAttribute('data-cta')) {
        for (const key of ATTR_KEYS) {
          const value = attr[key];
          if (value && !url.searchParams.has(key)) {
            url.searchParams.set(key, value);
          } else if (value && key === 'ref') {
            url.searchParams.set('ref', value);
          }
        }
        a.href = url.toString();
      }
    } catch {
      /* href inválido — mantém como está */
    }
  });

  // 2. Links de navegação interna entre Home e Guias (preserva ?ref= em toda a jornada)
  if (attr.ref) {
    const internalPaths = new Set([
      '/',
      '/supletivo-online/',
      '/eja-a-distancia/',
      '/terminar-ensino-medio/',
      '/ensino-fundamental/',
      '/supletivo-ensino-fundamental/',
    ]);
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      try {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me')) return;
        const url = new URL(a.href, window.location.href);
        if (url.origin === window.location.origin) {
          const normPath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
          if (internalPaths.has(normPath) && !url.searchParams.has('ref')) {
            url.searchParams.set('ref', attr.ref!);
            a.href = url.pathname + url.search + url.hash;
          }
        }
      } catch {
        /* mantém como está */
      }
    });
  }
}
