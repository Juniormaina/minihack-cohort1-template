const fs = require('fs');
const path = require('path');

// Ensure data directories exist as per the requested structure
const BASE_DIR = path.join(__dirname, '..', 'kenya-hidden-champions');
const DATA_DIR = path.join(BASE_DIR, 'data');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');
const VALIDATED_DIR = path.join(DATA_DIR, 'validated');
const PROFILES_DIR = path.join(DATA_DIR, 'profiles');

const directories = [BASE_DIR, DATA_DIR, RAW_DIR, PROCESSED_DIR, VALIDATED_DIR, PROFILES_DIR];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const DB_PATH = path.join(DATA_DIR, 'db.json');

// Default initial state
const initialState = {
  businesses: [],     // Array of businesses: business_id, company_name, sector, founded_year, city, county, website, phone, source, status ('raw', 'processed', 'validated', 'rejected')
  intelligence: {},   // Map of business_id -> { reviews, branches, employees, exports, growth_signal, visibility_score }
  scoring: {},        // Map of business_id -> { longevity, trust, operations, growth, invisibility, total_score, classification }
  founder: {},        // Map of business_id -> { founder_name, email, phone, outreach_status, contact_date, response, next_action }
  duplicates: [],     // Array of duplicate candidate sets
};

function loadData() {
  if (!fs.existsSync(DB_PATH)) {
    saveData(initialState);
    return initialState;
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading KHC-DE database:', error);
    return initialState;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving KHC-DE database:', error);
  }
}

module.exports = {
  loadData,
  saveData,
  DB_PATH,
  RAW_DIR,
  PROCESSED_DIR,
  VALIDATED_DIR,
  PROFILES_DIR
};
