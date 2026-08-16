import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ROUTES } from '../utils/constants';

export const Register = () => {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
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
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email address is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.fullName);
      addToast('Account initialized! Welcome to ResumeAI Pro.', 'success');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      addToast(err.message || 'Signup failed. Please try again.', 'error');
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
        <h2 className="text-2xl font-bold font-display text-white">Create Account</h2>
        <p className="text-slate-400 text-xs mt-1.5">Sign up to optimize resumes and practice AI-guided mock interviews</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          error={errors.fullName}
          icon={User}
          required
        />

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

        <p className="text-[10px] text-slate-500 leading-normal pt-1">
          By signing up, you agree to our Terms of Service and acknowledge you are using mock data endpoints.
        </p>

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-2"
          icon={UserPlus}
        >
          Create Free Account
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-400">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-brand-400 hover:text-brand-300 font-semibold">
          Sign In
        </Link>
      </div>
    </Card>
  );
};
export default Register;
