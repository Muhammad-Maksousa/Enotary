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

/* notary wallet
Address: 0x8552237949170E17bCCBCba8a3A223EF2331f1c0
Private Key: 0x2e76459313fca3f6e0912afb850aeb6f09b5d21fb770dd2303b9cfe365305d12
Public Key: 0x04f472938eaf2e98225380bd4cafddefa50c17a903ca278bde4409b67381ac2b666a34876ad21011368ff12f7bff23b69d51fd4029a099be4106819cf7d67fe450
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDU2YTUzZS1jMzI1LTRjMmUtYTE1MC0zOWQ5ZTg2YjU3YTYiLCJ3YWxsZXRJZCI6IjkzMzE4MmEzLWVmYWQtNDQ5NC04YTMxLTVlODRhZWEyODVhMSIsImFkZHJlc3MiOiIweDg1NTIyMzc5NDkxNzBFMTdiQ0NCQ2JhOGEzQTIyM0VGMjMzMWYxYzAiLCJpYXQiOjE3ODE5NDUyMTksImV4cCI6MTc4NDUzNzIxOX0.nbU50_sDVWDaAw6oFmbTx_I_Vm6X92ce2GoGFDb1PDU
*/


/* online user
Address: 0x83B2BB1875496A72a43F0245ef763cc0077A3AC6
Private Key: 0x1d543e9379ee2faa38cbf32b3ccaed48d5dd951e9532e01d20caf536b7b963e0
Public Key: 0x04b8525c6ebddcf232841b5376594352b6bb35699e8bcc659951bd418a45f9631388ba0c104abb9f1b137d87b23c0973a5158d1bddee6f65d31cf34305f8118bbc
id: 8d7489a2-789a-42dc-bf31-38bef662713a
address: 0x83B2BB1875496A72a43F0245ef763cc0077A3AC6
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0MWY5NjRhMS03MWIyLTRlMTktYmI5OC1mNzI4OTBhY2NjOWUiLCJ3YWxsZXRJZCI6IjhkNzQ4OWEyLTc4OWEtNDJkYy1iZjMxLTM4YmVmNjYyNzEzYSIsImFkZHJlc3MiOiIweDgzQjJCQjE4NzU0OTZBNzJhNDNGMDI0NWVmNzYzY2MwMDc3QTNBQzYiLCJpYXQiOjE3ODE1Mzc5ODMsImV4cCI6MTc4NDEyOTk4M30.CSYL8e4uulji63MjRaoPzq22LnNzCqdGutEs2PotnJk
 */
const privateKey = "0x2e76459313fca3f6e0912afb850aeb6f09b5d21fb770dd2303b9cfe365305d12";

const wallet = new Wallet(privateKey);

const message = `localhost:3000 wants you to sign in with your Ethereum account:\n0x8552237949170E17bCCBCba8a3A223EF2331f1c0\n\nSign in to backend\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 11155111\nNonce: 9T4b81jSWX59mWlNm\nIssued At: 2026-06-20T08:44:30.538Z`;

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