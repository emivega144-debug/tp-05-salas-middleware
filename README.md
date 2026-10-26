# Trabajo Práctico 05 #

## Descripción ##
Esta aplicación permite consultar reservas de salas de estudio y realizar nuevas reservas mediante un formulario. Las reservas se almacenan en memoria mientras la aplicación está en ejecución.

## Instalación ##

Instalar las dependencias con npm install

## Ejecución ##
Para iniciar la aplicación ingresamos en la consola npm start.

## Rutas ##

El sistema implementa el siguiente contrato de rutas:
1. GET /: Página principal
2. GET /estado:	Estado del servicio en formato JSON
3. GET /reservas:	Lista de reservas
4. GET /reservas/nueva: Formulario para crear una reserva
5. GET /reservas/:id: Ver detalle de una reserva
6. POST /reservas: Endpoint para procesar el formulario de nueva reserva.	




## Pipeline de middleware ##
El recorrido principal de una solicitud es:

Morgan
↓
identificarSolicitud
↓
medirDuracion
↓
expressLayouts
↓
express.static
↓
express.urlencoded
↓
express.json
↓
Rutas
↓
reservasRouter
↓
404

## Alcance de cada función ##
- Morgan: Registra información de cada solicitud que llega al servidor.

- identificarSolicitud: Genera un identificador único para cada petición.

- medirDuracion: Calcula cuánto tarda en completarse una respuesta.

- prepararAreaReservas: Define datos compartidos para las vistas de reservas.

- validarReserva: Comprueba que los datos ingresados sean válidos.

- crearReserva: Guarda la reserva en memoria y redirige al listado.

## Validación ## 

Antes de crear una reserva se verifica que:

- Todos los campos estén completos.
- El email contenga @.
- La sala sea válida.
- El turno sea válido.
- La cantidad de personas sea un número entre 1 y 6.
- Si hay errores se muestra un mensaje y la reserva no se crea.

## Pruebas manuales ##

Se probaron los siguientes casos:

- Acceso a la página principal.
- Consulta del estado del servicio.
- Listado de reservas.
- Visualización de una reserva existente.
- Reserva inexistente (404).
- Formulario vacío.
- Email inválido.
- Cantidad de personas fuera del rango permitido.
- Creación exitosa de una reserva.

## Persistencia temporal ##

Las reservas nuevas se almacenan únicamente en memoria. Si se reinicia el servidor, solamente permanecen las reservas iniciales definidas en el código.

## Diagramas ##

## POST válido ##

POST /reservas
   ↓
Morgan
   ↓
identificarSolicitud
   ↓
medirDuracion
   ↓
reservasRouter
   ↓
validarReserva
   ↓
crearReserva
   ↓
302 /reservas
   ↓
finish

## POST inválido ##

POST /reservas
   ↓
Morgan
   ↓
identificarSolicitud
   ↓
medirDuracion
   ↓
reservasRouter
   ↓
validarReserva
   ↓
400 Error
   ↓
Fin del proceso

## Preguntas ##


1. Los middleware incorporados son los que ya vienen incluidos en Express, como express.json() y express.urlencoded(). Los middleware de terceros son creados por otras personas y se agregan al proyecto mediante npm, como Morgan. Los middleware personalizados son los que desarrollé específicamente para esta aplicación, por ejemplo identificarSolicitud y medirDuracion.

2. next() se utiliza cuando un middleware termina su tarea y necesita que la solicitud continúe por el resto del pipeline. Gracias a esto, varios middleware pueden trabajar sobre la misma petición antes de llegar a la respuesta final.

3. Los parsers se ejecutan antes de validar porque son los encargados de procesar los datos enviados por el cliente. De esta forma, la validación puede acceder correctamente a la información almacenada en req.body y comprobar que los datos sean válidos.

4. El alcance global afecta a todas las solicitudes de la aplicación. El alcance de router solamente se aplica a las rutas que pertenecen a un router específico, como el de reservas. El alcance de ruta actúa únicamente sobre una ruta determinada cuando es necesario realizar una tarea puntual.

5. El evento finish se utiliza para saber cuándo la respuesta ya terminó de enviarse al cliente. Esto permite medir correctamente la duración completa de la solicitud y registrar información precisa sobre el resultado obtenido.

6. Montar un router permite agrupar rutas relacionadas bajo una misma ruta principal. En este proyecto, todas las rutas de reservas se agrupan bajo /reservas, lo que ayuda a mantener el código más organizado y fácil de mantener.

7. Cuando se envía el formulario se realiza un POST /reservas. Si los datos son correctos, el servidor responde con una redirección 302. Luego el navegador realiza automáticamente un GET /reservas para mostrar la lista actualizada sin volver a enviar el formulario.

8. Las reservas nuevas se guardan únicamente en memoria mediante un arreglo de JavaScript. Cuando el servidor se reinicia, esa información se pierde y vuelven a cargarse solamente los datos iniciales definidos en el código.