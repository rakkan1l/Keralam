import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/PageLoader';
import Home from '../pages/Home';

// Route-level code splitting: every page except Home loads on demand.
const Explore = lazy(() => import('../pages/Explore'));
const HiddenGems = lazy(() => import('../pages/HiddenGems'));
const PlaceDetail = lazy(() => import('../pages/PlaceDetail'));
const Districts = lazy(() => import('../pages/Districts'));
const DistrictDetail = lazy(() => import('../pages/DistrictDetail'));
const Food = lazy(() => import('../pages/Food'));
const DishDetail = lazy(() => import('../pages/DishDetail'));
const BusinessDetail = lazy(() => import('../pages/BusinessDetail'));
const BusinessSection = lazy(() => import('../pages/BusinessSection'));
const Stays = lazy(() => import('../pages/Stays'));
const StayDetail = lazy(() => import('../pages/StayDetail'));
const Events = lazy(() => import('../pages/Events'));
const EventDetail = lazy(() => import('../pages/EventDetail'));
const NearMe = lazy(() => import('../pages/NearMe'));
const Directions = lazy(() => import('../pages/Directions'));
const TripBuilder = lazy(() => import('../pages/TripBuilder'));
const TripView = lazy(() => import('../pages/TripView'));
const SharedTrip = lazy(() => import('../pages/SharedTrip'));
const Saved = lazy(() => import('../pages/Saved'));
const ListDetail = lazy(() => import('../pages/ListDetail'));
const SharedList = lazy(() => import('../pages/SharedList'));
const Help = lazy(() => import('../pages/Help'));
const Search = lazy(() => import('../pages/Search'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Account = lazy(() => import('../pages/Account'));
const NotFound = lazy(() => import('../pages/NotFound'));
const AdminApp = lazy(() => import('../features/admin/AdminApp'));

export function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <RequireAuth roles={['admin', 'editor']}>
            <Suspense fallback={<PageLoader />}>
              <AdminApp />
            </Suspense>
          </RequireAuth>
        }
      />
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="hidden-gems" element={<HiddenGems />} />
        <Route path="places/:slug" element={<PlaceDetail />} />
        <Route path="districts" element={<Districts />} />
        <Route path="districts/:slug" element={<DistrictDetail />} />
        <Route path="food" element={<Food />} />
        <Route path="food/dishes/:slug" element={<DishDetail />} />
        <Route path="listings/:slug" element={<BusinessDetail />} />
        <Route path="shopping" element={<BusinessSection section="shopping" />} />
        <Route path="theatres" element={<BusinessSection section="theatres" />} />
        <Route path="activities" element={<BusinessSection section="activities" />} />
        <Route path="stays" element={<Stays />} />
        <Route path="stays/:slug" element={<StayDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:slug" element={<EventDetail />} />
        <Route path="near-me" element={<NearMe />} />
        <Route path="directions" element={<Directions />} />
        <Route path="trip-builder" element={<TripBuilder />} />
        <Route path="trips/shared/:slug" element={<SharedTrip />} />
        <Route path="trips/:id" element={<RequireAuth><TripView /></RequireAuth>} />
        <Route path="saved" element={<Saved />} />
        <Route path="lists/shared/:slug" element={<SharedList />} />
        <Route path="lists/:id" element={<RequireAuth><ListDetail /></RequireAuth>} />
        <Route path="help" element={<Help />} />
        <Route path="search" element={<Search />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
