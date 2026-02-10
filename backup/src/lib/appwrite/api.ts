import { ID, Query } from 'appwrite';
import { INewPost, INewUser, PaspdatePost } from '@/types';
import { account, avatars, databases, appwriteConfig, storage } from './config';

// Manual Pagination Because appwrite doesn't have pagination
// let numOfPosts: number = 2; // have 2 posts
// let currentPage: number = 0;
// const limit: number = 10;
// export let hasNextPage = true;


export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.Password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}


export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (err) {
    console.log(err);
  }
}


export async function signInAccount(user: { email: string; Password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.Password);

    return session;
  } catch (err) {
    console.log(err);
  }
}


export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal('accountId', currentAccount.$id)],
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}


export async function signOutAccount() {
  try {
    const session = await account.deleteSession('cookieFallback');
    return session;
  } catch (error) {
    console.log(error);
  }
}


export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        console.log(error);
    }
}


export async function getFilePreview(fileId: string){
    try {
        const fileUrl = await storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        );
        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}


export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId)
        return {status: "ok"}
    } catch (error) {
        console.log(error);
    }
}


export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = await getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }
    console.log(fileUrl)

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // increment Post count
    //numOfPosts++;

    return newPost;
  } catch (error) {
    console.log(error);
  }
}


export async function getRecentPosts(){
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(20)]
    )
    
    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}


export async function likePost(postId: string, likesArray: string[]){
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId,
      {
        likes: likesArray,
      }
    )

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}


export async function savePost(postId: string, userId: string){
  try {
    const savedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        post: postId,
        user: userId,
      }
    )

    if (!savedPost) throw Error;

    return savedPost;
  } catch (error) {
    console.log(error);
  }
}


export async function deleteSavedPost(savedRecordId: string){
  try {
    //console.log("delete", savedRecordId);
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId,
    )

    if (!statusCode) throw Error;

    return {status: "ok"};
  } catch (error) {
    console.log(error);
  }
}


export async function getPostById(postId: string){
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    )

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error)
  }
}


export async function updatePost(post: PaspdatePost) {
  const hasFileToUpdate = post.file.length > 0;
  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    }

    if(hasFileToUpdate) {
      // Upload file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get file url
      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }
      console.log({fileUrl});

      image = {...image, imageUrl: fileUrl, imageId: uploadedFile.$id}
    }


    // Convert tags into array
    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    // Create post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      ID.unique(),
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}


export async function deletePost(postId: string, imageId: string){
  try {
    //console.log(postId, imageId)
    if(!postId || !imageId) throw Error;

    console.log('delete post', postId);
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId,
    )

    await deleteFile(imageId)
    


    // decrement Post count
    //numOfPosts--;
    
    return {status: "ok"}
  } catch (error) {
    console.log(error);
  }
}


export async function getInfinitePosts({ pageParam = '' } : { pageParam: string}){
  // limit is 1 to see infinite posts
  const queries: string[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]
  
  // currentPage++;

  // const offset = (currentPage - 1) * limit;
  // if(offset > numOfPosts) {
  //   hasNextPage = false;
  //   throw Error; 
  // }

  if(pageParam !== ''){
    queries.push(Query.cursorAfter(pageParam));
    //queries.push(Query.offset(offset));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      queries
    )

    //console.log(posts);
    if (!posts) throw Error;

    return posts.documents;
  } catch (error) {
    console.log(error);
  }
}


export async function searchPosts(searchTerm: string){
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.search('caption',  searchTerm)]
    )
    
    if (!posts) throw Error;
    
    return posts.documents;
  } catch (error) {
    console.log(error);
  }
}


export async function getSavedPosts(userId: string){
  try {
    const savedPosts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal('user', userId)]
    )
    
    if (!savedPosts) throw Error;

    return savedPosts.documents;
  } catch (error) {
    console.log(error);
  }
}