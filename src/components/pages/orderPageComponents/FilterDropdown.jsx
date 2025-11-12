import React from 'react';

const FilterDropdown = ({
  show,
  toggle,
  handleSelect,
  currentFilter,
  options,
  className,
  title,
}) => (
  <th
    onClick={toggle}
    style={{ cursor: "pointer", position: "relative" }}
  >
    {title}
    
    {show && (
      <div
        className={`dropdown-menu show bg-dark border-secondary ${className}-filter-dropdown`}
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          minWidth: "150px",
          zIndex: 10,
          borderRadius: "0.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="dropdown-item text-light bg-dark"
          onClick={() => handleSelect("")}
        >
          All
        </button>
        {options.map((option) => (
          <button
            key={option}
            className={`dropdown-item text-light bg-dark ${currentFilter === option ? 'active' : ''}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    )}
  </th>
);

export default FilterDropdown;