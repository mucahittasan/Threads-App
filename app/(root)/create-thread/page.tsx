import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"

const Page = async () => {

    const user = await currentUser();

    if (!user) return null;

    const userInfo = await fetchUser(user.id);

    return (
        <h1 className='head-text'>Create Thread</h1>
    )
}

export default Page