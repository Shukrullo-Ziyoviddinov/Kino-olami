import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setMoviySession } from '../../utils/authStorage';
import { listenToMoviyHost, sendMoviyMessage } from '../../utils/moviyBridge';

export default function MoviySession() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const ready = () => sendMoviyMessage({ type: 'kino-olami:ready' });
    const stopListening = listenToMoviyHost((message) => {
      if (message?.type === 'moviyai:hello') ready();
      if (message?.type === 'moviyai:kino-session' &&
          (message.token === null || typeof message.token === 'string')) {
        setMoviySession(message.token);
      }
      if (message?.type === 'moviyai:kino-page') {
        if (message.page === 'wishlist' && pathname !== '/wishlist') navigate('/wishlist');
        if (message.page === 'catalog' && pathname !== '/') navigate('/');
      }
    });
    ready();
    return stopListening;
  }, [navigate, pathname]);

  useEffect(() => {
    sendMoviyMessage({ type: 'kino-olami:page', wishlist: pathname === '/wishlist' });
  }, [pathname]);

  return null;
}
