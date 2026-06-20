# Mini Hack Cohort 1 — Builder Contribution Guide
## Payments on Avalanche | Team1 Kenya | 2026

This guide covers everything you need to complete your weekly quests, submit your work, and stay on track from Week 1 through Demo Day. Read it once at the start of the cohort and refer back to it whenever you are unsure what to do next.

If something is not clear, post in the Telegram group before you guess. A wrong submission costs you points and time.

---

## Table of contents

- [Before you start](#before-you-start)
- [How the cohort works](#how-the-cohort-works)
- [Weekly workflow — step by step](#weekly-workflow--step-by-step)
- [Week 1 — Blockchain, Avalanche Fundamentals, and Core Wallet](#week-1)
- [Week 2 — Foundry, Smart Contracts, and On-Chain Deployment](#week-2)
- [Week 3 — Integrations: Core Wallet, Oracles, and M-Pesa](#week-3)
- [Week 4 — Full-stack Payment Backend and On-chain Payments](#week-4)
- [How to submit on Tally](#how-to-submit-on-tally)
- [How to open a GitHub PR](#how-to-open-a-github-pr)
- [Grading rubric](#grading-rubric)
- [Late submission policy](#late-submission-policy)
- [Getting help](#getting-help)
- [Quick links](#quick-links)

---

## Before you start

Complete all of these before Session 1. If you have not done them yet, do them now before anything else.

- [ ] Create a GitHub account at [github.com](https://github.com) using your real name
- [ ] Accept the Talent-Index org invitation from your GitHub email
- [ ] Create your Avalanche Builders Hub account at [build.avax.network/builders-hub](https://build.avax.network/builders-hub) — this is Quest 1 and a primary KPI
- [ ] Install Core Wallet from [core.app](https://core.app) and configure it on Fuji testnet
- [ ] Install MetaMask and configure it on Fuji testnet
- [ ] Claim Fuji testnet AVAX from [core.app/tools/testnet-faucet](https://core.app/tools/testnet-faucet)
- [ ] Fork the cohort template repo to your personal GitHub account: [github.com/Talent-Index/minihack-cohort1-template](https://github.com/Talent-Index/minihack-cohort1-template)
- [ ] Clone your fork and run `npm install` and `npx hardhat compile` — verify it runs without errors
- [ ] Join the Telegram group: [t.me/avaxDAOAfrica/3](https://t.me/avaxDAOAfrica/3)
- [ ] Join the WhatsApp group: link pinned in Telegram

**Fuji testnet config for both wallets:**

```
Network name:  Avalanche Fuji Testnet
RPC URL:       https://api.avax-test.network/ext/bc/C/rpc
Chain ID:      43113
Currency:      AVAX
Explorer:      https://testnet.snowtrace.io
```

---

## How the cohort works

Mini Hack Cohort 1 runs for four weeks — eight sessions total, two per week on Tuesdays and Thursdays at 8:00 PM EAT on Google Meet at [meet.google.com/wcm-gmct-cbt](https://meet.google.com/wcm-gmct-cbt).

Every week you have two things to submit before Sunday midnight EAT:

**1. A GitHub pull request** — your actual code. This is the technical deliverable. It lives on your fork of the template repo and is reviewed by the technical lead or a module lead.

**2. Tally quest submissions** — evidence of your work. Screenshots, Snowtrace links, terminal output, certificate PDFs, reflections. Each quest is a separate field in that week's Tally form. The Tally submissions feed directly into the leaderboard at [minihacktracker.vercel.app](https://minihacktracker.vercel.app).

Both must be done by the same deadline. A GitHub PR without Tally quests is incomplete. Tally quests without a GitHub PR link are incomplete.

---

## Weekly workflow — step by step

Follow this exact process every week, every time. No deviations.

### Step 1 — Pull the latest from the template

Before starting each week, sync your fork with the template repo to get any new starter code or resources added for that week:

```bash
git remote add upstream https://github.com/Talent-Index/minihack-cohort1-template.git
# Only run the line above once — skip it on subsequent weeks

git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Step 2 — Create your weekly branch

Branch naming is mandatory. Use this exact format every single week:

```bash
git checkout -b week-{N}-{your-github-handle}
```

Examples:
```bash
git checkout -b week-1-scotch
git checkout -b week-2-wanjiku
git checkout -b week-3-kipchoge
```

A PR with the wrong branch name is flagged immediately and sent back to you to fix.

### Step 3 — Do your work on that branch

Build the week's deliverable on your branch. Commit often. Write commit messages that describe what you actually did — not `fix` or `update`:

```bash
# Good commit messages
git commit -m "add ERC-20 PaymentSplitter with 70/30 split logic"
git commit -m "deploy PaymentSplitter to Fuji — tx hash 0x..."
git commit -m "add unit test for zero-amount revert case"

# Bad commit messages
git commit -m "fix"
git commit -m "update"
git commit -m "wip"
git commit -m "asdfgh"
```

Your commit history is visible to reviewers and contributes to your code quality score.

### Step 4 — Push your branch

```bash
git push origin week-{N}-{your-github-handle}
```

### Step 5 — Open a pull request

Go to `github.com/YOUR-HANDLE/minihack-cohort1-template` and open a pull request from your weekly branch into the `main` branch of **your own fork** — not into the Talent-Index template repo.

**PR title format — mandatory:**

```
[Cohort 1 Week N] Your Full Name - Deliverable title
```

Examples:
```
[Cohort 1 Week 1] Joseph Njoroge - Hello Avalanche transaction on Fuji
[Cohort 1 Week 2] Wanjiku Kamau - PaymentSplitter and Escrow deployed to Fuji
[Cohort 1 Week 3] Isaac Kipchoge - STK Push integration with Core Wallet frontend
```

When you open the PR, a template appears automatically. **Fill in every single section.** A PR with blank sections will not be reviewed. The template asks for:

- What you built
- What works
- What does not work yet
- Your Snowtrace link (required from Week 2)
- Your deployed frontend URL (required from Week 3)
- Notes for the reviewer

Within 30 seconds of opening the PR, the automated welcome bot posts a comment confirming your submission is in and listing the pre-review checklist. If you do not see that comment, something went wrong — check the Actions tab on your fork.

### Step 6 — Post your PR link in Telegram

Copy your full PR URL and post it in the Telegram group submissions thread. Tag it with your cohort and week:

```
[Cohort 1 Week 2] PR submitted
https://github.com/YOUR-HANDLE/minihack-cohort1-template/pull/N
```

This must be done before Sunday midnight EAT.

### Step 7 — Complete your Tally quests

Go to that week's Tally form link (posted in Telegram and on the programme site) and submit evidence for each quest. Include your GitHub PR link in the Tally submission — it is a required field.

All quests must be completed on Tally before Sunday midnight EAT — same deadline as your PR.

Your Tally submissions feed the leaderboard automatically. Check your standing at [minihacktracker.vercel.app](https://minihacktracker.vercel.app).

---

## Week 1

**Blockchain, Avalanche Fundamentals, and Core Wallet**

### Sessions
- **Session 1 (Tuesday):** Intro to Web3 and blockchain fundamentals. Avalanche architecture — C-Chain, X-Chain, P-Chain.
- **Session 2 (Thursday):** Fuji testnet setup. Core Wallet configuration. Getting testnet AVAX. Environment setup verification.

### Deliverable

Deploy a "Hello Avalanche" transaction on Fuji testnet using both MetaMask and Core Wallet.

Submit in your GitHub PR:
- Both transaction hashes with Snowtrace links
- A README explaining what you did and what Avalanche C-Chain is

### Quests (submit on Tally before Sunday midnight EAT)

| Quest | Points | What to do |
|-------|--------|-----------|
| Q1 | 20 pts | Create your Avalanche Builders Hub account at build.avax.network/builders-hub — submit a screenshot of your profile |
| Q2 | 20 pts | Complete Blockchain Fundamentals on Avalanche Academy — upload your certificate |
| Q3 | 20 pts | Complete Avalanche Fundamentals on Avalanche Academy — upload your certificate |
| Q4 | 20 pts | Configure Core Wallet on Fuji testnet — submit your Core Wallet Fuji address |
| Q5 | 20 pts | Deploy your Week 1 transaction — submit the Snowtrace link |

**Total: 100 points**

---

## Week 2

**Foundry, Smart Contracts, and On-Chain Deployment**

### Sessions
- **Session 3 (Tuesday):** Solidity fundamentals. ERC-20 token standard. Hardhat project structure.
- **Session 4 (Thursday):** Foundry setup. PaymentSplitter and Escrow contracts. Deploying to Fuji with `forge script`. Live `cast` transactions.

### Starter code

The `week2/` folder in the template repo contains everything you need:

```
week2/
  contracts/
    PaymentSplitter.sol    Your main contract for Q2
    Escrow.sol             Holds funds between depositor and beneficiary
    MockUSDC.sol           ERC-20 test token for local testing
  script/
    DeployPayments.s.sol   Deploys all three contracts to Fuji
  test/
    PaymentSplitter.t.sol  Four unit tests — all must pass
  foundry.toml             Pre-configured for Fuji C-Chain
  .env.example             All environment variables you need
  README.md                Full quest instructions and cast commands
```

Pull this into your fork before starting:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### Foundry setup (if not already installed)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Inside week2/
forge install OpenZeppelin/openzeppelin-contracts
cp .env.example .env   # fill in your values
forge build
forge test -vv         # all 4 tests must pass
```

### Deploy to Fuji

```bash
source .env
forge script script/DeployPayments.s.sol:DeployPayments \
  --rpc-url $FUJI_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

Save the three contract addresses from the output. Paste them into your `.env`.

### Live cast interaction (Quest 4)

```bash
source .env

# Approve PaymentSplitter to spend 100 mUSDC
cast send $MUSDC_ADDRESS \
  "approve(address,uint256)" \
  $PAYMENT_SPLITTER_ADDRESS 100000000 \
  --rpc-url $FUJI_RPC_URL \
  --private-key $PRIVATE_KEY

# Execute 70/30 split
cast send $PAYMENT_SPLITTER_ADDRESS \
  "splitPayment(address,address,address,uint256,uint256)" \
  $MUSDC_ADDRESS $PAYER $PAYEE 70000000 30000000 \
  --rpc-url $FUJI_RPC_URL \
  --private-key $PRIVATE_KEY

# Verify recipient B received 30 mUSDC
cast call $MUSDC_ADDRESS \
  "balanceOf(address)(uint256)" \
  $PAYEE \
  --rpc-url $FUJI_RPC_URL
```

Copy all three terminal outputs for your Quest 4 Tally submission.

### Quests (submit on Tally before Sunday midnight EAT)

| Quest | Points | What to do |
|-------|--------|-----------|
| Q1 | 20 pts | Scaffold Foundry project — screenshot of project tree and foundry.toml |
| Q2 | 25 pts | Write PaymentSplitter — paste complete Solidity source, forge build screenshot |
| Q3 | 25 pts | Deploy to Fuji — forge script output, Snowtrace links for both contracts |
| Q4 | 20 pts | Live cast transaction — approve output, splitPayment output, balanceOf result |
| Q5 | 30 pts | Smart Contracts on Avalanche Academy cert — PDF upload and profile screenshot |

**Total: 120 points**

---

## Week 3

**Integrations: Core Wallet, Oracles, and M-Pesa**

### Sessions
- **Session 5 (Tuesday):** Core Wallet SDK integration in a React frontend. On-chain data feeds and oracles.
- **Session 6 (Thursday):** M-Pesa and the Daraja API. STK Push flow. Ngrok for local webhook testing. AvaRamp guest presentation (second half).

### Deliverable

Working STK Push integration. A user enters a phone number, receives an M-Pesa prompt, and the callback is logged and stored. Submit a PR with your backend, a Postman collection demonstrating the flow, and a Core Wallet connection in your frontend.

### Daraja sandbox setup

1. Create an account at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app and get your Consumer Key and Consumer Secret
3. Use the sandbox STK Push credentials — never real M-Pesa keys in your repo
4. Install and run Ngrok to expose your local callback URL: `ngrok http 3000`

### Quests (submit on Tally before Sunday midnight EAT)

| Quest | Points | What to do |
|-------|--------|-----------|
| Q1 | 20 pts | Complete Avalanche dApp Development on Academy — upload certificate |
| Q2 | 20 pts | Connect Core Wallet to a frontend using the Core Wallet SDK — screenshot of connected UI |
| Q3 | 20 pts | Set up Daraja sandbox — screenshot of your approved app credentials |
| Q4 | 20 pts | Complete a successful STK Push in the Daraja sandbox — M-Pesa receipt from simulator |
| Q5 | 20 pts | Post 5 sentences in Telegram explaining what an oracle does and why a payment contract might need a price feed |

**Total: 100 points**

---

## Week 4

**Full-stack Payment Backend and On-chain Payments**

### Sessions
- **Session 7 (Tuesday):** REST API design for payment services. M-Pesa Daraja callbacks. Receipt generation. Error handling and security.
- **Session 8 (Thursday):** USDC on Avalanche. Hybrid payment flow architecture. AvaRamp as a production reference.

### Final project deliverable

A deployed payment product on Fuji testnet that:
- Accepts at least one payment method (M-Pesa or USDC)
- Records the transaction
- Generates a receipt
- Has a working frontend deployed to a public URL

Full hybrid (both M-Pesa and USDC) is distinction-level.

Submit:
- GitHub repo with complete README
- Deployed frontend URL
- Fuji testnet smart contract link on Snowtrace
- A 5-minute demo video

**Demo Day** is at Builders Connect — last Saturday of the month. Each builder gets 3 minutes for a live product walkthrough and 2 minutes for Q&A. **Attendance at Demo Day is mandatory for graduation and certification.**

### Quests (submit on Tally before Sunday midnight EAT)

| Quest | Points | What to do |
|-------|--------|-----------|
| Q1 | 20 pts | Complete DeFi on Avalanche or Stablecoins module on Academy — upload certificate |
| Q2 | 20 pts | Deploy final project to Fuji — submit Snowtrace contract link and frontend URL |
| Q3 | 20 pts | Submit GitHub repo with README covering: what you built, how to run it, how payments flow |
| Q4 | 20 pts | Upload your 5-minute demo video link |
| Q5 | 20 pts | Complete the cohort exit survey on Tally |

**Total: 100 points**

---

## How to submit on Tally

1. Go to that week's Tally form link — posted in Telegram and on the programme site
2. Fill in your name, email, and GitHub username
3. Paste your GitHub PR link — this is required on every form
4. Work through each quest field in order — upload files, paste links, paste terminal output
5. Hit Submit

**Do not leave fields empty.** A Tally submission with missing quest fields will not count for those quests. You can resubmit but only the first submission is counted on the leaderboard timestamp — so get it right the first time.

After submitting, check the leaderboard at [minihacktracker.vercel.app](https://minihacktracker.vercel.app) within a few minutes to confirm your submission appeared.

---

## How to open a GitHub PR

1. Push your weekly branch: `git push origin week-{N}-{your-handle}`
2. Go to `github.com/YOUR-HANDLE/minihack-cohort1-template`
3. GitHub shows a banner saying your branch was recently pushed — click **Compare and pull request**
4. Verify the base is `main` on **your own fork** — not on Talent-Index
5. Set the PR title using the format: `[Cohort 1 Week N] Your Name - Deliverable title`
6. Fill in every section of the PR template that appears
7. Click **Create pull request**
8. Wait 30 seconds — the welcome bot posts a confirmation comment
9. Copy the PR URL from your browser and post it in Telegram

**If you open the PR against the wrong repo (Talent-Index instead of your fork):**
Close the PR immediately. Go to your fork's page and open a new one from there.

**If you forget to fill in the PR template:**
Edit the PR description before the Sunday midnight EAT deadline. You can edit a PR description after opening it.

---

## Grading rubric

All weekly deliverables are assessed on five criteria. Week 4 carries 40% of your total cohort grade. Weeks 1 through 3 together carry 60%.

| Criterion | Weight | Excellent | Good | Needs work |
|-----------|--------|-----------|------|------------|
| Functionality | 35% | All features work on Fuji testnet | Core features work | Partial or broken |
| Integration depth | 25% | Wallet + API + on-chain connected | Two layers integrated | Single component only |
| Code quality | 20% | Clean, commented, tested | Readable, some tests | Hard to follow, no tests |
| Documentation | 10% | Full README and demo video | README present | Minimal docs |
| Demo presentation | 10% | Clear, confident, live demo | Demo works with notes | Slides only, no demo |

**Grade bands:**
- Distinction: 90 to 100 percent
- Merit: 75 to 89 percent
- Pass: 60 to 74 percent
- Incomplete: below 60 percent

Certificates are awarded to builders who achieve a Pass or above AND present at Builders Connect Demo Day.

---

## Late submission policy

| Timing | Consequence |
|--------|------------|
| On time (before Sunday midnight EAT) | Full points |
| Up to 48 hours late | Accepted with 20% grade penalty |
| Beyond 48 hours | Zero for that week — you may still continue |
| Three consecutive zeros | Removal from the cohort without a certificate |

If you have a genuine emergency, message the technical lead on Telegram **before** the deadline. After the deadline, late appeals are not considered.

---

## Getting help

**Post in Telegram first.** Include three things in your message:

1. What you are trying to do
2. What you have already tried
3. The exact error message — not a paraphrase, the full text

**Office hours** run every Thursday from 6:00 PM to 7:00 PM EAT on a voice call before the main session. Details are posted in Telegram. If you have a blocker, bring it to office hours.

**Tag @scotch** on Telegram only after posting in the group and not getting a response within a reasonable time.

Do not DM the technical lead directly for general questions. Post in the group so the whole community benefits from the answer.

---

## Quick links

| Resource | Link |
|----------|------|
| Programme site | [team1kenyaminihack.vercel.app](https://team1kenyaminihack.vercel.app) |
| Quest leaderboard | [minihacktracker.vercel.app](https://minihacktracker.vercel.app) |
| Programme handbook | [Notion](https://futuristic-dog-9aa.notion.site/Avalanche-Team1-Kenya-Mini-Hack-2a61447232f181d182fec1d63817b3bd) |
| Cohort 1 template repo | [github.com/Talent-Index/minihack-cohort1-template](https://github.com/Talent-Index/minihack-cohort1-template) |
| GitHub org | [github.com/Talent-Index](https://github.com/Talent-Index) |
| Tally quest submissions | [tally.so/r/rjv4Zo](https://tally.so/r/rjv4Zo) |
| Telegram (primary) | [t.me/avaxDAOAfrica/3](https://t.me/avaxDAOAfrica/3) |
| Google Meet | [meet.google.com/wcm-gmct-cbt](https://meet.google.com/wcm-gmct-cbt) |
| Avalanche Builders Hub | [build.avax.network/builders-hub](https://build.avax.network/builders-hub) |
| Avalanche Academy | [academy.avax.network](https://academy.avax.network) |
| Fuji faucet | [core.app/tools/testnet-faucet](https://core.app/tools/testnet-faucet) |
| Fuji explorer | [testnet.snowtrace.io](https://testnet.snowtrace.io) |
| Core Wallet | [core.app](https://core.app) |
| Hardhat docs | [hardhat.org/docs](https://hardhat.org/docs) |
| Foundry docs | [book.getfoundry.sh](https://book.getfoundry.sh) |
| ethers.js docs | [docs.ethers.org](https://docs.ethers.org) |
| OpenZeppelin | [docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts) |
| Daraja API | [developer.safaricom.co.ke/docs](https://developer.safaricom.co.ke/docs) |
| Avalanche docs | [docs.avax.network](https://docs.avax.network) |

---

*Build with intent. Ship with pride.*
**Team1 Kenya | Mini Hack Cohort 1 | 2026**
