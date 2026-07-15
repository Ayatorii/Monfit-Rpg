import { createConfig, http } from "wagmi";
import { monadTestnet } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

// WalletConnect project ID — required for WalletConnect v2 wallets.
// Injected wallets (MetaMask, Rabby, etc.) work without it.
// Get one free at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

const wallets = projectId
  ? [
      { groupName: "Popular", wallets: [injectedWallet, metaMaskWallet, rainbowWallet, coinbaseWallet, walletConnectWallet] },
    ]
  : [
      // No projectId — only injected wallets are available.
      { groupName: "Browser Wallet", wallets: [injectedWallet, metaMaskWallet, coinbaseWallet] },
    ];

const connectors = connectorsForWallets(wallets, {
  appName: "MONFIT RPG",
  // Provide a dummy non-empty value so RainbowKit's runtime guard is satisfied
  // when no env var is set; WalletConnect connections will fail gracefully, but
  // injected wallets (MetaMask, etc.) work fine without a real projectId.
  projectId: projectId ?? "monfit-rpg-demo",
});

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors,
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  },
});
