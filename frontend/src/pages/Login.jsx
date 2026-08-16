import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ROUTES } from '../utils/constants';

export const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      addToast('Welcome back to ResumeAI Pro!', 'success');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      addToast(err.message || 'Incorrect email or password details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-800/80 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white font-bold mx-auto mb-4">
          RA
        </div>
        <h2 className="text-2xl font-bold font-display text-white">Welcome Back</h2>
        <p className="text-slate-400 text-xs mt-1.5">Sign in to resume parsing and simulated coach interviews</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          error={errors.email}
          icon={Mail}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          icon={Lock}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
            <input type="checkbox" className="rounded bg-slate-900 border-slate-800 text-brand-500 focus:ring-0 w-3.5 h-3.5" />
            Remember session
          </label>
          <a href="#" className="text-brand-400 hover:text-brand-300 font-medium">Forgot password?</a>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-2"
          icon={LogIn}
        >
          Sign In to Account
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-brand-400 hover:text-brand-300 font-semibold">
          Create Account
        </Link>
      </div>
    </Card>
  );
};
export default Login;
