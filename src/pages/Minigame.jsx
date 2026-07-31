import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { SHIP_PATH, SHIP_BODY_PATH, SHIP_NOTCH_PATH, ASTEROID_PATHS, ENEMY_PATH, HEART_PATH, ENEMY_TIER_COLORS } from '../lib/gameSprites'

const W = 360
const H = 560
const SHIP_R = 15
const BULLET_SPEED = 6.5
const ENEMY_BULLET_SPEED = 3.2
const PLAYER_FIRE_INTERVAL = 260
const LEVEL_KILL_THRESHOLD = 35
const POWERUP_DROP_CHANCE = 0.16
const POWERUP_DURATION = 10000
const INVINCIBILITY_DURATION = 1500
const HIGHSCORE_KEY = 'financeiro:minigame-recorde'

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function drawIcon(ctx, path, x, y, size, color, glow) {
  ctx.save()
  ctx.translate(x - size / 2, y - size / 2)
  const scale = size / path.viewBox
  ctx.scale(scale, scale)
  if (glow) {
    ctx.shadowColor = color
    ctx.shadowBlur = 10
  }
  ctx.fillStyle = color
  if (!path._path2d) path._path2d = new Path2D(path.d)
  ctx.fill(path._path2d)
  ctx.restore()
}

export default function Minigame() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const gameRef = useRef(null)
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, bombs: 0 })
  const [status, setStatus] = useState('start') // start | playing | paused | gameover
  const [finalScore, setFinalScore] = useState(0)
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem(HIGHSCORE_KEY)) || 0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const highScoreRef = useRef(highScore)
  useEffect(() => { highScoreRef.current = highScore }, [highScore])

  function criarEstado() {
    const stars = []
    for (let i = 0; i < 60; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, baseSpeed: 0.4 + Math.random() * 0.8, size: 1 + Math.random() * 1.4 })
    }
    return {
      ship: { x: W / 2, y: H - 70 },
      targetX: W / 2,
      targetY: H - 70,
      bullets: [],
      enemyBullets: [],
      asteroids: [],
      enemies: [],
      powerups: [],
      particles: [],
      stars,
      score: 0,
      lives: 3,
      level: 1,
      kills: 0,
      invincibleUntil: 0,
      shieldUntil: 0,
      tripleUntil: 0,
      bombCount: 0,
      bombWave: null,
      lastFire: 0,
      lastSpawn: 0,
      lastEnemyFireCheck: 0,
      lastSecondTick: 0,
      warpFactor: 1,
      targetWarp: 1,
      transitioning: false,
      transitionPhase: null,
      transitionStart: 0,
      shipLaunch: 0,
      running: true,
    }
  }

  function iniciarJogo() {
    gameRef.current = criarEstado()
    setHud({ score: 0, lives: 3, level: 1, bombs: 0 })
    setStatus('playing')
  }

  function togglePausa() {
    setStatus((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s))
  }

  function ativarBomba() {
    const g = gameRef.current
    if (!g || !g.bombCount || g.bombWave) return
    g.bombCount -= 1
    g.bombWave = { start: performance.now(), radius: 0, atingidos: new Set() }
    setHud((h) => ({ ...h, bombs: g.bombCount }))
  }

  // ---------- Loop principal ----------
  useEffect(() => {
    if (status !== 'playing') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const g = gameRef.current

    function spawnIntervalFor(level) {
      return Math.max(1500 - level * 90, 500)
    }
    function asteroidSpeedFor(level) {
      return 1.1 + level * 0.12
    }
    function enemySpeedFor(level) {
      return 0.7 + level * 0.08
    }
    function enemyHpFor(level) {
      return 1 + Math.floor((level - 1) / 2)
    }

    function spawnOnda(ts) {
      if (g.transitioning) return
      if (ts - g.lastSpawn < spawnIntervalFor(g.level)) return
      g.lastSpawn = ts
      const isEnemy = Math.random() < 0.4
      const x = 24 + Math.random() * (W - 48)
      if (isEnemy) {
        g.enemies.push({
          x, y: -20, r: 14,
          speed: enemySpeedFor(g.level),
          hp: enemyHpFor(g.level),
          maxHp: enemyHpFor(g.level),
          color: ENEMY_TIER_COLORS[Math.min(Math.floor((g.level - 1) / 2), ENEMY_TIER_COLORS.length - 1)],
          lastFire: ts + Math.random() * 800,
        })
      } else {
        g.asteroids.push({
          x, y: -20, r: 13 + Math.random() * 4,
          speed: asteroidSpeedFor(g.level) * (0.85 + Math.random() * 0.3),
          shape: ASTEROID_PATHS[Math.floor(Math.random() * ASTEROID_PATHS.length)],
        })
      }
    }

    function iniciarTransicaoNivel(ts) {
      g.transitioning = true
      g.transitionPhase = 'ignite'
      g.transitionStart = ts
      g.asteroids = []
      g.enemies = []
      g.enemyBullets = []
    }

    function atualizarTransicao(ts) {
      const t = ts - g.transitionStart
      if (g.transitionPhase === 'ignite' && t > 500) {
        g.transitionPhase = 'warp'
        g.targetWarp = 18
      } else if (g.transitionPhase === 'warp' && t > 1300) {
        g.transitionPhase = 'launch'
        g.shipLaunch = 1
      } else if (g.transitionPhase === 'launch' && t > 2100) {
        g.transitionPhase = 'levelText'
        g.level += 1
        setHud((h) => ({ ...h, level: g.level }))
      } else if (g.transitionPhase === 'levelText' && t > 3800) {
        g.transitionPhase = 'settle'
        g.targetWarp = 1
        g.shipLaunch = 0
      } else if (g.transitionPhase === 'settle' && t > 4600) {
        g.transitioning = false
        g.transitionPhase = null
        g.lastSpawn = ts
      }
    }

    function loop(ts) {
      if (!g.running) return
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#050508'
      ctx.fillRect(0, 0, W, H)

      // Starfield -- sempre rodando, só acelera/desacelera
      g.warpFactor += (g.targetWarp - g.warpFactor) * 0.06
      g.stars.forEach((s) => {
        const speed = s.baseSpeed * g.warpFactor
        s.y += speed
        if (s.y > H) { s.y = 0; s.x = Math.random() * W }
        const streakLen = Math.min(speed * 3, 120)
        ctx.strokeStyle = `rgba(245,245,243,${Math.min(0.4 + g.warpFactor / 20, 1)})`
        ctx.lineWidth = s.size
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x, s.y - streakLen)
        ctx.stroke()
      })

      if (g.transitioning) {
        atualizarTransicao(ts)
      } else {
        spawnOnda(ts)
      }

      // Nave segue o toque
      g.ship.x += (g.targetX - g.ship.x) * 0.25
      g.ship.y += (g.targetY - g.ship.y) * 0.25
      g.ship.x = Math.max(SHIP_R, Math.min(W - SHIP_R, g.ship.x))
      g.ship.y = Math.max(SHIP_R, Math.min(H - SHIP_R, g.ship.y))

      const fasesSemNave = ['levelText', 'settle']
      const shipVisible = !(g.transitioning && fasesSemNave.includes(g.transitionPhase))

      // Tiro automático
      if (!g.transitioning && ts - g.lastFire > PLAYER_FIRE_INTERVAL) {
        g.lastFire = ts
        const triple = ts < g.tripleUntil
        if (triple) {
          g.bullets.push({ x: g.ship.x, y: g.ship.y - 14, vx: 0, vy: -BULLET_SPEED })
          g.bullets.push({ x: g.ship.x, y: g.ship.y - 14, vx: -1.6, vy: -BULLET_SPEED })
          g.bullets.push({ x: g.ship.x, y: g.ship.y - 14, vx: 1.6, vy: -BULLET_SPEED })
        } else {
          g.bullets.push({ x: g.ship.x, y: g.ship.y - 14, vx: 0, vy: -BULLET_SPEED })
        }
      }

      // Atualiza tiros do jogador
      g.bullets.forEach((b) => { b.x += b.vx; b.y += b.vy })
      g.bullets = g.bullets.filter((b) => b.y > -10 && b.x > -10 && b.x < W + 10)

      // Asteroides
      g.asteroids.forEach((a) => { a.y += a.speed })
      g.asteroids = g.asteroids.filter((a) => a.y < H + 30)

      // Inimigos + tiro mirado
      g.enemies.forEach((e) => {
        if (e.y < H / 2) {
          e.y += e.speed
        } else {
          // Chegou na linha de parada -- entra em flutua\u00e7\u00e3o suave (com uma
          // rampa de entrada, pra n\u00e3o "travar" saindo direto do movimento reto)
          if (e.floatBaseX === undefined) {
            e.floatBaseX = e.x
            e.floatSeed = Math.random() * Math.PI * 2
            e.arrivedAt = ts
          }
          const decorrido = ts - e.arrivedAt
          const entrada = Math.min(decorrido / 700, 1)
          e.x = e.floatBaseX + Math.sin(decorrido / 900 + e.floatSeed) * 20 * entrada
          e.y = H / 2 + Math.sin(decorrido / 1300 + e.floatSeed) * 9 * entrada
        }
        if (!g.transitioning && !e.dying && ts - e.lastFire > 1900 && e.y > 0 && e.y < H - 40) {
          e.lastFire = ts
          const dx = g.ship.x - e.x
          const dy = g.ship.y - e.y
          const len = Math.hypot(dx, dy) || 1
          g.enemyBullets.push({ x: e.x, y: e.y, vx: (dx / len) * ENEMY_BULLET_SPEED, vy: (dy / len) * ENEMY_BULLET_SPEED })
        }
      })
      g.enemies = g.enemies.filter((e) => e.y < H + 30)

      g.enemyBullets.forEach((b) => { b.x += b.vx; b.y += b.vy })
      g.enemyBullets = g.enemyBullets.filter((b) => b.y > -10 && b.y < H + 10 && b.x > -10 && b.x < W + 10)

      // Power-ups caindo
      g.powerups.forEach((p) => { p.y += 1.3 })
      g.powerups = g.powerups.filter((p) => p.y < H + 20)

      // Colisão: tiro do jogador x asteroide/inimigo
      g.bullets.forEach((b) => {
        g.asteroids.forEach((a) => {
          if (!b.dead && !a.dead && dist(b, a) < a.r + 3) {
            b.dead = true; a.dead = true
            g.score += 10
            g.kills += 1
            criarFragmentos(a.x, a.y)
            tentarDropPowerup(a.x, a.y)
          }
        })
        g.enemies.forEach((e) => {
          if (!b.dead && !e.dying && dist(b, e) < e.r + 3) {
            b.dead = true
            e.hp -= 1
            if (e.hp <= 0 && !e.dying) {
              e.dying = true
              e.dyingStart = ts
              g.score += 25
              g.kills += 1
              criarFragmentos(e.x, e.y)
              tentarDropPowerup(e.x, e.y)
            }
          }
        })
      })
      g.bullets = g.bullets.filter((b) => !b.dead)
      g.asteroids = g.asteroids.filter((a) => !a.dead)
      g.enemies = g.enemies.filter((e) => !e.dying || ts - e.dyingStart < 400)

      function criarFragmentos(x, y) {
        const n = 5 + Math.floor(Math.random() * 3)
        for (let i = 0; i < n; i++) {
          const ang = Math.random() * Math.PI * 2
          const spd = 1 + Math.random() * 2.5
          g.particles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, size: 1.5 + Math.random() * 2, born: ts, life: 450 + Math.random() * 200 })
        }
      }

      g.particles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vx *= 0.94; p.vy *= 0.94 })
      g.particles = g.particles.filter((p) => ts - p.born < p.life)

      function tentarDropPowerup(x, y) {
        if (Math.random() < POWERUP_DROP_CHANCE) {
          // Bomba \u00e9 mais rara -- vai pro arsenal, n\u00e3o ativa sozinha
          const sorteio = Math.random()
          const tipo = sorteio < 0.42 ? 'escudo' : sorteio < 0.84 ? 'triplo' : 'bomba'
          g.powerups.push({ x, y, tipo })
        }
      }

      // Colisão: nave x power-up
      g.powerups.forEach((p) => {
        if (!p.dead && dist(p, g.ship) < SHIP_R + 10) {
          p.dead = true
          if (p.tipo === 'escudo') g.shieldUntil = ts + POWERUP_DURATION
          if (p.tipo === 'triplo') g.tripleUntil = ts + POWERUP_DURATION
          if (p.tipo === 'bomba') {
            g.bombCount = Math.min((g.bombCount || 0) + 1, 3)
            setHud((h) => ({ ...h, bombs: g.bombCount }))
          }
        }
      })
      g.powerups = g.powerups.filter((p) => !p.dead)

      // Ativa\u00e7\u00e3o da bomba: onda de energia saindo da nave
      if (g.bombWave) {
        const decorrido = ts - g.bombWave.start
        g.bombWave.radius = decorrido * 0.9
        g.asteroids.forEach((a) => {
          if (!a.dead && !g.bombWave.atingidos.has(a) && dist(a, g.ship) < g.bombWave.radius) {
            g.bombWave.atingidos.add(a)
            a.dead = true
            g.score += 10
            g.kills += 1
            criarFragmentos(a.x, a.y)
          }
        })
        g.enemies.forEach((e) => {
          if (!e.dying && !g.bombWave.atingidos.has(e) && dist(e, g.ship) < g.bombWave.radius) {
            g.bombWave.atingidos.add(e)
            e.dying = true
            e.dyingStart = ts
            g.score += 25
            g.kills += 1
            criarFragmentos(e.x, e.y)
          }
        })
        g.enemyBullets.forEach((b) => {
          if (!b.dead && dist(b, g.ship) < g.bombWave.radius) b.dead = true
        })
        g.asteroids = g.asteroids.filter((a) => !a.dead)
        g.enemyBullets = g.enemyBullets.filter((b) => !b.dead)
        if (g.bombWave.radius > 700) g.bombWave = null
      }

      // Colisão: nave x asteroide/inimigo/tiro inimigo
      const invencivel = ts < g.invincibleUntil
      if (!invencivel && !g.transitioning) {
        // O escudo é uma barreira: s\u00f3 absorve tiros inimigos, n\u00e3o bloqueia colis\u00e3o f\u00edsica
        const escudoAtivo = ts < g.shieldUntil
        if (escudoAtivo) {
          g.enemyBullets.forEach((b) => {
            if (!b.dead && dist(b, g.ship) < SHIP_R + 7) b.dead = true
          })
        }

        let atingido = false
        g.asteroids.forEach((a) => { if (dist(a, g.ship) < a.r + SHIP_R - 6) { a.dead = true; atingido = true } })
        g.enemies.forEach((e) => { if (!e.dying && dist(e, g.ship) < e.r + SHIP_R - 6) { e.dead = true; atingido = true } })
        g.enemyBullets.forEach((b) => { if (!b.dead && dist(b, g.ship) < SHIP_R - 4) { b.dead = true; atingido = true } })
        if (atingido) {
          g.lives -= 1
          g.invincibleUntil = ts + INVINCIBILITY_DURATION
          g.asteroids = g.asteroids.filter((a) => !a.dead)
          g.enemies = g.enemies.filter((e) => !e.dead)
          g.enemyBullets = g.enemyBullets.filter((b) => !b.dead)
          setHud((h) => ({ ...h, lives: g.lives, justLostIndex: g.lives, blinkToken: (h.blinkToken || 0) + 1 }))
          if (g.lives <= 0) {
            g.shipExploding = true
            g.shipExplodeAt = ts
            criarFragmentos(g.ship.x, g.ship.y)
            criarFragmentos(g.ship.x, g.ship.y)
          }
        } else {
          g.enemyBullets = g.enemyBullets.filter((b) => !b.dead)
        }
      }

      // Pontuação por tempo vivo
      if (ts - g.lastSecondTick > 1000 && !g.transitioning && !g.shipExploding) {
        g.lastSecondTick = ts
        g.score += 1
      }

      // Avançar de nível
      if (!g.transitioning && !g.shipExploding && g.kills >= g.level * LEVEL_KILL_THRESHOLD) {
        iniciarTransicaoNivel(ts)
      }

      // Ap\u00f3s a explos\u00e3o da nave, finaliza o Game Over
      if (g.shipExploding && ts - g.shipExplodeAt > 800) {
        g.running = false
        const recordeAnterior = Number(localStorage.getItem(HIGHSCORE_KEY)) || 0
        const novoRecorde = g.score > recordeAnterior
        if (novoRecorde) localStorage.setItem(HIGHSCORE_KEY, String(g.score))
        setFinalScore(g.score)
        setHighScore(novoRecorde ? g.score : recordeAnterior)
        setIsNewRecord(novoRecorde)
        setStatus('gameover')
        return
      }

      setHud((h) => (h.score !== g.score ? { ...h, score: g.score } : h))

      // ---------- Desenho ----------
      g.asteroids.forEach((a) => drawIcon(ctx, a.shape, a.x, a.y, a.r * 2.1, '#f5f5f3', false))

      g.particles.forEach((p) => {
        const vida = 1 - (ts - p.born) / p.life
        ctx.globalAlpha = Math.max(vida, 0)
        ctx.fillStyle = '#c9c9c6'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      g.enemies.forEach((e) => {
        const alpha = e.dying ? Math.max(1 - (ts - e.dyingStart) / 400, 0) : 1
        ctx.globalAlpha = alpha
        drawIcon(ctx, ENEMY_PATH, e.x, e.y, e.r * 2.2, e.color, true)
        if (e.maxHp > 1 && !e.dying) {
          const w = 22
          ctx.fillStyle = '#2a1414'
          ctx.fillRect(e.x - w / 2, e.y + e.r + 3, w, 3)
          ctx.fillStyle = e.color
          ctx.fillRect(e.x - w / 2, e.y + e.r + 3, w * (e.hp / e.maxHp), 3)
        }
        ctx.globalAlpha = 1
      })
      g.bullets.forEach((b) => {
        ctx.fillStyle = '#4fe3ff'
        ctx.shadowColor = '#4fe3ff'
        ctx.shadowBlur = 7
        ctx.beginPath()
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })
      g.enemyBullets.forEach((b) => {
        ctx.fillStyle = '#ff4f4f'
        ctx.shadowColor = '#ff4f4f'
        ctx.shadowBlur = 7
        ctx.beginPath()
        ctx.arc(b.x, b.y, 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })
      g.powerups.forEach((p) => {
        const cor = p.tipo === 'escudo' ? '#4fce7a' : p.tipo === 'triplo' ? '#4fe3ff' : '#e0d15a'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2)
        ctx.fillStyle = '#171512'
        ctx.fill()
        ctx.strokeStyle = cor
        ctx.lineWidth = 1.5
        ctx.shadowColor = cor
        ctx.shadowBlur = 8
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.fillStyle = cor

        if (p.tipo === 'escudo') {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y - 6)
          ctx.lineTo(p.x + 4.5, p.y - 3.5)
          ctx.lineTo(p.x + 4.5, p.y + 1.5)
          ctx.quadraticCurveTo(p.x + 4.5, p.y + 5, p.x, p.y + 6.5)
          ctx.quadraticCurveTo(p.x - 4.5, p.y + 5, p.x - 4.5, p.y + 1.5)
          ctx.lineTo(p.x - 4.5, p.y - 3.5)
          ctx.closePath()
          ctx.fill()
        } else if (p.tipo === 'bomba') {
          ctx.beginPath()
          ctx.moveTo(p.x + 1.5, p.y - 7)
          ctx.lineTo(p.x - 4, p.y + 1)
          ctx.lineTo(p.x - 0.5, p.y + 1)
          ctx.lineTo(p.x - 2, p.y + 7)
          ctx.lineTo(p.x + 4.5, p.y - 2)
          ctx.lineTo(p.x + 1, p.y - 2)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('T', p.x, p.y + 1)
        }
      })

      if (shipVisible && g.lives > 0 && !g.shipExploding) {
        const piscando = ts < g.invincibleUntil && Math.floor(ts / 100) % 2 === 0
        if (!piscando) {
          const launchOffset = g.shipLaunch ? (ts - g.transitionStart - 1300) * 0.35 : 0
          const shipY = g.ship.y - Math.max(0, launchOffset)
          if (ts < g.shieldUntil) {
            ctx.beginPath()
            ctx.arc(g.ship.x, shipY, SHIP_R + 8, 0, Math.PI * 2)
            ctx.strokeStyle = '#4fce7a'
            ctx.lineWidth = 2
            ctx.shadowColor = '#4fce7a'
            ctx.shadowBlur = 10
            ctx.stroke()
            ctx.shadowBlur = 0
          }
          drawIcon(ctx, SHIP_BODY_PATH, g.ship.x, shipY, 34, '#f5f5f3', true)
          ctx.globalCompositeOperation = 'destination-out'
          drawIcon(ctx, SHIP_NOTCH_PATH, g.ship.x, shipY, 34, '#000', false)
          ctx.globalCompositeOperation = 'source-over'
        }
      }

      if (g.bombWave) {
        ctx.beginPath()
        ctx.arc(g.ship.x, g.ship.y, g.bombWave.radius, 0, Math.PI * 2)
        ctx.strokeStyle = '#e0d15a'
        ctx.lineWidth = 4
        ctx.globalAlpha = Math.max(1 - g.bombWave.radius / 700, 0)
        ctx.shadowColor = '#e0d15a'
        ctx.shadowBlur = 16
        ctx.stroke()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }

      if (g.transitioning && g.transitionPhase === 'levelText') {
        ctx.fillStyle = 'rgba(5,5,8,0.3)'
        ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#7a7a77'
        ctx.font = '10px "Press Start 2P", monospace'
        ctx.fillText('ENTRANDO EM', W / 2, H / 2 - 14)
        ctx.fillStyle = '#f5f5f3'
        ctx.font = '20px "Press Start 2P", monospace'
        ctx.shadowColor = '#f5f5f3'
        ctx.shadowBlur = 14
        ctx.fillText('NÍVEL ' + g.level, W / 2, H / 2 + 14)
        ctx.shadowBlur = 0
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [status])

  // ---------- Controles de toque ----------
  function handlePointer(e) {
    if (status !== 'playing' || !gameRef.current) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const p = e.touches ? e.touches[0] : e
    const scaleX = W / rect.width
    const scaleY = H / rect.height
    gameRef.current.targetX = (p.clientX - rect.left) * scaleX
    gameRef.current.targetY = (p.clientY - rect.top) * scaleY
  }

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="max-w-md lg:max-w-2xl mx-auto px-4 pt-4 pb-28 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">SpaceExplorer</span>
        {status === 'playing' || status === 'paused' ? (
          <button onClick={togglePausa} className="text-text-secondary">
            {status === 'paused' ? <IconPlayerPlay size={18} /> : <IconPlayerPause size={18} />}
          </button>
        ) : (
          <div className="w-5" />
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden mx-auto" style={{ width: '100%', maxWidth: W, aspectRatio: `${W}/${H}`, background: '#050508' }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          onMouseDown={handlePointer}
          onMouseMove={(e) => e.buttons === 1 && handlePointer(e)}
          onTouchStart={handlePointer}
          onTouchMove={handlePointer}
        />

        {status === 'playing' && (
          <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#7a7a77', margin: 0 }}>SCORE</p>
                <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: '#f0f0ee', margin: '4px 0 0' }}>{String(hud.score).padStart(6, '0')}</p>
              </div>
              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: '#f5f5f3', background: '#141414', padding: '5px 8px', borderRadius: 6 }}>
                NÍVEL {hud.level}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#7a7a77', margin: 0 }}>RECORDE</p>
                <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: '#f0f0ee', margin: '4px 0 0' }}>{String(highScore).padStart(6, '0')}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <style>{'@keyframes heartBlink { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.15; transform: scale(1.3); } }'}</style>
              {[0, 1, 2].map((i) => (
                <svg
                  key={i === hud.justLostIndex ? `blink-${hud.blinkToken}` : i}
                  viewBox="0 0 24 24"
                  style={{
                    width: 15,
                    height: 15,
                    color: i < hud.lives ? '#ff4655' : '#2e2e33',
                    animation: i === hud.justLostIndex ? 'heartBlink 0.16s ease-in-out 4' : 'none',
                  }}
                >
                  <path fill="currentColor" d={HEART_PATH.d} />
                </svg>
              ))}
            </div>
          </div>
        )}

        {status === 'playing' && hud.bombs > 0 && (
          <button
            onClick={ativarBomba}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex flex-col items-center justify-center"
            style={{ background: '#171512', border: '1.5px solid #e0d15a', boxShadow: '0 0 10px 1px rgba(224,209,90,0.5)' }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, color: '#e0d15a' }}>
              <path fill="currentColor" d="M13 2L3 14h7l-1 8 10-12h-7z" />
            </svg>
            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#e0d15a', marginTop: 1 }}>{hud.bombs}</span>
          </button>
        )}

        {status === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: 'rgba(5,5,8,0.9)' }}>
            <svg viewBox="0 0 48 48" style={{ width: 44, height: 44, color: '#f5f5f3', marginBottom: 16 }}>
              <path fill="currentColor" d={SHIP_PATH.body} />
            </svg>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 13, color: '#f5f5f3', marginBottom: 10 }}>SPACE EXPLORER</p>
            <p className="text-xs text-text-secondary mb-1">Arraste o dedo pra mover a nave</p>
            <p className="text-xs text-text-secondary mb-6">Tiro automático. Desvie e destrua!</p>
            {highScore > 0 && (
              <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: '#7a7a77', marginBottom: 20 }}>
                RECORDE: {String(highScore).padStart(6, '0')}
              </p>
            )}
            <button onClick={iniciarJogo} className="rounded-full px-6 py-3 text-sm font-medium" style={{ background: '#f5f5f3', color: '#0a0a0a' }}>
              Jogar
            </button>
          </div>
        )}

        {status === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(5,5,8,0.85)' }}>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: '#f5f5f3', marginBottom: 20 }}>PAUSADO</p>
            <button onClick={togglePausa} className="rounded-full px-6 py-3 text-sm font-medium" style={{ background: '#f5f5f3', color: '#0a0a0a' }}>
              Continuar
            </button>
          </div>
        )}

        {status === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" style={{ background: 'rgba(5,5,8,0.92)' }}>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 15, color: '#e2716f', marginBottom: 18 }}>GAME OVER</p>
            <p className="text-xs text-text-secondary mb-1.5">Pontuação final</p>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 20, color: '#f5f5f3', marginBottom: 14 }}>
              {String(finalScore).padStart(6, '0')}
            </p>
            {isNewRecord ? (
              <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: '#7fd88f', marginBottom: 24 }}>NOVO RECORDE!</p>
            ) : (
              <p className="text-[11px] text-text-muted mb-6">Recorde: {String(highScore).padStart(6, '0')}</p>
            )}
            <button onClick={iniciarJogo} className="rounded-full px-6 py-3 text-sm font-medium mb-3" style={{ background: '#f5f5f3', color: '#0a0a0a' }}>
              Jogar de novo
            </button>
            <button onClick={() => navigate(-1)} className="text-xs text-text-secondary">
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
