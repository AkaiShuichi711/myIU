import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables.
// Priority: appwrite/scripts/.env -> repo root .env -> process.env
const scriptEnv = path.resolve(__dirname, '.env');
const rootEnv = path.resolve(__dirname, '..', '..', '.env');
if (fs.existsSync(scriptEnv)) {
  dotenv.config({ path: scriptEnv });
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config();
}

// IMPORTANT: You must create an Admin API key in your Appwrite Console
// (Console -> Settings -> API Keys -> Create Key). This admin key is
// required by this script to create databases/collections/storage.
// Keep the key private and DO NOT commit it to source control.
const endpoint = (process.env.APPWRITE_ENDPOINT || 'http://localhost/v1').replace(/\/+$/, '');
// APPWRITE_API_KEY: Admin/service API key you create in Appwrite Console
const apiKey = process.env.APPWRITE_API_KEY;
// APPWRITE_PROJECT_ID: (optional) the Project ID in Appwrite Console. If set,
// the script will scope creation to that project via the X-Appwrite-Project header.
const projectId = process.env.APPWRITE_PROJECT_ID;

if (!apiKey) {
  console.error('APPWRITE_API_KEY is required in environment. Create it in Appwrite Console -> Settings -> API Keys.');
  process.exit(1);
}

const headers: Record<string,string> = {
  'Content-Type': 'application/json',
  'X-Appwrite-Key': apiKey,
};
if (projectId) headers['X-Appwrite-Project'] = projectId;

async function post(path: string, body: any) {
  try {
    const res = await axios.post(`${endpoint}${path}`, body, { headers });
    return res.data;
  } catch (err: any) {
    console.error('Request failed:', path, err.response?.data || err.message);
    throw err;
  }
}

async function createDatabase(databaseId: string, name = 'myIU Database') {
  return post('/databases', { databaseId, name });
}

async function createCollection(databaseId: string, collectionId: string, name: string) {
  return post(`/databases/${databaseId}/collections`, {
    collectionId,
    name,
    read: ['*'],
    write: ['*'],
  });
}

async function createStringAttribute(databaseId: string, collectionId: string, key: string, size = 255, required = false) {
  return post(`/databases/${databaseId}/collections/${collectionId}/attributes/string`, { key, size, required });
}

async function createIntegerAttribute(databaseId: string, collectionId: string, key: string, required = false) {
  return post(`/databases/${databaseId}/collections/${collectionId}/attributes/integer`, { key, required });
}

async function createDatetimeAttribute(databaseId: string, collectionId: string, key: string, required = false) {
  return post(`/databases/${databaseId}/collections/${collectionId}/attributes/datetime`, { key, required });
}

async function createStorageBucket(bucketId: string, name = 'myIU Storage') {
  return post('/storage/buckets', { bucketId, name, permission: 'file', read: ['*'], write: ['*'] });
}

async function createIndex(databaseId: string, collectionId: string, key: string, type: string, attributes: string[]) {
  return post(`/databases/${databaseId}/collections/${collectionId}/indexes`, { key, type, attributes });
}

async function run() {
  const databaseId = process.env.DATABASE_ID || 'myIU_dev';
  const usersCollectionId = process.env.USERS_COLLECTION_ID || 'users';
  const postsCollectionId = process.env.POSTS_COLLECTION_ID || 'posts';
  const savesCollectionId = process.env.SAVES_COLLECTION_ID || 'saves';
  const likesCollectionId = process.env.LIKES_COLLECTION_ID || 'likes';
  const storageBucketId = process.env.STORAGE_BUCKET_ID || 'myiu_storage';

  console.log('Creating database...', databaseId);
  await createDatabase(databaseId, 'myIU Database').catch(() => console.log('Database may already exist'));

  console.log('Creating collections...');
  await createCollection(databaseId, usersCollectionId, 'Users').catch(() => console.log('Users collection may already exist'));
  await createCollection(databaseId, postsCollectionId, 'Posts').catch(() => console.log('Posts collection may already exist'));
  await createCollection(databaseId, savesCollectionId, 'Saves').catch(() => console.log('Saves collection may already exist'));
  await createCollection(databaseId, likesCollectionId, 'Likes').catch(() => console.log('Likes collection may already exist'));

  console.log('Adding attributes to Users...');
  await createStringAttribute(databaseId, usersCollectionId, 'name', 128, false).catch(()=>{});
  await createStringAttribute(databaseId, usersCollectionId, 'username', 64, false).catch(()=>{});
  await createStringAttribute(databaseId, usersCollectionId, 'email', 255, false).catch(()=>{});
  await createStringAttribute(databaseId, usersCollectionId, 'imageUrl', 1024, false).catch(()=>{});
  await createStringAttribute(databaseId, usersCollectionId, 'bio', 1024, false).catch(()=>{});

  console.log('Adding attributes to Posts...');
  await createStringAttribute(databaseId, postsCollectionId, 'title', 255, false).catch(()=>{});
  await createStringAttribute(databaseId, postsCollectionId, 'content', 20000, false).catch(()=>{});
  await createStringAttribute(databaseId, postsCollectionId, 'authorId', 64, false).catch(()=>{});
  await createDatetimeAttribute(databaseId, postsCollectionId, 'createdAt', false).catch(()=>{});
  await createDatetimeAttribute(databaseId, postsCollectionId, 'updatedAt', false).catch(()=>{});
  await createIntegerAttribute(databaseId, postsCollectionId, 'likeCount', false).catch(()=>{});

  console.log('Adding attributes to Saves and Likes...');
  await createStringAttribute(databaseId, savesCollectionId, 'userId', 64, false).catch(()=>{});
  await createStringAttribute(databaseId, savesCollectionId, 'postId', 64, false).catch(()=>{});
  await createStringAttribute(databaseId, likesCollectionId, 'userId', 64, false).catch(()=>{});
  await createStringAttribute(databaseId, likesCollectionId, 'postId', 64, false).catch(()=>{});

  console.log('Creating basic indexes for Posts (createdAt)');
  await createIndex(databaseId, postsCollectionId, 'idx_posts_createdAt', 'key', ['createdAt']).catch(()=>{});

  console.log('Creating storage bucket...');
  await createStorageBucket(storageBucketId, 'myIU Storage').catch(()=>console.log('Bucket may already exist'));

  console.log('\nDone. Use these values in your frontend .env.local:');
  console.log(`VITE_APPWRITE_URL=${endpoint}`);
  console.log(`VITE_APPWRITE_PROJECT_ID=${projectId || 'YOUR_PROJECT_ID'}`);
  console.log(`VITE_APPWRITE_DATABASE_ID=${databaseId}`);
  console.log(`VITE_APPWRITE_USERS_COLLECTION_ID=${usersCollectionId}`);
  console.log(`VITE_APPWRITE_POSTS_COLLECTION_ID=${postsCollectionId}`);
  console.log(`VITE_APPWRITE_SAVES_COLLECTION_ID=${savesCollectionId}`);
  console.log(`VITE_APPWRITE_STORAGE_ID=${storageBucketId}`);
}

run().catch(err => {
  console.error('Schema creation failed', err);
  process.exit(1);
});
