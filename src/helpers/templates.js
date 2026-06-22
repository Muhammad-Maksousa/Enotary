export const TEMPLATES = {
    PROPERTY_SALE_V1 : {
        templateId: "PROPERTY_SALE_V1",
        name: "Property Sale Agreement",
        description: "Transfer ownership of a property between seller and buyer",

        body: {
            agreementDate: "",
            property: {
                address: "",
                city: "",
                country: ""
            },
            seller: {
                fullName: ""
            },
            buyer: {
                fullName: ""
            },
            sale: {
                amount: 0,
                currency: ""
            }
        },

        signers: [
            {
                role: "seller",
                walletId: ""
            },
            {
                role: "buyer",
                walletId: ""
            }
        ]
    },

    GENERAL_POWER_OF_ATTORNEY_V1 : {
        templateId: "GENERAL_POWER_OF_ATTORNEY_V1",
        name: "General Power of Attorney",
        description: "Authorizes an agent to act on behalf of the principal",

        body: {
            agreementDate: "",
            principal: {
                fullName: ""
            },
            agent: {
                fullName: ""
            },
            powers: {
                description: ""
            },
            validity: {
                startDate: "",
                endDate: ""
            },
            jurisdiction: {
                country: ""
            }
        },

        signers: [
            {
                role: "principal",
                walletId: ""
            },
            {
                role: "agent",
                walletId: ""
            }
        ]
    },

    VEHICLE_TRANSFER_V1 : {
        templateId: "VEHICLE_TRANSFER_V1",
        name: "Vehicle Transfer Agreement",
        description: "Transfers ownership of a vehicle from seller to buyer",

        body: {
            agreementDate: "",
            vehicle: {
                make: "",
                model: "",
                year: 0,
                vin: "",
                plateNumber: ""
            },
            seller: {
                fullName: ""
            },
            buyer: {
                fullName: ""
            },
            sale: {
                amount: 0,
                currency: ""
            }
        },

        signers: [
            {
                role: "seller",
                walletId: ""
            },
            {
                role: "buyer",
                walletId: ""
            }
        ]
    }
};