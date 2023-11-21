const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

class JWT {
  // 토큰 생성
  static createToken = (payload) => {
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    return token;
  };
}

module.exports = JWT;
