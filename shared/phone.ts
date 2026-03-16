/**
 * Validar y formatear número de teléfono mexicano
 * Acepta formatos: 6571921509, 657-192-1509, (657) 192-1509, +52 657 192 1509
 * Retorna: 6571921509 (10 dígitos sin formato)
 */
export function formatPhoneMX(phone: string): string {
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, "");

  // Si comienza con 52 (código de país), remover
  const withoutCountryCode = cleaned.startsWith("52") ? cleaned.slice(2) : cleaned;

  // Validar que tenga exactamente 10 dígitos
  if (withoutCountryCode.length !== 10) {
    throw new Error("El teléfono debe tener 10 dígitos");
  }

  // Validar que comience con 6, 7, 8 o 9 (números válidos en México)
  if (!/^[6789]/.test(withoutCountryCode)) {
    throw new Error("Número de teléfono mexicano inválido");
  }

  return withoutCountryCode;
}

/**
 * Validar si un string es un teléfono mexicano válido
 */
export function isValidPhoneMX(phone: string): boolean {
  try {
    formatPhoneMX(phone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formatear teléfono para mostrar: 657-192-1509
 */
export function displayPhoneMX(phone: string): string {
  const formatted = formatPhoneMX(phone);
  return `${formatted.slice(0, 3)}-${formatted.slice(3, 6)}-${formatted.slice(6)}`;
}
