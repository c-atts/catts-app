// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CattsRunPayments is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    address payable public _forwardAddress;

    event RunPayment(address indexed payer, uint256 amount, bytes12 runId);

    constructor(
        address payable forwardAddress,
        address initialOwner
    ) Ownable(initialOwner) {
        _forwardAddress = forwardAddress;
    }

    function _forwardPayment() internal {
        require(_forwardAddress != address(0), "Forward address not set");
        (bool success, ) = _forwardAddress.call{value: msg.value}("");
        require(success, "Failed to forward payment");
    }

    function payRun(bytes12 id) external payable {
        require(msg.value > 0, "You need to send some ether");
        emit RunPayment(msg.sender, msg.value, id);
        _forwardPayment(); // Forward the received Ether
    }

    receive() external payable {}

    fallback() external payable {}

    // Allow the owner to recover Ether sent to the contract
    function withdrawEther(
        address payable to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        to.transfer(amount);
    }

    // Allow the owner to recover ERC20 tokens sent to the contract
    function withdrawERC20(
        address tokenAddress,
        address to,
        uint256 amount
    ) external onlyOwner nonReentrant {
        IERC20 token = IERC20(tokenAddress);
        uint256 contractBalance = token.balanceOf(address(this));
        require(amount <= contractBalance, "Insufficient token balance");
        token.safeTransfer(to, amount);
    }
}
