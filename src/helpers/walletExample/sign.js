// sign.js
const { Wallet } = require("ethers");
/*
Address: 0x2F6332083e5608B18B908956240E322CC48057CF
Private Key: 0x597e1a6216ac0f00107c32fa6b8acb6ffa5e5d3063cf76bd099aa1d102d6d605
Public Key: 0x045c75bbc5a46f46a667a3de45f1beceb04a4bc9dcacaf67d98908d1c1675e4726c4ade1ae9122a4c23ec9578f455d05d8dfe67e9223a45c455a21de5d50af4426
*/



/*diaa

Address: 0xd4CA79B4AaDD7c7616D7Fb8d3188c55BAbC5c8Fc
Private Key: 0x8ad3ef2f199865de05f6d789f0dff9980afc276e129ebde1b6d2744e3d97ccfc
Public Key: 0x0447b3033a446e81cd5c4bfcf809a3f7831a009ab997499cb565bf70613ddab5b355050a8cb00f3be661998b936c8d0fa574f41dc85935839d26b8038c267f05ef
*/


/*random
Address: 0x83B2BB1875496A72a43F0245ef763cc0077A3AC6
Private Key: 0x1d543e9379ee2faa38cbf32b3ccaed48d5dd951e9532e01d20caf536b7b963e0
Public Key: 0x04b8525c6ebddcf232841b5376594352b6bb35699e8bcc659951bd418a45f9631388ba0c104abb9f1b137d87b23c0973a5158d1bddee6f65d31cf34305f8118bbc
 */
const privateKey = "0x8ad3ef2f199865de05f6d789f0dff9980afc276e129ebde1b6d2744e3d97ccfc";

const wallet = new Wallet(privateKey);

const message = `localhost:3000 wants you to sign in with your Ethereum account:\n0xd4CA79B4AaDD7c7616D7Fb8d3188c55BAbC5c8Fc\n\nSign in to backend\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 11155111\nNonce: MUzZZp26wh5fYiDmw\nIssued At: 2026-06-10T22:07:40.853Z`;

async function main() {


    // SIGN
    const signature =
        await wallet.signMessage(message);

    console.log("\nMESSAGE:\n");
    console.log(message);

    console.log("\nSIGNATURE:\n");
    console.log(signature);

    console.log("\nREQUEST BODY:\n");

    console.log(
        JSON.stringify(
            {
                message,
                signature
            },
            null,
            2
        )
    );
}

main().catch(console.error);