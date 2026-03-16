import { RAFFLE_CONFIG } from "@shared/raffle";
import { markOrderSyncedToSheets } from "./db";

/**
 * Sync paid tickets to Google Sheets via the Apps Script Web App.
 * The original page used a POST to the same API endpoint.
 */
export async function syncToGoogleSheets(
  orderId: number,
  ticketNumbers: string[],
  buyerName: string,
  buyerPhone: string
): Promise<boolean> {
  try {
    const payload = {
      boletos: ticketNumbers,
      nombre: buyerName,
      telefono: buyerPhone,
      estado: "pagado",
    };

    const response = await fetch(RAFFLE_CONFIG.googleSheetsApi, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      await markOrderSyncedToSheets(orderId);
      console.log(`[Sheets] Synced order ${orderId} with tickets: ${ticketNumbers.join(", ")}`);
      return true;
    } else {
      console.error(`[Sheets] Failed to sync order ${orderId}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`[Sheets] Error syncing order ${orderId}:`, error);
    return false;
  }
}
