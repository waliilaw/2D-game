const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 64 * 16 // 1024
canvas.height = 64 * 9 // 576

let parsedCollisions
let collisionBlocks
let background
let doors
const player = new Player({
  imageSrc: './img/king/idle.png',
  frameRate: 11,
  animations: {
    idleRight: {
      frameRate: 11,
      frameBuffer: 2,
      loop: true,
      imageSrc: './img/king/idle.png',
    },
    idleLeft: {
      frameRate: 11,
      frameBuffer: 2,
      loop: true,
      imageSrc: './img/king/idleLeft.png',
    },
    runRight: {
      frameRate: 8,
      frameBuffer: 4,
      loop: true,
      imageSrc: './img/king/runRight.png',
    },
    runLeft: {
      frameRate: 8,
      frameBuffer: 4,
      loop: true,
      imageSrc: './img/king/runLeft.png',
    },
    enterDoor: {
      frameRate: 8,
      frameBuffer: 4,
      loop: false,
      imageSrc: './img/king/enterDoor.png',
      onComplete: () => {
        console.log('completed animation')
        gsap.to(overlay, {
          opacity: 1,
          onComplete: () => {
            level++

            if (level === 4) level = 1
            levels[level].init()
            player.switchSprite('idleRight')
            player.preventInput = false
            gsap.to(overlay, {
              opacity: 0,
            })
          },
        })
      },
    },
  },
})

let level = 3
let levels = {
  1: {
    init: () => {
      parsedCollisions = collisionsLevel1.parse2D()
      collisionBlocks = parsedCollisions.createObjectsFrom2D()
      player.collisionBlocks = collisionBlocks
      if (player.currentAnimation) player.currentAnimation.isActive = false

      background = new Sprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: './img/backgroundLevel1.png',
      })

      doors = [
        new Sprite({
          position: {
            x: 767,
            y: 270,
          },
          imageSrc: './img/doorOpen.png',
          frameRate: 5,
          frameBuffer: 5,
          loop: false,
          autoplay: false,
        }),
      ]
    },
  },
  2: {
    init: () => {
      parsedCollisions = collisionsLevel2.parse2D()
      collisionBlocks = parsedCollisions.createObjectsFrom2D()
      player.collisionBlocks = collisionBlocks
      player.position.x = 96
      player.position.y = 140

      if (player.currentAnimation) player.currentAnimation.isActive = false

      background = new Sprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: './img/backgroundLevel2.png',
      })

      doors = [
        new Sprite({
          position: {
            x: 772.0,
            y: 336,
          },
          imageSrc: './img/doorOpen.png',
          frameRate: 5,
          frameBuffer: 5,
          loop: false,
          autoplay: false,
        }),
      ]
    },
  },
  3: {
    init: () => {
      parsedCollisions = collisionsLevel3.parse2D()
      collisionBlocks = parsedCollisions.createObjectsFrom2D()
      player.collisionBlocks = collisionBlocks
      player.position.x = 750
      player.position.y = 230
      if (player.currentAnimation) player.currentAnimation.isActive = false

      background = new Sprite({
        position: {
          x: 0,
          y: 0,
        },
        imageSrc: './img/backgroundLevel3.png',
      })

      doors = [
        new Sprite({
          position: {
            x: 176.0,
            y: 335,
          },
          imageSrc: './img/doorOpen.png',
          frameRate: 5,
          frameBuffer: 5,
          loop: false,
          autoplay: false,
        }),
      ]
    },
  },
}

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
}

const overlay = {
  opacity: 0,
}

// Add Arweave wallet state
let isWalletConnected = false
let hasPaid = false

// Add gambling box position (will be updated based on room)
const gamblingBox = {
  position: {
    x: 0,
    y: 0,
  },
  radius: 25, // For circular shape
}

// Update gambling box position based on room
function updateGamblingBoxPosition() {
  switch(level) {
    case 1:
      gamblingBox.position.x = 96
      gamblingBox.position.y = 140
      break
    case 2:
      gamblingBox.position.x = 96
      gamblingBox.position.y = 140
      break
    case 3:
      gamblingBox.position.x = 750
      gamblingBox.position.y = 230
      break
  }
}

// Add popup state
let showWalletPopup = false

function animate() {
  window.requestAnimationFrame(animate)

  background.draw()
  doors.forEach((door) => {
    door.draw()
  })

  // Draw circular gambling box with pixelated style
  c.beginPath()
  c.arc(gamblingBox.position.x, gamblingBox.position.y, gamblingBox.radius, 0, Math.PI * 2)
  c.fillStyle = 'black'
  c.fill()
  
  // Add pixelated effect
  c.fillStyle = 'rgba(0, 0, 0, 0.5)'
  for(let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const x = gamblingBox.position.x + Math.cos(angle) * gamblingBox.radius
    const y = gamblingBox.position.y + Math.sin(angle) * gamblingBox.radius
    c.fillRect(x - 5, y - 5, 10, 10)
  }

  player.handleInput(keys)
  player.draw()
  player.update()

  // Draw room number above player
  c.fillStyle = 'white'
  c.font = '20px Arial'
  c.fillText(`Room ${level}`, player.position.x - 20, player.position.y - 20)

  // Check if player is near gambling box
  const distanceToGamblingBox = Math.sqrt(
    Math.pow(player.position.x - gamblingBox.position.x, 2) +
    Math.pow(player.position.y - gamblingBox.position.y, 2)
  )

  if (distanceToGamblingBox < 100) {
    if (!isWalletConnected) {
      showWalletPopup = true
    }
  } else {
    showWalletPopup = false
  }

  // Draw improved wallet connection popup
  if (showWalletPopup) {
    // Draw popup background with pixelated border
    c.fillStyle = 'rgba(0, 0, 0, 0.9)'
    c.fillRect(250, 150, 500, 300)
    
    // Draw pixelated border
    c.fillStyle = 'white'
    for(let i = 0; i < 20; i++) {
      c.fillRect(250 + i * 25, 150, 10, 10) // Top border
      c.fillRect(250 + i * 25, 440, 10, 10) // Bottom border
      c.fillRect(250, 150 + i * 15, 10, 10) // Left border
      c.fillRect(740, 150 + i * 15, 10, 10) // Right border
    }

    // Draw text with pixelated style
    c.fillStyle = 'white'
    c.font = '24px "Press Start 2P", monospace'
    c.fillText('Connect Wonder Wallet', 270, 250)
    c.font = '16px "Press Start 2P", monospace'
    c.fillText('Press C to connect', 270, 300)
    c.fillText('and visit gambling site', 270, 350)
  }

  c.save()
  c.globalAlpha = overlay.opacity
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  c.restore()
}

levels[level].init()
updateGamblingBoxPosition()
animate()

// Wonder wallet connection function
async function connectWonderWallet() {
  try {
    // Check if Wonder wallet is available
    if (typeof window.ethereum === 'undefined') {
      alert('Please install Wonder Wallet extension first!')
      return
    }

    // Request wallet connection
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    
    if (accounts && accounts.length > 0) {
      isWalletConnected = true
      showWalletPopup = false
      window.location.href = 'https://your-gambling-app-url.com'
    } else {
      throw new Error('Failed to get wallet accounts')
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    alert('Failed to connect wallet. Please try again.')
  }
}

// Update event listener
window.addEventListener('keydown', (e) => {
  if (showWalletPopup && e.key.toLowerCase() === 'c') {
    // Connect Wonder wallet
    connectWonderWallet()
  }
})
