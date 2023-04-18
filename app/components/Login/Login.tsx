'use client';
import { useWixClient } from '@app/hooks/useWixClient';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import { OAUTH_COOKIE_STATE, WIX_MEMBER_TOKEN } from '@app/constants';

const LoginComp = () => {
  const wixClient = useWixClient();
  const memberSession = Cookies.get(WIX_MEMBER_TOKEN);
  const isLoggedIn = JSON.parse(memberSession || '{}').value;
  const onLoginClick = async () => {
    if (isLoggedIn) {
      Cookies.remove(WIX_MEMBER_TOKEN);
      const { url } = await wixClient.auth.logout(window.location.href);
      window.location.href = url;
      return;
    }
    const oauthState = wixClient.auth.generateOauthRedirectState(
      `${window.location.origin}/callback`,
      window.location.href
    );
    Cookies.set(OAUTH_COOKIE_STATE, JSON.stringify(oauthState), {
      expires: 0.01,
    });
    const { url } = await wixClient.auth.authorizationUrl(oauthState);
    window.location.href = url;
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
