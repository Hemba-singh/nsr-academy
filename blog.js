import { 
    auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    PASSWORD_RULES,
    db,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp
} from './firebase-config.js';

// DOM Elements
let authModal = null;
let blogContent = null;
const blogPostsContainer = document.getElementById('blogPosts');

// Initialize blog page
function initBlog() {
    console.log('Initializing blog...');
    loadBlogPosts();
}

// Function to add a test blog post
async function addTestBlogPost() {
    // Run diagnostics before attempting to add post
    runFirebaseDiagnostics();

    try {
        const postsRef = collection(db, 'posts');
        
        const testPost = {
            title: 'Diagnostic Test Post',
            author: 'Diagnostic Script',
            content: `This is a diagnostic test post created to verify Firestore functionality. 
            If you're seeing this, the post creation was successful.`,
            timestamp: serverTimestamp(),
            diagnosticTimestamp: new Date().toISOString(),
            tags: ['diagnostic', 'test']
        };

        const docRef = await addDoc(postsRef, testPost);
        
        console.group('✅ Test Post Creation');
        console.log('Test Post Added Successfully:', {
            postId: docRef.id,
            timestamp: new Date().toISOString()
        });
        console.groupEnd();

        // Update UI with diagnostic information
        const container = document.getElementById('blogPosts');
        if (container) {
            container.innerHTML = `
                <div class="diagnostic-success">
                    <h2>🎉 Diagnostic Test Successful</h2>
                    <p>Test post created in Firestore</p>
                    <details>
                        <summary>Post Details</summary>
                        <pre>${JSON.stringify({
                            postId: docRef.id, 
                            timestamp: new Date().toISOString()
                        }, null, 2)}</pre>
                    </details>
                    <button onclick="loadBlogPosts()">View Posts</button>
                </div>
            `;
        }

        return docRef.id;
    } catch (error) {
        console.group('❌ Test Post Creation Failed');
        console.error('Detailed Error:', error);
        console.groupEnd();

        const container = document.getElementById('blogPosts');
        if (container) {
            container.innerHTML = `
                <div class="diagnostic-error">
                    <h2>🚨 Diagnostic Test Failed</h2>
                    <p>Unable to create test post in Firestore</p>
                    <details>
                        <summary>Error Details</summary>
                        <pre>${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}</pre>
                    </details>
                </div>
            `;
        }
        
        throw error;
    }
}

// Add a button to manually trigger test post creation
function addTestPostButton() {
    const container = document.getElementById('blogPosts');
    if (container) {
        const testPostButton = document.createElement('button');
        testPostButton.textContent = 'Create Test Blog Post';
        testPostButton.className = 'test-post-btn';
        testPostButton.onclick = addTestBlogPost;
        
        container.insertAdjacentElement('afterbegin', testPostButton);
    }
}

// Function to fetch and display blog posts
async function fetchTestBlogPost() {
    try {
        console.log('Starting to fetch blog posts...');
        const postsRef = collection(db, 'posts');
        
        // Log collection reference
        console.log('Posts Collection Reference:', postsRef);

        // More flexible query to help diagnose issues
        const q = query(postsRef, 
            orderBy('timestamp', 'desc'), 
            limit(5)  // Increased limit to get more diagnostic information
        );
        
        try {
            const querySnapshot = await getDocs(q);
            
            console.log('Query Snapshot:', {
                size: querySnapshot.size,
                empty: querySnapshot.empty
            });
            
            const container = document.getElementById('blogPosts');
            if (!container) {
                console.error('Blog posts container not found');
                return;
            }

            if (!querySnapshot.empty) {
                console.log('Posts found. Displaying...');
                displayPosts(container, querySnapshot);
            } else {
                console.warn('No posts found in the collection.');
                container.innerHTML = `
                    <div class="no-posts-message">
                        <h3>No Blog Posts Available</h3>
                        <p>We couldn't find any posts in the 'posts' collection.</p>
                        <details>
                            <summary>Troubleshooting Tips</summary>
                            <ul>
                                <li>Verify Firestore collection name is 'posts'</li>
                                <li>Check if posts have been added to the collection</li>
                                <li>Ensure timestamp field exists</li>
                            </ul>
                        </details>
                    </div>
                `;
            }
        } catch (queryError) {
            // Specific handling for permission errors
            if (queryError.code === 'permission-denied') {
                handleFirestorePermissionError(queryError);
            } else {
                console.error('Error executing Firestore query:', queryError);
                
                const container = document.getElementById('blogPosts');
                if (container) {
                    container.innerHTML = `
                        <div class="error-message">
                            <h3>Firestore Query Error</h3>
                            <p>Unable to fetch blog posts. Please check console for details.</p>
                            <details>
                                <summary>Error Details</summary>
                                <pre>${JSON.stringify(queryError, null, 2)}</pre>
                            </details>
                            <button onclick="loadBlogPosts()">Retry</button>
                        </div>
                    `;
                }
            }
        }
    } catch (error) {
        console.error('Comprehensive Firestore Fetch Error:', error);
        
        const container = document.getElementById('blogPosts');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Blog Posts Unavailable</h3>
                    <p>We encountered an error while trying to load blog posts.</p>
                    <details>
                        <summary>Troubleshooting</summary>
                        <ul>
                            <li>Check your Firestore connection</li>
                            <li>Verify Firebase configuration</li>
                            <li>Ensure network connectivity</li>
                        </ul>
                    </details>
                    <button onclick="loadBlogPosts()">Retry</button>
                </div>
            `;
        }
    }
}

// Function to display posts with enhanced error checking
async function displayPosts(container, querySnapshot) {
    if (!container) {
        console.error('Container element not found');
        return;
    }

    // Clear loading spinner
    container.innerHTML = '';

    if (querySnapshot.empty) {
        container.innerHTML = '<p class="no-posts">No blog posts found.</p>';
        return;
    }

    querySnapshot.forEach(doc => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.className = 'blog-card';

        const formattedDate = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString() : 'Date not available';
        
        postElement.innerHTML = `
            <div class="blog-card-image">
                <img src="${post.imageUrl || 'placeholder-image.jpg'}" alt="${post.title}">
            </div>
            <div class="blog-card-content">
                <h2 class="blog-card-title">${post.title}</h2>
                <div class="blog-card-meta">
                    <span>By ${post.author || 'Anonymous'}</span> • 
                    <span>${formattedDate}</span>
                </div>
                <p class="blog-card-excerpt">${post.content.substring(0, 150)}...</p>
                <a href="#" class="blog-card-link" data-post-id="${doc.id}">Read More</a>
            </div>
        `;

        // Add click event listener for the "Read More" link
        const readMoreLink = postElement.querySelector('.blog-card-link');
        readMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Implement your read more functionality here
            console.log('Opening post:', doc.id);
        });

        container.appendChild(postElement);
    });
}

// Enhanced error handling for Firestore permissions
function handleFirestorePermissionError(error) {
    console.group('🚨 Firestore Permission Error');
    console.error('Detailed Error:', error);
    console.log('Troubleshooting Steps:', [
        '1. Check Firestore Security Rules',
        '2. Verify Firebase Configuration',
        '3. Ensure Correct Project Settings'
    ]);
    console.groupEnd();

    // Create a user-friendly error message
    const container = document.getElementById('blogPosts');
    if (container) {
        container.innerHTML = `
            <div class="firestore-permission-error">
                <h2>🔒 Firestore Access Denied</h2>
                <p>Unable to access Firestore database. This could be due to incorrect security rules.</p>
                <details>
                    <summary>Troubleshooting Guide</summary>
                    <ol>
                        <li>Open Firebase Console</li>
                        <li>Go to Firestore Database</li>
                        <li>Navigate to "Rules" tab</li>
                        <li>Set rules to allow read/write during development:
                            <pre>
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: true;
    }
  }
}
                            </pre>
                        </li>
                    </ol>
                </details>
                <button onclick="runFirebaseDiagnostics()">Run Diagnostics</button>
            </div>
        `;
    }
}

// Load blog posts
async function loadBlogPosts() {
    const blogPostsContainer = document.getElementById('blogPosts');
    if (!blogPostsContainer) {
        console.error('Blog posts container not found');
        return;
    }

    // Show loading state
    blogPostsContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading blog posts...</p>
        </div>
    `;

    await fetchTestBlogPost();
}

// Comprehensive Firebase Diagnostics
function runFirebaseDiagnostics() {
    console.group('🔍 Firebase Diagnostics');
    
    // Check Firebase App
    console.log('Firebase App Status:', {
        initialized: !!app,
        config: {
            projectId: firebaseConfig.projectId,
            apiKeyPresent: !!firebaseConfig.apiKey
        }
    });

    // Check Authentication
    console.log('Authentication Status:', {
        initialized: !!auth,
        currentUser: auth.currentUser ? {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            emailVerified: auth.currentUser.emailVerified
        } : null
    });

    // Check Firestore
    console.log('Firestore Diagnostics:', {
        initialized: !!db,
        testCollectionCheck: async () => {
            try {
                const postsRef = collection(db, 'posts');
                const snapshot = await getDocs(postsRef);
                console.log('Posts Collection Diagnostics:', {
                    exists: true,
                    documentCount: snapshot.size,
                    documents: snapshot.docs.map(doc => ({
                        id: doc.id,
                        data: doc.data()
                    }))
                });
            } catch (error) {
                console.error('Error checking posts collection:', error);
            }
        }
    });

    // Network Connectivity Test
    function testNetworkConnectivity() {
        return new Promise((resolve) => {
            fetch('https://www.google.com', { 
                mode: 'no-cors', 
                cache: 'no-store' 
            })
            .then(() => resolve(true))
            .catch(() => resolve(false));
        });
    }

    // Run full diagnostics
    async function runFullDiagnostics() {
        console.log('Network Connectivity:', await testNetworkConnectivity());
        
        // Test Firestore collection
        await console.log('Firestore Diagnostics').testCollectionCheck();
        
        console.groupEnd();
    }

    runFullDiagnostics();
}

// Add diagnostic button to page
function addDiagnosticButtons() {
    const container = document.getElementById('blogPosts');
    if (container) {
        const diagnosticContainer = document.createElement('div');
        diagnosticContainer.className = 'diagnostic-buttons';
        
        const testPostButton = document.createElement('button');
        testPostButton.textContent = '🧪 Create Test Post';
        testPostButton.onclick = addTestBlogPost;
        
        const runDiagnosticsButton = document.createElement('button');
        runDiagnosticsButton.textContent = '🔍 Run Diagnostics';
        runDiagnosticsButton.onclick = runFirebaseDiagnostics;
        
        diagnosticContainer.appendChild(testPostButton);
        diagnosticContainer.appendChild(runDiagnosticsButton);
        
        container.insertAdjacentElement('afterbegin', diagnosticContainer);
    }
}

// Modify initialization to include diagnostic buttons
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded. Initializing blog...');
    loadBlogPosts();
    addDiagnosticButtons();
});
