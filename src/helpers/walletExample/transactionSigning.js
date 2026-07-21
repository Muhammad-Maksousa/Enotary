import { ethers } from "ethers";


const PRIVATE_KEY = "0x1d543e9379ee2faa38cbf32b3ccaed48d5dd951e9532e01d20caf536b7b963e0";

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
    transactionId: "3c4baf94-67c4-45b4-a879-78a9168c6d32",
    transactionSignerId: "4fd64754-e319-4208-8104-b131912ed832",
    documentHash: "0x91a821d0428a14792c77d66b7ae5128243bff920f5b923cfb6398be1f67fa682",
    role: "bayer"
};

async function main() {

    console.log("Wallet:", wallet.address);

    const signature = await wallet.signTypedData(domain, types, message);

    const recovered = ethers.verifyTypedData(domain, types, message, signature);
    
    console.log("\nSignature:");
    console.log(signature);

}


main();

