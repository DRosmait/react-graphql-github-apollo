import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import { ButtonUnobtrusive } from '../../Button';
import FetchMore from '../../FetchMore';
import { withWrapper } from '../../helpers/hoc';

import ISSUE_FRAGMENT from '../fragments';

const GET_ISSUES_OF_REPOSITORY = gql`
    query (
        $repositoryOwner: String!,
        $repositoryName: String!,
        $issueState: IssueState!,
        $cursor: String
    ) {
        repository(
            name: $repositoryName,
            owner: $repositoryOwner
        ) {
            issues(
                first: 5,
                states: [$issueState],
                after: $cursor
            ) {
                edges {
                    node {
                        ...issue
                        number
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
    const { data: { repository } = {}, loading, error, fetchMore, client } = useQuery(GET_ISSUES_OF_REPOSITORY, {
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
            <IssueFilter
                issueState={issueState}
                onChangeIssueState={onChangeIssueState}
                repositoryName={repositoryName}
                repositoryOwner={repositoryOwner}
                client={client}
            />
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

const prefetchIssues = ({
    client,
    repositoryName,
    repositoryOwner,
    issueState,
}) => {
    const nextState = TRANSITION_STATE[issueState];

    if (isShow(nextState)) {
        client.query({
            query: GET_ISSUES_OF_REPOSITORY,
            variables: {
                repositoryName,
                repositoryOwner,
                issueState: nextState,
            },
        });
    }
}

const IssueFilter = ({
    issueState,
    onChangeIssueState,
    repositoryOwner,
    repositoryName,
    client,
}) => (
    <ButtonUnobtrusive
        onClick={() => onChangeIssueState(TRANSITION_STATE[issueState])}
        onMouseOver={() => prefetchIssues({
            client,
            repositoryOwner,
            repositoryName,
            issueState,
        })}
    >
        {TRANSITION_LABELS[issueState]}
    </ButtonUnobtrusive>
);

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
            <IssueItem
                key={node.id}
                issue={node}
                repositoryName={repositoryName}
                repositoryOwner={repositoryOwner}
            />
        ))}

        <FetchMore
            loading={loading}
            hasPage={issues.pageInfo.hasNextPage}
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

export default withWrapper(Issues);