/**
 * Wagmi config using explicit EIP-6963 provider discovery.
 *
 * Why NOT getDefaultConfig from RainbowKit:
 *   getDefaultConfig bundles a combined injected connector that still falls back
 *   to window.ethereum. When multiple extensions compete to define that global
 *   (e.g. Auro Wallet + MetaMask + Rabby), whichever wins the race becomes the
 *   active provider — which may not be the wallet the user selected in the modal,
 *   causing signMessage to hang or go to the wrong wallet.
 *
 * Why injected() fixes it:
 *   wagmi v2's injected() connector listens for eip6963:announceProvider events.
 *   Each extension announces itself with a unique rdns (e.g. "io.metamask") rather
 *   than overwriting window.ethereum. wagmi routes sign requests to the specific
 *   provider the user actually connected with, not the global winner.
 *
 * RainbowKitProvider automatically discovers and lists EIP-6963 wallets —
 * no wallet list config needed here.
 */
import { createConfig, http, injected } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { monadTestnet } from "viem/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!projectId) {
  throw new Error(
    "VITE_WALLETCONNECT_PROJECT_ID is not set. Add it as a shared environment variable.",
  );
}

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [
    // EIP-6963: each wallet extension announces itself via eip6963:announceProvider.
    // wagmi routes calls to the specific provider the user selected, not window.ethereum.
    injected(),
    // WalletConnect for mobile and non-injected wallets.
    walletConnect({ projectId }),
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: false,
});
