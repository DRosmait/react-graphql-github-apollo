import React from 'react';
import gql from 'graphql-tag';
// import { Query } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';

import ErrorMessage from '../Error';
import Loading from '../Loading';
import RepositoryList from '../Repository';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
    {
        viewer {
            repositories(
                first: 5,
                orderBy: { direction: DESC, field: STARGAZERS }
            ) {
                edges {
                    node {
                        id
                        name
                        url
                        descriptionHTML
                        primaryLanguage {
                            name
                        }
                        owner {
                            login
                            url
                        }
                        stargazers {
                            totalCount
                        }
                        viewerHasStarred
                        watchers {
                            totalCount
                        }
                        viewerSubscription
                    }
                }
            }
        }
    }
`;

// const Profile = () => (
//     <Query query={GET_REPOSITORIES_OF_CURRENT_USER} >
//         {({ data, loading }) => {
//             if (!data) return null;

//             const { viewer } = data;

//             if (loading || !viewer) return <Loading />;

//             return <RepositoryList repositories={viewer.repositories} />
//         }}
//     </Query>
// );

const Profile = () => {
    const { loading, error, data } = useQuery(GET_REPOSITORIES_OF_CURRENT_USER);

    console.log(error);

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return <RepositoryList repositories={data.viewer.repositories} />;
}

export default Profile;