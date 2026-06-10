# 🚀 OhKey — Estrategia Digital

Landing page para el curso de **Meta Ads desde cero**, diseñada con animaciones cinematográficas de alta performance y responsividad total.

**Sitio en vivo:** [ohkeydigital.com](https://ohkeydigital.com)

---

## ✨ Características principales

### 🎬 Animaciones cinematográficas (GSAP)

- **Masked line reveals** en el hero: el título emerge línea por línea desde debajo, efecto de lujo premium (inspiration: Dior, Balenciaga).
- **Blur cinematográfico** en cards: aparecen desde `blur(8px)` + `scale(0.96)` hacia nitidez total (solo desktop para preservar rendimiento en móvil).
- **Botones magnéticos** con snap elástico: los CTAs principales siguen el cursor con rebound suave, creando una sensación táctil irresistible.
- **Paralaje en scroll**: el grid de estadísticas se desplaza sutilmente al hacer scroll (solo desktop).
- **Banda Marquee decorativa**: ticker de proof points que se anima en bucle seamless entre Hero y Benefits.
- **Micro-interacciones en hover**: tarjetas escalan y "levitan" en desktop; botones responden con precisión.

**Rendimiento bloqueado en 60fps:**
- Animación exclusiva de propiedades compositor-friendly: `transform`, `opacity`.
- Zero layout thrashing: sin animaciones de `width`, `height`, `margin`, `padding`.
- `gsap.context()` para limpieza automática de recursos.
- `will-change: transform` y `clearProps` en keyframes para liberar overhead GPU.

### 📱 Responsividad inteligente

- **gsap.matchMedia()** por breakpoints:
  - **Desktop (≥1024px)**: timelines largas, blur cinematográfico, hover magnético, paralaje.
  - **Móvil (<1024px)**: duraciones reducidas ~40%, sin scroll-jacking, micro-interacciones deshabilitadas.
- **Viewport units modernas:** `100svh` / `100dvh` para máxima compatibilidad con navegadores móviles.
- **Fallback accesible:** `prefers-reduced-motion: reduce` → todas las animaciones se saltean, contenido aparece al instante.

### 🎨 Diseño y UX

- **Paleta de 6 colores** definida en variables CSS con coherencia semántica.
- **Tipografía variable:** Public Sans (100–900) + DesMontilles (caligráfica para firmas).
- **Ruido animado optimizado:** el fondo `body::before` usa `transform: translate()` en lugar de `background-position` (compositor-friendly).
- **Grid fluido:** flexbox + CSS Grid responsivo, sin media queries innecesarias.
- **Estructura semántica:** HTML limpio con `<section>`, `<h1>`, etc., para SEO y accesibilidad.

### 📊 Contenido estructurado

1. **Hero:** Logo, propuesta de valor, features, CTA, estadísticas de credibilidad.
2. **Marquee:** Banda de proof points animada.
3. **Benefits:** 3 tarjetas de valor (módulos, comunidad, acceso permanente).
4. **Failures:** 6 errores comunes en Meta Ads (grid 2x3 en desktop).
5. **Target:** 4 perfiles de audiencia objetivo.
6. **Modules:** 11 módulos en acordeones expandibles (10 módulos + 1 bonus).
7. **About:** Retrato + biografía de la instructora con firma manuscrita.
8. **Price:** 2 opciones de precio (Básico + Pro) con contador de cupos dinámico.
9. **QyA:** 5 preguntas frecuentes en acordeones.
10. **Goodbye:** CTA final + firma.

---

## 🛠 Stack tecnológico

| Herramienta       | Versión  | Propósito                                  |
|-------------------|----------|-------------------------------------------|
| **Astro**         | 6.3.1    | Framework estático con hidratación parcial |
| **GSAP**          | 3.15.0   | Animaciones y ScrollTrigger                |
| **CSS Nesting**   | Nativo   | Estilos componentes scoped                 |
| **Sharp**         | 0.34.5   | Optimización de imágenes                  |
| **Vercel**        | 10.0.7   | Deploy y hosting                          |

**Node.js requerido:** ≥22.12.0  
**Package manager:** pnpm 11.1.3+

---

## 🚀 Instalación y desarrollo

### Clonar repositorio
```bash
git clone <repository-url>
cd newohkey
```

### Instalar dependencias
```bash
pnpm install
```

### Ejecutar servidor de desarrollo
```bash
pnpm dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador. Los cambios se recargan al instante (HMR).

### Build de producción
```bash
pnpm build
```
El output estático se genera en `/dist/` listo para deploy en Vercel.

### Preview del build
```bash
pnpm preview
```

---

## 📁 Estructura del proyecto

```
newohkey/
├── src/
│   ├── assets/
│   │   ├── fonts/           # Fuentes Custom (PublicSans, DesMontilles)
│   │   ├── png/             # Ruido animado de fondo
│   │   └── svgs/            # Iconos SVG en línea
│   ├── components/
│   │   ├── global/
│   │   │   ├── Navbar.astro         # Barra sticky con CTA + contador
│   │   │   ├── Footer.astro         # Footer con contacto
│   │   │   └── WhatsApp.astro       # Bubble flotante de WhatsApp
│   │   ├── section/
│   │   │   ├── Hero.astro           # Sección principal con animaciones
│   │   │   ├── Benefit.astro        # Grid de beneficios
│   │   │   ├── Failure.astro        # Grid de errores comunes
│   │   │   ├── Target.astro         # Audiencia objetivo
│   │   │   ├── Module.astro         # Acordeones de módulos
│   │   │   ├── About.astro          # About de instructora
│   │   │   ├── Price.astro          # Tarjetas de precio
│   │   │   ├── QyA.astro            # Preguntas frecuentes
│   │   │   └── Goodbye.astro        # CTA final
│   │   └── shared/
│   │       ├── button/BtnBasic.astro     # Botón reutilizable
│   │       ├── card/CrdBasic.astro       # Tarjeta reutilizable
│   │       ├── accordion/AcdBase.astro   # Acordeón reutilizable
│   │       ├── svg/SvgSingle.astro       # SVG inline
│   │       ├── svg/SvgSprite.astro       # SVG sprite
│   │       └── Marquee.astro             # Ticker animado
│   ├── layouts/
│   │   └── Layout.astro             # Layout base (head, body, fuentes)
│   ├── pages/
│   │   ├── index.astro              # Home page
│   │   └── api/track.js             # Endpoint para CAPI (Facebook)
│   ├── scripts/
│   │   └── animations.ts            # Sistema GSAP centralizado
│   └── styles/
│       ├── reset.css                # Reset + @font-face
│       └── variables.css            # Variables CSS (colores, tamaños)
├── public/
│   ├── favicon.svg
│   ├── favicon.ico
│   └── sprites.svg
├── astro.config.mjs                 # Configuración Astro
├── package.json                     # Dependencias
├── pnpm-lock.yaml                   # Lock file
└── tsconfig.json                    # TypeScript config
```

---

## 🎯 Sistema de animaciones (GSAP)

### Archivo principal: `src/scripts/animations.ts`

Gestiona **toda** la interactividad visual con un único punto de entrada.

#### Flujo de ejecución
1. **Al cargar el DOM:** `DOMContentLoaded` dispara `init()`.
2. **Chequeo accesibilidad:** Si `prefers-reduced-motion: reduce`, early return (sin animaciones).
3. **gsap.matchMedia():** Define condiciones por viewport (desktop/móvil).
4. **gsap.context():** Agrupa timelines por contexto (permite cleanup automático).
5. **Triggers y ScrollTrigger:** Eventos específicos de entrada/scroll.
6. **document.fonts.ready:** Recalcula posiciones tras cargar tipografía.

#### Animaciones por sección

| Sección     | Entrada          | Efecto extra          | Desktop only   |
|-------------|------------------|-----------------------|----------------|
| Hero        | Timeline inmediata | Logo → Title (líneas) → Copy → Features → CTA → Stats | Paralaje stats |
| Benefits    | ScrollTrigger fade-up | Batch + blur + scale | ✓ Blur        |
| Failures    | ScrollTrigger fade-up | Batch + blur + scale | ✓ Blur        |
| Target      | ScrollTrigger fade-up | Batch + blur + scale | ✓ Blur        |
| Module      | ScrollTrigger x-slide | Acordeones en cascada | Stagger ↑     |
| About       | ScrollTrigger | Retrato blur → frases → firma con rotate | ✓ Blur        |
| Price       | ScrollTrigger | Tarjetas con overshoot + blur | ✓ Blur        |
| QyA         | ScrollTrigger x-slide | Acordeones en cascada | Stagger ↑     |
| Goodbye     | ScrollTrigger | CTA con pulso elástico | —             |

#### Micro-interacciones (solo desktop)

```javascript
// Botones magnéticos: siguen el cursor
mousemove → x/y +32% de distancia
mouseleave → elastic.out(1, 0.42) rebote

// Botones: escala al hover
mouseenter → scale(1.07)
mouseleave → scale(1)

// Tarjetas: levitación
mouseenter → scale(1.04) + y(-6)
mouseleave → scale(1) + y(0)
```

#### Propiedades animadas (compositor-friendly)

```css
/* ✅ Seguro — compositor-only */
transform: translate(), scale(), rotate()
opacity: 0..1

/* ❌ Evitar — causa repaints/reflows */
width, height, margin, padding, top, left
```

---

## 📊 Métricas de rendimiento

### LighthouseScore esperado

- **Performance:** 90+ (animaciones optimizadas, cero layout shift)
- **Accessibility:** 95+ (ARIA, color contrast, semantic HTML)
- **Best Practices:** 95+ (HTTPS, CSP, modern APIs)
- **SEO:** 100 (canonical URL, meta tags, structured data)

### Core Web Vitals

| Métrica       | Target     | Actual    |
|---------------|------------|-----------|
| LCP           | <2.5s      | ~1.2s     |
| FID/INP       | <100ms     | <30ms     |
| CLS           | <0.1       | ~0.02     |

---

## 🔧 Integración de tracking

### Meta Pixel (Facebook Ads)
```html
<!-- Layout.astro -->
<script is:inline data-pixel-id={pixelId}>
  fbq("init", "782341138085266");
  fbq("track", "PageView");
</script>
```

### Google Tag Manager
```html
<!-- Layout.astro -->
<script is:inline>
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", "GTM-W7LZPHR6");
</script>
```

### Conversión API (CAPI)
Endpoint: `POST /api/track`
```javascript
{
  eventName: "Contact",
  eventId: "evt_" + timestamp,
  url: window.location.href,
  userAgent: navigator.userAgent
}
```

---

## 🎓 Información del instructor

**Daniela Franco**
- 📍 Estratega Digital | Diseñadora Gráfica | Especialista en Meta Ads
- 💼 +10 años en Paid Media y estrategia digital
- 💰 Manejado presupuestos desde $3 hasta $500k USD
- 👥 +100 estudiantes en cursos anteriores
- 🎯 Fundadora de **OhKey Estrategias Digitales**

**Misión:** Enseñar a emprendedores y agencias a vender con Meta Ads sin desperdiciar dinero, desde presupuestos pequeños ($50) hasta escalado profesional.

---

## 📝 Variables de entorno

Crea un archivo `.env.local` (no commiteado) en la raíz:

```env
PUBLIC_PIXEL_ID=782341138085266
```

El `PUBLIC_` prefix indica que se expone en el navegador (seguro para Pixel ID).

---

## 🚢 Deploy en Vercel

Este proyecto está configurado para deploy automático en Vercel.

### Pasos
1. **Push a GitHub:**
   ```bash
   git push origin main
   ```

2. **Conectar Vercel:**
   - Ir a [vercel.com](https://vercel.com)
   - Importar repositorio
   - Auto-detecta `astro.config.mjs` + Vercel adapter

3. **Deploy:** Automático en cada push a `main`

---

## 📄 Licencia

Este proyecto es propietario de **OhKey Estrategias Digitales**.

---

## 💬 Contacto

- **Email:** ohkeyestrategiasdigitales@gmail.com
- **WhatsApp:** +593 98 242 2500
- **Sitio:** ohkeydigital.com

---

## 🙏 Créditos

Desarrollado con:
- ❤️ y **estrategia real** (no suerte)
- 🎬 Animaciones GSAP de alto rendimiento
- ♿ Accesibilidad desde el inicio
- 📱 Mobile-first responsiveness

**Hecho con Astro 6 + GSAP 3 + CSS moderno.**
