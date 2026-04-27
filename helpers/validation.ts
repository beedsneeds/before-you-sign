export const checkString = (
  str: string,
  minLength: number,
  maxLength: number | undefined,
  invalidChars: RegExp,
) => {
  str = str.trim();
  if (typeof str !== 'string') {
    throw `Error: ${str} must be a string.`;
  }
  if (str.length === 0) {
    throw `Error: ${str} cannot be an empty string or just spaces.`;
  }
  if (str.length < minLength) {
    throw `Error: ${str} must be at least ${minLength} characters long.`;
  }
  if (maxLength === undefined || maxLength === null) {
    maxLength = Infinity;
  }
  if (str.length > maxLength) {
    throw `Error: ${str} must be no more than ${maxLength} characters long.`;
  }
  if (invalidChars.test(str)) {
    throw `Error: ${str} constains invalid characters.`;
  }

  return str;
};
