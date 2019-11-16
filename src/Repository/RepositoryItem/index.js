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

const VIEWER_SUBSCRIBTIONS = {
    SUBSCRIBED: 'SUBSCRIBED',
    UNSUBSCRIBED: 'UNSUBSCRIBED',
};

const isWatch = viewerSubscription => viewerSubscription === VIEWER_SUBSCRIBTIONS.SUBSCRIBED;

const updateWatch = (
    client,
    { 
        data: {
            updateSubscription: {
                subscribable: { id, viewerSubscription }
            },
        },
    },
) => {
    const repository = client.readFragment({ id: `Repository:${id}`, fragment: REPOSITORY_FRAGMENT });
    let { totalCount } = repository.watchers;

    totalCount = isWatch(viewerSubscription) ? totalCount + 1 : totalCount - 1;

    client.writeFragment({
        id: `Repository:${id}`,
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
    const [ addStar ] = useMutation(STAR_REPOSITORY, {
        variables: { id },
        optimisticResponse: {
            addStar: {
                __typename: 'Mutation',
                starrable: {
                    __typename: 'Repository',
                    id,
                    viewerHasStarred: true,
                },
            },
        },
        update: updateStarCount('add'),
    });
    const [ removeStar ] = useMutation(UNSTAR_REPOSITORY, {
        variables: { id },
        optimisticResponse: {
            removeStar: {
                __typename: 'Mutation',
                starrable: {
                    __typename: 'Repository',
                    id,
                    viewerHasStarred: false,
                },
            },
        },
        update: updateStarCount('remove'),
    });

    const [ toggleSubscription ] = useMutation(TOGGLE_SUBSCRIPTION_OFF_REPOSITORY, {
        variables: { 
            id, 
            state: isWatch(viewerSubscription) ? VIEWER_SUBSCRIBTIONS.UNSUBSCRIBED : VIEWER_SUBSCRIBTIONS.SUBSCRIBED,
        },
        optimisticResponse: {
            updateSubscription: {
                __typename: 'Mutation',
                subscribable: {
                    __typename: 'Repository',
                    id,
                    viewerSubscription: isWatch(viewerSubscription)
                        ? VIEWER_SUBSCRIBTIONS.UNSUBSCRIBED
                        : VIEWER_SUBSCRIBTIONS.SUBSCRIBED,
                },
            },
        },
        update: updateWatch,
    });
    
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
                {watchers.totalCount}
                {' '}
                {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
            </Button>
        </div>
    );
};

export default RepositoryItem;