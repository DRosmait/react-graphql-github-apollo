import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import Link from '../../Link';
import Button from '../../Button';
import REPOSITORY_FRAGMENT from '../fragments';

const STAR_REPOSITORY = gql`
    mutation ($id: ID!) {
        addStar(input: { starrableId: $id }) {
            starrable {
                id
                viewerHasStarred
                # stargazers {
                #     totalCount
                # }
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
                # stargazers {
                #     totalCount
                # }
            }
        }
    }
`;

const TOGGLE_SUBSCRIPTION_OFF_REPOSITORY = gql`
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

const updateStarCount = action => (client, { data }) => {
    const mutationName = `${action}Star`;
    const { [mutationName]: { starrable: { id }}} = data;

    const repository = client.readFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
    });

    const totalCount = repository.stargazers.totalCount + (action === 'remove' ? -1 : 1) ;

    client.writeFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
        data: {
            ...repository,
            stargazers: {
                ...repository.stargazers,
                totalCount,
            },
        },
    });
};

const updateWatchersCount = (client, { data: { updateSubscription: { subscribable }}}) => {
    const repository = client.readFragment({
        id: `Repository:${subscribable.id}`,
        fragment: REPOSITORY_FRAGMENT,
    });

    const totalCount = repository.watchers.totalCount + (subscribable.viewerSubscription === 'SUBSCRIBED' ? 1 : -1);

    client.writeFragment({
        id: `Repository:${subscribable.id}`,
        fragment: REPOSITORY_FRAGMENT,
        data: {
            ...repository,
            watchers: {
                ...repository.watchers,
                totalCount,
            },
        },
    });
};

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
    const [ addStar ] = useMutation(STAR_REPOSITORY, { variables: { id }, update: updateStarCount('add') });
    const [ removeStar ] = useMutation(UNSTAR_REPOSITORY, { variables: { id }, update: updateStarCount('remove') });

    const viewerSubscriptionNext = viewerSubscription === 'SUBSCRIBED' ? 'UNSUBSCRIBED' : 'SUBSCRIBED';
    const [ toggleSubscription ] = useMutation(TOGGLE_SUBSCRIPTION_OFF_REPOSITORY, { variables: { id, state: viewerSubscriptionNext }, update: updateWatchersCount });
    
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
            <div>Watchers: {watchers.totalCount}</div>
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