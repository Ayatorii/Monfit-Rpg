// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {AchievementBadge} from "../src/AchievementBadge.sol";

/**
 * Deploy AchievementBadge to Monad Testnet.
 *
 * Run:
 *   cd contracts/season-trophy
 *   forge script script/DeployAchievementBadge.s.sol:DeployAchievementBadge \
 *     --rpc-url https://testnet-rpc.monad.xyz \
 *     --private-key $DEPLOYER_PRIVATE_KEY \
 *     --broadcast
 */
contract DeployAchievementBadge is Script {
    function run() external {
        vm.startBroadcast();
        AchievementBadge badge = new AchievementBadge(msg.sender);
        console.log("AchievementBadge deployed at:", address(badge));
        vm.stopBroadcast();
    }
}
