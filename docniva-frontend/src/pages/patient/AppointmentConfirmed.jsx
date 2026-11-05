import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const API_URL = "http://localhost:5000";

// Razorpay checkout script load karo.
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

// JSON response safely read karo.
async function getJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return {
    success: false,
    message: text || `Request failed (${response.status})`,
  };
}

function AppointmentConfirmed() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [paymentStatus, setPaymentStatus] = useState(
    state?.paymentStatus || "pending"
  );

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  if (!state) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Appointment not found
          </h1>

          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Please book an appointment first.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate("/patient/find-doctor")}
          >
            Find a Doctor
          </Button>
        </Card>
      </main>
    );
  }

  const {
    _id: appointmentId,
    doctor,
    date,
    selectedTime,
    timeLabel,
    consultationType,
    status,
    amount,
  } = state;

  const appointmentStatus = status || "pending";

  const consultationFee =
    Number.isSafeInteger(amount) && amount > 0
      ? amount / 100
      : null;

  const getBadgeStatus = (currentStatus) => {
    if (currentStatus === "confirmed") return "confirmed";
    if (currentStatus === "rejected") return "danger";
    return "pending";
  };

  const getStatusText = (currentStatus) => {
    if (currentStatus === "confirmed") return "Confirmed";
    if (currentStatus === "rejected") return "Rejected";
    if (currentStatus === "cancelled") return "Cancelled";
    return "Pending";
  };

  // Backend se order banao aur Razorpay checkout kholo.
  const handlePayment = async () => {
    if (!appointmentId) {
      setPaymentError(
        "Appointment ID missing hai. Please appointment dobara book karein."
      );
      return;
    }

    if (paymentStatus === "paid") {
      setPaymentMessage("Is appointment ki payment pehle hi ho chuki hai.");
      return;
    }

    if (["cancelled", "rejected"].includes(appointmentStatus)) {
      setPaymentError(
        "Cancelled ya rejected appointment ke liye payment nahi ho sakti."
      );
      return;
    }

    const token = localStorage.getItem("docniva-token");

    if (!token) {
      setPaymentError("Payment karne ke liye patient login karein.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");
    setPaymentMessage("");

    try {
      // Razorpay checkout script load karo.
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Razorpay checkout load nahi hua. Internet connection check karke retry karein."
        );
      }

      // Step 1: Backend se payment order create karo.
      const orderResponse = await fetch(
        `${API_URL}/api/appointments/${appointmentId}/payment/order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const orderData = await getJsonResponse(orderResponse);

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(
          orderData.message || "Payment order create nahi hua."
        );
      }

      if (!orderData.keyId || !orderData.order?.id) {
        throw new Error("Razorpay order details incomplete hain.");
      }

      // Step 2: Razorpay checkout open karo.
      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Docniva",
        description: `Consultation with ${doctor?.name || "Doctor"}`,
        order_id: orderData.order.id,

        handler: async (response) => {
          setPaymentLoading(true);
          setPaymentError("");
          setPaymentMessage("Payment verify ho rahi hai...");

          try {
            // Step 3: Payment signature backend se verify karao.
            const verifyResponse = await fetch(
              `${API_URL}/api/appointments/${appointmentId}/payment/verify`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await getJsonResponse(verifyResponse);

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed. Please retry or check payment status."
              );
            }

            setPaymentStatus(verifyData.paymentStatus || "paid");
            setPaymentMessage(
              "Payment successful! Payment verify ho gayi hai."
            );
          } catch (error) {
            console.error("Payment verification error:", error);
            setPaymentError(
              error.message ||
                "Payment verify nahi ho payi. Dobara check karein."
            );
            setPaymentMessage("");
          } finally {
            setPaymentLoading(false);
          }
        },

        prefill: {
          name: "",
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setPaymentMessage("");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setPaymentLoading(false);
        setPaymentMessage("");
        setPaymentError(
          response.error?.description ||
            "Payment complete nahi hui. Aap dobara try kar sakte hain."
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      setPaymentError(
        error.message || "Payment start nahi ho payi."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="p-6 text-center sm:p-8">
          {/* Success icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)] text-3xl">
            ✓
          </div>

          <p className="mt-5 font-semibold text-[var(--primary)]">
            Appointment Request
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Your appointment request is submitted!
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Please complete the consultation payment below.
          </p>

          {/* Appointment details */}
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--soft-background)] p-5 text-left">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Doctor
                </p>

                <h2 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  {doctor?.name || "Doctor"}
                </h2>

                <p className="mt-1 text-sm text-[var(--primary)]">
                  {doctor?.specialization || "Specialist"}
                </p>
              </div>

              <Badge status={getBadgeStatus(appointmentStatus)}>
                {getStatusText(appointmentStatus)}
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Date
                </p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {date}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Time
                </p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {timeLabel || selectedTime}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Consultation
                </p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {consultationType}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Consultation Fee
                </p>
                <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                  {consultationFee !== null
                    ? `₹${consultationFee.toLocaleString("en-IN")}`
                    : "Amount unavailable"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-4 text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Payment Status:{" "}
              {paymentStatus === "paid" ? "Paid" : paymentStatus === "failed" ? "Failed" : paymentStatus === "refunded" ? "Refunded" : "Pending"}
            </p>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {paymentStatus === "paid"
                ? "Payment verify ho gayi hai. Appointment doctor ki approval ke hisaab se confirm hogi."
                : "Appointment complete karne ke liye consultation fee pay karein. Payment backend par verify hogi."}
            </p>
          </div>

          {/* Payment messages */}
          {paymentError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-700"
            >
              {paymentError}
            </div>
          )}

          {paymentMessage && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-left text-sm text-green-700"
            >
              {paymentMessage}
            </div>
          )}

          {/* Pay Now */}
          {paymentStatus !== "paid" &&
            !["cancelled", "rejected"].includes(appointmentStatus) && (
              <div className="mt-6">
                <Button
                  className="w-full"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading
                    ? "Please wait..."
                    : `Pay Now${consultationFee !== null ? ` ₹${consultationFee.toLocaleString("en-IN")}` : ""}`}
                </Button>

                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  Payment secure Razorpay checkout ke through process hogi.
                </p>
              </div>
            )}

          {/* Appointment status */}
          <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {appointmentStatus === "confirmed"
                ? "Your appointment has been accepted by the doctor."
                : appointmentStatus === "rejected"
                ? "Your appointment request was rejected by the doctor."
                : appointmentStatus === "cancelled"
                ? "This appointment has been cancelled."
                : "Your appointment request is waiting for the doctor's confirmation."}
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button
              onClick={() => navigate("/patient/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/patient/find-doctor")}
              className="w-full"
            >
              Find Another Doctor
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default AppointmentConfirmed;