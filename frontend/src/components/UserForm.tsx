"use client";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { userService, User, CreateUserDto, UpdateUserDto } from "@/api/user";
import { USER_ROLES, STATUS_OPTIONS, COMPANIES } from "@/config/constants";
import CustomDatePicker from "@/components/DatePicker";
import { getCompanies } from "@/api/companyApi";
import { useCurrentUser } from "@/hooks/useAuthRedirect";
type FormValues = {
  full_name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  company_id: string;
  day_of_birth: Date | null;
};
type Company = {
  id: number;
  name: string;
};
interface Props {
  userId?: number; // For edit mode
}

export default function UserForm({ userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<User | null>(null);
  const [fetchingUser, setFetchingUser] = useState(!!userId);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "member",
      status: "active",
      company_id: "",
      day_of_birth: null,
    },
  });

  const isEdit = !!userId;
  // Tải danh sách công ty
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const result = await getCompanies();
        setCompanies(result);
      } catch (error) {
        toast.error("Không thể tải danh sách công ty");
      }
    };

    fetchCompanies();
  }, []);
  // Fetch user data for edit mode
  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          setFetchingUser(true);
          const user = await userService.getUserById(userId);
          setInitialData(user);
          
          // Reset form with user data
          reset({
            full_name: user.full_name || "",
            email: user.email || "",
            role: user.role || "member",
            status: user.status || "active",
            company_id: user.company_id?.toString() || "",
            day_of_birth: user.day_of_birth ? new Date(user.day_of_birth) : null,
          });
        } catch (error) {
          toast.error("Không thể tải thông tin người dùng");
          router.push("/users");
        } finally {
          setFetchingUser(false);
        }
      };

      fetchUser();
    }
  }, [userId, reset, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      if (isEdit && userId) {
        // Update user
        const updateData: UpdateUserDto = {
        full_name: data.full_name,
        role: data.role as 'admin' | 'ca_user' | 'member',
        status: data.status as 'active' | 'inactive',
        company_id: data.company_id ? parseInt(data.company_id) : undefined,
        day_of_birth: data.day_of_birth ? data.day_of_birth.toISOString().split('T')[0] : undefined,
      };

      // Chỉ admin mới được phép cập nhật email
      if (currentUser?.role === "admin") {
        updateData.email = data.email;
      }

        await userService.updateUser(userId, updateData);
      } else {
        // Create user
        if (!data.password) {
          toast.error("Mật khẩu là bắt buộc khi tạo người dùng mới");
          return;
        }

        const createData: CreateUserDto = {
          full_name: data.full_name,
          email: data.email,
          password: data.password,
          role: data.role as 'admin' | 'ca_user' | 'member',
          status: data.status as 'active' | 'inactive',
          company_id: data.company_id ? parseInt(data.company_id) : undefined,
          day_of_birth: data.day_of_birth ? data.day_of_birth.toISOString().split('T')[0] : undefined,
        };

        await userService.createUser(createData);
      }

      router.push("/users");
    } catch (error) {
      // Error toast already shown in service
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="relative max-w-xl mx-auto p-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Đang tải thông tin người dùng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-xl mx-auto p-6">
      <div className="relative max-w-xl mx-auto p-6">
        {/* Nút nằm góc trên phải */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-6 right-6 text-sm text-blue-600 hover:underline"
        >
          Quay lại
        </button>

        <h1 className="text-2xl font-bold mb-4">
          {isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Họ tên</label>
            <input
              {...register("full_name", { required: "Họ tên là bắt buộc" })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              {...register("email", { 
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email không hợp lệ"
                }
              })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              disabled={loading || (isEdit && currentUser?.role !== "admin")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm mb-1">Mật khẩu</label>
              <input
                {...register("password", { 
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự"
                  }
                })}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Công ty</label>
            <select
            {...register("company_id")}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="">Chọn công ty</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Vai trò</label>
            <select
              {...register("role")}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role === 'admin' ? 'Quản trị viên' : 
                   role === 'ca_user' ? 'CA User' : 'Thành viên'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Trạng thái</label>
            <select
              {...register("status")}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Controller
              name="day_of_birth"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomDatePicker
                  label="Ngày sinh"
                  value={value}
                  onChange={onChange}
                  error={errors.day_of_birth?.message}
                  maxDate={new Date()}
                  showYearDropdown={true}
                  showMonthDropdown={true}
                  
                />
              )}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : (isEdit ? "Cập nhật" : "Tạo mới")}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}