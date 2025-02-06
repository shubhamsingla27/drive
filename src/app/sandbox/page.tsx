import { auth } from "@clerk/nextjs/server"
import { db } from "~/server/db"
import { mockFolders, mockFiles } from "~/lib/mock-data"
import {files_table, folders_table} from "~/server/db/schema"

export default function SandboxPage() {
    return (
        <div>Seed form
        <form
            action={async ()=>{
                "use server"
                const user =await auth()
                if (!user.userId) {
                    throw new Error("User not found")
                }
                console.log("Seeding database")

                const rootFolder = await db.insert(folders_table).values({
                    name: "root",
                    ownerId: user.userId,
                    parent: null,
                }).$returningId()
                
                const folderInsert = await db.insert(folders_table).values(mockFolders.map((folder)=>({
                    name: folder.name,
                    ownerId: user.userId,
                    parent: rootFolder[0]!.id,
                })))
                console.log("Inserted folders", folderInsert)
            }}>
            <button type="submit">Seed</button>
        </form>
        </div>
    )
}