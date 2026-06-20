const express = require('express');
const crypto = require('crypto');
const { loadData, saveData, PROFILES_DIR } = require('../db');
const { simulateSearch } = require('../mock_scraper');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper to calculate string similarity (simple Levenshtein or token-based matching)
function checkNameSimilarity(name1, name2) {
  const n1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const n2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Basic prefix matches
  const tokens1 = name1.toLowerCase().split(/\s+/).filter(t => t.length > 2 && t !== 'ltd' && t !== 'limited' && t !== 'africa');
  const tokens2 = name2.toLowerCase().split(/\s+/).filter(t => t.length > 2 && t !== 'ltd' && t !== 'limited' && t !== 'africa');
  
  let matches = 0;
  for (const t of tokens1) {
    if (tokens2.includes(t)) matches++;
  }
  return matches >= 1 && (tokens1.length > 0 && tokens2.length > 0);
}

// Helper to normalize phone numbers (strip spaces, resolve country code)
function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+254' + cleaned.slice(1);
  }
  if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

// Run the scoring calculation for a business
function calculateScoreAndClassify(business, intel) {
  const years = 2026 - (business.founded_year || 2020);
  
  // 1. Longevity (Max 20)
  let longevityScore = 2;
  if (years >= 15) longevityScore = 20;
  else if (years >= 10) longevityScore = 15;
  else if (years >= 5) longevityScore = 10;
  else if (years >= 2) longevityScore = 5;

  // 2. Customer Trust (Max 20)
  const trustScore = Math.min(Math.round((intel.reviews || 0) * 4), 20);

  // 3. Operational Strength (Max 20)
  const branchPts = Math.min((intel.branches || 1) * 2, 10);
  let empPts = 2;
  const emps = intel.employees || 0;
  if (emps >= 100) empPts = 10;
  else if (emps >= 50) empPts = 8;
  else if (emps >= 20) empPts = 6;
  else if (emps >= 10) empPts = 4;
  const operationalScore = branchPts + empPts;

  // 4. Growth Signals (Max 20)
  const exportPts = intel.exports ? 5 : 0;
  const growthPts = Math.round((intel.growth_signal || 5) * 1.5);
  const growthScore = Math.min(exportPts + growthPts, 20);

  // 5. Invisibility Score (Max 20)
  // Base 20, subtract if VC funded, accelerated or has news mentions
  let invisibilityPoints = 20;
  if (intel.is_vc_funded) invisibilityPoints -= 10;
  if (intel.is_accelerator_alumnus) invisibilityPoints -= 6;
  if (intel.media_mentions) invisibilityPoints -= 4;
  const invisibilityScore = Math.max(invisibilityPoints, 0);

  const totalScore = longevityScore + trustScore + operationalScore + growthScore + invisibilityScore;
  
  // Invisibility score scaled to 0-100: higher = more invisible
  const visibilityScore = Math.round(invisibilityScore * 5);

  let classification = 'Reject';
  if (totalScore >= 90) classification = 'Exceptional';
  else if (totalScore >= 80) classification = 'Hidden Champion';
  else if (totalScore >= 70) classification = 'Emerging Champion';
  else if (totalScore >= 60) classification = 'Watchlist';

  return {
    longevity: longevityScore,
    trust: trustScore,
    operations: operationalScore,
    growth: growthScore,
    invisibility: invisibilityScore,
    total_score: totalScore,
    visibility_score: visibilityScore,
    classification
  };
}

// POST: Trigger discovery scraper
router.post('/discover', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const db = loadData();
  const rawResults = simulateSearch(query);

  const discovered = [];
  rawResults.forEach(item => {
    // Generate standard business ID
    const businessId = 'khc-' + crypto.randomUUID().slice(0, 8);
    
    const newBusiness = {
      business_id: businessId,
      company_name: item.name,
      sector: item.sector,
      founded_year: item.founded_year,
      city: item.city,
      county: item.county,
      website: item.website || '',
      phone: item.phone || '',
      source: item.source,
      status: 'raw',
    };

    const newIntel = {
      business_id: businessId,
      reviews: item.reviews || 0,
      branches: item.branches || 1,
      employees: item.employees || 10,
      exports: !!item.exports,
      growth_signal: item.growth_signal || 5,
      is_vc_funded: !!item.is_vc_funded,
      is_accelerator_alumnus: !!item.is_accelerator_alumnus,
      media_mentions: !!item.media_mentions
    };

    // Calculate score
    const score = calculateScoreAndClassify(newBusiness, newIntel);
    newIntel.visibility_score = score.visibility_score;

    const newFounder = {
      business_id: businessId,
      founder_name: item.founder_name || 'TBD',
      email: item.email || '',
      phone: item.phone || '',
      outreach_status: 'Discovered',
      contact_date: '',
      response: '',
      next_action: ''
    };

    // Save to memory
    db.businesses.push(newBusiness);
    db.intelligence[businessId] = newIntel;
    db.scoring[businessId] = score;
    db.founder[businessId] = newFounder;

    discovered.push({
      ...newBusiness,
      intelligence: newIntel,
      scoring: score,
      founder: newFounder
    });
  });

  // Re-run duplication scanner
  runDuplicationScanner(db);
  
  saveData(db);
  res.json({ message: `Discovered ${discovered.length} businesses.`, records: discovered });
});

// Scan database for duplicates and group them
function runDuplicationScanner(db) {
  const duplicates = [];
  const processedIds = new Set();

  for (let i = 0; i < db.businesses.length; i++) {
    const b1 = db.businesses[i];
    if (processedIds.has(b1.business_id) || b1.status === 'rejected') continue;

    const group = [b1];
    const phone1 = normalizePhone(b1.phone);

    for (let j = i + 1; j < db.businesses.length; j++) {
      const b2 = db.businesses[j];
      if (processedIds.has(b2.business_id) || b2.status === 'rejected') continue;

      const phone2 = normalizePhone(b2.phone);
      const isNameDup = checkNameSimilarity(b1.company_name, b2.company_name);
      const isPhoneDup = phone1 && phone2 && phone1 === phone2;
      const isWebsiteDup = b1.website && b2.website && b1.website.replace('https://','').replace('http://','').replace('www.','') === b2.website.replace('https://','').replace('http://','').replace('www.','');

      if (isNameDup || isPhoneDup || isWebsiteDup) {
        group.push(b2);
      }
    }

    if (group.length > 1) {
      group.forEach(b => processedIds.add(b.business_id));
      duplicates.push({
        id: 'dup-' + crypto.randomUUID().slice(0, 8),
        records: group.map(b => ({
          ...b,
          intelligence: db.intelligence[b.business_id],
          scoring: db.scoring[b.business_id],
          founder: db.founder[b.business_id]
        }))
      });
    }
  }

  db.duplicates = duplicates;
}

// GET: All duplicates
router.get('/duplicates', (req, res) => {
  const db = loadData();
  runDuplicationScanner(db);
  saveData(db);
  res.json(db.duplicates);
});

// POST: Merge duplicates
router.post('/merge', (req, res) => {
  const { keep_id, merge_ids } = req.body;
  if (!keep_id || !merge_ids || !Array.isArray(merge_ids)) {
    return res.status(400).json({ error: 'keep_id and array of merge_ids are required' });
  }

  const db = loadData();
  const keepIndex = db.businesses.findIndex(b => b.business_id === keep_id);
  
  if (keepIndex === -1) {
    return res.status(404).json({ error: 'Keep record not found' });
  }

  const keepRecord = db.businesses[keepIndex];
  
  // Aggregate details from merged records into the kept record if missing
  merge_ids.forEach(mId => {
    const mergeIndex = db.businesses.findIndex(b => b.business_id === mId);
    if (mergeIndex !== -1) {
      const mergeRecord = db.businesses[mergeIndex];
      // Keep website, phone, founder if missing in kept
      if (!keepRecord.website) keepRecord.website = mergeRecord.website;
      if (!keepRecord.phone) keepRecord.phone = mergeRecord.phone;
      
      const kFounder = db.founder[keep_id];
      const mFounder = db.founder[mId];
      if (kFounder && mFounder) {
        if (kFounder.founder_name === 'TBD' && mFounder.founder_name !== 'TBD') {
          kFounder.founder_name = mFounder.founder_name;
        }
        if (!kFounder.email) kFounder.email = mFounder.email;
        if (!kFounder.phone) kFounder.phone = mFounder.phone;
      }
      
      // Delete details of merged records
      db.businesses.splice(mergeIndex, 1);
      delete db.intelligence[mId];
      delete db.scoring[mId];
      delete db.founder[mId];
    }
  });

  // Promote kept record to processed
  keepRecord.status = 'processed';
  
  // Recalculate score
  const intel = db.intelligence[keep_id];
  if (intel) {
    db.scoring[keep_id] = calculateScoreAndClassify(keepRecord, intel);
  }

  // Scan again
  runDuplicationScanner(db);
  saveData(db);

  res.json({ message: 'Merged records successfully', masterRecord: {
    ...keepRecord,
    intelligence: db.intelligence[keep_id],
    scoring: db.scoring[keep_id],
    founder: db.founder[keep_id]
  }});
});

// GET: Master directory
router.get('/directory', (req, res) => {
  const db = loadData();
  const directory = db.businesses.map(b => ({
    ...b,
    intelligence: db.intelligence[b.business_id] || {},
    scoring: db.scoring[b.business_id] || {},
    founder: db.founder[b.business_id] || {}
  }));
  res.json(directory);
});

// GET: Validation queue
router.get('/validation-queue', (req, res) => {
  const db = loadData();
  const queue = db.businesses
    .filter(b => b.status === 'raw' || b.status === 'processed')
    .map(b => ({
      ...b,
      intelligence: db.intelligence[b.business_id] || {},
      scoring: db.scoring[b.business_id] || {},
      founder: db.founder[b.business_id] || {}
    }));
  res.json(queue);
});

// POST: Validate record
router.post('/validate', (req, res) => {
  const { business_id, status, checklist } = req.body; // status: 'validated' or 'rejected'
  if (!business_id || !status) {
    return res.status(400).json({ error: 'business_id and status are required' });
  }

  const db = loadData();
  const idx = db.businesses.findIndex(b => b.business_id === business_id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Business not found' });
  }

  db.businesses[idx].status = status;

  // If validated, update CRM status
  const founder = db.founder[business_id];
  if (founder) {
    founder.outreach_status = status === 'validated' ? 'Validated' : 'Rejected';
  }

  // Save checklist verification state to profiles files as metadata
  if (status === 'validated') {
    const profileContent = generateMarkdownProfile(db.businesses[idx], db.intelligence[business_id], db.scoring[business_id], founder, checklist);
    const profilePath = path.join(PROFILES_DIR, `${business_id}_profile.md`);
    fs.writeFileSync(profilePath, profileContent, 'utf8');
  }

  saveData(db);
  res.json({ message: `Record marked as ${status}`, record: db.businesses[idx] });
});

// POST: Verify record on Avalanche C-Chain and anchor on-chain
router.post('/verify', async (req, res) => {
  const { business_id } = req.body;
  if (!business_id) {
    return res.status(400).json({ error: 'business_id is required' });
  }

  const db = loadData();
  const idx = db.businesses.findIndex(b => b.business_id === business_id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const business = db.businesses[idx];
  const intel = db.intelligence[business_id];
  const scoring = db.scoring[business_id];
  const founder = db.founder[business_id] || null;

  if (!intel || !scoring) {
    return res.status(400).json({ error: 'Missing scoring/intelligence for business' });
  }

  // Hidden Champion threshold (matches frontend expectation)
  if (business.status !== 'validated' && business.status !== 'processed') {
    return res.status(400).json({ error: 'Business must be validated before verifying' });
  }

  if (scoring.total_score < 80) {
    return res.status(400).json({ error: 'Business does not meet Hidden Champion score threshold (>= 80)' });
  }

  const profileMarkdown = generateMarkdownProfile(business, intel, scoring, founder);
  const profileHash = crypto.createHash('sha256').update(profileMarkdown, 'utf8').digest('hex');

  const { ethers } = require('ethers');
  const KHCRegistryABI = [
    {
      inputs: [
        { internalType: 'string', name: 'businessId', type: 'string' },
        { internalType: 'string', name: 'companyName', type: 'string' },
        { internalType: 'string', name: 'sector', type: 'string' },
        { internalType: 'uint256', name: 'score', type: 'uint256' },
        { internalType: 'string', name: 'profileHash', type: 'string' }
      ],
      name: 'verifyChampion',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ];

  const registryAddress = process.env.KHC_REGISTRY_ADDRESS || '';
  const rpcUrl = process.env.RPC_URL || '';
  const privateKey = process.env.PRIVATE_KEY || '';

  if (!registryAddress || !rpcUrl || !privateKey) {
    return res.status(500).json({
      error: 'Missing env vars for on-chain verification: KHC_REGISTRY_ADDRESS, RPC_URL, PRIVATE_KEY'
    });
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(registryAddress, KHCRegistryABI, wallet);

  try {
    const tx = await contract.verifyChampion(
      business_id,
      business.company_name,
      business.sector,
      scoring.total_score,
      profileHash
    );

    const receipt = await tx.wait();

    // Store verification metadata in local db.json (not on-chain)
    db.businesses[idx].onChain = {
      isVerified: true,
      txHash: tx.hash,
      profileHash
    };

    saveData(db);

    return res.json({
      message: 'On-chain verification submitted',
      txHash: tx.hash,
      status: receipt?.status,
      profileHash,
      businessId: business_id
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
});


// Helper to generate the 1-page intelligence report
function generateMarkdownProfile(business, intel, scoring, founder, checklist = {}) {
  // IMPORTANT: keep this deterministic for hashing.
  // Avoid including dynamic timestamps like toLocaleDateString() here.
  return `# Kenya Hidden Champion Profile: ${business.company_name}

## 1. Overview
* **Company Name:** ${business.company_name}
* **Sector:** ${business.sector}
* **Founded:** ${business.founded_year} (Operating for ${2026 - business.founded_year} years)
* **Location:** ${business.city}, ${business.county} County, Kenya
* **Founder:** ${founder ? founder.founder_name : 'N/A'}
* **Discovery Source:** ${business.source}

## 2. Business Model
* **Revenue streams:** High operational margins via direct B2B contracting and retail supply.
* **Target Audience:** Serves local industry buyers, retail packaging distributors, or agricultural cooperatives.
* **Value Proposition:** Reliable local delivery, localized custom solutions, and high-quality outputs avoiding import overheads.

## 3. Competitive Advantage
* **Why customers choose them:** Strong regional footprint, immediate physical availability of spares/goods, and customized production tailored to Kenyan market conditions.

## 4. Growth Signals
* **Branches:** ${intel.branches} branches operational
* **Employees:** ~${intel.employees} skilled staff
* **Export Activity:** ${intel.exports ? 'Active exporter to East African region (EAC)' : 'Primarily serving domestic market'}
* **Growth Score:** ${scoring.growth}/20

## 5. Hidden Champion Indicators
* **Longevity:** ${scoring.longevity}/20 points (Stable operations since ${business.founded_year})
* **Customer Trust Rating:** ${scoring.trust}/20 (Google Maps rating: ${intel.reviews}★)
* **Ecosystem Invisibility Score:** ${scoring.invisibility}/20 (Invisibility Index: ${scoring.visibility_score}%)
* **Total Performance Score:** ${scoring.total_score}/100
* **Classification:** **${scoring.classification}**

## 6. Entrepreneurial Learnings
* **Resilience:** Built stable revenue without relying on tech media exposure or venture funding.
* **Operations:** Focuses heavily on customer cash-flow, organic expansions, and localized production networks.

---
*Profile generated by KHC-DE Discovery Engine (deterministic hash for on-chain verification).* 
`;
}

// GET: Fetch report profile
router.get('/profile/:id', (req, res) => {
  const businessId = req.params.id;
  const db = loadData();
  const business = db.businesses.find(b => b.business_id === businessId);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }

  const profilePath = path.join(PROFILES_DIR, `${businessId}_profile.md`);
  let markdown = '';
  
  if (fs.existsSync(profilePath)) {
    markdown = fs.readFileSync(profilePath, 'utf8');
  } else {
    // Generate on the fly
    markdown = generateMarkdownProfile(
      business,
      db.intelligence[businessId] || {},
      db.scoring[businessId] || {},
      db.founder[businessId] || {}
    );
  }

  res.json({ markdown });
});

// GET: CRM Outreach details
router.get('/outreach', (req, res) => {
  const db = loadData();
  const outreach = db.businesses
    .filter(b => b.status === 'validated')
    .map(b => ({
      business_id: b.business_id,
      company_name: b.company_name,
      sector: b.sector,
      founder: db.founder[b.business_id] || {}
    }));
  res.json(outreach);
});

// POST: Update CRM status
router.post('/outreach/update', (req, res) => {
  const { business_id, outreach_status, contact_date, response, next_action } = req.body;
  if (!business_id || !outreach_status) {
    return res.status(400).json({ error: 'business_id and outreach_status are required' });
  }

  const db = loadData();
  const founder = db.founder[business_id];
  if (!founder) {
    return res.status(404).json({ error: 'Founder details not found' });
  }

  founder.outreach_status = outreach_status;
  if (contact_date) founder.contact_date = contact_date;
  if (response !== undefined) founder.response = response;
  if (next_action !== undefined) founder.next_action = next_action;

  saveData(db);
  res.json({ message: 'CRM status updated', founder });
});

// POST: Reset & Seed database with high-quality mock data
router.post('/seed', (req, res) => {
  const db = loadData();
  // Clear lists
  db.businesses = [];
  db.intelligence = {};
  db.scoring = {};
  db.founder = {};
  db.duplicates = [];

  const { mockCompanies } = require('../mock_scraper');

  mockCompanies.forEach(item => {
    const businessId = 'khc-' + crypto.randomUUID().slice(0, 8);
    
    const newBusiness = {
      business_id: businessId,
      company_name: item.name,
      sector: item.sector,
      founded_year: item.founded_year,
      city: item.city,
      county: item.county,
      website: item.website || '',
      phone: item.phone || '',
      source: item.source,
      status: item.name.includes('Top Image') || item.name.includes('Kipeto') || item.name.includes('Thika Feeds') ? 'raw' : 'processed',
    };

    const newIntel = {
      business_id: businessId,
      reviews: item.reviews || 0,
      branches: item.branches || 1,
      employees: item.employees || 10,
      exports: !!item.exports,
      growth_signal: item.growth_signal || 5,
      is_vc_funded: !!item.is_vc_funded,
      is_accelerator_alumnus: !!item.is_accelerator_alumnus,
      media_mentions: !!item.media_mentions
    };

    const score = calculateScoreAndClassify(newBusiness, newIntel);
    newIntel.visibility_score = score.visibility_score;

    const newFounder = {
      business_id: businessId,
      founder_name: item.founder_name || 'TBD',
      email: item.email || '',
      phone: item.phone || '',
      outreach_status: 'Discovered',
      contact_date: '',
      response: '',
      next_action: ''
    };

    db.businesses.push(newBusiness);
    db.intelligence[businessId] = newIntel;
    db.scoring[businessId] = score;
    db.founder[businessId] = newFounder;
  });

  runDuplicationScanner(db);
  saveData(db);
  res.json({ message: 'Database reset and seeded successfully' });
});

module.exports = router;
