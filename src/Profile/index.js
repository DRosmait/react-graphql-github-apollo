import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import ErrorMessage from '../Error';
import Loading from '../Loading';
import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
    query ($cursor: String) {
        viewer {
            repositories(
                first: 2,
                orderBy: { direction: DESC, field: STARGAZERS },
                after: $cursor,
            ) {
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
`;

const Profile = () => {
    const { loading, error, data = {}, fetchMore } = useQuery(GET_REPOSITORIES_OF_CURRENT_USER, {
        notifyOnNetworkStatusChange: true,
    });

    if (loading && !data.viewer) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <RepositoryList
            repositories={data.viewer.repositories}
            fetchMore={fetchMore}
            loading={loading}
            entry={'viewer'}
        />
    );
}

export default Profile;