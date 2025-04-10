const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 64 * 16 // 1024
canvas.height = 64 * 9 // 576

// Background music setup
window.backgroundMusic = new Audio('./public/Undertale OST_ 003 - Your Best Friend.mp3')
window.backgroundMusic.loop = true
window.backgroundMusic.volume = 0.5 // Set volume to 50%

// Function to start background music (needs user interaction)
function startBackgroundMusic() {
  window.backgroundMusic.play().catch(error => {
    console.log('Audio playback failed:', error)
  })
}

// Try to autoplay music (may be blocked by browser)
window.addEventListener('DOMContentLoaded', () => {
  window.backgroundMusic.play().catch(e => {
    console.log('Autoplay prevented by browser, waiting for user interaction')
  })
})

// Add event listener for starting music on first user interaction
window.addEventListener('click', function() {
  if (window.backgroundMusic.paused) {
    startBackgroundMusic()
  }
}, { once: true })

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
        try {
          // Use this safer transition implementation
          // First increase opacity
          overlay.opacity = 1;
          
          // Then manually handle level change
          setTimeout(() => {
            level++;
            if (level === 4) level = 1;
            levels[level].init();
            player.switchSprite('idleRight');
            player.preventInput = false;
            
            // Update gambling box position when level changes
            updateGamblingBoxPosition();
            
            // Fade out the overlay
            setTimeout(() => {
              overlay.opacity = 0;
            }, 300);
          }, 500);
        } catch (error) {
          console.error('Error during transition:', error);
          // Recovery code if transition fails
          level++;
          if (level === 4) level = 1;
          levels[level].init();
          player.switchSprite('idleRight');
          player.preventInput = false;
          overlay.opacity = 0;
        }
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
    case 2: // Egg room - position near the door but lower and more to the left
      gamblingBox.position.x = 720
      gamblingBox.position.y = 350
      break
    case 3:
      gamblingBox.position.x = 600
      gamblingBox.position.y = 300
      break
  }
}

// Add variables for popup states
let showWalletPopup = false;
let showConfirmationDialog = false;
let showIntroPopup = true; // Show intro popup by default
let walletConnected = false;

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

  // Check if player is near gambling box
  const distanceToGamblingBox = Math.sqrt(
    Math.pow(player.position.x - gamblingBox.position.x, 2) +
    Math.pow(player.position.y - gamblingBox.position.y, 2)
  )

  if (distanceToGamblingBox < 100) {
    if (!isWalletConnected) {
      showWalletPopup = true
      showConfirmationDialog = false
    } else if (!showConfirmationDialog) {
      showConfirmationDialog = true
      showWalletPopup = false
    }
  } else {
    showWalletPopup = false
    showConfirmationDialog = false
  }

  // Draw intro popup
  if (showIntroPopup) {
    // Create semi-transparent overlay
    c.fillStyle = 'rgba(0, 0, 0, 0.7)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw popup background
    c.fillStyle = '#45283c' // Dark purple background
    c.fillRect(canvas.width/2 - 250, canvas.height/2 - 200, 500, 400)
    
    // Draw pixelated border
    c.fillStyle = '#eec39a' // Light tan color for border
    
    // Draw top and bottom borders with pixels
    for(let x = 0; x < 500; x += 8) {
      // Top border pixels
      c.fillRect(canvas.width/2 - 250 + x, canvas.height/2 - 200, 6, 6)
      // Bottom border pixels
      c.fillRect(canvas.width/2 - 250 + x, canvas.height/2 + 200 - 6, 6, 6)
    }
    
    // Draw left and right borders with pixels
    for(let y = 0; y < 400; y += 8) {
      // Left border pixels
      c.fillRect(canvas.width/2 - 250, canvas.height/2 - 200 + y, 6, 6)
      // Right border pixels
      c.fillRect(canvas.width/2 + 250 - 6, canvas.height/2 - 200 + y, 6, 6)
    }
    
    // Draw title
    c.fillStyle = '#ffffff'
    c.font = '24px "Press Start 2P"'
    let popupTitle = 'Welcome'
    let textMetrics = c.measureText(popupTitle)
    c.fillText(popupTitle, canvas.width/2 - textMetrics.width/2, canvas.height/2 - 140)
    
    // Draw pixelated line separator
    c.fillStyle = '#eec39a'
    for(let x = 0; x < 450; x += 8) {
      c.fillRect(canvas.width/2 - 225 + x, canvas.height/2 - 110, 6, 2)
    }
    
    // Draw instructions
    c.fillStyle = '#ffffff'
    c.font = '14px "Press Start 2P"'
    
    const instructions = [
      'Game Controls:',
      '- Move with W, A, S, D keys',
      '- Enter door discover more',
      '',
      'Rooms:',
      '1. Mines ',
      '2. Egg ',
      '3. Roulette',
      ' ',
      ' ',
      ' '
   
    ]
    
    for(let i = 0; i < instructions.length; i++) {
      c.fillText(instructions[i], canvas.width/2 - 200, canvas.height/2 - 70 + (i * 30))
    }
    
    // Draw call to action
    c.fillStyle = '#eec39a' // Highlight color
    c.font = '16px "Press Start 2P"'
    const ctaText = "Press C to close"
    textMetrics = c.measureText(ctaText)
    c.fillText(ctaText, canvas.width/2 - textMetrics.width/2, canvas.height/2 + 160)
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
    
    // Draw title based on current room - with better text handling
    c.fillStyle = '#ffffff'
    c.font = '16px "Press Start 2P"' // Start with smaller font size
    let popupTitle = `Enter ${roomNames[level]}`
    
    let textMetrics = c.measureText(popupTitle)
    // If text is still too long, shorten it
    if (textMetrics.width > 330) {
      popupTitle = `${roomNames[level]}`;
      c.font = '16px "Press Start 2P"'
      textMetrics = c.measureText(popupTitle)
    }
    
    c.fillText(popupTitle, canvas.width/2 - textMetrics.width/2, canvas.height/2 - 80)
    
    // Draw pixelated line separator
    c.fillStyle = '#eec39a'
    for(let x = 0; x < 350; x += 8) {
      c.fillRect(canvas.width/2 - 175 + x, canvas.height/2 - 50, 6, 2)
    }
    
    // Draw popup message with better text handling
    c.fillStyle = '#ffffff'
    c.font = '14px "Press Start 2P"' // Start with smaller font
    let descText
    switch(level) {
      case 1:
        descText = "Connect wallet for Mines"
        break
      case 2:
        descText = "Connect wallet for Egg"
        break
      case 3:
        descText = "Connect wallet for Roulette"
        break
    }
    
    textMetrics = c.measureText(descText)
    if (textMetrics.width > 330) {
      // Further shorten if needed
      descText = descText.substring(0, 20) + "..."
      textMetrics = c.measureText(descText)
    }
    
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

  // Draw confirmation dialog after wallet is connected
  if (showConfirmationDialog) {
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
    
    // Draw title with better text handling
    c.fillStyle = '#ffffff'
    c.font = '16px "Press Start 2P"' // Start with smaller font
    let popupTitle = `Go to ${roomNames[level]}?`
    
    let textMetrics = c.measureText(popupTitle)
    if (textMetrics.width > 330) {
      popupTitle = `Play ${roomNames[level]}?`;
      textMetrics = c.measureText(popupTitle)
    }
    
    c.fillText(popupTitle, canvas.width/2 - textMetrics.width/2, canvas.height/2 - 80)
    
    // Draw pixelated line separator
    c.fillStyle = '#eec39a'
    for(let x = 0; x < 350; x += 8) {
      c.fillRect(canvas.width/2 - 175 + x, canvas.height/2 - 50, 6, 2)
    }
    
    // Draw popup message with better text handling
    c.fillStyle = '#ffffff'
    c.font = '14px "Press Start 2P"' // Start with smaller font
    let descText = `Play ${roomNames[level]} game?`
    
    textMetrics = c.measureText(descText)
    if (textMetrics.width > 330) {
      // Shorten if needed
      descText = `Play ${roomNames[level]}?`
      textMetrics = c.measureText(descText)
    }
    
    c.fillText(descText, canvas.width/2 - textMetrics.width/2, canvas.height/2)
    
    // Draw instructions
    c.fillStyle = '#eec39a' // Highlight color
    c.font = '14px "Press Start 2P"'
    const ctaText = "Press Y to continue"
    textMetrics = c.measureText(ctaText)
    c.fillText(ctaText, canvas.width/2 - textMetrics.width/2, canvas.height/2 + 60)
    
    // Draw Yes button (centered now that No button is removed)
    const buttonWidth = 180
    const buttonHeight = 40
    c.fillStyle = '#854c30' // Button background
    c.fillRect(canvas.width/2 - buttonWidth/2, canvas.height/2 + 90, buttonWidth, buttonHeight)
    
    // Yes button border pixels
    c.fillStyle = '#d95763' // Bright accent for button
    for(let x = 0; x < buttonWidth; x += 6) {
      c.fillRect(canvas.width/2 - buttonWidth/2 + x, canvas.height/2 + 90, 4, 4)
      c.fillRect(canvas.width/2 - buttonWidth/2 + x, canvas.height/2 + 90 + buttonHeight - 4, 4, 4)
    }
    for(let y = 0; y < buttonHeight; y += 6) {
      c.fillRect(canvas.width/2 - buttonWidth/2, canvas.height/2 + 90 + y, 4, 4)
      c.fillRect(canvas.width/2 - buttonWidth/2 + buttonWidth - 4, canvas.height/2 + 90 + y, 4, 4)
    }
    
    // Draw Yes button text
    c.fillStyle = '#ffffff'
    c.font = '14px "Press Start 2P"'
    const yesButtonText = "CONTINUE"
    textMetrics = c.measureText(yesButtonText)
    c.fillText(yesButtonText, canvas.width/2 - textMetrics.width/2, canvas.height/2 + 90 + buttonHeight/2 + 5)
  }

  c.save()
  c.globalAlpha = overlay.opacity
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  c.restore()
  
  // Draw pixelated white border around the entire canvas
  const borderWidth = 6;
  const pixelSize = 12;
  c.fillStyle = 'grey';
  
  // Top border
  for(let x = 0; x < canvas.width; x += pixelSize) {
    c.fillRect(x, 0, pixelSize - 1, borderWidth);
  }
  
  // Bottom border
  for(let x = 0; x < canvas.width; x += pixelSize) {
    c.fillRect(x, canvas.height - borderWidth, pixelSize - 1, borderWidth);
  }
  
  // Left border
  for(let y = 0; y < canvas.height; y += pixelSize) {
    c.fillRect(0, y, borderWidth, pixelSize - 1);
  }
  
  // Right border
  for(let y = 0; y < canvas.height; y += pixelSize) {
    c.fillRect(canvas.width - borderWidth, y, borderWidth, pixelSize - 1);
  }
}

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
      showConfirmationDialog = true
    } else {
      throw new Error('Failed to get wallet accounts')
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    alert('Failed to connect wallet. Please try again.')
  }
}

// Function to navigate to game site
function navigateToGame() {
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
  
  window.location.href = redirectUrl
}

// Update event listener
window.addEventListener('keydown', (e) => {
  // Try to start music if paused (first interaction)
  if (window.backgroundMusic.paused) {
    startBackgroundMusic()
  }
  
  // Close intro popup with C key
  if (showIntroPopup && e.key.toLowerCase() === 'c') {
    showIntroPopup = false
  }
  // Handle wallet connection popup
  else if (showWalletPopup && e.key.toLowerCase() === 'c') {
    // Connect Wonder wallet
    connectWonderWallet()
  } 
  // Handle confirmation popup
  else if (showConfirmationDialog) {
    if (e.key.toLowerCase() === 'y') {
      // User confirmed, navigate to game
      navigateToGame()
    } else if (e.key.toLowerCase() === 'n') {
      // User declined, close dialog
      showConfirmationDialog = false
    }
  }
})

// Initialize the first level
levels[level].init()
updateGamblingBoxPosition()
animate()
