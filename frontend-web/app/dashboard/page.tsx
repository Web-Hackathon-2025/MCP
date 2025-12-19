"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  User,
  LogOut,
  Package,
  Clock,
  CheckCircle,
  Star,
  Search,
  Plus,
  FileText,
  Settings,
  Wrench,
  Zap,
  Home,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Users,
} from "lucide-react"

type UserRole = "customer" | "service_provider" | null

type User = {
  email: string
  role: UserRole
  id: string
  name?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeRequests: 0,
    completedRequests: 0,
    favoriteProviders: 0,
    providersFound: 0,
    totalServices: 0,
    pendingRequests: 0,
    rating: 0,
  })
  const [recentRequests, setRecentRequests] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/auth/login")
      return
    }

    fetchUserData(token)
  }, [router])

  const fetchUserData = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        const userObj: User = {
          email: userData.email || userData.user?.email || "",
          role: (userData.role || userData.user?.role || null) as UserRole,
          id: userData.id || userData.user?.id || "",
          name: userData.name || userData.user?.name,
        }
        setUser(userObj)
        setUserName(userObj.name || userObj.email.split("@")[0])
        setUserRole(userObj.role)

        // Fetch dashboard stats based on role
        if (userObj.role === "customer") {
          fetchCustomerStats(token)
        } else if (userObj.role === "service_provider") {
          fetchProviderStats(token)
        }
      } else {
        if (response.status === 401) {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          router.push("/auth/login")
          return
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomerStats = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
      
      // Fetch customer requests
      const requestsResponse = await fetch(`${API_URL}/customers/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json()
        const active = requests.filter((r: any) => ["requested", "confirmed"].includes(r.status)).length
        const completed = requests.filter((r: any) => r.status === "completed").length
        
        setStats({
          activeRequests: active,
          completedRequests: completed,
          favoriteProviders: 0, // TODO: Implement favorites
          providersFound: 0, // TODO: Implement provider search count
        })
        setRecentRequests(requests.slice(0, 3))
      }
    } catch (error) {
      console.error("Failed to fetch customer stats:", error)
    }
  }

  const fetchProviderStats = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
      
      // Fetch provider services
      const servicesResponse = await fetch(`${API_URL}/providers/services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Fetch provider requests
      const requestsResponse = await fetch(`${API_URL}/providers/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (servicesResponse.ok) {
        const services = await servicesResponse.json()
        setStats((prev) => ({
          ...prev,
          totalServices: services.length || 0,
        }))
      }

      if (requestsResponse.ok) {
        const requests = await requestsResponse.json()
        const pending = requests.filter((r: any) => r.status === "requested").length
        const completed = requests.filter((r: any) => r.status === "completed").length
        
        setStats((prev) => ({
          ...prev,
          pendingRequests: pending,
          completedRequests: completed,
        }))
        setRecentRequests(requests.filter((r: any) => r.status === "requested").slice(0, 2))
      }
    } catch (error) {
      console.error("Failed to fetch provider stats:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
            <Image
              src="/assets/logo.jpeg"
              alt="Karigar"
              width={48}
              height={48}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl object-cover"
            />
          </div>
          <p className="text-gray-600 font-light text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-[24px] flex items-center justify-center mx-auto mb-8">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-3xl font-extralight text-black mb-3">Complete Your Profile</h2>
          <p className="text-gray-600 font-light mb-8">Please complete your profile setup to continue.</p>
          <Link href="/dashboard/profile">
            <Button className="rounded-[20px] bg-black hover:bg-gray-900 text-white px-8 py-6 text-base">
              Go to Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200">
        <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-20 lg:h-24">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black rounded-[16px] flex items-center justify-center overflow-hidden">
                  <Image
                    src="/assets/logo.jpeg"
                    alt="Karigar"
                    width={48}
                    height={48}
                    className="rounded-[16px] object-cover"
                  />
                </div>
                <span className="text-2xl lg:text-3xl font-extralight tracking-tight text-black">Karigar</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-[20px]">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-light text-gray-800">{userName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-[16px] hover:bg-gray-100 transition-all duration-300"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 sm:px-8 lg:px-12 xl:px-16 py-12 lg:py-16">
        {/* Welcome Section */}
        <div className="mb-16 lg:mb-20 animate-in fade-in duration-500">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extralight tracking-tight text-black mb-6 text-balance">
            Welcome back,
            <br />
            <span className="font-light">{userName.split(" ")[0]}</span>
          </h1>
          <p className="text-xl lg:text-2xl font-light text-gray-600 leading-relaxed max-w-2xl">
            {userRole === "customer"
              ? "Find the perfect local service provider for your needs"
              : "Manage your services and grow your business"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 lg:mb-20">
          {userRole === "customer" ? (
            <>
              <Card className="group p-8 lg:p-10 bg-white border-gray-200 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-5xl lg:text-6xl font-extralight text-black mb-3">{stats.activeRequests}</div>
                <div className="text-base font-light text-gray-600">Active Requests</div>
              </Card>

              <Card className="group p-8 lg:p-10 bg-white border-gray-200 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-5xl lg:text-6xl font-extralight text-black mb-3">{stats.completedRequests}</div>
                <div className="text-base font-light text-gray-600">Completed</div>
              </Card>

              <Card className="group p-8 lg:p-10 bg-white border-gray-200 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-5xl lg:text-6xl font-extralight text-black mb-3">{stats.favoriteProviders}</div>
                <div className="text-base font-light text-gray-600">Favorites</div>
              </Card>

              <Card className="group p-8 lg:p-10 bg-gradient-to-br from-black to-gray-800 border-0 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-7 h-7 text-black" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-5xl lg:text-6xl font-extralight text-white mb-3">{stats.providersFound}</div>
                <div className="text-base font-light text-gray-300">Providers Found</div>
              </Card>
            </>
          ) : (
            <>
              <Card className="group p-8 lg:p-10 bg-white border-gray-200 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-5xl lg:text-6xl font-extralight text-black mb-3">{stats.totalServices}</div>
                <div className="text-base font-light text-gray-600">Total Services</div>
              </Card>

              <Card className="group p-8 lg:p-10 bg-white border-gray-200 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-5xl lg:text-6xl font-extralight text-black mb-3">{stats.pendingRequests}</div>
                <div className="text-base font-light text-gray-600">Pending Requests</div>
              </Card>

              <Card className="group p-8 lg:p-10 bg-white border-gray-200 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-black rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-5xl lg:text-6xl font-extralight text-black mb-3">{stats.completedRequests}</div>
                <div className="text-base font-light text-gray-600">Completed</div>
              </Card>

              <Card className="group p-8 lg:p-10 bg-gradient-to-br from-black to-gray-800 border-0 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Star className="w-7 h-7 text-black" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-5xl lg:text-6xl font-extralight text-white mb-3">{stats.rating || "4.9"}</div>
                <div className="text-base font-light text-gray-300">Rating</div>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-16 lg:mb-20">
          <h2 className="text-4xl lg:text-5xl font-extralight tracking-tight text-black mb-8 lg:mb-10">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {userRole === "customer" ? (
              <>
                <Link href="/dashboard/services">
                  <Button className="group h-auto p-8 bg-black hover:bg-gray-900 text-white rounded-[24px] flex flex-col items-start gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full">
                    <Search className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
                    <div className="text-left">
                      <div className="text-lg font-light mb-1">Browse Services</div>
                      <div className="text-sm text-gray-300 font-light">Find providers</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/requests/new">
                  <Button
                    variant="outline"
                    className="group h-auto p-8 bg-white hover:bg-gray-50 border-gray-200 rounded-[24px] flex flex-col items-start gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full"
                  >
                    <Plus className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-500" />
                    <div className="text-left">
                      <div className="text-lg font-light text-black mb-1">New Request</div>
                      <div className="text-sm text-gray-600 font-light">Create booking</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/requests">
                  <Button
                    variant="outline"
                    className="group h-auto p-8 bg-white hover:bg-gray-50 border-gray-200 rounded-[24px] flex flex-col items-start gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full"
                  >
                    <FileText className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-500" />
                    <div className="text-left">
                      <div className="text-lg font-light text-black mb-1">My Requests</div>
                      <div className="text-sm text-gray-600 font-light">View history</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/profile">
                  <Button
                    variant="outline"
                    className="group h-auto p-8 bg-white hover:bg-gray-50 border-gray-200 rounded-[24px] flex flex-col items-start gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full"
                  >
                    <Settings className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-500" />
                    <div className="text-left">
                      <div className="text-lg font-light text-black mb-1">Profile</div>
                      <div className="text-sm text-gray-600 font-light">Edit details</div>
                    </div>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/services/manage">
                  <Button className="group h-auto p-8 bg-black hover:bg-gray-900 text-white rounded-[24px] flex flex-col items-start gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full">
                    <Wrench className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
                    <div className="text-left">
                      <div className="text-lg font-light mb-1">Manage Services</div>
                      <div className="text-sm text-gray-300 font-light">Edit offerings</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/requests">
                  <Button
                    variant="outline"
                    className="group h-auto p-8 bg-white hover:bg-gray-50 border-gray-200 rounded-[24px] flex flex-col items-start gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full"
                  >
                    <FileText className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-500" />
                    <div className="text-left">
                      <div className="text-lg font-light text-black mb-1">View Requests</div>
                      <div className="text-sm text-gray-600 font-light">Customer bookings</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/availability">
                  <Button
                    variant="outline"
                    className="group h-auto p-8 bg-white hover:bg-gray-50 border-gray-200 rounded-[24px] flex flex-col items-start gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full"
                  >
                    <Clock className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-500" />
                    <div className="text-left">
                      <div className="text-lg font-light text-black mb-1">Availability</div>
                      <div className="text-sm text-gray-600 font-light">Set schedule</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/profile">
                  <Button
                    variant="outline"
                    className="group h-auto p-8 bg-white hover:bg-gray-50 border-gray-200 rounded-[24px] flex flex-col items-start gap-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 w-full"
                  >
                    <Settings className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-500" />
                    <div className="text-left">
                      <div className="text-lg font-light text-black mb-1">Business Profile</div>
                      <div className="text-sm text-gray-600 font-light">Update info</div>
                    </div>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <h2 className="text-4xl lg:text-5xl font-extralight tracking-tight text-black">
              {userRole === "customer" ? "Recent Requests" : "Pending Requests"}
            </h2>
            <Link href={userRole === "customer" ? "/dashboard/requests" : "/dashboard/requests"}>
              <Button variant="ghost" className="group rounded-[16px] hover:bg-gray-100">
                <span className="text-sm font-light text-gray-600">View all</span>
                <ArrowRight className="w-4 h-4 ml-2 text-gray-600 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>

          {userRole === "customer" ? (
            <div className="space-y-4 lg:space-y-6">
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="group p-8 lg:p-10 bg-white border-gray-200 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-[20px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                          <Zap className="w-8 h-8 text-black" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-light text-black mb-2">
                            {request.service?.name || "Service Request"}
                          </h3>
                          <p className="text-base font-light text-gray-600 mb-4 leading-relaxed">
                            {request.notes || "No additional notes"}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-light text-gray-500">
                            <span>Provider: {request.provider?.business_name || "N/A"}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>
                              {new Date(request.requested_date || request.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className={`px-4 py-2 rounded-[16px] ${
                            request.status === "confirmed"
                              ? "bg-blue-50 text-blue-600"
                              : request.status === "requested"
                              ? "bg-yellow-50 text-yellow-600"
                              : request.status === "completed"
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          <span className="text-sm font-light capitalize">{request.status}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-[24px] flex items-center justify-center mx-auto mb-8">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-extralight text-black mb-4">No requests yet</h3>
                  <p className="text-lg font-light text-gray-600 mb-8 max-w-md mx-auto">
                    Start your journey by creating your first service request
                  </p>
                  <Link href="/dashboard/requests/new">
                    <Button className="rounded-[20px] bg-black hover:bg-gray-900 text-white px-8 py-6 text-base">
                      Create Request
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="group p-8 lg:p-10 bg-white border-gray-200 rounded-[32px] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-[20px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                          <Wrench className="w-8 h-8 text-black" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-light text-black mb-2">
                            {request.service?.name || "Service Request"}
                          </h3>
                          <p className="text-base font-light text-gray-600 mb-4 leading-relaxed">
                            {request.notes || "No additional notes"}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-light text-gray-500">
                            <span>Customer: {request.customer?.user?.email || "N/A"}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>
                              {new Date(request.requested_date || request.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button className="rounded-[16px] bg-black hover:bg-gray-900 text-white px-6">
                          Accept
                        </Button>
                        <Button variant="outline" className="rounded-[16px] border-gray-200 hover:bg-gray-50 px-6 bg-transparent">
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-[24px] flex items-center justify-center mx-auto mb-8">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-extralight text-black mb-4">No pending requests</h3>
                  <p className="text-lg font-light text-gray-600 mb-8 max-w-md mx-auto">
                    You don't have any pending requests at the moment
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
