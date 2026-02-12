const EditPost = () => {
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>
        <p className="text-light-4 mt-2">Edit post page content will be implemented here.</p>
      </div>
    </div>
  );
};

export default EditPost;