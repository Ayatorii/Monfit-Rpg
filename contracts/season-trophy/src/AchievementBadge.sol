// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AchievementBadge
 * @notice ERC-721 achievement badges for MONFIT RPG on Monad Testnet.
 *
 * Three badge types:
 *   0 = WalletConnector  — awarded for connecting and signing in
 *   1 = TaskMaster       — awarded for completing 100 daily quests
 *   2 = GreatWarrior     — awarded for fighting 100 arena battles
 *
 * Owner-gated minting. Each (player, badgeType) pair can only be minted once.
 */
contract AchievementBadge is ERC721, Ownable {
    uint8 public constant MAX_BADGE_TYPE = 2;

    /// @dev player → badgeType → already minted
    mapping(address => mapping(uint8 => bool)) public hasMinted;

    /// @dev tokenId → badgeType
    mapping(uint256 => uint8) public badgeTypeOf;

    uint256 private _nextTokenId;

    event BadgeMinted(
        address indexed player,
        uint256 indexed tokenId,
        uint8 indexed badgeType
    );

    constructor(address initialOwner)
        ERC721("AchievementBadge", "MBADGE")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mint a badge to a player. Reverts if already minted for that type.
     * @param player    Recipient wallet address
     * @param badgeType 0=WalletConnector, 1=TaskMaster, 2=GreatWarrior
     * @return tokenId  The minted token ID
     */
    function mintBadge(address player, uint8 badgeType)
        external
        onlyOwner
        returns (uint256 tokenId)
    {
        require(badgeType <= MAX_BADGE_TYPE, "AchievementBadge: invalid type");
        require(!hasMinted[player][badgeType], "AchievementBadge: already minted");

        tokenId = _nextTokenId++;
        _safeMint(player, tokenId);
        badgeTypeOf[tokenId] = badgeType;
        hasMinted[player][badgeType] = true;

        emit BadgeMinted(player, tokenId, badgeType);
    }
}
