/**
 * Appwrite Database Setup Script
 * 
 * This script creates all the necessary collections in your Appwrite database.
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

// Your Appwrite configuration
const PROJECT_ID = '696791b900079d1e7d3a';
const DATABASE_ID = '696797dd003cb0ec65cd';
const API_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const API_KEY = 'standard_aa1513e1695196e754d1cd90257326e396610ede4fa606dd9bfa401e7d4b50db76582e26f1db1b07141ce1438771d400303f55104ae88aa5d58401e44a6ba01fad051d213c9964fcff2227ce36386a0f921346b8258bbcac3cd1e8e13a8b52eb68bfdf0e15d4fb46120b06315015338d3fb4d4ae63718494d2ab54fedd36cdef';

const client = new Client()
    .setEndpoint(API_ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

// Collection definitions
const collections = [
    {
        id: 'profiles',
        name: 'User Profiles',
        attributes: [
            { key: 'full_name', type: 'string', size: 255, required: true },
            { key: 'email', type: 'email', required: true },
            { key: 'role', type: 'enum', elements: ['student', 'teacher'], required: true },
            { key: 'avatar_url', type: 'url', required: false },
            { key: 'phone', type: 'string', size: 20, required: false },
            { key: 'bio', type: 'string', size: 1000, required: false },
            { key: 'school', type: 'string', size: 255, required: false },
            { key: 'grade_level', type: 'string', size: 50, required: false },
            { key: 'subjects', type: 'string', size: 500, required: false },
            { key: 'qualifications', type: 'string', size: 500, required: false },
            { key: 'experience_years', type: 'integer', required: false },
            { key: 'onboarding_completed', type: 'boolean', required: false, default: false },
            { key: 'teacher_approved', type: 'boolean', required: false, default: false },
            { key: 'is_suspended', type: 'boolean', required: false, default: false },
            { key: 'suspension_reason', type: 'string', size: 500, required: false },
            { key: 'last_activity', type: 'datetime', required: false },
        ]
    },
    {
        id: 'courses',
        name: 'Courses',
        attributes: [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 5000, required: false },
            { key: 'teacher_id', type: 'string', size: 36, required: true },
            { key: 'thumbnail_url', type: 'url', required: false },
            { key: 'level', type: 'enum', elements: ['beginner', 'intermediate', 'advanced'], required: false },
            { key: 'category', type: 'string', size: 100, required: false },
            { key: 'is_published', type: 'boolean', required: false, default: false },
            { key: 'price', type: 'float', required: false },
        ]
    },
    {
        id: 'enrollments',
        name: 'Course Enrollments',
        attributes: [
            { key: 'student_id', type: 'string', size: 36, required: true },
            { key: 'course_id', type: 'string', size: 36, required: true },
            { key: 'progress', type: 'integer', required: false, default: 0 },
            { key: 'enrolled_at', type: 'datetime', required: false },
            { key: 'completed_at', type: 'datetime', required: false },
        ]
    },
    {
        id: 'assignments',
        name: 'Assignments',
        attributes: [
            { key: 'course_id', type: 'string', size: 36, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 5000, required: false },
            { key: 'due_date', type: 'datetime', required: false },
            { key: 'max_score', type: 'integer', required: false, default: 100 },
            { key: 'assignment_type', type: 'enum', elements: ['homework', 'quiz', 'project', 'exam'], required: false },
        ]
    },
    {
        id: 'submissions',
        name: 'Assignment Submissions',
        attributes: [
            { key: 'assignment_id', type: 'string', size: 36, required: true },
            { key: 'student_id', type: 'string', size: 36, required: true },
            { key: 'content', type: 'string', size: 10000, required: false },
            { key: 'file_url', type: 'url', required: false },
            { key: 'score', type: 'integer', required: false },
            { key: 'feedback', type: 'string', size: 2000, required: false },
            { key: 'submitted_at', type: 'datetime', required: false },
            { key: 'graded_at', type: 'datetime', required: false },
        ]
    },
    {
        id: 'schedules',
        name: 'Class Schedules',
        attributes: [
            { key: 'course_id', type: 'string', size: 36, required: true },
            { key: 'teacher_id', type: 'string', size: 36, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 1000, required: false },
            { key: 'start_time', type: 'datetime', required: true },
            { key: 'end_time', type: 'datetime', required: false },
            { key: 'meeting_url', type: 'url', required: false },
        ]
    },
    {
        id: 'announcements',
        name: 'Announcements',
        attributes: [
            { key: 'course_id', type: 'string', size: 36, required: false },
            { key: 'teacher_id', type: 'string', size: 36, required: false },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 5000, required: true },
            { key: 'is_global', type: 'boolean', required: false, default: false },
        ]
    },
    {
        id: 'exhibition_projects',
        name: 'Exhibition Projects',
        attributes: [
            { key: 'student_id', type: 'string', size: 36, required: true },
            { key: 'student_name', type: 'string', size: 255, required: true },
            { key: 'student_image_url', type: 'url', required: false },
            { key: 'course_name', type: 'string', size: 255, required: false },
            { key: 'project_title', type: 'string', size: 255, required: true },
            { key: 'project_description', type: 'string', size: 5000, required: false },
            { key: 'course_score', type: 'integer', required: false },
            { key: 'project_link', type: 'url', required: false },
            { key: 'is_featured', type: 'boolean', required: false, default: false },
            { key: 'display_order', type: 'integer', required: false, default: 0 },
        ]
    },
    {
        id: 'testimonials',
        name: 'Testimonials',
        attributes: [
            { key: 'student_name', type: 'string', size: 255, required: true },
            { key: 'student_image_url', type: 'url', required: false },
            { key: 'testimonial_text', type: 'string', size: 2000, required: true },
            { key: 'rating', type: 'integer', required: false },
            { key: 'course_name', type: 'string', size: 255, required: false },
            { key: 'is_featured', type: 'boolean', required: false, default: false },
            { key: 'display_order', type: 'integer', required: false, default: 0 },
        ]
    },
    {
        id: 'course_modules',
        name: 'Course Modules',
        attributes: [
            { key: 'course_id', type: 'string', size: 36, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 1000, required: false },
            { key: 'order', type: 'integer', required: false, default: 0 },
        ]
    },
    {
        id: 'module_lessons',
        name: 'Module Lessons',
        attributes: [
            { key: 'module_id', type: 'string', size: 36, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 50000, required: false },
            { key: 'video_url', type: 'url', required: false },
            { key: 'duration_minutes', type: 'integer', required: false },
            { key: 'order', type: 'integer', required: false, default: 0 },
        ]
    },
    {
        id: 'partner_requests',
        name: 'Partner Requests',
        attributes: [
            { key: 'contact_name', type: 'string', size: 255, required: true },
            { key: 'email', type: 'email', required: true },
            { key: 'phone', type: 'string', size: 20, required: false },
            { key: 'organization_name', type: 'string', size: 255, required: true },
            { key: 'message', type: 'string', size: 2000, required: false },
            { key: 'status', type: 'enum', elements: ['pending', 'contacted', 'approved', 'rejected'], required: false },
        ]
    }
];

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createCollection(collectionDef) {
    console.log(`\n📁 Creating collection: ${collectionDef.name}...`);

    try {
        // Create the collection with proper permissions format
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
            true // documentSecurity - enables document-level permissions
        );
        console.log(`   ✅ Collection created: ${collectionDef.id}`);

        // Wait a bit for collection to be ready
        await sleep(1000);

        // Create attributes
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
                    case 'email':
                        await databases.createEmailAttribute(
                            DATABASE_ID,
                            collectionDef.id,
                            attr.key,
                            attr.required || false,
                            attr.default || null
                        );
                        break;
                    case 'url':
                        await databases.createUrlAttribute(
                            DATABASE_ID,
                            collectionDef.id,
                            attr.key,
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
                            null, // min
                            null, // max
                            attr.default || null
                        );
                        break;
                    case 'float':
                        await databases.createFloatAttribute(
                            DATABASE_ID,
                            collectionDef.id,
                            attr.key,
                            attr.required || false,
                            null, // min
                            null, // max
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
                    case 'enum':
                        await databases.createEnumAttribute(
                            DATABASE_ID,
                            collectionDef.id,
                            attr.key,
                            attr.elements,
                            attr.required || false,
                            attr.default || null
                        );
                        break;
                }
                console.log(`   ✅ Attribute: ${attr.key}`);
                await sleep(300); // Wait between attributes
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
    console.log('🚀 Appwrite Database Setup');
    console.log('==========================\n');
    console.log(`Project ID: ${PROJECT_ID}`);
    console.log(`Database ID: ${DATABASE_ID}`);
    console.log(`Endpoint: ${API_ENDPOINT}`);

    console.log('\n📦 Creating collections...');

    for (const collection of collections) {
        await createCollection(collection);
    }

    console.log('\n\n✅ Database setup complete!');
    console.log('You can now use your TutorSpace app with Appwrite.');
}

main().catch(console.error);
