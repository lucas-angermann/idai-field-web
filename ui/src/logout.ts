import { ANONYMOUS_USER, LoginData, forgetLogin } from './login';

export const doLogout = (setLoginData: (_: LoginData) => void) => (): void => {
  forgetLogin();
  setLoginData(ANONYMOUS_USER);
};
