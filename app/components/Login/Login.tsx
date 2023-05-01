'use client';
import { useWixClient } from '@app/hooks/useWixClient';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import { WIX_MEMBER_TOKEN, WIX_REFRESH_TOKEN } from '@app/constants';
import { useUI } from '@app/components/Provider/context';

const LoginComp = () => {
  const { openModalLogin } = useUI();
  const wixClient = useWixClient();
  const memberSession = Cookies.get(WIX_MEMBER_TOKEN);
  const isLoggedIn = JSON.parse(memberSession || '{}').value;
  const onLoginClick = async () => {
    if (isLoggedIn) {
      Cookies.remove(WIX_MEMBER_TOKEN);
      Cookies.remove(WIX_REFRESH_TOKEN);
      const { logoutUrl } = await wixClient.auth.logout(window.location.href);
      window.location.href = logoutUrl;
      return;
    }

    openModalLogin();
  };
  return (
    <button onClick={onLoginClick} className="flex relative">
      {isLoggedIn ? 'Log Out' : 'Log In'}
    </button>
  );
};

export const Login = dynamic(() => Promise.resolve(LoginComp), {
  ssr: false,
});
