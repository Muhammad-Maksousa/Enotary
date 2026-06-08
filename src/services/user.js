/*const CustomError = require("../helpers/errors/custom-errors");
const errors = require("../helpers/errors/errors.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secretKey = require("../helpers/db/config.secret");

class UserService {
    constructor({ username, password}) {
        this.username = username;
        this.password = password;
    }
    async add() {
        if (!this.username || !this.password) {
            throw new CustomError(errors.You_Should_fill_All_The_Filds)
        }
        return await User.create({
            username: this.username,
            password: this.password,
        });
    }
    
    
}
module.exports = UserService;
*/