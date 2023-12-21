"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

export async function updateUser(
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
    ): Promise<void> {

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
        // upsert true'nun anlami; Eger id'si userId ile ayni olan bir belge yoksa o zaman userId'ye sahip belgeyi guncellemek yerine bu verilen bilgilere gore yeni bir kullanici yani belge olusturulur.
        {upsert: true}  
    );

    if(path === "/profile/edit") {
        revalidatePath(path);
    }
   } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
   }
}