require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- Middleware para validar token en header Authorization: Bearer TOKEN ---
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No se proporcionó token de autorización' });

  const token = authHeader.split(' ')[1];
  if (token !== process.env.AUTH_TOKEN) return res.status(403).json({ error: 'Token inválido o no autorizado' });

  next();
}

// --- Configurar transporte SMTP para envío de correos ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// --- Variables en memoria para datos ---
let clientes = [];
let habitaciones = [];
let reservas = [];
let pagos = [];

// --- ENDPOINTS CLIENTES ---
app.get("/api/clientes", (req, res) => res.json(clientes));
app.get("/api/clientes/:id", (req, res) => {
  const cliente = clientes.find(c => c.id === req.params.id);
  if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
  res.json(cliente);
});
app.post("/api/clientes", (req, res) => {
  const { id, nombre, email } = req.body;
  if (!id || !nombre || !email) return res.status(400).json({ error: "Campos incompletos" });
  if (clientes.find(c => c.id === id)) return res.status(409).json({ error: "ID ya existe" });
  clientes.push({ id, nombre, email });
  res.status(201).json({ message: "Cliente creado" });
});
app.put("/api/clientes/:id", (req, res) => {
  const cliente = clientes.find(c => c.id === req.params.id);
  if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
  const { nombre, email } = req.body;
  if (nombre) cliente.nombre = nombre;
  if (email) cliente.email = email;
  res.json({ message: "Cliente actualizado" });
});
app.delete("/api/clientes/:id", (req, res) => {
  clientes = clientes.filter(c => c.id !== req.params.id);
  res.json({ message: "Cliente eliminado" });
});

// --- ENDPOINTS HABITACIONES ---
app.get("/api/habitaciones", (req, res) => res.json(habitaciones));
app.get("/api/habitaciones/:id", (req, res) => {
  const hab = habitaciones.find(h => h.id === req.params.id);
  if (!hab) return res.status(404).json({ error: "Habitación no encontrada" });
  res.json(hab);
});
app.post("/api/habitaciones", (req, res) => {
  const { id, numero, tipo, precio } = req.body;
  if (!id || !numero || !tipo || !precio) return res.status(400).json({ error: "Campos incompletos" });
  if (habitaciones.find(h => h.id === id)) return res.status(409).json({ error: "ID ya existe" });
  habitaciones.push({ id, numero, tipo, precio: parseFloat(precio) });
  res.status(201).json({ message: "Habitación creada" });
});
app.put("/api/habitaciones/:id", (req, res) => {
  const hab = habitaciones.find(h => h.id === req.params.id);
  if (!hab) return res.status(404).json({ error: "Habitación no encontrada" });
  const { numero, tipo, precio } = req.body;
  if (numero) hab.numero = numero;
  if (tipo) hab.tipo = tipo;
  if (precio) hab.precio = parseFloat(precio);
  res.json({ message: "Habitación actualizada" });
});
app.delete("/api/habitaciones/:id", (req, res) => {
  habitaciones = habitaciones.filter(h => h.id !== req.params.id);
  res.json({ message: "Habitación eliminada" });
});

// --- ENDPOINTS RESERVAS ---
app.get("/api/reservas", (req, res) => {
  const { clienteId } = req.query;
  if (clienteId) {
    const resvs = reservas.filter(r => r.clienteId === clienteId);
    return res.json(resvs);
  }
  res.json(reservas);
});
app.get("/api/reservas/:id", (req, res) => {
  const resv = reservas.find(r => r.id === req.params.id);
  if (!resv) return res.status(404).json({ error: "Reserva no encontrada" });
  res.json(resv);
});
app.post("/api/reservas", (req, res) => {
  const { id, clienteId, habitacionId, fechaEntrada, fechaSalida } = req.body;
  if (!id || !clienteId || !habitacionId || !fechaEntrada || !fechaSalida) return res.status(400).json({ error: "Campos incompletos" });
  if (reservas.find(r => r.id === id)) return res.status(409).json({ error: "ID ya existe" });
  if (!clientes.find(c => c.id === clienteId)) return res.status(400).json({ error: "Cliente no existe" });
  if (!habitaciones.find(h => h.id === habitacionId)) return res.status(400).json({ error: "Habitación no existe" });
  reservas.push({ id, clienteId, habitacionId, fechaEntrada, fechaSalida });
  res.status(201).json({ message: "Reserva creada" });
});
app.put("/api/reservas/:id", (req, res) => {
  const resv = reservas.find(r => r.id === req.params.id);
  if (!resv) return res.status(404).json({ error: "Reserva no encontrada" });
  const { clienteId, habitacionId, fechaEntrada, fechaSalida } = req.body;
  if (clienteId && !clientes.find(c => c.id === clienteId)) return res.status(400).json({ error: "Cliente no existe" });
  if (habitacionId && !habitaciones.find(h => h.id === habitacionId)) return res.status(400).json({ error: "Habitación no existe" });
  if (clienteId) resv.clienteId = clienteId;
  if (habitacionId) resv.habitacionId = habitacionId;
  if (fechaEntrada) resv.fechaEntrada = fechaEntrada;
  if (fechaSalida) resv.fechaSalida = fechaSalida;
  res.json({ message: "Reserva actualizada" });
});
app.delete("/api/reservas/:id", (req, res) => {
  reservas = reservas.filter(r => r.id !== req.params.id);
  res.json({ message: "Reserva eliminada" });
});

// --- ENDPOINTS PAGOS ---
app.get("/api/pagos", (req, res) => res.json(pagos));
app.get("/api/pagos/:id", (req, res) => {
  const pago = pagos.find(p => p.id === req.params.id);
  if (!pago) return res.status(404).json({ error: "Pago no encontrado" });
  res.json(pago);
});
app.post("/api/pagos", (req, res) => {
  const { id, reservaId, monto, fechaPago, metodo } = req.body;
  if (!id || !reservaId || !monto || !fechaPago || !metodo) return res.status(400).json({ error: "Campos incompletos" });
  if (pagos.find(p => p.id === id)) return res.status(409).json({ error: "ID ya existe" });
  if (!reservas.find(r => r.id === reservaId)) return res.status(400).json({ error: "Reserva no existe" });
  pagos.push({ id, reservaId, monto: parseFloat(monto), fechaPago, metodo });
  res.status(201).json({ message: "Pago creado" });
});
app.put("/api/pagos/:id", (req, res) => {
  const pago = pagos.find(p => p.id === req.params.id);
  if (!pago) return res.status(404).json({ error: "Pago no encontrado" });
  const { reservaId, monto, fechaPago, metodo } = req.body;
  if (reservaId && !reservas.find(r => r.id === reservaId)) return res.status(400).json({ error: "Reserva no existe" });
  if (reservaId) pago.reservaId = reservaId;
  if (monto) pago.monto = parseFloat(monto);
  if (fechaPago) pago.fechaPago = fechaPago;
  if (metodo) pago.metodo = metodo;
  res.json({ message: "Pago actualizado" });
});
app.delete("/api/pagos/:id", (req, res) => {
  pagos = pagos.filter(p => p.id !== req.params.id);
  res.json({ message: "Pago eliminado" });
});

// --- ENDPOINT ENVÍO DE CORREO PROTEGIDO ---
app.post('/enviarCorreo', verificarToken, async (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  if(!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #0d6efd;">Nueva Consulta Recibida</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> <a href="mailto:${correo}">${correo}</a></p>
        <p><strong>Mensaje:</strong></p>
        <blockquote style="background:#f9f9f9; padding: 15px; border-left: 4px solid #0d6efd;">${mensaje}</blockquote>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"API Contacto" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    cc: correo,
    subject: `Consulta desde API de ${nombre}`,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar correo', detalle: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API Hotelera corriendo en http://localhost:${PORT}`);
});
