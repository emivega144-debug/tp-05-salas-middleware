const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");

const PORT = 3000;
const app = express();


const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
let reservas = [
  { id: 1, estudiante: "Juan Perez", email: "juan@test.com", sala: "Sala Norte", fecha: "2026-10-30", turno: "Mañana", personas: 3 },
  { id: 2, estudiante: "Ana Gomez", email: "ana@test.com", sala: "Sala Sur", fecha: "2026-10-31", turno: "Tarde", personas: 2 },
  { id: 3, estudiante: "Luis Silva", email: "luis@test.com", sala: "Sala Multimedia", fecha: "2026-11-01", turno: "Noche", personas: 5 },
  { id: 4, estudiante: "Maria Paz", email: "maria@test.com", sala: "Sala Norte", fecha: "2026-11-02", turno: "Mañana", personas: 1 }
];


let contadorSolicitudes = 0;
function identificarSolicitud(req, res, next) {
  contadorSolicitudes += 1;
  res.locals.solicitudId = `BIB-${String(contadorSolicitudes).padStart(4, "0")}`;
  next();
}


function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on("finish", () => {
    const fin = process.hrtime.bigint();
    const milisegundos = Number(fin - inicio) / 1_000_000;
    console.log(`[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${milisegundos.toFixed(2)} ms`);
  });
  next();
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.set("layout", "layouts/main");

app.use(morgan("dev"));
app.use(identificarSolicitud);
app.use(medirDuracion);
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get("/", (req, res) => {
  res.render("inicio", { titulo: "Inicio - Sistema de Reservas" });
});

app.get("/estado", (req, res) => {
  res.json({
    servicio: "activo",
    reservas: reservas.length,
    solicitudId: res.locals.solicitudId
  });
});


const reservasRouter = express.Router();

function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas";
  next();
}
reservasRouter.use(prepararAreaReservas);


function validarReserva(req, res, next) {
  const estudiante = String(req.body.estudiante ?? "").trim();
  const email = String(req.body.email ?? "").trim();
  const sala = String(req.body.sala ?? "").trim();
  const fecha = String(req.body.fecha ?? "").trim();
  const turno = String(req.body.turno ?? "").trim();
  const personas = Number(req.body.personas);

  const errores = [];
  if (!estudiante) errores.push("El nombre es obligatorio.");
  if (!email || !email.includes("@")) errores.push("Email inválido.");
  if (!salasPermitidas.includes(sala)) errores.push("Sala no permitida.");
  if (!["Mañana", "Tarde", "Noche"].includes(turno)) errores.push("Turno inválido.");
  if (!Number.isInteger(personas) || personas < 1 || personas > 6) errores.push("La cantidad de personas debe ser entre 1 y 6.");

  if (errores.length > 0) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva Reserva",
      error: errores.join(" "),
      valores: req.body
    });
  }

  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
  next();
}


reservasRouter.get("/", (req, res) => {
  res.render("reservas/lista", { titulo: "Listado de Reservas", reservas });
});

reservasRouter.get("/nueva", (req, res) => {
  res.render("reservas/nueva", { titulo: "Nueva Reserva", error: null, valores: {} });
});

reservasRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const reserva = reservas.find((r) => r.id === id);
  if (!reserva) {
    return res.status(404).render("no-encontrado", {
      titulo: "Reserva no encontrada",
      mensaje: "No existe una reserva con ese identificador."
    });
  }
  res.render("reservas/detalle", { titulo: `Reserva #${id}`, reserva });
});

function crearReserva(req, res) {
  const ultimoId = reservas.reduce((mayor, r) => Math.max(mayor, r.id), 0);
  reservas.push({ id: ultimoId + 1, ...req.reservaValidada });
  res.redirect("/reservas");
}

reservasRouter.post("/", validarReserva, crearReserva);


app.use("/reservas", reservasRouter);


app.use((req, res) => {
  res.status(404).render("no-encontrado", {
    titulo: "Página no encontrada",
    mensaje: "La dirección solicitada no existe."
  });
});

app.listen(PORT, () => {
  console.log(`Aplicación disponible en http://localhost:${PORT}`);
});