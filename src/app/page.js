import Image from "next/image";
import Nav from "./components/nav.js";
import Items from "./components/items.js";
export default function Home() {
    return (
        <>
            {" "}
            <div className="relative">
                {" "}
                <Nav />{" "}
                <div className="p-6 min-h-screen">
                    {" "}
                    <h1 className="font-bold text-3xl py-1 ml-4">
                        Latest Things
                    </h1>{" "}
                    <p className="py-4 ml-4 font-light text-xl">
                        {" "}
                        May or may not be impressive things I've done or am
                        doing.{" "}
                    </p>{" "}
                    <div className=" grid  grid-cols-[repeat(auto-fill,minmax(300px,1fr))] border-t border-l mx-auto ">
                        {" "}
                        {Items.map((item, index) => (
                            <div
                                key={index}
                                className=" p-4 border-b border-r relative "
                            >
                                <div className="post-item transition">
                                    <a href={`/posts/${item.postId}`}>
                                        {" "}
                                        <p className=" text-sm text-xl py-2 font-light">
                                            {item.date}
                                        </p>{" "}
                                        <h2 className="font-black text-3xl py-2">
                                            {item.title}
                                        </h2>{" "}
                                        <p className="font-semibold text-md py-2">
                                            {item.description}
                                        </p>{" "}
                                        <div
                                            className="font-light text-md py-2 line-clamp-2 relative"
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
                                    </a>
                                </div>
                            </div>
                        ))}{" "}
                    </div>{" "}
                </div>{" "}
            </div>{" "}
        </>
    );
}
