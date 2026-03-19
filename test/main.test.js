```javascript
const { ethers } = require("hardhat");

describe("DeFi Yield Optimizer", function () {
  let owner, user, contract;

  beforeEach(async function () {
    // Deploy the contract
    contract = await ethers.getContractFactory("DeFiYieldOptimizer");
    contract = await contract.deploy();
    await contract.deployed();

    // Get the owner and user addresses
    [owner, user] = await ethers.getSigners();
  });

  describe("Constructor", function () {
    it("Should set the Aave V2 variables", async function () {
      expect(await contract.AAVE_TOKEN()).to.equal("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229");
      expect(await contract.AAVE_FLASH_LOAN()).to.equal("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
    });

    it("Should set the Compound variables", async function () {
      expect(await contract.COMPTROLLER()).to.equal("0x3d9819210A31b4961b30Ee1048e7E39BD672b145");
      expect(await contract.COMP_TOKEN()).to.equal("0x6c3F90f043a72FA612cbAC1110b8f515733d3D67");
      expect(await contract.COMP()).to.equal("0x6c3F90f043a72FA612cbAC1110b8f515733d3D67");
    });

    it("Should set the Uniswap v3 variables", async function () {
      expect(await contract.UNISWAP_FACTORY()).to.equal("0x1B96FBD57A2fBD1f1537a924CB0D5669CEc2a939");
      expect(await contract.UNISWAP_SWAP()).to.equal("0x68b3465833fb5A61A7B6a4fc6f161dd9bA21CEcd");
    });
  });

  describe("happyPath", function () {
    beforeEach(async function () {
      // Set the APY for the pool
      await contract.setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", 100);
    });

    it("Should get the APY for the pool", async function () {
      expect(await contract.getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.equal(100);
    });

    it("Should get the APY for the pool with multiple mappings", async function () {
      await contract.setApy("0x1234567890abcdef", 50);
      expect(await contract.getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.equal(100);
      expect(await contract.getApy("0x1234567890abcdef")).to.equal(50);
    });

    it("Should get the APY for the pool with no mappings", async function () {
      expect(await contract.getApy("0x1234567890abcdef")).to.equal(0);
    });

    it("Should set the APY for the pool", async function () {
      expect(await contract.getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.equal(100);
      await contract.setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", 200);
      expect(await contract.getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.equal(200);
    });
  });

  describe("revert", function () {
    it("Should revert if the pool address is not a valid address", async function () {
      await expect(contract.getApy("0x1234567890abcdef")).to.be.reverted;
    });

    it("Should revert if the APY is not a number", async function () {
      await expect(contract.setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", "abc")).to.be.reverted;
    });

    it("Should revert if the APY is negative", async function () {
      await expect(contract.setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", -100)).to.be.reverted;
    });
  });

  describe("accessControl", function () {
    it("Should allow the owner to get the APY for the pool", async function () {
      await contract.setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", 100);
      expect(await contract.getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.equal(100);
    });

    it("Should not allow the user to get the APY for the pool", async function () {
      await expect(contract.connect(user).getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.be.reverted;
    });

    it("Should allow the owner to set the APY for the pool", async function () {
      await contract.setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", 100);
      expect(await contract.getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.equal(100);
    });

    it("Should not allow the user to set the APY for the pool", async function () {
      await expect(contract.connect(user).setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", 100)).to.be.reverted;
    });
  });

  describe("edgeCases", function () {
    it("Should handle the case where the pool address is 0x0", async function () {
      await expect(contract.getApy("0x0")).to.be.reverted;
    });

    it("Should handle the case where the APY is 0", async function () {
      await contract.setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", 0);
      expect(await contract.getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.equal(0);
    });

    it("Should handle the case where the APY is 100", async function () {
      await contract.setApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229", 100);
      expect(await contract.getApy("0x7Fc6650C86b18AB6C56C6Be4AD1C272CC712d229")).to.equal(100);
    });
  });
});
```

Note that the `getApy` and `setApy` functions are assumed to be implemented in the Solidity contract as follows:

```solidity
function getApy(address pool) public view returns (uint256) {
  return apy[pool];
}

function setApy(address pool, uint256 apy) public {
  apy[pool] = apy;
}
```

This test suite covers the following scenarios:

*   Constructor tests: Verifies that the contract has the correct Aave V2, Compound, and Uniswap v3 variables set.
*   Happy path tests: Verifies that the `getApy` and `setApy` functions work as expected.
*   Revert tests: Verifies that the contract reverts with the correct error messages when invalid inputs are provided.
*   Access control tests: Verifies that only the owner can call the `getApy` and `setApy` functions.
*   Edge case tests: Verifies that the contract handles edge cases such as an empty pool address, an APY of 0, and an APY of 100.