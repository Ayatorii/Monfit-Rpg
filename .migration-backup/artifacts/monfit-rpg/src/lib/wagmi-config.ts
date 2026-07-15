import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "viem/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!projectId) {
  throw new Error(
    "VITE_WALLETCONNECT_PROJECT_ID is not set. Add it as a shared environment variable.",
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "MONFIT RPG",
  projectId,
  chains: [monadTestnet],
  ssr: false,
});
