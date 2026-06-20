# Mini Hack Cohort 1 — Payments on Avalanche
> Team1 Kenya | 2026 | Technical Lead: Joseph Njoroge (Scotch)

[![Status](https://img.shields.io/badge/Cohort%201-Active-e84142?style=flat-square)](https://team1-kenya-mini-hack.vercel.app)
[![Network](https://img.shields.io/badge/Network-Avalanche%20Fuji-e84142?style=flat-square)](https://testnet.snowtrace.io)
[![Stack](https://img.shields.io/badge/Stack-Solidity%20%7C%20Hardhat%20%7C%20ethers.js-333?style=flat-square)](#tools)

Fork this repo to your personal GitHub account. Build a hybrid payment product on Avalanche. Deploy to Fuji testnet. Present at Builders Connect.

---


## Builder contribution guide

New to the cohort or unsure how to submit? The full step-by-step guide covering every week, every quest, how to open a PR, how to submit on Tally, grading, and late policy is in:

**[CONTRIBUTING_GUIDE.md](./CONTRIBUTING_GUIDE.md)**

It covers:
- Pre-cohort setup checklist
- Weekly workflow from branch creation to PR submission
- Week-by-week quest tables with point values
- How to submit on Tally
- How to open a GitHub PR correctly
- Grading rubric
- Late submission policy
- Getting help

Read it before you start. Refer back whenever you are unsure.

## What you will build

A payment product that bridges M-Pesa and USDC on Avalanche C-Chain. By Week 4 you will have a deployed smart contract, a working M-Pesa STK Push integration, a frontend connected to Core Wallet, and a live product URL.

The integration sequence is intentional: Core Wallet first, then Solidity and ERC-20 tokens, then on-chain data feeds and oracles, then M-Pesa as the final integration. Each week builds on the last.

---

## Session schedule

| Day | Time | Platform | What happens |
|-----|------|----------|-------------|
| Tuesday | 8:00 PM EAT | Google Meet | New concepts, live coding, hands-on exercises |
| Thursday | 8:00 PM EAT | Google Meet | Second teaching block — select Thursdays include a guest practitioner in the second half |
| Thursday | 6:00 PM EAT | Discord voice | Office hours — bring your blockers before the main session |

Google Meet link is pinned in the Discord `#announcements` channel.

---

## Getting started

### 1. Fork this repository

Click **Use this template** or **Fork** at the top right of this page. Fork to your personal GitHub account, not to an organisation.

### 2. Clone your fork

```bash
git clone git@github.com:YOUR-GITHUB-HANDLE/minihack-cohort1-template.git
cd minihack-cohort1-template
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values. Never commit this file — it is already in `.gitignore`. If you accidentally commit a private key, rotate it immediately.

Your `.env` should include:

```
PRIVATE_KEY=your_wallet_private_key_here
SNOWTRACE_API_KEY=your_snowtrace_api_key_here
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PAYMENT_TOKEN=0xYourTokenAddressOnFuji

DARAJA_CONSUMER_KEY=your_daraja_consumer_key_here
DARAJA_CONSUMER_SECRET=your_daraja_consumer_secret_here
DARAJA_SHORTCODE=174379
DARAJA_PASSKEY=your_lipa_na_mpesa_passkey_here
DARAJA_CALLBACK_URL=https://your-ngrok-url/api/mpesa/callback

PORT=3000
FRONTEND_URL=http://localhost:5173
```

`PAYMENT_TOKEN` should be the token contract address you want the bridge to accept. For a mock USDC-style token, deploy a token contract first and set its address here.

### 5. Verify your setup

```bash
npx hardhat compile
```

No errors means your environment is working. If you see missing module errors, run `npm install` first.

### 6. Deploy the contracts

1. Deploy a mock USDC-style token (optional, but useful for testing):

```bash
npx hardhat run scripts/deploy-mock-token.js --network fuji
```

2. Copy the deployed token address and set it in `.env` as `PAYMENT_TOKEN`.

3. Deploy the payment bridge contract:

```bash
npx hardhat run scripts/deploy.js --network fuji
```

4. After deployment, copy the PaymentBridge contract address and add it to `frontend/.env`:

```bash
VITE_PAYMENT_BRIDGE_ADDRESS=0xYourDeployedBridgeAddress
VITE_PAYMENT_TOKEN_ADDRESS=0xYourTokenAddressOnFuji
VITE_API_URL=http://localhost:3000
```

5. Verify the bridge contract on Snowtrace:

```bash
npx hardhat verify --network fuji <BridgeAddress> <PaymentTokenAddress>
```

### 7. Get Fuji testnet AVAX

Visit [core.app/tools/testnet-faucet](https://core.app/tools/testnet-faucet) and request AVAX to your Core Wallet Fuji address. You need AVAX to deploy contracts and send transactions on Fuji.

### 7. Start the frontend and backend

Install frontend dependencies and start the UI:

```bash
cd frontend
npm install
npm run dev
```

From the repo root, start the backend:

```bash
npm install
node server.js
```

The frontend reads the bridge contract address from Vite env values. Create `frontend/.env` with:

```
VITE_PAYMENT_BRIDGE_ADDRESS=0xYourDeployedBridgeAddress
VITE_PAYMENT_TOKEN_ADDRESS=0xYourTokenAddressOnFuji
VITE_API_URL=http://localhost:3000
```

---

## Accounts to create before Week 1

| Account | Link | Notes |
|---------|------|-------|
| GitHub | github.com | Use your real name — all submissions are public |
| Avalanche Builders Hub | core.app/builders-hub | Quest 1 — create this first, it is a primary KPI |
| Core Wallet on Fuji | core.app | Required wallet for this cohort |
| MetaMask on Fuji | metamask.io | Also required for Week 1 |
| Alchemy or Infura | alchemy.com | Free tier — for RPC access |
| Safaricom Daraja sandbox | developer.safaricom.co.ke | For Week 3 M-Pesa integration |

Fuji testnet RPC details for manual wallet configuration:

```
Network name:   Avalanche Fuji Testnet
RPC URL:        https://api.avax-test.network/ext/bc/C/rpc
Chain ID:       43113
Currency:       AVAX
Explorer:       https://testnet.snowtrace.io
```

---

## Tools to install

```bash
# Node.js 20 LTS — nodejs.org
node --version   # must show v20.x.x

# Git — git-scm.com
git --version

# Hardhat (installed via npm install from this template)
npx hardhat --version

# Postman — postman.com (for testing Daraja API in Week 3)
```

Also install: VS Code, Core Wallet browser extension, Ngrok (for Week 3 webhook tunnelling)

---

## Weekly workflow

At the start of each week, create a new branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b week-{N}-{your-github-handle}
```

Example:
```bash
git checkout -b week-3-scotch
```

Build your deliverable on that branch. Commit often with clear messages:

```bash
# Good
git commit -m "add ERC-20 transfer function with balance check"
git commit -m "fix STK Push callback handler for duplicate transactions"

# Bad
git commit -m "fix"
git commit -m "wip"
```

When done, open a pull request against the `main` branch of your own fork.

**PR title format:**
```
[Cohort 1 Week N] Your Name - Deliverable title
```

**Example:**
```
[Cohort 1 Week 3] Joseph Njoroge - STK Push integration with Core Wallet frontend
```

Fill in every section of the PR template. Submit the PR link in `#submissions` on Discord before Sunday midnight EAT.

---

## Weekly deliverables and quests

### Week 1 — Blockchain, Avalanche fundamentals, and Core Wallet

**Sessions:**
- Tuesday: Intro to Web3 and blockchain fundamentals. Avalanche architecture — C-Chain, X-Chain, P-Chain.
- Thursday: Fuji testnet setup. Core Wallet configuration. Environment setup verification. Getting testnet AVAX.

**Deliverable:** Deploy a "Hello Avalanche" transaction on Fuji testnet using both MetaMask and Core Wallet. Submit both transaction hashes with Snowtrace links and a README explaining what you did and what Avalanche C-Chain is.

**Quests (Plug and Play — due Sunday midnight EAT):**

| Quest | Task |
|-------|------|
| Q1 | Create your Avalanche Builders Hub account at core.app/builders-hub and submit a screenshot of your profile |
| Q2 | Complete the "Blockchain Fundamentals" module on Avalanche Academy and upload your certificate |
| Q3 | Complete the "Avalanche Fundamentals" module on Avalanche Academy and upload your certificate |
| Q4 | Configure Core Wallet on Fuji testnet and submit your Core Wallet Fuji address |
| Q5 | Deploy your Week 1 transaction and submit the Snowtrace link |

---

### Week 2 — Smart contracts with Solidity

**Sessions:**
- Tuesday: Solidity fundamentals — variables, functions, modifiers, events, visibility. ERC-20 token standard. Hardhat project structure.
- Thursday: Deploying an ERC-20 to Fuji and verifying on Snowtrace. Reading contract state with ethers.js. Unit tests with Hardhat. Introduction to OpenZeppelin.

**Deliverable:** Deploy a custom ERC-20 token on Fuji testnet with at least three passing unit tests. Submit a PR with your contract, test file, deployment script, and Snowtrace verification link.

**Quests (Plug and Play — due Sunday midnight EAT):**

| Quest | Task |
|-------|------|
| Q1 | Complete the "Smart Contracts Fundamentals" module on Avalanche Academy and upload your certificate |
| Q2 | Deploy your ERC-20 token to Fuji and submit the verified Snowtrace contract link |
| Q3 | Write a test covering token minting, transfer, and balance — submit your GitHub repo link |
| Q4 | Read the OpenZeppelin ERC-20 source and submit a 3-sentence explanation of what `_transfer` does |
| Q5 | Post in Discord `#week-2`: what is the difference between C-Chain and a Layer 1 like Ethereum? |

---

### Week 3 — Integrations: Core Wallet, Oracles, and M-Pesa

**Sessions:**
- Tuesday: Core Wallet SDK integration in a React frontend. Connecting a wallet, reading balances, triggering transactions from a UI. Introduction to on-chain data feeds and oracles.
- Thursday: M-Pesa and the Daraja API. Paybill, Till, STK Push, B2C payouts. Daraja sandbox setup. OAuth 2.0 authentication. STK Push flow. Handling the callback webhook with Ngrok. Guest presentation: AvaRamp team in the second half — USDC-to-M-Pesa gateway walkthrough and sandbox API key distribution.

**Deliverable:** Working STK Push integration. A user enters a phone number, receives an M-Pesa prompt, and the callback is logged and stored. Submit a PR with your backend, a Postman collection demonstrating the STK Push flow, and a Core Wallet connection in your frontend.

**Quests (Plug and Play — due Sunday midnight EAT):**

| Quest | Task |
|-------|------|
| Q1 | Complete the "Avalanche dApp Development" module on Avalanche Academy and upload your certificate |
| Q2 | Connect Core Wallet to a frontend using the Core Wallet SDK — submit a screenshot of your connected UI |
| Q3 | Set up a Daraja sandbox account — submit a screenshot of your approved app credentials |
| Q4 | Complete a successful STK Push in the Daraja sandbox — submit the M-Pesa receipt from the simulator |
| Q5 | Post 5 sentences in Discord `#week-3` explaining what an oracle does and why a payment contract might need a price feed |

---

### Week 4 — Full-stack payment backend and on-chain payments

**Sessions:**
- Tuesday: REST API design for payment services. M-Pesa Daraja callback linking. Transaction status polling and idempotency. Receipt generation. Error handling, retry logic, security fundamentals — API key management, rate limiting, input validation.
- Thursday: Stablecoins and why USDC on Avalanche C-Chain matters for East Africa. Sending USDC with ethers.js. Writing a payment smart contract that accepts USDC. Hybrid payment flow — accepting M-Pesa or USDC on a single product. AvaRamp as a production reference.

**Deliverable (Final project):** A deployed payment product on Fuji testnet that accepts at least one payment method (M-Pesa or USDC), records the transaction, generates a receipt, and has a working frontend. Full hybrid (both rails) is distinction-level. Deploy to a public URL.

Submit: GitHub repo with complete README, deployed frontend URL, Fuji testnet smart contract link on Snowtrace, and a 5-minute demo video.

**Demo Day:** Final projects are presented live at Builders Connect — last Saturday of the month. Each builder gets 3 minutes for a live product walkthrough and 2 minutes for Q&A. Attendance is mandatory for graduation and certification.

**Quests (Plug and Play — due Sunday midnight EAT):**

| Quest | Task |
|-------|------|
| Q1 | Complete the "DeFi on Avalanche" or "Stablecoins" module on Avalanche Academy and upload your certificate |
| Q2 | Deploy your final project to Fuji and submit your Snowtrace contract link and frontend URL |
| Q3 | Submit your completed GitHub repo with README covering: what you built, how to run it, how payments flow |
| Q4 | Upload your 5-minute demo video link |
| Q5 | Complete the cohort exit survey on Plug and Play |

---

## Assessment rubric

| Criterion | Weight | Excellent | Good | Needs work |
|-----------|--------|-----------|------|------------|
| Functionality | 35% | All features work on testnet | Core features work | Partial or broken |
| Integration depth | 25% | Wallet + API + on-chain connected | Two layers integrated | Single component only |
| Code quality | 20% | Clean, commented, tested | Readable, some tests | Hard to follow, no tests |
| Documentation | 10% | Full README + demo video | README present | Minimal docs |
| Demo presentation | 10% | Clear, confident, live demo | Demo works with notes | Slides only, no demo |

**Grade bands:** Distinction 90-100% / Merit 75-89% / Pass 60-74% / Incomplete below 60%

Week 4 final project = 40% of cohort grade. Weeks 1-3 = 60% combined.

---

## Submission policy

- **Deadline:** Sunday midnight EAT for both PR link (Discord `#submissions`) and quests (Plug and Play)
- **Late — up to 48 hours:** Accepted with 20% grade penalty
- **Late — beyond 48 hours:** Zero for that week, but you may continue in the programme
- **Three consecutive zeros:** Removal from the cohort without a certificate
- **Week 4 pairs:** Week 4 allows pair submissions. Both builders must be listed in the PR and both must present at Builders Connect. All other weeks are individual.

---

## Already started your own repo?

You do not need to migrate. See [EXISTING_BUILDERS.md](./EXISTING_BUILDERS.md) — three steps to align your existing repo with the cohort standards.

---

## Resources

**Avalanche**
- Docs: [docs.avax.network](https://docs.avax.network)
- Builders Hub: [core.app/builders-hub](https://core.app/builders-hub)
- Core Wallet: [core.app](https://core.app) | SDK docs: [docs.core.app](https://docs.core.app)
- Fuji faucet: [core.app/tools/testnet-faucet](https://core.app/tools/testnet-faucet)
- Snowtrace Fuji: [testnet.snowtrace.io](https://testnet.snowtrace.io)
- USDC on Avalanche: [developers.circle.com/stablecoins/usdc-on-avalanche](https://developers.circle.com/stablecoins/usdc-on-avalanche)

**Smart contracts**
- Hardhat: [hardhat.org/docs](https://hardhat.org/docs)
- ethers.js: [docs.ethers.org](https://docs.ethers.org)
- OpenZeppelin: [docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts)
- Solidity: [docs.soliditylang.org](https://docs.soliditylang.org)

**Payments**
- Daraja API: [developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs)
- Ngrok: [ngrok.com](https://ngrok.com)

**Programme**
- Handbook: [team1-kenya-mini-hack.vercel.app](https://team1-kenya-mini-hack.vercel.app)
- Discord: linked from the landing page
- Plug and Play: linked from Discord `#announcements`

---

## Help

Post in Discord `#help` with: what you are trying to do, what you tried, and the exact error message.

Office hours: Thursdays 6:00 PM to 7:00 PM EAT on Discord voice — before the main session.

Tag `@scotch` on Discord only after posting in `#help` and not getting an answer within a reasonable time.
