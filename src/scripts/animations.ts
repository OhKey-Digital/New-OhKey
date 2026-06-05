import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function init() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: '(min-width: 1024px)',
      isMobile: '(max-width: 1023px)',
    },
    (ctx) => {
      const { isDesktop } = ctx.conditions as Record<string, boolean>;

      const dur     = isDesktop ? 0.75 : 0.5;
      const yFull   = isDesktop ? 40 : 20;
      const stagger = isDesktop ? 0.12 : 0.07;

      // ── HERO (above the fold, sin ScrollTrigger) ──────────────────────
      // Logo
      gsap.set('.hero__logo',        { opacity: 0, scale: 0.88 });
      // Título: los inners ya empiezan a translateY(110%) por CSS;
      // gsap.set confirma el estado para que el contexto pueda revertirlo limpiamente
      gsap.set('.hero__title-inner', { y: '110%' });
      // Resto de elementos
      gsap.set('.hero__copy',        { opacity: 0, y: yFull * 0.7 });
      gsap.set('.hero__features li', { opacity: 0, x: -20 });
      gsap.set('.hero__cta-group',   { opacity: 0, scale: 0.9 });
      gsap.set('.hero__stat-card',   { opacity: 0, y: 28, scale: 0.93 });

      gsap.timeline({ delay: 0.1 })
        // Logo: aparece y escala — ancla la identidad de marca
        .to('.hero__logo', {
          opacity: 1, scale: 1,
          duration: 0.7, ease: 'power3.out',
        })
        // Título: reveal line a line desde debajo de la máscara (efecto luxury)
        .to('.hero__title-inner', {
          y: 0,
          duration: isDesktop ? 1.1 : 0.8,
          ease: 'expo.out',
          stagger: 0.14,
        }, '-=0.3')
        // Copy
        .to('.hero__copy', {
          opacity: 1, y: 0,
          duration: dur, ease: 'power3.out',
        }, '-=0.65')
        // Features: slide desde la izquierda en cascada
        .to('.hero__features li', {
          opacity: 1, x: 0,
          duration: 0.45, ease: 'power2.out',
          stagger,
        }, '-=0.5')
        // CTA: entra con overshoot elástico para llamar la atención
        .to('.hero__cta-group', {
          opacity: 1, scale: 1,
          duration: 0.6, ease: 'back.out(1.5)',
        }, '-=0.3')
        // Stats: stagger diagonal — último golpe visual del hero
        .to('.hero__stat-card', {
          opacity: 1, y: 0, scale: 1,
          duration: 0.55, ease: 'power2.out',
          stagger,
        }, '-=0.2');

      // Paralaje sutil en stats al salir del hero (solo desktop)
      if (isDesktop) {
        gsap.to('.hero__stats-grid', {
          y: -35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.8,
          },
        });
      }

      // ── HEADINGS por sección ──────────────────────────────────────────
      type SectionDef = { el: string; children: string[] };

      const sectionDefs: SectionDef[] = [
        { el: '.benefits-section', children: ['.benefits__label', '.benefits__heading'] },
        { el: '.failures-section', children: ['.failures__label', '.failures__heading'] },
        { el: '.target-section',   children: ['.target__caption', '.target__title']    },
        { el: '.about-section',    children: ['.about__caption']                       },
        { el: '.price-section',    children: ['.counter']                              },
        { el: '.goodbye',          children: ['.goodbye__label', '.goodbye__heading']  },
      ];

      sectionDefs.forEach(({ el, children }) => {
        const section = document.querySelector(el);
        if (!section) return;
        const targets = children.map(c => section.querySelector(c)).filter(Boolean);
        if (!targets.length) return;
        gsap.set(targets, { opacity: 0, y: yFull * 0.6 });
        ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1, y: 0,
              duration: 0.7, ease: 'power3.out', stagger: 0.1,
            }),
        });
      });

      // Módulos y QyA comparten clase
      document.querySelectorAll<HTMLElement>('.modules-section').forEach((section) => {
        const targets = ['.modules__label', '.modules__heading', '.modules__description']
          .map(c => section.querySelector(c)).filter(Boolean);
        gsap.set(targets, { opacity: 0, y: yFull * 0.6 });
        ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1, y: 0,
              duration: 0.7, ease: 'power3.out', stagger: 0.1,
            }),
        });
      });

      // ── BATCH CARDS con blur cinematográfico (desktop) ────────────────
      // blur(6px) → blur(0) da profundidad de campo al reveal; clearProps
      // libera la capa de composición GPU tras completar la animación.
      const batchReveal = (
        selector: string,
        yAmt: number,
        overrides?: Partial<gsap.TweenVars>,
      ) => {
        const initProps: gsap.TweenVars = { opacity: 0, y: yAmt };
        if (isDesktop) { initProps.scale = 0.96; initProps.filter = 'blur(6px)'; }

        const toProps: gsap.TweenVars = {
          opacity: 1, y: 0,
          duration: dur + 0.1,
          ease: 'power2.out',
          stagger,
          ...overrides,
        };
        if (isDesktop) {
          toProps.scale = 1;
          toProps.filter = 'blur(0px)';
          toProps.clearProps = 'filter';
        }

        gsap.set(selector, initProps);
        ScrollTrigger.batch(selector, {
          onEnter: els => gsap.to(els, toProps),
          start: 'top 87%',
          once: true,
        });
      };

      batchReveal('.benefits__card', 28);
      batchReveal('.failures__card', 22);
      batchReveal('.target__card',   22);

      // Precio: overshoot + blur para máximo impacto
      const priceInit: gsap.TweenVars = { opacity: 0, y: 32, scale: 0.94 };
      const priceTo: gsap.TweenVars = {
        opacity: 1, y: 0, scale: 1,
        duration: dur + 0.2,
        ease: 'back.out(1.3)',
        stagger: stagger * 1.2,
      };
      if (isDesktop) {
        priceInit.filter = 'blur(8px)';
        priceTo.filter = 'blur(0px)';
        priceTo.clearProps = 'filter';
      }
      gsap.set('.price__card-container', priceInit);
      ScrollTrigger.batch('.price__card-container', {
        onEnter: els => gsap.to(els, priceTo),
        start: 'top 83%',
        once: true,
      });

      // Acordeones: deslizamiento lateral en cascada
      gsap.set('.accordion', { opacity: 0, x: -16 });
      ScrollTrigger.batch('.accordion', {
        onEnter: els =>
          gsap.to(els, {
            opacity: 1, x: 0,
            duration: isDesktop ? 0.5 : 0.35,
            ease: 'power2.out',
            stagger: isDesktop ? 0.06 : 0.04,
          }),
        start: 'top 90%',
        once: true,
      });

      // ── ABOUT: retrato, frases y firma ────────────────────────────────
      const portraitInit: gsap.TweenVars = { opacity: 0, scale: 1.05 };
      const portraitTo: gsap.TweenVars   = { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' };
      if (isDesktop) {
        portraitInit.filter = 'blur(10px)';
        portraitTo.filter   = 'blur(0px)';
        portraitTo.clearProps = 'filter';
      }
      gsap.set('.about__portrait--mobile, .about__portrait--desktop', portraitInit);
      ScrollTrigger.create({
        trigger: '.about-section',
        start: 'top 82%',
        once: true,
        onEnter: () =>
          gsap.to('.about__portrait--mobile, .about__portrait--desktop', portraitTo),
      });

      gsap.set('.about__phrase', { opacity: 0, y: 18 });
      ScrollTrigger.batch('.about__phrase', {
        onEnter: els => gsap.to(els, {
          opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.12,
        }),
        start: 'top 88%',
        once: true,
      });

      // Firma: entra con rotación y overshoot — refuerza el toque caligráfico
      gsap.set('.about__signature', { opacity: 0, rotate: -5, y: 12, scale: 0.9 });
      ScrollTrigger.create({
        trigger: '.about__signature',
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to('.about__signature', {
            opacity: 1, rotate: 0, y: 0, scale: 1,
            duration: 0.9, ease: 'back.out(1.4)',
          }),
      });

      // ── GOODBYE: CTA con pulso de entrada ────────────────────────────
      gsap.set('.goodbye .btn', { opacity: 0, scale: 0.88 });
      ScrollTrigger.create({
        trigger: '.goodbye',
        start: 'top 80%',
        once: true,
        onEnter: () =>
          gsap.to('.goodbye .btn', {
            opacity: 1, scale: 1,
            duration: 0.65, ease: 'back.out(1.6)', delay: 0.35,
          }),
      });

      // ── MAGNÉTICO + ESCALA (solo desktop) ────────────────────────────
      if (isDesktop) {
        // Efecto magnético en CTAs principales: el botón sigue el cursor
        // con elastic snap-back al salir — sensación física premium
        const magneticBtns = document.querySelectorAll<HTMLElement>(
          '.hero__cta-group .btn, .modules__cta .btn, .goodbye .btn',
        );
        magneticBtns.forEach(btn => {
          btn.style.cursor = 'pointer';

          btn.addEventListener('mousemove', (e: MouseEvent) => {
            const r  = btn.getBoundingClientRect();
            const cx = r.left + r.width  / 2;
            const cy = r.top  + r.height / 2;
            gsap.to(btn, {
              x: (e.clientX - cx) * 0.32,
              y: (e.clientY - cy) * 0.32,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          });

          btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
              x: 0, y: 0,
              duration: 0.75,
              ease: 'elastic.out(1, 0.42)',
              overwrite: 'auto',
            });
          });
        });

        // Escala en todos los botones (incluye los magnéticos — x/y y scale no colisionan)
        document.querySelectorAll<HTMLElement>('.btn').forEach(btn => {
          const toScale = gsap.quickTo(btn, 'scale', { duration: 0.22, ease: 'power2.out' });
          btn.addEventListener('mouseenter', () => toScale(1.07));
          btn.addEventListener('mouseleave', () => toScale(1));
        });

        // Hover en tarjetas: levitar + escala sutil
        document
          .querySelectorAll<HTMLElement>('.benefits__card, .target__card, .failures__card')
          .forEach(card => {
            const toScale = gsap.quickTo(card, 'scale', { duration: 0.32, ease: 'power2.out' });
            const toY     = gsap.quickTo(card, 'y',     { duration: 0.32, ease: 'power2.out' });
            card.addEventListener('mouseenter', () => { toScale(1.04); toY(-6); });
            card.addEventListener('mouseleave', () => { toScale(1);    toY(0);  });
          });
      }
    },
  );

  // Recalcular posiciones de ScrollTrigger tras cargar todas las fuentes
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
