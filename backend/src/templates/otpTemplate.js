const otpTemplate = (username, otp) => {
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
                    color: #9747FF;
                }
                .otp {
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 4px;
                    text-align: center;
                    color: #1a1d1f;
                    margin: 20px 0;
                }
                .footer {
                    font-size: 12px;
                    color: #f5f4f6;
                    text-align: center;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 class="header">Verify Your Email</h2>
                <p>Hello <strong>${username}</strong>,</p>
                <p>Use the OTP below to verify your email for <strong>Chato App</strong>:</p>

                <div class="otp">${otp}</div>

                <p>This OTP is valid for <strong>10 minutes</strong>.</p>

                <div class="footer">
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>© ${new Date().getFullYear()} Chato App</p>
                </div>
            </div>
        </body>
    </html>
    `;
};

module.exports = otpTemplate;