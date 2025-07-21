import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

/**
 * @typedef {Object} DecodedToken
 * @property {string} id
 * @property {string} username
 * @property {"user" | "admin" | "superadmin"} role
 * @property {string} [site]
 * @property {number} [exp]
 * @property {number} [iat]
 */

/**
 * @returns {DecodedToken|null}
 */
function getDecodedToken() {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

function logoutHelper() {
  Cookies.remove("token");
}

export { getDecodedToken, logoutHelper };