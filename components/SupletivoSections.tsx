'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  MessageCircle,
  Plus,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  BRAZIL_STATES,
  evaluateEligibility,
  FAQ_ITEMS,
  formatBrazilPhone,
  STORY_CARDS,
  STUDENT_OUTCOMES,
  SUPLETIVO_ASSETS,
  validateEnrollmentForm,
  type AgeBracket,
  type EnrollmentFormInput,
  type StoryCardCategory,
} from '@/lib/supletivo-data';
import { SupletivoBrandMark } from './TidewellIcons';

interface CardExplorerModalProps {
  open: boolean;
  activeIndex: number;
  onSelectIndex: (idx: number) => void;
  onClose: () => void;
  onStartEnrollment: (stage: 'medio' | 'fundamental', sourceTitle: string) => void;
}

export function StoryCardExplorerModal({
  open,
  activeIndex,
  onSelectIndex,
  onClose,
  onStartEnrollment,
}: CardExplorerModalProps) {
  const [filter, setFilter] = useState<'all' | StoryCardCategory>('all');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered =
    filter === 'all'
      ? STORY_CARDS
      : STORY_CARDS.filter((c) => c.category === filter);

  const selected = STORY_CARDS[activeIndex] ?? STORY_CARDS[0];

  const handleStep = (delta: number) => {
    const pos = filtered.findIndex((item) => item.index === selected.index);
    const nextIdx =
      pos >= 0 ? (pos + delta + filtered.length) % filtered.length : 0;
    onSelectIndex(filtered[nextIdx].index);
  };

  return (
    <div
      className="sb-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Jornada Supletivo Brasil"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sb-drawer">
        <div className="sb-drawer-header">
          <div>
            <p className="sb-eyebrow">ACERVO COMPLETO · 12 ETAPAS E HISTÓRIAS</p>
            <h2 className="sb-drawer-title">Do primeiro passo ao diploma oficial</h2>
            <p className="sb-drawer-sub">
              Explore cada etapa do EJA online, histórias reais de conclusão e o amparo legal completo do certificado.
            </p>
          </div>
          <button
            type="button"
            className="sb-icon-close"
            onClick={onClose}
            aria-label="Fechar janela"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sb-filter-row" role="tablist" aria-label="Filtrar cartões">
          {(
            [
              ['all', 'Todos (12)'],
              ['passos', 'Passo a Passo'],
              ['historias', 'Histórias Reais'],
              ['seguranca', 'Segurança Legal'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`sb-filter-btn${filter === key ? ' is-active' : ''}`}
              onClick={() => {
                setFilter(key);
                const first =
                  key === 'all'
                    ? STORY_CARDS[0]
                    : STORY_CARDS.find((c) => c.category === key);
                if (first) onSelectIndex(first.index);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="sb-drawer-body">
          <div className="sb-showcase-panel">
            <div
              className="sb-showcase-art"
              style={{
                backgroundImage: `url("${selected.url}")`,
                backgroundPosition: `${selected.col * 100}% ${selected.row * 100}%`,
              }}
              aria-label={selected.title}
            >
              <span className="sb-art-index">
                {String(selected.index + 1).padStart(2, '0')} / 12
              </span>
            </div>

            <div className="sb-showcase-meta">
              <div>
                <div className="sb-showcase-nav-row">
                  <span className="sb-meta-kicker">
                    {selected.tag} · {selected.categoryLabel}
                  </span>
                  <div className="sb-showcase-arrows">
                    <button
                      type="button"
                      className="sb-round-btn"
                      onClick={() => handleStep(-1)}
                      aria-label="Cartão anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      className="sb-round-btn"
                      onClick={() => handleStep(1)}
                      aria-label="Próximo cartão"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="sb-showcase-title">{selected.title}</h3>
                <p className="sb-showcase-subtitle">{selected.subtitle}</p>
                <p className="sb-showcase-summary">{selected.summary}</p>
              </div>

              <div className="sb-showcase-points">
                <div className="sb-metric-line">
                  <span className="sb-metric-label">{selected.metricLabel}</span>
                  <strong className="sb-metric-val">{selected.metricValue}</strong>
                </div>
                <ul className="sb-point-list">
                  {selected.detailPoints.map((pt) => (
                    <li key={pt}>
                      <Check size={15} className="sb-point-check" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className="sb-primary-btn"
                onClick={() =>
                  onStartEnrollment(selected.ctaStage, selected.title)
                }
              >
                <span>{selected.ctaLabel}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="sb-thumb-grid">
            {filtered.map((item) => {
              const isSelected = item.index === selected.index;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sb-thumb-card${isSelected ? ' is-selected' : ''}`}
                  onClick={() => onSelectIndex(item.index)}
                >
                  <span
                    className="sb-thumb-img"
                    style={{
                      backgroundImage: `url("${item.url}")`,
                      backgroundPosition: `${item.col * 100}% ${item.row * 100}%`,
                    }}
                  />
                  <span className="sb-thumb-caption">
                    <span className="sb-thumb-title">{item.title}</span>
                    <span className="sb-thumb-sub">{item.tag}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface JourneyStep {
  num: string;
  tag: string;
  title: string;
  body: string;
  detail: string;
  photoUrl: string;
  col: 0 | 1;
  row: 0 | 1;
  caption: string;
  cardIndex: number;
}

const EDITORIAL_STEPS: readonly JourneyStep[] = [
  {
    num: '01',
    tag: 'MATRÍCULA EM 5 MINUTOS',
    title: 'Inscrição direta pelo celular, sem fila e sem julgamento.',
    body: 'Você envia seus dados direto pelo smartphone, sem precisar enfrentar secretaria de escola nem esperar início de semestre. A liberação à plataforma EJA é imediata, com acolhimento humano do primeiro contato ao diploma.',
    detail: 'Acesso imediato · Plataforma leve até no 4G',
    photoUrl: SUPLETIVO_ASSETS.gridA,
    col: 0,
    row: 0,
    caption: '01 · Estudo e matrícula direto no smartphone',
    cardIndex: 0,
  },
  {
    num: '02',
    tag: 'ESTUDO NO SEU RITMO',
    title: 'Trinta minutos à noite ou no intervalo já fazem você avançar.',
    body: 'Esqueça três anos de aulas expositivas e deslocamento noturno. Nosso conteúdo foi desenhado para adultos que trabalham: apostilas diretas ao ponto e simulados fiéis ao formato da avaliação oficial.',
    detail: '100% digital · Avance rápido no que já domina',
    photoUrl: SUPLETIVO_ASSETS.gridB,
    col: 1,
    row: 0,
    caption: '02 · Rotina flexível pensada para adultos',
    cardIndex: 5,
  },
  {
    num: '03',
    tag: 'PROVA PRESENCIAL & CERTIFICADO',
    title: 'Avaliação oficial no polo credenciado e diploma válido em todo o Brasil.',
    body: 'Quando estiver confiante, você agenda a prova presencial oficial exigida pela legislação federal. Aprovado(a), recebe certificado e histórico escolar com registro e publicação em Diário Oficial.',
    detail: 'Lei Federal nº 9.394/96 · Instituição credenciada CEE',
    photoUrl: SUPLETIVO_ASSETS.gridB,
    col: 0,
    row: 1,
    caption: '03 · Prova presencial oficial que garante 100% de legitimidade',
    cardIndex: 6,
  },
] as const;

const OFFER_DELIVERABLES = [
  {
    num: '01',
    title: 'Matrícula online e liberação imediata no celular',
    note: 'Acesso 24h sem burocracia ou filas',
  },
  {
    num: '02',
    title: 'Material completo de Ensino Médio ou Fundamental (EJA)',
    note: 'Linguagem clara, objetiva e feita para adultos',
  },
  {
    num: '03',
    title: 'Simulados práticos no formato da avaliação oficial',
    note: 'Treine no seu tempo até se sentir seguro(a)',
  },
  {
    num: '04',
    title: 'Agendamento orientado da prova presencial no polo CEE',
    note: 'Avaliação exigida pela Lei Federal nº 9.394/96',
  },
  {
    num: '05',
    title: 'Certificado nacional + histórico + publicação em Diário Oficial',
    note: 'Aceito em faculdades, empresas, cursos técnicos e concursos',
  },
] as const;

interface ConversionSectionsProps {
  selectedStage: 'medio' | 'fundamental';
  onChangeStage: (stage: 'medio' | 'fundamental') => void;
  selectedPayment: 'parcelado' | 'pix';
  onChangePayment: (payment: 'parcelado' | 'pix') => void;
  onOpenExplorer: (cardIdx: number) => void;
  onJumpSection: (
    target:
      | 'top'
      | 'como-funciona'
      | 'requisitos'
      | 'preco'
      | 'duvidas'
      | 'matricula'
  ) => void;
}

export function SupletivoConversionSections({
  selectedStage,
  onChangeStage,
  selectedPayment,
  onChangePayment,
  onOpenExplorer,
  onJumpSection,
}: ConversionSectionsProps) {
  const [ageBracket, setAgeBracket] = useState<AgeBracket>('18plus');
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0].id);

  // Enrollment form state
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [stateUf, setStateUf] = useState('SP');
  const [errors, setErrors] = useState<
    Partial<Record<keyof EnrollmentFormInput, string>>
  >({});
  const [submittedProtocol, setSubmittedProtocol] = useState<string | null>(null);

  const eligibility = evaluateEligibility(ageBracket);
  const currentStep = EDITORIAL_STEPS[activeStepIdx] ?? EDITORIAL_STEPS[0];

  const handleChooseFromEligibility = () => {
    if (eligibility.recommendedStage) {
      onChangeStage(eligibility.recommendedStage);
    }
    onJumpSection('matricula');
  };

  const handleChoosePaymentAndEnroll = (payment: 'parcelado' | 'pix') => {
    onChangePayment(payment);
    onJumpSection('matricula');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateEnrollmentForm({
      name,
      whatsapp,
      email,
      stage: selectedStage,
      payment: selectedPayment,
      state: stateUf,
    });
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    const code = `SB-2025-${String(
      1000 + ((name.trim().length * 137 + whatsapp.length * 29) % 8999)
    )}`;
    setSubmittedProtocol(code);
  };

  return (
    <div className="ed-wrap">
      {/* ============================================================
          CHAPTER 01 — REQUISITOS LDB (Editorial Swiss Magazine Spread)
          ============================================================ */}
      <section
        id="requisitos"
        className="ed-section ed-ivory"
        aria-labelledby="requisitos-title"
      >
        <div className="ed-container">
          <div className="ed-chapter-bar">
            <span>01 · AMPARO LEGAL</span>
            <span>LEI FEDERAL Nº 9.394/96 · ART. 37 E 38</span>
          </div>

          <div className="ed-elig-spread">
            {/* Left: Monumental Title + Tactile Index Selector */}
            <div className="ed-elig-left">
              <h2 id="requisitos-title" className="ed-display-h2">
                Você já tem direito a concluir seus estudos hoje?
              </h2>
              <p className="ed-lead">
                A legislação brasileira do EJA define uma idade mínima exata para cada etapa. Toque na sua faixa etária para consultar seu enquadramento na LDB:
              </p>

              <div
                className="ed-index-list"
                role="radiogroup"
                aria-label="Faixa etária"
              >
                {(
                  [
                    {
                      id: '18plus' as const,
                      num: '01',
                      title: '18 anos completos ou mais',
                      sub: 'Ensino Médio e Ensino Fundamental',
                    },
                    {
                      id: '15to17' as const,
                      num: '02',
                      title: 'Entre 15 e 17 anos completos',
                      sub: 'Ensino Fundamental (EJA)',
                    },
                    {
                      id: 'under15' as const,
                      num: '03',
                      title: 'Menos de 15 anos',
                      sub: 'Regra da Lei Federal nº 9.394/96',
                    },
                  ] as const
                ).map((opt) => {
                  const active = ageBracket === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      data-testid={`age-btn-${opt.id}`}
                      className={`ed-index-row${active ? ' is-active' : ''}`}
                      onClick={() => setAgeBracket(opt.id)}
                    >
                      {active && (
                        <motion.span
                          layoutId="elig-active-bar"
                          className="ed-index-indicator"
                          transition={{
                            type: 'spring',
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      )}
                      <span className="ed-index-num">{opt.num}</span>
                      <span className="ed-index-body">
                        <strong>{opt.title}</strong>
                        <span>{opt.sub}</span>
                      </span>
                      <span className="ed-index-arrow" aria-hidden="true">
                        <ArrowRight size={16} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Tactile Official Declaration Document + Overlapping 35mm Wax-Seal Photo */}
            <div className="ed-elig-right">
              <AnimatePresence mode="wait">
                <motion.div
                  key={eligibility.bracket}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className={`ed-declaration${
                    eligibility.eligible ? ' is-eligible' : ' is-ineligible'
                  }`}
                  data-testid="eligibility-result"
                  aria-live="polite"
                >
                  <div className="ed-decl-head">
                    <span className="ed-decl-stamp">
                      <Scale size={14} aria-hidden="true" />
                      <span>PARECER LDB · MODALIDADE EJA</span>
                    </span>
                    <span className="ed-decl-badge">{eligibility.badge}</span>
                  </div>

                  <h3 className="ed-decl-title">{eligibility.headline}</h3>
                  <p className="ed-decl-copy">{eligibility.explanation}</p>

                  <div className="ed-decl-foot">
                    <p className="ed-decl-legal">{eligibility.legalNote}</p>
                    {eligibility.eligible && eligibility.ctaLabel && (
                      <button
                        type="button"
                        className="ed-btn-emerald"
                        onClick={handleChooseFromEligibility}
                      >
                        <span>{eligibility.ctaLabel}</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Editorial photographic accent anchoring visual continuity */}
              <div className="ed-decl-photo-strip">
                <div
                  className="ed-decl-photo"
                  style={{
                    backgroundImage: `url("${SUPLETIVO_ASSETS.gridA}")`,
                    backgroundPosition: '100% 100%',
                  }}
                  role="img"
                  aria-label="Envelope oficial de diploma com selo dourado em alto relevo"
                />
                <div className="ed-decl-photo-meta">
                  <strong>Certificação com registro público</strong>
                  <span>
                    Emitida por instituição parceira autorizada pelo Conselho Estadual de Educação (CEE) com publicação consultável em Diário Oficial.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 02 — COMO FUNCIONA (Interactive Photographic Split)
          ============================================================ */}
      <section
        id="como-funciona"
        className="ed-section ed-white"
        aria-labelledby="como-funciona-title"
      >
        <div className="ed-container">
          <div className="ed-chapter-bar">
            <span>02 · A JORNADA NA PRÁTICA</span>
            <span>DO CELULAR AO DIPLOMA OFICIAL</span>
          </div>

          <div className="ed-split-header">
            <h2 id="como-funciona-title" className="ed-display-h2">
              Três etapas diretas, desenhadas para quem trabalha.
            </h2>
            <button
              type="button"
              className="ed-link-action"
              onClick={() => onOpenExplorer(0)}
            >
              <span>Abrir acervo completo (12 etapas)</span>
              <ArrowUpRight size={17} />
            </button>
          </div>

          {/* Interactive Sticky Photo + Numbered Editorial List */}
          <div className="ed-journey-grid">
            <div className="ed-journey-visual">
              <div className="ed-photo-frame">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.num}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="ed-photo-canvas"
                    style={{
                      backgroundImage: `url("${currentStep.photoUrl}")`,
                      backgroundPosition: `${currentStep.col * 100}% ${currentStep.row * 100}%`,
                    }}
                    role="img"
                    aria-label={currentStep.caption}
                  />
                </AnimatePresence>
                <div className="ed-photo-scrim" aria-hidden="true" />
                <div className="ed-photo-overlay">
                  <span className="ed-photo-index">
                    ETAPA {currentStep.num} / 03
                  </span>
                  <p className="ed-photo-caption">{currentStep.caption}</p>
                </div>
              </div>
            </div>

            <div className="ed-journey-steps">
              {EDITORIAL_STEPS.map((step, idx) => {
                const isActive = idx === activeStepIdx;
                return (
                  <div
                    key={step.num}
                    className={`ed-step-row${isActive ? ' is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="ed-step-trigger"
                      aria-expanded={isActive}
                      onClick={() => setActiveStepIdx(idx)}
                    >
                      <span className="ed-step-big-num">{step.num}</span>
                      <span className="ed-step-heading-col">
                        <span className="ed-step-tag">{step.tag}</span>
                        <span className="ed-step-title">{step.title}</span>
                      </span>
                      <span className="ed-step-plus" aria-hidden="true">
                        <Plus size={20} />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="ed-step-collapse"
                        >
                          <div className="ed-step-detail-inner">
                            <p>{step.body}</p>
                            <div className="ed-step-meta-row">
                              <span>{step.detail}</span>
                              <button
                                type="button"
                                className="ed-inline-link"
                                onClick={() => onOpenExplorer(step.cardIndex)}
                              >
                                Ver detalhes <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================
              FULL-BLEED EDITORIAL PORTRAIT STORIES (Zero tiny avatar boxes!)
              ============================================================ */}
          <div id="historias" className="ed-stories-band">
            <div className="ed-stories-head">
              <div>
                <p className="ed-kicker">HISTÓRIAS REAIS DE QUEM RECOMEÇOU</p>
                <h3 className="ed-display-h3">
                  Faculdade, promoção e concurso destravados.
                </h3>
              </div>
              <p className="ed-stories-note">
                Pessoas reais que precisaram interromper os estudos e fecharam esse ciclo no próprio tempo.
              </p>
            </div>

            <div className="ed-portrait-grid">
              {STUDENT_OUTCOMES.map((student, idx) => (
                <article key={student.id} className="ed-portrait-card">
                  <button
                    type="button"
                    className="ed-portrait-photo-btn"
                    onClick={() => onOpenExplorer(student.cardIndex)}
                    aria-label={`Ler história completa de ${student.name}`}
                  >
                    <span
                      className="ed-portrait-img"
                      style={{
                        backgroundImage: `url("${student.photoUrl}")`,
                        backgroundPosition: `${student.col * 100}% ${student.row * 100}%`,
                      }}
                    />
                    <span className="ed-portrait-scrim" aria-hidden="true" />
                    <span className="ed-portrait-top-meta">
                      <span>0{idx + 1}</span>
                      <span>{student.location}</span>
                    </span>
                    <span className="ed-portrait-bottom-meta">
                      <strong>{student.name}</strong>
                      <span>
                        {student.age} · {student.achievement}
                      </span>
                    </span>
                  </button>

                  <blockquote className="ed-portrait-quote">
                    {student.quote}
                  </blockquote>
                </article>
              ))}
            </div>

            {/* Pure Swiss Typographic Legal Ledger (Zero boxed cards) */}
            <div className="ed-legal-ledger" aria-label="Pilares jurídicos">
              <div className="ed-ledger-col">
                <span className="ed-ledger-code">01 / LDB</span>
                <strong>Lei Federal nº 9.394/96</strong>
                <span>Direito nacional ao EJA previsto nos Art. 37 e 38.</span>
              </div>
              <div className="ed-ledger-col">
                <span className="ed-ledger-code">02 / CREDENCIAMENTO</span>
                <strong>Autorizado pelo CEE</strong>
                <span>Instituição parceira credenciada pelo Conselho Estadual.</span>
              </div>
              <div className="ed-ledger-col">
                <span className="ed-ledger-code">03 / PUBLICAÇÃO</span>
                <strong>Diário Oficial</strong>
                <span>Certificado e histórico auditáveis em todo o Brasil.</span>
              </div>
              <div className="ed-ledger-col">
                <span className="ed-ledger-code">04 / PROTEÇÃO</span>
                <strong>Garantia 7 dias + LGPD</strong>
                <span>Art. 49 do Código de Defesa do Consumidor e Lei 13.709/18.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 03 — INVESTIMENTO (Dark Obsidian Architectural Ledger)
          ============================================================ */}
      <section
        id="preco"
        className="ed-section ed-obsidian"
        aria-labelledby="preco-title"
      >
        <div className="ed-container">
          <div className="ed-chapter-bar ed-chapter-bar-dark">
            <span>03 · INVESTIMENTO TRANSPARENTE</span>
            <span>VALOR FECHADO · SEM MENSALIDADES</span>
          </div>

          <div className="ed-offer-grid">
            {/* Left: Interactive Payment Toggle + Monumental Price */}
            <div className="ed-offer-left">
              <h2 id="preco-title" className="ed-display-h2 ed-text-white">
                Um valor fechado, sem surpresas no caminho.
              </h2>
              <p className="ed-lead ed-lead-dark">
                Escolha parcelar no cartão ou pagar à vista no Pix com desconto imediato de R$ 189. Sem mensalidades recorrentes.
              </p>

              {/* Editorial Segmented Toggle */}
              <div
                className="ed-pay-toggle"
                role="tablist"
                aria-label="Forma de pagamento"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedPayment === 'parcelado'}
                  data-testid="pay-toggle-parcelado"
                  className={`ed-pay-tab${
                    selectedPayment === 'parcelado' ? ' is-active' : ''
                  }`}
                  onClick={() => onChangePayment('parcelado')}
                >
                  {selectedPayment === 'parcelado' && (
                    <motion.span
                      layoutId="pay-tab-bg"
                      className="ed-pay-tab-bg"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="ed-pay-tab-label">Cartão · 12× de R$ 99</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedPayment === 'pix'}
                  data-testid="pay-toggle-pix"
                  className={`ed-pay-tab${
                    selectedPayment === 'pix' ? ' is-active' : ''
                  }`}
                  onClick={() => onChangePayment('pix')}
                >
                  {selectedPayment === 'pix' && (
                    <motion.span
                      layoutId="pay-tab-bg"
                      className="ed-pay-tab-bg"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="ed-pay-tab-label">
                    Pix à vista · -R$ 189
                  </span>
                </button>
              </div>

              {/* Monumental Price Display */}
              <div className="ed-price-stage">
                <AnimatePresence mode="wait">
                  {selectedPayment === 'parcelado' ? (
                    <motion.div
                      key="parcelado"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.24 }}
                    >
                      <span className="ed-price-eyebrow">
                        MAIS ESCOLHIDO · PARCELAMENTO NO CARTÃO
                      </span>
                      <div className="ed-price-hero">
                        <span className="ed-price-mul">12× de</span>
                        <strong>R$ 99</strong>
                      </div>
                      <p className="ed-price-sub">
                        Total parcelado: R$ 1.188 · Liberação imediata após confirmação · Sem mensalidades extras.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pix"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.24 }}
                    >
                      <span className="ed-price-eyebrow ed-eyebrow-emerald">
                        ECONOMIA DIRETA DE R$ 189 NO PIX
                      </span>
                      <div className="ed-price-hero">
                        <span className="ed-price-strike">R$ 1.188</span>
                        <strong>R$ 999</strong>
                      </div>
                      <p className="ed-price-sub">
                        Pagamento único à vista no Pix · Sem comprometer limite do cartão · Liberação instantânea.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ed-offer-cta-row">
                <button
                  type="button"
                  className="ed-btn-gold"
                  data-testid="offer-primary-cta"
                  onClick={() => handleChoosePaymentAndEnroll(selectedPayment)}
                >
                  <span>
                    {selectedPayment === 'parcelado'
                      ? 'Garantir em 12× de R$ 99'
                      : 'Garantir por R$ 999 no Pix'}
                  </span>
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  className="ed-btn-ghost-dark"
                  onClick={() =>
                    handleChoosePaymentAndEnroll(
                      selectedPayment === 'parcelado' ? 'pix' : 'parcelado'
                    )
                  }
                >
                  {selectedPayment === 'parcelado'
                    ? 'Ou pagar R$ 999 no Pix (-R$ 189)'
                    : 'Ou parcelar em 12× de R$ 99'}
                </button>
              </div>
            </div>

            {/* Right: Architectural Inclusion Ledger (Zero SaaS box clutter) */}
            <div className="ed-offer-right">
              <div className="ed-ledger-header">
                <span>TUDO O QUE ESTÁ INCLUÍDO NO PROGRAMA</span>
                <span>ENSINO MÉDIO OU FUNDAMENTAL</span>
              </div>

              <ol className="ed-deliverables-list">
                {OFFER_DELIVERABLES.map((item) => (
                  <li key={item.num} className="ed-deliverable-row">
                    <span className="ed-deliv-num">{item.num}</span>
                    <div className="ed-deliv-text">
                      <strong>{item.title}</strong>
                      <span>{item.note}</span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="ed-guarantee-band">
                <ShieldCheck size={20} className="ed-guarantee-ic" aria-hidden="true" />
                <div>
                  <strong>Garantia legal incondicional de 7 dias (Art. 49 CDC)</strong>
                  <span>
                    Explore a plataforma sem pressão. Se decidir que ainda não é o momento, devolvemos 100% do valor pago.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 04 — DÚVIDAS FREQUENTES (Asymmetric Sticky Editorial)
          ============================================================ */}
      <section
        id="duvidas"
        className="ed-section ed-ivory"
        aria-labelledby="duvidas-title"
      >
        <div className="ed-container">
          <div className="ed-chapter-bar">
            <span>04 · TRANSPARÊNCIA TOTAL</span>
            <span>PERGUNTAS FREQUENTES</span>
          </div>

          <div className="ed-faq-spread">
            <div className="ed-faq-left">
              <h2 id="duvidas-title" className="ed-display-h2">
                Sem letra miúda.
              </h2>
              <p className="ed-lead">
                Respostas diretas sobre validade nacional, prova presencial, prazos e garantia legal — exatamente como deve ser.
              </p>
              <button
                type="button"
                className="ed-link-action"
                onClick={() => onJumpSection('matricula')}
              >
                <span>Falar com um orientador na pré-matrícula</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="ed-faq-right">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`ed-faq-row${isOpen ? ' is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="ed-faq-trigger"
                      aria-expanded={isOpen}
                      data-testid={`faq-${item.id}`}
                      onClick={() =>
                        setOpenFaqId((prev) => (prev === item.id ? '' : item.id))
                      }
                    >
                      <span className="ed-faq-num">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="ed-faq-q">{item.question}</span>
                      <span className="ed-faq-icon" aria-hidden="true">
                        <Plus size={19} />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.28,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="ed-faq-collapse"
                        >
                          <p className="ed-faq-answer">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAPTER 05 — PRÉ-MATRÍCULA (Architectural Closing Desk)
          ============================================================ */}
      <section
        id="matricula"
        className="ed-section ed-white"
        aria-labelledby="matricula-title"
      >
        <div className="ed-container">
          <div className="ed-chapter-bar">
            <span>05 · PRÓXIMO CAPÍTULO</span>
            <span>PRÉ-MATRÍCULA ONLINE · SEM COMPROMISSO</span>
          </div>

          <div className="ed-enroll-spread">
            {/* Left: Editorial Rolled-Diploma Photo + Closing Message + Live Summary */}
            <div className="ed-enroll-left">
              <div className="ed-enroll-photo-wrap">
                <div
                  className="ed-enroll-photo"
                  style={{
                    backgroundImage: `url("${SUPLETIVO_ASSETS.gridC}")`,
                    backgroundPosition: '0% 0%',
                  }}
                  role="img"
                  aria-label="Diploma oficial enrolado com laço verde esmeralda e selo dourado"
                />
                <span className="ed-enroll-photo-tag">
                  EJA OFICIAL · VÁLIDO EM TODO O BRASIL
                </span>
              </div>

              <h2 id="matricula-title" className="ed-display-h2">
                Você parou. Hoje você recomeça.
              </h2>
              <p className="ed-lead">
                Envie sua pré-matrícula em menos de um minuto. Nossa equipe orienta você no WhatsApp com calma, clareza e respeito total à sua trajetória.
              </p>

              <div className="ed-summary-ledger">
                <div className="ed-summary-row">
                  <span>Etapa selecionada</span>
                  <strong>
                    {selectedStage === 'medio'
                      ? 'Ensino Médio (18+ anos)'
                      : 'Ensino Fundamental (15+ anos)'}
                  </strong>
                </div>
                <div className="ed-summary-row">
                  <span>Condição selecionada</span>
                  <strong>
                    {selectedPayment === 'parcelado'
                      ? '12× de R$ 99 no cartão'
                      : 'R$ 999 à vista no Pix (-R$ 189)'}
                  </strong>
                </div>
              </div>

              <div className="ed-trust-notes">
                <span>
                  <Clock size={15} aria-hidden="true" />
                  Retorno rápido em horário comercial no WhatsApp
                </span>
                <span>
                  <MessageCircle size={15} aria-hidden="true" />
                  Orientação humana sobre documentos e polo da prova
                </span>
                <span>
                  <Lock size={15} aria-hidden="true" />
                  Protegido pela LGPD (Lei nº 13.709/18)
                </span>
              </div>
            </div>

            {/* Right: Architectural Warm-Ivory Pre-Enrollment Desk */}
            <div className="ed-enroll-desk">
              {submittedProtocol ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ed-protocol-sheet"
                  data-testid="enrollment-success"
                >
                  <div className="ed-proto-top">
                    <span className="ed-proto-check">
                      <Check size={22} strokeWidth={2.5} />
                    </span>
                    <div>
                      <span className="ed-kicker">
                        PRÉ-MATRÍCULA REGISTRADA
                      </span>
                      <strong className="ed-proto-code">
                        Protocolo #{submittedProtocol}
                      </strong>
                    </div>
                  </div>

                  <h3 className="ed-proto-title">
                    Parabéns pelo primeiro passo, {name.trim().split(' ')[0]}.
                  </h3>
                  <p className="ed-proto-desc">
                    Nossa equipe pedagógica recebeu sua solicitação e entrará em contato pelo WhatsApp{' '}
                    <strong>{whatsapp}</strong>, além de enviar os detalhes para{' '}
                    <strong>{email}</strong>.
                  </p>

                  <div className="ed-proto-table">
                    <div>
                      <span>Etapa</span>
                      <strong>
                        {selectedStage === 'medio'
                          ? 'Ensino Médio EJA'
                          : 'Ensino Fundamental EJA'}
                      </strong>
                    </div>
                    <div>
                      <span>Condição</span>
                      <strong>
                        {selectedPayment === 'parcelado'
                          ? '12× de R$ 99 (Cartão)'
                          : 'R$ 999 à vista (Pix)'}
                      </strong>
                    </div>
                    <div>
                      <span>Estado (UF)</span>
                      <strong>{stateUf}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="ed-btn-outline"
                    onClick={() => {
                      setSubmittedProtocol(null);
                      setName('');
                      setWhatsapp('');
                      setEmail('');
                    }}
                  >
                    Fazer nova simulação
                  </button>
                </motion.div>
              ) : (
                <form
                  className="ed-form"
                  onSubmit={handleSubmit}
                  noValidate
                  data-testid="enrollment-form"
                >
                  <div className="ed-form-header">
                    <h3>Solicitar pré-matrícula oficial</h3>
                    <p>Preencha seus dados para receber orientação personalizada.</p>
                  </div>

                  {/* Interactive Tactile Pills for Stage */}
                  <div className="ed-form-group">
                    <span className="ed-form-label">Qual etapa deseja concluir?</span>
                    <div className="ed-choice-pair">
                      <button
                        type="button"
                        className={`ed-choice-btn${
                          selectedStage === 'medio' ? ' is-selected' : ''
                        }`}
                        onClick={() => onChangeStage('medio')}
                      >
                        <strong>Ensino Médio</strong>
                        <span>18 anos ou mais</span>
                      </button>
                      <button
                        type="button"
                        className={`ed-choice-btn${
                          selectedStage === 'fundamental' ? ' is-selected' : ''
                        }`}
                        onClick={() => onChangeStage('fundamental')}
                      >
                        <strong>Ensino Fundamental</strong>
                        <span>15 anos ou mais</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Tactile Pills for Payment */}
                  <div className="ed-form-group">
                    <span className="ed-form-label">Condição preferida</span>
                    <div className="ed-choice-pair">
                      <button
                        type="button"
                        className={`ed-choice-btn${
                          selectedPayment === 'parcelado' ? ' is-selected' : ''
                        }`}
                        onClick={() => onChangePayment('parcelado')}
                      >
                        <strong>12× de R$ 99</strong>
                        <span>No cartão de crédito</span>
                      </button>
                      <button
                        type="button"
                        className={`ed-choice-btn${
                          selectedPayment === 'pix' ? ' is-selected' : ''
                        }`}
                        onClick={() => onChangePayment('pix')}
                      >
                        <strong>R$ 999 no Pix</strong>
                        <span>Economize R$ 189</span>
                      </button>
                    </div>
                  </div>

                  <div className="ed-field">
                    <label htmlFor="sb-name">Nome completo</label>
                    <input
                      id="sb-name"
                      type="text"
                      placeholder="Ex: Camila Rodrigues"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name && (
                      <span className="ed-error" role="alert">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className="ed-field-row">
                    <div className="ed-field">
                      <label htmlFor="sb-whatsapp">WhatsApp com DDD</label>
                      <input
                        id="sb-whatsapp"
                        type="tel"
                        inputMode="numeric"
                        placeholder="(11) 99999-9999"
                        value={whatsapp}
                        onChange={(e) =>
                          setWhatsapp(formatBrazilPhone(e.target.value))
                        }
                        aria-invalid={Boolean(errors.whatsapp)}
                      />
                      {errors.whatsapp && (
                        <span className="ed-error" role="alert">
                          {errors.whatsapp}
                        </span>
                      )}
                    </div>

                    <div className="ed-field">
                      <label htmlFor="sb-state">Estado (UF)</label>
                      <select
                        id="sb-state"
                        value={stateUf}
                        onChange={(e) => setStateUf(e.target.value)}
                        aria-invalid={Boolean(errors.state)}
                      >
                        {BRAZIL_STATES.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <span className="ed-error" role="alert">
                          {errors.state}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ed-field">
                    <label htmlFor="sb-email">E-mail</label>
                    <input
                      id="sb-email"
                      type="email"
                      placeholder="voce@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && (
                      <span className="ed-error" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="ed-btn-emerald ed-btn-full"
                  >
                    <span>Quero meu diploma</span>
                    <ArrowRight size={17} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MONUMENTAL QUIET INSTITUTIONAL FOOTER
          ============================================================ */}
      <footer className="ed-footer">
        <div className="ed-container">
          <div className="ed-footer-signature" aria-hidden="true">
            Você parou. <span>Mas não acabou.</span>
          </div>

          <div className="ed-footer-row">
            <div className="ed-footer-brand-col">
              <a
                href="#top"
                className="ed-footer-brand"
                onClick={(e) => {
                  e.preventDefault();
                  onJumpSection('top');
                }}
              >
                <SupletivoBrandMark />
              </a>
              <p>
                Educação de Jovens e Adultos (EJA) com estudo 100% digital no celular, prova presencial oficial e certificação válida em todo o Brasil.
              </p>
            </div>

            <nav className="ed-footer-nav" aria-label="Links do rodapé">
              <button
                type="button"
                onClick={() => onJumpSection('requisitos')}
              >
                Requisitos (LDB)
              </button>
              <button
                type="button"
                onClick={() => onJumpSection('como-funciona')}
              >
                Como funciona
              </button>
              <button type="button" onClick={() => onJumpSection('preco')}>
                Investimento
              </button>
              <button type="button" onClick={() => onJumpSection('duvidas')}>
                Dúvidas
              </button>
              <button type="button" onClick={() => onJumpSection('matricula')}>
                Matrícula
              </button>
            </nav>
          </div>

          <div className="ed-footer-legal">
            <span>
              © 2025 Supletivo Brasil · Modalidade EJA amparada pela Lei Federal nº 9.394/96 (LDB, Art. 37 e 38), com certificação emitida por instituição parceira credenciada pelo CEE mediante prova presencial oficial e publicação em Diário Oficial.
            </span>
            <span>
              Garantia legal de 7 dias (Art. 49 CDC) · LGPD Lei nº 13.709/18
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
