import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_PAYMENT_BRIDGE_ADDRESS || "";
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_paymentToken", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "payer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reference", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TokenPayment",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "recorder", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "phone", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reference", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "MpesaPaymentRecorded",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "withdrawTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "reference", "type": "string" }
    ],
    "name": "payWithToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const PAYMENT_TOKEN_ADDRESS = import.meta.env.VITE_PAYMENT_TOKEN_ADDRESS || "";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const FUJI_CHAIN_ID = 43113;

const getProvider = () => {
  if (window.avalanche) return window.avalanche;
  if (window.ethereum) return window.ethereum;
  return null;
};

const formatAddress = (address) => {
  if (!address) return '--';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const toAvax = (hex) => {
  const balanceWei = BigInt(hex);
  return Number(balanceWei) / 1e18;
};

function App() {
  const [status, setStatus] = useState('Not connected');
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('--');
  const [balance, setBalance] = useState('--');
  const [logs, setLogs] = useState([]);
  const [provider, setProvider] = useState(null);
  const [bridge, setBridge] = useState(null);
  const [tokenAmount, setTokenAmount] = useState('');
  const [reference, setReference] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [mpesaReference, setMpesaReference] = useState('');
  const [callbacks, setCallbacks] = useState([]);

  const log = (message, type = 'info') => {
    setLogs((current) => [{ message, type }, ...current].slice(0, 8));
  };

  useEffect(() => {
    if (!provider || !isConnected) return;
    if (!CONTRACT_ADDRESS) {
      log('PaymentBridge address not configured in VITE_PAYMENT_BRIDGE_ADDRESS', 'error');
      return;
    }

    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = ethersProvider.getSigner();
    setBridge(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
  }, [provider, isConnected]);

  const connectWallet = async () => {
    const rawProvider = getProvider();
    if (!rawProvider) {
      log('No wallet detected. Install Core Wallet from core.app', 'error');
      return;
    }

    try {
      const accounts = await rawProvider.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      const chainIdHex = await rawProvider.request({ method: 'eth_chainId' });
      const chainId = parseInt(chainIdHex, 16);

      if (chainId !== FUJI_CHAIN_ID) {
        log('Wrong network. Switch to Avalanche Fuji Testnet (Chain ID 43113)', 'error');
        return;
      }

      setAddress(account);
      setNetwork(`Fuji Testnet (${chainId})`);
      setStatus('Connected to Core Wallet');
      setIsConnected(true);
      setProvider(rawProvider);
      log(`Connected: ${formatAddress(account)}`, 'success');
    } catch (err) {
      log(`Connection failed: ${err.message || err}`, 'error');
    }
  };

  const fetchBalance = async () => {
    if (!provider) return;

    try {
      const accounts = await provider.request({ method: 'eth_accounts' });
      const account = accounts[0];
      const balanceHex = await provider.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });

      const amount = toAvax(balanceHex);
      setBalance(`${amount.toFixed(4)} AVAX`);
      log(`Balance fetched: ${amount.toFixed(4)} AVAX`, 'success');
    } catch (err) {
      log(`Failed to get balance: ${err.message || err}`, 'error');
    }
  };

  const handleTokenPayment = async () => {
    if (!bridge) {
      log('PaymentBridge contract not initialized', 'error');
      return;
    }
    if (!tokenAmount || !reference) {
      log('Enter both amount and reference before paying', 'error');
      return;
    }

    try {
      const providerInstance = new ethers.BrowserProvider(provider);
      const signer = await providerInstance.getSigner();
      const tokenContract = new ethers.Contract(PAYMENT_TOKEN_ADDRESS, [
        {
          "constant": false,
          "inputs": [
            { "name": "spender", "type": "address" },
            { "name": "amount", "type": "uint256" }
          ],
          "name": "approve",
          "outputs": [{ "name": "", "type": "bool" }],
          "type": "function"
        }
      ], signer);

      const amountUnits = ethers.parseUnits(tokenAmount, 6);
      log('Requesting token approval...', 'info');
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountUnits);
      await approveTx.wait();

      log('Sending payment transaction...', 'info');
      const paymentTx = await bridge.payWithToken(amountUnits, reference);
      await paymentTx.wait();

      log(`Payment sent: ${tokenAmount} tokens, ref=${reference}`, 'success');
      setTokenAmount('');
      setReference('');
    } catch (err) {
      log(`Payment failed: ${err.message || err}`, 'error');
    }
  };

  const handleMpesaStkPush = async () => {
    if (!mpesaPhone || !mpesaAmount || !mpesaReference) {
      log('Enter phone, amount, and reference for M-Pesa', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mpesaPhone,
          amount: mpesaAmount,
          reference: mpesaReference,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || JSON.stringify(data));
      }

      log('STK Push requested. Check the phone for prompt.', 'success');
      setMpesaPhone('');
      setMpesaAmount('');
      setMpesaReference('');
    } catch (err) {
      log(`STK Push failed: ${err.message || err}`, 'error');
    }
  };

  const fetchMpesaCallbacks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/mpesa/callbacks`);
      const data = await response.json();
      setCallbacks(data.slice(0, 10));
      log('Loaded callback events', 'success');
    } catch (err) {
      log(`Failed to fetch callbacks: ${err.message || err}`, 'error');
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <div className="header">
          <div>
            <h1>Mini Hack Cohort 1</h1>
            <p>Payments on Avalanche — Fuji Testnet</p>
          </div>
          <div className={`status ${isConnected ? 'connected' : ''}`}>
            {status}
          </div>
        </div>

        <div className="controls">
          <button onClick={connectWallet} disabled={isConnected}>
            {isConnected ? 'Connected' : 'Connect Core Wallet'}
          </button>
          <button onClick={fetchBalance} disabled={!isConnected}>
            Get Balance
          </button>
        </div>

        {isConnected && (
          <div className="data-card">
            <div className="data-row">
              <span>Address</span>
              <span>{address}</span>
            </div>
            <div className="data-row">
              <span>Network</span>
              <span>{network}</span>
            </div>
            <div className="data-row">
              <span>Balance</span>
              <span>{balance}</span>
            </div>
          </div>
        )}

        <div className="payment-form">
          <h2>Pay with Token</h2>
          <label>
            Amount (USDC decimals 6)
            <input
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              placeholder="100.00"
            />
          </label>
          <label>
            Payment Reference
            <input
              type="text" 
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="invoice-123"
            />
          </label>
          <button onClick={handleTokenPayment} disabled={!isConnected || !bridge}>
            Submit Token Payment
          </button>
        </div>

        <div className="payment-form">
          <h2>M-Pesa STK Push</h2>
          <label>
            Phone Number
            <input
              type="text"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              placeholder="2547XXXXXXXX"
            />
          </label>
          <label>
            Amount
            <input
              type="number"
              value={mpesaAmount}
              onChange={(e) => setMpesaAmount(e.target.value)}
              placeholder="100"
            />
          </label>
          <label>
            Reference
            <input
              type="text"
              value={mpesaReference}
              onChange={(e) => setMpesaReference(e.target.value)}
              placeholder="mpesa-invoice-123"
            />
          </label>
          <button onClick={handleMpesaStkPush} disabled={!mpesaPhone || !mpesaAmount || !mpesaReference}>
            Request STK Push
          </button>
        </div>

        <div className="payment-form">
          <h2>Recent M-Pesa Callbacks</h2>
          <button onClick={fetchMpesaCallbacks}>Refresh Callbacks</button>
          {callbacks.length === 0 ? (
            <p>No callbacks yet. Use the STK Push flow and view the backend logs.</p>
          ) : (
            callbacks.map((entry, index) => (
              <div key={index} className="callback-card">
                <div className="data-row">
                  <span>Received</span>
                  <span>{entry.receivedAt}</span>
                </div>
                <pre>{JSON.stringify(entry.callbackData, null, 2)}</pre>
              </div>
            ))
          )}
        </div>

        <div className="log">
          {logs.map((entry, index) => (
            <p key={index} className={entry.type === 'error' ? 'error' : entry.type === 'success' ? 'success' : ''}>
              {entry.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
