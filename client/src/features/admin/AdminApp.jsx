import { Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { ResourceList, ResourceEdit } from './ResourcePages';
import { Overview, Reports, Moderation, Trending, UsersPage, Analytics, AiKnowledge } from './DashboardPages';
import { RequireAuth } from '../../routes/AppRoutes';
import NotFound from '../../pages/NotFound';

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="r/:resource" element={<ResourceList />} />
        <Route path="r/:resource/:id" element={<ResourceEdit />} />
        <Route path="trending" element={<Trending />} />
        <Route path="reports" element={<Reports />} />
        <Route path="moderation" element={<Moderation />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai" element={<AiKnowledge />} />
        <Route path="users" element={<RequireAuth roles={['admin']}><UsersPage /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
