const hashPassword = require("../utils/hash-password");
const { User } = require("./model/user.schema");
const bcrypt = require("bcrypt");

class UserService {
  // 회원 생성
  async createUser(userInfo) {
    const hashedPassword = await bcrypt.hash(userInfo.password, 10);
    userInfo.password = hashedPassword;
    const user = await User.create(userInfo);
    return user;
  }

  // 사용자 인증
  async authenticateUser(email, password) {
    const userEmail = await User.findOne({ email });

    if (!userEmail) {
      return { success: false, fail: "가입되지 않은 이메일입니다" };
    }

    const passwordMatch = await bcrypt.compare(password, User.password);
    if (!passwordMatch) {
      return { success: falses, fail: "비밀번호가 일치하지 않습니다." };
    }
    return { success: true, userEmail };
  }
}

module.exports = new UserService();
