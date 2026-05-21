const LeftSidebar = () => {
  return (
    <aside className="leftsidebar w-full max-w-[260px] border-r border-gray-200 bg-white p-4 hidden md:block">
      <nav className="space-y-3">
        <a className="leftsidebar-link block text-sm text-gray-700 hover:text-blue-600" href="/">
          Home
        </a>
        <a className="leftsidebar-link block text-sm text-gray-700 hover:text-blue-600" href="/explore">
          Explore
        </a>
      </nav>
    </aside>
  );
};

export default LeftSidebar;
