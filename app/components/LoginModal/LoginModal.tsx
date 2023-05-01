'use client';

import React, { useEffect } from 'react';
import { Button, Label, Modal, Spinner, TextInput } from 'flowbite-react';
import { useUI } from '@app/components/Provider/context';
import { useWixClient } from '@app/hooks/useWixClient';
import { WIX_MEMBER_TOKEN } from '@app/constants';
import Cookies from 'js-cookie';
import Script from 'next/script';

enum State {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  RESET_PASSWORD = 'RESET_PASSWORD',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
}

export const LoginModal = () => {
  const { closeModalLogin, displayLoginModal } = useUI();
  const [loading, setLoading] = React.useState(false);
  const wixClient = useWixClient();
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [state, setState] = React.useState(State.LOGIN);
  const [pending, setPending] = React.useState({ state: false, message: '' });
  const [passwordInvalid, setPasswordInvalid] = React.useState(false);
  const [emailInvalid, setEmailInvalid] = React.useState(false);

  const closeModal = () => {
    setState(State.LOGIN);
    resetState();
    closeModalLogin();
  };

  const resetState = () => {
    setLoading(false);
    setPending({ state: false, message: '' });
    setEmail('');
    setCode('');
    setPasswordInvalid(false);
    setEmailInvalid(false);
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    resetState();
  }, [state]);

  const submit = async () => {
    setLoading(true);
    let response;

    if (state === State.RESET_PASSWORD) {
      await wixClient.auth.sendResetPasswordMail(email);
      setPending({ message: 'Password reset email sent', state: true });
      return;
    }

    if (state === State.LOGIN) {
      response = await wixClient.auth.login({
        email,
        password,
      });
    } else {
      // const invisibleRecaptcha = await wixClient.auth.getRecaptchaToken();
      response = await wixClient.auth.register({
        email,
        password,
        // captchaTokens: { invisibleRecaptcha },
        profile: { nickname: username },
      });
    }

    if (response.stateKind === 'success') {
      const tokens = await wixClient.auth.complete(response.data.sessionToken!);
      Cookies.set(WIX_MEMBER_TOKEN, JSON.stringify(tokens.refreshToken), {
        expires: 2,
      });
      closeModal();
      return;
    }

    if (response.stateKind === 'ownerApprovalRequired') {
      setPending({ message: 'Your account is pending approval', state: true });
    } else if (response.stateKind === 'emailVerificationRequired') {
      setState(State.EMAIL_VERIFICATION);
    } else if (response.stateKind === 'failure') {
      if (response.errorCode === 'invalidPassword') {
        setPasswordInvalid(true);
      } else if (
        response.errorCode === 'invalidEmail' ||
        response.errorCode === 'emailAlreadyExists'
      ) {
        setEmailInvalid(true);
      } else if (response.errorCode === 'resetPassword') {
        setPending({
          message: 'Your password requires reset',
          state: true,
        });
      }
    }
    setLoading(false);
  };

  const stateTitle =
    state === State.RESET_PASSWORD
      ? 'Reset Password'
      : state === State.LOGIN
      ? 'Log In'
      : state === State.EMAIL_VERIFICATION
      ? 'Email Verification'
      : 'Sign Up';

  const stateSubmit =
    state === State.RESET_PASSWORD
      ? 'Reset'
      : state === State.LOGIN
      ? 'Log In'
      : state === State.EMAIL_VERIFICATION
      ? 'Submit'
      : 'Sign Up';

  return (
    <React.Fragment>
      <Script src={wixClient.auth.getRecaptchaScriptUrl()} />
      <Modal show={displayLoginModal} onClose={closeModal}>
        <Modal.Body>
          <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
            <div className="flex">
              <h3 className="text-xl font-bold text-gray-900 text-center flex-1">
                {stateTitle}
              </h3>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="focus:outline-none"
              >
                <svg
                  className="w-6 h-6 ml-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            {pending.state ? (
              <div>
                <p className="pb-4">{pending.message}</p>
                <Button onClick={closeModal}>OK</Button>
              </div>
            ) : (
              <>
                {state === State.SIGNUP ? (
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="username" value="Username" />
                    </div>
                    <TextInput
                      id="username"
                      type="text"
                      value={username}
                      color="primary"
                      required={true}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                ) : null}
                {state !== State.EMAIL_VERIFICATION ? (
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="email" value="Email" />
                    </div>
                    <TextInput
                      id="email"
                      type="email"
                      color={emailInvalid ? 'failure' : 'primary'}
                      helperText={emailInvalid ? 'Invalid email' : null}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailInvalid(false);
                      }}
                      required={true}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="code" value="Code" />
                    </div>
                    <TextInput
                      id="code"
                      type="number"
                      color="primary"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                      }}
                      required={true}
                    />
                  </div>
                )}
                {state !== State.RESET_PASSWORD &&
                state !== State.EMAIL_VERIFICATION ? (
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="password" value="Password" />
                    </div>
                    <TextInput
                      id="password"
                      type="password"
                      value={password}
                      required={true}
                      color={passwordInvalid ? 'failure' : 'primary'}
                      helperText={passwordInvalid ? 'Invalid password' : null}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordInvalid(false);
                      }}
                    />
                  </div>
                ) : null}
                {state === State.LOGIN ? (
                  <div className="flex justify-between">
                    <a
                      onClick={() => setState(State.RESET_PASSWORD)}
                      className="text-sm text-blue-700 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                ) : null}
                <div className="w-full">
                  <Button
                    onClick={submit}
                    disabled={
                      !email ||
                      (!password && state !== State.RESET_PASSWORD) ||
                      loading
                    }
                  >
                    {loading ? <Spinner aria-label="Loading" /> : stateSubmit}
                  </Button>
                </div>
                {state !== State.RESET_PASSWORD &&
                state !== State.EMAIL_VERIFICATION ? (
                  <div className="text-sm font-medium text-gray-500">
                    {state === State.LOGIN ? 'Not' : ''} registered?{' '}
                    <a
                      onClick={() =>
                        setState(
                          state === State.LOGIN ? State.SIGNUP : State.LOGIN
                        )
                      }
                      className="text-blue-700 hover:underline"
                    >
                      {state === State.LOGIN ? 'Sign up' : 'Log in'}
                    </a>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
};