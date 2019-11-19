import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import { ButtonUnobtrusive } from '../../Button';
import FetchMore from '../../FetchMore';

import ISSUE_FRAGMENT from '../fragments';

const GET_ISSUES_OF_REPOSITORY = gql`
    query (
        $repositoryOwner: String!,
        $repositoryName: String!,
        $issueState: IssueState!,
        $cursor: String
    ) {
        repository(
            name: $repositoryName, owner: $repositoryOwner) {
            issues(first: 5, states: [$issueState], after: $cursor) {
                edges {
                    node {
                        ...issue
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }

    ${ISSUE_FRAGMENT}
`;

const ISSUE_STATES = {
    NONE: 'NONE',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
};

const TRANSITION_LABELS = {
    [ISSUE_STATES.NONE]: 'Show Open Issues',
    [ISSUE_STATES.OPEN]: 'Show Closed Issues',
    [ISSUE_STATES.CLOSED]: 'Hide Issues',
};

const TRANSITION_STATE = {
    [ISSUE_STATES.NONE]: ISSUE_STATES.OPEN,
    [ISSUE_STATES.OPEN]: ISSUE_STATES.CLOSED,
    [ISSUE_STATES.CLOSED]: ISSUE_STATES.NONE,
};

const isShow = issueState => issueState !== ISSUE_STATES.NONE;

const withIssuesWrapper = Component => props => <div className="Issues"><Component {...props} /></div>;

const updateQuery = (prevResult, { fetchMoreResult }) => {
    if (!fetchMoreResult) return prevResult;

    return {
        ...prevResult,
        repository: {
            ...prevResult.repository,
            issues: {
                ...prevResult.repository.issues,
                ...fetchMoreResult.repository.issues,
                edges: [...prevResult.repository.issues.edges, ...fetchMoreResult.repository.issues.edges],
            },
        },
    };
};

const Issues = ({ repositoryName, repositoryOwner }) => {
    const [issueState, setIssueState] = useState(ISSUE_STATES.NONE);
    const { data: { repository } = {}, loading, error, fetchMore } = useQuery(GET_ISSUES_OF_REPOSITORY, {
        variables: {
            repositoryOwner,
            repositoryName,
            issueState,
        },
        skip: !isShow(issueState),
        notifyOnNetworkStatusChange: true,
    });
    const onChangeIssueState = nextIssueState => setIssueState(nextIssueState);

    if (error) return <ErrorMessage error={error} />;
    if (loading && !repository) return <Loading />;

    return (
        <>
            <ButtonUnobtrusive
                onClick={() => onChangeIssueState(TRANSITION_STATE[issueState])}
            >
                {TRANSITION_LABELS[issueState]}
            </ButtonUnobtrusive>
            {
                !repository ? null :
                    !repository.issues.edges.length
                        ? <div className="IssueList">No issues ...</div>
                        : <IssueList
                            issues={repository.issues}
                            loading={loading}
                            repositoryOwner={repositoryOwner}
                            repositoryName={repositoryName}
                            updateQuery={updateQuery}
                            fetchMore={fetchMore}
                            issueState={issueState}
                        />
            }
        </>
    );
};

const IssueList = ({
    issues,
    loading,
    repositoryOwner,
    repositoryName,
    updateQuery,
    fetchMore,
    issueState,
}) => (
    <div className="IssueList" >
        {issues.edges.map(({ node }) => (
            <IssueItem key={node.id} issue={node} />
        ))}

        <FetchMore
            loading={loading}
            hasNextPage={issues.pageInfo.hasNextPage}
            fetchMore={fetchMore}
            variables={{
                cursor: issues.pageInfo.endCursor,
                repositoryName,
                repositoryOwner,
                issueState,
            }}
            updateQuery={updateQuery}
        >
            Issues
        </FetchMore>
    </div>
);

export default withIssuesWrapper(Issues);