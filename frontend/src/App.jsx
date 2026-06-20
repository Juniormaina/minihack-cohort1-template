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

// Markdown renderer helper
const renderMarkdown = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <br key={i} />;
    if (line.startsWith('# ')) {
      return <h1 key={i}>{line.slice(2)}</h1>;
    } else if (line.startsWith('## ')) {
      return <h2 key={i}>{line.slice(3)}</h2>;
    } else if (line.startsWith('* **') && line.includes(':**')) {
      const parts = line.replace('* **', '').split(':**');
      return <p key={i}><strong>{parts[0]}:</strong> {parts[1]}</p>;
    } else if (line.startsWith('* ')) {
      return <li key={i}>{line.slice(2)}</li>;
    } else if (line.startsWith('---')) {
      return <hr key={i} />;
    } else {
      return <p key={i}>{line}</p>;
    }
  });
};

function App() {
  // App Switcher state
  const [activeApp, setActiveApp] = useState('khc'); // Default to KHC Discovery Engine

  // Original Avalanche Payments state
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

  // KHC-DE specific state
  const [khcSubTab, setKhcSubTab] = useState('dashboard');
  const [khcSearchQuery, setKhcSearchQuery] = useState('agro processor kenya');
  const [khcConsole, setKhcConsole] = useState(['Engine Ready. Click Search or Reset & Seed to begin.']);
  const [khcDirectory, setKhcDirectory] = useState([]);
  const [khcDuplicates, setKhcDuplicates] = useState([]);
  const [khcValidationQueue, setKhcValidationQueue] = useState([]);
  const [khcOutreach, setKhcOutreach] = useState([]);
  const [selectedMergeKeepIds, setSelectedMergeKeepIds] = useState({}); // dupGroupId -> keepBusinessId
  const [validationChecklists, setValidationChecklists] = useState({});
  const [activeProfile, setActiveProfile] = useState(null);
  const [activeCrmCard, setActiveCrmCard] = useState(null);
  const [crmFormState, setCrmFormState] = useState({
    outreach_status: 'Discovered',
    contact_date: '',
    response: '',
    next_action: ''
  });

  const log = (message, type = 'info') => {
    setLogs((current) => [{ message, type }, ...current].slice(0, 8));
  };

  const addConsoleLine = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setKhcConsole(current => [...current, `[${time}] [${type.toUpperCase()}] ${text}`]);
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

  // Load KHC directory and items on mount
  useEffect(() => {
    if (activeApp === 'khc') {
      fetchKhcData();
    }
  }, [activeApp]);

  const fetchKhcData = async () => {
    try {
      const dirRes = await fetch(`${API_URL}/api/khc/directory`);
      const dirData = await dirRes.json();
      setKhcDirectory(dirData);

      const dupRes = await fetch(`${API_URL}/api/khc/duplicates`);
      const dupData = await dupRes.json();
      setKhcDuplicates(dupData);

      const valRes = await fetch(`${API_URL}/api/khc/validation-queue`);
      const valData = await valRes.json();
      setKhcValidationQueue(valData);

      const crmRes = await fetch(`${API_URL}/api/khc/outreach`);
      const crmData = await crmRes.json();
      setKhcOutreach(crmData);
    } catch (err) {
      console.error('Error fetching KHC data:', err);
    }
  };

  const seedDatabase = async () => {
    addConsoleLine('Triggering KHC database reset & seeding...', 'info');
    try {
      const res = await fetch(`${API_URL}/api/khc/seed`, { method: 'POST' });
      const data = await res.json();
      addConsoleLine(data.message, 'success');
      fetchKhcData();
    } catch (err) {
      addConsoleLine(`Seeding failed: ${err.message}`, 'error');
    }
  };

  const handleDiscoverySearch = async () => {
    if (!khcSearchQuery) return;
    addConsoleLine(`Starting search query: "${khcSearchQuery}"`, 'info');
    addConsoleLine('Contacting Google Maps API & Yellow Pages...', 'info');
    
    setTimeout(async () => {
      addConsoleLine('Raw businesses fetched. Normalizing phones, URLs, and locations...', 'info');
      try {
        const res = await fetch(`${API_URL}/api/khc/discover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: khcSearchQuery })
        });
        const data = await res.json();
        addConsoleLine(data.message, 'success');
        
        data.records?.forEach(rec => {
          addConsoleLine(`Enriched & scored: ${rec.company_name} (Classified: ${rec.scoring.classification})`, 'success');
        });
        fetchKhcData();
      } catch (err) {
        addConsoleLine(`Discovery run failed: ${err.message}`, 'error');
      }
    }, 1500);
  };

  const handleMergeDuplicates = async (dupGroupId) => {
    const keepId = selectedMergeKeepIds[dupGroupId];
    const group = khcDuplicates.find(d => d.id === dupGroupId);
    if (!keepId || !group) return;

    const mergeIds = group.records.map(r => r.business_id).filter(id => id !== keepId);

    try {
      const res = await fetch(`${API_URL}/api/khc/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keep_id: keepId, merge_ids: mergeIds })
      });
      const data = await res.json();
      addConsoleLine(`Merged ${mergeIds.length} duplicates into master: ${data.masterRecord.company_name}`, 'success');
      fetchKhcData();
    } catch (err) {
      addConsoleLine(`Merge failed: ${err.message}`, 'error');
    }
  };

  const handleValidationChecklistChange = (businessId, category, field) => {
    setValidationChecklists(prev => {
      const current = prev[businessId] || {
        existence: { website: false, phone: false, location: false, operations: false },
        quality: { reviews: false, recent: false, legitimacy: false },
        exclusion: { famous: false, vc: false, accelerator: false }
      };
      
      const categoryObj = current[category] || {};
      
      return {
        ...prev,
        [businessId]: {
          ...current,
          [category]: {
            ...categoryObj,
            [field]: !categoryObj[field]
          }
        }
      };
    });
  };

  const getChecklistState = (businessId) => {
    return validationChecklists[businessId] || {
      existence: { website: false, phone: false, location: false, operations: false },
      quality: { reviews: false, recent: false, legitimacy: false },
      exclusion: { famous: false, vc: false, accelerator: false }
    };
  };

  const submitValidation = async (businessId, status) => {
    const checklist = getChecklistState(businessId);
    try {
      const res = await fetch(`${API_URL}/api/khc/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId, status, checklist })
      });
      const data = await res.json();
      addConsoleLine(`Business ${data.record.company_name} marked as ${status}`, 'success');
      fetchKhcData();
    } catch (err) {
      addConsoleLine(`Validation failed: ${err.message}`, 'error');
    }
  };

  const verifyOnChain = async (businessId) => {
    try {
      addConsoleLine(`Submitting on-chain verification for ${businessId}...`, 'info');
      const res = await fetch(`${API_URL}/api/khc/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verify failed');
      }

      addConsoleLine(`Verified on-chain! txHash=${data.txHash}`, 'success');
      fetchKhcData();
    } catch (err) {
      addConsoleLine(`On-chain verification failed: ${err.message}`, 'error');
    }
  };

  const viewCompanyProfile = async (businessId) => {
    try {
      const res = await fetch(`${API_URL}/api/khc/profile/${businessId}`);
      const data = await res.json();
      setActiveProfile(data.markdown);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const openCrmUpdateModal = (card) => {
    setActiveCrmCard(card);
    setCrmFormState({
      outreach_status: card.founder.outreach_status || 'Discovered',
      contact_date: card.founder.contact_date || new Date().toISOString().split('T')[0],
      response: card.founder.response || '',
      next_action: card.founder.next_action || ''
    });
  };

  const submitCrmUpdate = async () => {
    if (!activeCrmCard) return;
    try {
      const res = await fetch(`${API_URL}/api/khc/outreach/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: activeCrmCard.business_id,
          ...crmFormState
        })
      });
      const data = await res.json();
      addConsoleLine(`CRM state updated for ${activeCrmCard.company_name}`, 'success');
      setActiveCrmCard(null);
      fetchKhcData();
    } catch (err) {
      addConsoleLine(`CRM update failed: ${err.message}`, 'error');
    }
  };

  // Original payments logic
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
    <div className={`page ${activeApp === 'khc' ? 'wide' : ''}`}>
      <div className="panel">
        
        {/* Top App Selector Navigation */}
        <div className="app-nav">
          <button 
            className={activeApp === 'khc' ? 'active' : ''} 
            onClick={() => setActiveApp('khc')}
          >
            🇰🇪 KHC Discovery Engine
          </button>
          <button 
            className={activeApp === 'payments' ? 'active' : ''} 
            onClick={() => setActiveApp('payments')}
          >
            🔺 Avalanche Payments
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: KENYA HIDDEN CHAMPIONS DISCOVERY ENGINE       */}
        {/* ---------------------------------------------------- */}
        {activeApp === 'khc' && (
          <div>
            <div className="header" style={{ marginBottom: '1rem' }}>
              <div>
                <h1 style={{ background: 'linear-gradient(90deg, #38bdf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                  Kenya Hidden Champions
                </h1>
                <p>Repeatable Intelligence Discovery & Validation Engine</p>
              </div>
              <button 
                onClick={seedDatabase} 
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#020617', border: '1px solid rgba(148, 163, 184, 0.2)' }}
              >
                Reset & Seed Mock Data
              </button>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="sub-nav">
              <button className={khcSubTab === 'dashboard' ? 'active' : ''} onClick={() => setKhcSubTab('dashboard')}>Overview</button>
              <button className={khcSubTab === 'discovery' ? 'active' : ''} onClick={() => setKhcSubTab('discovery')}>1. Discovery Engine</button>
              <button className={khcSubTab === 'aggregation' ? 'active' : ''} onClick={() => setKhcSubTab('aggregation')}>2. Duplicate Resolver</button>
              <button className={khcSubTab === 'directory' ? 'active' : ''} onClick={() => setKhcSubTab('directory')}>3. Master Directory</button>
              <button className={khcSubTab === 'validation' ? 'active' : ''} onClick={() => setKhcSubTab('validation')}>4. Validation Queue</button>
              <button className={khcSubTab === 'crm' ? 'active' : ''} onClick={() => setKhcSubTab('crm')}>5. Outreach CRM</button>
            </div>

            {/* Sub-tab 1: Overview Panel */}
            {khcSubTab === 'dashboard' && (
              <div>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <h3>Discovered</h3>
                    <div className="kpi-val cyan">{khcDirectory.length}</div>
                    <p>Total raw listings found</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Deduplicated</h3>
                    <div className="kpi-val amber">{khcDuplicates.length}</div>
                    <p>Duplicate clusters identified</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Validated Champions</h3>
                    <div className="kpi-val emerald">
                      {khcDirectory.filter(b => b.status === 'validated' && b.scoring?.total_score >= 80).length}
                    </div>
                    <p>Longevity & Invisibility verified</p>
                  </div>
                  <div className="kpi-card">
                    <h3>Outreach CRM</h3>
                    <div className="kpi-val purple">
                      {khcDirectory.filter(b => b.founder?.outreach_status && b.founder?.outreach_status !== 'Discovered').length}
                    </div>
                    <p>Active relationship cycles</p>
                  </div>
                </div>

                <div className="dual-section">
                  <div className="scraper-panel" style={{ gap: '0.75rem' }}>
                    <h2 style={{ margin: 0 }}>Discover System Mission</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                      The current East African VC/startup ecosystem over-indexes heavily on media-visible, VC-backed tech founders. KHC-DE systematically crawls maps, registers, and newspapers to identify long-operating (5-15+ years), cashflow-positive, invisible SMEs and agro-processors.
                    </p>
                    <div className="checklist-group">
                      <div className="checklist-title">Discovery Target sectors</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        <div>✓ Agro Processors</div>
                        <div>✓ Waste Management</div>
                        <div>✓ Packaging Companies</div>
                        <div>✓ Animal Feed Manufacturers</div>
                        <div>✓ Industrial Suppliers</div>
                        <div>✓ Logistics & Distribution</div>
                      </div>
                    </div>
                  </div>

                  <div className="scraper-panel" style={{ height: 'fit-content' }}>
                    <h2 style={{ margin: 0 }}>Live Scraper Console</h2>
                    <div className="console-output">
                      {khcConsole.map((line, idx) => {
                        let cl = 'info';
                        if (line.includes('[SUCCESS]')) cl = 'success';
                        if (line.includes('[ERROR]')) cl = 'error';
                        return <p key={idx} className={`console-line ${cl}`}>{line}</p>;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Discovery Engine Input Panel */}
            {khcSubTab === 'discovery' && (
              <div className="scraper-panel">
                <h2>Continuous Search Engine</h2>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                  Execute targeted queries matching primary industry keywords to fetch new potential Hidden Champions.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    value={khcSearchQuery}
                    onChange={(e) => setKhcSearchQuery(e.target.value)}
                    placeholder="e.g. animal feed manufacturer kenya"
                    style={{ flex: 1, padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.18)', background: '#020617', color: 'white' }}
                  />
                  <button onClick={handleDiscoverySearch} style={{ background: '#38bdf8', color: 'black' }}>
                    Search & Scrape
                  </button>
                </div>

                <h3 style={{ marginBottom: '0.5rem', marginTop: '1.5rem' }}>Run Logs</h3>
                <div className="console-output" style={{ height: '180px' }}>
                  {khcConsole.map((line, idx) => (
                    <p key={idx} className="console-line">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 3: Data Aggregation & Deduplication */}
            {khcSubTab === 'aggregation' && (
              <div>
                <h2>Deduplication Resolution Center</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Scraping multiple directories generates overlapping entries. Select which profile is complete to keep, and merge the duplicates.
                </p>

                {khcDuplicates.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>All directories consolidated. No duplicate candidates detected.</p>
                ) : (
                  khcDuplicates.map((group) => {
                    const selectedId = selectedMergeKeepIds[group.id];
                    return (
                      <div key={group.id} className="dup-card">
                        <div className="dup-header">
                          <span>Similarity Alert: {group.records[0].company_name}</span>
                          <button 
                            onClick={() => handleMergeDuplicates(group.id)} 
                            disabled={!selectedId}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: '#eab308', color: 'black' }}
                          >
                            Consolidate & Merge Selected
                          </button>
                        </div>
                        <div className="dup-records-grid">
                          {group.records.map((rec) => {
                            const isSelected = selectedId === rec.business_id;
                            return (
                              <div 
                                key={rec.business_id} 
                                className={`dup-record-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedMergeKeepIds(prev => ({ ...prev, [group.id]: rec.business_id }))}
                              >
                                <input
                                  type="radio"
                                  name={`dup-group-${group.id}`}
                                  checked={isSelected}
                                  onChange={() => setSelectedMergeKeepIds(prev => ({ ...prev, [group.id]: rec.business_id }))}
                                />
                                <h4 style={{ margin: '0 0 0.5rem' }}>{rec.company_name}</h4>
                                <p><strong>Source:</strong> {rec.source}</p>
                                <p><strong>Website:</strong> {rec.website || 'None'}</p>
                                <p><strong>Phone:</strong> {rec.phone || 'None'}</p>
                                <p><strong>Sector:</strong> {rec.sector}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Sub-tab 4: Master Directory Datagrid */}
            {khcSubTab === 'directory' && (
              <div>
                <h2>Consolidated Master Business Directory</h2>
                <div className="table-container">
                  <table className="khc-table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Sector</th>
                        <th>Location</th>
                        <th>Operating Years</th>
                        <th>Trust (Stars)</th>
                        <th>Score</th>
                        <th>Classification</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {khcDirectory.map((biz) => {
                        const years = 2026 - (biz.founded_year || 2020);
                        const isChampion = biz.scoring?.total_score >= 80;
                        let badgeClass = 'badge-watchlist';
                        if (biz.scoring?.classification === 'Exceptional') badgeClass = 'badge-exceptional';
                        else if (biz.scoring?.classification === 'Hidden Champion') badgeClass = 'badge-hidden-champion';
                        else if (biz.scoring?.classification === 'Emerging Champion') badgeClass = 'badge-emerging-champion';
                        else if (biz.scoring?.classification === 'Reject') badgeClass = 'badge-reject';

                        return (
                          <tr key={biz.business_id}>
                            <td>
                              <div style={{ fontWeight: '700' }}>{biz.company_name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {biz.business_id}</div>
                            </td>
                            <td>{biz.sector}</td>
                            <td>{biz.city}, {biz.county}</td>
                            <td>{years} yrs</td>
                            <td>{biz.intelligence?.reviews || 0}★</td>
                            <td style={{ fontWeight: '800' }}>{biz.scoring?.total_score || 0}/100</td>
                            <td>
                              <span className={`badge ${badgeClass}`}>{biz.scoring?.classification || 'Watchlist'}</span>
                            </td>
                            <td>
                              <button 
                                onClick={() => viewCompanyProfile(biz.business_id)} 
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 5: Validation Queue */}
            {khcSubTab === 'validation' && (
              <div>
                <h2>Human Validation Checklists</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Perform verification calls, mapping searches, and exclusion checks to officially qualify discovered entries.
                </p>

                {khcValidationQueue.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>Verification queue empty. Run new discovery sweeps to scan more SMEs.</p>
                ) : (
                  <div className="validation-grid">
                    {khcValidationQueue.map((biz) => {
                      const chk = getChecklistState(biz.business_id);
                      return (
                        <div key={biz.business_id} className="validation-card">
                          <div>
                            <h3 style={{ margin: '0 0 0.25rem' }}>{biz.company_name}</h3>
                            <span className="badge badge-raw" style={{ textTransform: 'uppercase' }}>Source: {biz.source}</span>
                          </div>

                          <div className="checklist-group">
                            <div className="checklist-title">1. Existence Verification</div>
                            <label className="checklist-item">
                              <input 
                                type="checkbox" 
                                checked={chk.existence.website} 
                                onChange={() => handleValidationChecklistChange(biz.business_id, 'existence', 'website')}
                              />
                              Active Web / Social Footprint
                            </label>
                            <label className="checklist-item">
                              <input 
                                type="checkbox" 
                                checked={chk.existence.phone} 
                                onChange={() => handleValidationChecklistChange(biz.business_id, 'existence', 'phone')}
                              />
                              Responsive Phone Line
                            </label>
                            <label className="checklist-item">
                              <input 
                                type="checkbox" 
                                checked={chk.existence.location} 
                                onChange={() => handleValidationChecklistChange(biz.business_id, 'existence', 'location')}
                              />
                              Physical Address Confirmed
                            </label>
                          </div>

                          <div className="checklist-group">
                            <div className="checklist-title">2. Operational Quality</div>
                            <label className="checklist-item">
                              <input 
                                type="checkbox" 
                                checked={chk.quality.reviews} 
                                onChange={() => handleValidationChecklistChange(biz.business_id, 'quality', 'reviews')}
                              />
                              Trustworthy Reviews (&gt;4.0)
                            </label>
                            <label className="checklist-item">
                              <input 
                                type="checkbox" 
                                checked={chk.quality.legitimacy} 
                                onChange={() => handleValidationChecklistChange(biz.business_id, 'quality', 'legitimacy')}
                              />
                              Legitimacy Verified (e.g. KEBS/KRA)
                            </label>
                          </div>

                          <div className="checklist-group">
                            <div className="checklist-title">3. Ecosystem Exclusions</div>
                            <label className="checklist-item" style={{ color: chk.exclusion.vc ? '#f87171' : 'inherit' }}>
                              <input 
                                type="checkbox" 
                                checked={chk.exclusion.vc} 
                                onChange={() => handleValidationChecklistChange(biz.business_id, 'exclusion', 'vc')}
                              />
                              VC-Funded Startup (Disqualifies)
                            </label>
                            <label className="checklist-item" style={{ color: chk.exclusion.accelerator ? '#f87171' : 'inherit' }}>
                              <input 
                                type="checkbox" 
                                checked={chk.exclusion.accelerator} 
                                onChange={() => handleValidationChecklistChange(biz.business_id, 'exclusion', 'accelerator')}
                              />
                              Accelerator Alumnus (Disqualifies)
                            </label>
                          </div>

                          <div className="validation-actions">
<button 
                              onClick={() => submitValidation(biz.business_id, 'rejected')}
                              className="reject"
                            >
                              Reject & Discard
                            </button>
                            <button 
                              onClick={() => submitValidation(biz.business_id, 'validated')}
                              className="approve"
                              disabled={chk.exclusion.vc || chk.exclusion.accelerator}
                            >
                              Approve Champion
                            </button>
                            <button 
                              onClick={() => verifyOnChain(biz.business_id)}
                              className="verify"
                              disabled={biz.status !== 'validated' || (biz.scoring?.total_score || 0) < 80}
                              style={{ background: '#22c55e', color: 'black', fontWeight: 'bold' }}
                            >
                              Verify on Avalanche
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 6: CRM Kanban pipeline */}
            {khcSubTab === 'crm' && (
              <div>
                <h2>Founder Outreach CRM pipeline</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Manage relationship building with validated Hidden Champions. Move candidates through stages from discovery to invitation.
                </p>

                <div className="crm-container">
                  {['Validated', 'Contacted', 'Interviewed', 'Invited to Kuzana'].map(stage => {
                    const cards = khcOutreach.filter(c => c.founder?.outreach_status === stage);
                    return (
                      <div key={stage} className="crm-lane">
                        <div className="crm-lane-header">
                          <h3>{stage}</h3>
                          <span className="crm-lane-count">{cards.length}</span>
                        </div>
                        {cards.map(card => (
                          <div key={card.business_id} className="crm-card" onClick={() => openCrmUpdateModal(card)}>
                            <h4>{card.company_name}</h4>
                            <p><strong>Founder:</strong> {card.founder?.founder_name || 'TBD'}</p>
                            <p><strong>Sector:</strong> {card.sector}</p>
                            {card.founder?.next_action && (
                              <p style={{ color: '#fbbf24', marginTop: '0.25rem' }}>🎯 {card.founder.next_action}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: ORIGINAL AVALANCHE PAYMENTS STARTER            */}
        {/* ---------------------------------------------------- */}
        {activeApp === 'payments' && (
          <div>
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
        )}

      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: Dynamic 1-Page Intelligence Profile Viewer  */}
      {/* ---------------------------------------------------- */}
      {activeProfile && (
        <div className="modal-overlay" onClick={() => setActiveProfile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>1-Page Intelligence Champion Profile</h2>
              <button className="modal-close" onClick={() => setActiveProfile(null)}>&times;</button>
            </div>
            <div className="modal-body markdown-doc">
              {renderMarkdown(activeProfile)}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: CRM Card Pipeline Stage and Details Editor  */}
      {/* ---------------------------------------------------- */}
      {activeCrmCard && (
        <div className="modal-overlay" onClick={() => setActiveCrmCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Founder Outreach: {activeCrmCard.company_name}</h2>
              <button className="modal-close" onClick={() => setActiveCrmCard(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Sector:</strong> {activeCrmCard.sector}</p>
              <p><strong>Founder:</strong> {activeCrmCard.founder?.founder_name || 'TBD'}</p>
              
              <div className="crm-update-form">
                <label style={{ display: 'grid', gap: '0.5rem' }}>
                  Outreach Stage
                  <select 
                    value={crmFormState.outreach_status}
                    onChange={(e) => setCrmFormState(prev => ({ ...prev, outreach_status: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)', background: '#020617', color: 'white' }}
                  >
                    <option value="Validated">Validated</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interviewed">Interviewed</option>
                    <option value="Invited to Kuzana">Invited to Kuzana</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: '0.5rem' }}>
                  Contact Date
                  <input
                    type="date"
                    value={crmFormState.contact_date}
                    onChange={(e) => setCrmFormState(prev => ({ ...prev, contact_date: e.target.value }))}
                    style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)', background: '#020617', color: 'white' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '0.5rem' }}>
                  Founder Response / Feedbacks
                  <textarea
                    value={crmFormState.response}
                    onChange={(e) => setCrmFormState(prev => ({ ...prev, response: e.target.value }))}
                    placeholder="e.g. Expressed interest in the Kuzana network..."
                    style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)', background: '#020617', color: 'white', minHeight: '80px', fontFamily: 'inherit' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '0.5rem' }}>
                  Next CRM Action Plan
                  <input
                    type="text"
                    value={crmFormState.next_action}
                    onChange={(e) => setCrmFormState(prev => ({ ...prev, next_action: e.target.value }))}
                    placeholder="e.g. Follow up via call on Monday"
                    style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)', background: '#020617', color: 'white' }}
                  />
                </label>

                <button onClick={submitCrmUpdate} style={{ background: '#a78bfa', color: 'black', marginTop: '1rem', fontWeight: 'bold' }}>
                  Save CRM State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
