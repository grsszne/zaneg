import Image from "next/image";
import Nav from "./components/nav.js";
import Items from "./components/items.js";
import Footer from "./components/footer.js";
import Link from 'next/link';

export default function Home() {
    const imgs = [
        "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/jumper.png?raw=true",
        "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/sail.png?raw=true",
        "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/butterfly.png?raw=true",
        "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/d.png?raw=true",
        "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/two.png?raw=true",
        "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/alu.png?raw=true",
        "https://github.com/grsszne/zaneg.net--assets/blob/main/static/imgs/mdetection.png?raw=true",
    ];
    let imgsa = []
    let imgsb = []
    //push even indexes to a, odd indexes to b
    imgs.forEach((item, index) => {
        if (index % 2 === 0) {
            imgsa.push(item);
        } else {
            imgsb.push(item);
        }
    });

    return (
        <>
        <title>zaneg.net</title>
            {" "}
            <div className="relative tracking-tight">
                {" "}
                <Nav />{" "}
                <div className="p-6 min-h-screen">
                    {" "}
                    <h1 className="font-normal text-3xl ml-4">
                        Latest Things
                    </h1>{" "}
                    <p className="py-4 ml-4 font-light text-xl">
                        {" "}
                        May or may not be impressive things I've done or am
                        doing.{" "}
                    </p>{" "}
                    <div className=" grid gap-0 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] border-t border-l mx-auto ">
                        {" "}
                        {Items.map((item, index) => (
                            <div
                                key={index}
                                className=" p-4 border-b border-r relative "
                            >
                                <div className="post-item transition">
                                    <Link href={`/posts/${item.postId}`}>
                                        {" "}
                                        <p className=" text-sm text-xl py-2 font-light">
                                            {item.date}
                                        </p>{" "}
                                        <h2 className=" text-3xl font-normal py-2">
                                            {item.title}
                                        </h2>{" "}
                                        <p className="font-light text-xl text-md py-2">
                                            {item.description}
                                        </p>{" "}
                                        <div
                                            className="font-extralight text-xl text-md py-2 line-clamp-2 relative"
                                            style={{
                                                WebkitBoxOrient: "vertical",
                                                display: "-webkit-box",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {" "}
                                            {item.content.length > 0 &&
                                            item.content[0].contentType ===
                                                "text"
                                                ? item.content[0].content
                                                : "No content available"}
                                            <div
                                                className="
    absolute inset-0 pointer-events-none h-full 
    bg-gradient-to-b from-transparent to-white 
    dark:to-black
  "
                                            ></div>
                                        </div>{" "}
                                    </Link>
                                </div>
                            </div>
                        ))}{" "}
                    </div>{" "}
                    <div>
                        <div className="md:flex">
                            <div className="md:mr-4 grow-1">
                                {imgsa.map((item, index) => (
                                    <Image
                                        key={index}
                                        className="mt-4"
                                        src={item}
                                        alt="image"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                ))}
                            </div>
                            <div className=" grow-1">
                                {imgsb.map((item, index) => (
                                    <Image
                                        key={index}
                                        className="mt-4"
                                        src={item}
                                        alt="image"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>{" "}
            </div>{" "}
            <Footer/>
        </>
    );
}
