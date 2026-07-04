const prisma = require("../../prisma/client");
const CustomError = require("../helpers/errors/custom-errors");
const Error = require("../helpers/errors/errors.json");
const transactionStatus = require("../helpers/transactionStatus");
const crypto = require("node:crypto");
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
                status: notaryAction
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
}

module.exports = TransactionService;