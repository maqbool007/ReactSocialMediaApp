const PostContent = ({ post }) => {
  return (
    <div className="card-body">
      <p className="card-text">{post.content}</p>
      {post.file && post.file !== "default-file.jpg" && (
        <img className="card-img-top" src={post.file} alt="Card cap"/>
      )}
    </div>
  );
};

export default PostContent;
