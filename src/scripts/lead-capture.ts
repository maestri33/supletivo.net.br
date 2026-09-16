/**
 * Interceptação cinética e orquestração de abertura da Captura Inteligente de Alunos.
 * Preserva o progressive enhancement: se o modal não existir no DOM ou se o script
 * falhar, a navegação padrão do link <a href={APP_URL} data-cta="..."> segue intacta.
 */
import { initAttribution } from './attribution';
import { track } from './track';

export function setupLeadCaptureTrigger(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    const cta = target?.closest<HTMLAnchorElement>('a[data-cta]');
    if (!cta) return;

    // Se o modal estiver presente na página, intercepta a navegação para exibir o fluxo cinético
    const modal = document.querySelector('[data-lead-capture-modal]');
    if (modal) {
      e.preventDefault();
      const position = cta.dataset.cta ?? 'desconhecido';
      const attr = initAttribution();

      track('cta_click', {
        position,
        value: Number(cta.dataset.ctaValue) || undefined,
        currency: 'BRL',
        trigger_mode: 'smart_modal',
      });

      window.dispatchEvent(
        new CustomEvent('sb:open-lead-capture', {
          detail: { position, attr },
        })
      );
    }
  });
}
