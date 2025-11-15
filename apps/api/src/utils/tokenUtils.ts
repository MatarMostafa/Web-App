import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret";

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid access token");
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

export const decodeToken = (token: string) => {
  return jwt.decode(token);
};