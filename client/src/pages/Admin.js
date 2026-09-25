import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, authHeaders, clearToken, isTokenValid, actionErrorMessage } from '../lib/api';
import { SECTIONS, TABS, toPayload, toFormData } from './admin/sections';
import AdminLogin from './admin/AdminLogin';
import ItemList from './admin/ItemList';
import FilterBar from './admin/FilterBar';
import './Admin.css';

const DEFAULT_FILTERS = { type: 'work', category: 'all', tag: 'all' };

const matchesFilters = (item, section, filters) =>
  (!section.filters?.includes('type') || item.type === filters.type) &&
  (filters.category === 'all' || item.category === filters.category) &&
  (filters.tag === 'all' || (item.tags || []).includes(filters.tag));

function TabBar({ tabs, active, onSelect, className = 'admin-tabs' }) {
  return (
    <div className={className}>
      {tabs.map(({ id, label }) => (
        <button key={id} className={active === id ? 'active' : ''} onClick={() => onSelect(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function AdminHelp() {
  return (
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
  );
}

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid);
  const [authNotice, setAuthNotice] = useState('');
  const [tabId, setTabId] = useState(TABS[0].id);
  const [sectionId, setSectionId] = useState(TABS[0].sections[0]);
  const [viewMode, setViewMode] = useState('manage');
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [message, setMessage] = useState(null);
  const messageTimer = useRef(null);

  const tab = TABS.find(t => t.id === tabId);
  const section = SECTIONS[sectionId];

  const showMessage = useCallback((tone, text, hideAfterMs) => {
    clearTimeout(messageTimer.current);
    setMessage({ tone, text });
    if (hideAfterMs) messageTimer.current = setTimeout(() => setMessage(null), hideAfterMs);
  }, []);

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  useEffect(() => {
    if (!isTokenValid()) clearToken();
  }, []);

  // Token expired or rejected mid-session: return to login. Form state is kept,
  // so unsaved edits are still there after logging back in.
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const isLogin = error.config?.url === '/admin/login';
        if (error.response?.status === 401 && !isLogin) {
          clearToken();
          setAuthNotice('Session expired. Please log in again.');
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(section.listPath || `/${section.endpoint}`, section.listNeedsAuth ? authHeaders() : {});
      setItems(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
      showMessage('error', '❌ Error loading items');
    } finally {
      setLoading(false);
    }
  }, [section, showMessage]);

  useEffect(() => {
    if (isAuthenticated && viewMode === 'manage') loadItems();
  }, [isAuthenticated, viewMode, loadItems]);

  const resetView = () => {
    setViewMode('manage');
    setEditingId(null);
    setFormData({});
    setMessage(null);
    setItems([]);
    setFilters(DEFAULT_FILTERS);
  };

  const selectTab = (id) => {
    setTabId(id);
    setSectionId(TABS.find(t => t.id === id).sections[0]);
    resetView();
  };

  const selectSection = (id) => {
    setSectionId(id);
    resetView();
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData({ ...section.defaults });
    setViewMode('create');
  };

  const showManage = () => {
    setEditingId(null);
    setFormData({});
    setViewMode('manage');
  };

  const cancelEdit = () => {
    showManage();
    setMessage(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const setField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = toPayload(formData);
      if (editingId) {
        await api.put(`/${section.endpoint}/${editingId}`, payload, authHeaders());
      } else {
        await api.post(`/${section.endpoint}`, payload, authHeaders());
      }
      showMessage('success', editingId ? '✅ Updated successfully!' : '✅ Created successfully!', 3000);
      showManage();
    } catch (error) {
      showMessage('error', `❌ Error: ${actionErrorMessage(error)}`);
    }
  };

  const handleEdit = (item) => {
    setFormData(toFormData(item));
    setEditingId(item._id);
    setViewMode('create');
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure?')) return;
    setMessage(null);
    try {
      await api.delete(`/${section.endpoint}/${item._id}`, authHeaders());
      showMessage('success', '✅ Deleted successfully!', 3000);
      loadItems();
    } catch (error) {
      showMessage('error', `❌ Error: ${error.message}`);
    }
  };

  // Swap with the neighbour the admin can see, not the next item in the
  // unfiltered list (which may be hidden by a filter)
  const handleMove = async (item, direction) => {
    const visible = items.filter(i => matchesFilters(i, section, filters));
    const neighbour = visible[visible.indexOf(item) + direction];
    if (!neighbour) return;

    const reordered = [...items];
    const from = reordered.indexOf(item);
    const to = reordered.indexOf(neighbour);
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    const updates = reordered.map((i, order) => ({ id: i._id, order }));

    try {
      await api.put(`/${section.endpoint}/reorder`, { items: updates }, authHeaders());
      setItems(reordered);
      showMessage('success', '✅ Order updated!', 2000);
    } catch (error) {
      console.error('Reorder error:', error);
      showMessage('error', `❌ Error: ${actionErrorMessage(error)}`);
    }
  };

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        notice={authNotice}
        onLogin={() => { setAuthNotice(''); setIsAuthenticated(true); }}
      />
    );
  }

  const visibleItems = items.filter(item => matchesFilters(item, section, filters));
  const { Form } = section;
  const verb = section.createVerb || 'Add';
  const showCancel = !section.cancelOnlyWhenEditing || editingId;
  const subTabs = tab.sections.map(id => ({ id, label: SECTIONS[id].plural }));

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage your portfolio content</p>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {message && <div className={`message ${message.tone}`}>{message.text}</div>}

      <TabBar tabs={TABS} active={tabId} onSelect={selectTab} />

      {tab.heading && (
        <>
          <h2>{tab.heading}</h2>
          <p className="admin-intro">{tab.intro}</p>
        </>
      )}

      {subTabs.length > 1 && (
        <TabBar tabs={subTabs} active={sectionId} onSelect={selectSection} className="admin-tabs admin-subtabs" />
      )}

      <div className="view-mode-toggle">
        <button className={viewMode === 'create' ? 'active' : ''} onClick={startCreate}>
          {editingId ? `Edit ${section.noun}` : `Create New ${section.noun}`}
        </button>
        <button className={viewMode === 'manage' ? 'active' : ''} onClick={showManage}>
          Manage Existing {section.plural}
        </button>
      </div>

      {viewMode === 'create' ? (
        <form onSubmit={handleSubmit} className="admin-form">
          <h2>{editingId ? `Edit ${section.noun}` : `${verb} ${section.noun}`}</h2>
          <Form form={{ data: formData, onChange: handleChange, setField }} />
          <div className="form-actions">
            <button type="submit" className="submit-btn">{editingId ? 'Update' : verb} {section.noun}</button>
            {showCancel && <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>}
          </div>
        </form>
      ) : (
        <div className="manage-view">
          <h2>Manage {section.plural}</h2>
          <FilterBar
            enabled={section.filters}
            items={items}
            shownCount={visibleItems.length}
            filters={filters}
            onChange={(change) => setFilters(prev => ({ ...prev, ...change }))}
          />
          <ItemList
            items={visibleItems}
            section={section}
            loading={loading}
            onCreate={startCreate}
            onMove={handleMove}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <AdminHelp />
    </div>
  );
}

export default Admin;
