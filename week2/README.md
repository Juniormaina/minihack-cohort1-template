# Week 2 — Foundry Payments Project
## Mini Hack Cohort 1 | Session 4 | Thursday 12 June 2026

Your Foundry starter for Week 2. Two contracts, a deploy script, and tests.

## Quest checklist
- [ ] Q1 — Scaffold complete, foundry.toml configured, OpenZeppelin installed
- [ ] Q2 — PaymentSplitter written, forge build passes, forge test passes
- [ ] Q3 — Both contracts deployed to Fuji, Snowtrace links ready
- [ ] Q4 — Live cast approve + splitPayment executed, recipient balance verified
- [ ] Q5 — Smart Contracts on Avalanche Academy cert uploaded to Tally

## Setup
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Inside week2/
forge install OpenZeppelin/openzeppelin-contracts
cp .env.example .env   # fill in your values
forge build
forge test -vv
```

## Deploy to Fuji
```bash
source .env
forge script script/DeployPayments.s.sol:DeployPayments \
  --rpc-url $FUJI_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast -vvvv
```

## Live cast interaction (Quest 4)
```bash
source .env

# Approve
cast send $MUSDC_ADDRESS "approve(address,uint256)" \
  $PAYMENT_SPLITTER_ADDRESS 100000000 \
  --rpc-url $FUJI_RPC_URL --private-key $PRIVATE_KEY

# Split 70/30
cast send $PAYMENT_SPLITTER_ADDRESS \
  "splitPayment(address,address,address,uint256,uint256)" \
  $MUSDC_ADDRESS $PAYER $PAYEE 70000000 30000000 \
  --rpc-url $FUJI_RPC_URL --private-key $PRIVATE_KEY

# Verify recipient balance
cast call $MUSDC_ADDRESS "balanceOf(address)(uint256)" \
  $PAYEE --rpc-url $FUJI_RPC_URL
```

## Submit
- GitHub PR: branch week-2-YOUR-HANDLE → your fork's main
- Tally: https://tally.so/r/rjv4Zo — include your PR link
- Telegram: post PR link in submissions thread
