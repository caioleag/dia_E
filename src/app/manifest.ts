import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dia E - Falar ou Fazer',
    short_name: 'Dia E',
    description: 'Jogo social de Falar ou Fazer para grupos e casais',
    start_url: '/?source=pwa',
    display: 'standalone',
    background_color: '#0A0A0F',
    theme_color: '#6B21A8',
    orientation: 'portrait',
    scope: '/',
    lang: 'pt-BR',
    categories: ['games', 'social', 'entertainment'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
