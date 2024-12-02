import { 
    db,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from './firebase-config.js';

// Function to display blog posts on the index page
async function loadLatestBlogPosts() {
    try {
        const container = document.getElementById('latestBlogPosts');
        if (!container) {
            console.error('Latest blog posts container not found');
            return;
        }

        // Clear loading spinner
        const loadingSpinner = container.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.remove();
        }

        const postsRef = collection(db, 'posts');
        const q = query(postsRef, 
            orderBy('timestamp', 'desc'), 
            limit(2)  // Limit to 2 posts for index page
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const postData = doc.data();
                const postElement = createBlogPostCard(postData);
                container.appendChild(postElement);
            });
        } else {
            const noPostsMessage = document.createElement('div');
            noPostsMessage.className = 'no-posts-message';
            noPostsMessage.innerHTML = `
                <h3>No Recent Blog Posts</h3>
                <p>Check back soon for updates!</p>
            `;
            container.appendChild(noPostsMessage);
        }
    } catch (error) {
        console.error('Error loading latest blog posts:', error);
        const container = document.getElementById('latestBlogPosts');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Unable to Load Posts</h3>
                    <p>We're experiencing technical difficulties. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Function to create a blog post card
function createBlogPostCard(postData) {
    const article = document.createElement('article');
    article.className = 'article-card';

    // Use post image or fallback to placeholder
    const imageDiv = document.createElement('div');
    imageDiv.className = 'article-image';
    const img = document.createElement('img');
    img.src = postData.imageUrl || 'https://via.placeholder.com/400x300?text=Blog+Post';
    img.alt = postData.title;
    img.onerror = () => { img.src = 'https://via.placeholder.com/400x300?text=Blog+Post'; };
    imageDiv.appendChild(img);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'article-content';

    const title = document.createElement('h3');
    title.textContent = postData.title;

    const description = document.createElement('p');
    description.textContent = postData.excerpt || postData.content.substring(0, 100) + '...';

    const readMoreLink = document.createElement('a');
    readMoreLink.href = `blog-post.html?id=${postData.id}`;
    readMoreLink.className = 'read-more-btn';
    readMoreLink.innerHTML = `Read More <i class="fas fa-arrow-right"></i>`;

    contentDiv.appendChild(title);
    contentDiv.appendChild(description);
    contentDiv.appendChild(readMoreLink);

    article.appendChild(imageDiv);
    article.appendChild(contentDiv);

    return article;
}

// Load latest blog posts when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadLatestBlogPosts);
