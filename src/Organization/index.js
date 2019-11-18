import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';
import Error from '../Error';
import Loading from '../Loading';

const GET_REPOSITORIES_OF_ORGANIZATION = gql`
    query ($organizationName: String!, $cursor: String) {
        organization(login: $organizationName) {
            repositories(first: 5, after: $cursor) {
                edges {
                    node {
                        ...reposirory
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }

    ${REPOSITORY_FRAGMENT}
`

const Organization = ({ organizationName }) => {
    const { loading, error, data: { organization } = {}, fetchMore } = useQuery(GET_REPOSITORIES_OF_ORGANIZATION, {
        variables: { organizationName },
        skip: organizationName === '',
        notifyOnNetworkStatusChange: true
    });

    if (error) return <Error/>
    if (loading && !organization) return <Loading/>

    return (
        <RepositoryList
            repositories={organization.repositories}
            loading={loading}
            fetchMore={fetchMore}
            entry={'organization'}
        />
    )
};

export default Organization;