import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RegisterRedirect = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const role = params.get("role");
    const token = params.get("token");

    if (role === "pharmacist" && token) {
      navigate(`/register/pharmacist?token=${encodeURIComponent(token)}`, { replace: true });
    } else if (role === "delivery" && token) {
      navigate(`/register/delivery?token=${encodeURIComponent(token)}`, { replace: true });
    } else {
      // Default: go to normal register page, preserving token if present
      navigate(`/register${token ? `?token=${encodeURIComponent(token)}` : ""}`, { replace: true });
    }
  }, [navigate, search]);

  return null; // No UI, just redirect
};

export default RegisterRedirect; 