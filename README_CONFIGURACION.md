# 🎫 Rifa Automatizada ETER KPOP MX - Guía de Configuración

## ✅ Estado Actual
Tu proyecto está **completamente configurado** con las credenciales reales de Stripe en modo **producción (Live Mode)**. Esto significa que **ya puede cobrar dinero real**.

---

## 📋 Credenciales Configuradas

### Stripe
- ✅ **Clave Secreta de Stripe:** Configurada (`sk_live_...`)
- ✅ **Secreto de Webhook:** Configurado (`whsec_...`)
- ✅ **URL del Webhook:** `https://dedika-studio-eter-rifa.manus.space/api/stripe/webhook`

---

## 🚀 Cómo Desplegar (Subir a Producción)

Tu aplicación ya está alojada en: `https://dedika-studio-eter-rifa.manus.space/`

### Pasos para actualizar:

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Compilar la aplicación:**
   ```bash
   pnpm build
   ```

3. **Iniciar en producción:**
   ```bash
   pnpm start
   ```

---

## 🔧 Configuración de la Base de Datos

Si aún no tienes una base de datos configurada, necesitarás:

1. **Crear una base de datos MySQL** (en tu hosting o localmente).
2. **Obtener la URL de conexión** (formato: `mysql://usuario:contraseña@host:puerto/nombre_bd`).
3. **Actualizar el archivo `.env`:**
   ```
   DATABASE_URL=mysql://usuario:contraseña@host:puerto/nombre_bd
   ```
4. **Ejecutar las migraciones:**
   ```bash
   pnpm db:push
   ```
5. **Poblar los boletos (1000 tickets):**
   ```bash
   node seed-tickets.mjs
   ```

---

## 💬 Notificaciones por WhatsApp (Opcional)

Para activar notificaciones automáticas cuando alguien compre boletos:

1. **Crear cuenta en Twilio:** https://www.twilio.com/
2. **Obtener tus credenciales:**
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM` (tu número de WhatsApp Business)
3. **Actualizar `.env`:**
   ```
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_WHATSAPP_FROM=whatsapp:+52...
   ```
4. **Descomentar el código en `server/whatsapp.ts`** (líneas 42-68).

---

## 🧪 Pruebas

Ejecutar los tests para verificar que todo funciona:
```bash
pnpm test
```

**Resultado esperado:** 7 tests pasando ✅

---

## 📊 Flujo de Compra

1. **Usuario selecciona boletos** en la página.
2. **Ingresa sus datos** (nombre, teléfono, email).
3. **Hace clic en "Pagar"** → Se abre Stripe Checkout.
4. **Paga con su tarjeta** → Stripe procesa el pago.
5. **Webhook de Stripe avisa** a tu servidor que el pago fue exitoso.
6. **Tu servidor:**
   - Marca los boletos como "Vendidos".
   - Sincroniza con Google Sheets.
   - Envía confirmación por WhatsApp (si está configurado).
7. **Usuario ve página de éxito** y puede revisar sus boletos en "Revisa tus boletos".

---

## 🔐 Seguridad

- **Nunca compartas tu `STRIPE_SECRET_KEY`** con nadie.
- **Nunca subas el archivo `.env` a GitHub** (ya está en `.gitignore`).
- **Usa variables de entorno** en tu servidor de hosting.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de tu servidor.
2. Verifica que el `DATABASE_URL` sea correcto.
3. Confirma que el Webhook de Stripe esté activo.
4. Prueba en modo de prueba de Stripe primero (desactiva "Modo de prueba" en tu dashboard de Stripe).

---

## ✨ ¡Listo!

Tu rifa ya está lista para vender boletos. **¡Buena suerte con tu sorteo! 🍀**
