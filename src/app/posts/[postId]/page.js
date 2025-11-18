import Nav from "@/app/components/nav";
import items from "@/app/components/items"; // Import the items array
import Footer from "@/app/components/footer";
import Image from "next/image";

export default async function PostPage({ params }) {
    const { postId } = params;

    // Find the item that matches the postId
    const post = items.find(
        (item) => item.title.toLowerCase().replace(/\s+/g, "-") === postId
    );

    if (!post) {
        return (
            <>
                <Nav />
                <div>Post not found</div>
            </>
        );
    }
    //set document title to post title
    let title = "zaneg.net > " + post.title.toLowerCase();

    let headers = [];
    post.content.forEach((contentItem) => {
        if (contentItem.contentType === "text" && contentItem.header) {
            headers.push(contentItem.header);
        }
    });

    return (
        <>
            <title>{title}</title>

            <div className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:z-[10]  lg:h-screen lg:items-ccenter  lg:justify-center lg:px-6 lg:w-[20vw] xl:w-[18vw] 2xl:w-[15vw]">
                <div className="w-full pt-[100px]">
                    <div className="backdrop-blur-lg border-l pl-2">
                    {headers.map((header, index) => (
                        <a
                            key={index}
                            href={`#${header
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            className="block py-2 px-2 font-light  text-xl hover:underline"
                        >
                            {header}
                        </a>
                    ))}
                </div>
                </div>
            </div>

            <div className="relative">
                <Nav />
                <div className="p-10 min-h-screen max-w-4xl mx-auto lg:ml-[22vw] xl:ml-[20vw] 2xl:ml-[18vw] tracking-tight">

                    <h1 className="font-normal text-5xl pb-4">{post.title}</h1>
                    <p className=" font-light text-2xl pb-8">{post.date}</p>
                    <p className=" pb-8 font-light text-2xl">
                        {post.description}
                    </p>
                    <div className="prose prose-lg max-w-none text-inherit">
                        {post.content.map((contentItem, index) => (
                            <div key={index}>
                                {contentItem.contentType === "text" && (
                                    <>
                                        {contentItem.header && (
                                            <h1
                                                id={contentItem.header
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "-")}
                                                className="md:text-4xl text-2xl font-normal my-6 scroll-mt-[100px]"
                                            >
                                                {contentItem.header}
                                            </h1>
                                        )}
                                        <p
                                            className="text-justify  text-[.85rem] leading-loose md:text-[1rem] lg:text-[1.25rem] font-light indent-6"
                                            dangerouslySetInnerHTML={{
                                                __html: contentItem.content.replace(
                                                    /(https?:\/\/[^\s]+)/g,
                                                    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
                                                ),
                                            }}
                                        />
                                    </>
                                )}

                                {contentItem.contentType === "image" && (
                                    <div className="my-4">
                                        <Image
                                            src={contentItem.source}
                                            alt={contentItem.alt || "Image"}
                                            className="w-full h-auto rounded"
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            style={{ width: '100%', height: 'auto' }}
                                        />
                                        {contentItem.caption && (
                                            <p className="text-[.65rem] md:text-[.85rem] leading-10 font-light mt-2 text-center">
                                                {contentItem.caption}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
