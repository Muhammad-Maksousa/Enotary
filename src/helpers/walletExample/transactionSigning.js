import { ethers } from "ethers";
//online user 0x1d543e9379ee2faa38cbf32b3ccaed48d5dd951e9532e01d20caf536b7b963e0
//0xbc980b6e588726a68f373ef1ebb0a6a155c400922724e1ce4f5f03ca26dc323b
const PRIVATE_KEY = "0xbc980b6e588726a68f373ef1ebb0a6a155c400922724e1ce4f5f03ca26dc323b";

const wallet = new ethers.Wallet(PRIVATE_KEY);

const domain = {
    name: "Digital Notary",
    version: "1",
    chainId: 1337,
    verifyingContract:
        "0x0000000000000000000000000000000000000000"
};

const types = {
    Document: [
        {
            name: "transactionId",
            type: "string"
        },
        {
            name: "documentHash",
            type: "bytes32"
        },
        {
            name: "role",
            type: "string"
        }
    ]

};
//transactionSignerId: "80b7f665-f165-4e1d-975f-bf4cb40e8d2a",
const message = {
    transactionId: "6469b692-51b2-4b67-9530-196b1854ceb0",
    documentHash: "0xa9b5dd3443609ee9ea61ee077bb2630e2d1aa435dd9079dd00da41aa0611d75f",
    role: "Notary"
};

async function main() {

    console.log("Wallet:", wallet.address);

    const signature = await wallet.signTypedData(domain, types, message);

    const recovered = ethers.verifyTypedData(domain, types, message, signature);
    
    console.log("\nSignature:");
    console.log(signature);

}


main();

