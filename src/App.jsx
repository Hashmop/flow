import React, { useState, useEffect } from 'react';
import { 
  Clock, BookOpen, Gamepad
  , Pause, RefreshCw, ChevronLeft, ChevronRight, 
  PlusCircle, Trash2, Edit, Check, User, X, Camera
} from 'lucide-react';

const ProductivityTracker = () => {
  // Persistent State Management
  const [timers, setTimers] = useState(() => {
    const savedTimers = localStorage.getItem('productivityTimers');
    return savedTimers ? JSON.parse(savedTimers) : { study: 0, play: 0, idle: 0 };
  });

  const [activeTimer, setActiveTimer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [level, setLevel] = useState(() => {
    const savedLevel = localStorage.getItem('productivityLevel');
    return savedLevel ? parseInt(savedLevel) : 1;
  });
  
  const [xp, setXp] = useState(() => {
    const savedXp = localStorage.getItem('productivityXp');
    return savedXp ? parseInt(savedXp) : 0;
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [heatmapData, setHeatmapData] = useState(() => {
    const savedHeatmap = localStorage.getItem('productivityHeatmap');
    if (savedHeatmap) {
      const parsedHeatmap = JSON.parse(savedHeatmap);
      const today = new Date();
      if (new Date(parsedHeatmap[0].date).getMonth() === today.getMonth() &&
          new Date(parsedHeatmap[0].date).getFullYear() === today.getFullYear()) {
        return parsedHeatmap;
      }
    }
    
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(today.getFullYear(), today.getMonth(), i + 1).toISOString().split('T')[0],
      completed: false
    }));
  });

  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('productivityTodos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [newTodo, setNewTodo] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);

  // New Profile State
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('productivityUsername') || 'User';
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [profilePicture, setProfilePicture] = useState(() => {
    return localStorage.getItem('productivityProfilePic') || null;
  });

  // Persistent Storage Effects
  useEffect(() => {
    localStorage.setItem('productivityTimers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    localStorage.setItem('productivityLevel', level);
    localStorage.setItem('productivityXp', xp);
  }, [level, xp]);

  useEffect(() => {
    localStorage.setItem('productivityHeatmap', JSON.stringify(heatmapData));
  }, [heatmapData]);

  useEffect(() => {
    localStorage.setItem('productivityTodos', JSON.stringify(todos));
  }, [todos]);

  // Profile Effects
  useEffect(() => {
    localStorage.setItem('productivityUsername', username);
  }, [username]);

  useEffect(() => {
    if (profilePicture) {
      localStorage.setItem('productivityProfilePic', profilePicture);
    }
  }, [profilePicture]);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (activeTimer) {
      timer = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTimer]);

  // Profile Picture Upload Handler
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Formatting and Calculation Methods
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} sec`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} min ${remainingSeconds} sec`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours} hr ${minutes} min ${remainingSeconds} sec`;
  };

  const calculateProductivity = () => {
    const { study, play } = timers;
    const totalTime = study + play;
    if (totalTime === 0) return 0;
    return Math.round((study / totalTime) * 100);
  };

  const calculateXpPercentage = () => {
    return (xp % 3600) / 3600 * 100;
  };

  // Timer Control Methods
  const startTimer = (type) => {
    setActiveTimer(type);
  };

  const stopTimer = () => {
    if (activeTimer) {
      setTimers(prev => ({
        ...prev,
        [activeTimer]: prev[activeTimer] + currentTime
      }));

      if (activeTimer === 'study') {
        updateHeatmap(currentTime);
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

  const updateHeatmap = (studyTime) => {
    const today = new Date().toISOString().split('T')[0];
    setHeatmapData(prev => 
      prev.map(item => 
        item.date === today 
          ? { ...item, completed: studyTime >= 10800 } 
          : item
      )
    );
  };

  const updateLevel = (studySeconds) => {
    const totalXp = xp + studySeconds;
    const newLevel = Math.floor(totalXp / 3600) + 1;
    
    setXp(totalXp);
    setLevel(newLevel);
  };

  // Todo List Methods
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

  // Heatmap Rendering
  const renderHeatmap = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    const heatmapItems = [];
    
    for (let i = 0; i < firstDay; i++) {
      heatmapItems.push(
        <div key={`empty-${i}`} className="w-10 h-10 m-1 bg-transparent" />
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i).toISOString().split('T')[0];
      const dayData = heatmapData.find(item => item.date === dateString);
      
      heatmapItems.push(
        <div 
          key={i}
          className={`w-10 h-10 m-1 rounded-lg cursor-pointer transition-all flex items-center justify-center
            ${dayData?.completed 
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
          title={dateString}
        >
          {i}
        </div>
      );
    }

    return heatmapItems;
  };

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // Profile Modal Component
  const ProfileModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl w-96 p-6 relative">
          <button 
            onClick={() => setIsProfileOpen(false)}
            className="absolute top-4 right-4 text-gray-300 hover:text-white"
          >
            <X />
          </button>

          {/* Profile Picture Section */}
          <div className="relative mx-auto w-32 h-32 mb-4">
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-500" />
              </div>
            )}
            <label 
              htmlFor="profile-pic-upload"
              className="absolute bottom-0 right-0 bg-cyan-600 p-2 rounded-full cursor-pointer"
            >
              <Camera size={16} className="text-white" />
              <input 
                type="file" 
                id="profile-pic-upload"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureUpload}
              />
            </label>
          </div>

          {/* Username Section */}
          <div className="flex items-center justify-center mb-4">
            {isEditingUsername ? (
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded-l-lg mr-2"
                  maxLength={20}
                />
                <button 
                  onClick={() => setIsEditingUsername(false)}
                  className="bg-cyan-600 text-white p-2 rounded-r-lg"
                >
                  <Check />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className="text-2xl font-semibold mr-2">{username}</h2>
                <button 
                  onClick={() => setIsEditingUsername(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Edit size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Existing Profile Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Total Study Time</h3>
              <p className="text-white text-xl font-bold">{formatTime(timers.study)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Total Play Time</h3>
              <p className="text-white text-xl font-bold">{formatTime(timers.play)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 mb-2">Productivity</h3>
              <p className="text-white text-xl font-bold">{calculateProductivity()}%</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-mono">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="p-6 bg-gradient-to-r from-cyan-600 to-blue-800 text-white flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wider">PRODUCTIVITY OS</h1>
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

        <div className="p-6">
          {/* Level Progress */}
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

          {/* Timers Section */}
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
                  {formatTime(activeTimer === type ? currentTime : timers[type])}
                </p>
              </div>
            ))}
          </div>

          {/* Timer Controls */}
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

          {/* Todo List Section */}
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

          {/* Heatmap section */}
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

      {/* Profile Modal Rendering */}
      {isProfileOpen && <ProfileModal />}
    </div>
  );
};

export default ProductivityTracker;