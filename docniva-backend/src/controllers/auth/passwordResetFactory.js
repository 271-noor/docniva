import mongoose from "mongoose";
import {
  createRandomToken,
  sha256,
  hashPassword,
  passwordChangedStamp,
} from "../../utils/authHelpers.js";
import {
  sendMailInBackground,
  getClientUrl,
  emailTemplate,
} from "../../utils/mailer.js";

const GENERIC_MESSAGE =
  "If an account exists for this email, reset instructions have been sent.";

export const makeForgotPassword =
  ({ Model, resetPath }) =>
  async (req, res) => {
    const { email } = req.validated.body;

    const user = await Model.findOne({ email }).select("_id email isBlocked");

    if (user && !user.isBlocked) {
      const { raw, hash } = createRandomToken();

      await Model.updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: hash,
            resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
          },
        }
      );

      sendMailInBackground({
        to: user.email,
        subject: "Reset your DocNiva password",
        html: emailTemplate({
          title: "Reset your password",
          intro: "Click the button below to choose a new password. This link expires in 15 minutes.",
          buttonText: "Reset Password",
          link: `${getClientUrl()}${resetPath}?token=${raw}`,
          footer: "If you did not request this, you can safely ignore this email.",
        }),
      });
    }

    // Account ho ya na ho, hamesha same jawab
    return res.status(200).json({ success: true, message: GENERIC_MESSAGE });
  };

export const makeResetPassword = (Model) => async (req, res) => {
  const { token, password } = req.validated.body;

  const hashedPassword = await hashPassword(password);

  // Ek hi atomic step: token sirf ek baar use ho sakta hai
  const user = await Model.findOneAndUpdate(
    {
      resetPasswordToken: sha256(token),
      resetPasswordExpires: mongoose.trusted({ $gt: new Date() }),
    },
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: passwordChangedStamp(),
        loginAttempts: 0,
      },
      $unset: { resetPasswordToken: 1, resetPasswordExpires: 1, lockUntil: 1 },
    }
  ).select("_id");

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Reset link is invalid or expired. Request a new one.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Password reset successfully. Please log in.",
  });
};