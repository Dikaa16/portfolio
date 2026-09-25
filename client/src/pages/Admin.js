import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './Admin.css';

function AdminAuth({ onLogin, notice }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(notice || '');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { password });
      localStorage.setItem('adminToken', response.data.token);
     onLogin();
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server. Please try again in a moment.');
      } else if (err.response.status === 429) {
        setError('Too many login attempts. Please wait 15 minutes.');
      } else if (err.response.status === 401) {
        setError('Incorrect password');
      } else {
        setError(err.response.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="admin-login">
      <div className="login-box">
        <h1>Admin Login</h1>
        <p>Enter password to access admin panel</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="login-input"
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

// True if the JWT exists and its exp claim is still in the future
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
});

// Image upload component — reusable for any image field
function ImageUpload({ value, onChange, folder, label = 'Image URL' }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axios.post(
        `${API_URL}/api/upload?folder=${folder}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      onChange(response.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload below"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '0.75rem 1.25rem',
            background: uploading ? '#ccc' : 'var(--accent)',
            color: 'white',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          {uploading ? 'Uploading...' : '📁 Upload'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          marginTop: '0.5rem',
          padding: '1rem',
          border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          background: dragOver ? '#fffbea' : 'transparent',
          textAlign: 'center',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-light)',
          transition: 'all 0.2s'
        }}
      >
        {uploading ? '⏳ Uploading to Cloudinary...' : 'Or drag & drop an image here'}
      </div>

      {/* Preview */}
      {value && (
        <div style={{ marginTop: '0.75rem' }}>
          <img
            src={value}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '120px',
              objectFit: 'cover',
              border: '1px solid var(--border)',
              borderRadius: '4px'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
}

const DELIMITER = '|';
const DELIMITER_LABEL = 'pipe-separated, e.g. item1 | item2';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubTab, setHomeSubTab] = useState('experience');
  const [creativesSubTab, setCreativesSubTab] = useState('photo');
  const [viewMode, setViewMode] = useState('manage');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('work');
  const [adminTagFilter, setAdminTagFilter] = useState('all');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');

  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    if (isTokenValid(localStorage.getItem('adminToken'))) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('adminToken');
    }
  }, []);

  // Token expired or rejected mid-session: return to login. Form state is kept,
  // so unsaved edits are still there after logging back in.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isLogin = error.config?.url?.endsWith('/api/admin/login');
        if (error.response?.status === 401 && !isLogin) {
          localStorage.removeItem('adminToken');
          setAuthNotice('Session expired. Please log in again.');
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    if (isAuthenticated && viewMode === 'manage') {
      if (activeTab === 'home') fetchHomeItems();
      else if (activeTab === 'creatives') fetchCreativesItems();
      else fetchItems();
    }
  }, [activeTab, homeSubTab, creativesSubTab, viewMode, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const fetchHomeItems = async () => {
    setLoading(true);
    try {
      let endpoint = 'experience';
      if (homeSubTab === 'projects') endpoint = 'projects';
      else if (homeSubTab === 'skills') endpoint = 'skills';
      else if (homeSubTab === 'courses') endpoint = 'courses';
      
      const response = await axios.get(`${API_URL}/api/${endpoint}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error loading items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreativesItems = async () => {
    setLoading(true);
    try {
      let endpoint = 'photography';
      if (creativesSubTab === 'video') endpoint = 'videos';
      else if (creativesSubTab === 'others') endpoint = 'creatives';
      
      const response = await axios.get(`${API_URL}/api/${endpoint}`);
      setItems(response.data);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error loading items');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = getEndpoint(activeTab);
      const url = activeTab === 'blog' ? `${API_URL}/api/blog/all` : `${API_URL}/api/${endpoint}`;
      const response = await axios.get(url, activeTab === 'blog' ? getAuthHeaders() : {});
      setItems(response.data);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error loading items');
    } finally {
      setLoading(false);
    }
  };

  const getEndpoint = (tab) => {
    const endpoints = { blog: 'blog' };
    return endpoints[tab];
  };

  const getCreativesEndpoint = () => {
    const endpoints = { photo: 'photography', video: 'videos', others: 'creatives' };
    return endpoints[creativesSubTab];
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const processedData = { ...formData };
      if (activeTab === 'home' && homeSubTab === 'experience' && !processedData.type) {
        processedData.type = 'work';
      }
      // Process array fields — use | delimiter
      const arrayFields = ['technologies', 'achievements', 'highlights', 'tags'];
      arrayFields.forEach(field => {
        if (typeof processedData[field] === 'string') {
          processedData[field] = processedData[field].split(DELIMITER).map(item => item.trim()).filter(Boolean);
        }
      });
      
      // Process skills array — use | delimiter
      if (endpoint === 'skills' && typeof processedData.skills === 'string') {
        processedData.skills = processedData.skills
          .split(DELIMITER)
          .map(skill => ({ name: skill.trim(), featured: true }))
          .filter(skill => skill.name);
      }
      
      if (editingId) {
        await axios.put(`${API_URL}/api/${endpoint}/${editingId}`, processedData, getAuthHeaders());
        setMessage(`✅ Updated successfully!`);
      } else {
        await axios.post(`${API_URL}/api/${endpoint}`, processedData, getAuthHeaders());
        setMessage(`✅ Created successfully!`);
      }
      
      setFormData({});
      setEditingId(null);
      setViewMode('manage');
      
      if (activeTab === 'home') fetchHomeItems();
      else if (activeTab === 'creatives') fetchCreativesItems();
      else fetchItems();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (item) => {
    const editData = { ...item };
    
    // Convert arrays back to | separated strings for editing
    const arrayFields = ['technologies', 'achievements', 'highlights', 'tags'];
    arrayFields.forEach(field => {
      if (Array.isArray(editData[field])) {
        editData[field] = editData[field].join(' | ');
      }
    });
    
    // Process skills for editing
    if (homeSubTab === 'skills' && Array.isArray(editData.skills)) {
      editData.skills = editData.skills.map(s => s.name).join(' | ');
    }
    
    setFormData(editData);
    setEditingId(item._id);
    setViewMode('create');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, endpoint) => {
    if (!window.confirm('Are you sure?')) return;

    setMessage('');
    try {
      await axios.delete(`${API_URL}/api/${endpoint}/${id}`, getAuthHeaders());
      setMessage('✅ Deleted successfully!');
      
      if (activeTab === 'home') fetchHomeItems();
      else if (activeTab === 'creatives') fetchCreativesItems();
      else fetchItems();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleReorder = async (itemId, direction) => {
    const currentIndex = filteredItems.findIndex(item => item._id === itemId);
    if (currentIndex === -1) return;
    
    const allItemsCopy = [...items];
    const itemIndexInAll = allItemsCopy.findIndex(item => item._id === itemId);
    const swapIndex = direction === 'up' ? itemIndexInAll - 1 : itemIndexInAll + 1;
    
    if (swapIndex < 0 || swapIndex >= allItemsCopy.length) return;
    
    [allItemsCopy[itemIndexInAll], allItemsCopy[swapIndex]] = [allItemsCopy[swapIndex], allItemsCopy[itemIndexInAll]];
    
    const updates = allItemsCopy.map((item, index) => ({ id: item._id, order: index }));
    
    try {
      let endpoint = 'experience';
      if (activeTab === 'home') {
        if (homeSubTab === 'projects') endpoint = 'projects';
        else if (homeSubTab === 'skills') endpoint = 'skills';
        else if (homeSubTab === 'courses') endpoint = 'courses';
      } else if (activeTab === 'creatives') {
        endpoint = getCreativesEndpoint();
      }
      
      await axios.put(`${API_URL}/api/${endpoint}/reorder`, { items: updates }, getAuthHeaders());
      setItems(allItemsCopy);
      setMessage('✅ Order updated!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Reorder error:', error);
      setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setViewMode('manage');
    setMessage('');
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setViewMode('manage');
    setEditingId(null);
    setFormData({});
    setMessage('');
    setItems([]);
    setTypeFilter('work');
    setAdminTagFilter('all');
    setAdminCategoryFilter('all');
  };

  const handleHomeSubTabChange = (newSubTab) => {
    setHomeSubTab(newSubTab);
    setViewMode('manage');
    setEditingId(null);
    setFormData({});
    setMessage('');
    setItems([]);
    setTypeFilter('work');
    setAdminTagFilter('all');
    setAdminCategoryFilter('all');
  };

  const handleCreativesSubTabChange = (newSubTab) => {
    setCreativesSubTab(newSubTab);
    setViewMode('manage');
    setEditingId(null);
    setFormData({});
    setMessage('');
    setItems([]);
    setAdminTagFilter('all');
    setAdminCategoryFilter('all');
  };

  if (!isAuthenticated) {
    return <AdminAuth notice={authNotice} onLogin={() => { setAuthNotice(''); setIsAuthenticated(true); }} />;
  }

  // Derive available tags and categories from current items
  const availableTags = [...new Set(items.flatMap(item => item.tags || []))].filter(Boolean);
  const availableCategories = [...new Set(items.map(item => item.category).filter(Boolean))];

  // Filter items based on active filters
  const filteredItems = items.filter(item => {
    // Experience type filter
    if (activeTab === 'home' && homeSubTab === 'experience' && typeFilter) {
      if (item.type !== typeFilter) return false;
    }
    // Category filter
    if (adminCategoryFilter !== 'all' && item.category !== adminCategoryFilter) return false;
    // Tag filter
    if (adminTagFilter !== 'all' && !(item.tags || []).includes(adminTagFilter)) return false;
    return true;
  });

  // Reusable filter bar component
  const AdminFilterBar = ({ showCategory, showTag, showStatus }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      {showCategory && availableCategories.length > 0 && (
        <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)' }}>Category</span>
          {['all', ...availableCategories].map(cat => (
            <button key={cat} onClick={() => { setAdminCategoryFilter(cat); setAdminTagFilter('all'); }}
              style={{ padding: '0.35rem 0.75rem', border: adminCategoryFilter === cat ? '2px solid var(--accent)' : '2px solid var(--border)', background: adminCategoryFilter === cat ? 'var(--accent)' : 'transparent', color: adminCategoryFilter === cat ? 'white' : 'var(--text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: '0.7rem', borderRadius: '3px' }}>
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}
      {showTag && availableTags.length > 0 && (
        <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)' }}>Tag</span>
          {['all', ...availableTags].map(tag => (
            <button key={tag} onClick={() => setAdminTagFilter(tag)}
              style={{ padding: '0.35rem 0.75rem', border: adminTagFilter === tag ? '2px solid var(--accent)' : '2px solid var(--border)', background: adminTagFilter === tag ? 'var(--accent)' : 'transparent', color: adminTagFilter === tag ? 'white' : 'var(--text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: '0.7rem', borderRadius: '3px' }}>
              {tag === 'all' ? 'All' : tag}
            </button>
          ))}
        </div>
      )}
      {filteredItems.length !== items.length && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-light)' }}>
          Showing {filteredItems.length} of {items.length} items
        </p>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage your portfolio content</p>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="admin-tabs">
        <button className={activeTab === 'home' ? 'active' : ''} onClick={() => handleTabChange('home')}>
          Home Settings
        </button>
        <button className={activeTab === 'blog' ? 'active' : ''} onClick={() => handleTabChange('blog')}>
          Blog Posts
        </button>
        <button className={activeTab === 'creatives' ? 'active' : ''} onClick={() => handleTabChange('creatives')}>
          Creatives
        </button>
      </div>

      {activeTab === 'home' && (
        <div className="home-settings">
          <h2>Home Page Settings</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
            Manage content for your homepage.
          </p>

          <div className="admin-tabs" style={{ marginBottom: '2rem' }}>
            <button className={homeSubTab === 'experience' ? 'active' : ''} onClick={() => handleHomeSubTabChange('experience')}>
              Experience
            </button>
            <button className={homeSubTab === 'projects' ? 'active' : ''} onClick={() => handleHomeSubTabChange('projects')}>
              Projects
            </button>
            <button className={homeSubTab === 'courses' ? 'active' : ''} onClick={() => handleHomeSubTabChange('courses')}>
              Courses
            </button>
            <button className={homeSubTab === 'skills' ? 'active' : ''} onClick={() => handleHomeSubTabChange('skills')}>
              Skills
            </button>
          </div>

          <div className="view-mode-toggle">
            <button className={viewMode === 'create' ? 'active' : ''} onClick={() => { setViewMode('create'); setEditingId(null); setFormData({}); }}>
              {editingId ? `Edit ${homeSubTab}` : `Create New ${homeSubTab}`}
            </button>
            <button className={viewMode === 'manage' ? 'active' : ''} onClick={() => { setViewMode('manage'); setEditingId(null); setFormData({}); }}>
              Manage Existing {homeSubTab}
            </button>
          </div>

          {/* EXPERIENCE FORM */}
          {homeSubTab === 'experience' && viewMode === 'create' && (
            <form onSubmit={(e) => handleSubmit(e, 'experience')} className="admin-form">
              <h2>{editingId ? 'Edit Experience' : 'Add Experience'}</h2>
              
              <div className="form-group">
                <label>Title (Job Title) *</label>
                <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required placeholder="Software Engineer" />
              </div>

              <div className="form-group">
                <label>Organization *</label>
                <input type="text" name="company" value={formData.company || ''} onChange={handleChange} required placeholder="Tech Organization Inc" />
              </div>

              <ImageUpload
                value={formData.logoUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
                folder="experience"
                label="Company Logo"
              />

              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Vancouver, BC" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="text" name="startDate" value={formData.startDate || ''} onChange={handleChange} required placeholder="January 2024" />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input type="text" name="endDate" value={formData.endDate || ''} onChange={handleChange} required placeholder="Present" />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" placeholder="Brief description" />
              </div>

              <div className="form-group">
                <label>Technologies</label>
                <input type="text" name="technologies" value={formData.technologies || ''} onChange={handleChange} placeholder="React, Node.js, MongoDB" />
                <small>Separate with | (pipe character)</small>
              </div>

              <div className="form-group">
                <label>Achievements</label>
                <textarea name="achievements" value={formData.achievements || ''} onChange={handleChange} rows="3" placeholder="Led team of 5, Improved performance by 50%" />
                <small>Separate with | (pipe character)</small>
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={formData.type || 'work'} onChange={handleChange} required>
                  <option value="work">Work</option>
                  <option value="education">Education</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleChange} />
                  Featured (show on homepage)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">{editingId ? 'Update Experience' : 'Add Experience'}</button>
                <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>
              </div>
            </form>
          )}

          {/* PROJECTS FORM */}
          {homeSubTab === 'projects' && viewMode === 'create' && (
            <form onSubmit={(e) => handleSubmit(e, 'projects')} className="admin-form">
              <h2>{editingId ? 'Edit Project' : 'Add Project'}</h2>
              
              <div className="form-group">
                <label>Project Name *</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required placeholder="My Awesome Project" />
              </div>

              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                folder="projects"
                label="Project Image"
              />

              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} required rows="3" />
              </div>

              <div className="form-group">
                <label>Technologies</label>
                <input type="text" name="technologies" value={formData.technologies || ''} onChange={handleChange} required placeholder="React, Node.js" />
                <small>Separate with | (pipe character)</small>
              </div>

              <div className="form-group">
                <label>GitHub URL</label>
                <input type="text" name="githubUrl" value={formData.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/username/project" />
              </div>

              <div className="form-group">
                <label>Live Demo URL</label>
                <input type="text" name="liveUrl" value={formData.liveUrl || ''} onChange={handleChange} placeholder="https://project.com" />
              </div>

              <div className="form-group">
                <label>Highlights</label>
                <textarea name="highlights" value={formData.highlights || ''} onChange={handleChange} rows="3" />
                <small>Separate with | (pipe character)</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="text" name="startDate" value={formData.startDate || ''} onChange={handleChange} placeholder="January 2024" />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="text" name="endDate" value={formData.endDate || ''} onChange={handleChange} placeholder="March 2024" />
                </div>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleChange} />
                  Featured (show on homepage)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">{editingId ? 'Update Project' : 'Add Project'}</button>
                <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>
              </div>
            </form>
          )}

          {/* SKILLS FORM */}
          {homeSubTab === 'skills' && viewMode === 'create' && (
            <form onSubmit={(e) => handleSubmit(e, 'skills')} className="admin-form">
              <h2>{editingId ? 'Edit Skill Category' : 'Add Skill Category'}</h2>
              
              <div className="form-group">
                <label>Category Name *</label>
                <input type="text" name="category" value={formData.category || ''} onChange={handleChange} required placeholder="e.g., Languages, Frameworks, Tools" />
              </div>

              <div className="form-group">
                <label>Skills () *</label>
                <textarea name="skills" value={formData.skills || ''} onChange={handleChange} required rows="3" placeholder="JavaScript, Python, Java, TypeScript" />
                <small>Separate skill names with | (pipe character)</small>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="featured" checked={formData.featured !== false} onChange={handleChange} />
                  Featured (show on homepage)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">{editingId ? 'Update Category' : 'Add Category'}</button>
                <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>
              </div>
            </form>
          )}

          {/* COURSES FORM */}
          {homeSubTab === 'courses' && viewMode === 'create' && (
            <form onSubmit={(e) => handleSubmit(e, 'courses')} className="admin-form">
              <h2>{editingId ? 'Edit Course' : 'Add Course'}</h2>
              
              <div className="form-group">
                <label>Course Name *</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required placeholder="Data Structures and Algorithms" />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" placeholder="Brief description" />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="featured" checked={formData.featured !== false} onChange={handleChange} />
                  Featured (show on homepage)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">{editingId ? 'Update Course' : 'Add Course'}</button>
                <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>
              </div>
            </form>
          )}

          {/* MANAGE VIEW */}
          {viewMode === 'manage' && (
            <div className="manage-view">
              <h2>Manage {homeSubTab}</h2>
              
              {homeSubTab === 'experience' && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['work', 'education', 'volunteer'].map(type => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: typeFilter === type ? '2px solid var(--accent)' : '2px solid var(--border)',
                        background: typeFilter === type ? 'var(--accent)' : 'transparent',
                        color: typeFilter === type ? 'white' : 'var(--text)',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
              
              {loading ? (
                <div className="loading">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="empty-state">
                  <p>No {homeSubTab} yet.</p>
                  <button onClick={() => setViewMode('create')} className="btn">Create New</button>
                </div>
              ) : (
                <div className="items-list">
                  {filteredItems.map((item, index) => (
                    <div key={item._id} className="item-card">
                      <div className="item-content">
                        <h3>{homeSubTab === 'experience' ? item.company : homeSubTab === 'skills' ? item.category : item.name}</h3>
                        <p className="item-meta">
                          {homeSubTab === 'experience' && `${item.title} • ${item.type}`}
                          {homeSubTab === 'projects' && `${item.startDate} - ${item.endDate}`}
                          {homeSubTab === 'skills' && `${item.skills.length} skills`}
                        </p>
                        <p className="item-desc">{item.description || (homeSubTab === 'skills' && item.skills.map(s => s.name).join(', '))}</p>
                        {item.featured && <span className="status-badge published">Featured</span>}
                      </div>
                      <div className="item-actions">
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <button onClick={() => handleReorder(item._id, 'up')} className="btn-reorder" disabled={index === 0}>↑</button>
                          <button onClick={() => handleReorder(item._id, 'down')} className="btn-reorder" disabled={index === filteredItems.length - 1}>↓</button>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', alignSelf: 'center' }}>Order: {index + 1}</span>
                        </div>
                        <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                        <button onClick={() => handleDelete(item._id, homeSubTab === 'experience' ? 'experience' : homeSubTab === 'projects' ? 'projects' : homeSubTab === 'skills' ? 'skills' : 'courses')} className="btn-delete">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* BLOG TAB */}
      {activeTab === 'blog' && (
        <>
          <div className="view-mode-toggle">
            <button className={viewMode === 'create' ? 'active' : ''} onClick={() => { setViewMode('create'); setEditingId(null); setFormData({}); }}>
              {editingId ? 'Edit Post' : 'Create New Post'}
            </button>
            <button className={viewMode === 'manage' ? 'active' : ''} onClick={() => { setViewMode('manage'); setEditingId(null); setFormData({}); }}>
              Manage Existing Posts
            </button>
          </div>

          {viewMode === 'manage' ? (
            <div className="manage-view">
              <h2>Manage Blog Posts</h2>
              <AdminFilterBar showTag={true} />
              {loading ? (
                <div className="loading">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="empty-state">
                  <p>No blog posts match filters.</p>
                  <button onClick={() => setViewMode('create')} className="btn">Create New</button>
                </div>
              ) : (
                <div className="items-list">
                  {filteredItems.map(item => (
                    <div key={item._id} className="item-card">
                      <div className="item-content">
                        <h3>{item.title}</h3>
                        <p className="item-meta">{item.slug}</p>
                        <p className="item-desc">{item.excerpt}</p>
                        {item.tags && item.tags.length > 0 && (
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                            Tags: {item.tags.join(', ')}
                          </p>
                        )}
                        <span className={`status-badge ${item.published ? 'published' : 'draft'}`}>
                          {item.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="item-actions">
                        <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                        <button onClick={() => handleDelete(item._id, 'blog')} className="btn-delete">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmit(e, 'blog')} className="admin-form">
              <h2>{editingId ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
              
              <div className="form-group">
                <label>Title *</label>
                <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Slug *</label>
                <input type="text" name="slug" value={formData.slug || ''} onChange={handleChange} required placeholder="my-blog-post" />
                <small>URL-friendly (lowercase, hyphens)</small>
              </div>

              <div className="form-group">
                <label>Excerpt *</label>
                <textarea name="excerpt" value={formData.excerpt || ''} onChange={handleChange} required rows="2" maxLength="200" />
                <small>Max 200 characters</small>
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea name="content" value={formData.content || ''} onChange={handleChange} required rows="15" />
                <small>Supports Markdown</small>
              </div>

              <ImageUpload
                value={formData.coverImage}
                onChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                folder="blog"
                label="Cover Image"
              />

              <div className="form-group">
                <label>Tags ({DELIMITER_LABEL})</label>
                <input type="text" name="tags" value={formData.tags || ''} onChange={handleChange} placeholder="tech | coding | tutorial" />
                <small>Separate with | (pipe character)</small>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="published" checked={formData.published || false} onChange={handleChange} />
                  Published
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">{editingId ? 'Update Post' : 'Create Post'}</button>
                {editingId && <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>}
              </div>
            </form>
          )}
        </>
      )}

      {/* CREATIVES TAB */}
      {activeTab === 'creatives' && (
        <div className="creatives-settings">
          <h2>Creatives Settings</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
            Manage photography, videos, and other creative content. Only featured items appear on the Creatives page.
          </p>

          <div className="admin-tabs" style={{ marginBottom: '2rem' }}>
            <button className={creativesSubTab === 'photo' ? 'active' : ''} onClick={() => handleCreativesSubTabChange('photo')}>Photography</button>
            <button className={creativesSubTab === 'video' ? 'active' : ''} onClick={() => handleCreativesSubTabChange('video')}>Videos</button>
            <button className={creativesSubTab === 'others' ? 'active' : ''} onClick={() => handleCreativesSubTabChange('others')}>Others</button>
          </div>

          <div className="view-mode-toggle">
            <button className={viewMode === 'create' ? 'active' : ''} onClick={() => { setViewMode('create'); setEditingId(null); setFormData({}); }}>
              {editingId ? `Edit` : `Create New`}
            </button>
            <button className={viewMode === 'manage' ? 'active' : ''} onClick={() => { setViewMode('manage'); setEditingId(null); setFormData({}); }}>
              Manage Existing
            </button>
          </div>

          {/* PHOTOGRAPHY FORM */}
          {creativesSubTab === 'photo' && viewMode === 'create' && (
            <form onSubmit={(e) => handleSubmit(e, 'photography')} className="admin-form">
              <h2>{editingId ? 'Edit Photo' : 'Add Photo'}</h2>
              <div className="form-group"><label>Title *</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} required placeholder="Sunset at English Bay" /></div>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                folder="photography"
                label="Image *"
              />
              <div className="form-group"><label>Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" placeholder="Brief description" /></div>
              <div className="form-group"><label>Category</label>
                <select name="category" value={formData.category || 'other'} onChange={handleChange}>
                  <option value="landscape">Landscape</option><option value="portrait">Portrait</option><option value="street">Street</option><option value="event">Event</option><option value="other">Other</option>
                </select>
              </div>
              <div className="form-group"><label>Tags ({DELIMITER_LABEL})</label><input type="text" name="tags" value={formData.tags || ''} onChange={handleChange} placeholder="nature | sunset | vancouver" /><small>Separate with | (pipe character)</small></div>
              <div className="form-group checkbox"><label><input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleChange} /> Featured (show on Creatives page)</label></div>
              <div className="form-actions"><button type="submit" className="submit-btn">{editingId ? 'Update' : 'Add'}</button><button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button></div>
            </form>
          )}

          {/* VIDEO FORM */}
          {creativesSubTab === 'video' && viewMode === 'create' && (
            <form onSubmit={(e) => handleSubmit(e, 'videos')} className="admin-form">
              <h2>{editingId ? 'Edit Video' : 'Add Video'}</h2>
              <div className="form-group"><label>Title *</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} required placeholder="My Video" /></div>
              <div className="form-group"><label>YouTube Video ID *</label><input type="text" name="youtubeId" value={formData.youtubeId || ''} onChange={handleChange} required placeholder="dQw4w9WgXcQ" /><small>The ID from youtube.com/watch?v=THIS_PART</small></div>
              <ImageUpload
                value={formData.thumbnail}
                onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                folder="videos"
                label="Custom Thumbnail (optional)"
              />
              <div className="form-group"><label>Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" /></div>
              <div className="form-group"><label>Category</label><input type="text" name="category" value={formData.category || ''} onChange={handleChange} placeholder="e.g. vlog, tutorial, music" /></div>
              <div className="form-group"><label>Tags ({DELIMITER_LABEL})</label><input type="text" name="tags" value={formData.tags || ''} onChange={handleChange} placeholder="vlog | travel" /><small>Separate with | (pipe character)</small></div>
              <div className="form-group checkbox"><label><input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleChange} /> Featured (show on Creatives page)</label></div>
              <div className="form-actions"><button type="submit" className="submit-btn">{editingId ? 'Update' : 'Add'}</button><button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button></div>
            </form>
          )}

          {/* OTHERS FORM */}
          {creativesSubTab === 'others' && viewMode === 'create' && (
            <form onSubmit={(e) => handleSubmit(e, 'creatives')} className="admin-form">
              <h2>{editingId ? 'Edit Creative' : 'Add Creative'}</h2>
              <div className="form-group"><label>Title *</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} required placeholder="My Creative Work" /></div>
              <div className="form-group"><label>Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" /></div>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                folder="creatives"
                label="Image"
              />
              <div className="form-group"><label>Link URL</label><input type="text" name="linkUrl" value={formData.linkUrl || ''} onChange={handleChange} placeholder="https://..." /></div>
              <div className="form-group"><label>Category</label><input type="text" name="category" value={formData.category || ''} onChange={handleChange} placeholder="e.g. design, music, writing" /></div>
              <div className="form-group"><label>Tags ({DELIMITER_LABEL})</label><input type="text" name="tags" value={formData.tags || ''} onChange={handleChange} placeholder="design | illustration" /><small>Separate with | (pipe character)</small></div>
              <div className="form-group checkbox"><label><input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleChange} /> Featured (show on Creatives page)</label></div>
              <div className="form-actions"><button type="submit" className="submit-btn">{editingId ? 'Update' : 'Add'}</button><button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button></div>
            </form>
          )}

          {/* CREATIVES MANAGE VIEW */}
          {viewMode === 'manage' && (
            <div className="manage-view">
              <h2>Manage {creativesSubTab === 'photo' ? 'Photography' : creativesSubTab === 'video' ? 'Videos' : 'Others'}</h2>
              <AdminFilterBar showCategory={true} showTag={true} />
              {loading ? (
                <div className="loading">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="empty-state">
                  <p>No items match filters.</p>
                  <button onClick={() => setViewMode('create')} className="btn">Create New</button>
                </div>
              ) : (
                <div className="items-list">
                  {filteredItems.map((item, index) => (
                    <div key={item._id} className="item-card">
                      <div className="item-content">
                        <h3>{item.title}</h3>
                        <p className="item-meta">
                          {item.category && <span>{item.category}</span>}
                          {creativesSubTab === 'video' && ` • YouTube: ${item.youtubeId}`}
                        </p>
                        <p className="item-desc">{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                            Tags: {item.tags.join(', ')}
                          </p>
                        )}
                        {item.featured && <span className="status-badge published">Featured</span>}
                        {!item.featured && <span className="status-badge draft">Hidden</span>}
                      </div>
                      <div className="item-actions">
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <button onClick={() => handleReorder(item._id, 'up')} className="btn-reorder" disabled={index === 0}>↑</button>
                          <button onClick={() => handleReorder(item._id, 'down')} className="btn-reorder" disabled={index === filteredItems.length - 1}>↓</button>
                        </div>
                        <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                        <button onClick={() => handleDelete(item._id, getCreativesEndpoint())} className="btn-delete">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="admin-help">
        <h3>📚 Quick Help</h3>
        <ul>
          <li><strong>Home Settings:</strong> Manage Experience, Projects, Skills & Courses</li>
          <li><strong>Creatives:</strong> Manage Photography, Videos & Other creative works</li>
          <li><strong>Featured:</strong> Check to show items on the page</li>
          <li><strong>Reorder:</strong> Use ↑ ↓ buttons to change order</li>
          <li><strong>Delimiter:</strong> Use <code>|</code> (pipe) to separate list items</li>
          <li><strong>Filters:</strong> Use tag/category filters in manage view to find items quickly</li>
        </ul>
      </div>
    </div>
  );
}

export default Admin;