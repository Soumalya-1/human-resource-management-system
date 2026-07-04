const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
};

export default Input;