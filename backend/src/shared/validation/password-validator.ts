export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  errors: string[];
  suggestions: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength: number;
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

const COMMON_PASSWORDS = [
  '123456', '123456789', 'qwerty', 'password', '12345678',
  '111111', '1234567890', '1234567', 'password1', '123123',
  'abc123', '12345', '1234', 'iloveyou', 'admin', 'letmein',
  'welcome', 'monkey', '1q2w3e4r', 'sunshine', 'master',
  'senha', 'senha123', 'admin123', 'root', 'toor', 'pass',
  'test', 'test123', 'guest', 'user', 'login', 'passw0rd',
];

export function validatePassword(
  password: string,
  requirements: Partial<PasswordRequirements> = {}
): PasswordValidationResult {
  const config = { ...DEFAULT_REQUIREMENTS, ...requirements };
  const result: PasswordValidationResult = {
    isValid: true,
    score: 0,
    errors: [],
    suggestions: [],
  };

  if (!password || password.length < config.minLength) {
    result.isValid = false;
    result.errors.push(`A senha deve ter no mínimo ${config.minLength} caracteres`);
  } else {
    result.score += 1;
  }

  if (password && password.length > config.maxLength) {
    result.isValid = false;
    result.errors.push(`A senha deve ter no máximo ${config.maxLength} caracteres`);
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('A senha deve conter pelo menos uma letra maiúscula');
  } else if (/[A-Z]/.test(password)) {
    result.score += 1;
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('A senha deve conter pelo menos uma letra minúscula');
  } else if (/[a-z]/.test(password)) {
    result.score += 1;
  }

  if (config.requireNumbers && !/\d/.test(password)) {
    result.isValid = false;
    result.errors.push('A senha deve conter pelo menos um número');
  } else if (/\d/.test(password)) {
    result.score += 1;
  }

  if (config.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    result.isValid = false;
    result.errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*...)');
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    result.score += 1;
  }

  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    result.isValid = false;
    result.errors.push('Esta senha é muito comum e fácil de adivinhar');
    result.score = 0;
  }

  if (/(.)\1{2,}/.test(password)) {
    result.suggestions.push('Evite repetir o mesmo caractere mais de 2 vezes seguidas');
    result.score = Math.max(0, result.score - 1);
  }

  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i.test(password)) {
    result.suggestions.push('Evite sequências óbvias como "123" ou "abc"');
    result.score = Math.max(0, result.score - 1);
  }

  if (password && password.length >= 12) {
    result.score += 1;
  }

  if (password && password.length >= 16) {
    result.score += 1;
  }

  result.score = Math.min(5, Math.max(0, result.score));

  if (result.score < 3 && result.errors.length === 0) {
    result.suggestions.push('Considere usar uma senha mais longa para maior segurança');
  }

  return result;
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Muito fraca';
    case 2:
      return 'Fraca';
    case 3:
      return 'Razoável';
    case 4:
      return 'Forte';
    case 5:
      return 'Muito forte';
    default:
      return 'Desconhecida';
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'red';
    case 2:
      return 'orange';
    case 3:
      return 'yellow';
    case 4:
      return 'lime';
    case 5:
      return 'green';
    default:
      return 'gray';
  }
}





