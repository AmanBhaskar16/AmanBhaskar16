import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

import SessionForm from '../components/sessionEditor/SessionForm';
import Loader from '../components/Loader';
import NotLoggedIn from '../components/NotLoggedIn';

const SessionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    tags: '',
    json_file_url: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Refs for debounce logic
  const autoSaveTimeoutRef = useRef(null);
  const initialFormRef = useRef(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        if (id) {
          const res = await axios.get(`/my-sessions/${id}`);
          const fetchedForm = {
            title: res.data.title,
            tags: res.data.tags.join(', '),
            json_file_url: res.data.json_file_url,
            status: res.data.status,
          };
          setForm(fetchedForm);
          initialFormRef.current = fetchedForm;
          setLastSaved(new Date());
        } else {
          initialFormRef.current = form;
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setNotLoggedIn(true);
        } else {
          toast.error('Failed to fetch session');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [id]);

  // Auto-save function
  const autoSave = useCallback(async (formData) => {
    try {
      setIsAutoSaving(true);
      
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(tag => tag.length > 0),
        _id: id || undefined,
      };

      // Always save as draft for auto-save (don't auto-publish)
      await axios.post('/my-sessions/save-draft', { ...payload, status: 'draft' });
      
      setLastSaved(new Date());
      toast.success('Auto-saved successfully', { 
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setNotLoggedIn(true);
      } else {
        console.error('Auto-save failed:', err);
        // Don't show error toast for auto-save failures to avoid spam
      }
    } finally {
      setIsAutoSaving(false);
    }
  }, [id]);

  // Debounced auto-save logic
  const debouncedAutoSave = useCallback((formData) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Check if form has actually changed from initial state
    const hasChanged = initialFormRef.current && (
      formData.title !== initialFormRef.current.title ||
      formData.tags !== initialFormRef.current.tags ||
      formData.json_file_url !== initialFormRef.current.json_file_url ||
      formData.status !== initialFormRef.current.status
    );

    // Only auto-save if there are changes and required fields are filled
    if (hasChanged && formData.title.trim() && formData.json_file_url.trim()) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave(formData);
      }, 5000); // 5 seconds delay
    }
  }, [autoSave]);

  // Enhanced setForm that triggers auto-save
  const handleFormChange = useCallback((newForm) => {
    setForm(newForm);
    debouncedAutoSave(newForm);
  }, [debouncedAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(tag => tag.length > 0),
        _id: id || undefined,
      };

      if (form.status === 'published') {
        await axios.post('/my-sessions/publish', payload);
      } else {
        await axios.post('/my-sessions/save-draft', payload);
      }

      toast.success(`Session ${id ? 'updated' : 'created'} successfully`);
      navigate('/my-sessions');
    } catch (err) {
      if (err.response?.status === 401) {
        setNotLoggedIn(true);
      } else {
        toast.error('Failed to save session');
      }
    }
  };

  if (loading) return <Loader message="Loading session..." />;
  if (notLoggedIn) return <NotLoggedIn message="You need to log in to access the session editor." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="relative">
        <SessionForm 
          form={form} 
          setForm={handleFormChange} 
          onSubmit={handleSubmit} 
          isEdit={!!id}
          isAutoSaving={isAutoSaving}
          lastSaved={lastSaved}
        />
      </div>
    </div>
  );
};

export default SessionEditor;