//------------------------------------------------------------------------------
// Imports

import { ReactElement } from 'react';

import Header from './Header';

import '../css/App.css';

//------------------------------------------------------------------------------
// Default export

const App = (): ReactElement => {
  return (
    <main id="app">
      <Header />
      <section id="regex">Regex</section>
      <section id="text">Text</section>
      <section id="graph">Graph</section>
      <section id="info">Info</section>
      <section id="warn">Warn</section>
      <section id="run">Run</section>
    </main>
  );
};

//------------------------------------------------------------------------------

export default App;
