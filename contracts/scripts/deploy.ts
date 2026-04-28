import { ethers } from "hardhat";

async function main() {
  const profiles = await ethers.deployContract("EposProfiles");
  await profiles.waitForDeployment();

  const reputation = await ethers.deployContract("EposReputation");
  await reputation.waitForDeployment();

  const requests = await ethers.deployContract("EposRequests", [
    await profiles.getAddress(),
    await reputation.getAddress(),
  ]);
  await requests.waitForDeployment();

  const setRequestsContractTx = await reputation.setRequestsContract(await requests.getAddress());
  await setRequestsContractTx.wait();

  console.log("EposProfiles:", await profiles.getAddress());
  console.log("EposReputation:", await reputation.getAddress());
  console.log("EposRequests:", await requests.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
