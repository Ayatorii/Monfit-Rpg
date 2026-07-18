---
name: Safe multisig
description: 2-of-3 Safe multisig deployed on Monad Testnet for contract ownership and onchain operations.
---

# Safe Multisig

**Address:** `0x1C49DB866c9E942f55FdE7C0Fc9E1F83E33aAeCb`
**Network:** Monad Testnet (chain 10143)
**Threshold:** 2-of-3

**Owners:**
1. `0xD9C92AfA8A4317039E21a90eCCBa7B8996574352` (user deployer wallet)
2. `0x65fa707895ba2D662c4a064d824cBC48F0E5B519` (user second wallet)
3. `0x8550C88c66dF5346d74d3f982C4562d6b576c8df` (agent wallet)

**Agent keystore:** `~/.monskills/keystore/595bf66c-b29e-43c1-a1fb-ee4e397bb7c6`
**Agent wallet:** `0x8550C88c66dF5346d74d3f982C4562d6b576c8df`
**Multisig file:** `~/.monskills/multisig.json`

**Safe UI:** https://app.safe.global/home?safe=monad-testnet:0x1C49DB866c9E942f55FdE7C0Fc9E1F83E33aAeCb

**Why:** All future onchain deployments and contract calls must go through this Safe. Agent proposes (1/2) via `propose.sh`, user approves (2/2) in Safe UI.

**How to apply:** Use `.agents/skills/monskill/wallet/utils/propose.sh` with `CHAIN_ID=10143 SAFE_ADDRESS=0x1C49DB866c9E942f55FdE7C0Fc9E1F83E33aAeCb`. Forge is at `/nix/store/y859lxadky9li4hr27dx3cvvrc5kc5i2-foundry-1.1.0/bin/forge`.
