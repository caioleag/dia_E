# Ícones PWA

Para o app funcionar como PWA completo, crie os seguintes ícones PNG:

## Ícones Necessários

1. **icon-192.png** - 192x192px
2. **icon-512.png** - 512x512px
3. **icon-maskable-192.png** - 192x192px (com padding de 10% para maskable)
4. **icon-maskable-512.png** - 512x512px (com padding de 10% para maskable)

## Como Criar

### Opção 1: Usar ferramenta online
- Acesse: https://realfavicongenerator.net/
- Faça upload do `icon.svg`
- Baixe os ícones gerados

### Opção 2: Usar ImageMagick (se instalado)
```bash
# Converter SVG para PNG
magick icon.svg -resize 192x192 icon-192.png
magick icon.svg -resize 512x512 icon-512.png

# Para maskable (com padding)
magick icon.svg -resize 154x154 -gravity center -extent 192x192 -background "#0A0A0F" icon-maskable-192.png
magick icon.svg -resize 410x410 -gravity center -extent 512x512 -background "#0A0A0F" icon-maskable-512.png
```

### Opção 3: Usar Figma/Photoshop
- Exporte o logo em 192x192 e 512x512
- Para maskable: adicione 10% de padding ao redor

## Cores do Tema
- Background: `#0A0A0F` (bg-deep)
- Primary: `#6B21A8` (brand-purple)
- Accent: `#EC4899` (brand-pink)
