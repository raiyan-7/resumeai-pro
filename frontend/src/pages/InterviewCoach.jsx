import React, { useState, useEffect, useRef } from 'react';
import { MessagesSquare, Send, Sparkles, AlertCircle, Play, HelpCircle, Star, Award, Award as Trophy, CheckCircle2, BookOpen, RefreshCw } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { LoadingState } from '../components/LoadingState';
import { interviewService } from '../services/interviewService';
import { DIFFICULTIES } from '../utils/constants';

export const InterviewCoach = () => {
  const { addToast } = useToast();

  const [jobTitle, setJobTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [activeSession, setActiveSession] = useState(null);
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  
  const [userResponse, setUserResponse] = useState('');
  const [sending, setSending] = useState(false);

  // Phase 7: Summary states
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'summary'
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const loadSessions = async () => {
    try {
      const data = await interviewService.list();
      setSessions(data);
      if (data.length > 0 && data[0].is_active) {
        setActiveSession(data[0]);
      }
    } catch (err) {
      addToast('Failed to fetch session list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Fetch summary when session finishes
  useEffect(() => {
    if (activeSession && !activeSession.is_active) {
      const fetchSummary = async () => {
        setSummaryLoading(true);
        try {
          const data = await interviewService.getSummary(activeSession.id);
          setSummaryData(data);
          setActiveTab('summary');
        } catch (err) {
          addToast('Failed to load performance summary.', 'error');
        } finally {
          setSummaryLoading(false);
        }
      };
      fetchSummary();
    } else {
      setSummaryData(null);
      setActiveTab('chat');
    }
  }, [activeSession?.id, activeSession?.is_active]);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, sending, activeTab]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      addToast('Please input a job role to target.', 'error');
      return;
    }

    setStarting(true);
    try {
      const session = await interviewService.start(jobTitle, difficulty);
      setActiveSession(session);
      setSessions((prev) => [session, ...prev]);
      addToast('Practice interview session started!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to start interview.', 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userResponse.trim() || !activeSession) return;

    const responseText = userResponse;
    setUserResponse('');
    setSending(true);
    
    // Optimistic user update
    const tempUserMsg = {
      id: Date.now(),
      session_id: activeSession.id,
      sender: 'user',
      content: responseText,
      created_at: new Date().toISOString()
    };
    
    setActiveSession((prev) => ({
      ...prev,
      messages: [...prev.messages, tempUserMsg]
    }));

    try {
      const messages = await interviewService.sendMessage(activeSession.id, responseText);
      // Backend returns [userMsgWithFeedback, nextCoachMsg]
      setActiveSession((prev) => {
        // Remove optimistic user msg
        const filtered = prev.messages.filter((m) => m.id !== tempUserMsg.id);
        const updated = [...filtered, ...messages];
        const isFinished = updated.length >= 10;
        return {
          ...prev,
          is_active: isFinished ? false : prev.is_active,
          messages: updated
        };
      });
    } catch (err) {
      addToast(err.message || 'Failed to submit response.', 'error');
      // Remove optimistic msg on error
      setActiveSession((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== tempUserMsg.id)
      }));
    } finally {
      setSending(false);
    }
  };

  const handleSelectSession = (session) => {
    setActiveSession(session);
  };

  const handleEndSession = () => {
    setActiveSession(null);
    setJobTitle('');
    loadSessions();
  };

  if (loading) {
    return <LoadingState text="Loading interview coach configs..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {!activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Start Interview Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Start Practice Interview" subtitle="Begin a mock conversation based on a job profile">
              <form onSubmit={handleStartSession} className="space-y-4">
                <Input
                  label="Target Job Profile"
                  name="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Full Stack Engineer"
                  icon={MessagesSquare}
                  required
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-medium text-slate-300">Target Difficulty</label>
                  <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTIES.map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
                          difficulty === diff
                            ? 'bg-brand-500/10 border-brand-500 text-brand-400'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={starting}
                  className="w-full mt-4"
                  icon={Play}
                >
                  Start Simulation
                </Button>
              </form>
            </Card>
          </div>

          {/* History / Past Practice Rounds */}
          <div className="lg:col-span-1">
            <Card title="Practice History" subtitle="Revisit evaluation logs">
              {sessions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                  <MessagesSquare className="w-8 h-8 text-slate-800 mb-2" />
                  <p className="text-xs">No previous practice sessions found.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess)}
                      className="p-3 bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{sess.job_title}</p>
                        <p className="text-[10px] text-slate-500">{sess.difficulty} • {sess.is_active ? 'Active' : 'Completed'}</p>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        sess.is_active ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      }`}>
                        {sess.is_active ? 'Open' : 'Done'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        /* Chat Dialogue Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Chat box */}
          <div className="lg:col-span-8 flex flex-col h-[580px] glass-card border border-slate-800 relative overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-900 flex items-center justify-between shrink-0 bg-slate-950/40">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{activeSession.job_title}</h4>
                <p className="text-[10px] text-slate-500">{activeSession.difficulty} level simulation</p>
              </div>

              {/* Tabs selector */}
              {!activeSession.is_active && (
                <div className="flex bg-slate-900 border border-slate-800/80 p-0.5 rounded-lg gap-0.5">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                      activeTab === 'chat'
                        ? 'bg-indigo-650 text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Chat Thread
                  </button>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                      activeTab === 'summary'
                        ? 'bg-indigo-650 text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Performance Report
                  </button>
                </div>
              )}

              <Button variant="secondary" size="sm" onClick={handleEndSession}>
                Exit Coach
              </Button>
            </div>

            {/* Conversational Chat View vs Summary View */}
            {activeTab === 'chat' ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeSession.messages.map((msg) => {
                  const isCoach = msg.sender === 'coach';
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${isCoach ? 'items-start' : 'items-end'} gap-1.5`}>
                      
                      {/* Speaker Header */}
                      <span className="text-[10px] font-semibold text-slate-500 px-1">
                        {isCoach ? 'Coach' : 'You'}
                      </span>
                      
                      {/* Bubble */}
                      <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed border ${
                        isCoach
                          ? 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-sm'
                          : 'bg-indigo-600/20 border-indigo-500/20 text-indigo-100 rounded-tr-sm'
                      }`}>
                        {msg.content}
                      </div>

                      {/* Feedback cards underneath User answers */}
                      {!isCoach && msg.feedback && (
                        <div className="w-[85%] bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              Coach Assessment Feedback
                            </span>
                            <span className="text-[10px] font-extrabold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                              Score: {msg.feedback.score}/10
                            </span>
                          </div>
                          
                          {/* Display metric attributes */}
                          <div className="grid grid-cols-5 gap-1 pt-1 pb-1 border-y border-slate-900">
                            {[
                              { l: "Accuracy", v: msg.feedback.technical_accuracy },
                              { l: "Relevance", v: msg.feedback.relevance },
                              { l: "Clarity", v: msg.feedback.clarity },
                              { l: "Complete", v: msg.feedback.completeness },
                              { l: "Comm", v: msg.feedback.communication_quality }
                            ].map((attr, idx) => (
                              <div key={idx} className="text-center">
                                <p className="text-[8px] text-slate-500 truncate">{attr.l}</p>
                                <p className="text-[9px] font-bold text-slate-300 mt-0.5">{attr.v ?? '-'}</p>
                              </div>
                            ))}
                          </div>

                          {msg.feedback.areas_for_improvement?.map((tip, index) => (
                            <p key={index} className="text-[10px] text-slate-400 leading-normal">
                              • {tip}
                            </p>
                          ))}
                          {msg.feedback.suggested_phrasing && (
                            <div className="text-[9px] bg-indigo-500/5 p-2 rounded border border-indigo-500/10 text-indigo-200 mt-2">
                              <strong>Tip:</strong> {msg.feedback.suggested_phrasing}
                            </div>
                          )}

                          {/* Show exemplar answer */}
                          {msg.feedback.example_answer && (
                            <div className="text-[9px] bg-emerald-500/5 border border-emerald-500/10 text-emerald-300 p-2.5 rounded mt-2">
                              <strong>Exemplary Response:</strong> "{msg.feedback.example_answer}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {sending && (
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 px-1">Coach</span>
                    <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl p-4 rounded-tl-sm text-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            ) : (
              /* Performance report tab view */
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {summaryLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                    <RefreshCw className="w-6 h-6 text-brand-500 animate-spin" />
                    <p className="text-xs font-semibold">Aggregating session metrics...</p>
                  </div>
                ) : summaryData ? (
                  <div className="space-y-6 animate-fade-in text-xs">
                    {/* Overall metrics and gauge */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                      <div className="md:col-span-4 bg-slate-900/40 border border-slate-900 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 mb-3">
                          <span className="text-2xl font-black">{summaryData.overall_score}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">/ 10</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">Overall Rating</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Average across all responses</p>
                      </div>

                      {/* Metric bars */}
                      <div className="md:col-span-8 bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-3.5">
                        <h4 className="text-xs font-bold text-slate-350">Dimension Breakdowns</h4>
                        <div className="space-y-2">
                          {[
                            { label: "Technical Accuracy", val: summaryData.avg_technical_accuracy },
                            { label: "Relevance to Question", val: summaryData.avg_relevance },
                            { label: "Answer Clarity", val: summaryData.avg_clarity },
                            { label: "Completeness", val: summaryData.avg_completeness },
                            { label: "Communication Quality", val: summaryData.avg_communication_quality }
                          ].map((metric, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                                <span>{metric.label}</span>
                                <span className="text-slate-200">{metric.val}/10</span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                                <div 
                                  className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${metric.val * 10}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Strengths and Weakness cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-emerald-950/5 border border-emerald-500/10 p-5 rounded-2xl space-y-2.5">
                        <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Strongest Attributes
                        </h4>
                        <div className="space-y-1.5 text-[10px] text-slate-300">
                          <p><strong>Technical:</strong> {summaryData.technical_strengths}</p>
                          <p><strong>Communication:</strong> {summaryData.communication_strengths}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {summaryData.strongest_areas?.map((item, idx) => (
                            <span key={idx} className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-emerald-400 text-[9px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-950/5 border border-amber-500/10 p-5 rounded-2xl space-y-2.5">
                        <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> Gaps & Growth Areas
                        </h4>
                        <p className="text-[10px] text-amber-300 leading-normal">
                          We identified key areas of improvement during your session:
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px]">
                          {summaryData.topics_to_improve?.slice(0, 3).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {summaryData.weakest_areas?.map((item, idx) => (
                            <span key={idx} className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-400 text-[9px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Prep Recommendations Checklist */}
                    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> Tailored Preparation Recommendations
                      </h4>
                      <ul className="space-y-2 text-[10px] text-slate-300">
                        {summaryData.recommendations?.map((rec, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center text-indigo-400 font-bold shrink-0 text-[8px] border border-slate-800">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Review Poorly Answered Questions */}
                    {summaryData.poor_answers?.length > 0 && (
                      <div className="space-y-3.5">
                        <h4 className="text-xs font-bold text-rose-400">Detailed Answer Audit & Model Exemplars</h4>
                        <div className="space-y-3">
                          {summaryData.poor_answers.map((item, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-900 p-4 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-200 truncate pr-4">Q: {item.question}</span>
                                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                  Score: {item.score}/10
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400"><strong>Coach Feedback:</strong> {item.feedback}</p>
                              
                              {/* Show exemplar answer */}
                              {EXAMPLE_ANSWERS[item.question] && (
                                <div className="text-[9px] bg-emerald-500/5 border border-emerald-500/10 text-emerald-300 p-3 rounded-xl mt-2 leading-relaxed">
                                  <strong>Exemplary Response:</strong> "{EXAMPLE_ANSWERS[item.question]}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    Could not compile session analytics.
                  </div>
                )}
              </div>
            )}

            {/* Input bar */}
            <div className="p-4 border-t border-slate-900 shrink-0 bg-slate-950/40">
              {activeSession.is_active ? (
                <form onSubmit={handleSendMessage} className="flex gap-2.5">
                  <input
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type your response to the coach's question..."
                    disabled={sending}
                    className="flex-1 px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !userResponse.trim()}
                    icon={Send}
                    className="shrink-0 rounded-xl"
                  >
                    Reply
                  </Button>
                </form>
              ) : (
                <div className="text-center py-1 text-slate-500 text-xs font-semibold flex items-center justify-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Practice Interview Session Completed (Review summary metrics in the Performance Report tab)
                </div>
              )}
            </div>

          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* progress */}
            <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Session Progress</span>
              <span className="text-brand-400 text-xs font-bold bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-lg">
                {Math.min(Math.ceil(activeSession.messages.length / 2), 5)} / 5 Questions
              </span>
            </div>

            <Card title="Interview Checklist" subtitle="SaaS mock metrics tracking">
              <div className="space-y-4 text-xs">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-[10px] text-slate-450 font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Answer technical prompts detailing exact implementation steps.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-[10px] text-slate-450 font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Incorporate active result-oriented verbs into your explanations (e.g. designed, containerized).
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-[10px] text-slate-450 font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Review each message feedback score card to refine phrasing.
                  </p>
                </div>
              </div>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
};
export default InterviewCoach;
