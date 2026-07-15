import { createPublicClient, http } from "viem";
import { monadTestnet } from "viem/chains";

/**
 * Public client bound to Monad Testnet (chainId 10143). Used to verify SIWE
 * signatures — this also validates EIP-1271 smart-contract-wallet
 * signatures, not just plain EOA signatures.
 */
export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});
