import Input from "../components/Input";
import Button from "../components/Button";

function Login() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10">

        <div className="flex flex-col items-center mb-8">

          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            H
          </div>

          <h1 className="text-3xl font-bold mt-5">
            HRMS
          </h1>

          <p className="text-gray-500 mt-2">
            Human Resource Management System
          </p>

        </div>

        <Input
          label="Login ID"
          placeholder="Enter Login ID"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter Password"
        />

        <Button>
          Sign In
        </Button>

        <div className="text-center mt-6">

          <button className="text-indigo-600 hover:underline">
            Forgot Password?
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;