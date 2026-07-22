const prisma = require("../../prisma/client");
const CustomError = require("../helpers/errors/custom-errors");
const Error = require("../helpers/errors/errors.json");
const transactionStatus = require("../helpers/transactionStatus");
const crypto = require("node:crypto");
const { ethers } = require("ethers");
const { error } = require("node:console");
const CHAIN_ID = Number(process.env.CHAIN_ID);
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
class TransactionService {

    async create({ creatorId, templateId, body, signers }) {
        const walletIds = signers.map(s => s.walletId);

        // Prevent duplicate signers
        const uniqueWalletIds = new Set(walletIds);

        if (uniqueWalletIds.size !== walletIds.length) {
            throw new CustomError(errors.Duplicate_Signer);
        }

        // Validate wallets and owners
        const wallets = await prisma.wallet.findMany({
            where: {
                id: {
                    in: walletIds
                },
                isActive: true,
                user: {
                    isActive: true
                }
            },
            select: {
                id: true
            }
        });

        if (wallets.length !== walletIds.length) {
            throw new CustomError(errors.Invalid_Signer_Wallet);
        }

        return prisma.transaction.create({
            data: {
                creatorId,
                templateId,
                body,
                status: "PENDING_NOTARY",

                signers: {
                    create: signers.map(signer => ({
                        walletId: signer.walletId,
                        role: signer.role
                    }))
                }
            },
            include: {
                creator: {
                    select: {
                        id: true
                    }
                },
                signers: {
                    include: {
                        wallet: {
                            select: {
                                id: true,
                                address: true,
                            }
                        }
                    }
                }
            }
        });
    }

    async getById(id) {
        return prisma.transaction.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        role: true,
                        fullName: true
                    }
                },
                notary: {
                    select: {
                        id: true,
                        role: true,
                        fullName: true
                    }
                },
                signers: {
                    select: {
                        id: true,
                        role: true,
                        signature: true,
                        signedAt: true,
                        walletId: true,
                        wallet: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                }
            }
        });
    }

    async getTransactionsByStatus(userId, status) {

        return prisma.transaction.findMany({
            where: {
                ...(status && { status }),
            },
            select: {
                status: true,
                id: true,
                templateId: true,
                signers: {
                    select: {
                        role: true,
                        wallet: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async update(transactionId, userId, data) {

        const transaction =
            await prisma.transaction.findUnique({
                where: { id: transactionId }
            });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        if (transaction.creatorId !== userId) {
            throw new Error("Unauthorized");
        }

        if (transaction.notaryConfirmedAt) {
            throw new Error("Transaction is immutable");
        }

        return prisma.transaction.update({
            where: { id: transactionId },
            data: {
                templateId: data.templateId,
                body: data.body
            }
        });
    }

    async cancel(transactionId, userId) {

        const transaction =
            await prisma.transaction.findUnique({
                where: { id: transactionId }
            });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        if (transaction.creatorId !== userId) {
            throw new Error("Unauthorized");
        }

        if (transaction.notaryId) {
            throw new Error(
                "Cannot cancel after notary assignment"
            );
        }

        return prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: "REJECTED"
            }
        });
    }

    async claim(transactionId, notaryId) {

        const transaction =
            await prisma.transaction.findUnique({
                where: { id: transactionId }
            });

        if (!transaction) {
            throw new CustomError(Error.Transaction_Not_Found);
        }

        if (transaction.notaryId) {
            throw new CustomError(Error.Transaction_Already_Claimed);
        }

        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                notaryId,
                status: transactionStatus.CLAIMED_BY_NOTARY
            }
        });
        return "Transaction Claimed By Notary Successfully";
    }

    async getCreatedTransactions(userId) {

        return prisma.transaction.findMany({
            where: {
                creatorId: userId,
            },

            select: {
                status: true,
                id: true,
                templateId: true,
                signers: {
                    select: {
                        role: true,
                        wallet: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getNotaryTransactions(notaryId) {
        return prisma.transaction.findMany({
            where: {
                notaryId: notaryId,
            },

            select: {
                status: true,
                id: true,
                templateId: true,
                signers: {
                    select: {
                        role: true,
                        wallet: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async notaryAction(id, action, notaryId) {
        const transaction = await prisma.transaction.findUnique({
            where: { id }
        });

        if (transaction.notaryId !== notaryId)
            throw new CustomError(Error.Not_Authorized);

        let notaryAction;
        if (action == "ACCEPT")
            notaryAction = transactionStatus.WAITING_FOR_SIGNERS;
        else
            notaryAction = transactionStatus.REJECTED;

        await prisma.transaction.update({
            where: { id },
            data: {
                status: notaryAction,
                notaryConfirmedAt: new Date()
            }
        });
        return "Notary Action Completed Successfully";
    }

    async getMyAllTransactions(userId) {
        return await prisma.transaction.findMany({
            where: {
                OR: [
                    {
                        creatorId: userId,
                    },
                    {
                        signers: {
                            some: {
                                wallet: {
                                    userId: userId,
                                },
                            },
                        },
                    },
                ],
            },

            select: {
                status: true,
                id: true,
                templateId: true,
                signers: {
                    select: {
                        role: true,
                        wallet: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async getAllTransactionsByNid(NID) {

        const nationalIdHash = crypto
            .createHash("sha256")
            .update(NID + process.env.NATIONAL_ID_SALT)
            .digest("hex");

        return await prisma.transaction.findMany({
            where: {
                OR: [
                    {
                        creator: {
                            nationalIdHash: nationalIdHash,
                        },
                    },
                    {
                        signers: {
                            some: {
                                wallet: {
                                    user: {
                                        nationalIdHash: nationalIdHash,
                                    },
                                },
                            },
                        },
                    },
                ],
            },

            select: {
                status: true,
                id: true,
                templateId: true,
                signers: {
                    select: {
                        role: true,
                        wallet: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async getAllTransactionsByWalletAddress(walletAddress) {
        console.log("wallet address: ");

        console.log(walletAddress);

        const wallet = await prisma.wallet.findUnique({
            where: { address: walletAddress },
        });
        console.log("wallet: ");

        console.log(wallet);

        const tx = await prisma.transaction.findMany({
            where: {
                signers: {
                    some: {
                        wallet: {
                            address: walletAddress,
                        },
                    },
                },
            },
        });
        console.log("tx length: ");

        console.log(tx.length);


        return await prisma.transaction.findMany({
            where: {
                OR: [
                    {
                        signers: {
                            some: {
                                wallet: {
                                    address: walletAddress,
                                },
                            },
                        },
                    },
                    {
                        creator: {
                            wallets: {
                                some: {
                                    address: walletAddress,
                                },
                            },
                        },
                    },
                ],
            },

            select: {
                status: true,
                id: true,
                templateId: true,
                signers: {
                    select: {
                        role: true,
                        wallet: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async getTheNumberOfTransactionsByStatus(status) {
        return await prisma.transaction.count({
            where: {
                status
            },
        });

        return {
            status,
            count,
        };
    }

    async getFinal(transactionId, walletAddress) {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId
            }
        });

        if (!transaction) {
            throw new CustomError(Error.Transaction_Not_Found);
        }

        if (transaction.status !== transactionStatus.WAITING_FOR_SIGNERS) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        const wallet = await prisma.wallet.findUnique({
            where: {
                address: walletAddress
            }
        });


        if (!wallet) {
            throw new CustomError(Error.The_User_Not_Found);
        }

        const transactionSigner = await prisma.transactionSigner.findUnique({
            where: {
                transactionId_walletId: {
                    transactionId: transaction.id,
                    walletId: wallet.id
                }
            }
        });


        if (!transactionSigner) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        if (transactionSigner.signature) {
            throw new CustomError(Error.Wallet_Already_Signed);
        }

        let documentHash = transaction.txHash;

        if (!documentHash) {

            documentHash = await this.hashDocument(transaction.body);

            await prisma.transaction.update({
                where: {
                    id: transaction.id
                },

                data: {
                    txHash: documentHash,
                    chainId: CHAIN_ID,
                    contractAddress: CONTRACT_ADDRESS
                }
            });
        }

        const domain = {
            name: "Digital Notary",
            version: "1",
            chainId: CHAIN_ID,
            verifyingContract: CONTRACT_ADDRESS
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
            transactionId: transaction.id,
            transactionSignerId: transactionSigner.id,
            documentHash: `0x${documentHash}`,
            role: transactionSigner.role
        };

        return {
            domain,
            types,
            primaryType: "Document",
            message
        };

    }

    async getFinalNotary(transactionId, walletAddress) {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId
            }
        });

        if (!transaction) {
            throw new CustomError(Error.Transaction_Not_Found);
        }

        if (transaction.status !== transactionStatus.WAITING_FOR_NOTARY_SIGNATURE) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        const unsignedSigners = this.validateAllSignersSigned(transaction.id);

        if (unsignedSigners > 0) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        if (!transaction.notaryId) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        const wallet = await prisma.wallet.findUnique({
            where: {
                address: walletAddress
            }
        });

        if (!wallet) {
            throw new CustomError(Error.The_User_Not_Found);
        }


        if (wallet.userId !== transaction.notaryId) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        if (transaction.notarySignature) {
            throw new CustomError(Error.Wallet_Already_Signed);
        }

        let documentHash = transaction.txHash;

        if (!documentHash) {
            documentHash = await this.hashDocument(transaction.body);

            await prisma.transaction.update({
                where: {
                    id: transaction.id
                },
                data: {
                    txHash: documentHash,
                    chainId: CHAIN_ID,
                    contractAddress: CONTRACT_ADDRESS
                }
            });
        }

        const domain = {
            name: "Digital Notary",
            version: "1",
            chainId: CHAIN_ID,
            verifyingContract: CONTRACT_ADDRESS
        };

        const types = {
            NotaryDocument: [
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

        const message = {
            transactionId: transaction.id,
            documentHash: `0x${documentHash}`,
            role: "Notary"
        };

        return {
            domain,
            types,
            primaryType: "NotaryDocument",
            message
        };
    }

    async signedNotaryTransaction(transactionId, walletAddress, signature) {

        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId
            }
        });

        console.log("transaction: ", transaction);


        if (!transaction) {
            throw new CustomError(Error.Transaction_Not_Found);
        }

        if (transaction.status !== transactionStatus.WAITING_FOR_NOTARY_SIGNATURE) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        if (!transaction.notaryId) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        const wallet = await prisma.wallet.findUnique({
            where: {
                address: walletAddress
            }
        });

        console.log("wallet: ", wallet);


        if (!wallet) {
            throw new CustomError(Error.The_User_Not_Found);
        }

        if (wallet.userId !== transaction.notaryId) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        if (transaction.notarySignature) {
            throw new CustomError(Error.Wallet_Already_Signed);
        }


        const unsignedSigners = await this.validateAllSignersSigned(transactionId);
        console.log("unsignedSigners: ", unsignedSigners);
        if (unsignedSigners > 0) {
            throw new CustomError(Error.Not_All_Signers_Have_Signed);
        }



        const signData = await this.getFinalNotary(transactionId, walletAddress);
        console.log("signData: ", signData);


        const recoveredAddress = ethers.verifyTypedData(
            signData.domain,
            signData.types,
            signData.message,
            signature
        );
        console.log("recoveredAddress: ", recoveredAddress);
        if (recoveredAddress !== wallet.address) {
            throw new CustomError(Error.Validation_Error);
        }

        await prisma.transaction.update({
            where: {
                id: transactionId
            },
            data: {
                notarySignature: signature,
                notarySignedAt: new Date(),
                status: transactionStatus.SUBMITTED
            }
        });

        return { success: true };
    }

    async signedTransaction(transactionId, walletAddress, signature) {

        const transaction =
            await prisma.transaction.findUnique({
                where: { id: transactionId }
            });


        if (!transaction) {
            throw new CustomError(Error.Transaction_Not_Found);
        }

        const wallet =
            await prisma.wallet.findUnique({
                where: {
                    address: walletAddress
                }
            });

        if (!wallet) {
            throw new CustomError(Error.The_User_Not_Found);
        }

        const transactionSigner = await prisma.transactionSigner.findUnique({
            where: {
                transactionId_walletId: {
                    transactionId,
                    walletId: wallet.id
                }
            }
        });


        if (!transactionSigner) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        if (transactionSigner.signature) {
            throw new CustomError(Error.You_Can_Not_Do_This);
        }

        const signData = await this.getFinal(transactionId, walletAddress);


        const recoveredAddress =
            ethers.verifyTypedData(
                signData.domain,
                signData.types,
                signData.message,
                signature
            );


        if (recoveredAddress !== wallet.address) {
            throw new CustomError(Error.Validation_Error);
        }

        await prisma.transactionSigner.update({
            where: {
                id: transactionSigner.id
            },
            data: {
                signature,
                signedAt: new Date()
            }
        });

        const unsignedSigners = await this.validateAllSignersSigned(transactionId);

        if (unsignedSigners == 0) {
            await prisma.transaction.update({
                where: {
                    id: transactionId
                },
                data: {
                    status: transactionStatus.WAITING_FOR_NOTARY_SIGNATURE
                }
            });
        }

        return { success: true };
    }

    async hashDocument(body) {

        const json = JSON.stringify(
            body,
            Object.keys(body).sort()
        );

        return crypto
            .createHash("sha256")
            .update(json)
            .digest("hex");
    }

    async validateAllSignersSigned(transactionId) {
        return prisma.transactionSigner.count({
            where: {
                transactionId,
                signature: null
            }
        });
    }
}

module.exports = TransactionService;