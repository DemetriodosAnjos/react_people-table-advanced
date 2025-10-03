import React from 'react';
import { NavLink } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav
      className="navbar"
      role="navigation"
      aria-label="main navigation"
      data-cy="nav"
    >
      <div
        className="box mb-4"
        style={{ margin: '0', padding: '0 40px', width: '100%' }}
      >
        <div className="navbar-brand">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar-item${isActive ? ' has-background-grey-lighter' : ''}`
            }
            data-cy="nav-home"
          >
            Home
          </NavLink>

          <NavLink
            to="/people"
            end
            className={({ isActive }) =>
              `navbar-item${isActive ? ' has-background-grey-lighter' : ''}`
            }
            data-cy="nav-people"
          >
            People
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
