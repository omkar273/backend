import { Request, Response } from 'express';
import User from '../../models/AuthModels/userModel.js';
import OtpModel from '../../models/AuthModels/otpModel.js';
import ApiError from './../../utils/api_error.js';
import ApiResponse from './../../utils/api_success.js';
import asyncHandler from './../../utils/asynchandler.js';
import generateAccessAndRefreshTokens from '../../utils/jwt/generateToken.js';

interface UserLoginRequestBody {
  mb_no: string;
  otp: string;
}

const userLogin = asyncHandler(
  async (req: Request<{}, {}, UserLoginRequestBody>, res: Response) => {
    const { mb_no, otp } = req.body;

    if (!mb_no || !otp) {
      throw new ApiError("Mobile number and OTP are required", 400);
    }

    console.log('mb_no', mb_no);
    console.log('otp', otp);

    const user = await User.findOne({ mb_no });
    console.log(user);


    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const otpEntry = await OtpModel.findOne({ mb_no });

    if (!otpEntry || otpEntry.otp !== otp) {
      throw new ApiError("Invalid OTP", 404);
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

    await OtpModel.deleteOne({ mb_no });

    res.status(200).json(new ApiResponse({
      user,
      accessToken,
      refreshToken
    }, 'User logged in successfully',
    ));
  })

export default userLogin;
