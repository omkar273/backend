import jwt from 'jsonwebtoken';
import { IUser } from './../../models/AuthModels/userModel.js';



const generateAccessAndRefreshTokens = (user: IUser): {
  accessToken: string;
  refreshToken: string;
} => {
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRY }
  );

  return { accessToken, refreshToken };
};
export default generateAccessAndRefreshTokens;