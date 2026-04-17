import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

function Feed({ user, onLogout }) {
  const [posts, setPosts] = useState([])
  const [news, setNews] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [postsRes, newsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/posts`, axiosConfig),
        axios.get(`${API_URL}/news`, axiosConfig),
        axios.get(`${API_URL}/suggested-users`, axiosConfig),
      ])
      setPosts(postsRes.data)
      setNews(newsRes.data)
      setSuggestedUsers(usersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        onLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    try {
      const response = await axios.post(
        `${API_URL}/posts`,
        { content: newPost },
        axiosConfig
      )
      setPosts([response.data, ...posts])
      setNewPost('')
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(
        `${API_URL}/posts/${postId}/like`,
        {},
        axiosConfig
      )
      setPosts(posts.map(post => 
        post.id === postId ? response.data : post
      ))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const getInitials = (username) => {
    return username ? username[0].toUpperCase() : 'U'
  }

  if (loading) {
    return (
      <div className="feed-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="feed-container">
      <nav className="navbar">
        <h1>🌐 Social Feed</h1>
        <div className="user-info">
          <span>Welcome, <strong>{user?.username}</strong></span>
          <button className="btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="feed-layout">
        <div className="main-feed">
          <div className="new-post">
            <form onSubmit={handleCreatePost}>
              <textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="post-actions">
                <button type="submit" className="btn-primary">
                  Post
                </button>
              </div>
            </form>
          </div>

          <div className="posts-list">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <div className="avatar">{getInitials(post.username)}</div>
                  <div className="post-info">
                    <h3>{post.username}</h3>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
                <div className="post-content">{post.content}</div>
                <div className="post-footer">
                  <button className="like-button" onClick={() => handleLike(post.id)}>
                    ❤️ {post.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar">
          <div className="sidebar-section">
            <h3>📰 Latest News</h3>
            {news.map((item) => (
              <div key={item.id} className="news-item">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <span className="category">{item.category}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <h3>👥 Suggested Users</h3>
            {suggestedUsers.map((suggestedUser) => (
              <div key={suggestedUser.id} className="user-suggestion">
                <div className="user-suggestion-info">
                  <div className="small-avatar">{getInitials(suggestedUser.username)}</div>
                  <span>{suggestedUser.username}</span>
                </div>
                <button className="btn-follow">Follow</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feed
