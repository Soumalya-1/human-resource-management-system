const Button = ({ children, type = "button", onClick }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="
        w-full
        bg-purple-600
        hover:bg-purple-700
        text-white
        font-semibold
        py-3
        rounded-xl
        transition
        duration-200
        shadow-md
      "
    >
      {children}
    </button>
  );
};

export default Button;