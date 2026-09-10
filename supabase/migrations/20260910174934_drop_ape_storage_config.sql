/*
# Eliminar tabla ape_storage_config

Las credenciales de Wasabi se han movido a secretos de la edge function
(variables de entorno del servidor), donde no son accesibles desde el
navegador. La tabla ape_storage_config ya no es necesaria y suponia un
riesgo de seguridad: cualquier usuario autenticado podia leer las claves
de acceso de Wasabi directamente desde la API de la base de datos.

1. Cambios
- Elimina la tabla `ape_storage_config` y todas sus politicas.
- Las credenciales ahora se configuran como secretos de la edge function
  wasabi-storage via Deno.env.get().
*/
