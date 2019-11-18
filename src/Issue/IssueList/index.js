import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';

const GET_ISSUES_OF_REPOSITORY = gql`
    query ($repositoryOwner: String!, $repositoryName: String!) {
        repository(name: $repositoryName, owner: $repositoryOwner) {
            issues(first: 5) {
                edges {
                    node {
                        id
                        number
                        state
                        title
                        url
                        bodyHTML
                    }
                }
            }
        }
    }
`;

const withIssuesWrapper = Component => props => <div className="Issues"><Component {...props}/></div>;

const Issues = ({ repositoryName, repositoryOwner }) => {
    const { data: { repository } = {}, loading, error } = useQuery(GET_ISSUES_OF_REPOSITORY, { variables: { repositoryOwner, repositoryName }});
    
    if (error) return <ErrorMessage error={error} />;
    if (loading && !repository) return <Loading />;
    if (!repository.issues.edges.lenght) return <div className="IssueList">No issues ...</div>;

    return <IssueList issues={repository.issues} />;
};

const IssueList = ({ issues }) => (
    <div className="IssueList" >
        {issues.edges.map(({ node }) => (
            <IssueItem key={node.id} issue={node} />
        ))}
    </div>
);

export default withIssuesWrapper(Issues);