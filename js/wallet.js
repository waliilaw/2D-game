// Wallet state variables - use existing globals if they exist
// Check if the variable already exists in window to avoid redeclaration
if (typeof window.isWalletConnected === 'undefined') {
    window.isWalletConnected = false;
    window.currentWalletAddress = '';
    window.currentWalletBalance = '';
}

// DOM elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletInfoDiv = document.getElementById('walletInfo');
const walletAddressSpan = document.getElementById('walletAddress');
const walletBalanceSpan = document.getElementById('walletBalance');
const disconnectWalletBtn = document.getElementById('disconnectWallet');

// Initialize wallet functionality
function initWallet() {
    // Check if wallet was previously connected
    checkWalletConnection();
    
    // Add event listeners
    connectWalletBtn.addEventListener('click', handleWalletConnect);
    disconnectWalletBtn.addEventListener('click', handleWalletDisconnect);
}

// Connect wallet function
async function handleWalletConnect() {
    try {
        // Check if Wonder wallet is available (using window.wander which is the Arweave wallet)
        if (typeof window.wander === 'undefined' && typeof window.arweaveWallet === 'undefined') {
            alert('Please install Wonder Wallet extension first!');
            return;
        }

        // Get the wallet interface (wander or arweaveWallet)
        const wallet = window.wander || window.arweaveWallet;
        
        // Request wallet connection with proper permissions
        await wallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'DISPATCH']);
        
        // Get wallet address
        const address = await wallet.getActiveAddress();
        
        if (address) {
            // Set wallet state
            window.currentWalletAddress = address;
            await updateWalletBalance();
            
            // Save connection state
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', address);
            
            // Update UI
            updateWalletUI(true);
            window.isWalletConnected = true;
        } else {
            throw new Error('Failed to get wallet address');
        }
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

// Disconnect wallet function
async function handleWalletDisconnect() {
    try {
        // Get the wallet interface
        const wallet = window.wander || window.arweaveWallet;
        
        if (wallet) {
            // Disconnect wallet
            await wallet.disconnect();
        }
        
        // Clear wallet state
        window.isWalletConnected = false;
        window.currentWalletAddress = '';
        window.currentWalletBalance = '';
        
        // Clear local storage
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        
        // Update UI
        updateWalletUI(false);
    } catch (error) {
        console.error('Failed to disconnect wallet:', error);
    }
}

// Update wallet balance
async function updateWalletBalance() {
    try {
        if (!window.currentWalletAddress) return;
        
        // For Arweave, we'd normally fetch balance from Arweave network
        // For now, use mock balance
        const mockBalance = (Math.random() * 10).toFixed(4);
        window.currentWalletBalance = 0;
    } catch (error) {
        console.error('Failed to update wallet balance:', error);
        window.currentWalletBalance = '0.00';
    }
}

// Check if wallet was previously connected
function checkWalletConnection() {
    const wasConnected = localStorage.getItem('walletConnected') === 'true';
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (wasConnected && savedAddress) {
        window.currentWalletAddress = savedAddress;
        window.isWalletConnected = true;
        
        // Update UI and fetch balance
        updateWalletUI(true);
        updateWalletBalance().then(() => {
            updateWalletUI(true);
        });
    }
}

// Update wallet UI
function updateWalletUI(connected) {
    if (connected) {
        connectWalletBtn.style.display = 'none';
        walletInfoDiv.style.display = 'flex';
        walletAddressSpan.textContent = truncateAddress(window.currentWalletAddress);
        walletBalanceSpan.textContent = formatArAmount(window.currentWalletBalance) + ' AR';
    } else {
        connectWalletBtn.style.display = 'block';
        walletInfoDiv.style.display = 'none';
    }
}

// Initialize wallet when DOM is loaded
document.addEventListener('DOMContentLoaded', initWallet);

// Listen for account changes
if (window.wander) {
    window.wander.on('walletSwitch', async (address) => {
        if (address) {
            window.currentWalletAddress = address;
            await updateWalletBalance();
            updateWalletUI(true);
        } else {
            handleWalletDisconnect();
        }
    });
} else if (window.arweaveWallet) {
    window.arweaveWallet.on('disconnect', () => {
        handleWalletDisconnect();
    });
    
    window.arweaveWallet.on('connect', async () => {
        const address = await window.arweaveWallet.getActiveAddress();
        if (address) {
            window.currentWalletAddress = address;
            await updateWalletBalance();
            updateWalletUI(true);
        }
    });
}

// Expose wallet functions globally
window.handleWalletConnect = handleWalletConnect;
window.handleWalletDisconnect = handleWalletDisconnect; 