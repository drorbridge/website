import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Buffer } from 'buffer';

const ses = new SESClient({ region: "eu-north-1" });
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
const TO_EMAIL = "register@bridge-interactive.com";
const FROM_EMAIL = "noreply@bridge-interactive.com";

// 🔐 Paddle configuration
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
const PADDLE_PLAN_ID = process.env.PADDLE_PLAN_ID; // e.g., your default plan
const PADDLE_API_URL = "https://api.paddle.com/customers";

export const handler = async (event) => {
  console.log("=== START Lambda ===");
  console.log("Raw event.body type:", typeof event.body);
  console.log("Raw event.body (first 200 chars):", String(event.body).substring(0, 200));
  console.log("isBase64Encoded:", event.isBase64Encoded);
  

  //  STEP 1: Verify we have a valid body object
  try {
    let body = null;

    if (!event.body) {
      throw new Error("event.body is missing");
    }

    let rawBody = event.body;

    // Decode Base64 if needed
    if (event.isBase64Encoded) {
      try {
        rawBody = Buffer.from(event.body, 'base64').toString('utf8');
        console.log("Decoded from Base64");
      } catch (e) {
        console.error("Base64 decode error:", e.message);
        throw new Error("Failed to decode Base64 body");
      }
    }

    console.log("After Base64 check, type:", typeof rawBody);

    // Parse JSON
    if (typeof rawBody === 'string') {
      try {
        body = JSON.parse(rawBody);
        console.log("Successfully parsed JSON");
        console.log("Parsed body keys:", Object.keys(body));
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr.message);
        console.error("Attempted to parse:", rawBody.substring(0, 100));
        throw new Error(`JSON parse failed: ${parseErr.message}`);
      }
    } else {
      body = rawBody;
      console.log("Body was not a string, using as-is");
    }

    console.log("Final body type:", typeof body);
    console.log("Final body is object?:", body !== null && typeof body === 'object');
    console.log("captchaToken exists?:", !!body.captchaToken);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      console.error("Body validation failed!");
      console.error("body:", body);
      console.error("typeof body:", typeof body);
      console.error("Array.isArray(body):", Array.isArray(body));
      throw new Error("Body is not a valid object after parsing");
    }

    const captchaToken = body.captchaToken;
    if (!captchaToken) {
      throw new Error("captchaToken is missing from body");
    }

    // STEP 2: Verify reCAPTCHA 
    let recaptchaResult = { success: true, score: 1.0 };
    
    if (captchaToken !== "test-token-123") {
      console.log("Verifying reCAPTCHA...");
      
      if (!RECAPTCHA_SECRET) {
        console.error("RECAPTCHA_SECRET not set!");
        throw new Error("Server configuration error: RECAPTCHA_SECRET not set");
      }

      try {
        const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${RECAPTCHA_SECRET}&response=${captchaToken}`,
        });
        
        recaptchaResult = await recaptchaResponse.json();
        console.log("reCAPTCHA result:", recaptchaResult);

        if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
          console.warn("reCAPTCHA verification failed. Score:", recaptchaResult.score);
          return {
            statusCode: 400,
            headers: { 
              "Access-Control-Allow-Origin": "https://www.bridge-interactive.com",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
              success: false, 
              message: "reCAPTCHA verification failed" 
            })
          };
        }
      } catch (recaptchaError) {
        console.error("reCAPTCHA error:", recaptchaError);
        throw recaptchaError;
      }
    } else {
      console.log("Test mode: skipping reCAPTCHA");
    }

    /*** STEP 2: Try to register in Paddle ***/
    let paddleResponse = null;
    let paddleError = null;

    if (PADDLE_API_KEY && PADDLE_PLAN_ID) {
      try {
        console.log("Calling Paddle API to create customer + subscription...");

        const payload = {
          name: `${body.firstName} ${body.lastName}`,
          email: body.email,
          custom_id: body.customId,
          address: {
            country_code: body.countryCode,
            postal_code: body.postalCode,
            city: body.city,
            region: body.state,
          },
          company_number: body.companyNumber,
          tax_identifier: body.taxIdentifier,
          currency_code: body.currencyCode || "USD",
          locale: body.locale || "en-US",
          marketing_consent: !!body.marketingConsent,
          phone_number: body.phoneNumber,
        };

        const response = await fetch(PADDLE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PADDLE_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Paddle error ${response.status}: ${text}`);
        }

        paddleResponse = await response.json();
        console.log("✅ Paddle customer created:", paddleResponse);
      } catch (err) {
        console.error("❌ Paddle API call failed:", err.message);
        paddleError = err.message;
      }
    } else {
      console.warn("⚠️ Paddle credentials missing. Skipping Paddle API call.");
      paddleError = "Paddle configuration missing in Lambda environment";
    }

    // Prepare Paddle status report for the email for back office:
    let paddleStatusHtml = `
    <div class="section">
      <h3>Paddle Registration</h3>
      <div class="info-row"><span class="label">Status:</span> ⚠️ Skipped — Paddle configuration missing</div>
    </div>
  `;
  
  if (PADDLE_API_KEY && PADDLE_PLAN_ID) {
    if (paddleResponse) {
      paddleStatusHtml = `
        <div class="section">
          <h3>Paddle Registration</h3>
          <div class="info-row"><span class="label">Status:</span> ✅ Created Successfully</div>
          <div class="info-row"><span class="label">Customer ID:</span> ${paddleResponse.data?.id || 'N/A'}</div>
        </div>
      `;
    } else if (paddleError) {
      paddleStatusHtml = `
        <div class="section">
          <h3>Paddle Registration</h3>
          <div class="info-row"><span class="label">Status:</span> ❌ Failed</div>
          <div class="info-row"><span class="label">Error:</span> ${paddleError}</div>
        </div>
      `;
    }
  }

    // Format email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #4f46e5; }
        .section h3 { margin-top: 0; color: #4f46e5; }
        .info-row { margin: 8px 0; }
        .label { font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🎉 New Free Trial Registration</h2>
        </div>

        <div class="section">
            <h3>Personal Information</h3>
            <div class="info-row"><span class="label">Name:</span> ${body.firstName} ${body.lastName}</div>
            <div class="info-row"><span class="label">Email:</span> ${body.email}</div>
            <div class="info-row"><span class="label">Phone:</span> ${body.phoneNumber || 'Not provided'}</div>
            <div class="info-row"><span class="label">Marketing:</span> ${body.marketingConsent ? 'Yes' : 'No'}</div>
        </div>

        <div class="section">
            <h3>Company Information</h3>
            <div class="info-row"><span class="label">Company:</span> ${body.companyName}</div>
            <div class="info-row"><span class="label">Customer ID:</span> ${body.customId}</div>
            <div class="info-row"><span class="label">Location:</span> ${body.city}, ${body.state || body.countryCode}</div>
            <div class="info-row"><span class="label">Country:</span> ${body.countryCode}</div>
            <div class="info-row"><span class="label">Postal Code:</span> ${body.postalCode}</div>
        </div>

        <div class="section">
            <h3>Subscription Details</h3>
            <div class="info-row"><span class="label">Trial Period:</span> ${body.trialDays} days</div>
            <div class="info-row"><span class="label">Currency:</span> ${body.currencyCode}</div>
        </div>

        <div class="section">
            <div class="info-row"><span class="label">reCAPTCHA Score:</span> ${recaptchaResult.score.toFixed(2)}/1.0</div>
            <div class="info-row"><span class="label">Submitted:</span> ${new Date().toISOString()}</div>
        </div>

        ${paddleStatusHtml}
        <div class="footer">
            <p>This is an automated registration. Please follow up within 24 hours.</p>
        </div>
    </div>
</body>
</html>
    `;

    console.log("Sending email...");
    
    const params = {
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [TO_EMAIL]
      },
      Message: {
        Subject: {
          Data: `New Trial: ${body.firstName} ${body.lastName} (${body.companyName})`,
          Charset: "UTF-8"
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: "UTF-8"
          }
        }
      }
    };

    const result = await ses.send(new SendEmailCommand(params));
    console.log("Email sent! ID:", result.MessageId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://www.bridge-interactive.com",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        message: "Registration successful! Email sent.",
        paddleStatus: paddleResponse ? "created" : (PADDLE_API_KEY && PADDLE_PLAN_ID) ? "failed" : "skipped",
        paddleError: paddleError || null,
        paddleCustomer: paddleResponse || null
      })
    };


  } catch (err) {
    console.error("=== ERROR ===");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://www.bridge-interactive.com",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        message: "Error: " + err.message
      })
    };
  }
};