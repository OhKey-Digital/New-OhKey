# 🚀 Guía de despliegue en VPS — OhKey

Esta guía explica cómo desplegar este proyecto Astro (con adaptador `@astrojs/node` en modo `standalone`) en un VPS donde **ya existen otros sitios web funcionando**, sin interferir con ellos.

La estrategia es:
1. La app Astro corre como un proceso Node.js **aislado**, gestionado por **PM2**, escuchando solo en un **puerto local** (no expuesto directamente a internet).
2. **Nginx** actúa como reverse proxy: recibe el tráfico HTTPS del dominio/subdominio de este proyecto y lo redirige internamente a ese puerto, **sin tocar** la configuración de los demás sitios.

---

## 0. Requisitos previos

- Acceso SSH al VPS con permisos de `sudo`.
- Node.js ≥22.12.0 instalado (verificar con `node -v`).
- pnpm instalado (`npm install -g pnpm` si no está).
- Nginx ya instalado y sirviendo otros sitios (no se necesita reinstalar nada).
- PM2 instalado globalmente: `npm install -g pm2`.
- Un dominio o subdominio apuntando (registro DNS tipo A) a la IP del VPS — por ejemplo `ohkeydigital.com` o `app.ohkeydigital.com`.

> ⚠️ **Regla de oro:** nunca edites archivos de configuración de otros sitios ni el bloque `http {}` global de Nginx. Cada sitio vive en su propio archivo dentro de `sites-available/` y en su propio proceso PM2.

---

## 1. Elegir un puerto local exclusivo

Antes de desplegar, revisa qué puertos ya están en uso en el VPS para no chocar con otra app:

```bash
sudo lsof -i -P -n | grep LISTEN
pm2 list
```

Elige un puerto libre y dedicado solo a este proyecto. En esta guía usamos **`4321`** como ejemplo (puerto por defecto de Astro). Si ya está ocupado, usa otro (ej. `3001`, `3010`, etc.) y ajusta los comandos siguientes en consecuencia.

---

## 2. Clonar el proyecto en una carpeta aislada

Usa una ruta exclusiva para este proyecto, separada de otros sitios:

```bash
sudo mkdir -p /var/www/ohkey
sudo chown $USER:$USER /var/www/ohkey
git clone <url-del-repositorio> /var/www/ohkey
cd /var/www/ohkey
```

---

## 3. Instalar dependencias y compilar

```bash
pnpm install
pnpm build
```

Esto genera:
- `dist/server/entry.mjs` → el servidor Node autocontenido.
- `dist/client/` → los assets estáticos (CSS, JS, imágenes).

---

## 4. Configurar variables de entorno

Crea el archivo `.env` en la raíz del proyecto **en el servidor** (no se commitea nunca a git):

```bash
nano /var/www/ohkey/.env
```

Contenido:
```env
PUBLIC_PIXEL_ID=782341138085266
META_ACCESS_TOKEN=tu_token_real_de_la_conversions_api
HOST=127.0.0.1
PORT=4321
```

> `HOST=127.0.0.1` es importante: hace que el servidor Node **solo escuche en localhost**, no en todas las interfaces de red. Así, aunque el puerto quede "abierto" en el VPS, no es accesible directamente desde internet — solo a través de Nginx.

---

## 5. Levantar el proceso con PM2

PM2 mantiene el proceso vivo, lo reinicia si falla y permite gestionarlo de forma aislada del resto de apps del VPS.

Crea un archivo de configuración dedicado, `ecosystem.config.cjs`, dentro de `/var/www/ohkey`:

```js
module.exports = {
  apps: [
    {
      name: "ohkey",               // nombre único: no debe chocar con otras apps de PM2
      script: "./dist/server/entry.mjs",
      cwd: "/var/www/ohkey",
      env_file: "./.env",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

Arrancar el proceso:
```bash
cd /var/www/ohkey
pm2 start ecosystem.config.cjs
```

Verificar que está corriendo en el puerto correcto y de forma aislada del resto:
```bash
pm2 list
pm2 logs ohkey
curl http://127.0.0.1:4321
```

Guardar el estado de PM2 para que sobreviva a un reinicio del VPS (esto **no afecta** otros procesos ya registrados en PM2, solo agrega el nuevo):
```bash
pm2 save
pm2 startup   # solo la primera vez que se configura PM2 en el servidor
```

---

## 6. Configurar Nginx como reverse proxy (sin tocar otros sitios)

Cada sitio en Nginx vive en su propio archivo dentro de `sites-available/`. Vamos a crear uno nuevo, exclusivo para este proyecto — **no se edita ningún archivo existente de otros dominios**.

```bash
sudo nano /etc/nginx/sites-available/ohkey
```

Contenido (ajusta `server_name` a tu dominio/subdominio real):

```nginx
server {
    listen 80;
    server_name ohkeydigital.com www.ohkeydigital.com;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;

        # Headers necesarios para que el CAPI (Conversions API) reciba
        # la IP real del visitante y no la IP interna de Nginx.
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Soporte de conexiones persistentes (websockets / keep-alive)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Activar el sitio creando un symlink (no se modifica `nginx.conf` global ni otros sitios):

```bash
sudo ln -s /etc/nginx/sites-available/ohkey /etc/nginx/sites-enabled/ohkey
```

Verificar que la configuración completa de Nginx (incluyendo los demás sitios) sigue siendo válida antes de aplicar cambios:

```bash
sudo nginx -t
```

Si el resultado es `syntax is ok` / `test is successful`, recargar Nginx (recarga, no reinicio — los demás sitios no sufren downtime):

```bash
sudo systemctl reload nginx
```

---

## 7. Habilitar HTTPS solo para este dominio

Usando Certbot (no afecta certificados de otros dominios ya configurados):

```bash
sudo certbot --nginx -d ohkeydigital.com -d www.ohkeydigital.com
```

Certbot detecta automáticamente el bloque `server` de `sites-available/ohkey` y añade la configuración SSL solo ahí.

---

## 8. Verificación final

1. **El proceso Node está corriendo y aislado:**
   ```bash
   pm2 list
   ```
2. **Nginx enruta correctamente:**
   ```bash
   curl -I https://ohkeydigital.com
   ```
3. **El CAPI recibe la IP real:** abre el sitio, dispara un evento "Contact" (botón de WhatsApp) y revisa en *Meta Events Manager → Test Events* que el `client_ip_address` corresponda a una IP pública real, no a `127.0.0.1`.
4. **Otros sitios del VPS siguen funcionando:** verifica que no hubo downtime visitando los demás dominios alojados en el mismo servidor.

---

## 9. Operación diaria (actualizar el sitio)

Para desplegar una nueva versión sin afectar otros sitios:

```bash
cd /var/www/ohkey
git pull origin main
pnpm install
pnpm build
pm2 reload ohkey   # reload (no restart): minimiza downtime de esta app únicamente
```

`pm2 reload` solo reinicia el proceso `ohkey`; el resto de procesos PM2 (de otros proyectos) no se ven afectados.

---

## 🔒 Resumen de aislamiento

| Recurso                 | Aislamiento aplicado                                         |
|--------------------------|---------------------------------------------------------------|
| Proceso Node              | Gestionado por PM2 con nombre único (`ohkey`), escucha solo en `127.0.0.1:4321` |
| Carpeta del proyecto       | Ruta exclusiva `/var/www/ohkey`, no comparte directorio con otros sitios |
| Configuración de Nginx     | Archivo propio en `sites-available/ohkey`, no se edita ningún archivo existente |
| Certificado SSL            | Generado solo para el dominio de este proyecto                |
| Variables de entorno       | Archivo `.env` propio del proyecto, no compartido             |
