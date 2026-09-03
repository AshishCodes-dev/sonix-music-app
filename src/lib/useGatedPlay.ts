import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import type { Song } from '../types';

// Returns a playSong function that first requires the user to be signed in.
// Guests are redirected to /login with a friendly toast — they can only
// listen after logging in or signing up.
export function useGatedPlay() {
  const { playSong } = usePlayer();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  return (song: Song, queue?: Song[]) => {
    if (!loading && !user) {
      toast('Sign in to start listening 🎧', 'info');
      navigate('/login');
      return;
    }
    playSong(song, queue);
  };
}
