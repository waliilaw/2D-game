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

// Add custom room names
const roomNames = {
  1: "Mines",
  2: "Egg",
  3: "Roulette"
}

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
      gamblingBox.position.x = 200
      gamblingBox.position.y = 350
      break
    case 2:
      gamblingBox.position.x = 500
      gamblingBox.position.y = 250
      break
    case 3:
      gamblingBox.position.x = 600
      gamblingBox.position.y = 300
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
  
  // Add more detailed pixelated effect
  for(let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const outerRadius = gamblingBox.radius + 5
    const x = gamblingBox.position.x + Math.cos(angle) * outerRadius
    const y = gamblingBox.position.y + Math.sin(angle) * outerRadius
    
    // Draw pixelated dots around the circle
    c.fillStyle = 'rgba(0, 0, 0, 0.7)'
    c.fillRect(x - 3, y - 3, 6, 6)
  }
  
  // Add inner pixelated details
  for(let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const innerRadius = gamblingBox.radius * 0.6
    const x = gamblingBox.position.x + Math.cos(angle) * innerRadius
    const y = gamblingBox.position.y + Math.sin(angle) * innerRadius
    
    c.fillStyle = 'rgba(50, 50, 50, 0.8)'
    c.fillRect(x - 2, y - 2, 4, 4)
  }

  player.handleInput(keys)
  player.draw()
  player.update()

  // Draw room name above player (improved positioning)
  c.fillStyle = 'white'
  c.font = '16px "Press Start 2P"'
  const roomNameText = roomNames[level] || `Room ${level}`
  const textWidth = c.measureText(roomNameText).width
  c.fillText(roomNameText, player.position.x - textWidth / 2, player.position.y - 40)

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
    // Create semi-transparent overlay
    c.fillStyle = 'rgba(0, 0, 0, 0.7)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw popup background
    c.fillStyle = '#45283c' // Dark purple background
    c.fillRect(canvas.width/2 - 200, canvas.height/2 - 150, 400, 300)
    
    // Draw pixelated border
    c.fillStyle = '#eec39a' // Light tan color for border
    
    // Draw top and bottom borders with pixels
    for(let x = 0; x < 400; x += 8) {
      // Top border pixels
      c.fillRect(canvas.width/2 - 200 + x, canvas.height/2 - 150, 6, 6)
      // Bottom border pixels
      c.fillRect(canvas.width/2 - 200 + x, canvas.height/2 + 150 - 6, 6, 6)
    }
    
    // Draw left and right borders with pixels
    for(let y = 0; y < 300; y += 8) {
      // Left border pixels
      c.fillRect(canvas.width/2 - 200, canvas.height/2 - 150 + y, 6, 6)
      // Right border pixels
      c.fillRect(canvas.width/2 + 200 - 6, canvas.height/2 - 150 + y, 6, 6)
    }
    
    // Draw title based on current room
    c.fillStyle = '#ffffff'
    c.font = '20px "Press Start 2P"'
    let popupTitle = `Enter ${roomNames[level]}`
    let textMetrics = c.measureText(popupTitle)
    c.fillText(popupTitle, canvas.width/2 - textMetrics.width/2, canvas.height/2 - 80)
    
    // Draw pixelated line separator
    c.fillStyle = '#eec39a'
    for(let x = 0; x < 350; x += 8) {
      c.fillRect(canvas.width/2 - 175 + x, canvas.height/2 - 50, 6, 2)
    }
    
    // Draw popup message
    c.fillStyle = '#ffffff'
    c.font = '16px "Press Start 2P"'
    let descText
    switch(level) {
      case 1:
        descText = "Connect wallet to enter Mines game"
        break
      case 2:
        descText = "Connect wallet to play Egg game"
        break
      case 3:
        descText = "Connect wallet to play Roulette"
        break
    }
    
    textMetrics = c.measureText(descText)
    c.fillText(descText, canvas.width/2 - textMetrics.width/2, canvas.height/2)
    
    // Draw call to action
    c.fillStyle = '#eec39a' // Highlight color
    c.font = '14px "Press Start 2P"'
    const ctaText = "Press C to connect"
    textMetrics = c.measureText(ctaText)
    c.fillText(ctaText, canvas.width/2 - textMetrics.width/2, canvas.height/2 + 60)
    
    // Draw pixelated button
    const buttonWidth = 180
    const buttonHeight = 40
    c.fillStyle = '#854c30' // Button background
    c.fillRect(canvas.width/2 - buttonWidth/2, canvas.height/2 + 90, buttonWidth, buttonHeight)
    
    // Button border pixels
    c.fillStyle = '#d95763' // Bright accent for button
    for(let x = 0; x < buttonWidth; x += 6) {
      c.fillRect(canvas.width/2 - buttonWidth/2 + x, canvas.height/2 + 90, 4, 4)
      c.fillRect(canvas.width/2 - buttonWidth/2 + x, canvas.height/2 + 90 + buttonHeight - 4, 4, 4)
    }
    for(let y = 0; y < buttonHeight; y += 6) {
      c.fillRect(canvas.width/2 - buttonWidth/2, canvas.height/2 + 90 + y, 4, 4)
      c.fillRect(canvas.width/2 - buttonWidth/2 + buttonWidth - 4, canvas.height/2 + 90 + y, 4, 4)
    }
    
    // Draw button text
    c.fillStyle = '#ffffff'
    c.font = '14px "Press Start 2P"'
    const buttonText = "CONNECT"
    textMetrics = c.measureText(buttonText)
    c.fillText(buttonText, canvas.width/2 - textMetrics.width/2, canvas.height/2 + 90 + buttonHeight/2 + 5)
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
    // Update redirection URL based on room
    let redirectUrl = "https://your-gambling-app-url.com"
    switch(level) {
      case 1:
        redirectUrl = "https://your-mines-game-url.com"
        break
      case 2:
        redirectUrl = "https://your-egg-game-url.com"
        break
      case 3:
        redirectUrl = "https://your-roulette-game-url.com"
        break
    }
    
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
      window.location.href = redirectUrl
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
