import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.models";
import ApiError from "../utils/apiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/apiResponse";

interface RegisterUserInput {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  email: string;
  password: string;
  profileImage?: Buffer; // local file path (from multer)
}

interface LoginResponse {
  user: any;
  token: string;
}

const generateToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

export const registerUser = async (data: RegisterUserInput) => {
  const {
    firstName,
    lastName,
    phone,
    address,
    email,
    password,
    profileImage,
  } = data;

  // ✅ Validate fields
  if (!firstName || !lastName || !phone || !address || !email || !password) {
    throw new ApiError(400, "Please fill all required fields.");
  }

  // ✅ Check existing user
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  let uploadedImageUrl: string | undefined;

  // ✅ Upload image (with safety)
  if (profileImage) {
    console.log("Uploading image to Cloudinary...");

    try {
      const uploadResult = await uploadOnCloudinary(profileImage, {
    folder: 'users',
    width: 300,
    height: 300,
  });


      uploadedImageUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Failed:", error);
      throw new ApiError(500, "Image upload failed");
    }
  }

  // ✅ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Create user
  const user = await User.create({
    firstName,
    lastName,
    phone,
    address,
    email,
    password: hashedPassword,
    profileImage: uploadedImageUrl,
  });

  const userData = user.toJSON();
  const { password: _password, profileImage: _profileImage, ...safeUser } = userData;

  return new ApiResponse(
    201, // ✅ FIXED
    { user: safeUser },
    "User registered successfully"
  );
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<ApiResponse<LoginResponse>> => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  if (user.isActive === false) {
    throw new ApiError(403, "Your account has been deactivated. Please contact support.");
  }

  const token = generateToken(user.id);

  // ✅ Optional: remove password before sending
  const userData = user.toJSON();
  const { password: _password, ...safeUser } = userData;

  // ✅ Correct ApiResponse usage
  return new ApiResponse(
    200,
    {
      user: safeUser,
      token,
    },
    "User login successfully",
  );
};

/**
 * Generate a password reset token for the given email.
 * Returns null if no user matches (caller should still respond generically to
 * avoid leaking which emails are registered).
 */
export const generateResetToken = async (
  email: string,
): Promise<{ resetToken: string; name: string; email: string } | null> => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return null;
  }

  // ✅ generate raw token (sent to user via email)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // ✅ hash token (store in DB)
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetToken = hashedToken;
  user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await user.save();

  return { resetToken, name: user.firstName, email: user.email };
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<ApiResponse<null>> => {
  // ✅ hash incoming token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    where: { resetToken: hashedToken },
  });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw new ApiError(400, "Invalid or expired token");
  }

  // ✅ update password
  user.password = await bcrypt.hash(newPassword, 10);

  // ✅ clear reset fields (IMPORTANT: use undefined, not null)
  user.resetToken = undefined as any;
  user.resetTokenExpiry = undefined as any;

  await user.save();

  return new ApiResponse(200, null, "Password reset successfully");
};

// Get Current User 

export const getCurrentUser = async (
  userId: number
): Promise<ApiResponse<any>> => {

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // ✅ remove password
  const userData = user.toJSON();
  const { password: _password, ...safeUser } = userData;

  return new ApiResponse(
    200,
    { user: safeUser },
    "User profile fetched successfully"
  );
};

// update profile
export const updateUserProfile = async (
  userId: number,
  data: Partial<RegisterUserInput>
): Promise<ApiResponse<any>> => {
  const { firstName, lastName, phone, address, profileImage } = data;

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // ✅ Upload new image if provided
  let uploadedImageUrl: string | undefined;

  if (profileImage) {
    const uploadResult = await uploadOnCloudinary(profileImage, {
      folder: 'users',
      width: 300,
      height: 300,
    });

    if (!uploadResult) {
      throw new ApiError(500, "Image upload failed");
    }

    uploadedImageUrl = uploadResult.secure_url;
  }

  // ✅ Update only provided fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (uploadedImageUrl) user.profileImage = uploadedImageUrl;

  await user.save();

  // ✅ Remove password
  const userData = user.toJSON();
  const { password: _password, ...safeUser } = userData;

  return new ApiResponse(
    200,
    { user: safeUser },
    "Profile updated successfully"
  );
};

// Delete User
export const deleteUser = async (
  userId: number
): Promise<ApiResponse<null>> => {

  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.destroy();

  return new ApiResponse(
    200,
    null,
    "User deleted successfully"
  );
};