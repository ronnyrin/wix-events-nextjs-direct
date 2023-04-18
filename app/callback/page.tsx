'use client';
import Cookies from 'js-cookie';
import { useWixClient } from '@app/hooks/useWixClient';
import { useEffect } from 'react';
import { OauthRedirectState } from '@wix/api-client';
import { OAUTH_COOKIE_STATE, WIX_MEMBER_TOKEN } from '@app/constants';

const Callback = () => {
  const wixClient = useWixClient();

  useEffect(() => {
    const oAuthStateCookie = Cookies.get(OAUTH_COOKIE_STATE);
    const oAuthState: OauthRedirectState = JSON.parse(oAuthStateCookie!);

    if (window.location.search.includes('error=')) {
      window.location.href = oAuthState.originalUrl;
      return;
    }

    const { state, code } = wixClient.auth.parseFromUrl();

    wixClient.auth.getMemberTokens(code, state, oAuthState).then((tokens) => {
      Cookies.remove(OAUTH_COOKIE_STATE);
      Cookies.set(WIX_MEMBER_TOKEN, JSON.stringify(tokens.refreshToken), {
        expires: 2,
      });
      window.location.href = oAuthState.originalUrl;
    });
  }, []);
};

export default Callback;
