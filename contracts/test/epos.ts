import { expect } from "chai";
import { ethers } from "hardhat";

describe("Epos", function () {
  async function deployEpos() {
    const [owner, pelz, amaka] = await ethers.getSigners();

    const Profiles = await ethers.getContractFactory("EposProfiles");
    const profiles = await Profiles.deploy();

    const Reputation = await ethers.getContractFactory("EposReputation");
    const reputation = await Reputation.deploy();

    const Requests = await ethers.getContractFactory("EposRequests");
    const requests = await Requests.deploy(await profiles.getAddress(), await reputation.getAddress());
    await reputation.setRequestsContract(await requests.getAddress());

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();

    return { owner, pelz, amaka, profiles, reputation, requests, usdc };
  }

  it("claims a username once per wallet", async function () {
    const { pelz, profiles } = await deployEpos();

    await expect(profiles.connect(pelz).claimUsername("pelz"))
      .to.emit(profiles, "UsernameClaimed")
      .withArgs(pelz.address, "pelz");

    expect(await profiles.walletOf("pelz")).to.equal(pelz.address);
    expect(await profiles.usernameByWallet(pelz.address)).to.equal("pelz");
    await expect(profiles.connect(pelz).claimUsername("pelz2")).to.be.revertedWithCustomError(
      profiles,
      "WalletAlreadyClaimed",
    );
  });

  it("rejects invalid or taken usernames", async function () {
    const { pelz, amaka, profiles } = await deployEpos();

    await expect(profiles.connect(pelz).claimUsername("PeLz")).to.be.revertedWithCustomError(
      profiles,
      "InvalidUsername",
    );
    await profiles.connect(pelz).claimUsername("pelz");
    await expect(profiles.connect(amaka).claimUsername("pelz")).to.be.revertedWithCustomError(
      profiles,
      "UsernameTaken",
    );
  });

  it("creates and fulfills a USDC request", async function () {
    const { pelz, amaka, profiles, requests, reputation, usdc } = await deployEpos();
    const amount = ethers.parseUnits("15", 6);

    await profiles.connect(pelz).claimUsername("pelz");
    await expect(requests.connect(pelz).createRequest(await usdc.getAddress(), amount, "school fees"))
      .to.emit(requests, "RequestCreated")
      .withArgs(1, pelz.address, await usdc.getAddress(), amount, "pelz", "school fees");

    await usdc.mint(amaka.address, amount);
    await usdc.connect(amaka).approve(await requests.getAddress(), amount);

    await expect(requests.connect(amaka).fulfillRequest(1))
      .to.emit(requests, "RequestFulfilled")
      .withArgs(1, amaka.address, pelz.address, amount);

    const request = await requests.requests(1);
    expect(request.status).to.equal(1);
    expect(await usdc.balanceOf(pelz.address)).to.equal(amount);
    expect(await reputation.fulfilledCountByGiver(amaka.address)).to.equal(1);
    expect(await reputation.receivedCountByReceiver(pelz.address)).to.equal(1);
  });

  it("blocks request creation before username claim", async function () {
    const { pelz, requests, usdc } = await deployEpos();

    await expect(
      requests.connect(pelz).createRequest(await usdc.getAddress(), ethers.parseUnits("15", 6), "school fees"),
    ).to.be.revertedWithCustomError(requests, "UsernameNotClaimed");
  });

  it("blocks fulfilling your own request", async function () {
    const { pelz, profiles, requests, usdc } = await deployEpos();
    const amount = ethers.parseUnits("15", 6);

    await profiles.connect(pelz).claimUsername("pelz");
    await requests.connect(pelz).createRequest(await usdc.getAddress(), amount, "school fees");

    await expect(requests.connect(pelz).fulfillRequest(1)).to.be.revertedWithCustomError(
      requests,
      "CannotFulfillOwnRequest",
    );
  });
});
