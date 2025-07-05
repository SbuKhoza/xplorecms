import XploreMenu from "@/components/XploreMenu"
import Restaurants from "@/components/restaurants"
import Emergency from "@/components/emergency"
import Accommodation from "@/components/accommodation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-black">Professional CMS Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your content with ease</p>
        </div>
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
              <TabsTrigger
                value="menu"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none py-4 px-6"
              >
                Explore Menu
              </TabsTrigger>
              <TabsTrigger
                value="restaurants"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none py-4 px-6"
              >
                Restaurants
              </TabsTrigger>
              <TabsTrigger
                value="emergency"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none py-4 px-6"
              >
                Emergency
              </TabsTrigger>
              <TabsTrigger
                value="accommodation"
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none py-4 px-6"
              >
                Accommodation
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="menu" className="mt-0">
          <XploreMenu />
        </TabsContent>
        <TabsContent value="restaurants" className="mt-0">
          <Restaurants />
        </TabsContent>
        <TabsContent value="emergency" className="mt-0">
          <Emergency />
        </TabsContent>
        <TabsContent value="accommodation" className="mt-0">
          <Accommodation />
        </TabsContent>
      </Tabs>
    </div>
  )
}
