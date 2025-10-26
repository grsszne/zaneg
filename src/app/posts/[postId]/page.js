import Nav from "@/app/components/nav";
import items from "@/app/components/items"; // Import the items array

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

    return (
        <>
            <Nav />
            <div className="p-8 min-h-screen max-w-4xl mx-auto">
                <h1 className="font-bold text-4xl pb-4">{post.title}</h1>
                <p className="text-sm text-gray-500 pb-8">{post.date}</p>
                <p className="text-lg pb-8">{post.description}</p>
                <div className="prose prose-lg max-w-none">
                    {post.content.map((contentItem, index) => (
                        <div key={index}>
                            {contentItem.contentType === "text" && (
                                <>
                                    {contentItem.header && (
                                        <h1 className="text-2xl font-bold my-2">
                                            {contentItem.header}
                                        </h1>
                                    )}
                                    <p
                                        className="text-justify leading-loose indent-6"
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
                                        <p className="text-sm leading-10 text-gray-500 mt-2 text-center">
                                            {contentItem.caption}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
