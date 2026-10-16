"use client";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  customerAuthService,
  type CustomerSession,
} from "../services/customer-auth.service";

function sessionKey(storeSlug: string) {
  return `selldesk_customer_session:${storeSlug}`;
}

const SESSION_CHANGE_EVENT = "selldesk-customer-session-change";

function isCustomerSession(value: unknown): value is CustomerSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<CustomerSession>;
  return (
    typeof session.accessToken === "string" &&
    typeof session.refreshToken === "string" &&
    typeof session.customer?.id === "string" &&
    typeof session.customer.name === "string" &&
    typeof session.customer.phone === "string"
  );
}

function parseCustomerSession(serialized: string | null): CustomerSession | null {
  if (!serialized) return null;
  try {
    const parsed: unknown = JSON.parse(serialized);
    return isCustomerSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function CustomerAccountPage({ storeSlug }: { storeSlug: string }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const subscribeToSession = useCallback(
    (onChange: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === sessionKey(storeSlug)) onChange();
      };
      window.addEventListener("storage", handleStorage);
      window.addEventListener(SESSION_CHANGE_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(SESSION_CHANGE_EVENT, onChange);
      };
    },
    [storeSlug],
  );
  const getSessionSnapshot = useCallback(
    () => window.sessionStorage.getItem(sessionKey(storeSlug)),
    [storeSlug],
  );
  const serializedSession = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    () => null,
  );
  const session = useMemo(
    () => parseCustomerSession(serializedSession),
    [serializedSession],
  );

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await customerAuthService.sendOtp(storeSlug, phone.trim());
      setOtpRequested(true);
      setMessage("A verification code has been sent to your phone.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not send the verification code.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const customerSession = await customerAuthService.verifyOtp(
        storeSlug,
        phone.trim(),
        code.trim(),
      );
      window.sessionStorage.setItem(
        sessionKey(storeSlug),
        JSON.stringify(customerSession),
      );
      window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
      setMessage("You are signed in.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The verification code could not be confirmed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resendOtp() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await customerAuthService.resendOtp(storeSlug, phone.trim());
      setMessage("A new verification code has been sent.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not resend the verification code.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!session) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await customerAuthService.logout(storeSlug, session.refreshToken);
      window.sessionStorage.removeItem(sessionKey(storeSlug));
      window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
      setOtpRequested(false);
      setCode("");
      setMessage("You have signed out.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not sign out. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-black text-slate-900">Your account</h1>
      {session ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-600">Signed in as</p>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">
              {session.customer.name}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {session.customer.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="text-sm text-emerald-700">
              {message}
            </p>
          )}
        </div>
      ) : (
        <form
          onSubmit={otpRequested ? verifyOtp : requestOtp}
          className="mt-6 space-y-4"
        >
          <p className="text-sm text-slate-600">
            Sign in or create an account with your mobile number.
          </p>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            Mobile number
            <input
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="017XXXXXXXX"
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-(--store-primary) focus:ring-2 focus:ring-(--store-primary)/20"
            />
          </label>
          {otpRequested && (
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              Verification code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm tracking-[0.3em] outline-none focus:border-(--store-primary) focus:ring-2 focus:ring-(--store-primary)/20"
              />
            </label>
          )}
          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="text-sm text-emerald-700">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-(--store-primary) px-4 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy
              ? "Please wait..."
              : otpRequested
                ? "Verify and sign in"
                : "Send verification code"}
          </button>
          {otpRequested && (
            <button
              type="button"
              disabled={busy}
              onClick={resendOtp}
              className="w-full text-sm font-semibold text-(--store-primary) hover:underline disabled:opacity-60"
            >
              Resend code
            </button>
          )}
        </form>
      )}
    </section>
  );
}
