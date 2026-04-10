export type UserDto = {
  id: string;
  name: string;
  email: string;
};

export type UserResponseDto = {
  user: UserDto;
};