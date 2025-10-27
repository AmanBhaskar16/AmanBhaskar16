import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

import SessionForm from '../components/sessionEditor/SessionForm';
import Loader from '../components/Loader';
import NotLoggedIn from '../components/NotLoggedIn';
import useAutoSave from '../../hooks/useAutoSave';

const SessionEditorOptimized = () => {
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

  // Auto-save function
  const autoSaveFunction = useCallback(async (formData) => {
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(tag => tag.length > 0),
      _id: id || undefined,
    };

    // Always save as draft for auto-save (don't auto-publish)
    await axios.post('/my-sessions/save-draft', { ...payload, status: 'draft' });
    
    toast.success('Auto-saved successfully', { 
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
    });
  }, [id]);

  // Use auto-save hook
  const {
    isAutoSaving,
    lastSaved,
    debouncedSave,
    cancelAutoSave,
    setInitialData,
    hasChanged
  } = useAutoSave(autoSaveFunction, 5000);

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
          setInitialData(fetchedForm);
        } else {
          setInitialData(form);
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
  }, [id, setInitialData]);

  // Enhanced setForm that triggers auto-save
  const handleFormChange = useCallback((newForm) => {
    setForm(newForm);
    
    // Only trigger auto-save if required fields are filled
    const shouldSave = newForm.title.trim() && newForm.json_file_url.trim();
    debouncedSave(newForm, shouldSave);
  }, [debouncedSave]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Cancel any pending auto-save
    cancelAutoSave();

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

export default SessionEditorOptimized;