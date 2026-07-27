import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatsCard from "./components/StatsCard";
import TaskCard from "./components/TaskCard";
import API from "./api";

function App() {
  // ---------------- STATES ----------------

  const [currentTab, setCurrentTab] = useState("Dashboard");
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // New task inputs
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newCategory, setNewCategory] = useState("General");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  // New goal inputs
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  // New flashcard inputs
  const [newCardQ, setNewCardQ] = useState("");
  const [newCardA, setNewCardA] = useState("");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);

  // Chat inputs
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // AI recommendations
  const [recommendation, setRecommendation] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Onboarding Wizard States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardName, setOnboardName] = useState("");
  const [onboardRole, setOnboardRole] = useState("Student / Developer");
  const [onboardGoals, setOnboardGoals] = useState("");
  const [onboardWake, setOnboardWake] = useState("07:00");
  const [onboardSleep, setOnboardSleep] = useState("23:00");
  const [onboardBusy, setOnboardBusy] = useState("09:00-17:00");

  // Gemini API Key Configurations
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [inputApiKey, setInputApiKey] = useState("");
  const [settingsStatus, setSettingsStatus] = useState({ type: "", message: "" });

  // Focus Timer States
  const [focusTime, setFocusTime] = useState(() => {
    const saved = localStorage.getItem("mentoros_focus_time");
    return saved ? parseFloat(saved) : 4.2;
  });
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const secondsElapsed = useRef(0);

  // Streak State
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("mentoros_streak");
    return saved ? parseInt(saved) : 14;
  });

  // ---------------- INITIAL LOADS ----------------

  useEffect(() => {
    fetchTasks();
    fetchGoals();
    fetchFlashcards();
    fetchChatHistory();
    fetchKeyStatus();
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (chatBottomRef.current && currentTab === "Chat") {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, currentTab]);

  // Dynamic recommendation reload
  useEffect(() => {
    if (tasks.length > 0) {
      fetchRecommendation();
    } else {
      setRecommendation("Add some tasks to get personalized AI mentorship recommendations! ✨");
    }
  }, [tasks.length, isKeyConfigured, userProfile]);

  // ---------------- TIMER EFFECT ----------------

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds((s) => s - 1);
        } else if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            handleTimerComplete();
          } else {
            setTimerMinutes((m) => m - 1);
            setTimerSeconds(59);
          }
        }

        secondsElapsed.current += 1;
        if (secondsElapsed.current >= 60) {
          setFocusTime((prev) => {
            const next = parseFloat((prev + 0.02).toFixed(2));
            localStorage.setItem("mentoros_focus_time", next.toString());
            return next;
          });
          secondsElapsed.current = 0;
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes, timerSeconds]);

  // Web Audio chime function
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.4); 
      playTone(659.25, now + 0.1, 0.4); 
      playTone(783.99, now + 0.2, 0.5); 
      playTone(1046.50, now + 0.3, 0.7); 
    } catch (e) {
      console.error(e);
    }
  };

  const handleTimerComplete = () => {
    setTimerActive(false);
    playChime();
    
    if (!isBreak) {
      setFocusTime((prev) => {
        const next = parseFloat((prev + 0.42).toFixed(2));
        localStorage.setItem("mentoros_focus_time", next.toString());
        return next;
      });
      setIsBreak(true);
      setTimerMinutes(5); 
      setTimerSeconds(0);
    } else {
      setIsBreak(false);
      setTimerMinutes(25); 
      setTimerSeconds(0);
    }
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerMinutes(isBreak ? 5 : 25);
    setTimerSeconds(0);
    secondsElapsed.current = 0;
  };

  const skipTimer = () => {
    handleTimerComplete();
  };

  // ---------------- ONBOARDING & PROFILE ----------------

  const checkOnboarding = async () => {
    try {
      const response = await API.get("/profile");
      setUserProfile(response.data);
      
      const onboardDone = localStorage.getItem("mentoros_onboard_done") === "true";
      if (!onboardDone) {
        setOnboardName(response.data.name);
        setOnboardRole(response.data.role);
        setOnboardGoals(response.data.goals_summary);
        setOnboardWake(response.data.wake_time);
        setOnboardSleep(response.data.sleep_time);
        setOnboardBusy(response.data.busy_hours);
        setIsOnboardingOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    if (!onboardName.trim()) return;

    try {
      const response = await API.put("/profile", {
        name: onboardName.trim(),
        role: onboardRole.trim(),
        goals_summary: onboardGoals.trim(),
        wake_time: onboardWake,
        sleep_time: onboardSleep,
        busy_hours: onboardBusy,
      });

      setUserProfile(response.data);
      localStorage.setItem("mentoros_onboard_done", "true");
      setIsOnboardingOpen(false);
      fetchRecommendation();
    } catch (error) {
      console.error("Error setting onboarding:", error);
    }
  };

  // ---------------- API CALLS ----------------

  const fetchKeyStatus = async () => {
    try {
      const response = await API.get("/settings/gemini-key");
      setIsKeyConfigured(response.data.configured);
      if (response.data.configured) setMaskedKey(response.data.masked_key);
    } catch (error) {
      console.error(error);
    }
  };

  const saveApiKey = async (e) => {
    e.preventDefault();
    if (!inputApiKey.trim()) return;
    setSettingsStatus({ type: "loading", message: "Saving API Key..." });
    try {
      const response = await API.post("/settings/gemini-key", { api_key: inputApiKey.trim() });
      if (response.data.status === "success") {
        setSettingsStatus({ type: "success", message: "API key updated successfully!" });
        setInputApiKey("");
        await fetchKeyStatus();
      } else {
        setSettingsStatus({ type: "error", message: response.data.message });
      }
    } catch (error) {
      setSettingsStatus({ type: "error", message: "Failed to connect to backend server." });
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await API.get("/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      await API.post("/tasks", {
        title: newTask.trim(),
        status: "Pending",
        completed: false,
        priority: newPriority,
        category: newCategory,
      });
      setNewTask("");
      setNewPriority("Medium");
      setNewCategory("General");
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const completed = !task.completed;
      await API.put(`/tasks/${id}`, {
        title: task.title,
        status: completed ? "Completed" : "Pending",
        completed,
        priority: task.priority,
        category: task.category,
      });
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  // Goals CRUD
  const fetchGoals = async () => {
    try {
      const response = await API.get("/goals");
      setGoals(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    try {
      await API.post("/goals", {
        title: newGoalTitle.trim(),
        description: newGoalDesc.trim(),
        target_date: newGoalTarget,
        status: "In Progress",
        progress: 0,
      });
      setNewGoalTitle("");
      setNewGoalDesc("");
      setNewGoalTarget("");
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const updateGoalProgress = async (goal, progress) => {
    try {
      await API.put(`/goals/${goal.id}`, {
        ...goal,
        progress: parseInt(progress),
        status: parseInt(progress) === 100 ? "Completed" : "In Progress",
      });
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await API.delete(`/goals/${id}`);
      fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };

  // Flashcards CRUD
  const fetchFlashcards = async () => {
    try {
      const response = await API.get("/flashcards");
      setFlashcards(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addFlashcard = async (e) => {
    e.preventDefault();
    if (!newCardQ.trim() || !newCardA.trim()) return;
    try {
      await API.post("/flashcards", {
        question: newCardQ.trim(),
        answer: newCardA.trim(),
        next_review: new Date().toISOString().split("T")[0],
        interval_days: 1,
        ease_factor: 2,
      });
      setNewCardQ("");
      setNewCardA("");
      fetchFlashcards();
    } catch (error) {
      console.error(error);
    }
  };

  const reviewCard = async (card, difficulty) => {
    let nextInt = card.interval_days;
    let nextEase = card.ease_factor;

    if (difficulty === "easy") {
      nextInt = card.interval_days + 4;
      nextEase = 3;
    } else if (difficulty === "medium") {
      nextInt = card.interval_days + 2;
      nextEase = 2;
    } else {
      nextInt = 1;
      nextEase = 1;
    }

    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + nextInt);

    try {
      await API.put(`/flashcards/${card.id}`, {
        ...card,
        interval_days: nextInt,
        ease_factor: nextEase,
        next_review: reviewDate.toISOString().split("T")[0],
      });
      setShowAnswer(false);
      if (activeCardIndex + 1 >= dueCards.length) {
        setIsStudyMode(false);
        setActiveCardIndex(0);
      } else {
        setActiveCardIndex(activeCardIndex + 1);
      }
      fetchFlashcards();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteFlashcard = async (id) => {
    try {
      await API.delete(`/flashcards/${id}`);
      fetchFlashcards();
    } catch (error) {
      console.error(error);
    }
  };

  // Chat APIs
  const fetchChatHistory = async () => {
    try {
      const response = await API.get("/chat/history");
      setChatHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const clearChat = async () => {
    try {
      await API.post("/chat/clear");
      setChatHistory([]);
    } catch (error) {
      console.error(error);
    }
  };

  const sendChatMessage = async (messageText) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim()) return;

    setIsChatLoading(true);
    setChatInput("");
    
    // Optimistic user bubble
    const tempUserMsg = { id: Date.now(), sender: "user", text: textToSend, timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, tempUserMsg]);

    try {
      const response = await API.post("/chat/send", { message: textToSend });
      setChatHistory((prev) => {
        // Filter out our temporary mock message and replace with official DB items
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, response.data.user_message, response.data.assistant_message];
      });
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "assistant", text: "❌ Connection error. Please make sure the backend is active.", timestamp: new Date().toISOString() }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const fetchRecommendation = async () => {
    if (!isKeyConfigured) return;
    setIsAiLoading(true);
    try {
      const response = await API.get("/recommend");
      if (response.data.recommendation) setRecommendation(response.data.recommendation);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ---------------- HELPERS ----------------

  const formatMarkdown = (text) => {
    if (!text) return "";
    let html = text
      .replace(/^### (.*$)/gim, '<h4 class="text-xs font-bold text-violet-400 mt-4 mb-2 uppercase tracking-wide">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="text-sm font-extrabold text-indigo-300 mt-4 mb-2 font-display">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="text-base font-black text-violet-300 mt-5 mb-2.5 font-display">$1</h2>');

    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 mb-1">$1</li>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    return html;
  };

  // Spaced repetition due check
  const todayStr = new Date().toISOString().split("T")[0];
  const dueCards = flashcards.filter(c => !c.next_review || c.next_review <= todayStr);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const productivity = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  // Time slots math for Adaptive Planner
  const getTimelineHours = () => {
    const startHour = parseInt(userProfile?.wake_time?.split(":")[0]) || 7;
    const endHour = parseInt(userProfile?.sleep_time?.split(":")[0]) || 23;
    const list = [];
    for (let h = startHour; h <= endHour; h++) {
      const formatted = h.toString().padStart(2, "0") + ":00";
      list.push(formatted);
    }
    return list;
  };

  const hoursList = getTimelineHours();

  // Task filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = 
      filterStatus === "All" || 
      (filterStatus === "Pending" && !t.completed) || 
      (filterStatus === "Completed" && t.completed);
      
    const matchesPriority = 
      filterPriority === "All" || 
      t.priority.toLowerCase() === filterPriority.toLowerCase();

    return matchesStatus && matchesPriority;
  });

  // Circular Timer Constants
  const strokeRadius = 70;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const currentSeconds = timerMinutes * 60 + timerSeconds;
  const strokeDashoffset = strokeCircumference - (currentSeconds / (isBreak ? 5 * 60 : 25 * 60)) * strokeCircumference;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[15%] left-[5%] w-[35vw] h-[35vw] max-w-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[5%] w-[40vw] h-[40vw] max-w-[450px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} userProfile={userProfile} />

      {/* Primary Dashboard Container */}
      <main className="flex-1 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 relative z-10 min-w-0">
        
        <Navbar 
          currentTab={currentTab} 
          isKeyConfigured={isKeyConfigured} 
          onOpenSettings={() => setCurrentTab("Settings")} 
        />

        {/* ---------------- 1. DASHBOARD TAB ---------------- */}
        {currentTab === "Dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Greetings block */}
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white font-display">
                Welcome back, {userProfile?.name || "Kimaya"}! 👋
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Your goals represent {goals.length} milestones. Keep pushing!
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Productivity" value={`${productivity}%`} />
              <StatsCard title="Tasks" value={`${completedTasks}/${tasks.length}`} />
              <StatsCard title="Focus Time" value={`${focusTime.toFixed(1)}h`} />
              <StatsCard title="Streak" value={`${streak}🔥`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Pomodoro Timer */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
                
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Pomodoro Timer</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{isBreak ? "Break active" : "Focus on milestones"}</p>
                  </div>
                  {isBreak && (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
                      Break
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-10 py-4">
                  {/* Circle progress countdown */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle cx="72" cy="72" r={strokeRadius} className="stroke-slate-800" strokeWidth="5" fill="transparent" />
                      <circle cx="72" cy="72" r={strokeRadius} className={`transition-all duration-300 ease-linear ${isBreak ? 'stroke-emerald-400' : 'stroke-violet-500'}`} strokeWidth="5" fill="transparent" strokeDasharray={strokeCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white tracking-widest font-display">
                        {timerMinutes.toString().padStart(2, "0")}:{timerSeconds.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full sm:w-40">
                    <button onClick={() => setTimerActive(!timerActive)} className={`py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all duration-200 cursor-pointer ${timerActive ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gradient-to-tr from-violet-600 to-indigo-600'}`}>
                      {timerActive ? "Pause" : "Start"}
                    </button>
                    <button onClick={resetTimer} className="py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer">
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Due Recall Cards info */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Active Recall Deck</h3>
                  <p className="text-xs text-slate-500 mt-1">Reviewing card definitions builds strong synaptic paths.</p>
                  
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl mt-5 flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-cyan-400 font-display">{dueCards.length}</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Cards Due Today</p>
                    </div>
                    <button onClick={() => setCurrentTab("Flashcards")} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/60 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer">
                      Study Now
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-4 mt-6">
                  Leitner Review System is active.
                </div>
              </div>
            </div>

            {/* Quick Task Tracker section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-display">🎯 Milestones & Tasks</h3>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="flex gap-2 bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl">
                    <input
                      type="text"
                      placeholder="Next study milestone..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTask()}
                      className="flex-1 bg-transparent px-3 py-1.5 focus:outline-none text-xs"
                    />
                    <button onClick={addTask} className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs px-4 rounded-xl shadow-lg cursor-pointer">
                      Add
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {tasks.slice(0, 4).map((task) => (
                      <TaskCard key={task.id} {...task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} />
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-5 bg-slate-900/20 border border-slate-850 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Breakdown</h4>
                  <div className="space-y-3">
                    {goals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-350 truncate">{goal.title}</span>
                          <span className="text-violet-400">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-300" style={{ width: `${goal.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. PLANNER TAB ---------------- */}
        {currentTab === "Planner" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-white font-display">Adaptive Day Planner</h2>
                <p className="text-xs text-slate-400 mt-1">Configure your timeline below. AI scheduler matches tasks to your routine.</p>
              </div>
              <button 
                onClick={fetchRecommendation} 
                disabled={isAiLoading || !isKeyConfigured}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                {isAiLoading ? "Optimizing Agenda..." : "🤖 AI Schedule Builder"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Daily routine timeline representation */}
              <div className="lg:col-span-6 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white font-display mb-4">Hourly Schedule Base</h3>
                
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                  {hoursList.map((hour) => {
                    const isWake = hour === userProfile?.wake_time;
                    const isSleep = hour === userProfile?.sleep_time;
                    
                    return (
                      <div key={hour} className="flex gap-4 items-center">
                        <span className="text-[10px] font-bold text-slate-500 w-10 font-display">{hour}</span>
                        <div className={`flex-1 p-3 rounded-2xl border text-xs flex items-center justify-between ${
                          isWake ? "bg-amber-500/10 border-amber-500/20 text-amber-300 font-semibold" :
                          isSleep ? "bg-indigo-500/15 border-indigo-500/20 text-indigo-300 font-semibold" :
                          "bg-slate-950/60 border-slate-850 text-slate-400"
                        }`}>
                          <span>
                            {isWake ? "☀️ Wake Up Time" : isSleep ? "🌙 Sleep & Rest" : "Available Slot"}
                          </span>
                          <span className="text-[9px] opacity-60">Routine Event</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Recommendation outputs */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-white font-display mb-4">AI Mentor Recommendation</h3>
                    {isAiLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin"></div>
                        <p className="text-xs text-slate-500 font-semibold">Generating adaptive timeline schedule...</p>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                        {recommendation ? (
                          <div dangerouslySetInnerHTML={{ __html: formatMarkdown(recommendation) }} className="space-y-2" />
                        ) : (
                          <p className="text-slate-500">Configure your Gemini API key and add tasks to get started.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 3. GOALS TAB ---------------- */}
        {currentTab === "Goals" && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-white font-display">Target & Milestones</h2>
              <p className="text-xs text-slate-400 mt-1">Set clear milestones to keep your AI recommendations highly focused.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Goals list */}
              <div className="lg:col-span-7 space-y-4">
                {goals.length === 0 ? (
                  <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
                    <p className="text-slate-500 font-semibold">No goals set yet.</p>
                  </div>
                ) : (
                  goals.map((goal) => (
                    <div key={goal.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-white font-display">{goal.title}</h4>
                          <p className="text-xs text-slate-450 mt-1">{goal.description}</p>
                        </div>
                        <button onClick={() => deleteGoal(goal.id)} className="p-2 text-slate-500 hover:text-rose-450 transition-all cursor-pointer">
                          🗑️
                        </button>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Milestone Target: {goal.target_date || "No deadline"}</span>
                          <span className="text-violet-400">{goal.progress}% Completed</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={goal.progress}
                          onChange={(e) => updateGoalProgress(goal, e.target.value)}
                          className="w-full accent-violet-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add goal form */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white font-display mb-4">Add Goal Milestone</h3>
                <form onSubmit={addGoal} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Goal Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Finish React Dashboard"
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                    <textarea
                      placeholder="Brief details about milestones..."
                      value={newGoalDesc}
                      onChange={(e) => setNewGoalDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500 h-20 resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Target Date</label>
                    <input
                      type="date"
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-[1.01] transition-transform cursor-pointer">
                    Create Milestone
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 4. FLASHCARDS TAB ---------------- */}
        {currentTab === "Flashcards" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-white font-display">Spaced Recall Deck</h2>
                <p className="text-xs text-slate-400 mt-1">Review study cards using intervals to maximize retention.</p>
              </div>
              {dueCards.length > 0 && !isStudyMode && (
                <button onClick={() => { setIsStudyMode(true); setActiveCardIndex(0); }} className="px-5 py-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:scale-[1.02] text-xs font-bold text-white shadow-lg cursor-pointer">
                  ✍️ Start Review Session ({dueCards.length})
                </button>
              )}
            </div>

            {isStudyMode ? (
              /* Review Active Session UI */
              <div className="max-w-xl mx-auto space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative min-h-[220px] flex flex-col justify-between">
                  <div className="flex justify-between text-slate-500 text-[10px] font-bold">
                    <span>Active Recall Session</span>
                    <span>{activeCardIndex + 1} / {dueCards.length}</span>
                  </div>

                  <div className="py-6">
                    <h3 className="text-lg font-bold text-white tracking-wide">{dueCards[activeCardIndex]?.question}</h3>
                    {showAnswer && (
                      <p className="text-sm text-cyan-400 font-semibold mt-4 transition-all duration-300">{dueCards[activeCardIndex]?.answer}</p>
                    )}
                  </div>

                  <div>
                    {!showAnswer ? (
                      <button onClick={() => setShowAnswer(true)} className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700/60">
                        Show Answer
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => reviewCard(dueCards[activeCardIndex], "hard")} className="flex-1 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl cursor-pointer">
                          Hard (1d)
                        </button>
                        <button onClick={() => reviewCard(dueCards[activeCardIndex], "medium")} className="flex-1 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl cursor-pointer">
                          Medium (3d)
                        </button>
                        <button onClick={() => reviewCard(dueCards[activeCardIndex], "easy")} className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl cursor-pointer">
                          Easy (5d)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setIsStudyMode(false)} className="w-full text-center text-xs text-slate-500 hover:text-slate-350 cursor-pointer">
                  Quit study session
                </button>
              </div>
            ) : (
              /* Flashcards dashboard */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Due lists */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">All Flashcards ({flashcards.length})</h3>
                  
                  {flashcards.length === 0 ? (
                    <div className="bg-slate-900/20 border border-dashed border-slate-850 rounded-3xl p-10 text-center">
                      <p className="text-slate-500 text-xs">Deck is empty. Add flashcards on the right.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {flashcards.map((card) => (
                        <div key={card.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                          <div>
                            <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-450 px-2 py-0.5 rounded font-semibold">
                              Review: {card.next_review || "Today"}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-3 leading-snug">{card.question}</h4>
                            <p className="text-xs text-slate-400 mt-1 truncate">{card.answer}</p>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-850/50 mt-4 pt-3">
                            <span className="text-[9px] text-slate-500 font-medium">Interval: {card.interval_days}d</span>
                            <button onClick={() => deleteFlashcard(card.id)} className="text-[10px] text-slate-500 hover:text-rose-400 cursor-pointer">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Card Form */}
                <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  <h3 className="text-sm font-bold text-white font-display mb-4">Create Flashcard</h3>
                  <form onSubmit={addFlashcard} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Question (Front)</label>
                      <input
                        type="text"
                        placeholder="e.g. What is Active Recall?"
                        value={newCardQ}
                        onChange={(e) => setNewCardQ(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Answer (Back)</label>
                      <textarea
                        placeholder="The quick answer..."
                        value={newCardA}
                        onChange={(e) => setNewCardA(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500 h-24 resize-none"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-[1.01] transition-transform cursor-pointer">
                      Add Card
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- 5. AI CHAT TAB ---------------- */}
        {currentTab === "Chat" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white font-display">AI Mentor Chat</h2>
                <p className="text-xs text-slate-400 mt-1">Talk to your elite mentor about schedules, revision targets, or challenges.</p>
              </div>
              <button onClick={clearChat} className="px-4 py-2 bg-slate-900 border border-slate-800 hover:text-slate-200 text-slate-400 rounded-xl text-xs font-semibold cursor-pointer">
                Clear Chat
              </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col h-[520px] justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
              
              {/* Chat history logs */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <span className="text-4xl mb-4">💬</span>
                    <h3 className="text-sm font-bold text-white font-display">Hello, {userProfile?.name || "Kimaya"}!</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">Ask me for study guides, schedules, or revision tips.</p>
                    
                    {/* Suggestion Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                      {[
                        "How can I manage my daily routine?",
                        "Give me a motivational summary",
                        "What is my next priority?"
                      ].map((chip) => (
                        <button key={chip} onClick={() => sendChatMessage(chip)} className="px-3.5 py-2 bg-slate-950 hover:bg-slate-850 text-slate-450 hover:text-slate-250 border border-slate-850 rounded-xl text-[10px] font-semibold transition-all cursor-pointer">
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => {
                    const isUser = msg.sender === "user";
                    return (
                      <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>
                        <div className={`max-w-[80%] p-4 rounded-3xl text-xs leading-relaxed whitespace-pre-wrap shadow-lg ${
                          isUser 
                            ? "bg-violet-600 text-white rounded-br-none" 
                            : "bg-slate-950 border border-slate-850 text-slate-200 rounded-bl-none prose prose-invert"
                        }`}>
                          {!isUser ? (
                            <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-3xl rounded-bl-none flex items-center gap-2 shadow-lg">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input form */}
              <div className="flex gap-3 bg-slate-950 border border-slate-850 p-1.5 rounded-2xl">
                <input
                  type="text"
                  placeholder="Ask your AI Mentor anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  disabled={isChatLoading}
                  className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-xs text-slate-200"
                />
                <button 
                  onClick={() => sendChatMessage()} 
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-gradient-to-tr from-violet-600 to-indigo-600 disabled:opacity-50 text-white font-bold text-xs px-5 rounded-xl shadow-lg transition-transform cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 6. SETTINGS TAB ---------------- */}
        {currentTab === "Settings" && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-black text-white font-display">System Settings</h2>
              <p className="text-xs text-slate-400 mt-1">Configure your personal daily routine profile and Google Gemini credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Profile configurations */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white font-display mb-4">Edit Profile & Daily Routine</h3>
                
                <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
                      <input
                        type="text"
                        value={onboardName}
                        onChange={(e) => setOnboardName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Your Goal/Role</label>
                      <input
                        type="text"
                        value={onboardRole}
                        onChange={(e) => setOnboardRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Goals Summary</label>
                    <textarea
                      value={onboardGoals}
                      onChange={(e) => setOnboardGoals(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500 h-20 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Wake Time</label>
                      <input
                        type="text"
                        value={onboardWake}
                        placeholder="e.g. 07:00"
                        onChange={(e) => setOnboardWake(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-xl text-xs text-slate-350 text-center"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Sleep Time</label>
                      <input
                        type="text"
                        value={onboardSleep}
                        placeholder="e.g. 23:00"
                        onChange={(e) => setOnboardSleep(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-xl text-xs text-slate-350 text-center"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Busy Hours</label>
                      <input
                        type="text"
                        value={onboardBusy}
                        placeholder="e.g. 09:00-17:00"
                        onChange={(e) => setOnboardBusy(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 px-3 py-2 rounded-xl text-xs text-slate-350 text-center"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-[1.01] transition-transform cursor-pointer mt-2">
                    Save Routine Profile
                  </button>
                </form>
              </div>

              {/* Gemini configs */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white font-display mb-4">Gemini API Credentials</h3>
                
                <form onSubmit={saveApiKey} className="space-y-4">
                  <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">
                        {isKeyConfigured ? `Configured (${maskedKey})` : "Not Configured ⚠️"}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${isKeyConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">New API Key</label>
                    <input
                      type="password"
                      placeholder="Paste Gemini API Key (AI.za...)"
                      value={inputApiKey}
                      onChange={(e) => setInputApiKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {settingsStatus.message && (
                    <div className={`text-xs px-3 py-2 rounded-xl border ${
                      settingsStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      settingsStatus.type === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                      "bg-slate-850 text-slate-450 border-slate-800"
                    }`}>
                      {settingsStatus.message}
                    </div>
                  )}

                  <button type="submit" className="w-full py-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-[1.01] transition-transform cursor-pointer">
                    Save Key
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ---------------- WELCOME ONBOARDING MODAL ---------------- */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"></div>
            
            <div className="text-center mb-6">
              <span className="text-4xl">🚀</span>
              <h3 className="text-xl font-extrabold text-white font-display mt-3">Welcome to MentorOS</h3>
              <p className="text-xs text-slate-400 mt-1.5">
                Let's configure your routine once. Your AI Mentor will build, recall and structure everything for you without repeated prompting.
              </p>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Kimaya"
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Your Core Focus / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Student / Fullstack Dev"
                    value={onboardRole}
                    onChange={(e) => setOnboardRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Your Goals Summary</label>
                <textarea
                  required
                  placeholder="e.g. Pass exams, build open-source tools, study databases"
                  value={onboardGoals}
                  onChange={(e) => setOnboardGoals(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-violet-500 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase text-center block">Wake Time</label>
                  <input
                    type="text"
                    required
                    placeholder="07:00"
                    value={onboardWake}
                    onChange={(e) => setOnboardWake(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-350 text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase text-center block">Sleep Time</label>
                  <input
                    type="text"
                    required
                    placeholder="23:00"
                    value={onboardSleep}
                    onChange={(e) => setOnboardSleep(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-350 text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase text-center block">Busy Hours</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00-17:00"
                    value={onboardBusy}
                    onChange={(e) => setOnboardBusy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-350 text-center"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-[1.01] transition-transform cursor-pointer mt-4">
                Launch My MentorOS 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;