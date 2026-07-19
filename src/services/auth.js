const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { SiweMessage, generateNonce } = require("siwe");
const { getAddress } = require("ethers");

const prisma = require("../../prisma/client");

class AuthService {

    async generateSiweMessage(walletAddress) {

        const address = getAddress(walletAddress);

        const nonce = generateNonce();

        const siweMessage = new SiweMessage({
            domain: process.env.APP_DOMAIN,
            address,
            statement: "Sign in to backend",
            uri: process.env.APP_URI,
            version: "1",
            chainId: 1337,
            nonce,
        });

        await prisma.nonce.create({
            data: {
                nonce,
                address,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            }
        });

        return {
            message: siweMessage.prepareMessage()
        };
    }


    async validateSignature({ message, signature }) {

        const siweMessage = new SiweMessage(message);

        const result = await siweMessage.verify({
            signature,
            domain: process.env.APP_DOMAIN,
            nonce: siweMessage.nonce
        });

        if (!result.success) {
            throw new Error("Invalid signature");
        }

        const address = getAddress(siweMessage.address);
        const nonce = siweMessage.nonce;

        const nonceRecord = await prisma.nonce.findFirst({
            where: {
                nonce,
                address
            }
        });

        if (!nonceRecord) {
            throw new Error("Nonce not found");
        }
        // Prevent replay attack
        await prisma.nonce.delete({
            where: {
                id: nonceRecord.id
            }
        });
        if (nonceRecord.expiresAt < new Date()) {
            throw new Error("Nonce expired");
        }

        return { address };
    }


    async register({ nationalId, message, signature, fullName}) {

        const { address } =
            await this.validateSignature({ message, signature });

        const nationalIdHash =
            this.hashNationalId(nationalId);

        const existingUser =
            await prisma.user.findUnique({
                where: { nationalIdHash }
            });

        if (existingUser) {
            throw new Error("National ID already registered");
        }

        const existingWallet =
            await prisma.wallet.findUnique({
                where: { address }
            });

        if (existingWallet) {
            throw new Error("Wallet already registered");
        }

        const user =
            await prisma.user.create({
                data: {
                    nationalIdHash,
                    fullName,
                    wallets: {
                        create: {
                            address,
                        }
                    }
                },
                include: { wallets: true }
            });

        const wallet = user.wallets[0];

        const token = jwt.sign(
            {
                userId: user.id,
                walletId: wallet.id,
                address
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        return { token, user };
    }


    async login({ message, signature }) {

        const { address } =
            await this.validateSignature({ message, signature });

        const wallet =
            await prisma.wallet.findUnique({
                where: { address },
                include: { user: true }
            });

        if (!wallet) {
            throw new Error("Wallet not found");
        }

        if (!wallet.isActive || !wallet.user.isActive) {
            throw new Error("Inactive account");
        }

        await prisma.user.update({
            where: { id: wallet.user.id },
            data: { lastLoginAt: new Date() }
        });

        const token = jwt.sign(
            {
                userId: wallet.user.id,
                walletId: wallet.id,
                address
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        return { token };
    }


    hashNationalId(nationalId) {

        return crypto
            .createHash("sha256")
            .update(
                nationalId +
                process.env.NATIONAL_ID_SALT
            )
            .digest("hex");
    }
}

module.exports = AuthService;