import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface SetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export default function TwoFactorSetup() {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'backup' | 'complete'>('intro');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const startSetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiService.getApiInstance().post('/users/me/2fa/setup');
      const data = response.data?.data;
      
      if (data?.error) {
        setError(data.error);
        return;
      }
      
      setSetupData(data);
      setStep('qr');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao iniciar configuração do 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.getApiInstance().post('/users/me/2fa/verify', {
        token: verificationCode,
        isSetup: true,
      });
      
      if (response.data?.data?.success) {
        setStep('backup');
      } else {
        setError(response.data?.data?.message || 'Código inválido');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const finishSetup = () => {
    setStep('complete');
    setTimeout(() => {
      navigate('/perfil');
    }, 3000);
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
            Autenticação de Dois Fatores
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {step === 'intro' && (
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h3 className="font-semibold text-lg">Proteja sua conta</h3>
            <p className="text-gray-600 text-sm">
              A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
              Você precisará de um aplicativo autenticador como Google Authenticator ou Authy.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Proteção contra acesso não autorizado
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Códigos de backup para emergências
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Compatível com qualquer app autenticador
              </li>
            </ul>
            <button
              onClick={startSetup}
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Configurando...' : 'Começar Configuração'}
            </button>
          </div>
        )}

        {step === 'qr' && setupData && (
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h3 className="font-semibold text-lg">Escaneie o QR Code</h3>
            <p className="text-gray-600 text-sm">
              Abra seu aplicativo autenticador e escaneie o código abaixo:
            </p>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={setupData.qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Ou digite o código manualmente:</p>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono break-all">
                {setupData.secret}
              </code>
            </div>
            <button
              onClick={() => setStep('verify')}
              className="btn-primary w-full"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h3 className="font-semibold text-lg">Verificar Configuração</h3>
            <p className="text-gray-600 text-sm">
              Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador:
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="input-field text-center text-2xl tracking-widest font-mono"
              maxLength={6}
            />
            <button
              onClick={verifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Verificar'}
            </button>
            <button
              onClick={() => setStep('qr')}
              className="text-blue-600 text-sm w-full"
            >
              Voltar para o QR Code
            </button>
          </div>
        )}

        {step === 'backup' && setupData && (
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <h3 className="font-semibold text-lg">Códigos de Backup</h3>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Guarde estes códigos em um local seguro. Cada código só pode ser usado uma vez.
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="bg-white px-3 py-2 rounded text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={copyBackupCodes}
              className="flex items-center justify-center w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {copiedCodes ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Códigos
                </>
              )}
            </button>
            <button onClick={finishSetup} className="btn-primary w-full">
              Concluir Configuração
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">2FA Ativado!</h3>
            <p className="text-gray-600 text-sm">
              Sua conta está agora protegida com autenticação de dois fatores.
            </p>
            <p className="text-sm text-gray-500">Redirecionando...</p>
          </div>
        )}
      </div>
    </div>
  );
}



