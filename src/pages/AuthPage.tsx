import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { Phone, Shield, ArrowLeft, Loader2, Lock } from 'lucide-react';

type Step = 'phone' | 'otp' | 'name';

export default function AuthPage() {
  const { signInWithPhone, verifyOtp, updateProfile, isSupabaseReady } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (raw: string) => {
    let v = raw.replace(/[^\d+]/g, '');
    if (!v.startsWith('+')) v = '+' + v;
    return v;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const formatted = formatPhone(phone);

    if (!isValidPhoneNumber(formatted)) {
      setError('Неверный формат номера. Пример: +79161234567');
      return;
    }

    setLoading(true);
    const { error: err } = await signInWithPhone(formatted);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setPhone(formatted);
      setStep('otp');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otp.length < 6) {
      setError('Введите 6-значный код');
      return;
    }
    setLoading(true);
    const { error: err } = await verifyOtp(phone, otp);
    setLoading(false);
    if (err) {
      setError(err);
    }
    // После успешной верификации AuthContext обновит profile
    // и App перенаправит на главную
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Введите имя');
      return;
    }
    setLoading(true);
    await updateProfile({ display_name: displayName.trim() });
    setLoading(false);
  };

  const handleOtpInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
  };

  const displayPhone = phone
    ? (() => {
        try {
          return parsePhoneNumber(phone).formatInternational();
        } catch {
          return phone;
        }
      })()
    : '';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-tg-bg">
      <div className="w-full max-w-[360px] px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #2196f3, #1565c0)' }}
          >
            {step === 'phone' && <Phone size={36} className="text-white" />}
            {step === 'otp' && <Shield size={36} className="text-white" />}
            {step === 'name' && <Lock size={36} className="text-white" />}
          </div>
          <h1 className="text-[22px] font-bold text-tg-text">
            {step === 'phone' && 'Вход'}
            {step === 'otp' && 'Код подтверждения'}
            {step === 'name' && 'Ваше имя'}
          </h1>
          <p className="text-[14px] text-tg-secondary text-center mt-2 leading-relaxed">
            {step === 'phone' && 'Введите номер телефона для входа или регистрации'}
            {step === 'otp' && (
              <>Мы отправили код на номер <br />
                <span className="text-tg-accent font-medium">{displayPhone}</span>
              </>
            )}
            {step === 'name' && 'Как вас зовут? Имя будет видно другим пользователям'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-tg-sidebar rounded-2xl p-6 shadow-sm border border-tg-border">
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-tg-secondary mb-1.5 uppercase tracking-wide">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+7 916 123-45-67"
                  className="w-full px-4 py-3 rounded-xl bg-tg-bg text-tg-text text-[16px] outline-none border border-tg-border focus:border-tg-accent transition-colors placeholder-tg-secondary"
                  autoFocus
                  autoComplete="tel"
                />
              </div>
              {error && (
                <p className="text-[13px] text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-3 rounded-xl font-semibold text-[15px] text-white disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2196f3, #1565c0)' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Отправляем...' : 'Далее'}
              </button>

              {!isSupabaseReady && (
                <div className="text-[12px] text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg text-center">
                  ⚠️ Supabase не настроен. Добавьте ключи VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
                </div>
              )}
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-tg-secondary mb-1.5 uppercase tracking-wide">
                  Код из SMS
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={e => handleOtpInput(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-tg-bg text-tg-text text-[24px] font-mono tracking-[0.4em] text-center outline-none border border-tg-border focus:border-tg-accent transition-colors"
                  autoFocus
                  autoComplete="one-time-code"
                />
              </div>
              {error && (
                <p className="text-[13px] text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl font-semibold text-[15px] text-white disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2196f3, #1565c0)' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Проверяем...' : 'Подтвердить'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="w-full flex items-center justify-center gap-1.5 text-[13px] text-tg-secondary hover:text-tg-accent transition-colors py-1"
              >
                <ArrowLeft size={14} />
                Изменить номер
              </button>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-tg-secondary mb-1.5 uppercase tracking-wide">
                  Имя
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Иван Петров"
                  maxLength={64}
                  className="w-full px-4 py-3 rounded-xl bg-tg-bg text-tg-text text-[16px] outline-none border border-tg-border focus:border-tg-accent transition-colors placeholder-tg-secondary"
                  autoFocus
                  autoComplete="name"
                />
              </div>
              {error && (
                <p className="text-[13px] text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !displayName.trim()}
                className="w-full py-3 rounded-xl font-semibold text-[15px] text-white disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2196f3, #1565c0)' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Сохраняем...' : 'Готово'}
              </button>
            </form>
          )}
        </div>

        {/* E2E note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-tg-secondary">
          <Lock size={12} />
          <span>Сообщения защищены E2E-шифрованием</span>
        </div>
      </div>
    </div>
  );
}
