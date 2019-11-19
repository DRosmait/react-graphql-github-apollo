import gql from 'graphql-tag';

const ISSUE_FRAGMENT = gql`
    fragment issue on Issue {
        id
        number
        state
        title
        url
        bodyHTML
    }
`;

export default ISSUE_FRAGMENT;