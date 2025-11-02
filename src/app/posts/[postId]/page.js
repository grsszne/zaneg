import Nav from "@/app/components/nav";
import items from "@/app/components/items"; // Import the items array
import Footer from "@/app/components/footer";

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



    return (
        <>
        <title>{title}</title>
            <Nav />
            <div className="p-8 min-h-screen max-w-4xl mx-auto tracking-tight">
                <h1 className="font-normal text-5xl pb-4">{post.title}</h1>
                <p className=" font-light text-2xl pb-8">{post.date}</p>
                <p className=" pb-8 font-light text-2xl">{post.description}</p>
                <div className="prose prose-lg max-w-none text-inherit">
                    {post.content.map((contentItem, index) => (
                        <div key={index}>
                            {contentItem.contentType === "text" && (
                                <>
                                    {contentItem.header && (
                                        <h1 className="text-4xl font-normal my-6 ">
                                            {contentItem.header}
                                        </h1>
                                    )}
                                    <p
                                        className="text-justify leading-loose text-[1.25rem] font-light indent-6"
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
                                    <img
                                        src={contentItem.source}
                                        alt={contentItem.alt || "Image"}
                                        className="w-full h-auto rounded"
                                    />
                                    {contentItem.caption && (
                                        <p className="text-[.85rem] leading-10 font-light mt-2 text-center">
                                            {contentItem.caption}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <Footer/>
        </>
    );
}
