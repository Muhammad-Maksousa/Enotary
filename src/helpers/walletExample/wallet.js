const { Wallet } = require("ethers");

const wallet = new Wallet(
  "0x8ad3ef2f199865de05f6d789f0dff9980afc276e129ebde1b6d2744e3d97ccfc"
);

console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Public Key:", wallet.signingKey.publicKey);