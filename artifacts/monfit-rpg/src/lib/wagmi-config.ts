import { getDefaultConfig, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { okxWallet } from "@rainbow-me/rainbowkit/wallets";
import { monadTestnet } from "viem/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!projectId) {
  throw new Error(
    "VITE_WALLETCONNECT_PROJECT_ID is not set. Add it as a shared environment variable.",
  );
}

const { wallets: defaultWallets } = getDefaultWallets();

/**
 * RainbowKit config with WalletConnect support + OKX Wallet added explicitly.
 *
 * getDefaultWallets() returns the standard recommended list (Safe, Rainbow,
 * Coinbase, MetaMask, WalletConnect). OKX Wallet is NOT included by default
 * so we add it as a second group here.
 *
 * NOTE: WalletConnect (Reown) will log a 403 on startup until the Vercel
 * deployment domain is registered at cloud.reown.com under this project ID.
 * The 403 does not break injected-wallet signing — it only means WalletConnect
 * QR / mobile wallet support is unavailable until the domain is registered.
 */
export const wagmiConfig = getDefaultConfig({
  appName: "MONFIT RPG",
  projectId,
  chains: [monadTestnet],
  ssr: false,
  wallets: [
    ...defaultWallets,
    {
      groupName: "More",
      wallets: [okxWallet],
    },
  ],
});
