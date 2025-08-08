import confetti from 'canvas-confetti'

export function fireworks() {
  const duration = 10 * 1000
  const animationEnd = Date.now() + duration
  const cuteColors = ['#FFB6C1', '#FFC0CB', '#FFE4E1', '#F0E68C', '#E6E6FA', '#DDA0DD']
  
  const defaults = { 
    startVelocity: 25, 
    spread: 50, 
    ticks: 80, 
    zIndex: 0,
    colors: cuteColors,
    scalar: 0.8
  }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0)
      return clearInterval(interval)

    const particleCount = 30 * (timeLeft / duration)
    // Cute heart-like bursts
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: randomInRange(0.2, 0.4), y: Math.random() * 0.3 + 0.3 },
      angle: randomInRange(60, 120)
    }))
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      origin: { x: randomInRange(0.6, 0.8), y: Math.random() * 0.3 + 0.3 },
      angle: randomInRange(60, 120)
    }))
  }, 300)
}

export function schoolPride() {
  const end = Date.now() + (12 * 1000)

  // Cute pastel colors
  const cuteColors = [
    '#FFB6C1', // Light pink
    '#98FB98', // Pale green
    '#87CEEB', // Sky blue
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki
    '#FFA07A', // Light salmon
    '#E6E6FA', // Lavender
  ];

  (function frame() {
    // Gentle floating confetti from sides
    confetti({
      particleCount: 3,
      angle: 70,
      spread: 45,
      origin: { x: 0.1, y: 0.8 },
      colors: cuteColors,
      startVelocity: 20,
      scalar: 0.9,
      ticks: 100,
      gravity: 0.8
    })
    confetti({
      particleCount: 3,
      angle: 110,
      spread: 45,
      origin: { x: 0.9, y: 0.8 },
      colors: cuteColors,
      startVelocity: 20,
      scalar: 0.9,
      ticks: 100,
      gravity: 0.8
    })

    // Add some hearts from the center
    if (Math.random() < 0.3) {
      confetti({
        particleCount: 1,
        angle: 90,
        spread: 30,
        origin: { x: 0.5, y: 0.9 },
              colors: ['#FF69B4', '#FFB6C1'],
      startVelocity: 15,
      scalar: 1.2,
      ticks: 120
      })
    }

    if (Date.now() < end)
      requestAnimationFrame(frame)
  }())
}

export function basicCannon() {
  const cuteColors = ['#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFA07A']
  
  // Main cute burst
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.65 },
    colors: cuteColors,
    startVelocity: 25,
    scalar: 0.8,
    ticks: 80,
    gravity: 1
  })

  // Secondary gentle burst
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFE4E1', '#E6E6FA', '#F0F8FF'],
      startVelocity: 15,
      scalar: 0.6,
      ticks: 90,
      gravity: 0.8
    })
  }, 200)

  // Floating hearts
  setTimeout(() => {
    confetti({
      particleCount: 8,
      spread: 40,
      origin: { y: 0.75 },
      colors: ['#FF69B4', '#FFB6C1', '#FFC0CB'],
      startVelocity: 10,
      scalar: 1,
      ticks: 100,
      gravity: 0.6
    })
  }, 400)
}
