import React from 'react';

import { ButtonUnobtrusive } from '../Button';
import Loading from '../Loading';

const FetchMore = ({
    loading,
    hasPage,
    fetchMore,
    variables,
    updateQuery,
    children,
}) => (
    loading
        ? (<Loading />)
        : (
            hasPage && (
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