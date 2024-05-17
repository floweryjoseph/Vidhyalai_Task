import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Post from './Post';
import Container from '../common/Container';
import { useWindowWidth } from '../../context/WindowWidthContext';

const PostListContainer = styled.div(() => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
}));

const LoadMoreButton = styled.button(() => ({
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
  fontSize: 16,
  marginTop: 20,
  transition: 'background-color 0.3s ease',
  fontWeight: 600,

  '&:hover': {
    backgroundColor: '#0056b3',
  },
  '&:disabled': {
    backgroundColor: '#808080',
    cursor: 'default',
  },
}));

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [start, setStart] = useState(0);
  const [endOfData, setEndOfData] = useState(false)
  const { isSmallerDevice } = useWindowWidth();
  console.log(posts);
  const fetchPosts = async (start, limit) => {
    const { data: newPosts } = await axios.get('/api/v1/posts', {
      params: { start, limit },
    });
    return newPosts;
  };

  useEffect(() => {
    const loadInitialPosts = async () => {
      const initialPosts = await fetchPosts(0, isSmallerDevice ? 5 : 10);
      setPosts(initialPosts);
    };

    loadInitialPosts();
  }, [isSmallerDevice]);

  const handleClick = async () => {
    setIsLoading(true);
    const newPosts = await fetchPosts(
      start + (isSmallerDevice ? 5 : 10),
      isSmallerDevice ? 5 : 10,
    );
    if(isSmallerDevice && newPosts.length<5) {
      setEndOfData(true)
    }else if(!isSmallerDevice && newPosts.length<10){
      setEndOfData(true)
    }
    setPosts(prevPosts => [...prevPosts, ...newPosts]);
    setStart(prevStart => prevStart + (isSmallerDevice ? 5 : 10));
    setIsLoading(false);
  };

  return (
    <Container>
      <PostListContainer>
        {posts.map((post, i) => (
          <Post key={i} post={post} />
        ))}
      </PostListContainer>

      {posts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LoadMoreButton hidden={endOfData} onClick={handleClick} disabled={isLoading}>
            {!isLoading ? 'Load More' : 'Loading...'}
          </LoadMoreButton>
        </div>
      )}
    </Container>
  );
}
