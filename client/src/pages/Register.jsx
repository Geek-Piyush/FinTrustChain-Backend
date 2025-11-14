import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../api/api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", passwordConfirm: "" });
  const [eSignFile, setESignFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!eSignFile) {
      toast.error("Please upload an e-signature image file.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("passwordConfirm", form.passwordConfirm);
      fd.append("eSign", eSignFile, eSignFile.name);

      const res = await auth.register(fd);
      const { token } = res.data;
      localStorage.setItem("token", token);
      toast.success("Account created. Verification email sent.");
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-max py-12">
      <div className="max-w-md mx-auto card p-6 rounded">
        <h2 className="text-2xl font-semibold neon-text">Create account</h2>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <input required placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="p-3 rounded bg-transparent border border-white/6" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className="p-3 rounded bg-transparent border border-white/6" />
          <input required type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} className="p-3 rounded bg-transparent border border-white/6" />
          <input required type="password" placeholder="Confirm Password" value={form.passwordConfirm} onChange={(e)=>setForm({...form,passwordConfirm:e.target.value})} className="p-3 rounded bg-transparent border border-white/6" />

          <label className="text-sm text-gray-300">Upload e-signature image (PNG/JPEG)</label>
          <input required type="file" accept="image/*" onChange={(e)=>setESignFile(e.target.files[0])} className="p-2 rounded bg-transparent border border-white/6" />

          <button className="btn-neon p-3 rounded" disabled={loading}>{loading?"Creating...":"Create account"}</button>
        </form>
      </div>
    </div>
  )
}
