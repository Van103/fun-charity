import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Store referral code and redirect to auth
      localStorage.setItem("referral_code", code);
      navigate("/auth", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [code, navigate]);

  return null;
}
