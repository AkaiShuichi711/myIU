import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const ProfilePage = () => {
  const { getProfileData, isAuthenticated } = useUserContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfileData();
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to view this page
            </p>
            <Button onClick={() => (window.location.href = "/sign-in")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={() => (window.location.href = "/home")}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Profile Information (Microsoft Graph API)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading profile...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                  <Button onClick={loadProfile} className="mt-2" size="sm">
                    Retry
                  </Button>
                </div>
              ) : profile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Display Name
                      </h3>
                      <p className="text-gray-700">
                        {profile.displayName || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Given Name
                      </h3>
                      <p className="text-gray-700">
                        {profile.givenName || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Surname
                      </h3>
                      <p className="text-gray-700">
                        {profile.surname || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        User Principal Name
                      </h3>
                      <p className="text-gray-700">
                        {profile.userPrincipalName || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Job Title
                      </h3>
                      <p className="text-gray-700">
                        {profile.jobTitle || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Office Location
                      </h3>
                      <p className="text-gray-700">
                        {profile.officeLocation || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No profile data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
