import React from 'react';

import RepositoryItem from '../RepositoryItem';
import FetchMore from '../../FetchMore';
import Issues from '../../Issue';

const updateQuery = entry => (prevResult, { fetchMoreResult }) => {
    if (!fetchMoreResult) return prevResult;

    return {
        ...prevResult,
        [entry]: {
            ...prevResult[entry],
            repositories: {
                ...prevResult[entry].repositories,
                ...fetchMoreResult[entry].repositories,
                edges: [
                    ...prevResult[entry].repositories.edges,
                    ...fetchMoreResult[entry].repositories.edges,
                ],
            },
        },
    };
};

const RepositoryList = ({ repositories, fetchMore, loading, entry }) => (
    <>
        {repositories.edges.map(({ node }) => (
            <div key={node.id} className="RepositoryItem">
                <RepositoryItem {...node} />

                <Issues
                    repositoryName={node.name}
                    repositoryOwner={node.owner.login}
                    wrapperClassName="Issues"
                />
            </div>
        ))}

        <FetchMore
            loading={loading}
            hasPage={repositories.pageInfo.hasNextPage}
            fetchMore={fetchMore}
            variables={{ cursor: repositories.pageInfo.endCursor }}
            updateQuery={updateQuery(entry)}
        >
            Repositories
        </FetchMore>
    </>
);

export default RepositoryList;