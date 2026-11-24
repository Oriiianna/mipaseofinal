# MiPaseo

Aplicación web para conectar dueños de perros con paseadores de la Ciudad de Buenos Aires.

El dueño carga sus mascotas, busca un paseador en su barrio y le pide un paseo en un horario disponible. El paseador lo acepta o lo rechaza, lo marca como realizado cuando termina y el dueño lo confirma. Recién ahí puede dejar una reseña.

Proyecto final de Clientes Web Mobile (Escuela Da Vinci).

## Funcionalidades

### Para todos los usuarios

- Portada pública con la explicación del servicio.
- Registro eligiendo el rol (dueño o paseador), con datos distintos según el rol.
- Ingreso con email y contraseña. Cada rol entra a su propio panel.
- Mi cuenta: cambiar nombre, teléfono, foto de perfil y contraseña.
- Validación de todos los formularios en JavaScript, con mensajes por campo.
- Estados de carga y mensajes de confirmación o error en todas las acciones.

### Dueño

- Mis mascotas: agregar, editar y dar de baja. Cada mascota tiene foto, raza, edad, peso, alimentación, cuidados especiales, si es sociable, si necesita bozal y en qué franjas suele salir.
- Buscar paseadores por barrio y por franja horaria, con su puntaje promedio.
- Ver el perfil de un paseador: datos, grilla de disponibilidad y reseñas.
- Pedir un paseo: se elige la mascota (se muestran sus franjas habituales), el día, una franja en la que el paseador trabaje ese día y un horario cada 30 minutos.
- Mis paseos: ver los paseos por estado, cancelar con motivo antes de que empiecen, confirmar los realizados y dejar una reseña.

### Paseador

- Al registrarse, entra directo a su perfil para cargar la disponibilidad. Hasta que no la carga, no aparece en las búsquedas.
- Perfil profesional: barrio, años de experiencia, descripción y disponibilidad semanal (días por franja).
- Pausar el perfil: deja de aparecer en las búsquedas y no recibe pedidos nuevos.
- Mis paseos: aceptar o rechazar pedidos, marcar como realizado (solo después del horario del paseo) y cancelar con motivo. Ve los datos de la mascota y del dueño.

### Administrador

- Panel con totales de dueños, paseadores, mascotas y paseos, paseos por estado y paseos realizados que el dueño no confirmó en 48 horas.
- Usuarios: suspender y reactivar. Un usuario suspendido puede ingresar, pero ve un aviso para contactar a soporte y no puede usar la app.
- Ver y cancelar cualquier paseo.
- Ver y borrar reseñas.

### Tiempo real

- La lista de paseos se actualiza sola cuando el otro usuario hace un cambio, sin recargar la página.
- El paseador recibe un aviso cuando le llega una solicitud nueva.

### Reglas en la base de datos

Las reglas no dependen solo de la interfaz. Supabase las controla aunque alguien intente saltearlas desde la consola del navegador:

- Políticas RLS en todas las tablas: cada usuario ve y modifica solo lo que le corresponde. El administrador puede ver todo, cancelar paseos, suspender usuarios y borrar reseñas.
- Triggers que validan los paseos: fecha futura, día y franja dentro de la disponibilidad del paseador, duración de 60 minutos, que el paseador no tenga dos paseos aceptados superpuestos y que los cambios de estado sigan el orden permitido.
- Un usuario no puede cambiarse el rol ni quitarse la suspensión.

## Tecnologías

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 3
- Supabase: Auth, Postgres, Storage y Realtime
- lucide-react (íconos)
- react-hot-toast (mensajes)
- ESLint y Prettier

## Instalación

Requisito: Node.js 20.19 o superior.

1. Instalar las dependencias:

   ```
   npm install
   ```

2. El archivo .env con los datos del proyecto de Supabase ya viene incluido en la entrega. Para usar otro proyecto de Supabase, hay que copiar .env.example como .env y completar:

   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_PUBLISHABLE_KEY=
   ```

3. Levantar el proyecto:

   ```
   npm run dev
   ```

4. Abrir http://localhost:5173 en el navegador.

Los usuarios de prueba (administrador, dueño y paseador) están en datos.txt.

### Base de datos desde cero

Solo hace falta si se quiere usar un proyecto de Supabase nuevo. Los archivos de la carpeta supabase/ se corren en orden en el SQL Editor de Supabase, del 01 al 11. Antes de correr 10_admin.sql, hay que registrar desde la app un usuario con el email admin@mipaseo.com.

## Estructura de carpetas

```
public/          logo e imagen de la portada
src/
  components/
    layout/      estructura de las páginas, rutas protegidas y pie
    shared/      componentes que usan varias páginas (tarjeta de paseo, formularios, grilla)
    ui/          piezas básicas (modal, campo de formulario, avatar)
  context/       sesión y perfil del usuario
  hooks/         useAuth
  lib/           cliente de Supabase
  pages/         una carpeta por rol (public, account, owner, walker, admin)
  services/      todas las consultas a Supabase
  utils/         validaciones, horarios y textos fijos
supabase/        tablas, políticas, triggers y buckets, en orden
```

Las páginas no consultan a Supabase directamente: siempre pasan por services/.

## Próximos pasos

- Paseos grupales: que un paseador publique un paseo con varios lugares y los dueños se inscriban.
- Sumar otras provincias además de la Ciudad de Buenos Aires.
