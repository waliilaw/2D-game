Array.prototype.parse2D = function () {
  const rows = []
  for (let i = 0; i < this.length; i += 16) {
    rows.push(this.slice(i, i + 16))
  }

  return rows
}

Array.prototype.createObjectsFrom2D = function () {
  const objects = []
  this.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 292 || symbol === 250) {
        // push a new collision into collisionblocks array
        objects.push(
          new CollisionBlock({
            position: {
              x: x * 64,
              y: y * 64,
            },
          })
        )
      }
    })
  })

  return objects
}

// Wallet utility functions
function truncateAddress(address, firstChars = 6, lastChars = 4) {
  if (!address) return '';
  if (address.length <= firstChars + lastChars) return address;
  return address.substring(0, firstChars) + '...' + address.substring(address.length - lastChars);
}

function formatArAmount(amount) {
  if (!amount) return '0.00';
  return parseFloat(amount).toFixed(4);
}
