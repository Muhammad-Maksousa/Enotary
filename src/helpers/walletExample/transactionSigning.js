import { ethers } from "ethers";


const PRIVATE_KEY = "0x597e1a6216ac0f00107c32fa6b8acb6ffa5e5d3063cf76bd099aa1d102d6d605";

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
            name: "transactionSignerId",
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

const message = {
    transactionId: "5ac1064a-8e43-45c9-a6f5-b9105f6ac21a",
    transactionSignerId: "380a22de-6643-4733-b71a-88d61a988591",
    documentHash: "0xa9b5dd3443609ee9ea61ee077bb2630e2d1aa435dd9079dd00da41aa0611d75f",
    role: "SELLER"
};

async function main() {

    console.log("Wallet:", wallet.address);

    const signature = await wallet.signTypedData(domain, types, message);

    const recovered = ethers.verifyTypedData(domain, types, message, signature);
    
    console.log("\nSignature:");
    console.log(signature);

}


main();

