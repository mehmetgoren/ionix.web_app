export interface User {
  id: string;
  username: string;
  password: string;
  last_login_at: string;
  token: string;
  email: string;
}

export interface RegisterUserViewModel{
  username:string;
  password:string;
  re_password:string;
  email:string;
}

export interface LoginUserViewModel{
  username:string;
  password:string;
}
