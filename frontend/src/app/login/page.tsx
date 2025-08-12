"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Google One Tap initialization
  useEffect(() => {
    if (isEmailLogin) return; // Don't load Google if in email mode
    
    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "1029936921176-sntj0im2gbjf4plljc3sb1d04sa9a4qm.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        
        if (!isEmailLogin) {
          window.google.accounts.id.prompt();
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin")!,
            { theme: "outline", size: "large", width: "100%" }
          );
        }
        
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isEmailLogin]);

  // Google login handler
  function handleCredentialResponse(response: any) {
    setIsLoading(true);
    fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token: response.credential }),
    })
    .then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Unknown error");
      }
      return res.json();
    })
    .then((data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("cre", response.credential);
      setMessage("✅ Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => router.push("/dashboard"), 1000);
    })
    .catch((err) => {
      setMessage("❌ Lỗi đăng nhập: " + err.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }

  // Email login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3001/auth/login/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // ✅ Lưu token và user info giống hệt như Google login
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      
      setMessage("✅ Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => router.push("/dashboard"), 1000);
      
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 rounded-lg bg-white shadow w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-4">Đăng nhập hệ thống</h1>
        
        {!isEmailLogin ? (
          // Google Login Mode
          <>
            <div id="google-signin" className="mb-4" />
            
            <div className="text-sm text-gray-400 mb-2">Hoặc các hình thức khác</div>
            
            <button 
              onClick={() => setIsEmailLogin(true)}
              className="mt-2 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              Đăng nhập bằng Email
            </button>
                    {/* <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm text-blue-500 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div> */}
          </>
        ) : (
          // Email Login Mode
          <>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
            
            <div className="mt-4">
              <button 
                onClick={() => {
                  setIsEmailLogin(false);
                  setMessage(null);
                  setFormData({ email: '', password: '' });
                }}
                className="text-sm text-blue-500 hover:underline"
              >
                ← Quay lại đăng nhập Google
              </button>
            </div>
          </>
        )}

        {/* Thông báo */}
        {message && (
          <div className={`mt-4 text-sm text-center ${
            message.includes('✅') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </div>
        )}
        
        {isLoading && (
          <div className="mt-2 text-sm text-gray-500">
            Đang xử lý...
          </div>
        )}
      </div>
    </div>
  );
}