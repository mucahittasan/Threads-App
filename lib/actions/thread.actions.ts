
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