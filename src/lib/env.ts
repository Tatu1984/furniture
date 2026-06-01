// ---------------------------------------------------------------------------
// Environment Variable Validation
// Validates required environment variables at startup and exports a typed
// configuration object for use throughout the application.
// ---------------------------------------------------------------------------

type EnvConfig = {
  // Required
  DATABASE_URL: string;
  JWT_SECRET: string;

  // Application
  NEXT_PUBLIC_APP_URL: string;
  JWT_EXPIRES_IN: string;

  // SMTP / Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
  ADMIN_NOTIFICATION_EMAIL: string;

  // Razorpay
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
};

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== "") {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return "";
}

function validateRequiredVars(): void {
  const required = ["DATABASE_URL", "JWT_SECRET"] as const;
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key] || process.env[key]!.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(", ")}`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    } else {
      console.warn(`[env] WARNING: ${message}`);
    }
  }
}

validateRequiredVars();

export const env: EnvConfig = {
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  JWT_SECRET: getEnvVar("JWT_SECRET", "dev-secret-change-in-production"),

  NEXT_PUBLIC_APP_URL: getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  JWT_EXPIRES_IN: getEnvVar("JWT_EXPIRES_IN", "7d"),

  SMTP_HOST: getEnvVar("SMTP_HOST"),
  SMTP_PORT: parseInt(getEnvVar("SMTP_PORT", "587"), 10),
  SMTP_USER: getEnvVar("SMTP_USER"),
  SMTP_PASS: getEnvVar("SMTP_PASS"),
  FROM_EMAIL: getEnvVar("FROM_EMAIL", "noreply@fsow.in"),
  FROM_NAME: getEnvVar("FROM_NAME", "FSOW Furniture"),
  ADMIN_NOTIFICATION_EMAIL: getEnvVar("ADMIN_NOTIFICATION_EMAIL"),

  RAZORPAY_KEY_ID: getEnvVar("RAZORPAY_KEY_ID"),
  RAZORPAY_KEY_SECRET: getEnvVar("RAZORPAY_KEY_SECRET"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: getEnvVar("NEXT_PUBLIC_RAZORPAY_KEY_ID"),
};
