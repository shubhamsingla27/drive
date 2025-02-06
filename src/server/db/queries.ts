import "server-only";

import { db } from "~/server/db";
import {
  type DB_FileType,
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const QUERIES = {
  getFolders: function (folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId))
      .orderBy(foldersSchema.id);
  },

  getFiles: function (folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.parent, folderId))
      .orderBy(filesSchema.id);
  },

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

  getFolderById: async function (folderId: number) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId));
    return folder[0];
  },

  getRootFolderForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
      );
    return folder[0];
  },
};

export const MUTATIONS = {
  createFile: async function (input: {
    file: {
      name: string;
      url: string;
      parent: number;
      size: number;
    };
    userId: string;
  }) {
    return await db
      .insert(filesSchema)
      .values({ ...input.file, ownerId: input.userId });
  },

  onboardUser: async function (userId: string) {
    const rootFolder = await db.insert(foldersSchema).values({
      name: "Root",
      parent: null,
      ownerId: userId,
    }).$returningId();

    const rootFolderId = rootFolder[0]!.id;
    await db.insert(foldersSchema).values([{
      name: "Shared with me",
      parent: rootFolderId,
      ownerId: userId,
    },
    {
      name: "Trash",
      parent: rootFolderId,
      ownerId: userId,
    }]);

    return rootFolderId;
  },
};
