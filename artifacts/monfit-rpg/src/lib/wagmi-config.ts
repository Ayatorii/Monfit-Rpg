/**
 * Wagmi config — injected wallets only (EIP-6963).
 *
 * WHY no WalletConnect / getDefaultConfig:
 *   getDefaultConfig always initialises the Reown/WalletConnect SDK on startup.
 *   That SDK fetches project config from api.web3modal.org and returns 403 when
 *   the current domain isn't registered in the Reown dashboard. Even though it
 *   falls back to "local defaults", the connector ends up in a degraded state.
 *   wagmi may then route signMessage through WalletConnect instead of the
 *   injected wallet the user selected — the request hangs because WalletConnect
 *   is broken.
 *
 * WHY injected() fixes it:
 *   wagmi v2's injected() uses EIP-6963: each extension fires
 *   eip6963:announceProvider with a unique rdns ("io.metamask", etc.).
 *   wagmi routes sign requests to the exact provider object for the wallet the
 *   user connected with — never through window.ethereum, never through
 *   WalletConnect. Auro Wallet overwriting window.ethereum is irrelevant.
 *
 * TO RESTORE WalletConnect (mobile wallet support):
 *   Register the Vercel domain in the Reown dashboard at cloud.reown.com, then
 *   import walletConnect from "wagmi/connectors", add walletConnect({ projectId })
 *   to the connectors array, and restore the projectId env-var guard below.
 */
import { createConfig, http, injected } from "wagmi";
import { monadTestnet } from "viem/chains";

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected(), // EIP-6963: wallet-specific provider, not window.ethereum
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: false,
});
