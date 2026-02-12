const PostDetails = () => {
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/posts.svg"
            width={36}
            height={36}
            alt="posts"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Post Details</h2>
        </div>
        <p className="text-light-4 mt-2">Post details page content will be implemented here.</p>
      </div>
    </div>
  );
};

export default PostDetails;