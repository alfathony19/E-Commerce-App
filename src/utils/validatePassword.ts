// src/utils/validatePassword.ts
export const validatePassword = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]:;"'|,.<>/?]).{8,}$/;
  return passwordRegex.test(password);
};
