const forgotPasswordTemplate = (username, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                padding: 20px;
            }
            .container {
                max-width: 500px;
                margin: auto;
                background: #ffffff;
                padding: 25px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                color: #FF4D4F;
            }
            .otp {
                font-size: 28px;
                font-weight: bold;
                letter-spacing: 4px;
                text-align: center;
                color: #1a1d1f;
                margin: 20px 0;
            }
            .warning {
                background: #fff1f0;
                padding: 10px;
                border-radius: 5px;
                color: #a8071a;
                font-size: 14px;
                margin-top: 15px;
            }
            .footer {
                font-size: 12px;
                color: #777;
                text-align: center;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 class="header">Reset Your Password</h2>
            <p>Hello <strong>${username}</strong>,</p>
            <p>You requested to reset your password for <strong>Chato App</strong>.</p>

            <div class="otp">${otp}</div>

            <p>This OTP is valid for <strong>10 minutes</strong>.</p>

            <div class="warning">
                ⚠ If you did not request a password reset, please ignore this email or secure your account.
            </div>

            <div class="footer">
                <p>© ${new Date().getFullYear()} Chato App</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = forgotPasswordTemplate;
