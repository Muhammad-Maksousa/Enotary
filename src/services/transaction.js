const prisma = require("../../prisma/client");

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
                notary: true,
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
            throw new Error("Transaction not found");
        }

        if (transaction.notaryId) {
            throw new Error("Transaction already claimed");
        }

        return prisma.transaction.update({
            where: { id: transactionId },
            data: {
                notaryId,
                status: "asd"
            }
        });
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
}

module.exports = TransactionService;