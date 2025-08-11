import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onSearch }) => {
  const [searchData, setSearchData] = useState({
    destination: '',
    date: '',
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
    // Pozivamo callback funkciju sa podacima pretrage
    onSearch(searchData);
  };

  return (
    <div className="search-filter">
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-field">
          <div className="field-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
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

        <div className="search-field">
          <div className="field-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <input
            type="date"
            name="date"
            value={searchData.date}
            onChange={handleInputChange}
            className="search-input date-input"
          />
          <div className="date-placeholder">
            {searchData.date ? '' : 'Kada želite putovati?'}
          </div>
        </div>

        <div className="search-field">
          <div className="field-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <input
            type="number"
            name="budget"
            value={searchData.budget}
            onChange={handleInputChange}
            placeholder="Do koliko novca (BAM)?"
            className="search-input"
            min="0"
          />
        </div>

        <button type="submit" className="search-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          Traži
        </button>
      </form>
    </div>
  );
};

export default SearchFilter;