import Footer from "../components/footer";
import Nav from "../components/nav";
export default function About() {
    return (
        <>
        <Nav />
        <div className="p-4 min-h-screen max-w-4xl mx-auto">
            <h1 className="font-bold text-4xl pb-4">About Me</h1>
            <p className="text-lg leading-loose pb-4">
                I am Zane. I am a North Texas high school student who priortizes my interests above most things, which is probably to my detriment. My main interests are programming, technology, and computer hardware.

            </p>

            <p className="text-lg leading-loose pb-4">
                I write all my "articles" (I hate calling them that, doesn't it make me sound like someone I'm not?) <a href="/json">in a big JSON file</a>. I made this website's structure in Next in a good 3 days (in Vim :) ), as is probably reflected in its quality.

            </p>
            <p className="text-lg leading-loose pb-4">
                Thank you for spending your valuable time here.

            </p>
        </div>
        <Footer/>
        </>
    );
}