import React, { useState } from 'react';
import { Link, withRouter } from 'react-router-dom';

import Button from '../../Button';
import Input from '../../Input';

import * as routes from '../../constants/routes';

const Navigation = ({
    location: { pathname },
    organizationName,
    onOrganizationSearch,
}) => (
    <header className="Navigaiton">
        <div className="Navigation_link">
            <Link to={routes.PROFILE}>Profile</Link>
        </div>
        <div className="Navigation_link">
            <Link to={routes.ORGANIZATION}>Organization</Link>
        </div>

        {pathname === routes.ORGANIZATION && (
            <OrganizationSearch
                organizationName={organizationName}
                onOrganizationSearch={onOrganizationSearch}
            />
        )}
    </header>
);

const OrganizationSearch = ({ organizationName, onOrganizationSearch }) => {
    const [ inputValue, setInputValue ] = useState(organizationName);
    
    const onChange = ({ target }) => setInputValue(target.value);
    const onSubmit = e => {
        e.preventDefault();
        onOrganizationSearch(inputValue);
    };

    return (
        <div className="Navigation-search">
            <form onSubmit={onSubmit} >
                <Input
                    color="white"
                    type="text"
                    value={inputValue}
                    onChange={onChange}
                />
                {' '}
                <Button type="submit" color="white">
                    Search
                </Button>
            </form>
        </div>
    )
};

export default withRouter(Navigation);