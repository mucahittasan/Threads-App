"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";

interface UpdateUserProps {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path
}: UpdateUserProps): Promise<void> {

    connectToDB();

   try {
    await User.findOneAndUpdate(
        {id: userId},
        {
            username: username.toLowerCase(),
            name,
            bio,
            image,
            onboarded: true
        },
        {upsert: true}  
        // upsert true'nun anlami; Eger id'si userId ile ayni olan bir belge yoksa o zaman userId'ye sahip belgeyi guncellemek yerine bu verilen bilgilere gore yeni bir kullanici yani belge olusturulur.
    );

    if(path === "/profile/edit") {
        revalidatePath(path);
    }
   } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
   }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({id: userId})
        // .populate({
        //     path:"communities",
        //     model: Community
        // })
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();
        
        // find all threads authored by user with the given userId
        const threads = await User.findOne({id: userId})
        .populate({
            path: "threads",
            model: Thread,
            populate: {
                path: "children",
                model: Thread,
                populate: {
                    path: "author",
                    model: User,
                    select: "name image id"
                }
            }
        });

        return threads;
    } catch (error:any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`)
    }
}