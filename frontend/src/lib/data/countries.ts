export type CountryOption = {
  name: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  dialCode: string;
  /** National number example (no country code) shown as the phone placeholder. */
  phoneExample: string;
};

/** Global country list A–Z with currency, timezone, dial code, and phone format. */
export const WORLD_COUNTRIES: CountryOption[] = [
  { name: "Afghanistan", currency: "AFN", currencySymbol: "؋", timezone: "Asia/Kabul", dialCode: "+93", phoneExample: "70 123 4567" },
  { name: "Albania", currency: "ALL", currencySymbol: "L", timezone: "Europe/Tirane", dialCode: "+355", phoneExample: "67 123 4567" },
  { name: "Algeria", currency: "DZD", currencySymbol: "د.ج", timezone: "Africa/Algiers", dialCode: "+213", phoneExample: "551 23 45 67" },
  { name: "Andorra", currency: "EUR", currencySymbol: "€", timezone: "Europe/Andorra", dialCode: "+376", phoneExample: "312 345" },
  { name: "Angola", currency: "AOA", currencySymbol: "Kz", timezone: "Africa/Luanda", dialCode: "+244", phoneExample: "923 123 456" },
  { name: "Antigua and Barbuda", currency: "XCD", currencySymbol: "$", timezone: "America/Antigua", dialCode: "+1", phoneExample: "268 464 1234" },
  { name: "Argentina", currency: "ARS", currencySymbol: "$", timezone: "America/Argentina/Buenos_Aires", dialCode: "+54", phoneExample: "11 2345 6789" },
  { name: "Armenia", currency: "AMD", currencySymbol: "֏", timezone: "Asia/Yerevan", dialCode: "+374", phoneExample: "77 123456" },
  { name: "Australia", currency: "AUD", currencySymbol: "$", timezone: "Australia/Sydney", dialCode: "+61", phoneExample: "412 345 678" },
  { name: "Austria", currency: "EUR", currencySymbol: "€", timezone: "Europe/Vienna", dialCode: "+43", phoneExample: "664 123456" },
  { name: "Azerbaijan", currency: "AZN", currencySymbol: "₼", timezone: "Asia/Baku", dialCode: "+994", phoneExample: "50 123 45 67" },
  { name: "Bahamas", currency: "BSD", currencySymbol: "$", timezone: "America/Nassau", dialCode: "+1", phoneExample: "242 359 1234" },
  { name: "Bahrain", currency: "BHD", currencySymbol: ".د.ب", timezone: "Asia/Bahrain", dialCode: "+973", phoneExample: "3600 1234" },
  { name: "Bangladesh", currency: "BDT", currencySymbol: "৳", timezone: "Asia/Dhaka", dialCode: "+880", phoneExample: "1712 345678" },
  { name: "Barbados", currency: "BBD", currencySymbol: "$", timezone: "America/Barbados", dialCode: "+1", phoneExample: "246 250 1234" },
  { name: "Belarus", currency: "BYN", currencySymbol: "Br", timezone: "Europe/Minsk", dialCode: "+375", phoneExample: "29 123 45 67" },
  { name: "Belgium", currency: "EUR", currencySymbol: "€", timezone: "Europe/Brussels", dialCode: "+32", phoneExample: "470 12 34 56" },
  { name: "Belize", currency: "BZD", currencySymbol: "$", timezone: "America/Belize", dialCode: "+501", phoneExample: "622 1234" },
  { name: "Benin", currency: "XOF", currencySymbol: "Fr", timezone: "Africa/Porto-Novo", dialCode: "+229", phoneExample: "90 01 12 34" },
  { name: "Bhutan", currency: "BTN", currencySymbol: "Nu.", timezone: "Asia/Thimphu", dialCode: "+975", phoneExample: "17 12 34 56" },
  { name: "Bolivia", currency: "BOB", currencySymbol: "Bs.", timezone: "America/La_Paz", dialCode: "+591", phoneExample: "71234567" },
  { name: "Bosnia and Herzegovina", currency: "BAM", currencySymbol: "KM", timezone: "Europe/Sarajevo", dialCode: "+387", phoneExample: "61 123 456" },
  { name: "Botswana", currency: "BWP", currencySymbol: "P", timezone: "Africa/Gaborone", dialCode: "+267", phoneExample: "71 123 456" },
  { name: "Brazil", currency: "BRL", currencySymbol: "R$", timezone: "America/Sao_Paulo", dialCode: "+55", phoneExample: "11 91234 5678" },
  { name: "Brunei", currency: "BND", currencySymbol: "$", timezone: "Asia/Brunei", dialCode: "+673", phoneExample: "712 3456" },
  { name: "Bulgaria", currency: "BGN", currencySymbol: "лв", timezone: "Europe/Sofia", dialCode: "+359", phoneExample: "87 123 4567" },
  { name: "Burkina Faso", currency: "XOF", currencySymbol: "Fr", timezone: "Africa/Ouagadougou", dialCode: "+226", phoneExample: "70 12 34 56" },
  { name: "Burundi", currency: "BIF", currencySymbol: "Fr", timezone: "Africa/Bujumbura", dialCode: "+257", phoneExample: "79 12 34 56" },
  { name: "Cambodia", currency: "KHR", currencySymbol: "៛", timezone: "Asia/Phnom_Penh", dialCode: "+855", phoneExample: "91 234 567" },
  { name: "Cameroon", currency: "XAF", currencySymbol: "Fr", timezone: "Africa/Douala", dialCode: "+237", phoneExample: "6 71 23 45 67" },
  { name: "Canada", currency: "CAD", currencySymbol: "$", timezone: "America/Toronto", dialCode: "+1", phoneExample: "416 555 0123" },
  { name: "Cape Verde", currency: "CVE", currencySymbol: "$", timezone: "Atlantic/Cape_Verde", dialCode: "+238", phoneExample: "991 12 34" },
  { name: "Central African Republic", currency: "XAF", currencySymbol: "Fr", timezone: "Africa/Bangui", dialCode: "+236", phoneExample: "70 01 23 45" },
  { name: "Chad", currency: "XAF", currencySymbol: "Fr", timezone: "Africa/Ndjamena", dialCode: "+235", phoneExample: "63 01 23 45" },
  { name: "Chile", currency: "CLP", currencySymbol: "$", timezone: "America/Santiago", dialCode: "+56", phoneExample: "9 1234 5678" },
  { name: "China", currency: "CNY", currencySymbol: "¥", timezone: "Asia/Shanghai", dialCode: "+86", phoneExample: "131 2345 6789" },
  { name: "Colombia", currency: "COP", currencySymbol: "$", timezone: "America/Bogota", dialCode: "+57", phoneExample: "321 1234567" },
  { name: "Comoros", currency: "KMF", currencySymbol: "Fr", timezone: "Indian/Comoro", dialCode: "+269", phoneExample: "321 23 45" },
  { name: "Congo", currency: "XAF", currencySymbol: "Fr", timezone: "Africa/Brazzaville", dialCode: "+242", phoneExample: "06 123 4567" },
  { name: "Costa Rica", currency: "CRC", currencySymbol: "₡", timezone: "America/Costa_Rica", dialCode: "+506", phoneExample: "8312 3456" },
  { name: "Croatia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Zagreb", dialCode: "+385", phoneExample: "91 234 5678" },
  { name: "Cuba", currency: "CUP", currencySymbol: "$", timezone: "America/Havana", dialCode: "+53", phoneExample: "5 1234567" },
  { name: "Cyprus", currency: "EUR", currencySymbol: "€", timezone: "Asia/Nicosia", dialCode: "+357", phoneExample: "96 123456" },
  { name: "Czech Republic", currency: "CZK", currencySymbol: "Kč", timezone: "Europe/Prague", dialCode: "+420", phoneExample: "601 123 456" },
  { name: "Denmark", currency: "DKK", currencySymbol: "kr", timezone: "Europe/Copenhagen", dialCode: "+45", phoneExample: "20 12 34 56" },
  { name: "Djibouti", currency: "DJF", currencySymbol: "Fr", timezone: "Africa/Djibouti", dialCode: "+253", phoneExample: "77 12 34 56" },
  { name: "Dominica", currency: "XCD", currencySymbol: "$", timezone: "America/Dominica", dialCode: "+1", phoneExample: "767 225 1234" },
  { name: "Dominican Republic", currency: "DOP", currencySymbol: "$", timezone: "America/Santo_Domingo", dialCode: "+1", phoneExample: "809 234 5678" },
  { name: "Ecuador", currency: "USD", currencySymbol: "$", timezone: "America/Guayaquil", dialCode: "+593", phoneExample: "99 123 4567" },
  { name: "Egypt", currency: "EGP", currencySymbol: "£", timezone: "Africa/Cairo", dialCode: "+20", phoneExample: "100 123 4567" },
  { name: "El Salvador", currency: "USD", currencySymbol: "$", timezone: "America/El_Salvador", dialCode: "+503", phoneExample: "7012 3456" },
  { name: "Equatorial Guinea", currency: "XAF", currencySymbol: "Fr", timezone: "Africa/Malabo", dialCode: "+240", phoneExample: "222 123 456" },
  { name: "Eritrea", currency: "ERN", currencySymbol: "Nfk", timezone: "Africa/Asmara", dialCode: "+291", phoneExample: "7 123 456" },
  { name: "Estonia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Tallinn", dialCode: "+372", phoneExample: "5123 4567" },
  { name: "Eswatini", currency: "SZL", currencySymbol: "L", timezone: "Africa/Mbabane", dialCode: "+268", phoneExample: "7612 3456" },
  { name: "Ethiopia", currency: "ETB", currencySymbol: "Br", timezone: "Africa/Addis_Ababa", dialCode: "+251", phoneExample: "91 123 4567" },
  { name: "Fiji", currency: "FJD", currencySymbol: "$", timezone: "Pacific/Fiji", dialCode: "+679", phoneExample: "701 2345" },
  { name: "Finland", currency: "EUR", currencySymbol: "€", timezone: "Europe/Helsinki", dialCode: "+358", phoneExample: "40 123 4567" },
  { name: "France", currency: "EUR", currencySymbol: "€", timezone: "Europe/Paris", dialCode: "+33", phoneExample: "6 12 34 56 78" },
  { name: "Gabon", currency: "XAF", currencySymbol: "Fr", timezone: "Africa/Libreville", dialCode: "+241", phoneExample: "06 12 34 56" },
  { name: "Gambia", currency: "GMD", currencySymbol: "D", timezone: "Africa/Banjul", dialCode: "+220", phoneExample: "301 2345" },
  { name: "Georgia", currency: "GEL", currencySymbol: "₾", timezone: "Asia/Tbilisi", dialCode: "+995", phoneExample: "555 12 34 56" },
  { name: "Germany", currency: "EUR", currencySymbol: "€", timezone: "Europe/Berlin", dialCode: "+49", phoneExample: "151 23456789" },
  { name: "Ghana", currency: "GHS", currencySymbol: "₵", timezone: "Africa/Accra", dialCode: "+233", phoneExample: "24 123 4567" },
  { name: "Greece", currency: "EUR", currencySymbol: "€", timezone: "Europe/Athens", dialCode: "+30", phoneExample: "691 234 5678" },
  { name: "Grenada", currency: "XCD", currencySymbol: "$", timezone: "America/Grenada", dialCode: "+1", phoneExample: "473 403 1234" },
  { name: "Guatemala", currency: "GTQ", currencySymbol: "Q", timezone: "America/Guatemala", dialCode: "+502", phoneExample: "5123 4567" },
  { name: "Guinea", currency: "GNF", currencySymbol: "Fr", timezone: "Africa/Conakry", dialCode: "+224", phoneExample: "601 12 34 56" },
  { name: "Guinea-Bissau", currency: "XOF", currencySymbol: "Fr", timezone: "Africa/Bissau", dialCode: "+245", phoneExample: "955 012 345" },
  { name: "Guyana", currency: "GYD", currencySymbol: "$", timezone: "America/Guyana", dialCode: "+592", phoneExample: "609 1234" },
  { name: "Haiti", currency: "HTG", currencySymbol: "G", timezone: "America/Port-au-Prince", dialCode: "+509", phoneExample: "34 10 1234" },
  { name: "Honduras", currency: "HNL", currencySymbol: "L", timezone: "America/Tegucigalpa", dialCode: "+504", phoneExample: "9123 4567" },
  { name: "Hong Kong", currency: "HKD", currencySymbol: "$", timezone: "Asia/Hong_Kong", dialCode: "+852", phoneExample: "5123 4567" },
  { name: "Hungary", currency: "HUF", currencySymbol: "Ft", timezone: "Europe/Budapest", dialCode: "+36", phoneExample: "20 123 4567" },
  { name: "Iceland", currency: "ISK", currencySymbol: "kr", timezone: "Atlantic/Reykjavik", dialCode: "+354", phoneExample: "611 1234" },
  { name: "India", currency: "INR", currencySymbol: "₹", timezone: "Asia/Kolkata", dialCode: "+91", phoneExample: "98765 43210" },
  { name: "Indonesia", currency: "IDR", currencySymbol: "Rp", timezone: "Asia/Jakarta", dialCode: "+62", phoneExample: "812 3456 7890" },
  { name: "Iran", currency: "IRR", currencySymbol: "﷼", timezone: "Asia/Tehran", dialCode: "+98", phoneExample: "912 345 6789" },
  { name: "Iraq", currency: "IQD", currencySymbol: "ع.د", timezone: "Asia/Baghdad", dialCode: "+964", phoneExample: "790 123 4567" },
  { name: "Ireland", currency: "EUR", currencySymbol: "€", timezone: "Europe/Dublin", dialCode: "+353", phoneExample: "85 012 3456" },
  { name: "Israel", currency: "ILS", currencySymbol: "₪", timezone: "Asia/Jerusalem", dialCode: "+972", phoneExample: "50 123 4567" },
  { name: "Italy", currency: "EUR", currencySymbol: "€", timezone: "Europe/Rome", dialCode: "+39", phoneExample: "312 345 6789" },
  { name: "Ivory Coast", currency: "XOF", currencySymbol: "Fr", timezone: "Africa/Abidjan", dialCode: "+225", phoneExample: "01 23 45 67 89" },
  { name: "Jamaica", currency: "JMD", currencySymbol: "$", timezone: "America/Jamaica", dialCode: "+1", phoneExample: "876 210 1234" },
  { name: "Japan", currency: "JPY", currencySymbol: "¥", timezone: "Asia/Tokyo", dialCode: "+81", phoneExample: "90 1234 5678" },
  { name: "Jordan", currency: "JOD", currencySymbol: "د.ا", timezone: "Asia/Amman", dialCode: "+962", phoneExample: "7 9012 3456" },
  { name: "Kazakhstan", currency: "KZT", currencySymbol: "₸", timezone: "Asia/Almaty", dialCode: "+7", phoneExample: "701 234 5678" },
  { name: "Kenya", currency: "KES", currencySymbol: "KSh", timezone: "Africa/Nairobi", dialCode: "+254", phoneExample: "712 345678" },
  { name: "Kiribati", currency: "AUD", currencySymbol: "$", timezone: "Pacific/Tarawa", dialCode: "+686", phoneExample: "7201 2345" },
  { name: "Kuwait", currency: "KWD", currencySymbol: "د.ك", timezone: "Asia/Kuwait", dialCode: "+965", phoneExample: "5001 2345" },
  { name: "Kyrgyzstan", currency: "KGS", currencySymbol: "с", timezone: "Asia/Bishkek", dialCode: "+996", phoneExample: "700 123 456" },
  { name: "Laos", currency: "LAK", currencySymbol: "₭", timezone: "Asia/Vientiane", dialCode: "+856", phoneExample: "20 23 123 456" },
  { name: "Latvia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Riga", dialCode: "+371", phoneExample: "21 234 567" },
  { name: "Lebanon", currency: "LBP", currencySymbol: "ل.ل", timezone: "Asia/Beirut", dialCode: "+961", phoneExample: "71 123 456" },
  { name: "Lesotho", currency: "LSL", currencySymbol: "L", timezone: "Africa/Maseru", dialCode: "+266", phoneExample: "5012 3456" },
  { name: "Liberia", currency: "LRD", currencySymbol: "$", timezone: "Africa/Monrovia", dialCode: "+231", phoneExample: "77 012 3456" },
  { name: "Libya", currency: "LYD", currencySymbol: "ل.د", timezone: "Africa/Tripoli", dialCode: "+218", phoneExample: "91 2345678" },
  { name: "Liechtenstein", currency: "CHF", currencySymbol: "Fr", timezone: "Europe/Vaduz", dialCode: "+423", phoneExample: "660 123 456" },
  { name: "Lithuania", currency: "EUR", currencySymbol: "€", timezone: "Europe/Vilnius", dialCode: "+370", phoneExample: "612 34567" },
  { name: "Luxembourg", currency: "EUR", currencySymbol: "€", timezone: "Europe/Luxembourg", dialCode: "+352", phoneExample: "621 123 456" },
  { name: "Macao", currency: "MOP", currencySymbol: "P", timezone: "Asia/Macau", dialCode: "+853", phoneExample: "6612 3456" },
  { name: "Madagascar", currency: "MGA", currencySymbol: "Ar", timezone: "Indian/Antananarivo", dialCode: "+261", phoneExample: "32 12 345 67" },
  { name: "Malawi", currency: "MWK", currencySymbol: "MK", timezone: "Africa/Blantyre", dialCode: "+265", phoneExample: "991 23 45 67" },
  { name: "Malaysia", currency: "MYR", currencySymbol: "RM", timezone: "Asia/Kuala_Lumpur", dialCode: "+60", phoneExample: "12 345 6789" },
  { name: "Maldives", currency: "MVR", currencySymbol: "Rf", timezone: "Indian/Maldives", dialCode: "+960", phoneExample: "771 2345" },
  { name: "Mali", currency: "XOF", currencySymbol: "Fr", timezone: "Africa/Bamako", dialCode: "+223", phoneExample: "65 01 23 45" },
  { name: "Malta", currency: "EUR", currencySymbol: "€", timezone: "Europe/Malta", dialCode: "+356", phoneExample: "9696 1234" },
  { name: "Marshall Islands", currency: "USD", currencySymbol: "$", timezone: "Pacific/Majuro", dialCode: "+692", phoneExample: "455 0123" },
  { name: "Mauritania", currency: "MRU", currencySymbol: "UM", timezone: "Africa/Nouakchott", dialCode: "+222", phoneExample: "22 12 34 56" },
  { name: "Mauritius", currency: "MUR", currencySymbol: "₨", timezone: "Indian/Mauritius", dialCode: "+230", phoneExample: "5251 2345" },
  { name: "Mexico", currency: "MXN", currencySymbol: "$", timezone: "America/Mexico_City", dialCode: "+52", phoneExample: "55 1234 5678" },
  { name: "Micronesia", currency: "USD", currencySymbol: "$", timezone: "Pacific/Chuuk", dialCode: "+691", phoneExample: "350 1234" },
  { name: "Moldova", currency: "MDL", currencySymbol: "L", timezone: "Europe/Chisinau", dialCode: "+373", phoneExample: "621 12 345" },
  { name: "Monaco", currency: "EUR", currencySymbol: "€", timezone: "Europe/Monaco", dialCode: "+377", phoneExample: "6 12 34 56 78" },
  { name: "Mongolia", currency: "MNT", currencySymbol: "₮", timezone: "Asia/Ulaanbaatar", dialCode: "+976", phoneExample: "8812 3456" },
  { name: "Montenegro", currency: "EUR", currencySymbol: "€", timezone: "Europe/Podgorica", dialCode: "+382", phoneExample: "67 123 456" },
  { name: "Morocco", currency: "MAD", currencySymbol: "د.م.", timezone: "Africa/Casablanca", dialCode: "+212", phoneExample: "612 345678" },
  { name: "Mozambique", currency: "MZN", currencySymbol: "MT", timezone: "Africa/Maputo", dialCode: "+258", phoneExample: "82 123 4567" },
  { name: "Myanmar", currency: "MMK", currencySymbol: "K", timezone: "Asia/Yangon", dialCode: "+95", phoneExample: "9 212 3456" },
  { name: "Namibia", currency: "NAD", currencySymbol: "$", timezone: "Africa/Windhoek", dialCode: "+264", phoneExample: "81 123 4567" },
  { name: "Nauru", currency: "AUD", currencySymbol: "$", timezone: "Pacific/Nauru", dialCode: "+674", phoneExample: "557 1234" },
  { name: "Nepal", currency: "NPR", currencySymbol: "रू", timezone: "Asia/Kathmandu", dialCode: "+977", phoneExample: "984 1234567" },
  { name: "Netherlands", currency: "EUR", currencySymbol: "€", timezone: "Europe/Amsterdam", dialCode: "+31", phoneExample: "6 12345678" },
  { name: "New Zealand", currency: "NZD", currencySymbol: "$", timezone: "Pacific/Auckland", dialCode: "+64", phoneExample: "21 123 4567" },
  { name: "Nicaragua", currency: "NIO", currencySymbol: "C$", timezone: "America/Managua", dialCode: "+505", phoneExample: "8123 4567" },
  { name: "Niger", currency: "XOF", currencySymbol: "Fr", timezone: "Africa/Niamey", dialCode: "+227", phoneExample: "93 12 34 56" },
  { name: "Nigeria", currency: "NGN", currencySymbol: "₦", timezone: "Africa/Lagos", dialCode: "+234", phoneExample: "802 123 4567" },
  { name: "North Korea", currency: "KPW", currencySymbol: "₩", timezone: "Asia/Pyongyang", dialCode: "+850", phoneExample: "191 123 4567" },
  { name: "North Macedonia", currency: "MKD", currencySymbol: "ден", timezone: "Europe/Skopje", dialCode: "+389", phoneExample: "70 123 456" },
  { name: "Norway", currency: "NOK", currencySymbol: "kr", timezone: "Europe/Oslo", dialCode: "+47", phoneExample: "406 12 345" },
  { name: "Oman", currency: "OMR", currencySymbol: "ر.ع.", timezone: "Asia/Muscat", dialCode: "+968", phoneExample: "9212 3456" },
  { name: "Pakistan", currency: "PKR", currencySymbol: "₨", timezone: "Asia/Karachi", dialCode: "+92", phoneExample: "300 1234567" },
  { name: "Palau", currency: "USD", currencySymbol: "$", timezone: "Pacific/Palau", dialCode: "+680", phoneExample: "620 1234" },
  { name: "Palestine", currency: "ILS", currencySymbol: "₪", timezone: "Asia/Gaza", dialCode: "+970", phoneExample: "599 123 456" },
  { name: "Panama", currency: "PAB", currencySymbol: "B/.", timezone: "America/Panama", dialCode: "+507", phoneExample: "6123 4567" },
  { name: "Papua New Guinea", currency: "PGK", currencySymbol: "K", timezone: "Pacific/Port_Moresby", dialCode: "+675", phoneExample: "7012 3456" },
  { name: "Paraguay", currency: "PYG", currencySymbol: "₲", timezone: "America/Asuncion", dialCode: "+595", phoneExample: "961 123456" },
  { name: "Peru", currency: "PEN", currencySymbol: "S/", timezone: "America/Lima", dialCode: "+51", phoneExample: "912 345 678" },
  { name: "Philippines", currency: "PHP", currencySymbol: "₱", timezone: "Asia/Manila", dialCode: "+63", phoneExample: "917 123 4567" },
  { name: "Poland", currency: "PLN", currencySymbol: "zł", timezone: "Europe/Warsaw", dialCode: "+48", phoneExample: "512 345 678" },
  { name: "Portugal", currency: "EUR", currencySymbol: "€", timezone: "Europe/Lisbon", dialCode: "+351", phoneExample: "912 345 678" },
  { name: "Qatar", currency: "QAR", currencySymbol: "ر.ق", timezone: "Asia/Qatar", dialCode: "+974", phoneExample: "3312 3456" },
  { name: "Romania", currency: "RON", currencySymbol: "lei", timezone: "Europe/Bucharest", dialCode: "+40", phoneExample: "712 345 678" },
  { name: "Russia", currency: "RUB", currencySymbol: "₽", timezone: "Europe/Moscow", dialCode: "+7", phoneExample: "912 345 67 89" },
  { name: "Rwanda", currency: "RWF", currencySymbol: "Fr", timezone: "Africa/Kigali", dialCode: "+250", phoneExample: "720 123 456" },
  { name: "Saint Kitts and Nevis", currency: "XCD", currencySymbol: "$", timezone: "America/St_Kitts", dialCode: "+1", phoneExample: "869 765 1234" },
  { name: "Saint Lucia", currency: "XCD", currencySymbol: "$", timezone: "America/St_Lucia", dialCode: "+1", phoneExample: "758 284 1234" },
  { name: "Saint Vincent and the Grenadines", currency: "XCD", currencySymbol: "$", timezone: "America/St_Vincent", dialCode: "+1", phoneExample: "784 430 1234" },
  { name: "Samoa", currency: "WST", currencySymbol: "T", timezone: "Pacific/Apia", dialCode: "+685", phoneExample: "72 12345" },
  { name: "San Marino", currency: "EUR", currencySymbol: "€", timezone: "Europe/San_Marino", dialCode: "+378", phoneExample: "66 66 1234" },
  { name: "Sao Tome and Principe", currency: "STN", currencySymbol: "Db", timezone: "Africa/Sao_Tome", dialCode: "+239", phoneExample: "981 2345" },
  { name: "Saudi Arabia", currency: "SAR", currencySymbol: "﷼", timezone: "Asia/Riyadh", dialCode: "+966", phoneExample: "51 234 5678" },
  { name: "Senegal", currency: "XOF", currencySymbol: "Fr", timezone: "Africa/Dakar", dialCode: "+221", phoneExample: "70 123 45 67" },
  { name: "Serbia", currency: "RSD", currencySymbol: "дин.", timezone: "Europe/Belgrade", dialCode: "+381", phoneExample: "60 1234567" },
  { name: "Seychelles", currency: "SCR", currencySymbol: "₨", timezone: "Indian/Mahe", dialCode: "+248", phoneExample: "2 510 123" },
  { name: "Sierra Leone", currency: "SLE", currencySymbol: "Le", timezone: "Africa/Freetown", dialCode: "+232", phoneExample: "25 123456" },
  { name: "Singapore", currency: "SGD", currencySymbol: "$", timezone: "Asia/Singapore", dialCode: "+65", phoneExample: "8123 4567" },
  { name: "Slovakia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Bratislava", dialCode: "+421", phoneExample: "912 123 456" },
  { name: "Slovenia", currency: "EUR", currencySymbol: "€", timezone: "Europe/Ljubljana", dialCode: "+386", phoneExample: "31 234 567" },
  { name: "Solomon Islands", currency: "SBD", currencySymbol: "$", timezone: "Pacific/Guadalcanal", dialCode: "+677", phoneExample: "74 21234" },
  { name: "Somalia", currency: "SOS", currencySymbol: "Sh", timezone: "Africa/Mogadishu", dialCode: "+252", phoneExample: "7 1123456" },
  { name: "South Africa", currency: "ZAR", currencySymbol: "R", timezone: "Africa/Johannesburg", dialCode: "+27", phoneExample: "71 123 4567" },
  { name: "South Korea", currency: "KRW", currencySymbol: "₩", timezone: "Asia/Seoul", dialCode: "+82", phoneExample: "10 1234 5678" },
  { name: "South Sudan", currency: "SSP", currencySymbol: "£", timezone: "Africa/Juba", dialCode: "+211", phoneExample: "977 123 456" },
  { name: "Spain", currency: "EUR", currencySymbol: "€", timezone: "Europe/Madrid", dialCode: "+34", phoneExample: "612 34 56 78" },
  { name: "Sri Lanka", currency: "LKR", currencySymbol: "Rs", timezone: "Asia/Colombo", dialCode: "+94", phoneExample: "71 234 5678" },
  { name: "Sudan", currency: "SDG", currencySymbol: "ج.س.", timezone: "Africa/Khartoum", dialCode: "+249", phoneExample: "91 123 4567" },
  { name: "Suriname", currency: "SRD", currencySymbol: "$", timezone: "America/Paramaribo", dialCode: "+597", phoneExample: "741 2345" },
  { name: "Sweden", currency: "SEK", currencySymbol: "kr", timezone: "Europe/Stockholm", dialCode: "+46", phoneExample: "70 123 45 67" },
  { name: "Switzerland", currency: "CHF", currencySymbol: "Fr", timezone: "Europe/Zurich", dialCode: "+41", phoneExample: "78 123 45 67" },
  { name: "Syria", currency: "SYP", currencySymbol: "£", timezone: "Asia/Damascus", dialCode: "+963", phoneExample: "944 567 890" },
  { name: "Taiwan", currency: "TWD", currencySymbol: "NT$", timezone: "Asia/Taipei", dialCode: "+886", phoneExample: "912 345 678" },
  { name: "Tajikistan", currency: "TJS", currencySymbol: "ЅМ", timezone: "Asia/Dushanbe", dialCode: "+992", phoneExample: "917 12 3456" },
  { name: "Tanzania", currency: "TZS", currencySymbol: "Sh", timezone: "Africa/Dar_es_Salaam", dialCode: "+255", phoneExample: "621 234 567" },
  { name: "Thailand", currency: "THB", currencySymbol: "฿", timezone: "Asia/Bangkok", dialCode: "+66", phoneExample: "81 234 5678" },
  { name: "Timor-Leste", currency: "USD", currencySymbol: "$", timezone: "Asia/Dili", dialCode: "+670", phoneExample: "7721 2345" },
  { name: "Togo", currency: "XOF", currencySymbol: "Fr", timezone: "Africa/Lome", dialCode: "+228", phoneExample: "90 12 34 56" },
  { name: "Tonga", currency: "TOP", currencySymbol: "T$", timezone: "Pacific/Tongatapu", dialCode: "+676", phoneExample: "771 5123" },
  { name: "Trinidad and Tobago", currency: "TTD", currencySymbol: "$", timezone: "America/Port_of_Spain", dialCode: "+1", phoneExample: "868 291 1234" },
  { name: "Tunisia", currency: "TND", currencySymbol: "د.ت", timezone: "Africa/Tunis", dialCode: "+216", phoneExample: "20 123 456" },
  { name: "Turkey", currency: "TRY", currencySymbol: "₺", timezone: "Europe/Istanbul", dialCode: "+90", phoneExample: "501 234 5678" },
  { name: "Turkmenistan", currency: "TMT", currencySymbol: "m", timezone: "Asia/Ashgabat", dialCode: "+993", phoneExample: "65 123456" },
  { name: "Tuvalu", currency: "AUD", currencySymbol: "$", timezone: "Pacific/Funafuti", dialCode: "+688", phoneExample: "90 1234" },
  { name: "Uganda", currency: "UGX", currencySymbol: "Sh", timezone: "Africa/Kampala", dialCode: "+256", phoneExample: "712 345678" },
  { name: "Ukraine", currency: "UAH", currencySymbol: "₴", timezone: "Europe/Kyiv", dialCode: "+380", phoneExample: "50 123 4567" },
  { name: "United Arab Emirates", currency: "AED", currencySymbol: "د.إ", timezone: "Asia/Dubai", dialCode: "+971", phoneExample: "50 123 4567" },
  { name: "United Kingdom", currency: "GBP", currencySymbol: "£", timezone: "Europe/London", dialCode: "+44", phoneExample: "7400 123456" },
  { name: "United States", currency: "USD", currencySymbol: "$", timezone: "America/New_York", dialCode: "+1", phoneExample: "202 555 0123" },
  { name: "Uruguay", currency: "UYU", currencySymbol: "$", timezone: "America/Montevideo", dialCode: "+598", phoneExample: "94 123 456" },
  { name: "Uzbekistan", currency: "UZS", currencySymbol: "soʻm", timezone: "Asia/Tashkent", dialCode: "+998", phoneExample: "90 123 45 67" },
  { name: "Vanuatu", currency: "VUV", currencySymbol: "Vt", timezone: "Pacific/Efate", dialCode: "+678", phoneExample: "591 2345" },
  { name: "Vatican City", currency: "EUR", currencySymbol: "€", timezone: "Europe/Vatican", dialCode: "+39", phoneExample: "312 345 6789" },
  { name: "Venezuela", currency: "VES", currencySymbol: "Bs.", timezone: "America/Caracas", dialCode: "+58", phoneExample: "412 1234567" },
  { name: "Vietnam", currency: "VND", currencySymbol: "₫", timezone: "Asia/Ho_Chi_Minh", dialCode: "+84", phoneExample: "91 234 56 78" },
  { name: "Yemen", currency: "YER", currencySymbol: "﷼", timezone: "Asia/Aden", dialCode: "+967", phoneExample: "712 345 678" },
  { name: "Zambia", currency: "ZMW", currencySymbol: "ZK", timezone: "Africa/Lusaka", dialCode: "+260", phoneExample: "95 1234567" },
  { name: "Zimbabwe", currency: "ZWL", currencySymbol: "$", timezone: "Africa/Harare", dialCode: "+263", phoneExample: "71 234 5678" },
];

/** A–Z countries for UI lists. */
export const COUNTRIES_AZ = [...WORLD_COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name),
);

export const countryNames = COUNTRIES_AZ.map((c) => c.name);

export const currencyOptions = Array.from(
  new Map(WORLD_COUNTRIES.map((c) => [c.currency, c])).values(),
).map((c) => ({ code: c.currency, symbol: c.currencySymbol }));

export const timezoneOptions = Array.from(
  new Set(WORLD_COUNTRIES.map((c) => c.timezone)),
).sort();

export const dialCodeOptions = Array.from(
  new Map(WORLD_COUNTRIES.map((c) => [`${c.dialCode}-${c.name}`, c])).values(),
).map((c) => ({ country: c.name, code: c.dialCode, phoneExample: c.phoneExample }));

export function findCountry(name: string): CountryOption | undefined {
  return WORLD_COUNTRIES.find((c) => c.name === name);
}

export function formatCurrencyLabel(code: string, symbol: string) {
  return `${code} (${symbol})`;
}

export function getPhoneExample(countryName: string): string {
  return findCountry(countryName)?.phoneExample ?? "300 1234567";
}

export function getPhoneDigitCount(countryName: string): number {
  return getPhoneExample(countryName).replace(/\D/g, "").length;
}

/** Normalizes pasted/input digits and groups them like the selected country's example. */
export function formatNationalPhone(countryName: string, input: string): string {
  const country = findCountry(countryName);
  if (!country) return input.replace(/\D/g, "").slice(0, 14);

  const maxDigits = getPhoneDigitCount(countryName);
  const dialDigits = country.dialCode.replace(/\D/g, "");
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith(dialDigits) && digits.length > maxDigits) {
    digits = digits.slice(dialDigits.length);
  }
  if (digits.startsWith("0") && digits.length > maxDigits) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, maxDigits);

  const groupSizes = country.phoneExample.split(/\D+/).map((group) => group.length);
  const groups: string[] = [];
  let offset = 0;
  for (const size of groupSizes) {
    if (offset >= digits.length) break;
    groups.push(digits.slice(offset, offset + size));
    offset += size;
  }
  return groups.join(" ");
}
