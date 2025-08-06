import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

export default function LocationAutocomplete({ value, onChange, onSelect, label = 'Location', placeholder = 'Enter address, area, or pincode' }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();
  const debounceRef = useRef();

  // Get user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserCoords(null)
      );
    }
  }, []);

  // Fetch suggestions from Nominatim
  useEffect(() => {
    if (!inputValue || inputValue.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    setError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&addressdetails=1&limit=5`;
        if (userCoords) {
          url += `&viewbox=${userCoords.lon-0.2},${userCoords.lat+0.2},${userCoords.lon+0.2},${userCoords.lat-0.2}&bounded=1`;
        }
        const res = await fetch(url, { headers: { 'User-Agent': 'MediCareApp/1.0' } });
        const data = await res.json();
        setSuggestions(data);
        setOpen(true);
      } catch (err) {
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [inputValue, userCoords]);

  // Sync with parent value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = e => {
    setInputValue(e.target.value);
    onChange && onChange(e.target.value);
  };

  const handleSelect = suggestion => {
    setInputValue(suggestion.display_name);
    setOpen(false);
    onSelect && onSelect(suggestion);
  };

  return (
    <div style={{ position: 'relative' }}>
      <TextField
        inputRef={inputRef}
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue && suggestions.length > 0 && setOpen(true)}
        fullWidth
        autoComplete="off"
      />
      {loading && <CircularProgress size={20} style={{ position: 'absolute', right: 10, top: 18, zIndex: 2 }} />}
      {open && suggestions.length > 0 && (
        <Paper style={{ position: 'absolute', left: 0, right: 0, zIndex: 10, maxHeight: 220, overflowY: 'auto' }}>
          <List>
            {suggestions.map((s, idx) => (
              <ListItem key={s.place_id} disablePadding>
                <ListItemButton onClick={() => handleSelect(s)}>
                  <ListItemText primary={s.display_name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {error && <div style={{ color: 'red', marginTop: 4 }}>{error}</div>}
    </div>
  );
}