```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DeFiYieldOptimizer is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Mapping of pool addresses to APY
    mapping(address => uint256) public poolAPYs;

    // Chainlink V3 Aggregator interface
    address public oracleAddress;

    // Pool addresses and their corresponding APY values
    address[] public poolAddresses;

    constructor(address[] memory _poolAddresses, address _oracleAddress) {
        poolAddresses = _poolAddresses;
        oracleAddress = _oracleAddress;

        // Initialize pool APY mapping
        for (uint256 i = 0; i < poolAddresses.length; i++) {
            poolAPYs[poolAddresses[i]] = 0;
        }
    }

    // Event emitted when pool APY is updated
    event PoolAPYUpdated(address indexed poolAddress, uint256 newAPY);

    // Event emitted when funds are moved to a new pool
    event FundsMoved(address indexed poolAddress, uint256 amount);

    // Update pool APY value
    function updatePoolAPY(address _poolAddress, uint256 _newAPY)
        public
        onlyOwner
        nonReentrant
    {
        poolAPYs[_poolAddress] = _newAPY;
        emit PoolAPYUpdated(_poolAddress, _newAPY);
    }

    // Move funds to the pool with the highest APY
    function moveFundsToHighestAPYPool(uint256 _amount) public nonReentrant {
        uint256 maxAPY = 0;
        address bestPoolAddress;

        for (uint256 i = 0; i < poolAddresses.length; i++) {
            address poolAddress = poolAddresses[i];
            uint256 apy = poolAPYs[poolAddress];

            // Check if the pool APY has been updated on-chain
            (, int256 price,,,) = AggregatorV3Interface(oracleAddress).latestRoundData();
            if (price != 0) {
                // Simulate Chainlink call to get the latest price
                // (This is a simplified example and should be replaced with an actual Chainlink call)
                apy = uint256(price) * 10000 / 1e18;
            }
            if (apy > maxAPY) {
                maxAPY = apy;
                bestPoolAddress = poolAddress;
            }
        }

        // Move funds to the best pool
        uint256 amountToMove = _amount.mul(maxAPY).div(10000);
        require(address(this).balance >= amountToMove, "Insufficient funds");
        (bool sent, ) = bestPoolAddress.call{value: amountToMove}("");
        require(sent, "Failed to send funds");

        emit FundsMoved(bestPoolAddress, amountToMove);
    }
}
```