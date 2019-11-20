import React from 'react';

export const withWrapper = Component => 
    ({ wrapperClassName, ...props }) => 
        <div className={wrapperClassName}><Component {...props} /></div>;