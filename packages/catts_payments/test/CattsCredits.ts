import hre, { ethers } from "hardhat";

import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

// HERE IS THE CONTRACT CODE
// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.24;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract CattsCredits is ReentrancyGuard, Ownable {
//     using SafeERC20 for IERC20;

//     event CreditsPurchased(
//         address indexed buyer,
//         uint256 amount,
//         address tokenAddress
//     );

//     constructor() Ownable(msg.sender) {}

//     function buy() external payable {
//         require(msg.value > 0, "You need to send some ether");
//         emit CreditsPurchased(msg.sender, msg.value, address(0));
//     }

//     function buyERC20(address tokenAddress, uint256 amount) public {
//         require(amount > 0, "Amount must be greater than 0");
//         IERC20 token = IERC20(tokenAddress);
//         token.safeTransferFrom(msg.sender, address(this), amount);
//         emit CreditsPurchased(msg.sender, amount, tokenAddress);
//     }

//     receive() external payable {
//         require(msg.value > 0, "You need to send some ether");
//         emit CreditsPurchased(msg.sender, msg.value, address(0));
//     }

//     fallback() external payable {
//         emit CreditsPurchased(msg.sender, msg.value, address(0));
//     }

//     function withdrawEther(
//         address payable to,
//         uint256 amount
//     ) external onlyOwner nonReentrant {
//         require(amount <= address(this).balance, "Insufficient balance");
//         to.transfer(amount);
//     }

//     function withdrawERC20(
//         address tokenAddress,
//         address to,
//         uint256 amount
//     ) external onlyOwner nonReentrant {
//         IERC20 token = IERC20(tokenAddress);
//         uint256 contractBalance = token.balanceOf(address(this));
//         require(amount <= contractBalance, "Insufficient token balance");
//         token.safeTransfer(to, amount);
//     }
// }

describe("CattsCredits", function () {
  async function deployCattsCreditsFixture() {
    const [owner, a2] = await hre.ethers.getSigners();
    const CattsCredits = await hre.ethers.getContractFactory("CattsCredits");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const cattsCredits = await CattsCredits.deploy();
    const mockERC20 = await MockERC20.deploy(
      "Mock Token",
      "MTK",
      ethers.parseEther("10000")
    );
    await mockERC20.transfer(a2.address, ethers.parseEther("1000"));
    return {
      cattsCredits,
      mockERC20,
      owner,
      a2,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with the right owner", async function () {
      const { cattsCredits, owner } = await loadFixture(
        deployCattsCreditsFixture
      );
      expect(await cattsCredits.owner()).to.equal(owner.address);
    });
  });

  describe("Buying Credits", function () {
    it("Should allow buying credits with ETH and emit event", async function () {
      const { cattsCredits, a2 } = await loadFixture(deployCattsCreditsFixture);
      const buyAmount = ethers.parseUnits("100", "gwei");
      await cattsCredits.connect(a2).buy({
        value: buyAmount,
      });
      const purchaseEvents = await cattsCredits.queryFilter(
        cattsCredits.filters.CreditsPurchased()
      );
      expect(purchaseEvents).to.have.lengthOf(1);
      expect((purchaseEvents[0] as any).args.amount).to.equal(buyAmount);
      expect((purchaseEvents[0] as any).args.buyer).to.equal(a2.address);
    });

    it("Should reject buying credits with 0 ETH", async function () {
      const { cattsCredits } = await loadFixture(deployCattsCreditsFixture);
      await expect(cattsCredits.buy({ value: 0 })).to.be.revertedWith(
        "You need to send some ether"
      );
    });
  });

  describe("Buying Credits with ERC-20", function () {
    it("Should allow buying credits with ERC-20 tokens and emit event", async function () {
      const { cattsCredits, mockERC20, a2 } = await loadFixture(
        deployCattsCreditsFixture
      );
      const purchaseAmount = ethers.parseEther("100");
      await mockERC20.connect(a2).approve(cattsCredits, purchaseAmount);
      await expect(cattsCredits.connect(a2).buyERC20(mockERC20, purchaseAmount))
        .to.emit(cattsCredits, "CreditsPurchased")
        .withArgs(a2.address, purchaseAmount, mockERC20);
    });

    it("Should reject buying credits without sufficient allowance", async function () {
      const { cattsCredits, mockERC20 } = await loadFixture(
        deployCattsCreditsFixture
      );
      const approveAmount = ethers.parseEther("100");
      await mockERC20.approve(cattsCredits, approveAmount);
      const tooLargeAmount = ethers.parseEther("1000");
      await expect(
        cattsCredits.buyERC20(mockERC20, tooLargeAmount)
      ).to.be.revertedWithCustomError(mockERC20, "ERC20InsufficientAllowance");
    });

    it("Should reject buying credits with 0 amount of ERC-20 tokens", async function () {
      const { cattsCredits, mockERC20 } = await loadFixture(
        deployCattsCreditsFixture
      );
      const approveAmount = ethers.parseEther("100");
      await mockERC20.approve(cattsCredits, approveAmount);
      const zeroAmount = ethers.parseEther("0");
      await expect(
        cattsCredits.buyERC20(mockERC20, zeroAmount)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Receive", function () {
    it("Should allow receiving ETH via receive function", async function () {
      const { cattsCredits, a2 } = await loadFixture(deployCattsCreditsFixture);
      const buyAmount = ethers.parseUnits("100", "gwei");
      await a2.sendTransaction({ to: cattsCredits, value: buyAmount });
      const purchaseEvents = await cattsCredits.queryFilter(
        cattsCredits.filters.CreditsPurchased()
      );
      expect(purchaseEvents).to.have.lengthOf(1);
      expect((purchaseEvents[0] as any).args.amount).to.equal(buyAmount);
      expect((purchaseEvents[0] as any).args.buyer).to.equal(a2.address);
    });

    it("Should reject receiving 0 ETH via receive function", async function () {
      const { cattsCredits, a2 } = await loadFixture(deployCattsCreditsFixture);
      const buyAmount = 0;
      await expect(
        a2.sendTransaction({ to: cattsCredits, value: buyAmount })
      ).to.be.revertedWith("You need to send some ether");
    });
  });

  describe("Fallback", function () {
    it("Should allow receiving ETH via fallback function with data", async function () {
      const { cattsCredits, a2 } = await loadFixture(deployCattsCreditsFixture);
      const buyAmount = ethers.parseUnits("100", "gwei");
      await a2.sendTransaction({
        to: cattsCredits,
        value: buyAmount,
        data: "0x1234", // Example data
      });
      const purchaseEvents = await cattsCredits.queryFilter(
        cattsCredits.filters.CreditsPurchased()
      );
      expect(purchaseEvents).to.have.lengthOf(1);
      expect(purchaseEvents[0].args.amount).to.equal(buyAmount);
      expect(purchaseEvents[0].args.buyer).to.equal(a2.address);
    });
  });

  describe("Withdrawals", function () {
    describe("Withdraw ETH", function () {
      it("Should allow owner to withdraw ETH", async function () {
        const { cattsCredits, owner, a2 } = await loadFixture(
          deployCattsCreditsFixture
        );
        const buyAmount = ethers.parseUnits("100", "gwei");
        await a2.sendTransaction({ to: cattsCredits, value: buyAmount });
        const withdrawAmount = ethers.parseUnits("30", "gwei");
        await cattsCredits.withdrawEther(owner.address, withdrawAmount);
        expect(await ethers.provider.getBalance(cattsCredits)).to.equal(
          buyAmount - withdrawAmount
        );
      });

      it("Should reject withdrawals by non-owner accounts", async function () {
        const { cattsCredits, a2 } = await loadFixture(
          deployCattsCreditsFixture
        );
        const buyAmount = ethers.parseUnits("100", "gwei");
        await a2.sendTransaction({ to: cattsCredits, value: buyAmount });
        const withdrawAmount = ethers.parseUnits("30", "gwei");
        await expect(
          cattsCredits.connect(a2).withdrawEther(a2.address, withdrawAmount)
        ).to.be.revertedWithCustomError(
          cattsCredits,
          "OwnableUnauthorizedAccount"
        );
      });

      it("Should reject withdrawing more ETH than the contract balance", async function () {
        const { cattsCredits, owner } = await loadFixture(
          deployCattsCreditsFixture
        );
        const buyAmount = ethers.parseUnits("100", "gwei");
        await cattsCredits.buy({ value: buyAmount });
        const withdrawAmount = ethers.parseUnits("200", "gwei");
        await expect(
          cattsCredits.withdrawEther(owner.address, withdrawAmount)
        ).to.be.revertedWith("Insufficient balance");
      });
    });

    describe("Withdraw ERC-20", function () {
      it("Should allow owner to withdraw ERC-20 tokens", async function () {
        const { cattsCredits, mockERC20, owner, a2 } = await loadFixture(
          deployCattsCreditsFixture
        );
        const buyAmount = ethers.parseEther("100");
        await mockERC20.connect(a2).approve(cattsCredits, buyAmount);
        await cattsCredits.connect(a2).buyERC20(mockERC20, buyAmount);
        const withdrawAmount = ethers.parseEther("30");
        await cattsCredits.withdrawERC20(
          mockERC20,
          owner.address,
          withdrawAmount
        );
        expect(await mockERC20.balanceOf(cattsCredits)).to.equal(
          buyAmount - withdrawAmount
        );
      });

      it("Should reject ERC-20 withdrawals by non-owner accounts", async function () {
        const { cattsCredits, mockERC20, a2 } = await loadFixture(
          deployCattsCreditsFixture
        );
        const buyAmount = ethers.parseEther("100");
        await mockERC20.approve(cattsCredits, buyAmount);
        await cattsCredits.buyERC20(mockERC20, buyAmount);
        const withdrawAmount = ethers.parseEther("30");
        await expect(
          cattsCredits
            .connect(a2)
            .withdrawERC20(mockERC20, a2.address, withdrawAmount)
        ).to.be.revertedWithCustomError(
          cattsCredits,
          "OwnableUnauthorizedAccount"
        );
      });

      it("Should reject withdrawing more ERC-20 tokens than the contract holds", async function () {
        const { cattsCredits, mockERC20, owner } = await loadFixture(
          deployCattsCreditsFixture
        );
        const buyAmount = ethers.parseEther("100");
        await mockERC20.approve(cattsCredits, buyAmount);
        await cattsCredits.buyERC20(mockERC20, buyAmount);
        const withdrawAmount = ethers.parseEther("200");
        await expect(
          cattsCredits.withdrawERC20(mockERC20, owner.address, withdrawAmount)
        ).to.be.revertedWith("Insufficient token balance");
      });
    });
  });

  describe("Ownership Transfers", function () {
    it("Should allow the owner to transfer ownership", async function () {
      const { cattsCredits, owner, a2 } = await loadFixture(
        deployCattsCreditsFixture
      );
      await cattsCredits.transferOwnership(a2.address);
      expect(await cattsCredits.owner()).to.equal(a2.address);
    });

    it("Should prevent non-owners from transferring ownership", async function () {
      const { cattsCredits, owner, a2 } = await loadFixture(
        deployCattsCreditsFixture
      );
      await expect(
        cattsCredits.connect(a2).transferOwnership(a2.address)
      ).to.be.revertedWithCustomError(
        cattsCredits,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Renouncing Ownership", function () {
    it("Should allow the owner to renounce ownership", async function () {
      const { cattsCredits, owner } = await loadFixture(
        deployCattsCreditsFixture
      );
      await cattsCredits.renounceOwnership();
      expect(await cattsCredits.owner()).to.equal("0x" + "0".repeat(40));
    });

    it("Should prevent non-owners from renouncing ownership", async function () {
      const { cattsCredits, owner, a2 } = await loadFixture(
        deployCattsCreditsFixture
      );
      await expect(
        cattsCredits.connect(a2).renounceOwnership()
      ).to.be.revertedWithCustomError(
        cattsCredits,
        "OwnableUnauthorizedAccount"
      );
    });
  });
});
