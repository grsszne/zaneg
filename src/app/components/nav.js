export default function Nav () {
  return (
    <nav className="sticky backdrop-blur-sm bg-white/70 dark:bg-background/70 top-0 z-10">
        
        <div className="sticky top-0  z-10 ">
        <div
            className="flex text-3xl font-semibold border-b-1 b "
        >
            <div className="p-4 px-12 border-r-1 hover:text-orange-500">
                <a href="/">zaneg.net</a>
            </div>
            <div className="p-4 border-r-1 hover:text-orange-500">

                <a href="/blog">Works</a>
            </div>
            <div className="p-4 border-r-1 hover:text-orange-500">
                <a href="/about">About</a>
            </div>
            <div className="flex-grow"></div>

            <div className="p-4 border-l-1 b-inherent hover:text-orange-500">
                <a href="/contact">Contact</a>
            </div>
        </div>
        </div>
    </nav>
  );
}