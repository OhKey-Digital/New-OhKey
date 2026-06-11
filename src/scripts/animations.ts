import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function init() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const mm = gsap.matchMedia();

  // ── ANIMACIONES FAIL-SAFE para móvil y tablet (<1280px) ──────────────────
  // IntersectionObserver es robusto en táctil; gsap.from() con immediateRender:false
  // garantiza que el elemento es visible por defecto y solo se oculta en el
  // instante en que entra al viewport. clearProps:'all' elimina estilos inline al
  // terminar → nunca quedan elementos atascados en opacity:0.
  function initMobileReveal() {
    // Un observer por elemento: observe() + disconnect() al disparar
    function reveal(selector: string, fromVars: gsap.TweenVars, threshold = 0.1) {
      document.querySelectorAll<Element>(selector).forEach((el) => {
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            obs.disconnect();
            // clearProps solo sobre las propiedades animadas: nunca tocar
            // custom properties inline (--bg-color, --tx-color) de los botones
            gsap.from(el, { ...fromVars, immediateRender: false, clearProps: 'opacity,transform' });
          },
          { threshold },
        );
        obs.observe(el);
      });
    }

    // Headings y labels: slide-up suave
    reveal(
      '.benefits__label, .benefits__heading,' +
      '.failures__label, .failures__heading,' +
      '.target__caption, .target__title,' +
      '.about__caption, .counter,' +
      '.goodbye__label, .goodbye__heading,' +
      '.modules__label, .modules__heading, .modules__description',
      { opacity: 0, y: 22, duration: 0.5, ease: 'power2.out' },
    );

    // Cards genéricas: fade-up con scale sutil
    reveal(
      '.benefits__card, .failures__card, .target__card',
      { opacity: 0, y: 18, scale: 0.97, duration: 0.45, ease: 'power2.out' },
    );

    // Tarjetas de precio: overshoot ligero para dar peso visual
    reveal(
      '.price__card-container',
      { opacity: 0, y: 24, scale: 0.96, duration: 0.5, ease: 'back.out(1.2)' },
    );

    // Acordeones: slide desde la izquierda, igual que en desktop pero más corto
    reveal(
      '.accordion',
      { opacity: 0, x: -14, duration: 0.38, ease: 'power2.out' },
      0.05,
    );

    // Retrato About: zoom-in sutil
    reveal(
      '.about__portrait--mobile',
      { opacity: 0, scale: 1.05, duration: 0.6, ease: 'power2.out' },
    );

    // Frases About: fade-up en cascada natural por scroll
    reveal(
      '.about__phrase',
      { opacity: 0, y: 14, duration: 0.45, ease: 'power2.out' },
    );

    // CTAs secundarios: pop de entrada
    reveal(
      '.modules__cta .btn, .goodbye .btn',
      { opacity: 0, scale: 0.9, duration: 0.5, ease: 'back.out(1.5)' },
    );

  }

  mm.add(
    {
      isDesktop: '(min-width: 1280px)',
      isMobile: '(max-width: 1279px)',
    },
    (ctx) => {
      const { isDesktop } = ctx.conditions as Record<string, boolean>;

      const dur     = isDesktop ? 0.75 : 0.5;
      const yFull   = isDesktop ? 40 : 20;
      const stagger = isDesktop ? 0.12 : 0.07;

      // ── HERO (above the fold, animación por CARGA — sin ScrollTrigger) ──
      // Esta intro es fiable en móvil porque NO depende del scroll ni del
      // cálculo de viewport: se dispara una vez al cargar la página.
      gsap.set('.hero__logo',        { opacity: 0, scale: 0.88 });
      // Título: los inners ya empiezan a translateY(110%) por CSS;
      // gsap.set confirma el estado para que el contexto pueda revertirlo limpiamente
      gsap.set('.hero__title-inner', { y: '110%' });
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
        // Título: reveal línea a línea desde debajo de la máscara
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

      // ── CORTE MÓVIL/TABLET (<1280px) ─────────────────────────────────
      // ScrollTrigger es infiable en viewports táctiles: la barra de
      // direcciones dinámica hace fallar los cálculos de posición y deja
      // secciones atascadas en opacity:0. Se delega a initMobileReveal().
      if (!isDesktop) {
        initMobileReveal();
        return;
      }

      // ════════════════════════════════════════════════════════════════
      //  DESKTOP ONLY — animaciones de scroll (viewport estable y fiable)
      // ════════════════════════════════════════════════════════════════

      // Paralaje sutil en stats al salir del hero
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
          start: 'top 90%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1, y: 0,
              duration: 0.7, ease: 'power3.out', stagger: 0.1,
              clearProps: 'all',
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
          start: 'top 90%',
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              opacity: 1, y: 0,
              duration: 0.7, ease: 'power3.out', stagger: 0.1,
              clearProps: 'all',
            }),
        });
      });

      // ── BATCH CARDS con blur cinematográfico ──────────────────────────
      // blur(6px) → blur(0) da profundidad de campo al reveal; clearProps
      // libera la capa de composición GPU tras completar la animación.
      const batchReveal = (
        selector: string,
        yAmt: number,
        overrides?: Partial<gsap.TweenVars>,
      ) => {
        gsap.set(selector, { opacity: 0, y: yAmt, scale: 0.96, filter: 'blur(6px)' });
        ScrollTrigger.batch(selector, {
          onEnter: els =>
            gsap.to(els, {
              opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
              duration: dur + 0.1,
              ease: 'power2.out',
              stagger,
              clearProps: 'filter',
              ...overrides,
            }),
          start: 'top 92%',
          once: true,
        });
      };

      batchReveal('.benefits__card', 28);
      batchReveal('.failures__card', 22);
      batchReveal('.target__card',   22);

      // Precio: overshoot + blur para máximo impacto
      gsap.set('.price__card-container', { opacity: 0, y: 32, scale: 0.94, filter: 'blur(8px)' });
      ScrollTrigger.batch('.price__card-container', {
        onEnter: els =>
          gsap.to(els, {
            opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
            duration: dur + 0.2,
            ease: 'back.out(1.3)',
            stagger: stagger * 1.2,
            clearProps: 'all',
          }),
        start: 'top 90%',
        once: true,
      });

      // Acordeones: deslizamiento lateral en cascada
      gsap.set('.accordion', { opacity: 0, x: -16 });
      ScrollTrigger.batch('.accordion', {
        onEnter: els =>
          gsap.to(els, {
            opacity: 1, x: 0,
            duration: 0.5, ease: 'power2.out', stagger: 0.06,
            clearProps: 'all',
          }),
        start: 'top 95%',
        once: true,
      });

      // ── ABOUT: retrato, frases y firma ────────────────────────────────
      gsap.set('.about__portrait--mobile, .about__portrait--desktop', {
        opacity: 0, scale: 1.05, filter: 'blur(10px)',
      });
      ScrollTrigger.create({
        trigger: '.about-section',
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to('.about__portrait--mobile, .about__portrait--desktop', {
            opacity: 1, scale: 1, filter: 'blur(0px)',
            duration: 1.0, ease: 'power2.out', clearProps: 'all',
          }),
      });

      gsap.set('.about__phrase', { opacity: 0, y: 18 });
      ScrollTrigger.batch('.about__phrase', {
        onEnter: els => gsap.to(els, {
          opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.12,
          clearProps: 'all',
        }),
        start: 'top 92%',
        once: true,
      });

      // Firma: entra con rotación y overshoot — refuerza el toque caligráfico
      gsap.set('.about__signature', { opacity: 0, rotate: -5, y: 12, scale: 0.9 });
      ScrollTrigger.create({
        trigger: '.about__signature',
        start: 'top 95%',
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
        start: 'top 90%',
        once: true,
        onEnter: () =>
          gsap.to('.goodbye .btn', {
            opacity: 1, scale: 1,
            duration: 0.65, ease: 'back.out(1.6)', delay: 0.35,
            clearProps: 'opacity,transform',
          }),
      });

      // ── MAGNÉTICO + ESCALA + HOVER ────────────────────────────────────
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
    },
  );

  // Recalcular posiciones de ScrollTrigger (solo activo en desktop) tras
  // cargar fuentes e imágenes, que cambian la altura del documento.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
