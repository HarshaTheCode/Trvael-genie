import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Compass,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function VerifyLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLink, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      if (typeof verifyMagicLink !== "function") {
        setStatus("error");
        setMessage("Verification function is unavailable. Please try again later.");
        toast.error("Verification unavailable");
        return;
      }
      const result = await verifyMagicLink(token);

      if (result.success) {
        setStatus("success");
        setMessage(result.message ?? "");
        toast.success("Successfully signed in!");

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(result.message ?? "");
        toast.error(result.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to verify login. Please try again.");
      toast.error("Verification failed");
    }
  };

  // If already authenticated (shouldn't happen but just in case)
  if (isAuthenticated && status === "loading") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to TravelGenie
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Compass className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">TravelGenie</h1>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              {status === "loading" && (
                <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
              )}
              {status === "success" && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {status === "error" && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}

              {status === "loading" && "Verifying Login..."}
              {status === "success" && "Login Successful!"}
              {status === "error" && "Login Failed"}
            </CardTitle>
            <CardDescription className="text-center">
              {status === "loading" &&
                "Please wait while we verify your magic link..."}
              {status === "success" && "Redirecting you to TravelGenie..."}
              {status === "error" && "There was a problem with your login link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              {status === "loading" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-2 bg-orange-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-2 bg-orange-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    Welcome to TravelGenie!
                  </p>
                  <p className="text-green-700 text-sm mt-1">{message}</p>
                  <div className="mt-3">
                    <div className="inline-flex items-center text-sm text-green-600">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Redirecting in a few seconds...
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">
                    Verification Failed
                  </p>
                  <p className="text-red-700 text-sm mt-1">{message}</p>
                </div>
              )}

              {/* Action buttons */}
              {status === "success" && (
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Continue to TravelGenie
                </Button>
              )}

              {status === "error" && (
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Try Signing In Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="w-full"
                  >
                    Continue Without Signing In
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
  </Card>

        {/* Help text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {status === "error" && (
              <>
                Magic links expire after 15 minutes. If yours has expired,
                <br />
                you can request a new one from the login page.
              </>
            )}
            {status === "success" && (
              <>
                You're now signed in and can save itineraries,
                <br />
                share them with friends, and access premium features.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
