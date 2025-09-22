import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const TaskManagementApp = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'open'
  });
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    permissions: 'read'
  });

  // API functions
  const api = {
    request: async (endpoint, options = {}) => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Request failed');
        }
        
        return response.json();
      } catch (error) {
        throw error;
      }
    },

    login: (credentials) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

    getTasks: () => api.request('/tasks'),
    createTask: (task) => api.request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
    updateTask: (id, task) => api.request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
    deleteTask: (id) => api.request(`/tasks/${id}`, { method: 'DELETE' }),

    getUsers: () => api.request('/admin/users'),
    createUser: (user) => api.request('/admin/users', { method: 'POST', body: JSON.stringify(user) }),
    updateUser: (id, user) => api.request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
    deleteUser: (id) => api.request(`/admin/users/${id}`, { method: 'DELETE' }),
  };

  // Effects
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      loadTasks();
    }
  }, []);

  // Functions
  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Error loading tasks: ' + error.message);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading users: ' + error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.login(loginData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      loadTasks();
      if (response.user.role === 'admin') {
        loadUsers();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
    setUsers([]);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'task') {
      setTaskForm(item || { title: '', description: '', assignedTo: '', status: 'open' });
    } else if (type === 'user') {
      setUserForm(item || { username: '', email: '', password: '', role: 'user', permissions: 'read' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setTaskForm({ title: '', description: '', assignedTo: '', status: 'open' });
    setUserForm({ username: '', email: '', password: '', role: 'user', permissions: 'read' });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateTask(editingItem._id, taskForm);
      } else {
        await api.createTask(taskForm);
      }
      loadTasks();
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { password, ...updateData } = userForm;
        await api.updateUser(editingItem._id, updateData);
      } else {
        await api.createUser(userForm);
      }
      loadUsers();
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(id);
        loadTasks();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        loadUsers();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#6b7280';
      case 'in progress': return '#3b82f6';
      case 'done': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'open': return { backgroundColor: '#f3f4f6', color: '#1f2937' };
      case 'in progress': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'done': return { backgroundColor: '#d1fae5', color: '#065f46' };
      default: return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  // CSS Styles
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    .container { min-height: 100vh; background-color: #f9fafb; }
    .header { background: white; border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .header-content { max-width: 1280px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; height: 4rem; }
    .title { font-size: 1.25rem; font-weight: 600; color: #111827; }
    .nav { background: white; border-bottom: 1px solid #e5e7eb; }
    .nav-content { max-width: 1280px; margin: 0 auto; padding: 0 1rem; display: flex; gap: 2rem; }
    .nav-button { padding: 1rem 0.5rem; border: none; background: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; border-bottom: 2px solid transparent; color: #6b7280; }
    .nav-button.active { border-bottom-color: #3b82f6; color: #3b82f6; }
    .main { max-width: 1280px; margin: 0 auto; padding: 2rem 1rem; }
    .login-container { min-height: 100vh; background: #f9fafb; display: flex; align-items: center; justify-content: center; }
    .login-box { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 24rem; }
    .form-group { margin-bottom: 1rem; }
    .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
    .input { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
    .input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
    .button { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; background: #3b82f6; color: white; }
    .button:hover { background: #2563eb; }
    .button-secondary { background: #f3f4f6; color: #374151; }
    .button-secondary:hover { background: #e5e7eb; }
    .button-danger { background: #ef4444; color: white; }
    .button-danger:hover { background: #dc2626; }
    .card { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 10px 15px rgba(0,0,0,0.1); width: 24rem; max-height: 90vh; overflow: auto; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { background: #f9fafb; padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; }
    .table td { padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .text-center { text-align: center; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .text-lg { font-size: 1.125rem; }
    .text-xl { font-size: 1.25rem; }
    .text-2xl { font-size: 1.5rem; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-700 { color: #374151; }
    .text-gray-900 { color: #111827; }
    .w-full { width: 100%; }
  `;

  // Login Form
  if (!user) {
    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: baseStyles }} />
        <div className="login-container">
          <div className="login-box">
            <h2 className="text-2xl font-bold text-center mb-6">Task Manager Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="label">Username</label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <button type="submit" className="button w-full" style={{ padding: '0.75rem' }}>
                Login
              </button>
            </form>
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <p>Default admin: admin / admin123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: baseStyles }} />
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1 className="title">Task Manager</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.username} ({user.role}) - {user.permissions}
              </span>
              <button onClick={handleLogout} className="button button-secondary">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="nav">
          <div className="nav-content">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`nav-button ${activeTab === 'tasks' ? 'active' : ''}`}
            >
              Tasks
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  loadUsers();
                }}
                className={`nav-button ${activeTab === 'admin' ? 'active' : ''}`}
              >
                Admin Console
              </button>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="main">
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                {user.permissions === 'write' && (
                  <button onClick={() => openModal('task')} className="button">
                    + Add Task
                  </button>
                )}
              </div>

              <div className="grid">
                {tasks.length === 0 ? (
                  <div className="card text-center">
                    <p className="text-gray-600">
                      No tasks found. {user.permissions === 'write' ? 'Create your first task!' : 'Check back later.'}
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task._id} className="card">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        {user.permissions === 'write' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('task', task)}
                              className="button button-secondary"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="button button-danger"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">{task.description || 'No description'}</p>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="badge" style={getStatusBadgeStyle(task.status)}>
                          {task.status}
                        </span>
                        {task.assignedTo && (
                          <span className="text-sm text-gray-500">
                            Assigned to: {task.assignedTo.username}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created by: {task.createdBy?.username || 'Unknown'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <button onClick={() => openModal('user')} className="button">
                  + Add User
                </button>
              </div>

              <div className="card" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Permissions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem._id}>
                        <td>
                          <div>
                            <div className="font-semibold">{userItem.username}</div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: userItem.role === 'admin' ? '#fee2e2' : '#dcfce7',
                            color: userItem.role === 'admin' ? '#991b1b' : '#166534'
                          }}>
                            {userItem.role}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: userItem.permissions === 'write' ? '#dbeafe' : '#f3f4f6',
                            color: userItem.permissions === 'write' ? '#1e40af' : '#1f2937'
                          }}>
                            {userItem.permissions}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => openModal('user', userItem)}
                            className="button button-secondary"
                            style={{ marginRight: '0.5rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem._id)}
                            className="button button-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Modal */}
        {showModal && (
          <div className="modal" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="modal-content">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'task' ? 'Task' : 'User'}
              </h3>
              
              {modalType === 'task' ? (
                <form onSubmit={handleTaskSubmit}>
                  <div className="form-group">
                    <label className="label">Title</label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Description</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      className="input"
                      rows="3"
                      style={{ minHeight: '80px', resize: 'vertical' }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Status</label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                      className="input"
                    >
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Assign To</label>
                    <select
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      className="input"
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                    <button type="button" onClick={closeModal} className="button button-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="button">
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleUserSubmit}>
                  <div className="form-group">
                    <label className="label">Username</label>
                    <input
                      type="text"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  
                  {!editingItem && (
                    <div className="form-group">
                      <label className="label">Password</label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label className="label">Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="input"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Permissions</label>
                    <select
                      value={userForm.permissions}
                      onChange={(e) => setUserForm({ ...userForm, permissions: e.target.value })}
                      className="input"
                    >
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between" style={{ marginTop: '1.5rem' }}>
                    <button type="button" onClick={closeModal} className="button button-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="button">
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagementApp;