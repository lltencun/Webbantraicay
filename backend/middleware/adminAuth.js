import jwt from "jsonwebtoken";

export const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Đăng nhập lại." });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (
      token_decode.email !== process.env.AMIND_EMAIL ||
      token_decode.password !== process.env.ADMINPASSWORD
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Truy cập bị từ chối." });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Removed default export since we're using named export
