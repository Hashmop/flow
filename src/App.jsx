import React, { useState, useEffect } from 'react';
import { 
  Clock, BookOpen, Gamepad, Pause, RefreshCw, ChevronLeft, 
  ChevronRight, PlusCircle, Trash2, Edit, Check, User, X, Camera, Trophy, Star
} from 'lucide-react';

const ProductivityTracker = () => {
  // Timer States
  const [dailyTimers, setDailyTimers] = useState(() => {
    const saved = localStorage.getItem('productivityDailyTimers');
    return saved ? JSON.parse(saved) : { study: 0, play: 0, idle: 0 };
  });
  
  const [totalTimers, setTotalTimers] = useState(() => {
    const saved = localStorage.getItem('productivityTotalTimers');
    return saved ? JSON.parse(saved) : { study: 0, play: 0, idle: 0 };
  });

  const [activeTimer, setActiveTimer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(() => {
    const saved = localStorage.getItem('lastResetDate');
    return saved ? new Date(saved) : new Date();
  });

  // Progression System
  const [level, setLevel] = useState(() => {
    const saved = localStorage.getItem('productivityLevel');
    return saved ? parseInt(saved) : 1;
  });
  
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('productivityXp');
    return saved ? parseInt(saved) : 0;
  });

  // Heatmap State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [heatmapData, setHeatmapData] = useState(() => {
    const saved = localStorage.getItem('productivityHeatmap');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date();
      if (new Date(parsed[0].date).getMonth() === today.getMonth() &&
          new Date(parsed[0].date).getFullYear() === today.getFullYear()) {
        return parsed;
      }
    }
    
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(today.getFullYear(), today.getMonth(), i + 1).toISOString().split('T')[0],
      studyTime: 0
    }));
  });

  // Todo List State
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('productivityTodos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);

  // Profile State
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('productivityUsername') || 'Productivity Pro';
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [profilePicture, setProfilePicture] = useState(() => {
    return localStorage.getItem('productivityProfilePic') || null;
  });

  // Daily Reset Logic
  useEffect(() => {
    const checkDayChange = () => {
      const now = new Date();
      const lastReset = new Date(lastResetDate);
      
      if (now.toDateString() !== lastReset.toDateString()) {
        setTotalTimers(prev => ({
          study: prev.study + dailyTimers.study,
          play: prev.play + dailyTimers.play,
          idle: prev.idle + dailyTimers.idle,
        }));
        setDailyTimers({ study: 0, play: 0, idle: 0 });
        setLastResetDate(new Date());
      }
    };

    const interval = setInterval(checkDayChange, 60000);
    return () => clearInterval(interval);
  }, [lastResetDate, dailyTimers]);

  // Active Timer Effect
  useEffect(() => {
    let timer;
    if (activeTimer) {
      timer = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTimer]);

  // Persistence Effects
  useEffect(() => localStorage.setItem('productivityDailyTimers', JSON.stringify(dailyTimers)), [dailyTimers]);
  useEffect(() => localStorage.setItem('productivityTotalTimers', JSON.stringify(totalTimers)), [totalTimers]);
  useEffect(() => localStorage.setItem('lastResetDate', lastResetDate.toISOString()), [lastResetDate]);
  useEffect(() => localStorage.setItem('productivityHeatmap', JSON.stringify(heatmapData)), [heatmapData]);
  useEffect(() => localStorage.setItem('productivityTodos', JSON.stringify(todos)), [todos]);
  useEffect(() => localStorage.setItem('productivityUsername', username), [username]);
  useEffect(() => {
    if (profilePicture) localStorage.setItem('productivityProfilePic', profilePicture);
  }, [profilePicture]);
  useEffect(() => {
    localStorage.setItem('productivityLevel', level);
    localStorage.setItem('productivityXp', xp);
  }, [level, xp]);

  // Helper Functions
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours > 0 ? `${hours}h` : null,
      minutes > 0 ? `${minutes}m` : null,
      `${remainingSeconds}s`
    ].filter(Boolean).join(' ');
  };

  const calculateProductivity = (timers) => {
    const { study, play } = timers;
    const totalTime = study + play;
    return totalTime > 0 ? Math.round((study / totalTime) * 100) : 0;
  };

  const calculateXpPercentage = () => ((xp % 3600) / 3600 * 100).toFixed(1);

  // Timer Controls
  const startTimer = (type) => setActiveTimer(type);

  const stopTimer = () => {
    if (activeTimer) {
      setDailyTimers(prev => ({
        ...prev,
        [activeTimer]: prev[activeTimer] + currentTime
      }));

      if (activeTimer === 'study') {
        const today = new Date().toISOString().split('T')[0];
        setHeatmapData(prev => 
          prev.map(item => 
            item.date === today
              ? { ...item, studyTime: item.studyTime + currentTime }
              : item
          )
        );
        updateLevel(currentTime);
      }
      
      setActiveTimer(null);
      setCurrentTime(0);
    }
  };

  const resetTimer = () => {
    setActiveTimer(null);
    setCurrentTime(0);
  };

  // Progression System
  const updateLevel = (studySeconds) => {
    const totalXp = xp + studySeconds;
    setXp(totalXp);
    setLevel(Math.floor(totalXp / 3600) + 1);
  };

  const getLevelTitle = (level) => {
    const titles = [
      { min: 250, title: 'Egoist', color: '#0077BE' },
      { min: 100, title: "Sung Jinwoo's Successor", color: '#FF4500' },
      { min: 91, title: 'Legendary Hunter', color: '#BA55D3' },
      { min: 76, title: 'Elite Hunter', color: '#9932CC' },
      { min: 61, title: "Shadow Monarch's Disciple", color: '#800080' },
      { min: 51, title: 'International Level Hunter', color: '#4B0082' },
      { min: 41, title: 'National Level Hunter', color: '#9400D3' },
      { min: 31, title: 'S-Rank Hunter', color: '#8A2BE2' },
      { min: 26, title: 'Special A-Rank Hunter', color: '#1E90FF' },
      { min: 21, title: 'A-Rank Hunter', color: '#4169E1' },
      { min: 16, title: 'B-Rank Hunter', color: '#FF6347' },
      { min: 11, title: 'C-Rank Hunter', color: '#FFD700' },
      { min: 6, title: 'D-Rank Hunter', color: '#ADFF2F' },
      { min: 1, title: 'E-Rank Hunter', color: '#90EE90' }
    ];
    return titles.find(t => level >= t.min) || { title: 'Weakest Hunter', color: '#808080' };
  };

  // Heatmap Functions
  const getHeatmapColor = (studySeconds) => {
    const hours = studySeconds / 3600;
    if (hours >= 5) return '#006400';
    if (hours >= 4) return '#228B22';
    if (hours >= 3) return '#32CD32';
    if (hours >= 2) return '#7CFC00';
    if (hours >= 1) return '#90EE90';
    return '#2D3748';
  };

  const renderHeatmap = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    return [
      ...Array(firstDay).fill().map((_, i) => (
        <div key={`empty-${i}`} className="w-10 h-10 m-1 bg-transparent" />
      )),
      ...Array(daysInMonth).fill().map((_, i) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
        const dateString = date.toISOString().split('T')[0];
        const dayData = heatmapData.find(d => d.date === dateString);
        const studyHours = Math.round((dayData?.studyTime || 0) / 3600);

        return (
          <div
            key={i + 1}
            className="w-10 h-10 m-1 rounded-lg cursor-pointer transition-all flex items-center justify-center hover:brightness-110"
            style={{ backgroundColor: getHeatmapColor(dayData?.studyTime || 0) }}
            title={`${dateString}\nStudied: ${studyHours} hour${studyHours !== 1 ? 's' : ''}`}
          >
            <span className="text-white">{i + 1}</span>
          </div>
        );
      })
    ];
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction));
  };

  // Todo Functions
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodo.trim(), 
        completed: false 
      }]);
      setNewTodo('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      editingTodoId ? updateTodo() : addTodo();
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const updateTodo = () => {
    if (newTodo.trim()) {
      setTodos(todos.map(todo => 
        todo.id === editingTodoId 
          ? { ...todo, text: newTodo.trim() }
          : todo
      ));
      setNewTodo('');
      setEditingTodoId(null);
    }
  };

  const startEditTodo = (todo) => {
    setNewTodo(todo.text);
    setEditingTodoId(todo.id);
  };

  // Profile Components
  const ProfileModal = () => {
    const totalProductivity = calculateProductivity(totalTimers);
    const totalStudyHours = Math.floor(totalTimers.study / 3600);
    const currentTitle = getLevelTitle(level);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl w-11/12 max-w-2xl p-8 relative border border-gray-700">
          <button 
            onClick={() => setIsProfileOpen(false)}
            className="absolute top-4 right-4 text-gray-300 hover:text-white"
          >
            <X size={28} />
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="relative group mx-auto w-40 h-40">
                <div className="w-full h-full rounded-full border-4 border-cyan-500 overflow-hidden">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <User className="w-20 h-20 text-gray-500" />
                    </div>
                  )}
                </div>
                <label 
                  htmlFor="profile-pic-upload"
                  className="absolute bottom-0 right-0 bg-cyan-600 p-2 rounded-full cursor-pointer hover:bg-cyan-500"
                >
                  <Camera size={20} className="text-white" />
                  <input 
                    type="file" 
                    id="profile-pic-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </label>
              </div>

              <div className="text-center">
                {isEditingUsername ? (
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none"
                      autoFocus
                      maxLength={20}
                    />
                    <button
                      onClick={() => setIsEditingUsername(false)}
                      className="bg-cyan-600 text-white p-2 rounded-lg"
                    >
                      <Check />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{username}</h2>
                      <button
                        onClick={() => setIsEditingUsername(true)}
                        className="text-gray-400 hover:text-cyan-300"
                      >
                        <Edit size={20} />
                      </button>
                    </div>
                    <div 
                      className="px-3 py-1 rounded-full text-sm font-medium bg-gray-800/50"
                      style={{ color: currentTitle.color }}
                    >
                      {currentTitle.title}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-700 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="text-amber-400" />
                  <h3 className="text-xl font-semibold">Level {level}</h3>
                </div>
                <div className="relative pt-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cyan-400">Progress</span>
                    <span className="text-cyan-400">{calculateXpPercentage()}%</span>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 rounded-full bg-gray-800">
                    <div
                      style={{ width: `${calculateXpPercentage()}%` }}
                      className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Star className="text-cyan-400" /> Lifetime Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard 
                    title="Total Study" 
                    value={formatTime(totalTimers.study)} 
                    icon={<BookOpen className="text-cyan-400" />}
                  />
                  <StatCard 
                    title="Total Play" 
                    value={formatTime(totalTimers.play)} 
                    icon={<Gamepad className="text-green-400" />}
                  />
                  <StatCard 
                    title="Productivity" 
                    value={`${totalProductivity}%`} 
                    icon={<Clock className="text-purple-400" />}
                  />
                  <StatCard 
                    title="Study Hours" 
                    value={`${totalStudyHours}h`} 
                    icon={<Star className="text-amber-400" />}
                  />
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-xl">
                <h3 className="text-lg font-semibold mb-3">Achievements</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                      <Trophy size={16} />
                    </div>
                    <span>Reached Level {level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <BookOpen size={16} />
                    </div>
                    <span>Studied {totalStudyHours}+ hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3 min-w-0">
      <div className="p-2 bg-gray-800 rounded-lg shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-400 truncate">{title}</p>
        <p className="text-lg font-bold truncate">{value}</p>
      </div>
    </div>
  );

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const currentTitle = getLevelTitle(level);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-mono">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="p-6 bg-gradient-to-r from-cyan-600 to-blue-800 text-white flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wider">PRODUCTIVITY OS</h1>
          <div className="flex items-center gap-3">
            <div 
              className="px-3 py-1 rounded-full text-sm bg-gray-800/50"
              style={{ color: currentTitle.color }}
            >
              {currentTitle.title}
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="mr-2 text-gray-300">Level {level}</span>
              <div className="flex-grow bg-gray-700 rounded-full h-4 relative">
                <div 
                  className="absolute h-full bg-cyan-500 rounded-full" 
                  style={{width: `${calculateXpPercentage()}%`}}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {['study', 'play', 'idle'].map(type => (
              <div 
                key={type}
                className={`rounded-lg p-4 text-center cursor-pointer transform transition-all 
                  ${activeTimer === type 
                    ? 'bg-cyan-900 scale-105 border-2 border-cyan-500' 
                    : 'bg-gray-700 hover:bg-gray-600'}`}
                onClick={() => startTimer(type)}
              >
                {type === 'study' && <BookOpen className="mx-auto mb-2 text-cyan-400" />}
                {type === 'play' && <Gamepad className="mx-auto mb-2 text-green-400" />}
                {type === 'idle' && <Clock className="mx-auto mb-2 text-gray-400" />}
                <h3 className="font-semibold uppercase text-gray-300">{type}</h3>
                <p className="text-white">
                  {formatTime(activeTimer === type ? currentTime : dailyTimers[type])}
                </p>
              </div>
            ))}
          </div>

          {activeTimer && (
            <div className="flex justify-center space-x-4 mb-6">
              <button 
                onClick={stopTimer}
                className="bg-cyan-600 text-white p-3 rounded-full hover:bg-cyan-500 transition-colors"
              >
                <Pause />
              </button>
              <button 
                onClick={resetTimer}
                className="bg-red-700 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
              >
                <RefreshCw />
              </button>
            </div>
          )}

          <div className="p-6 bg-gray-700 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Todo List</h2>
            <div className="flex mb-4">
              <input 
                type="text" 
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow p-2 bg-gray-600 text-white rounded-l-lg"
                placeholder="Enter a new todo"
              />
              <button 
                onClick={editingTodoId ? updateTodo : addTodo}
                className="bg-cyan-600 text-white p-2 rounded-r-lg hover:bg-cyan-500"
              >
                {editingTodoId ? <Check /> : <PlusCircle />}
              </button>
            </div>
            <div className="space-y-2">
              {todos.map(todo => (
                <div 
                  key={todo.id} 
                  className="flex items-center bg-gray-600 p-2 rounded-lg"
                >
                  <input 
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="mr-2 accent-cyan-500"
                  />
                  <span 
                    className={`flex-grow ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}
                  >
                    {todo.text}
                  </span>
                  <button 
                    onClick={() => startEditTodo(todo)}
                    className="text-gray-300 hover:text-white mr-2"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => changeMonth(-1)}
                className="text-gray-300 hover:text-white"
              >
                <ChevronLeft />
              </button>
              <h2 className="text-xl font-semibold text-gray-300">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => changeMonth(1)}
                className="text-gray-300 hover:text-white"
              >
                <ChevronRight />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 justify-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-gray-400 font-bold">{day}</div>
              ))}
              {renderHeatmap()}
            </div>
          </div>
        </div>
      </div>

      {isProfileOpen && <ProfileModal />}
    </div>
  );
};

export default ProductivityTracker;