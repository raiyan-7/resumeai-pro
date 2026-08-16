import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, Briefcase, MessagesSquare, Star, Sparkles } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-20 max-w-7xl w-full mx-auto px-6 md:px-12 flex items-center justify-between border-b border-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white font-bold shrink-0">
            RA
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
            ResumeAI <span className="text-[10px] uppercase font-sans tracking-widest text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">Pro</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to={ROUTES.LOGIN} className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5">
            Sign In
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="text-xs font-semibold bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-lg hover:shadow-brand-500/10 px-4 py-2.5 rounded-xl transition-all duration-200"
          >
            Create Free Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            AI-Powered Career Accelerator
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] text-white tracking-tight">
            Optimize your resume. <br />
            <span className="text-glow-teal">Acquire the offer.</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed">
            ResumeAI Pro analyzes your resume using advanced NLP patterns, matches it directly against target job descriptions, calculates ATS score metrics, and conducts custom interview coaching.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <Link
              to={ROUTES.REGISTER}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-lg hover:shadow-brand-500/15 px-6 py-3.5 rounded-xl transition-all duration-200"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white px-6 py-3.5 rounded-xl bg-slate-900/20 transition-all duration-200"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Hero Interactive Card Preview */}
        <div className="relative">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent-500/10 blur-[80px] pointer-events-none"></div>
          
          <div className="glass-card p-6 border border-slate-800/80 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Software_Engineer_CV.pdf</h4>
                  <p className="text-[10px] text-slate-500">ATS Assessment Complete</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 flex items-center justify-center bg-brand-500/5 font-display font-bold text-sm text-brand-400">
                85%
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300">Identified Match Core Metrics</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Missing Skills</span>
                  <p className="text-xs font-bold text-rose-400 mt-1">Docker, Kubernetes</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Matched Roles</span>
                  <p className="text-xs font-bold text-emerald-400 mt-1">React, FastAPI, Git</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-[11px] text-indigo-200">
                <strong>Interview Tip:</strong> When discussing your projects, highlight containerization details to bypass target requirement gaps.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="bg-slate-950/40 border-t border-slate-900 py-16 md:py-24">
        <div className="max-w-7xl w-full mx-auto px-6 md:px-12 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Full-suite optimization package</h2>
            <p className="text-sm text-slate-400">Everything you need to successfully navigate modern screening tools and land your dream technical role.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-6 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400 mb-5">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-2">ATS Score Calibration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Ensure structural layout formatting aligns with automated tracking setups to secure direct developer evaluations.</p>
            </div>

            <div className="glass-card p-6 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/25 flex items-center justify-center text-accent-400 mb-5">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-2">Job Description Matcher</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Map skill coverage levels between resumes and target job profiles, receiving instant feedback on keywords and technological gaps.</p>
            </div>

            <div className="glass-card p-6 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-5">
                <MessagesSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-2">Interactive Interview Coach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Answer job-tailored technical questions in a conversational panel, checking answers instantly to audit formatting and phrasing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-900 max-w-7xl w-full mx-auto px-6 md:px-12 flex items-center justify-between text-xs text-slate-500">
        <span>© {new Date().getFullYear()} ResumeAI Pro. All engineering rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-400">Privacy Policy</a>
          <a href="#" className="hover:text-slate-400">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
