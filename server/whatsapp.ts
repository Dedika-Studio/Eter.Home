import axios from "axios";

/**
 * Enviar mensaje de WhatsApp a través de Twilio
 * Este es un ejemplo de integración. En producción, necesitarás:
 * 1. Cuenta de Twilio con WhatsApp Business API
 * 2. Variables de entorno: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 */

interface WhatsAppMessage {
  to: string; // Número de teléfono en formato internacional: +526571921509
  ticketNumbers: string[];
  buyerName: string;
  totalAmount: number;
}

/**
 * Enviar confirmación de compra por WhatsApp
 * Para este MVP, usamos un endpoint simulado o un servicio como Twilio
 */
export async function sendWhatsAppConfirmation(
  message: WhatsAppMessage
): Promise<boolean> {
  try {
    // Formato del mensaje
    const ticketList = message.ticketNumbers.join(", ");
    const whatsappMessage = `
¡Hola ${message.buyerName}! 🎉

Tu compra en la Rifa Album BTS - Skool Luv Affair ha sido confirmada.

*Detalles de tu compra:*
📱 Boletos: ${ticketList}
💰 Total: $${message.totalAmount} MXN
📅 Sorteo: Martes 31 de Marzo de 2026, 20:00 hrs

Puedes revisar tus boletos en cualquier momento ingresando tu número de teléfono en nuestra página.

¡Mucho éxito! 🍀
    `.trim();

    // Opción 1: Si tienes Twilio configurado
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    //
    // if (!accountSid || !authToken || !fromNumber) {
    //   console.warn("[WhatsApp] Twilio credentials not configured");
    //   return false;
    // }
    //
    // const response = await axios.post(
    //   `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    //   {
    //     From: fromNumber,
    //     To: message.to,
    //     Body: whatsappMessage,
    //   },
    //   {
    //     auth: {
    //       username: accountSid,
    //       password: authToken,
    //     },
    //   }
    // );
    //
    // console.log("[WhatsApp] Message sent:", response.data.sid);
    // return true;

    // Opción 2: Para MVP/testing, registrar el mensaje
    console.log("[WhatsApp] Message queued for:", message.to);
    console.log("[WhatsApp] Content:", whatsappMessage);

    // En producción, aquí iría la lógica real de Twilio o tu proveedor de WhatsApp
    return true;
  } catch (error) {
    console.error("[WhatsApp] Failed to send message:", error);
    return false;
  }
}

/**
 * Enviar mensaje de WhatsApp a número específico (para notificaciones del admin)
 */
export async function sendWhatsAppToAdmin(
  message: string,
  adminPhone: string = "+526571921509"
): Promise<boolean> {
  try {
    console.log(`[WhatsApp Admin] Sending to ${adminPhone}: ${message}`);
    // Implementar lógica real aquí
    return true;
  } catch (error) {
    console.error("[WhatsApp Admin] Failed:", error);
    return false;
  }
}
