function Navbar({ setCurrentPage }) {
  return (
    <div className='navButton'>
      <button onClick={() => setCurrentPage('Card')}>Card</button>
      <button onClick={() => setCurrentPage('Transaction')}>Transaction</button>
      <button onClick={() => setCurrentPage('Settings')}>Settings</button>
    </div>
  );
}

export { Navbar };