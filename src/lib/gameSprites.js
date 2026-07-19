// Paths SVG reaproveitados como sprites do jogo, desenhados via Path2D no canvas.

export const SHIP_BODY_PATH = {
  viewBox: 48,
  d: 'M15.844 37.636h2.016l-6.572 4.274l-5.797-4.322L24 6.09l18.509 31.498l-5.797 4.322l-6.572-4.274h2.016L24 24.444z',
}
export const SHIP_NOTCH_PATH = {
  viewBox: 48,
  d: 'M27.64 37.5h-7.394l3.697-6.638z',
}
export const SHIP_PATH = { viewBox: 48, body: SHIP_BODY_PATH.d, notch: SHIP_NOTCH_PATH.d }

export const ASTEROID_PATHS = [
  { viewBox: 24, d: 'M12.2 2.3c1.2-.3 2.3.5 3.1 1.4l3.6 4c.9.9 1.5 2.1 1.1 3.3l-1.5 5.1c-.3 1.1-1.2 1.9-2.3 2.2l-5.2 1.5c-1.2.3-2.4-.1-3.3-1L4 15.2c-.9-.9-1.3-2.2-1-3.4l1.3-4.9c.3-1.1 1.1-2 2.2-2.3z' },
  { viewBox: 24, d: 'M9.5 2.8c1.6-.6 3.3-.2 4.4 1l3.8 4.1c1 1.1 1.3 2.7.7 4.1l-2.1 4.7c-.6 1.3-1.8 2.2-3.2 2.4l-5 .7c-1.4.2-2.8-.4-3.6-1.6L2 14.1c-.8-1.2-.9-2.8-.2-4.1l2.4-4.6c.6-1.1 1.6-1.9 2.8-2.2z' },
  { viewBox: 24, d: 'M11 2.2c1.4-.4 2.9.1 3.9 1.2l2.9 3.2c1 1.1 1.4 2.6.9 4l-1.6 4.6c-.5 1.3-1.6 2.3-3 2.6l-4.6.9c-1.4.3-2.8-.2-3.7-1.3l-3-3.6c-.9-1.1-1.2-2.6-.7-3.9l1.9-4.9c.4-1.1 1.4-1.9 2.6-2.2z' },
]

export const ENEMY_PATH = {
  viewBox: 24,
  d: 'M17.99 9.18C17.84 6.3 15.22 4 12 4S6.17 6.3 6.01 9.18C3.49 10.3 2 12.06 2 14c0 3.36 4.39 6 10 6s10-2.64 10-6c0-1.94-1.49-3.71-4.01-4.82M7 16c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1m5 1c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1m0-5h-.23c-1.22-.03-3.56-.35-3.75-2.32C8.01 9.6 8 9.52 8 9.45c0-1.9 1.79-3.44 4-3.44s4 1.54 4 3.44c0 .08 0 .16-.03.29c-.2 2.04-2.84 2.27-3.97 2.27Zm5 4c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1',
}

export const HEART_PATH = {
  viewBox: 24,
  d: 'M13 22h-2v-2h2zm-2-2H9v-2h2zm4 0h-2v-2h2zm-6-2H7v-2h2zm8 0h-2v-2h2zM7 16H5v-2h2zm12 0h-2v-2h2zM5 14H3v-2h2zm16 0h-2v-2h2zM3 12H1V6h2zm20 0h-2V6h2zM13 8h-2V6h2zM5 6H3V4h2zm6 0H9V4h2zm4 0h-2V4h2zm6 0h-2V4h2zM9 4H5V2h4zm10 0h-4V2h4z',
}

// Cor dos inimigos por "tier" de n\u00edvel (a cada 2 n\u00edveis muda, sinalizando que ficaram mais fortes)
export const ENEMY_TIER_COLORS = ['#e2716f', '#c084e0', '#4fe3ff', '#c8ff4f', '#ff8a3d', '#7c4fff']
