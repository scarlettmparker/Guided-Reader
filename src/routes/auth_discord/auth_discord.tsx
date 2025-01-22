import { onMount } from 'solid-js';
import { discord_link, discord_login } from '~/utils/userutils';
import { useNavigate } from '@solidjs/router';
import { CACHE_KEY } from '~/utils/const';
import Index from '..';

const AuthDiscord = () => {
  const navigate = useNavigate();

  onMount(async () => {
    const query_string = window.location.search;
    const url_params = new URLSearchParams(query_string);
    const code = url_params.get('code');
    const verify = url_params.get('verify');

    if (code !== null && verify == null) {
      const success = await discord_login(code);

      // ... debugging for now, do a callback later ...
      if (!success) {
        console.error('Failed to login with Discord.');
        navigate('/');
      } else {
        localStorage.setItem('logged_in', 'true');
        window.location.href = '/?logged_in=true';
      }
    } else if (code !== null && verify == 'true') {
      const success = await discord_link(code);
      
      if (!success) {
        console.error('Failed to link Discord.');
      } else {
        localStorage.setItem('logged_in', 'true');
        localStorage.removeItem(CACHE_KEY); // load new user data (pfp)
        window.location.href = '/?logged_in=true';
      }
      navigate('/');
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