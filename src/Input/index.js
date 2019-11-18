import React from 'react';

const Input = ({ color = 'black', children, ...props }) => (
    <input className={`Input Input_${color}`} {...props} >
        {children}
    </input>
);

export default Input;