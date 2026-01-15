/**
 * Add missing collections for chapters and lessons
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

const PROJECT_ID = '696791b900079d1e7d3a';
const DATABASE_ID = '696797dd003cb0ec65cd';
const API_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const API_KEY = 'standard_aa1513e1695196e754d1cd90257326e396610ede4fa606dd9bfa401e7d4b50db76582e26f1db1b07141ce1438771d400303f55104ae88aa5d58401e44a6ba01fad051d213c9964fcff2227ce36386a0f921346b8258bbcac3cd1e8e13a8b52eb68bfdf0e15d4fb46120b06315015338d3fb4d4ae63718494d2ab54fedd36cdef';

const client = new Client()
    .setEndpoint(API_ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

const newCollections = [
    {
        id: 'course_chapters',
        name: 'Course Chapters',
        attributes: [
            { key: 'course_id', type: 'string', size: 36, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'order_index', type: 'integer', required: false, default: 0 },
        ]
    },
    {
        id: 'course_lessons',
        name: 'Course Lessons',
        attributes: [
            { key: 'chapter_id', type: 'string', size: 36, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 2000, required: false },
            { key: 'content_type', type: 'string', size: 50, required: false },
            { key: 'content_url', type: 'string', size: 500, required: false },
            { key: 'file_url', type: 'string', size: 500, required: false },
            { key: 'duration', type: 'integer', required: false },
            { key: 'order_index', type: 'integer', required: false, default: 0 },
            { key: 'is_mandatory', type: 'boolean', required: false, default: false },
        ]
    },
    {
        id: 'capstone_projects',
        name: 'Capstone Projects',
        attributes: [
            { key: 'course_id', type: 'string', size: 36, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 5000, required: false },
            { key: 'instructions', type: 'string', size: 10000, required: false },
            { key: 'due_date', type: 'datetime', required: false },
        ]
    },
    {
        id: 'lesson_quiz_questions',
        name: 'Lesson Quiz Questions',
        attributes: [
            { key: 'lesson_id', type: 'string', size: 36, required: true },
            { key: 'question_text', type: 'string', size: 2000, required: true },
            { key: 'correct_answer', type: 'string', size: 100, required: true },
            { key: 'explanation', type: 'string', size: 1000, required: false },
            { key: 'order_index', type: 'integer', required: false, default: 0 },
            { key: 'points', type: 'integer', required: false, default: 1 },
        ]
    }
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createCollection(collectionDef) {
    console.log(`\n📁 Creating collection: ${collectionDef.name}...`);

    try {
        await databases.createCollection(
            DATABASE_ID,
            collectionDef.id,
            collectionDef.name,
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ],
            true
        );
        console.log(`   ✅ Collection created: ${collectionDef.id}`);

        await sleep(1000);

        for (const attr of collectionDef.attributes) {
            try {
                switch (attr.type) {
                    case 'string':
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            collectionDef.id,
                            attr.key,
                            attr.size || 255,
                            attr.required || false,
                            attr.default || null
                        );
                        break;
                    case 'integer':
                        await databases.createIntegerAttribute(
                            DATABASE_ID,
                            collectionDef.id,
                            attr.key,
                            attr.required || false,
                            null,
                            null,
                            attr.default || null
                        );
                        break;
                    case 'boolean':
                        await databases.createBooleanAttribute(
                            DATABASE_ID,
                            collectionDef.id,
                            attr.key,
                            attr.required || false,
                            attr.default || null
                        );
                        break;
                    case 'datetime':
                        await databases.createDatetimeAttribute(
                            DATABASE_ID,
                            collectionDef.id,
                            attr.key,
                            attr.required || false,
                            attr.default || null
                        );
                        break;
                }
                console.log(`   ✅ Attribute: ${attr.key}`);
                await sleep(300);
            } catch (attrError) {
                console.log(`   ⚠️  Attribute ${attr.key}: ${attrError.message}`);
            }
        }

    } catch (error) {
        if (error.code === 409) {
            console.log(`   ℹ️  Collection already exists: ${collectionDef.id}`);
        } else {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

async function main() {
    console.log('🚀 Adding Course Content Collections');
    console.log('=====================================\n');

    for (const collection of newCollections) {
        await createCollection(collection);
    }

    console.log('\n\n✅ Collections added!');
}

main().catch(console.error);
