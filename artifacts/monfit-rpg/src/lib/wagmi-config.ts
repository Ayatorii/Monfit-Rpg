import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "viem/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!projectId) {
  throw new Error(
    "VITE_WALLETCONNECT_PROJECT_ID is not set. Add it as a shared environment variable.",
  );
}

/**
 * RainbowKit's getDefaultConfig is the current recommended setup.
 * It uses wagmi v2's injected() connector internally, which supports EIP-6963
 * provider discovery (each wallet announces itself via eip6963:announceProvider
 * rather than fighting over window.ethereum).
 */
export const wagmiConfig = getDefaultConfig({
  appName: "MONFIT RPG",
  projectId,
  chains: [monadTestnet],
  ssr: false,
});
