import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import CommentItem from '../CommentItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import FetchMore from '../../FetchMore';
import { ButtonUnobtrusive } from '../../Button';
import { withWrapper } from '../../helpers/hoc';

const GET_COMMENTS_OF_ISSUE = gql`
    query (
        $repositoryName: String!,
        $repositoryOwner: String!,
        $issueNumber: Int!,
        $cursor: String
    ) {
        repository(
            name: $repositoryName,
            owner: $repositoryOwner
        ) {
            id
            issue(number: $issueNumber) {
                id
                comments(last: 2, before: $cursor) {
                    edges {
                        node {
                            id
                            author {
                                login
                            }
                            bodyHTML
                            publishedAt
                            lastEditedAt
                        }
                    }
                    pageInfo {
                        startCursor
                        hasPreviousPage
                    }
                }
            }
        }
    }
`;

const isShow = state => state !== 'Hide';

const updateQuery = (prevResult, { fetchMoreResult }) => {
    if (!fetchMoreResult) return prevResult;

    return {
        ...prevResult,
        repository: {
            ...prevResult.repository,
            issue: {
                ...prevResult.repository.issue,
                comments: {
                    ...prevResult.repository.issue.comments,
                    ...fetchMoreResult.repository.issue.comments,
                    edges: [...fetchMoreResult.repository.issue.comments.edges, ...prevResult.repository.issue.comments.edges],
                },
            },
        },
    };
};

const prefetchIssues = ({
    client,
    repositoryName,
    repositoryOwner,
    issueNumber,
    cursor,
}) => client.query({ query: GET_COMMENTS_OF_ISSUE, variables: { repositoryName, repositoryOwner, issueNumber, cursor } });

const Comments = ({ repositoryName, repositoryOwner, issueNumber }) => {
    const [
        commentState,
        setCommentState
    ] = useState('Hide');

    const {
        data: { repository } = {},
        loading,
        error,
        fetchMore,
        client,
    } = useQuery(GET_COMMENTS_OF_ISSUE, {
            skip: !isShow(commentState),
            variables: { repositoryName, repositoryOwner, issueNumber },
            notifyOnNetworkStatusChange: true,
        });

    let content;

    const onCommentStateChange = () => setCommentState(isShow(commentState) ? 'Hide' : 'Show');

    if (loading && !repository) {
        content = <Loading />;
    } else if (error) {
        content = <ErrorMessage error={error} />
    } else if (repository) {
        const comments = repository.issue.comments;
        const pageInfo = comments.pageInfo;

        content = comments.edges.length
            ? <CommentListWrapper
                comments={comments}
                loading={loading}
                hasPreviousPage={pageInfo.hasPreviousPage}
                fetchMore={fetchMore}
                variables={{ repositoryName, repositoryOwner, issueNumber, cursor: pageInfo.startCursor }}
                updateQuery={updateQuery}
            /> : <div className="CommentItem">No comment ...</div>;
    }

    return (
        <>
            <ButtonUnobtrusive
                onClick={onCommentStateChange}
                onMouseOver={() => prefetchIssues({ client, repositoryName, repositoryOwner, issueNumber })}
            >
                {isShow(commentState) ? 'Hide' : 'Show'} Comments
            </ButtonUnobtrusive>
            {isShow(commentState) && content}
        </>
    );
};

const CommentListWrapper = ({
    comments,
    loading,
    hasPreviousPage,
    fetchMore,
    variables,
    updateQuery,
}) => (
        <div className="CommentList-Wrapper">
            <FetchMore
                loading={loading}
                hasPage={hasPreviousPage}
                fetchMore={fetchMore}
                variables={variables}
                updateQuery={updateQuery}
            />


            <CommentList comments={comments} />
        </div>
    );

const CommentList = ({ comments }) => (
    <ul className="CommentList" >
        {comments.edges.map(({ node }) => <CommentItem key={node.id} comment={node} />)}
    </ul>
);

export default withWrapper(Comments);