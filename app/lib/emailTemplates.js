// app/lib/emailTemplates.js

export function getVerificationEmailTemplate(name, verificationUrl) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérification Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                    🎉 Bienvenue ${name} !
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                    Merci de vous être inscrit ! Pour activer votre compte, veuillez vérifier votre adresse email.
                  </p>

                  <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">
                    Cliquez sur le bouton ci-dessous pour confirmer votre email :
                  </p>

                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${verificationUrl}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: #ffffff; 
                                  text-decoration: none; 
                                  padding: 16px 40px; 
                                  border-radius: 6px; 
                                  font-weight: bold; 
                                  font-size: 16px;
                                  display: inline-block;
                                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                          ✅ Vérifier mon email
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #eee;">
                    Ou copiez ce lien dans votre navigateur :
                  </p>
                  <p style="color: #667eea; font-size: 12px; word-break: break-all; margin: 10px 0;">
                    ${verificationUrl}
                  </p>

                  <!-- Expiration -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                      <td style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px;">
                        <p style="color: #856404; font-size: 14px; margin: 0;">
                          ⏱️ <strong>Ce lien expire dans 24 heures.</strong>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 13px; margin: 0 0 10px;">
                    Vous n'avez pas créé ce compte ?
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 0;">
                    Ignorez simplement cet email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}