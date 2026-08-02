/**
 * Password policy (Step 4 section 9).
 *
 * DATABASE.md and PROJECT_SETUP.md do not specify a policy, so this is a
 * project decision: length is the strongest practical signal of password
 * strength, and a length-plus-composition rule stays usable without becoming
 * hostile (NIST SP 800-63B favours long passwords over complex ones).
 */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

/** Requires at least one letter and one digit; symbols are welcome, not required. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const PASSWORD_POLICY_MESSAGE =
  `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters ` +
  'and include at least one letter and one number.';


/** Password-reset token lifetime (section 44: "finite lifetime"). */
export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;

/** Self-service phone number change (Profile > Account Settings > Phone Number). */
export const PHONE_OTP_LENGTH = 6;
export const PHONE_OTP_TTL_MINUTES = 10;

/** Login via SMS OTP - deliberately separate constants from PHONE_OTP_*, even though the values match today, since the two flows are unrelated. */
export const LOGIN_OTP_LENGTH = 6;
export const LOGIN_OTP_TTL_MINUTES = 10;

/** Name of the httpOnly cookie carrying the opaque refresh token. */
export const REFRESH_TOKEN_COOKIE_NAME = 'crm_refresh_token';

/**
 * A native client (no cookie jar shared with the browser, can't read an
 * httpOnly cookie anyway) sends this to opt into body-delivered refresh
 * tokens on login instead of the web-only cookie (MOBILE_ARCHITECTURE.md
 * section 3.2). Web sends nothing, and its behaviour is unchanged.
 */
export const CLIENT_TYPE_HEADER = 'x-client-type';
export const MOBILE_CLIENT_TYPE = 'mobile';
