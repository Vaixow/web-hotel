require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Middleware para validar token desde el header Authorization: Bearer TOKEN
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó token de autorización' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer TOKEN"
  if (token !== process.env.AUTH_TOKEN) {
    return res.status(403).json({ error: 'Token inválido o no autorizado' });
  }

  next();
}

// Configurar transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Endpoint protegido por token
app.post('/enviarCorreo', verificarToken, async (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 50px 20px;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 0 25px rgba(0,0,0,0.1);">
        
        <!-- Encabezado -->
        <div style="background-color: #0d6efd; padding: 30px; text-align: center; color: #fff;">
          <h1 style="margin: 0; font-size: 24px;">Nueva Consulta Recibida</h1>
          <p style="margin: 5px 0 0; font-size: 14px;">Desde el formulario de contacto de la API</p>
        </div>

        <!-- Cuerpo del mensaje -->
        <div style="padding: 30px; color: #333; font-size: 16px; line-height: 1.6;">
          <p><strong>👤 Nombre:</strong> ${nombre}</p>
          <p><strong>📧 Correo:</strong> <a href="mailto:${correo}" style="color: #0d6efd;">${correo}</a></p>
          <p><strong>📝 Mensaje:</strong></p>
          <blockquote style="border-left: 4px solid #0d6efd; background: #f9f9f9; padding: 15px 20px; margin: 15px 0; border-radius: 5px; color: #555;">
            ${mensaje}
          </blockquote>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 20px; text-align: center; font-size: 13px; color: #888;">
          Este correo fue generado automáticamente por el sistema de contacto de <strong>paulotaipe.noha.cl</strong>.<br>
          Responde directamente a <a href="mailto:${correo}" style="color: #0d6efd;">${correo}</a> si deseas continuar la conversación.
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Api de Correos de parte de " <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    cc: correo,
    subject: `Correo desde la API de parte de ${nombre}`,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado correctamente');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo', detalle: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
