import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { boardApi } from '../../api/boardApi';
import './BoardForm.css';

const BoardForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchPost();
    }
  }, [isEdit, id]);

  const fetchPost = async () => {
    try {
      const response = await boardApi.getById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to fetch post for editing:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await boardApi.update(id, formData);
      } else {
        await boardApi.create(formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="board-form-container glass-panel fade-in">
      <h1 className="form-title">{isEdit ? 'Edit Post' : 'Create New Post'}</h1>
      <form onSubmit={handleSubmit} className="vibe-form">
        <div className="form-group">
          <label>Title</label>
          <input 
            type="text" 
            placeholder="Enter a catchy title..." 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Author</label>
          <input 
            type="text" 
            placeholder="Your name" 
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            required
            disabled={isEdit}
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea 
            placeholder="Share your thoughts..." 
            rows="8"
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            required
          ></textarea>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isEdit ? 'Update Post' : 'Publish Post')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardForm;
