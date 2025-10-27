# Auto-Save Implementation for Session Editor

## Overview

The Session Editor now includes debounced auto-save functionality that automatically saves the form as a draft after 5 seconds of user inactivity. This prevents data loss and improves user experience.

## Features

### 1. Debounced Auto-Save
- **Delay**: 5 seconds after user stops typing
- **Smart Triggering**: Only saves when required fields (title, JSON file URL) are filled
- **Change Detection**: Only saves when form data has actually changed from initial state
- **Draft Only**: Auto-saves always save as draft status to prevent accidental publishing

### 2. Visual Feedback
- **Saving Indicator**: Shows spinning loader with "Saving..." text
- **Success Indicator**: Shows checkmark with relative time ("Saved just now", "Saved 2 minutes ago")
- **Info Message**: Blue info box explaining auto-save behavior
- **Button State**: Submit button shows saving state and is disabled during auto-save

### 3. Intelligent Behavior
- **Manual Save Priority**: Manual form submission cancels pending auto-saves
- **Authentication Handling**: Redirects to login if session expires during auto-save
- **Error Handling**: Fails silently for auto-save errors to avoid user disruption
- **Cleanup**: Properly cleans up timers on component unmount

## Implementation Files

### Core Components

1. **`src/pages/SessionEditor.jsx`** - Main implementation with inline auto-save logic
2. **`src/pages/SessionEditorOptimized.jsx`** - Cleaner implementation using custom hook
3. **`src/components/sessionEditor/SessionForm.jsx`** - Updated form with visual feedback
4. **`src/hooks/useAutoSave.js`** - Reusable custom hook for auto-save functionality

### Key Implementation Details

#### Auto-Save Logic
```javascript
// Debounced save with 5-second delay
const debouncedAutoSave = useCallback((formData) => {
  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }

  const hasChanged = /* change detection logic */;
  const hasRequiredFields = formData.title.trim() && formData.json_file_url.trim();

  if (hasChanged && hasRequiredFields) {
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(formData);
    }, 5000);
  }
}, [autoSave]);
```

#### Visual Status Updates
```javascript
// Auto-save status indicator
{isAutoSaving ? (
  <div className="flex items-center text-blue-600">
    <LoadingSpinner />
    <span>Saving...</span>
  </div>
) : lastSaved ? (
  <div className="flex items-center text-green-600">
    <CheckIcon />
    <span>{formatLastSaved(lastSaved)}</span>
  </div>
) : null}
```

## Usage

### Basic Usage (SessionEditor.jsx)
```jsx
import SessionEditor from './pages/SessionEditor';

// Use in routing
<Route path="/session/edit/:id?" component={SessionEditor} />
```

### With Custom Hook (SessionEditorOptimized.jsx)
```jsx
import SessionEditorOptimized from './pages/SessionEditorOptimized';

// More maintainable version using custom hook
<Route path="/session/edit/:id?" component={SessionEditorOptimized} />
```

### Custom Hook Usage
```jsx
import useAutoSave from '../hooks/useAutoSave';

const MyComponent = () => {
  const autoSaveFunction = useCallback(async (data) => {
    await api.save(data);
  }, []);

  const { isAutoSaving, lastSaved, debouncedSave } = useAutoSave(autoSaveFunction, 5000);

  const handleChange = (newData) => {
    setData(newData);
    debouncedSave(newData);
  };

  return (
    <form>
      {/* form fields */}
      {isAutoSaving && <span>Saving...</span>}
      {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
    </form>
  );
};
```

## Configuration

### Customizing Auto-Save Delay
```javascript
// Change delay from 5 seconds to 3 seconds
const { debouncedSave } = useAutoSave(saveFunction, 3000);
```

### Customizing Save Conditions
```javascript
const handleFormChange = useCallback((newForm) => {
  setForm(newForm);
  
  // Custom validation logic
  const shouldSave = newForm.title.length > 3 && 
                    newForm.json_file_url.startsWith('https://');
  
  debouncedSave(newForm, shouldSave);
}, [debouncedSave]);
```

### Customizing Toast Notifications
```javascript
toast.success('Auto-saved successfully', { 
  position: "bottom-right",
  autoClose: 2000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
});
```

## Technical Considerations

### Performance
- Uses `useCallback` to prevent unnecessary re-renders
- Debouncing prevents excessive API calls
- Cleanup timers to prevent memory leaks

### User Experience
- Non-disruptive error handling for auto-save failures
- Clear visual feedback about save status
- Manual save takes priority over auto-save

### Security
- Auto-saves always use draft status to prevent accidental publishing
- Handles authentication errors gracefully
- Validates required fields before attempting save

## Browser Compatibility
- Uses modern React hooks (requires React 16.8+)
- `setTimeout`/`clearTimeout` for debouncing (universally supported)
- ES6+ features may require transpilation for older browsers