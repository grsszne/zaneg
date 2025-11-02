export default function Footer() {
    return (
        <footer className="w-full border-t mt-12 bg-white/50 dark:bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-12 p-4 text-lg md:text-xl font-light tracking-tight">
                <p className="text-center space-x-4 mt-2 md:mt-0"> 
                    © {new Date().getFullYear()} zaneg.net. All rights reserved.
                </p>
                <div className="space-x-4 mt-2 md:mt-0">
                    <div>
                        <p className="text-center">
                            Every cool website has a footer, so why shouldn't
                            mine?
                        </p>
                    </div>
                </div>
                <div className="space-x-4 mt-2 md:mt-0">
                    <a href="/" className="hover:text-orange-500">
                        Home
                    </a>
                </div>
            </div>
        </footer>
    );
}
