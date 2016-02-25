import React, { PropTypes } from 'react';

function RootLayout ({ children }) {
  return (
      <div className='view-container'>
        {children}
      </div>
  )
}

RootLayout.propTypes = {
  children: PropTypes.element
};

export default RootLayout;
