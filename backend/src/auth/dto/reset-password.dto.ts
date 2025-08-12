import { IsEmail, IsNotEmpty, MinLength, IsString, Matches } from 'class-validator';

export class RequestResetPasswordDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token là bắt buộc' })
  @IsString({ message: 'Token phải là chuỗi' })
  token: string;

  @IsNotEmpty({ message: 'Mật khẩu mới là bắt buộc' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
    { message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số' }
  )
  newPassword: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu là bắt buộc' })
  confirmPassword: string;
}
