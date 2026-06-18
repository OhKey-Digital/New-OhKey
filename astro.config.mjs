import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // URL canónica de producción: imprescindible para el sitemap y las URLs canónicas absolutas
  site: 'https://ohkeydigital.com',
  output: 'static', // híbrido: páginas estáticas + endpoints on-demand (ej. /api/track)
  adapter: node({ mode: 'standalone' }),
  integrations: [
    sitemap({
      // Excluye los endpoints de API del sitemap (no son páginas indexables)
      filter: (page) => !page.includes('/api/'),
      lastmod: new Date(),
    }),
  ],
});
