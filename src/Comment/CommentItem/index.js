import React from 'react';

const CommentItem = ({ comment }) => (
    <li className="CommentItem" >
        <h4>{comment.author.login}</h4>
        <div><small>Published at: {comment.publishedAt} | Last edited at: {comment.lasPublishedAt}</small></div>
        <div dangerouslySetInnerHTML={{ __html: comment.bodyHTML }} />
    </li>
);

export default CommentItem;