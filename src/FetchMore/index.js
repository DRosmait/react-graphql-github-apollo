import React from 'react';

import { ButtonUnobtrusive } from '../Button';
import Loading from '../Loading';

const FetchMore = ({
    loading,
    hasNextPage,
    fetchMore,
    variables,
    updateQuery,
    children,
}) => (
    loading
        ? (<Loading />)
        : (
            hasNextPage && (
                <ButtonUnobtrusive
                    className='FetchMore-button'
                    onClick={() => fetchMore({ variables, updateQuery })}
                >
                    More {children}
                </ButtonUnobtrusive>
            )
        )
);

export default FetchMore;