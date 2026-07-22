import { useParams } from "react-router-dom";
import AdminUserDetail from "~/components/admin/user-detail";

const AccountDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return <AdminUserDetail accountId={id} />;
};

export default AccountDetailPage;
