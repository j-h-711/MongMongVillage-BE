const express = require("express");
const asyncHandler = require("../utils/async-handler");
const router = express.Router();
const hashPassword = require("../utils/hash-password");
const User = require("./model/user.schema");
// const passport = require("passport");
const { setUserToken } = require("../utils/jwt");
const userService = require("./service");
const { JoiSchema: userJoiSchema } = require("./model/user.schema");

// 회원가입
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    try {
      // 입력 데이터 유효성 검사
      const { error } = userJoiSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: "Validation Error",
          error: error.details.map((detail) => detail.message),
        });
      }

      const user = await userService.createUser(req.body);
      // 회원가입 성공
      res.status(201).json({
        message: "Success",
        data: user,
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.email) {
        // 이메일 중복 에러
        return res.status(400).json({
          message: "Duplicate email",
          error: "This email address is already registered.",
        });
      }
      // 기타 에러는 콘솔에 로깅
      console.error(error);
      res.status(400).json({
        message: "Error",
        error: "An error occurred while processing your request.",
      });
    }
  })
);

module.exports = router;
