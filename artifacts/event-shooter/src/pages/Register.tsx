import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Register() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/");
  }, [setLocation]);
  return null;
}
