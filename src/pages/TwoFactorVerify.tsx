import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import apiService from '../services/api';

export default function TwoFactorVerify() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { tempToken, redirectTo } = location.state || {};

  const handleVerify = async () => {
    if (code.length < 6) {
      setError(useBackupCode ? 'Digite o código de backup completo' : 'O código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.getApiInstance().post('/users/auth/2fa/verify', {
        tempToken,
        token: code,
      });
      
      if (response.data?.data?.success) {
        const { token, refreshToken, user } = response.data.data;
        localStorage.setItem('authToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        navigate(redirectTo || '/dashboard');
      } else {
        setError(response.data?.data?.message || 'Código inválido');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Verificação em Duas Etapas
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {useBackupCode
              ? 'Digite um dos seus códigos de backup'
              : 'Digite o código do seu aplicativo autenticador'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = useBackupCode 
                  ? e.target.value.toUpperCase() 
                  : e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
              className="input-field text-center text-2xl tracking-widest font-mono"
              maxLength={useBackupCode ? 9 : 6}
              autoFocus
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading || code.length < 6}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
                setError('');
              }}
              className="text-blue-600 text-sm hover:underline"
            >
              {useBackupCode ? 'Usar código do aplicativo' : 'Usar código de backup'}
            </button>
          </div>

          <div className="text-center pt-4 border-t">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-gray-600 text-sm hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





