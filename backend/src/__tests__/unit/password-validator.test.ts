import { validatePassword, getPasswordStrengthLabel } from '../../shared/validation/password-validator';

describe('Password Validator', () => {
  describe('validatePassword', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve ter no mínimo 8 caracteres');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos uma letra maiúscula');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos uma letra minúscula');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('Password!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos um número');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos um caractere especial (!@#$%^&*...)');
    });

    it('should reject common passwords', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Esta senha é muito comum e fácil de adivinhar');
    });

    it('should accept a strong password', () => {
      const result = validatePassword('MyStr0ng!Password');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should give higher score to longer passwords', () => {
      const shortPassword = validatePassword('Pass123!');
      const longPassword = validatePassword('MyVeryLongStr0ng!Password');
      expect(longPassword.score).toBeGreaterThan(shortPassword.score);
    });

    it('should warn about repeated characters', () => {
      const result = validatePassword('Passs123!word');
      expect(result.suggestions).toContain('Evite repetir o mesmo caractere mais de 2 vezes seguidas');
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('should return correct labels for each score', () => {
      expect(getPasswordStrengthLabel(0)).toBe('Muito fraca');
      expect(getPasswordStrengthLabel(1)).toBe('Muito fraca');
      expect(getPasswordStrengthLabel(2)).toBe('Fraca');
      expect(getPasswordStrengthLabel(3)).toBe('Razoável');
      expect(getPasswordStrengthLabel(4)).toBe('Forte');
      expect(getPasswordStrengthLabel(5)).toBe('Muito forte');
    });
  });
});



