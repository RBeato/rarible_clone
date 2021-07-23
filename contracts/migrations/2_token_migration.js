const RaribleToken = artifacts.require("RaribleToken");

module.exports = function (deployer) {
  deployer.deploy(RaribleToken);
};
