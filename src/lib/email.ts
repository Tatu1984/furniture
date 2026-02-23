// ---------------------------------------------------------------------------
// Email Template System
// Provides XSS-safe HTML template rendering with variable substitution,
// conditional blocks, default templates for common e-commerce events, and
// convenience functions for sending emails.
// ---------------------------------------------------------------------------

import prisma from "@/lib/db";
import { env } from "@/lib/env";

// ---------------------------------------------------------------------------
// XSS Protection Utilities
// ---------------------------------------------------------------------------

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#96;",
};

/**
 * Escapes HTML entities in a string to prevent XSS injection.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`/]/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

/**
 * Type-safe sanitization: converts any value to a safe, escaped string.
 * Handles null, undefined, numbers, booleans, and objects gracefully.
 */
export function sanitizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return escapeHtml(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    try {
      return escapeHtml(JSON.stringify(value));
    } catch {
      return "";
    }
  }
  return escapeHtml(String(value));
}

/**
 * Checks whether an HTML string contains potentially dangerous content such
 * as script tags, event handler attributes, or javascript: protocol URLs.
 * Returns `true` if the HTML appears safe, `false` otherwise.
 */
export function isSafeHtml(html: string): boolean {
  const lowerHtml = html.toLowerCase();

  // Block script tags
  if (/<script[\s>]/i.test(lowerHtml) || /<\/script>/i.test(lowerHtml)) {
    return false;
  }

  // Block inline event handlers (onclick, onerror, onload, etc.)
  if (/\bon\w+\s*=/i.test(html)) {
    return false;
  }

  // Block javascript: protocol
  if (/javascript\s*:/i.test(lowerHtml)) {
    return false;
  }

  // Block data: protocol in src/href attributes (common XSS vector)
  if (/(?:src|href)\s*=\s*["']?\s*data\s*:/i.test(html)) {
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Template Rendering Engine
// ---------------------------------------------------------------------------

/**
 * Renders an HTML template by replacing `{{variable}}` placeholders with
 * sanitized values and processing `{{#variable}}...{{/variable}}` conditional
 * blocks. Conditional blocks are included only when the variable is truthy.
 *
 * @param template - The HTML template string.
 * @param variables - A record of variable names and their values.
 * @returns The rendered HTML string.
 */
export function renderTemplate(
  template: string,
  variables: Record<string, unknown>,
): string {
  let result = template;

  // Process conditional blocks: {{#variable}}content{{/variable}}
  // These are rendered only when the variable is truthy.
  result = result.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_match, varName: string, content: string) => {
      const value = variables[varName];
      if (value) {
        // Recursively render the inner content
        return renderTemplate(content, variables);
      }
      return "";
    },
  );

  // Replace simple variable placeholders: {{variable}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, varName: string) => {
    const value = variables[varName];
    return sanitizeValue(value);
  });

  return result;
}

// ---------------------------------------------------------------------------
// Default Email Templates
// ---------------------------------------------------------------------------

export const DEFAULT_TEMPLATES: Record<
  string,
  { subject: string; bodyHtml: string; bodyText?: string }
> = {
  order_confirmation: {
    subject: "Order Confirmed - #{{orderNumber}}",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmed!</h1>
        <p>Hi {{customerName}},</p>
        <p>Thank you for your order <strong>#{{orderNumber}}</strong>. We have received your order and it is being processed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Number</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{orderNumber}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order Date</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{orderDate}}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{currency}} {{total}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Method</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{paymentMethod}}</td>
          </tr>
        </table>
        {{#itemsHtml}}<div>{{itemsHtml}}</div>{{/itemsHtml}}
        {{#shippingAddress}}<p><strong>Shipping Address:</strong><br/>{{shippingAddress}}</p>{{/shippingAddress}}
        {{#trackingUrl}}<p><a href="{{trackingUrl}}" style="color: #0066cc;">Track your order</a></p>{{/trackingUrl}}
        <p>If you have any questions, please contact our support team.</p>
        <p style="color: #666; font-size: 12px;">{{storeName}}</p>
      </div>
    `,
    bodyText:
      "Order Confirmed! Hi {{customerName}}, your order #{{orderNumber}} has been confirmed. Total: {{currency}} {{total}}.",
  },

  order_shipped: {
    subject: "Your Order #{{orderNumber}} Has Been Shipped!",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Order Is On Its Way!</h1>
        <p>Hi {{customerName}},</p>
        <p>Great news! Your order <strong>#{{orderNumber}}</strong> has been shipped.</p>
        {{#carrier}}<p><strong>Carrier:</strong> {{carrier}}</p>{{/carrier}}
        {{#trackingNumber}}<p><strong>Tracking Number:</strong> {{trackingNumber}}</p>{{/trackingNumber}}
        {{#trackingUrl}}<p><a href="{{trackingUrl}}" style="display: inline-block; padding: 12px 24px; background: #333; color: #fff; text-decoration: none; border-radius: 4px;">Track Your Order</a></p>{{/trackingUrl}}
        {{#estimatedDelivery}}<p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>{{/estimatedDelivery}}
        <p>If you have any questions, please contact our support team.</p>
        <p style="color: #666; font-size: 12px;">{{storeName}}</p>
      </div>
    `,
    bodyText:
      "Your order #{{orderNumber}} has been shipped! {{#trackingNumber}}Tracking: {{trackingNumber}}{{/trackingNumber}}",
  },

  order_status_update: {
    subject: "Order #{{orderNumber}} - Status Update",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Status Update</h1>
        <p>Hi {{customerName}},</p>
        <p>Your order <strong>#{{orderNumber}}</strong> status has been updated to: <strong>{{newStatus}}</strong></p>
        {{#statusMessage}}<p>{{statusMessage}}</p>{{/statusMessage}}
        <p>If you have any questions, please contact our support team.</p>
        <p style="color: #666; font-size: 12px;">{{storeName}}</p>
      </div>
    `,
    bodyText:
      "Order #{{orderNumber}} status update: {{newStatus}}.",
  },

  welcome: {
    subject: "Welcome to {{storeName}}!",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, {{customerName}}!</h1>
        <p>Thank you for creating an account with {{storeName}}. We are excited to have you on board.</p>
        <p>Browse our curated collection of premium furniture and find pieces that transform your space.</p>
        <a href="{{shopUrl}}" style="display: inline-block; padding: 12px 24px; background: #333; color: #fff; text-decoration: none; border-radius: 4px;">Start Shopping</a>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">{{storeName}}</p>
      </div>
    `,
    bodyText:
      "Welcome to {{storeName}}, {{customerName}}! Start shopping at {{shopUrl}}.",
  },

  password_reset: {
    subject: "Reset Your Password - {{storeName}}",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi {{customerName}},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="{{resetUrl}}" style="display: inline-block; padding: 12px 24px; background: #333; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p style="margin-top: 20px;">This link will expire in {{expiresIn}}.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p style="color: #666; font-size: 12px;">{{storeName}}</p>
      </div>
    `,
    bodyText:
      "Reset your password at {{resetUrl}}. This link expires in {{expiresIn}}. If you did not request this, ignore this email.",
  },

  low_stock_alert: {
    subject: "Low Stock Alert: {{productName}}",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #cc0000;">Low Stock Alert</h1>
        <p>The following product is running low on stock:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Product</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{productName}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>SKU</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{sku}}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Current Stock</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{currentStock}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Threshold</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{threshold}}</td>
          </tr>
        </table>
        {{#variantName}}<p><strong>Variant:</strong> {{variantName}}</p>{{/variantName}}
        <p>Please restock this item soon to avoid lost sales.</p>
      </div>
    `,
    bodyText:
      "Low Stock Alert: {{productName}} (SKU: {{sku}}) has {{currentStock}} units remaining (threshold: {{threshold}}).",
  },

  review_approved: {
    subject: "Your Review Has Been Approved!",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Review Approved</h1>
        <p>Hi {{customerName}},</p>
        <p>Your review for <strong>{{productName}}</strong> has been approved and is now live on our website.</p>
        {{#reviewTitle}}<p><strong>Your Review:</strong> "{{reviewTitle}}"</p>{{/reviewTitle}}
        <p>Thank you for taking the time to share your feedback. It helps other customers make informed decisions.</p>
        <p style="color: #666; font-size: 12px;">{{storeName}}</p>
      </div>
    `,
    bodyText:
      "Hi {{customerName}}, your review for {{productName}} has been approved!",
  },

  refund_processed: {
    subject: "Refund Processed - Order #{{orderNumber}}",
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Refund Processed</h1>
        <p>Hi {{customerName}},</p>
        <p>A refund of <strong>{{currency}} {{refundAmount}}</strong> has been processed for your order <strong>#{{orderNumber}}</strong>.</p>
        {{#refundReason}}<p><strong>Reason:</strong> {{refundReason}}</p>{{/refundReason}}
        <p>The refund should appear in your account within 5-10 business days depending on your payment provider.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p style="color: #666; font-size: 12px;">{{storeName}}</p>
      </div>
    `,
    bodyText:
      "A refund of {{currency}} {{refundAmount}} has been processed for order #{{orderNumber}}.",
  },
};

// ---------------------------------------------------------------------------
// Template Resolution
// ---------------------------------------------------------------------------

/**
 * Resolves a template by name: first checks the database (EmailTemplate
 * table), then falls back to the built-in default templates.
 */
async function resolveTemplate(
  templateName: string,
): Promise<{ subject: string; bodyHtml: string; bodyText?: string } | null> {
  try {
    const dbTemplate = await prisma.emailTemplate.findUnique({
      where: { name: templateName },
    });

    if (dbTemplate && dbTemplate.isActive) {
      return {
        subject: dbTemplate.subject,
        bodyHtml: dbTemplate.bodyHtml,
        bodyText: dbTemplate.bodyText ?? undefined,
      };
    }
  } catch {
    // Fall through to defaults if DB is unavailable
  }

  return DEFAULT_TEMPLATES[templateName] ?? null;
}

// ---------------------------------------------------------------------------
// Core Send Function
// ---------------------------------------------------------------------------

/**
 * Sends an email by logging it to the console and recording it in the
 * EmailLog table. In a production environment, this would integrate with
 * an SMTP provider (e.g., Nodemailer, SendGrid, AWS SES).
 *
 * @param to      - Recipient email address.
 * @param subject - Email subject line.
 * @param html    - HTML body content.
 * @param text    - Optional plain text body.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate the rendered HTML for safety
    if (!isSafeHtml(html)) {
      console.error(`[email] Blocked sending email to ${to}: HTML contains unsafe content`);
      return { success: false, error: "Email HTML contains unsafe content" };
    }

    // In development / without SMTP config, log to console
    const hasSmtp = env.SMTP_HOST && env.SMTP_USER;

    if (!hasSmtp) {
      console.log("─".repeat(60));
      console.log(`[email] TO: ${to}`);
      console.log(`[email] SUBJECT: ${subject}`);
      console.log(`[email] HTML LENGTH: ${html.length} chars`);
      if (text) {
        console.log(`[email] TEXT: ${text}`);
      }
      console.log("─".repeat(60));
    }

    // TODO: Integrate with SMTP transport (Nodemailer / SendGrid / etc.)
    // when SMTP configuration is available:
    //
    // const transporter = createTransport({
    //   host: env.SMTP_HOST,
    //   port: env.SMTP_PORT,
    //   auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    // });
    // await transporter.sendMail({
    //   from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
    //   to, subject, html, text,
    // });

    // Record in EmailLog
    try {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          status: "sent",
          metadata: { textLength: text?.length ?? 0, htmlLength: html.length },
        },
      });
    } catch (logError) {
      // Don't fail the email send if logging fails
      console.error("[email] Failed to record email log:", logError);
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown email error";
    console.error(`[email] Failed to send email to ${to}:`, errorMessage);

    // Record the failure
    try {
      await prisma.emailLog.create({
        data: {
          to,
          subject,
          status: "failed",
          error: errorMessage,
        },
      });
    } catch {
      // Silently ignore logging errors
    }

    return { success: false, error: errorMessage };
  }
}

// ---------------------------------------------------------------------------
// Template-based Send Helper
// ---------------------------------------------------------------------------

/**
 * Sends an email using a named template with variable substitution.
 */
async function sendTemplateEmail(
  to: string,
  templateName: string,
  variables: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  const template = await resolveTemplate(templateName);
  if (!template) {
    return {
      success: false,
      error: `Email template "${templateName}" not found`,
    };
  }

  // Inject common variables
  const allVariables: Record<string, unknown> = {
    storeName: env.FROM_NAME || "FSOW Furniture",
    shopUrl: env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    currency: "USD",
    ...variables,
  };

  const subject = renderTemplate(template.subject, allVariables);
  const html = renderTemplate(template.bodyHtml, allVariables);
  const text = template.bodyText
    ? renderTemplate(template.bodyText, allVariables)
    : undefined;

  return sendEmail(to, subject, html, text);
}

// ---------------------------------------------------------------------------
// Convenience Functions
// ---------------------------------------------------------------------------

/**
 * Sends an order confirmation email to the customer.
 */
export async function sendOrderConfirmation(
  to: string,
  variables: {
    customerName: string;
    orderNumber: string;
    orderDate: string;
    total: string | number;
    paymentMethod: string;
    currency?: string;
    itemsHtml?: string;
    shippingAddress?: string;
    trackingUrl?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  return sendTemplateEmail(to, "order_confirmation", variables);
}

/**
 * Sends an order shipped notification email.
 */
export async function sendOrderShipped(
  to: string,
  variables: {
    customerName: string;
    orderNumber: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  return sendTemplateEmail(to, "order_shipped", variables);
}

/**
 * Sends a welcome email to a newly registered user.
 */
export async function sendWelcomeEmail(
  to: string,
  variables: {
    customerName: string;
  },
): Promise<{ success: boolean; error?: string }> {
  return sendTemplateEmail(to, "welcome", variables);
}

/**
 * Sends a password reset email with a secure reset link.
 */
export async function sendPasswordResetEmail(
  to: string,
  variables: {
    customerName: string;
    resetUrl: string;
    expiresIn?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  return sendTemplateEmail(to, "password_reset", {
    expiresIn: "1 hour",
    ...variables,
  });
}

/**
 * Sends a low stock alert email to store administrators.
 */
export async function sendLowStockAlert(
  to: string,
  variables: {
    productName: string;
    sku: string;
    currentStock: number;
    threshold: number;
    variantName?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  return sendTemplateEmail(to, "low_stock_alert", variables);
}
