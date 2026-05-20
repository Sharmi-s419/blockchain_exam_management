import hre from "hardhat";

async function main() {
  const ExamRecords = await hre.ethers.deployContract("ExamRecords");
  await ExamRecords.waitForDeployment();
  console.log(`ExamRecords Smart Contract deployed securely to ${ExamRecords.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
