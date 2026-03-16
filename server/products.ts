import { RAFFLE_CONFIG } from "@shared/raffle";

export const RAFFLE_PRODUCT = {
  name: RAFFLE_CONFIG.name,
  description: `Boleto de rifa - ${RAFFLE_CONFIG.storeName}`,
  unitAmount: RAFFLE_CONFIG.pricePerTicket,
  currency: RAFFLE_CONFIG.currency,
  images: RAFFLE_CONFIG.images,
};
