/**
 * Supabase Compatibility Layer for Appwrite Migration
 * 
 * This file provides a compatibility interface during the migration from Supabase to Appwrite.
 * Components that still import from this file will work with Appwrite through this adapter.
 * 
 * NOTE: This is a temporary solution. Each component should eventually be migrated
 * to use the Appwrite client directly from @/integrations/appwrite/client
 */

import { account, databases, storage, DATABASE_ID, BUCKET_ID, COLLECTIONS, Query, ID, client } from '../appwrite/client';

// Helper to convert Appwrite responses to Supabase-like format
const toSupabaseResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
});

// Compatibility layer that mimics Supabase client interface
export const supabase = {
  auth: {
    getUser: async () => {
      try {
        const user = await account.get();
        return { data: { user: { id: user.$id, email: user.email, ...user } }, error: null };
      } catch (error) {
        return { data: { user: null }, error };
      }
    },
    getSession: async () => {
      try {
        const user = await account.get();
        return { data: { session: { user: { id: user.$id, email: user.email, ...user } } }, error: null };
      } catch (error) {
        return { data: { session: null }, error };
      }
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        await account.createEmailPasswordSession(email, password);
        const user = await account.get();
        return { data: { user: { id: user.$id, ...user }, session: { user } }, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      try {
        const fullName = options?.data?.full_name || '';
        const user = await account.create(ID.unique(), email, password, fullName);
        await account.createEmailPasswordSession(email, password);
        return { data: { user: { id: user.$id, ...user }, session: {} }, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },
    signOut: async () => {
      try {
        await account.deleteSession('current');
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Appwrite doesn't have real-time auth state changes in the same way
      // Return a dummy subscription object
      return {
        data: {
          subscription: {
            unsubscribe: () => { }
          }
        }
      };
    },
    signInWithOAuth: async () => {
      // OAuth removed as per requirements
      return { error: { message: 'OAuth is not supported. Please use email/password.' } };
    }
  },
  from: (table: string) => ({
    select: (columns?: string) => createQueryBuilder(table, 'select', columns),
    insert: (data: any) => createMutationBuilder(table, 'insert', data),
    update: (data: any) => createMutationBuilder(table, 'update', data),
    delete: () => createMutationBuilder(table, 'delete'),
    upsert: (data: any, options?: any) => createMutationBuilder(table, 'upsert', data, options),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        try {
          const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
          return { data: { path: result.$id }, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      getPublicUrl: (path: string) => {
        const url = storage.getFileView(BUCKET_ID, path);
        return { data: { publicUrl: url.toString() } };
      },
      remove: async (paths: string[]) => {
        try {
          await Promise.all(paths.map(p => storage.deleteFile(BUCKET_ID, p)));
          return { error: null };
        } catch (error) {
          return { error };
        }
      }
    })
  },
  channel: (name: string) => ({
    on: () => ({ subscribe: () => ({ unsubscribe: () => { } }) })
  }),
  removeChannel: () => { },
  rpc: async (fn: string, params?: any) => {
    // RPC functions need to be converted to Appwrite Functions or direct operations
    console.warn(`RPC call to ${fn} - this needs to be migrated to Appwrite Functions`);
    return { data: null, error: { message: 'RPC not implemented in Appwrite compatibility layer' } };
  }
};

// Map table names to Appwrite collection IDs
const getCollectionId = (table: string): string => {
  const mapping: Record<string, string> = {
    profiles: COLLECTIONS.profiles,
    courses: COLLECTIONS.courses,
    course_enrollments: COLLECTIONS.enrollments,
    enrollments: COLLECTIONS.enrollments,
    assignments: COLLECTIONS.assignments,
    submissions: COLLECTIONS.submissions,
    scheduled_classes: COLLECTIONS.schedules,
    schedules: COLLECTIONS.schedules,
    teacher_announcements: COLLECTIONS.announcements,
    announcements: COLLECTIONS.announcements,
    exhibition_projects: COLLECTIONS.exhibition_projects,
    testimonials: COLLECTIONS.testimonials,
    course_modules: COLLECTIONS.course_modules,
    course_chapters: COLLECTIONS.course_modules,
    module_lessons: COLLECTIONS.module_lessons,
    course_lessons: COLLECTIONS.module_lessons,
    partner_requests: COLLECTIONS.partner_requests,
    quizzes: COLLECTIONS.quizzes,
    quiz_questions: COLLECTIONS.quiz_questions,
    quiz_attempts: COLLECTIONS.quiz_attempts,
    announcement_reads: 'announcement_reads', // May need to be created
  };
  return mapping[table] || table;
};

// Query builder that mimics Supabase query interface
function createQueryBuilder(table: string, operation: string, columns?: string) {
  const collectionId = getCollectionId(table);
  let queries: string[] = [];
  let limitValue: number | undefined;
  let isSingle = false;
  let selectColumns = columns;

  const builder = {
    eq: (column: string, value: any) => {
      queries.push(`eq:${column}:${value}`);
      return builder;
    },
    neq: (column: string, value: any) => {
      queries.push(`neq:${column}:${value}`);
      return builder;
    },
    gt: (column: string, value: any) => {
      queries.push(`gt:${column}:${value}`);
      return builder;
    },
    gte: (column: string, value: any) => {
      queries.push(`gte:${column}:${value}`);
      return builder;
    },
    lt: (column: string, value: any) => {
      queries.push(`lt:${column}:${value}`);
      return builder;
    },
    lte: (column: string, value: any) => {
      queries.push(`lte:${column}:${value}`);
      return builder;
    },
    in: (column: string, values: any[]) => {
      queries.push(`in:${column}:${JSON.stringify(values)}`);
      return builder;
    },
    or: (condition: string) => {
      // Complex OR conditions need special handling
      return builder;
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      const dir = options?.ascending !== false ? 'asc' : 'desc';
      queries.push(`order:${column}:${dir}`);
      return builder;
    },
    limit: (count: number) => {
      limitValue = count;
      return builder;
    },
    single: () => {
      isSingle = true;
      limitValue = 1;
      return builder;
    },
    maybeSingle: () => {
      isSingle = true;
      limitValue = 1;
      return builder;
    },
    then: async (resolve: (result: any) => void, reject?: (error: any) => void) => {
      try {
        const appwriteQueries: string[] = [];

        queries.forEach(q => {
          const [op, col, val] = q.split(':');
          switch (op) {
            case 'eq':
              appwriteQueries.push(Query.equal(col, val));
              break;
            case 'neq':
              appwriteQueries.push(Query.notEqual(col, val));
              break;
            case 'gt':
              appwriteQueries.push(Query.greaterThan(col, val));
              break;
            case 'gte':
              appwriteQueries.push(Query.greaterThanEqual(col, val));
              break;
            case 'lt':
              appwriteQueries.push(Query.lessThan(col, val));
              break;
            case 'lte':
              appwriteQueries.push(Query.lessThanEqual(col, val));
              break;
            case 'in':
              appwriteQueries.push(Query.equal(col, JSON.parse(val)));
              break;
            case 'order':
              if (val === 'asc') {
                appwriteQueries.push(Query.orderAsc(col));
              } else {
                appwriteQueries.push(Query.orderDesc(col));
              }
              break;
          }
        });

        if (limitValue) {
          appwriteQueries.push(Query.limit(limitValue));
        }

        const response = await databases.listDocuments(DATABASE_ID, collectionId, appwriteQueries);
        const docs = response.documents.map((doc: any) => ({ ...doc, id: doc.$id }));

        if (isSingle) {
          resolve({ data: docs[0] || null, error: null });
        } else {
          resolve({ data: docs, error: null });
        }
      } catch (error: any) {
        if (reject) reject(error);
        else resolve({ data: null, error });
      }
    }
  };

  return builder;
}

// Mutation builder for insert/update/delete operations
function createMutationBuilder(table: string, operation: string, data?: any, options?: any) {
  const collectionId = getCollectionId(table);
  let filterColumn: string | undefined;
  let filterValue: any;

  const builder = {
    eq: (column: string, value: any) => {
      filterColumn = column;
      filterValue = value;
      return builder;
    },
    select: (columns?: string) => builder,
    single: () => builder,
    then: async (resolve: (result: any) => void, reject?: (error: any) => void) => {
      try {
        let result: any;

        switch (operation) {
          case 'insert':
            const insertData = Array.isArray(data) ? data : [data];
            const insertedDocs = await Promise.all(
              insertData.map((item: any) =>
                databases.createDocument(DATABASE_ID, collectionId, item.id || ID.unique(), item)
              )
            );
            result = insertedDocs.map((doc: any) => ({ ...doc, id: doc.$id }));
            break;

          case 'update':
            if (filterColumn && filterValue) {
              // Find documents matching filter and update them
              const existing = await databases.listDocuments(DATABASE_ID, collectionId, [
                Query.equal(filterColumn, filterValue)
              ]);
              if (existing.documents.length > 0) {
                const updated = await databases.updateDocument(
                  DATABASE_ID,
                  collectionId,
                  existing.documents[0].$id,
                  data
                );
                result = { ...updated, id: updated.$id };
              }
            }
            break;

          case 'delete':
            if (filterColumn && filterValue) {
              const toDelete = await databases.listDocuments(DATABASE_ID, collectionId, [
                Query.equal(filterColumn, filterValue)
              ]);
              await Promise.all(
                toDelete.documents.map((doc: any) =>
                  databases.deleteDocument(DATABASE_ID, collectionId, doc.$id)
                )
              );
            }
            result = null;
            break;

          case 'upsert':
            if (filterColumn && filterValue) {
              const existing = await databases.listDocuments(DATABASE_ID, collectionId, [
                Query.equal(filterColumn, filterValue)
              ]);
              if (existing.documents.length > 0) {
                result = await databases.updateDocument(
                  DATABASE_ID,
                  collectionId,
                  existing.documents[0].$id,
                  data
                );
              } else {
                result = await databases.createDocument(DATABASE_ID, collectionId, ID.unique(), data);
              }
            } else {
              result = await databases.createDocument(DATABASE_ID, collectionId, data.id || ID.unique(), data);
            }
            break;
        }

        resolve({ data: result, error: null });
      } catch (error: any) {
        if (reject) reject(error);
        else resolve({ data: null, error });
      }
    }
  };

  return builder;
}

export default supabase;