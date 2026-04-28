# Epos Contracts

Base Sepolia testnet contracts for the onchain Epos MVP.

## Contracts

- `EposProfiles`: claims a unique username for a wallet.
- `EposRequests`: creates and fulfills USDC payment requests.
- `EposReputation`: records giver and receiver stats after fulfillment.

## Testnet

- Network: Base Sepolia
- Chain ID: `84532`
- Test USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## Commands

```bash
npm install
npm test
npm run deploy:base-sepolia
```

Create `contracts/.env` before deployment:

```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=0xyour-testnet-private-key
```
