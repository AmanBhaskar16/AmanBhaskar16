import React from 'react';

const SessionForm = ({ form, setForm, onSubmit, isEdit, isAutoSaving, lastSaved }) => {
  const formatLastSaved = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Saved just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Saved ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else {
      return `Saved at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {isEdit ? 'Edit Session' : 'Create New Session'}
        </h2>
        
        {/* Auto-save status indicator */}
        <div className="flex items-center space-x-2">
          {isAutoSaving ? (
            <div className="flex items-center text-blue-600">
              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">Saving...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center text-green-600">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{formatLastSaved(lastSaved)}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="text-gray-700 font-medium">Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full mt-2 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
            placeholder="Enter session title"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Tags (comma separated)</span>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full mt-2 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
            placeholder="e.g. yoga, morning, fitness"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">JSON File URL</span>
          <input
            type="url"
            value={form.json_file_url}
            onChange={(e) => setForm({ ...form, json_file_url: e.target.value })}
            required
            className="w-full mt-2 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
            placeholder="https://example.com/session.json"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Status</span>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full mt-2 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      {/* Auto-save info message */}
      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Auto-save:</span> Your changes are automatically saved as draft after 5 seconds of inactivity.
        </p>
      </div>

      <button
        type="submit"
        className="mt-8 w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        disabled={isAutoSaving}
      >
        {isAutoSaving ? 'Saving...' : (isEdit ? 'Update Session' : 'Create Session')}
      </button>
    </form>
  );
};

export default SessionForm;