const persianNumbers = [
  /۰/g,
  /۱/g,
  /۲/g,
  /۳/g,
  /۴/g,
  /۵/g,
  /۶/g,
  /۷/g,
  /۸/g,
  /۹/g,
];
const arabicNumbers = [
  /٠/g,
  /١/g,
  /٢/g,
  /٣/g,
  /٤/g,
  /٥/g,
  /٦/g,
  /٧/g,
  /٨/g,
  /٩/g,
];

export const toEnglishDigits = (str: string): string => {
  if (typeof str !== 'string') {
    return str;
  }
  let newStr = str;
  for (let i = 0; i < 10; i++) {
    newStr = newStr
      .replace(persianNumbers[i], i.toString())
      .replace(arabicNumbers[i], i.toString());
  }
  return newStr;
};
