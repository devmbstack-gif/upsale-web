export type CountryOption = {
  name: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  dialCode: string;
};

/** Global country list with currency, timezone, and WhatsApp dial code defaults. */
export const WORLD_COUNTRIES: CountryOption[] = [
  { name: "Afghanistan", currency: "AFN", currencySymbol: "؋", timezone: "Asia/Kabul", dialCode: "+93" },
  { name: "Albania", currency: "ALL", currencySymbol: "L", timezone: "Europe/Tirane", dialCode: "+355" },
  { name: "Algeria", currency: "DZD", currencySymbol: "د.ج", timezone: "Africa/Algiers", dialCode: "+213" },
  { name: "Argentina", currency: "ARS", currencySymbol: "$", timezone: "America/Argentina/Buenos_Aires", dialCode: "+54" },
  { name: "Armenia", currency: "AMD", currencySymbol: "֏", timezone: "Asia/Yerevan", dialCode: "+374" },
  { name: "Australia", currency: "AUD", currencySymbol: "$", timezone: "Australia/Sydney", dialCode: "+61" },
  { name: "Austria", currency: "EUR", currencySymbol: "€", timezone: "Europe/Vienna", dialCode: "+43" },
  { name: "Azerbaijan", currency: "AZN", currencySymbol: "₼", timezone: "Asia/Baku", dialCode: "+994" },
  { name: "Bahrain", currency: "BHD", currencySymbol: ".د.ب", timezone: "Asia/Bahrain", dialCode: "+973" },
  { name: "Bangladesh", currency: "BDT", currencySymbol: "৳", timezone: "Asia/Dhaka", dialCode: "+880" },
  { name: "Belarus", currency: "BYN", currencySymbol: "Br", timezone: "Europe/Minsk", dialCode: "+375" },
  { name: "Belgium", currency: "EUR", currencySymbol: "€", timezone: "Europe/Brussels", dialCode: "+32" },
  { name: "Bolivia", currency: "BOB", currencySymbol: "Bs.", timezone: "America/La_Paz", dialCode: "+591" },
  { name: "Bosnia and Herzegovina", currency: "BAM", currencySymbol: "KM", timezone: "Europe/Sarajevo", dialCode: "+387" },
  { name: "Brazil", currency: "BRL", currencySymbol: "R$", timezone: "America/Sao_Paulo", dialCode: "+55" },
  { name: "Brunei", currency: "BND", currencySymbol: "$", timezone: "Asia/Brunei", dialCode: "+673" },
  { name: "Bulgaria", currency: "BGN", currencySymbol: "лв", timezone: "Europe/Sofia", dialCode: "+359" },
  { name: "Cambodia", currency: "KHR", currencySymbol: "៛", timezone: "Asia/Phnom_Penh", dialCode: "+855" },
  { name: "Canada", currency: "CAD", currencySymbol: "$", timezone: "America/Toronto", dialCode: "+1" },
  { name: "Chile", currency: "CLP", currencySymbol: "$", timezone: "America/Santiago", dialCode: "+56" },
  { name: "China", currency: "CNY", currencySymbol: "¥", timezone: "Asia/Shanghai", dialCode: "+86" },
  { name: "Colombia", currency: "COP", currencySymbol: "$", timezone: "America/Bogota", dialCode: "+57" },
  { name: "Costa Rica", currency: "CRC", currencySymbol: "₡", timezone: "America/Costa_Rica", dialCode: "+506" },
  { name: "Croatia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Zagreb", dialCode: "+385" },
  { name: "Cyprus", currency: "EUR", currencySymbol: "€", timezone: "Asia/Nicosia", dialCode: "+357" },
  { name: "Czech Republic", currency: "CZK", currencySymbol: "Kč", timezone: "Europe/Prague", dialCode: "+420" },
  { name: "Denmark", currency: "DKK", currencySymbol: "kr", timezone: "Europe/Copenhagen", dialCode: "+45" },
  { name: "Dominican Republic", currency: "DOP", currencySymbol: "$", timezone: "America/Santo_Domingo", dialCode: "+1" },
  { name: "Ecuador", currency: "USD", currencySymbol: "$", timezone: "America/Guayaquil", dialCode: "+593" },
  { name: "Egypt", currency: "EGP", currencySymbol: "£", timezone: "Africa/Cairo", dialCode: "+20" },
  { name: "Estonia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Tallinn", dialCode: "+372" },
  { name: "Ethiopia", currency: "ETB", currencySymbol: "Br", timezone: "Africa/Addis_Ababa", dialCode: "+251" },
  { name: "Finland", currency: "EUR", currencySymbol: "€", timezone: "Europe/Helsinki", dialCode: "+358" },
  { name: "France", currency: "EUR", currencySymbol: "€", timezone: "Europe/Paris", dialCode: "+33" },
  { name: "Georgia", currency: "GEL", currencySymbol: "₾", timezone: "Asia/Tbilisi", dialCode: "+995" },
  { name: "Germany", currency: "EUR", currencySymbol: "€", timezone: "Europe/Berlin", dialCode: "+49" },
  { name: "Ghana", currency: "GHS", currencySymbol: "₵", timezone: "Africa/Accra", dialCode: "+233" },
  { name: "Greece", currency: "EUR", currencySymbol: "€", timezone: "Europe/Athens", dialCode: "+30" },
  { name: "Hong Kong", currency: "HKD", currencySymbol: "$", timezone: "Asia/Hong_Kong", dialCode: "+852" },
  { name: "Hungary", currency: "HUF", currencySymbol: "Ft", timezone: "Europe/Budapest", dialCode: "+36" },
  { name: "Iceland", currency: "ISK", currencySymbol: "kr", timezone: "Atlantic/Reykjavik", dialCode: "+354" },
  { name: "India", currency: "INR", currencySymbol: "₹", timezone: "Asia/Kolkata", dialCode: "+91" },
  { name: "Indonesia", currency: "IDR", currencySymbol: "Rp", timezone: "Asia/Jakarta", dialCode: "+62" },
  { name: "Iran", currency: "IRR", currencySymbol: "﷼", timezone: "Asia/Tehran", dialCode: "+98" },
  { name: "Iraq", currency: "IQD", currencySymbol: "ع.د", timezone: "Asia/Baghdad", dialCode: "+964" },
  { name: "Ireland", currency: "EUR", currencySymbol: "€", timezone: "Europe/Dublin", dialCode: "+353" },
  { name: "Israel", currency: "ILS", currencySymbol: "₪", timezone: "Asia/Jerusalem", dialCode: "+972" },
  { name: "Italy", currency: "EUR", currencySymbol: "€", timezone: "Europe/Rome", dialCode: "+39" },
  { name: "Japan", currency: "JPY", currencySymbol: "¥", timezone: "Asia/Tokyo", dialCode: "+81" },
  { name: "Jordan", currency: "JOD", currencySymbol: "د.ا", timezone: "Asia/Amman", dialCode: "+962" },
  { name: "Kazakhstan", currency: "KZT", currencySymbol: "₸", timezone: "Asia/Almaty", dialCode: "+7" },
  { name: "Kenya", currency: "KES", currencySymbol: "KSh", timezone: "Africa/Nairobi", dialCode: "+254" },
  { name: "Kuwait", currency: "KWD", currencySymbol: "د.ك", timezone: "Asia/Kuwait", dialCode: "+965" },
  { name: "Latvia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Riga", dialCode: "+371" },
  { name: "Lebanon", currency: "LBP", currencySymbol: "ل.ل", timezone: "Asia/Beirut", dialCode: "+961" },
  { name: "Lithuania", currency: "EUR", currencySymbol: "€", timezone: "Europe/Vilnius", dialCode: "+370" },
  { name: "Luxembourg", currency: "EUR", currencySymbol: "€", timezone: "Europe/Luxembourg", dialCode: "+352" },
  { name: "Malaysia", currency: "MYR", currencySymbol: "RM", timezone: "Asia/Kuala_Lumpur", dialCode: "+60" },
  { name: "Maldives", currency: "MVR", currencySymbol: "Rf", timezone: "Indian/Maldives", dialCode: "+960" },
  { name: "Malta", currency: "EUR", currencySymbol: "€", timezone: "Europe/Malta", dialCode: "+356" },
  { name: "Mexico", currency: "MXN", currencySymbol: "$", timezone: "America/Mexico_City", dialCode: "+52" },
  { name: "Morocco", currency: "MAD", currencySymbol: "د.م.", timezone: "Africa/Casablanca", dialCode: "+212" },
  { name: "Nepal", currency: "NPR", currencySymbol: "रू", timezone: "Asia/Kathmandu", dialCode: "+977" },
  { name: "Netherlands", currency: "EUR", currencySymbol: "€", timezone: "Europe/Amsterdam", dialCode: "+31" },
  { name: "New Zealand", currency: "NZD", currencySymbol: "$", timezone: "Pacific/Auckland", dialCode: "+64" },
  { name: "Nigeria", currency: "NGN", currencySymbol: "₦", timezone: "Africa/Lagos", dialCode: "+234" },
  { name: "Norway", currency: "NOK", currencySymbol: "kr", timezone: "Europe/Oslo", dialCode: "+47" },
  { name: "Oman", currency: "OMR", currencySymbol: "ر.ع.", timezone: "Asia/Muscat", dialCode: "+968" },
  { name: "Pakistan", currency: "PKR", currencySymbol: "₨", timezone: "Asia/Karachi", dialCode: "+92" },
  { name: "Palestine", currency: "ILS", currencySymbol: "₪", timezone: "Asia/Gaza", dialCode: "+970" },
  { name: "Panama", currency: "PAB", currencySymbol: "B/.", timezone: "America/Panama", dialCode: "+507" },
  { name: "Peru", currency: "PEN", currencySymbol: "S/", timezone: "America/Lima", dialCode: "+51" },
  { name: "Philippines", currency: "PHP", currencySymbol: "₱", timezone: "Asia/Manila", dialCode: "+63" },
  { name: "Poland", currency: "PLN", currencySymbol: "zł", timezone: "Europe/Warsaw", dialCode: "+48" },
  { name: "Portugal", currency: "EUR", currencySymbol: "€", timezone: "Europe/Lisbon", dialCode: "+351" },
  { name: "Qatar", currency: "QAR", currencySymbol: "ر.ق", timezone: "Asia/Qatar", dialCode: "+974" },
  { name: "Romania", currency: "RON", currencySymbol: "lei", timezone: "Europe/Bucharest", dialCode: "+40" },
  { name: "Russia", currency: "RUB", currencySymbol: "₽", timezone: "Europe/Moscow", dialCode: "+7" },
  { name: "Saudi Arabia", currency: "SAR", currencySymbol: "﷼", timezone: "Asia/Riyadh", dialCode: "+966" },
  { name: "Serbia", currency: "RSD", currencySymbol: "дин.", timezone: "Europe/Belgrade", dialCode: "+381" },
  { name: "Singapore", currency: "SGD", currencySymbol: "$", timezone: "Asia/Singapore", dialCode: "+65" },
  { name: "Slovakia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Bratislava", dialCode: "+421" },
  { name: "Slovenia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Ljubljana", dialCode: "+386" },
  { name: "South Africa", currency: "ZAR", currencySymbol: "R", timezone: "Africa/Johannesburg", dialCode: "+27" },
  { name: "South Korea", currency: "KRW", currencySymbol: "₩", timezone: "Asia/Seoul", dialCode: "+82" },
  { name: "Spain", currency: "EUR", currencySymbol: "€", timezone: "Europe/Madrid", dialCode: "+34" },
  { name: "Sri Lanka", currency: "LKR", currencySymbol: "Rs", timezone: "Asia/Colombo", dialCode: "+94" },
  { name: "Sweden", currency: "SEK", currencySymbol: "kr", timezone: "Europe/Stockholm", dialCode: "+46" },
  { name: "Switzerland", currency: "CHF", currencySymbol: "Fr", timezone: "Europe/Zurich", dialCode: "+41" },
  { name: "Taiwan", currency: "TWD", currencySymbol: "NT$", timezone: "Asia/Taipei", dialCode: "+886" },
  { name: "Thailand", currency: "THB", currencySymbol: "฿", timezone: "Asia/Bangkok", dialCode: "+66" },
  { name: "Turkey", currency: "TRY", currencySymbol: "₺", timezone: "Europe/Istanbul", dialCode: "+90" },
  { name: "Ukraine", currency: "UAH", currencySymbol: "₴", timezone: "Europe/Kyiv", dialCode: "+380" },
  { name: "United Arab Emirates", currency: "AED", currencySymbol: "د.إ", timezone: "Asia/Dubai", dialCode: "+971" },
  { name: "United Kingdom", currency: "GBP", currencySymbol: "£", timezone: "Europe/London", dialCode: "+44" },
  { name: "United States", currency: "USD", currencySymbol: "$", timezone: "America/New_York", dialCode: "+1" },
  { name: "Uruguay", currency: "UYU", currencySymbol: "$", timezone: "America/Montevideo", dialCode: "+598" },
  { name: "Uzbekistan", currency: "UZS", currencySymbol: "soʻm", timezone: "Asia/Tashkent", dialCode: "+998" },
  { name: "Venezuela", currency: "VES", currencySymbol: "Bs.", timezone: "America/Caracas", dialCode: "+58" },
  { name: "Vietnam", currency: "VND", currencySymbol: "₫", timezone: "Asia/Ho_Chi_Minh", dialCode: "+84" },
  { name: "Other", currency: "USD", currencySymbol: "$", timezone: "UTC", dialCode: "+1" },
];

export const countryNames = WORLD_COUNTRIES.map((c) => c.name);

export const currencyOptions = Array.from(
  new Map(WORLD_COUNTRIES.map((c) => [c.currency, c])).values(),
).map((c) => ({ code: c.currency, symbol: c.currencySymbol }));

export const timezoneOptions = Array.from(
  new Set(WORLD_COUNTRIES.map((c) => c.timezone)),
).sort();

export const dialCodeOptions = Array.from(
  new Map(WORLD_COUNTRIES.map((c) => [`${c.dialCode}-${c.name}`, c])).values(),
).map((c) => ({ country: c.name, code: c.dialCode }));

export function findCountry(name: string): CountryOption | undefined {
  return WORLD_COUNTRIES.find((c) => c.name === name);
}

export function formatCurrencyLabel(code: string, symbol: string) {
  return `${code} (${symbol})`;
}
