// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SeasonTrophy
 * @notice ERC-721 NFT awarded to top-ranked MONFIT RPG players at the end of
 *         each season. Deployed on Monad Testnet.
 *
 * Owner: the deployer wallet (also used as the backend minter).
 * Mint is gated to owner so only the backend can award trophies.
 *
 * Token metadata is fully on-chain: tokenURI returns a data URI JSON blob
 * encoding season and rank — no IPFS needed for the hackathon.
 */
contract SeasonTrophy is ERC721Enumerable, Ownable {
    using Strings for uint256;

    struct TrophyData {
        uint256 season;
        uint8 rank;
    }

    /// @dev tokenId → trophy metadata
    mapping(uint256 => TrophyData) private _trophyData;

    uint256 private _nextTokenId;

    event TrophyMinted(
        address indexed player,
        uint256 indexed tokenId,
        uint256 season,
        uint8 rank
    );

    constructor(address initialOwner)
        ERC721("SeasonTrophy", "STRO")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mint a Season Trophy to `player`. Only callable by the owner
     *         (the backend minter wallet).
     * @param player  Recipient wallet address.
     * @param season  Season number (1-based).
     * @param rank    Leaderboard rank (1 = first place).
     * @return tokenId The newly minted token ID.
     */
    function mintTrophy(
        address player,
        uint256 season,
        uint8 rank
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _trophyData[tokenId] = TrophyData({ season: season, rank: rank });
        _safeMint(player, tokenId);
        emit TrophyMinted(player, tokenId, season, rank);
    }

    /**
     * @notice Return season and rank for a given token.
     */
    function getTrophyData(uint256 tokenId)
        external
        view
        returns (uint256 season, uint8 rank)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        TrophyData memory d = _trophyData[tokenId];
        return (d.season, d.rank);
    }

    /**
     * @notice Fully on-chain metadata as a data URI JSON blob.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        TrophyData memory d = _trophyData[tokenId];

        string memory rankSuffix = _rankSuffix(d.rank);

        string memory json = string(
            abi.encodePacked(
                '{"name":"Season ',
                d.season.toString(),
                " Trophy \u2014 ",
                uint256(d.rank).toString(),
                rankSuffix,
                ' Place","description":"Awarded to the ',
                uint256(d.rank).toString(),
                rankSuffix,
                "-place fighter in MONFIT RPG Season ",
                d.season.toString(),
                '.","attributes":[{"trait_type":"Season","value":',
                d.season.toString(),
                '},{"trait_type":"Rank","value":',
                uint256(d.rank).toString(),
                "}]}"
            )
        );

        return
            string(abi.encodePacked("data:application/json;utf8,", json));
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _rankSuffix(uint8 rank) internal pure returns (string memory) {
        if (rank == 1) return "st";
        if (rank == 2) return "nd";
        if (rank == 3) return "rd";
        return "th";
    }
}
