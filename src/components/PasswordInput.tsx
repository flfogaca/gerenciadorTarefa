import { useState, useMemo } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/passwordValidator';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  showStrength?: boolean;
  showRequirements?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = 'Digite sua senha',
  label,
  showStrength = false,
  showRequirements = false,
  required = false,
  disabled = false,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validation = useMemo(() => validatePassword(value), [value]);

  const requirements = [
    { label: 'Mínimo 8 caracteres', met: value.length >= 8 },
    { label: 'Letra maiúscula', met: /[A-Z]/.test(value) },
    { label: 'Letra minúscula', met: /[a-z]/.test(value) },
    { label: 'Número', met: /\d/.test(value) },
    { label: 'Caractere especial', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value) },
  ];

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="input-field pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Força da senha:</span>
            <span className={`text-xs font-medium ${
              validation.score <= 1 ? 'text-red-600' :
              validation.score === 2 ? 'text-orange-600' :
              validation.score === 3 ? 'text-yellow-600' :
              validation.score === 4 ? 'text-lime-600' :
              'text-green-600'
            }`}>
              {getPasswordStrengthLabel(validation.score)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getPasswordStrengthColor(validation.score)}`}
              style={{ width: `${(validation.score / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {showRequirements && (isFocused || value) && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-2">Requisitos da senha:</p>
          <ul className="space-y-1">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-center text-xs">
                {req.met ? (
                  <Check className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 text-gray-400 mr-2 flex-shrink-0" />
                )}
                <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.errors.length > 0 && !showRequirements && value && (
        <div className="mt-2">
          {validation.errors.slice(0, 2).map((error, index) => (
            <p key={index} className="text-xs text-red-600 mt-1">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}



