// ── College domain used for email validation ──
export const COLLEGE_EMAIL_DOMAIN = "@csit.edu.in";

// ── Mock users for login authentication ──
export const MOCK_USERS = [
  {
    email: "student@csit.edu.in",
    password: "123456",
    role: "student",
    name: "Rahul Kumar",
  },
  {
    email: "teacher@csit.edu.in",
    password: "123456",
    role: "teacher",
    name: "Dr. Priya Sharma",
  },
];

// ── Pre-encoded JWT-like tokens (base64 of JSON payloads) ──
// These simulate what a real backend would return after successful login
export const MOCK_JWT = {
  student: btoa(
    JSON.stringify({
      role: "student",
      email: "student@csit.edu.in",
      name: "Rahul Kumar",
      exp: 9999999999,
    })
  ),
  teacher: btoa(
    JSON.stringify({
      role: "teacher",
      email: "teacher@csit.edu.in",
      name: "Dr. Priya Sharma",
      exp: 9999999999,
    })
  ),
};

// ── Roll numbers already registered in the system ──
// Used to validate student registration — prevents duplicate enrollment
export const REGISTERED_ROLL_NUMBERS = ["CS2021001", "CS2021002", "CS2021003"];
