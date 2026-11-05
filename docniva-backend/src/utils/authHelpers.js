import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export const BCRYPT_COST = 12;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export const hashPassword = (password) => bcrypt.hash(password, BCRYPT_COST);

// Email registered na ho tab bhi bcrypt chalta hai, taaki response time se pata na chale
const DUMMY_HASH = bcrypt.hashSync("docniva-dummy-password", BCRYPT_COST);
export const fakePasswordCheck = (password) => bcrypt.compare(password, DUMMY_HASH);

export const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

// Asli token email me jata hai, sirf uska hash DB me rehta hai
export const createRandomToken = () => {
  const raw = crypto.randomBytes(32).toString("hex");
  return { raw, hash: sha256(raw) };
};

// Is time se pehle bane tokens invalid. 2 sec peeche, taaki naya login chhoote nahi
export const passwordChangedStamp = () => new Date(Date.now() - 2000);

export const isLocked = (user) =>
  Boolean(user.lockUntil && user.lockUntil.getTime() > Date.now());

export const recordFailedLogin = async (Model, user) => {
  const lockExpired = user.lockUntil && user.lockUntil.getTime() <= Date.now();

  const update = lockExpired
    ? { $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } }
    : { $inc: { loginAttempts: 1 } };

  const updated = await Model.findByIdAndUpdate(user._id, update, {
    new: true,
  }).select("+loginAttempts");

  if (updated && updated.loginAttempts >= MAX_ATTEMPTS) {
    await Model.updateOne(
      { _id: user._id },
      { $set: { lockUntil: new Date(Date.now() + LOCK_MS) } }
    );
  }
};

export const clearLoginFailures = async (Model, user) => {
  if (user.loginAttempts > 0 || user.lockUntil) {
    await Model.updateOne(
      { _id: user._id },
      { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
    );
  }
};