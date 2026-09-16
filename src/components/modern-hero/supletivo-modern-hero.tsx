'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { SupletivoTrustMarquee, type SupletivoTrustBadgeItem } from './supletivo-trust-marquee';
import './modern-hero.css';

const DEFAULT_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4';

export interface SupletivoModernHeroProps {
  appUrl?: string;
  cardPriceLine?: string;
  pixPrice?: string;
  videoSrc?: string;
  badges?: SupletivoTrustBadgeItem[];
  className?: string;
}

export const SupletivoModernHero: React.FC<SupletivoModernHeroProps> = ({
  appUrl = 'https://app.supletivo.net.br',
  cardPriceLine = '12x de R$ 99',
  pixPrice = 'R$ 999',
  videoSrc = DEFAULT_VIDEO_URL,
  badges,
  className = '',
}) => {
  return (
    <section id="hero" data-section="hero" className={`sb-hero-section ${className}`}>
      {/* 2. Main Hero Container & Video Background */}
      <div className="sb-hero-card">
        {/* Underlying layer for background video */}
        <div className="sb-hero-video-wrap">
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="sb-hero-video"
          />
        </div>

        {/* 3. Hero Text Content */}
        <div className="sb-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%' }}
          >
            {/* Pill Eyebrow */}
            <div className="sb-hero-eyebrow">
              <span className="sb-hero-eyebrow-dot" />
              <span>Supletivo Online · Ensino Fundamental e Médio EJA</span>
            </div>

            {/* Headline */}
            <h1 className="sb-hero-title">
              Você parou.{' '}
              <span className="sb-hero-title-accent">
                Mas não acabou.
                <svg
                  className="sb-hero-title-swoosh"
                  viewBox="0 0 200 8"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M1 5.5C50 2 150 2 199 5.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="sb-hero-sub">
              Termine o <strong>Ensino Fundamental</strong> ou o <strong>Ensino Médio</strong> pelo celular,
              100% online e no seu ritmo — com certificado oficial válido pelo MEC em todo o Brasil.
            </p>

            {/* Feature Chips */}
            <ul className="sb-hero-chips">
              {[
                'Certificado válido no Brasil inteiro',
                'Estude pelo celular',
                'No seu próprio ritmo',
              ].map((chip) => (
                <li key={chip} className="sb-hero-chip">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{chip}</span>
                </li>
              ))}
            </ul>

            {/* CTA Group */}
            <div className="sb-hero-cta-group">
              <motion.a
                href={appUrl}
                data-cta="hero"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="sb-hero-btn-primary"
              >
                <span>Quero meu diploma</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>

              <div className="sb-hero-price-meta">
                <span className="sb-hero-price-main">
                  {cardPriceLine} <span style={{ fontWeight: 'normal', color: '#64748b' }}>ou {pixPrice} no Pix</span>
                </span>
                <span className="sb-hero-price-sub">
                  Matrícula 100% online · Garantia de 7 dias
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4. Floating Bottom Navbar */}
        <div className="sb-hero-navbar">
          <motion.nav
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
          >
            {/* Logo Badge */}
            <a
              href="#hero"
              className="sb-hero-nav-star"
              title="Supletivo Brasil"
            >
              ✦
            </a>

            {/* Quick Anchor Links */}
            <div className="sb-hero-nav-links">
              <a href="#como-funciona" className="sb-hero-nav-link">
                Como funciona
              </a>
              <a href="#validade" className="sb-hero-nav-link">
                Validade MEC
              </a>
              <a href="#preco" className="sb-hero-nav-link">
                Preço
              </a>
              <a href="#faq" className="sb-hero-nav-link">
                Dúvidas
              </a>
            </div>

            {/* Direct Action Button */}
            <a
              href={appUrl}
              data-cta="navbar"
              className="sb-hero-nav-action"
            >
              <span>Fazer Matrícula</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </motion.nav>
        </div>
      </div>

      {/* 5. Trust Marquee Scroller */}
      <SupletivoTrustMarquee badges={badges} />
    </section>
  );
};
