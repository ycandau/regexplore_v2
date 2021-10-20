//------------------------------------------------------------------------------
// Imports

import { ReactElement } from 'react';

//------------------------------------------------------------------------------
// Default export

const Header = (): ReactElement => {
  return (
    <div id="header">
      <div className="logo">RegExplore</div>
      <div className="link">Explore</div>
      <div className="link">Log in</div>
      <div className="avatar">
        <div>Y</div>
      </div>
      <div className="theme-toggle">Toggle</div>
    </div>
  );
};

//------------------------------------------------------------------------------

export default Header;
