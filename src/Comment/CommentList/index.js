import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import CommentItem from '../CommentItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import { ButtonUnobtrusive } from '../../Button';
import { withWrapper } from '../../helpers/hoc';

const GET_COMMENTS_OF_ISSUE = gql`
    query ($repositoryName: String!, $repositoryOwner: String!, $issueNumber: Int!) {
        repository(
            name: $repositoryName,
            owner: $repositoryOwner
        ) {
            id
            issue(number: $issueNumber) {
                id
                comments(first: 5) {
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
                }
            }
        }
    }
`;

const isShow = state => state !== 'Hide';

const Comments = ({ repositoryName, repositoryOwner, issueNumber }) => {
    const [ commentState, setCommentState ] = useState('Hide');
    const { data: { repository } = {}, loading, error } = useQuery(GET_COMMENTS_OF_ISSUE, {
        skip: !isShow(commentState),
        variables: { repositoryName, repositoryOwner, issueNumber },
    });

    let content;

    if (loading && !repository) {
        content = <Loading />;
    } else if (error) {
        content = <ErrorMessage error={error} />
    } else if (repository) {
        content = <CommentList comments={repository.issue.comments} />
    }

    const onCommentStateChange = () => setCommentState(isShow(commentState) ? 'Hide' : 'Show');

    return (
        <>
            <ButtonUnobtrusive
                onClick={onCommentStateChange}
            >
                { isShow(commentState) ? 'Hide' : 'Show' } Comments
            </ButtonUnobtrusive>
            { isShow(commentState) && content }
        </>
    );
};

const CommentList = ({ comments }) => (
    <ul className="CommentList" >
        { comments.edges.map(({ node }) => <CommentItem key={node.id} comment={node} />)}
    </ul>
);

export default withWrapper(Comments);