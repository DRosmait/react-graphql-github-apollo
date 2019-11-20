import React from 'react';

import Comments from '../../Comment';
import Link from '../../Link';

const IssueItem = ({
    issue,
    repositoryName,
    repositoryOwner,    
}) => (
    <div className="IssueItem">
        {/* placeholder to add a show/hide comment button */}

        <div className="IssueItem-content">
            <h3>
                <Link href={issue.url}>{issue.title}</Link>
            </h3>
            <div dangerouslySetInnerHTML={{ __html: issue.bodyHTML }} />

            <Comments
                repositoryName={repositoryName}
                repositoryOwner={repositoryOwner}
                issueNumber={issue.number}
            />
        </div>
    </div>
);

export default IssueItem;