import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const TenantPage = () => {
  const { getTenantData, isAuthenticated } = useUserContext();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadTenant();
    }
  }, [isAuthenticated]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTenantData();
      setTenant(data);
    } catch (err) {
      setError(
        "Failed to load tenant data. This may require admin permissions.",
      );
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
                Tenant Information (Azure Resource Manager API)
              </CardTitle>
              <p className="text-sm text-gray-600">
                This endpoint requires admin-level permissions and may not be
                available for all users.
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading tenant information...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                  <Button onClick={loadTenant} className="mt-2" size="sm">
                    Retry
                  </Button>
                </div>
              ) : tenant && tenant.value && tenant.value.length > 0 ? (
                <div className="space-y-4">
                  {tenant.value.map((tenantInfo: any, index: number) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        Tenant {index + 1}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Tenant ID
                          </h4>
                          <p className="text-gray-700 text-sm font-mono">
                            {tenantInfo.tenantId || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Display Name
                          </h4>
                          <p className="text-gray-700">
                            {tenantInfo.displayName || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Default Domain
                          </h4>
                          <p className="text-gray-700">
                            {tenantInfo.defaultDomain || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <h4 className="font-medium text-gray-900 mb-1">
                            Tenant Type
                          </h4>
                          <p className="text-gray-700">
                            {tenantInfo.tenantType || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No tenant data available or insufficient permissions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantPage;
