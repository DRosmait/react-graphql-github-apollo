import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import Link from '../../Link';
import Button from '../../Button';

const STAR_REPOSITORY = gql`
    mutation ($id: ID!) {
        addStar(input: { starrableId: $id }) {
            starrable {
                id
                viewerHasStarred
                stargazers {
                    totalCount
                }
            }
        }
    }
`;

const UNSTAR_REPOSITORY = gql`
    mutation ($id: ID!) {
        removeStar(input: { starrableId: $id }) {
            starrable {
                id
                viewerHasStarred
                stargazers {
                    totalCount
                }
            }
        }
    }
`;

const TOGGLE_SUBSCRIPTION_TO_REPOSITORY = gql`
    mutation ($id: ID!, $state: SubscriptionState!) {
        updateSubscription(input: {
            subscribableId: $id,
            state: $state
        }) {
                subscribable {
                id
                viewerSubscription
            }
        }
    }
`;

const RepositoryItem = ({
    id,
    name,
    url,
    descriptionHTML,
    primaryLanguage,
    owner,
    stargazers,
    watchers,
    viewerSubscription,
    viewerHasStarred,
}) => {
    const [ addStar ] = useMutation(STAR_REPOSITORY, { variables: { id }});
    const [ removeStar ] = useMutation(UNSTAR_REPOSITORY, { variables: { id }});

    const viewerSubscriptionNext = viewerSubscription === 'SUBSCRIBED' ? 'UNSUBSCRIBED' : 'SUBSCRIBED';
    const [ toggleSubscription ] = useMutation(TOGGLE_SUBSCRIPTION_TO_REPOSITORY, { variables: { id, state: viewerSubscriptionNext }});
    
    return (
        <div>
            <div className="RepositoryItem-title">
                <h2>
                    <Link href={url}>{name}</Link>
                </h2>
                <div className="RepositoryItem-title-action">
                    {stargazers.totalCount} Stars
                    </div>
            </div>
            <div className="RepositoryItem-description">
                <div
                    className="RepositoryItem-description-info"
                    dangerouslySetInnerHTML={{ __html: descriptionHTML }}
                />
                <div className="RepositoryItem-description-details">
                    <div>
                        {primaryLanguage && (
                            <span>Language: {primaryLanguage.name}</span>
                        )}
                    </div>
                    <div>
                        {owner && (
                            <span>Owner: <a href={owner.url}>{owner.login}</a>
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <Button
                className="RepositoryItem-title-action"
                onClick={e => viewerHasStarred ? removeStar() : addStar() }
            >
                {stargazers.totalCount} Star
            </Button>
            <hr/>
            <Button
                className="RepositoryItem-title-action"
                onClick={toggleSubscription}
            >
                {viewerSubscriptionNext.slice(0, viewerSubscriptionNext.length - 1)}
            </Button>
        </div>
    );
};

export default RepositoryItem;