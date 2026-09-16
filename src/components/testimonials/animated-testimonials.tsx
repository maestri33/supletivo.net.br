'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import type { Testimonial } from '../../data/testimonials';

export interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
}

export const AnimatedTestimonials: React.FC<AnimatedTestimonialsProps> = ({
  testimonials,
  autoplay = true,
  className = '',
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => index === active;

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 6000);
      return () => clearInterval(interval);
    }
  }, [autoplay, testimonials.length]);

  const getRotateY = (index: number) => {
    const angles = [-6, 4, -3, 5, -5, 3];
    return angles[index % angles.length];
  };

  const current = testimonials[active];

  return (
    <div className={`mx-auto max-w-5xl px-4 py-6 md:px-8 font-sans ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
        {/* Coluna 1: Imagem com efeito 3D em leque */}
        <div className="w-full flex justify-center">
          <div className="relative w-full max-w-[360px] h-[360px] sm:h-[400px]">
            <AnimatePresence mode="popLayout">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: getRotateY(index),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.65,
                    scale: isActive(index) ? 1 : 0.92,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : getRotateY(index),
                    zIndex: isActive(index) ? 40 : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -40, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: getRotateY(index),
                  }}
                  transition={{
                    duration: 0.45,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900">
                    <img
                      src={testimonial.src}
                      alt={`Foto de ${testimonial.name}`}
                      width={500}
                      height={500}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover object-center"
                    />
                    {testimonial.badge && (
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-xs font-semibold text-yellow-400">
                        {testimonial.badge}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Coluna 2: Citação, autor e controles */}
        <div className="flex flex-col justify-between py-2 text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Quote className="w-8 h-8 text-yellow-400 opacity-80" aria-hidden="true" />
                {current.outcome && (
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    {current.outcome}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                {current.name}
              </h3>
              <p className="text-sm text-neutral-400 mt-0.5 font-medium">
                {current.designation}
              </p>

              <motion.p className="mt-6 text-base sm:text-lg text-neutral-200 leading-relaxed font-normal">
                {current.quote.split(' ').map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    initial={{ filter: 'blur(8px)', opacity: 0, y: 4 }}
                    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      ease: 'easeInOut',
                      delay: 0.015 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Controles de Navegação */}
          <div className="flex items-center gap-4 pt-8">
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Depoimento anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800/90 border border-white/10 text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              aria-label="Próximo depoimento"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800/90 border border-white/10 text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 cursor-pointer"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <span className="text-xs text-neutral-400 ml-2 font-mono">
              {active + 1} / {testimonials.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
