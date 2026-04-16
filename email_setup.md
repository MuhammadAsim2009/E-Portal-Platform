# Institutional Email (SMTP) Configuration Guide

This guide will help you configure the SMTP server settings to enable institutional email broadcasting for announcements and alerts.

## 1. Environment Configuration
Open your `server/.env` file and update the following variables with your mail server details.

```env
# Email (SMTP) Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_institutional_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM_NAME=E-Portal Support
SMTP_FROM_EMAIL=your_institutional_email@gmail.com
```

### 2. Setting Up Gmail (Recommended)
If you are using a Gmail account, follow these steps to generate an **App Password**:

1.  **Enable 2-Step Verification**: Go to your [Google Account Security](https://myaccount.google.com/security) and ensure 2FA is active.
2.  **Generate App Password**:
    - Search for "App Passwords" in your Google Account search bar.
    - Select **'Other (Custom name)'** and enter "E-Portal".
    - Click **Generate**.
3.  **Copy the 16-character code**: Paste this code into the `SMTP_PASS` field in your `.env` file (no spaces).

### 3. Verification Steps
Once the `.env` file is updated:
1.  **Restart the Server**: The changes won't take effect until the Node.js process is restarted.
2.  **Test Dispatch**: 
    - Go to the **Announcements** page in the Admin Dashboard.
    - Create a test announcement.
    - Select **Target Audience: Individual** (choose your own account).
    - Check the **"Email Notification"** toggle.
    - Click **Publish**.
3.  **Audit Logs**: Check the server console for `Email sent: <message_id>`.

## 4. Troubleshooting
- **Connection Timeout**: Ensure your firewall allows outbound traffic on port 587.
- **Authentication Failure**: verify the `SMTP_USER` and `SMTP_PASS` (App Password) are correct.
- **SSL/TLS Errors**: If using port 465, set `SMTP_SECURE=true`. For port 587, set `SMTP_SECURE=false`.

---
*Security Note: Never share your .env file or SMTP passwords with unauthorized personnel.*
