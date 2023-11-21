const express = require("express");
const asyncHandler = require("../utils/async-handler");
const router = express.Router();
const userService = require("./service");
const { JoiSchema: userJoiSchema } = require("./model/user.schema");
const JWT = require("../utils/jwt");

// 회원가입
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    try {
      const { error } = userJoiSchema.validate(req.body);
      // 입력 데이터 유효성 검사
      if (error) {
        return res.status(400).json({
          message: "Validation Error",
          error: error.details.map((detail) => detail.message),
        });
      }

      const user = await userService.createUser(req.body);
      // 회원가입 성공
      res.status(201).json({
        status: 201,
        message: "Success",
        data: user,
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.email) {
        // 이메일 중복 에러
        return res.status(400).json({
          status: 400,
          message: "Duplicate email",
          error: "This email address is already registered.",
        });
      }
      // 기타 에러는 콘솔에 로깅
      console.error(error);
      res.status(400).json({
        status: 400,
        message: "Error",
        error: "An error occurred while processing your request.",
      });
    }
  })
);

// 로그인
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const userLogin = await userService.authenticateUser(email, password);

    // 로그인 안됨
    if (!userLogin.success) {
      // 가입되지 않은 이메일
      if (userLogin.fail == "email") {
        return res.status(401).json({
          status: 401,
          message: "가입되지 않은 이메일입니다.",
        });
      } else if (userLogin.fail == "password") {
        return res.status(401).json({
          status: 401,
          message: "비밀번호가 올바르지 않습니다.",
        });
      }
    }

    const { user } = userLogin;

    // user 객체 확인 후 _id를 읽어옴
    const userId = user && user._id ? user._id : null;

    // user 객체 확인 후 email을 읽어옴
    const userEmail = user && user.email ? user.email : null;

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const token = JWT.createToken(tokenPayload);

    res.status(200).json({
      status: 200,
      message: "success",
      data: token,
    });
  })
);

module.exports = router;
