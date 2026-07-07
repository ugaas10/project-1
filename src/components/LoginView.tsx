import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../lib/i18n';
import { useToast } from './Toast';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; role: string; name: string }) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const { t, language, setLanguage } = useLanguage();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Input fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Injineerka');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default pre-configured accounts inside local storage database
  const getStoredUsers = () => {
    const raw = localStorage.getItem('geomds_registered_users');
    let usersList: any[] = [];
    if (!raw) {
      usersList = [
        { email: 'admin@admin.com', password: 'admin', role: 'Maamulaha', name: 'Admin Maamule', active: true, status: 'Firfircoon', date: '02/01/2026' },
        { email: 'engmohamedyare7@gmail.com', password: 'admin', role: 'Maamulaha', name: 'Eng. Mohamed Abduqaadir', active: true, status: 'Firfircoon', date: '10/01/2026' },
        { email: 'injineer@geodms.com', password: 'admin', role: 'Injineerka', name: 'Inj. Maxamed Cabdulqaadir', active: true, status: 'Firfircoon', date: '15/01/2026' },
        { email: 'user@example.com', password: 'admin', role: 'Injineerka', name: 'User Example', active: false, status: 'Aan Firfircoonayn', date: '01/01/2026' }
      ];
      localStorage.setItem('geomds_registered_users', JSON.stringify(usersList));
      return usersList;
    }
    try {
      usersList = JSON.parse(raw);
    } catch (e) {
      usersList = [];
    }

    // Proactively upgrade Eng. Mohamed accounts to full Maamulaha (Admins) and Active in the persistent storage
    let modified = false;
    usersList = usersList.map((user: any) => {
      const emailLower = (user.email || '').toLowerCase();
      const isMohamedEng = emailLower === 'engmohamedyare7@gmail.com' || 
                           emailLower === 'mohamedabduqaadir361@gmail.com' || 
                           emailLower.includes('mohamedabduqaadir') ||
                           emailLower.includes('mohamedyare');
      
      if (isMohamedEng && (user.role !== 'Maamulaha' || !user.active)) {
        modified = true;
        return {
          ...user,
          role: 'Maamulaha',
          active: true,
          status: 'Firfircoon'
        };
      }
      return user;
    });

    if (modified) {
      localStorage.setItem('geomds_registered_users', JSON.stringify(usersList));
    }

    return usersList;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const allUsers = getStoredUsers();
      
      // Check preset/stored accounts
      const account = allUsers.find(
        (acc: any) => acc.email === trimmedEmail && acc.password === password
      );

      if (account) {
        // Core validation constraint: "Users approved admin only" (Admins/Maamulaha do not need approval)
        if (!account.active && account.role !== 'Maamulaha' && account.email !== 'admin@admin.com') {
          setError(
            language === 'so'
              ? 'Cilad: Akoonkaaga wali ma uusan fasaxin Maamulaha! Fadlan la xiriir Maamulaha (Admin) si laguu ogolaado.'
              : 'Error: Your account has not been approved by the Admin yet! Please wait or contact the Admin.'
          );
          showToast(
            language === 'so'
              ? 'Akoon aan wali la fasaxin!'
              : 'Account pending active approval!',
            'danger'
          );
          setLoading(false);
          return;
        }

        onLoginSuccess({
          email: account.email,
          role: account.role,
          name: account.name
        });
        showToast(
          language === 'so'
            ? `Kusoo dhawaada, ${account.name}!`
            : `Welcome back, ${account.name}!`,
          'success'
        );
      } else {
        setError(
          language === 'so'
            ? 'Cilad: Email-ka ama password-ka waa khaldan yahay!'
            : 'Error: Invalid email or password!'
        );
        showToast(
          language === 'so'
            ? 'Soo geliddu waa fashilantay!'
            : 'Login failed!',
          'danger'
        );
      }
      setLoading(false);
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError(language === 'so' ? 'Fadlan buuxi meelaha banaan' : 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'so' ? 'Furayaasha sirta ah isma laha!' : 'Passwords do not match!');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      
      // Save user to localStorage (Admins/Maamulaha don't need approval!)
      const isAdminRole = role === 'Maamulaha' || 
                           trimmedEmail === 'engmohamedyare7@gmail.com' || 
                           trimmedEmail === 'mohamedabduqaadir361@gmail.com' || 
                           trimmedEmail.includes('mohamedabduqaadir') ||
                           trimmedEmail.includes('mohamedyare');
                           
      const newUser = {
        name: fullName.trim(),
        email: trimmedEmail,
        password: password,
        role: isAdminRole ? 'Maamulaha' : role,
        active: isAdminRole ? true : false,
        status: isAdminRole ? 'Firfircoon' : 'Aan Firfircoonayn',
        date: new Date().toLocaleDateString('en-GB')
      };

      try {
        const allUsers = getStoredUsers();
        
        // Check if email already exists
        const emailExists = allUsers.some((a: any) => a.email === trimmedEmail);
        
        if (emailExists) {
          setError(language === 'so' ? 'Email-kan horey ayaa loo isticmaalay!' : 'Email already in use!');
          setLoading(false);
          return;
        }

        allUsers.push(newUser);
        localStorage.setItem('geomds_registered_users', JSON.stringify(allUsers));

        if (isAdminRole) {
          // Auto login for Admin to make the workflow seamless!
          onLoginSuccess({
            email: newUser.email,
            role: newUser.role,
            name: newUser.name,
          });
          showToast(
            language === 'so'
              ? `Kusoo dhawaada Maamulaha, ${newUser.name}!`
              : `Welcome Administrator, ${newUser.name}!`,
            'success'
          );
          setLoading(false);
          return;
        }

        // Switch panel to login instead of auto-logging them in, so they see the state
        setMode('login');
        
        showToast(
          language === 'so'
            ? `Akoon cusub ayaa la sameeyay! Waxaa loo baahan yahay ogolaansho Maamule ka hor inta aadan soo gelin.`
            : `Account created! Admin approval is required before you can sign in.`,
          'success'
        );
        
        setError(
          language === 'so'
            ? 'Akoonkaaga waa la diiwaangeliyay. Fadlan sug inta uu Maamuluhu kaaga fasaxayo (Admin approval required)!'
            : 'Your account is registered. Please wait for Admin approval before signing in!'
        );
      } catch (err) {
        setError(language === 'so' ? 'Cilad ayaa dhacday!' : 'An error occurred!');
      }
      
      setLoading(false);
    }, 1200);
  };

  const handleForgotPassword = () => {
    showToast(
      language === 'so'
        ? 'Si aad u bedesho furaha sirta, fadlan la xiriir maamulaha nidaamka (admin)'
        : 'To reset your password, please contact the system administrator (admin)',
      'info'
    );
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      // Pick a default active administrator or premium engineer for Google login to keep the preview fast & fully working
      const allUsers = getStoredUsers();
      const demoAccount = allUsers.find((u: any) => u.active && u.email?.includes('injineer')) || allUsers[0];
      onLoginSuccess({
        email: demoAccount.email,
        role: demoAccount.role,
        name: demoAccount.name
      });
      showToast(
        language === 'so'
          ? `Kusoo galay Google: ${demoAccount.name}`
          : `Signed in with Google as ${demoAccount.name}`,
        'success'
      );
      setLoading(false);
    }, 900);
  };

  const changeLanguage = () => {
    setLanguage(language === 'so' ? 'en' : 'so');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0d1519] p-4 relative overflow-hidden text-foreground">
      {/* Radiant glow pattern mimic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#182d38_0%,#0c1418_100%)] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
        {/* Language Switcher Button on corner right of login stack area */}
        <div className="w-full flex justify-end mb-4">
          <button
            onClick={changeLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1a20] border border-[#1d2f39] text-xs font-semibold hover:border-[#00b0ff]/50 text-muted-foreground hover:text-white transition-all shadow-inner"
          >
            <span className="uppercase">{language === 'so' ? 'English (EN)' : 'Somali (SO)'}</span>
          </button>
        </div>

        {/* Logo and Branding header exactly as shown in screenshot 3 */}
        <div className="bg-gradient-to-b from-[#111c21] to-[#070d0f] border border-[#1d2f39] rounded-xl px-4 py-8 mb-6 flex flex-col items-center justify-center w-full shadow-2xl relative overflow-hidden">
          <Logo variant="icon" className="scale-[1.15] mb-4" />
          <h1 className="text-lg font-bold tracking-wide text-white font-sans text-center">
            {language === 'so' ? 'Document Management System' : 'Document Management System'}
          </h1>
          <p className="text-[10px] tracking-[0.45em] text-[#52707e] font-semibold mt-1 uppercase text-center pl-1 font-mono">
            GEOMETRY
          </p>
        </div>

        {/* Dynamic Titles */}
        <h2 className="text-3xl font-bold text-white text-center tracking-tight">
          {language === 'so' ? 'Soo Dhawoow' : 'Welcome'}
        </h2>
        <p className="text-xs text-[#52707e] text-center mt-2 mb-6 font-medium">
          {language === 'so' 
            ? 'Soo gal si aad u gasho goobta shaqada' 
            : 'Sign in to access your workspace'}
        </p>

        {/* Login/Register Tabs Card Outer Shield */}
        <div className="w-full bg-[#111e25]/90 border border-[#1e343f] rounded-2xl shadow-2xl p-6 relative">
          
          {/* Custom Tabs toggle match */}
          <div className="bg-[#0e1a20] p-1 border border-[#162730] rounded-xl flex w-full mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`w-1/2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-[#162d3a] text-white border border-[#224052] shadow-sm'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {language === 'so' ? 'Soo Gal' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`w-1/2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mode === 'register'
                  ? 'bg-[#162d3a] text-white border border-[#224052] shadow-sm'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              {language === 'so' ? 'Is Diwaangeli' : 'Register'}
            </button>
          </div>

          {/* Form Stack */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            
            {/* Full Name field (Only in register mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white block">
                  {language === 'so' ? 'Magaca Buuxa' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Inj. Maxamed Cabdulqaadir"
                  className="w-full bg-[#13262f] border border-[#1e3540] rounded-xl px-4 py-3 text-sm text-white focus:border-[#00b0ff] focus:outline-none transition-all placeholder:text-[#3d5663]/90"
                />
              </div>
            )}

            {/* Role dropdown (Only in register mode) */}
            {mode === 'register' && (
              <div id="registration-role-display" className="space-y-1.5">
                <label className="text-xs font-semibold text-white block">
                  {language === 'so' ? 'Doorka isticmaalaha' : 'User Role'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#13262f] border border-[#1e3440] rounded-xl px-4 py-3 text-sm text-[#00b0ff] font-bold focus:border-[#00b0ff] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Injineerka">{language === 'so' ? 'Injineerka (Engineer)' : 'Engineer'}</option>
                  <option value="Maamulaha">{language === 'so' ? 'Maamulaha (Admin)' : 'Admin'}</option>
                </select>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white block">
                {language === 'so' ? 'Iimaylka' : 'Email Address'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="injineer@geodms.com"
                className="w-full bg-[#13262f] border border-[#1e3540] rounded-xl px-4 py-3 text-sm text-white focus:border-[#00b0ff] focus:outline-none transition-all placeholder:text-[#3d5663]/90"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white block">
                  {language === 'so' ? 'Furaha Sirta' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[#52707e] hover:text-[#00b0ff] transition-colors font-medium"
                  >
                    {language === 'so' ? 'Ilowday furaha sirta?' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#13262f] border border-[#1e3540] rounded-xl pl-4 pr-11 py-3 text-sm text-white focus:border-[#00b0ff] focus:outline-none transition-all placeholder:text-[#3d5663]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52707e] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field (Only in register mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white block">
                  {language === 'so' ? 'Xaqiiji Furaha Sirta' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#13262f] border border-[#1e3540] rounded-xl pl-4 pr-11 py-3 text-sm text-white focus:border-[#00b0ff] focus:outline-none transition-all placeholder:text-[#3d5663]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52707e] hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message rendering */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}

            {/* Primary Action Button (Sleek Cyan/Blue with glow shadow exactly matches Screenshot 1 and 2) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#00b0ff] hover:bg-[#00c2ff] text-white font-bold text-sm tracking-wide transition-all shadow-[0_4px_16px_rgba(0,176,255,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' 
                    ? (language === 'so' ? 'Soo Gal' : 'Soo Gal') 
                    : (language === 'so' ? 'Samee Akoon' : 'Samee Akoon')}
                </>
              )}
            </button>
          </form>

          {/* Separator "AMA" */}
          <div className="relative my-6 flex py-1 items-center">
            <div className="flex-grow border-t border-[#1e343f]"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-[#52707e] tracking-widest">AMA</span>
            <div className="flex-grow border-t border-[#1e343f]"></div>
          </div>

          {/* Google SSO Button exactly mimics Screenshot 1 and 2 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border border-[#1e3540] bg-transparent hover:bg-white/5 text-white text-sm font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {/* Google Colorful Logo Icon */}
            <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            {language === 'so' ? 'Ku soo gal Google' : 'Sign In with Google'}
          </button>

          {/* Preset Demo Fast Fill Link in card base for premium user experience */}
          <div className="mt-6 pt-4 border-t border-[#1e343f] text-center">
            <p className="text-[10px] text-[#52707e] font-sans font-medium">
              {language === 'so' 
                ? 'Haddii aad tahay tijaabiye, guji badhanka Google ee kor ku xusan si dhakhso ah.' 
                : 'For testing, click the Google button above for instant demo-access.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
