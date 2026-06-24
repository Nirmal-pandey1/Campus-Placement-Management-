const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, ...profileData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return errorResponse(res, 400, "Email already registered");

    const user = await User.create({ name, email, password, role });

    if (role === "student") {
      await Student.create({ user: user._id, ...profileData });
    } else if (role === "company") {
      await Company.create({ user: user._id, ...profileData });
    }

    const token = generateToken(user._id);
    successResponse(res, 201, "Registered successfully", {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return errorResponse(res, 401, "Invalid email or password");

    const token = generateToken(user._id);
    successResponse(res, 200, "Login successful", {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    successResponse(res, 200, "User fetched", { user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword)))
      return errorResponse(res, 400, "Current password is incorrect");

    user.password = newPassword;
    await user.save();
    successResponse(res, 200, "Password changed successfully");
  } catch (err) {
    next(err);
  }
};

// @desc  Forgot password — send reset email
// @route POST /api/auth/forgot-password
// @access Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, "No account found with this email");

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const tokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Save to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpires;
    await user.save({ validateBeforeSave: false });

    // Reset URL
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "CareerSync — Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
            .header h1 { color: white; font-size: 24px; font-weight: 700; margin: 0; }
            .header p  { color: #bfdbfe; font-size: 13px; margin-top: 4px; }
            .body { padding: 32px; }
            .body h2 { font-size: 20px; color: #1e293b; margin-bottom: 12px; }
            .body p  { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 12px; }
            .btn { display: inline-block; background: #2563eb; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 16px 0; }
            .warning { background: #fef9c3; border-left: 4px solid #ca8a04; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #854d0e; margin-top: 16px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer p { font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>🎓 CareerSync</h1>
              <p>A Digital Platform For Campus Recruitment</p>
            </div>
            <div class="body">
              <h2>🔑 Password Reset Request</h2>
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>We received a request to reset your CareerSync password. Click the button below to reset it:</p>
              <a href="${resetURL}" class="btn">Reset My Password</a>
              <div class="warning">
                ⚠️ This link expires in <strong>30 minutes</strong>. If you did not request a password reset, please ignore this email.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} CareerSync — A Digital Platform For Campus Recruitment</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    successResponse(res, 200, "Password reset link sent to your email!");
  } catch (err) {
    next(err);
  }
};

// @desc  Reset password using token
// @route PUT /api/auth/reset-password/:token
// @access Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Hash the token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return errorResponse(res, 400, "Reset link is invalid or has expired");

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "CareerSync — Password Changed Successfully",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
            .header h1 { color: white; font-size: 24px; font-weight: 700; margin: 0; }
            .header p  { color: #bfdbfe; font-size: 13px; margin-top: 4px; }
            .body { padding: 32px; }
            .body h2 { font-size: 20px; color: #1e293b; margin-bottom: 12px; }
            .body p  { font-size: 15px; color: #475569; line-height: 1.7; }
            .success { background: #dcfce7; border-left: 4px solid #16a34a; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #15803d; margin: 16px 0; }
            .btn { display: inline-block; background: #2563eb; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 16px 0; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer p { font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>🎓 CareerSync</h1>
              <p>A Digital Platform For Campus Recruitment</p>
            </div>
            <div class="body">
              <h2>✅ Password Changed!</h2>
              <p>Hi <strong>${user.name}</strong>,</p>
              <div class="success">
                🎉 Your password has been successfully changed!
              </div>
              <p>You can now login with your new password.</p>
              <a href="${process.env.CLIENT_URL}/login" class="btn">Login Now</a>
              <p style="font-size:13px; color:#94a3b8; margin-top:16px;">
                If you did not make this change, please contact us immediately.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} CareerSync — A Digital Platform For Campus Recruitment</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    successResponse(res, 200, "Password reset successful! You can now login.");
  } catch (err) {
    next(err);
  }
};