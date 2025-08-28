import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onSearch, onReset }) => {
  const [searchData, setSearchData] = useState({
    destination: '',
    departureDate: '',
    returnDate: '',
    budget: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchData);
  };

  const handleReset = () => {
    setSearchData({
      destination: '',
      departureDate: '',
      returnDate: '',
      budget: ''
    });
    onReset();
  };

  return (
    <div className="search-filter">
      <form className="search-form" onSubmit={handleSearch}>
        {/* Lokacija */}
        <div className="search-field">
          <div className="field-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <input
            type="text"
            name="destination"
            value={searchData.destination}
            onChange={handleInputChange}
            placeholder="Gdje želite putovati?"
            className="search-input"
          />
        </div>

        {/* Datum polaska */}
        <div className="search-field" style={{
          position: 'relative',
          minWidth: '180px',
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          boxSizing: 'border-box'
        }}>
          <div className="field-icon" style={{
            position: 'absolute',
            left: '12px',
            zIndex: 2,
            color: '#666',
            pointerEvents: 'none'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <input
            type="date"
            name="departureDate"
            value={searchData.departureDate}
            onChange={handleInputChange}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px 0 40px',
              border: '1px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '14px',
              background: '#fff',
              transition: 'all 0.3s ease',
              color: searchData.departureDate ? '#333' : 'transparent',
              outline: 'none'
            }}
          />
          {!searchData.departureDate && (
            <div style={{
              position: 'absolute',
              left: '40px',
              pointerEvents: 'none',
              color: '#999',
              fontSize: '14px',
              transition: 'opacity 0.3s ease'
            }}>
              Datum polaska
            </div>
          )}
        </div>

        {/* Datum povratka */}
        <div className="search-field" style={{
          position: 'relative',
          minWidth: '180px',
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          boxSizing: 'border-box'
        }}>
          <div className="field-icon" style={{
            position: 'absolute',
            left: '12px',
            zIndex: 2,
            color: '#666',
            pointerEvents: 'none'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <input
            type="date"
            name="returnDate"
            value={searchData.returnDate}
            onChange={handleInputChange}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px 0 40px',
              border: '1px solid #e0e0e0',
              borderRadius: '25px',
              fontSize: '14px',
              background: '#fff',
              transition: 'all 0.3s ease',
              color: searchData.returnDate ? '#333' : 'transparent',
              outline: 'none'
            }}
          />
          {!searchData.returnDate && (
            <div style={{
              position: 'absolute',
              left: '40px',
              pointerEvents: 'none',
              color: '#999',
              fontSize: '14px',
              transition: 'opacity 0.3s ease'
            }}>
              Datum povratka
            </div>
          )}
        </div>

        {/* Budzet */}
        <div className="search-field">
          <div className="field-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <input
            type="number"
            name="budget"
            value={searchData.budget}
            onChange={handleInputChange}
            placeholder="Do koliko novca?"
            className="search-input"
            min="0"
          />
        </div>

        <button type="submit" className="search-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          Traži
        </button>

        <button 
          type="button" 
          className="refresh-button"
          onClick={handleReset}
          title="Poništi filtere"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

      </form>
    </div>
  );
};

export default SearchFilter;