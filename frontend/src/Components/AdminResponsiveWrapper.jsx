import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const AdminResponsiveWrapper = ({ children, sidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-dashboard">
      {/* Mobile Header */}
      <div className="mobile-header lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hamburger-btn"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        {sidebar}
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminResponsiveWrapper;
