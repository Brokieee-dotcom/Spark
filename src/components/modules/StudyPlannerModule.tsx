import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyTask } from '../../types';
import { requestApi } from '../../services/api';
import {
  CalendarDays,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Check,
  ListTodo,
} from 'lucide-react';

export const StudyPlannerModule: React.FC = () => {
  const {
    tasks,
    addTask,
    toggleTaskCompleted,
    deleteTask,
    setAllTasks,
    weaknessAnalysis,
    curriculum,
    subject,
    profile,
  } = useApp();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState(subject);
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);

  // AI Timetable modal state
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [dailyHours, setDailyHours] = useState(3);
  const [generatingTimetable, setGeneratingTimetable] = useState(false);
  const [timetableError, setTimetableError] = useState<string | null>(null);
  const [generatedTimetable, setGeneratedTimetable] = useState<any | null>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      subject: taskSubject,
      date: taskDate,
      durationMinutes: taskDuration,
      priority: taskPriority,
      completed: false,
    });

    setTaskTitle('');
  };

  const handleGenerateTimetable = async () => {
    setGeneratingTimetable(true);
    setTimetableError(null);
    try {
      const weakTopics = weaknessAnalysis
        .filter((w) => w.trend === 'Critical Weakness' || w.trend === 'Needs Attention')
        .map((w) => `${w.subject}: ${w.topic}`);

      const res = await requestApi<{ timetable: any }>(
        '/api/timetable/generate',
        {
          dailyHours,
          examDate: 'In 4 weeks',
          curriculum,
          subjects: ['Mathematics', 'Science (Physics & Chemistry)', 'Biology', 'English'],
          weakTopics,
        },
        { isPremium: profile.planTier === 'premium' }
      );

      setGeneratedTimetable(res.data.timetable);
    } catch (err: any) {
      console.error('Timetable generation error:', err);
      setTimetableError(err.message || 'Failed to generate timetable.');
    } finally {
      setGeneratingTimetable(false);
    }
  };

  const handleImportTimetableToTasks = () => {
    if (!generatedTimetable || !generatedTimetable.days) return;

    const newTasks: StudyTask[] = [];
    const today = new Date();

    generatedTimetable.days.forEach((day: any, dIdx: number) => {
      const taskDay = new Date(today.getTime() + dIdx * 86400000)
        .toISOString()
        .split('T')[0];

      day.sessions.forEach((sess: any) => {
        newTasks.push({
          id: `task-gen-${Date.now()}-${Math.random()}`,
          title: `[${sess.activityType}] ${sess.topic}`,
          subject: sess.subject,
          date: taskDay,
          durationMinutes: sess.durationMinutes || 45,
          priority: sess.priority || 'high',
          completed: false,
          isAiGenerated: true,
        });
      });
    });

    setAllTasks([...tasks, ...newTasks]);
    setShowTimetableModal(false);
    setGeneratedTimetable(null);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.completed ? t.durationMinutes : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Study Planner & Timetable</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize revision schedules, track daily goals, and calibrate study blocks to weak topics.
          </p>
        </div>

        <button
          onClick={() => setShowTimetableModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20 flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Timetable</span>
        </button>
      </div>

      {/* Main Grid: Form & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Add Task Form (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-teal-400" /> Add Study Task
            </h3>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title:
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Solve 5 Matrices questions"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject:
                </label>
                <input
                  type="text"
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (min):
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority:
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Due Date:
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-teal-500/20"
              >
                Add to Planner
              </button>
            </form>
          </div>

          {/* Quick Metrics Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>Completed Today:</span>
              <span className="text-teal-400 font-mono font-bold">
                {completedCount} / {tasks.length}
              </span>
            </div>
            <div className="text-slate-400">
              Total revision time logged: <strong>{totalMinutes} minutes</strong>
            </div>
          </div>
        </div>

        {/* Right: Tasks List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Your Scheduled Revision Tasks</h3>
              <span className="text-xs text-slate-400 font-mono">
                {tasks.length} Total Task{tasks.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  let priorityBadge = 'bg-slate-800 text-slate-400';
                  if (task.priority === 'high') priorityBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  else if (task.priority === 'medium') priorityBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        task.completed
                          ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                          : 'bg-slate-900/80 border-slate-800 text-slate-200'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompleted(task.id)}
                          className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-400"
                        />
                        <div className="truncate">
                          <div
                            className={`font-semibold text-xs sm:text-sm truncate ${
                              task.completed ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{task.subject}</span>
                            <span>·</span>
                            <span>{task.durationMinutes} min</span>
                            <span>·</span>
                            <span>{task.date}</span>
                          </div>
                        </div>
                      </label>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${priorityBadge}`}
                        >
                          {task.priority}
                        </span>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No tasks added yet. Add a study task on the left or generate an AI timetable!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Timetable Modal */}
      {showTimetableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#0F1E36] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl text-white overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#0B192C] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-sm text-white">AI Revision Timetable Generator</h3>
              </div>
              <button
                onClick={() => setShowTimetableModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {!generatedTimetable ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300">
                    ScholarSpark will balance your syllabus coverage across subjects and automatically allocate extra time blocks to topics flagged by the <strong>Weakness Detector</strong>.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Available Daily Study Time:
                    </label>
                    <div className="flex gap-3">
                      {[2, 3, 4, 5].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setDailyHours(hrs)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors border ${
                            dailyHours === hrs
                              ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-xs'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {hrs} Hours / Day
                        </button>
                      ))}
                    </div>
                  </div>

                  {timetableError && (
                    <div className="p-3 bg-rose-950 border border-rose-800 text-rose-300 rounded-xl text-xs">
                      {timetableError}
                    </div>
                  )}

                  <button
                    onClick={handleGenerateTimetable}
                    disabled={generatingTimetable}
                    className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-teal-500/20 disabled:opacity-50"
                  >
                    {generatingTimetable
                      ? 'Synthesizing 7-Day Timetable...'
                      : 'Generate 7-Day Optimized Timetable'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-300">
                    <span className="font-bold">Strategy: </span>
                    {generatedTimetable.strategyOverview}
                  </div>

                  <div className="space-y-3">
                    {generatedTimetable.days.map((day: any, dIdx: number) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2"
                      >
                        <div className="font-bold text-white flex items-center justify-between">
                          <span>{day.dayName}</span>
                          <span className="text-[10px] text-teal-400">{day.focusTheme}</span>
                        </div>
                        <div className="space-y-1">
                          {day.sessions.map((sess: any, sIdx: number) => (
                            <div
                              key={sIdx}
                              className="flex items-center justify-between p-2 rounded bg-slate-950 text-[11px] text-slate-300"
                            >
                              <div>
                                <span className="font-semibold text-white">{sess.subject}: </span>
                                <span>{sess.topic}</span>
                              </div>
                              <span className="font-mono text-teal-400">
                                {sess.durationMinutes}m ({sess.activityType})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setGeneratedTimetable(null)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleImportTimetableToTasks}
                      className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20"
                    >
                      Import All Sessions as Tasks
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
