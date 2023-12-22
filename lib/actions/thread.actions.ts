
// Burada use server kullanmayi unuttum ve bir hatayla karsilastim. Eger ki database islemleri yapiyorsak use server kullanmak zorundayiz!
"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface CreateThreadProps {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
}

export async function createThread({
    text, author, communityId, path
}: CreateThreadProps) {
    try {
        
    connectToDB();

    const createdThread = await Thread.create({
        text,
        author,
        community: null
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
        $push: {threads: createdThread._id}
    });

    revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();

    // Calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize

    // Fetch the posts that have no parents (top-level threads)
    const postsQuery = Thread.find({parentId: {$in: [null, undefined]}})
        .sort({createdAt: "desc"})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({path: "author", model: User})
        .populate({
            path: "children",
            populate: {
                path: "author",
                model: User,
                select: "_id name parentId image"
            }
        });

        const totalPostsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}});

        // Thread.find() ile yapılan sorgular MongoDB'de bir Query (sorgu) nesnesi döndürür. Bu sorgu nesnesi, asenkron bir yapıya sahiptir ve sonucunu beklemek için exec() fonksiyonu kullanılır.
        const posts = await postsQuery.exec();

        const isNext = totalPostsCount > skipAmount + posts.length;

        return {posts, isNext};
}