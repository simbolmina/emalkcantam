export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const numericOnly = phone.replace(/\D/g, '');

  // If it starts with 0, remove it
  const withoutLeadingZero = numericOnly.startsWith('0')
    ? numericOnly.slice(1)
    : numericOnly;

  // If it doesn't start with 90 (Turkey code), add it
  const withCountryCode = withoutLeadingZero.startsWith('90')
    ? withoutLeadingZero
    : `90${withoutLeadingZero}`;

  // Check if the number is valid (should be 12 digits: 90 + 10 digits)
  if (withCountryCode.length !== 12) {
    throw new Error('Geçersiz telefon numarası');
  }

  return withCountryCode;
};

export const formatPhoneForDisplay = (phone: string): string => {
  try {
    const formatted = formatPhoneNumber(phone);
    // Format as: 0(5XX) XXX XX XX
    return `0(${formatted.slice(2, 5)}) ${formatted.slice(
      5,
      8
    )} ${formatted.slice(8, 10)} ${formatted.slice(10, 12)}`;
  } catch (error) {
    return phone; // Return original if invalid
  }
};

export const isValidPhoneNumber = (phone: string): boolean => {
  try {
    formatPhoneNumber(phone);
    return true;
  } catch (error) {
    return false;
  }
};
