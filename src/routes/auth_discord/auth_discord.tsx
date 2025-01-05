import { onMount } from 'solid-js';
import { discord_login } from '~/utils/userutils';
import { useNavigate } from '@solidjs/router';
import Index from '..';

const AuthDiscord = () => {
  const navigate = useNavigate();

  onMount(async () => {
    const query_string = window.location.search;
    const url_params = new URLSearchParams(query_string);
    const code = url_params.get('code');
    
    if (code !== null) {
      const success = await discord_login(code);

      // ... debugging for now, do a callback later ...
      if (!success) {
        console.error('Failed to login with Discord.');
        navigate('/');
      } else {
        localStorage.setItem('logged_in', 'true');
        window.location.href = '/?logged_in=true';
      }
    } else {
      console.error('No code provided.');
      navigate('/');
    }
  });

  return (
    <Index />
  );
}

export default AuthDiscord;