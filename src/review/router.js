const express = require("express");
const asyncHandler = require("../utils/async-handler");
const { Review } = require("./model/review.schema");
const ReviewService = require("./service");
const JwtMiddleware = require("../middleware/jwt-handler");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 이미지를 저장할 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // 파일명 설정 (현재 시간 + 원본 파일명)
  },
});

const upload = multer({ storage: storage });

// 리뷰 작성
router.post(
  "/",
  JwtMiddleware.checkToken,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    try {
      const { title, content, rating } = req.body;
      const userId = req.token.userId;

      // 이미지 데이터
      const imageBuffer = req.file.buffer;

      // 이미지를 업로드하고 URL을 받아온다
      const uploadedURL = await uploadImageToServer(imageBuffer);

      const createReview = await ReviewService.createReview({
        user_id: userId,
        title,
        content,
        rating,
        images: [uploadedURL], // 이미지 경로를 배열에 추가
      });

      res.status(201).json({
        status: 201,
        message: "리뷰가 작성되었습니다",
        data: createReview,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: 400,
        message: "Error",
        error: error.message,
      });
    }
  })
);

// 이미지 업로드 함수
async function uploadImageToServer(imageBuffer) {
  // 이미지를 서버에 업로드하고 URL을 반환하는 로직이 들어가야 함
  // 실제 서비스에서는 이미지 업로드 서비스를 사용해야 함
  // 여기서는 단순히 이미지를 받아와서 그대로 반환하는 가상의 함수
  return "uploads/" + Date.now() + "-uploaded.jpg";
}

// 나머지 라우터와 모델은 동일하게 유지

// 리뷰 리스트 조회
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const reviews = await ReviewService.getAllReviews();
      res.status(200).json({
        status: 200,
        message: "Success",
        data: reviews,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  })
);

// 리뷰 수정 - 400에러, 코드 수정하기
router.put(
  "/:reviewId",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    try {
      const reviewId = req.token.userId;
      const updatedReview = await ReviewService.updateReview(
        reviewId,
        req.body
      );

      res.status(201).json({
        status: 201,
        message: "리뷰가 수정되었습니다",
        data: updatedReview,
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: 400,
        message: "Error",
        error: error.message,
      });
    }
  })
);

router.delete(
  "/:reviewId",
  JwtMiddleware.checkToken,
  asyncHandler(async (req, res) => {
    const deletedReview = await ReviewService.deleteReview(req.token.reviewId);
    if (deletedReview) {
      res.status(200).json({
        status: 200,
        message: "게시글이 삭제되었습니다.",
        data: deletedReview,
      });
    } else {
      // 삭제된 게시글이 없는 경우
      res.status(404).json({
        status: 404,
        message: "게시글이 존재하지 않습니다.",
      });
    }
  })
);

module.exports = router;
