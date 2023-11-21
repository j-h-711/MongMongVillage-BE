const { User } = require("./model/user.schema");
const bcrypt = require("bcrypt");

class UserService {
  // 회원 생성
  async createUser(userInfo) {
    if (!userInfo.password) {
      throw new Error("Password is required.");
    }
    const hashedPassword = await bcrypt.hash(userInfo.password, 10);
    userInfo.password = hashedPassword;
    const user = await User.create(userInfo);
    return user;
  }

  // 사용자 인증
  async authenticateUser(email, password) {
    const userEmail = await User.findOne({ email });

    if (!userEmail) {
      return { success: false, fail: "email" };
    }

    const passwordMatch = await bcrypt.compare(password, userEmail.password);
    if (!passwordMatch) {
      return { success: false, fail: "password" };
    }
    return { success: true, user: userEmail };
  }

  // 회원 정보 조회
  async getUserById(userId) {
    return User.findById(userId);
  }
}

module.exports = new UserService();
