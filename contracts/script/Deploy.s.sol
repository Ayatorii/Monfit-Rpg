// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {SeasonTrophy} from "../src/SeasonTrophy.sol";

/**
 * Deploy SeasonTrophy to Monad Testnet.
 *
 * The deployer wallet becomes the contract owner and is also used as the
 * backend minter (stored as DEPLOYER_PRIVATE_KEY in Replit Secrets).
 *
 * Run:
 *   export FOUNDRY_PATH=~/.config/.foundry/bin
 *   $FOUNDRY_PATH/forge script script/Deploy.s.sol:DeployScript \
 *     --rpc-url https://testnet-rpc.monad.xyz \
 *     --private-key $DEPLOYER_PRIVATE_KEY \
 *     --broadcast
 */
contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        SeasonTrophy trophy = new SeasonTrophy(msg.sender);
        console.log("SeasonTrophy deployed at:", address(trophy));
        vm.stopBroadcast();
    }
}
