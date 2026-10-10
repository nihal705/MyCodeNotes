"""Email sending wrapper using Resend.
   Free tier: 3,000 emails/month, 100/day.
"""
import os
import logging
from resend import Emails

logger = logging.getLogger(__name__)

api_key = os.getenv("RESEND_API_KEY")
Emails.api_key = api_key

EMAIL_FROM = os.getenv("EMAIL_FROM", "MyCodeNotes <onboarding@resend.dev>")


def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send a 6-digit OTP to the given email.
    Returns True on success, False on any failure.
    Never raises — logging + False is the caller's signal.
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0B0F17;font-family:Inter,-apple-system,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F17;padding:40px 20px;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#131923;border-radius:16px;padding:40px;border:1px solid #1F2937;">
            <tr><td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;color:#00E5A0;font-size:22px;font-weight:700;">MyCodeNotes</h1>
              <p style="margin:6px 0 0;color:#8D97A5;font-size:13px;">DSA AI Mentor</p>
            </td></tr>
            <tr><td align="center" style="padding-bottom:16px;">
              <p style="margin:0;color:#E6EDF3;font-size:15px;">Your login code is</p>
            </td></tr>
            <tr><td align="center" style="padding-bottom:24px;">
              <div style="background:#0B0F17;border:1px solid #00E5A0;border-radius:12px;padding:20px 32px;display:inline-block;">
                <span style="font-size:36px;letter-spacing:10px;font-weight:700;color:#00E5A0;font-family:'Courier New',monospace;">{otp}</span>
              </div>
            </td></tr>
            <tr><td align="center" style="padding-bottom:20px;">
              <p style="margin:0;color:#8D97A5;font-size:13px;line-height:1.6;">
                This code is valid for <strong style="color:#E6EDF3;">10 minutes</strong>.<br/>
                If you didn't request this, you can safely ignore this email.
              </p>
              <p style="margin:12px 0 0;color:#FFA116;font-size:12px;line-height:1.5;font-weight:500;">
                📩 Didn't see it in your inbox? Please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
              </p>
            </td></tr>
            <tr><td align="center" style="padding-top:20px;border-top:1px solid #1F2937;">
              <p style="margin:0;color:#4B5563;font-size:11px;">Sent by MyCodeNotes · Do not reply</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
    """

    try:
        Emails.send({
            "from": EMAIL_FROM,
            "to": [to_email],
            "subject": f"Your MyCodeNotes code: {otp}",
            "html": html_content,
        })
        logger.info(f"OTP email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {e}")
        return False


def normalize_email(email: str) -> str:
    """Normalize email: lowercase + strip whitespace."""
    return email.lower().strip()