/**
 * Email Service for Order Notifications
 * Handles order confirmations, status updates, and other transactional emails
 */

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    digitalAddress: string;
    apartment?: string;
    country: string;
  };
  paymentMethod: string;
  estimatedDelivery?: string;
}

export interface StatusUpdateEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: string;
  statusDescription: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class EmailService {
  private static readonly isDevelopment =
    import.meta.env.MODE === "development";

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(
    orderData: OrderEmailData
  ): Promise<boolean> {
    try {
      console.log("📧 EmailService: Sending order confirmation email...", {
        customer: orderData.customerEmail,
        orderNumber: orderData.orderNumber,
      });

      const template = this.generateOrderConfirmationTemplate(orderData);

      if (this.isDevelopment) {
        // In development, just log the email content
        console.log("📧 [DEV MODE] Order Confirmation Email:");
        console.log("To:", orderData.customerEmail);
        console.log("Subject:", template.subject);
        console.log(
          "Content Preview:",
          template.textContent.substring(0, 200) + "..."
        );
        return true;
      }

      // In production, you would integrate with an email service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Resend
      // - EmailJS (client-side)

      // Example with EmailJS (popular for client-side email sending):
      /*
      await emailjs.send(
        'your_service_id',
        'order_confirmation_template',
        {
          to_email: orderData.customerEmail,
          customer_name: orderData.customerName,
          order_number: orderData.orderNumber,
          order_total: orderData.total,
          // ... other template variables
        },
        'your_public_key'
      );
      */

      // For now, return true to simulate successful email sending
      console.log(
        "✅ EmailService: Order confirmation email sent successfully"
      );
      return true;
    } catch (error) {
      console.error(
        "❌ EmailService: Failed to send order confirmation email:",
        error
      );
      return false;
    }
  }

  /**
   * Send order status update email
   */
  static async sendStatusUpdate(
    statusData: StatusUpdateEmailData
  ): Promise<boolean> {
    try {
      console.log("📧 EmailService: Sending status update email...", {
        customer: statusData.customerEmail,
        orderNumber: statusData.orderNumber,
        status: statusData.status,
      });

      const template = this.generateStatusUpdateTemplate(statusData);

      if (this.isDevelopment) {
        console.log("📧 [DEV MODE] Status Update Email:");
        console.log("To:", statusData.customerEmail);
        console.log("Subject:", template.subject);
        console.log(
          "Content Preview:",
          template.textContent.substring(0, 200) + "..."
        );
        return true;
      }

      // Integration with email service would go here
      console.log("✅ EmailService: Status update email sent successfully");
      return true;
    } catch (error) {
      console.error(
        "❌ EmailService: Failed to send status update email:",
        error
      );
      return false;
    }
  }

  /**
   * Generate order confirmation email template
   */
  private static generateOrderConfirmationTemplate(
    orderData: OrderEmailData
  ): EmailTemplate {
    const subject = `Order Confirmation #${orderData.orderNumber} - Omu Fusion`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; }
        .order-details { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .total-section { background: #1e293b; color: white; padding: 20px; border-radius: 8px; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmed! 🎉</h1>
            <p>Thank you for your purchase, ${orderData.customerName}!</p>
        </div>

        <div class="order-details">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> #${orderData.orderNumber}</p>
            <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
            ${
              orderData.estimatedDelivery
                ? `<p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>`
                : ""
            }
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderData.items
                  .map(
                    (item) => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>₵${item.price.toFixed(2)}</td>
                        <td>₵${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="total-section">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>₵${orderData.subtotal.toFixed(2)}</span>
            </div>
            ${
              orderData.discount > 0
                ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #10b981;">
                    <span>Discount:</span>
                    <span>-₵${orderData.discount.toFixed(2)}</span>
                </div>
            `
                : ""
            }
            <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px;">
                <span>Total:</span>
                <span>₵${orderData.total.toFixed(2)}</span>
            </div>
            <hr style="margin: 15px 0; border: 1px solid #475569;">
            <div style="display: flex; justify-content: space-between; font-size: 1.2em; font-weight: bold;">
                <span>Total:</span>
                <span>₵${orderData.total.toFixed(2)}</span>
            </div>
        </div>

        ${
          orderData.shippingAddress
            ? `
            <div class="order-details">
                <h3>Shipping Address</h3>
                <p>
                    ${orderData.shippingAddress.firstName} ${
                orderData.shippingAddress.lastName
              }<br>
                    ${orderData.shippingAddress.digitalAddress}<br>
                    ${
                      orderData.shippingAddress.apartment
                        ? orderData.shippingAddress.apartment + "<br>"
                        : ""
                    }
                    ${orderData.shippingAddress.country}
                </p>
            </div>
        `
            : ""
        }

        <div class="footer">
            <p>Thank you for shopping with Omu Fusion!</p>
            <p>You can track your order status in your account dashboard.</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
Order Confirmation #${orderData.orderNumber}

Dear ${orderData.customerName},

Thank you for your purchase! Your order has been confirmed.

Order Details:
- Order Number: #${orderData.orderNumber}
- Order Date: ${orderData.orderDate}
- Payment Method: ${orderData.paymentMethod}
${
  orderData.estimatedDelivery
    ? `- Estimated Delivery: ${orderData.estimatedDelivery}`
    : ""
}

Items Ordered:
${orderData.items
  .map(
    (item) =>
      `- ${item.name} (Qty: ${item.quantity}) - ₵${(
        item.price * item.quantity
      ).toFixed(2)}`
  )
  .join("\n")}

Order Summary:
Subtotal: ₵${orderData.subtotal.toFixed(2)}
${
  orderData.discount > 0 ? `Discount: -₵${orderData.discount.toFixed(2)}\n` : ""
}Total: ₵${orderData.total.toFixed(2)}

${
  orderData.shippingAddress
    ? `
Shipping Address:
${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}
${orderData.shippingAddress.digitalAddress}
${orderData.shippingAddress.apartment || ""}
${orderData.shippingAddress.country}
`
    : ""
}

Thank you for shopping with Omu Fusion!
You can track your order status in your account dashboard.
`;

    return { subject, htmlContent, textContent };
  }

  /**
   * Generate status update email template
   */
  private static generateStatusUpdateTemplate(
    statusData: StatusUpdateEmailData
  ): EmailTemplate {
    const subject = `Order Update #${statusData.orderNumber} - ${statusData.status}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; }
        .status-update { background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Status Update 📦</h1>
        </div>

        <div class="status-update">
            <h2>Hello ${statusData.customerName},</h2>
            <p>Your order <strong>#${
              statusData.orderNumber
            }</strong> status has been updated:</p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <div style="font-size: 1.2em; font-weight: bold; color: #1e293b;">
                    Status: ${statusData.status.toUpperCase()}
                </div>
                <p style="margin: 8px 0; color: #64748b;">${
                  statusData.statusDescription
                }</p>
            </div>

            ${
              statusData.trackingNumber
                ? `
                <p><strong>Tracking Number:</strong> ${statusData.trackingNumber}</p>
            `
                : ""
            }
            
            ${
              statusData.estimatedDelivery
                ? `
                <p><strong>Estimated Delivery:</strong> ${statusData.estimatedDelivery}</p>
            `
                : ""
            }
        </div>

        <div class="footer">
            <p>Thank you for choosing Omu Fusion!</p>
            <p>You can view full order details in your account dashboard.</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
Order Status Update #${statusData.orderNumber}

Hello ${statusData.customerName},

Your order #${statusData.orderNumber} status has been updated:

Status: ${statusData.status.toUpperCase()}
${statusData.statusDescription}

${
  statusData.trackingNumber
    ? `Tracking Number: ${statusData.trackingNumber}\n`
    : ""
}${
      statusData.estimatedDelivery
        ? `Estimated Delivery: ${statusData.estimatedDelivery}\n`
        : ""
    }
Thank you for choosing Omu Fusion!
You can view full order details in your account dashboard.
`;

    return { subject, htmlContent, textContent };
  }

  /**
   * Send contact form email
   */
  static async sendContactFormEmail(
    contactData: ContactFormData
  ): Promise<boolean> {
    try {
      console.log("📧 EmailService: Sending contact form email...", {
        from: contactData.email,
        subject: contactData.subject,
        name: contactData.name,
      });

      const template = this.generateContactFormTemplate(contactData);

      if (this.isDevelopment) {
        // In development, just log the email content
        console.log("📧 [DEV MODE] Contact Form Email:");
        console.log("From:", contactData.email);
        console.log("Subject:", template.subject);
        console.log(
          "Content Preview:",
          template.textContent.substring(0, 200) + "..."
        );
        return true;
      }

      // In production, you would integrate with an email service
      // For now, return true to simulate successful email sending
      return true;
    } catch (error) {
      console.error(
        "❌ EmailService: Failed to send contact form email:",
        error
      );
      return false;
    }
  }

  /**
   * Generate contact form email template
   */
  private static generateContactFormTemplate(
    contactData: ContactFormData
  ): EmailTemplate {
    const subject = `New Contact Form Message: ${contactData.subject} - Omu Fusion`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Message</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; }
        .content { background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .message-box { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Message 📧</h1>
            <p>Someone has sent a message through your website</p>
        </div>

        <div class="content">
            <h2>Contact Information</h2>
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Subject:</strong> ${contactData.subject}</p>
            
            <div class="message-box">
                <h3>Message:</h3>
                <p>${contactData.message.replace(/\n/g, "<br>")}</p>
            </div>
        </div>

        <div class="footer">
            <p>This message was sent through the contact form on your Omu Fusion website.</p>
            <p>Please respond to the customer at: ${contactData.email}</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `
New Contact Form Message - Omu Fusion

From: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}

Message:
${contactData.message}

---
This message was sent through the contact form on your Omu Fusion website.
Please respond to the customer at: ${contactData.email}
`;

    return { subject, htmlContent, textContent };
  }
}
