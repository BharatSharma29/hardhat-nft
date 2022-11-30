// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

error DynamicSvgNft__NonexistentToken();

contract DynamicSvgNft is ERC721 {
    // mint
    // store our SVG information somewhere
    // some logic to "Show X image" or "Show Y image"

    uint256 private s_tokenCounter;
    string private s_lowImageUri;
    string private s_highImageUri;
    string private constant BASE64_ENCODED_SVG_PREFIX =
        "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    event CreatedNft(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        s_highImageUri = svgToImageUri(highSvg);
        s_lowImageUri = svgToImageUri(lowSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToImageUri(
        string memory svg
    ) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return
            string(
                abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded)
            );
    }

    function mintNft(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        emit CreatedNft(s_tokenCounter, highValue);
        s_tokenCounter++;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (!(_exists(tokenId))) revert DynamicSvgNft__NonexistentToken();

        // string memory imageUri = "hi";

        // Prefix for:
        // Svg Images : data:/image/svg+xml;base64,
        // Base64 JSON : data:application/json;base64,

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageUri = s_lowImageUri;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageUri = s_highImageUri;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the ChaInlink Feed", ',
                                '"attributes":[{"trait_type": "coolness", "value": 100}], "image":"',
                                imageUri,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSvg() public view returns (string memory) {
        return s_lowImageUri;
    }

    function getHighSvg() public view returns (string memory) {
        return s_highImageUri;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
