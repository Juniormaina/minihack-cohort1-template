# TODO - Kuzana Hidden Champions (KHC) MVP on Avalanche

## Backend (server)
- [x] Add deterministic profile hashing (sha256 of generated markdown)
- [x] Add POST /api/khc/verify endpoint that:
  - [x] loads business + score
  - [x] generates profile markdown + computes profileHash
  - [x] calls KHCRegistry.verifyChampion(businessId, companyName, sector, score, profileHash)
  - [x] stores txHash + marks business as on-chain verified in db.json

## Frontend (UI)
- [x] Add a “Verify” button in Validation Queue tab
- [x] Wire it to call POST /api/khc/verify
- [x] Show txHash / success feedback in console


## Configuration
- [ ] Add README instructions / .env expectations:
  - [ ] KHC_REGISTRY_ADDRESS
  - [ ] RPC_URL
  - [ ] PRIVATE_KEY

## Testing / Demo
- [ ] Run backend + frontend
- [ ] Execute full flow: Seed → Discover → Approve → Verify
- [ ] Confirm registry updates on Snowtrace (Fuji)

