// Wallet state variables
let isWalletConnected = false;
let currentWalletAddress = '';
let currentWalletBalance = '';

// Expose wallet state globally
window.isWalletConnected = isWalletConnected;
window.currentWalletAddress = currentWalletAddress;
window.currentWalletBalance = currentWalletBalance;

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
    connectWalletBtn.addEventListener('click', connectWallet);
    disconnectWalletBtn.addEventListener('click', disconnectWallet);
}

// Connect wallet function
async function connectWallet() {
    try {
        // Check if Wonder wallet is available
        if (typeof window.ethereum === 'undefined') {
            alert('Please install Wonder Wallet extension first!');
            return;
        }

        // Request wallet connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (accounts && accounts.length > 0) {
            // Set wallet state
            currentWalletAddress = accounts[0];
            await updateWalletBalance();
            
            // Save connection state
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', currentWalletAddress);
            
            // Update UI
            updateWalletUI(true);
            isWalletConnected = true;
            
            // Update global state
            window.isWalletConnected = true;
            window.currentWalletAddress = currentWalletAddress;
            window.currentWalletBalance = currentWalletBalance;
        } else {
            throw new Error('Failed to get wallet accounts');
        }
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

// Disconnect wallet function
async function disconnectWallet() {
    try {
        // Clear wallet state
        isWalletConnected = false;
        currentWalletAddress = '';
        currentWalletBalance = '';
        
        // Update global state
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
        if (!currentWalletAddress) return;
        
        // Mock balance for now - in a real implementation,
        // this would fetch the balance from Arweave
        currentWalletBalance = (Math.random() * 10).toFixed(4);
        window.currentWalletBalance = currentWalletBalance;
    } catch (error) {
        console.error('Failed to update wallet balance:', error);
        currentWalletBalance = '0.00';
        window.currentWalletBalance = '0.00';
    }
}

// Check if wallet was previously connected
function checkWalletConnection() {
    const wasConnected = localStorage.getItem('walletConnected') === 'true';
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (wasConnected && savedAddress) {
        currentWalletAddress = savedAddress;
        isWalletConnected = true;
        
        // Update global state
        window.isWalletConnected = true;
        window.currentWalletAddress = currentWalletAddress;
        
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
        walletAddressSpan.textContent = truncateAddress(currentWalletAddress);
        walletBalanceSpan.textContent = formatArAmount(currentWalletBalance) + ' AR';
    } else {
        connectWalletBtn.style.display = 'block';
        walletInfoDiv.style.display = 'none';
    }
}

// Initialize wallet when DOM is loaded
document.addEventListener('DOMContentLoaded', initWallet);

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) {
            // User disconnected wallet
            disconnectWallet();
        } else {
            // Account changed
            currentWalletAddress = accounts[0];
            window.currentWalletAddress = currentWalletAddress;
            await updateWalletBalance();
            updateWalletUI(true);
        }
    });
}

// Expose wallet functions globally
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet; 