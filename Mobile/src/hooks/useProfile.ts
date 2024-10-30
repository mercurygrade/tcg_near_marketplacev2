import { addParamToUrl, request } from "../api/useApi";
import { urls } from "../utils";
import { useAppContext } from "../provider/Appprovider";

export default function useProfile() {
  const { user, setUser } = useAppContext();
  const getProfileInfo = async () => {
    try {
      const { data } = await request.get(
        addParamToUrl(urls.app.profile.url, { id: user.uid })
      );
      if (!data) return;
      setUser((user) => ({ ...user, ...data.user }));
    } catch (error) {
      console.error(error);
    }
  };
  return { getProfileInfo };
}
