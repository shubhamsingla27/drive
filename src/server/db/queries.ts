import "server-only";

import { db } from "~/server/db";
import {
  DB_FileType,
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const QUERIES = {
  getAllParentsForFolder: async function (folderId: number) {
  const parents = [];
  let currentId: number | null = folderId;
  while (currentId) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, currentId));
    if (!folder[0]) {
      throw new Error("Parent folder not found");
    }
    parents.unshift(folder[0]);
    currentId = folder[0]?.parent;
  }
  return parents;
},

getFolders: function (folderId: number) {
  return db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parent, folderId));
},

getFiles: function (folderId: number) {
  return db.select().from(filesSchema).where(eq(filesSchema.parent, folderId));
}
}

export const MUTATIONS = {
  createFile: async function (input: {
    file: {
      name: string;
      url: string;
      parent: number;
      size: number;
    };
    userId:string
  }) {
    return await db.insert(filesSchema).values(input.file);
  }
}