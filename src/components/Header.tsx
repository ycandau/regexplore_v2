//------------------------------------------------------------------------------
// Imports

import { ReactElement } from 'react';

import '../css/Header.css';

//------------------------------------------------------------------------------
// Default export

const Header = (): ReactElement => {
  return (
    <header id="header">
      <div className="logo">RegExplore</div>
      <div className="search"></div>
      <div className="link">Explore</div>
      <div className="link">Log in</div>
      <div className="avatar">
        <div>Y</div>
      </div>
      <div className="theme-toggle">Toggle</div>
    </header>
  );
};

//------------------------------------------------------------------------------

export default Header;
