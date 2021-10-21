//------------------------------------------------------------------------------
// Imports

import { ReactElement, useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons';

import '../css/Header.css';

//------------------------------------------------------------------------------
// Default export

const Header = (): ReactElement => {
  const [dark, setDark] = useState(true);

  const toggleTheme = () => setDark((prev) => !prev);

  return (
    <header id="header">
      <div className="logo">RegExplore</div>
      <div className="search"></div>
      <div className="link">Explore</div>
      <div className="link">Log in</div>
      <div className="avatar">
        <div>Y</div>
      </div>
      <div className="theme-toggle">
        <FontAwesomeIcon
          icon={dark ? faMoon : faSun}
          className="icon"
          onClick={toggleTheme}
        />
      </div>
    </header>
  );
};

//------------------------------------------------------------------------------

export default Header;
